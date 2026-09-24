import { SandGrid } from '../SandGrid.js';
import { SandRenderer } from '../SandRenderer.js';
import { ConnectivityClear } from '../ConnectivityClear.js';
import { FruitPiece } from '../fruit/FruitPiece.js';
import { FruitTemplate } from '../fruit/FruitTemplate.js';
import { APPLE_TEMPLATE } from '../fruit/templates/apple.js';
import { BANANA_TEMPLATE } from '../fruit/templates/banana.js';
import { CONFIG } from '../config.js';
import {
  HOME_DEMO_LAYOUT,
  HomeDemoSimulation,
  createHomeDemoMechanism,
  createHomeDemoPalette,
  createSeededRandom,
  findSpanningComponent,
  gridHash,
  roleColorMap,
  seedHomeDemoPermanentBase
} from './HomeDemoMechanism.js';

const DEMO_STYLE_ID = 'dream-sand-home-demo-styles';
const DEMO_FALL_SPEED_MULTIPLIER = 2;
const NEXT_BLOCK_DELAY_MS = 220;
const CLEAR_DURATION_MS = 820;
const NEXT_LOOP_DELAY_MS = 430;
const STABLE_TICKS_REQUIRED = 3;

function ensureStyles() {
  if (document.getElementById(DEMO_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = DEMO_STYLE_ID;
  style.textContent = `
    .home-demo {
      position: absolute;
      inset: 0;
      z-index: 24;
      overflow: hidden;
      background: #fff8ea;
      pointer-events: none;
    }

    .home-demo__canvas {
      position: absolute;
      left: 50%;
      top: 50%;
      width: min(100%, 405px, 56.25dvh);
      aspect-ratio: 9 / 16;
      transform: translate(-50%, -50%);
      display: block;
      image-rendering: auto;
    }

    .home-demo__ambient {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at 18% 14%, rgba(255,255,255,.42), transparent 28%),
        radial-gradient(circle at 82% 24%, rgba(255,218,147,.16), transparent 32%);
      mix-blend-mode: screen;
    }

    .home-demo__sweep {
      position: absolute;
      left: -34%;
      top: 77%;
      width: 34%;
      height: 7px;
      opacity: 0;
      border-radius: 999px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(125,238,191,.18),
        rgba(255,245,167,.96),
        rgba(125,238,191,.68),
        transparent
      );
      box-shadow: 0 0 15px rgba(116,225,184,.58);
      pointer-events: none;
    }

    .home-demo__clear-label {
      position: absolute;
      left: 50%;
      top: 66%;
      transform: translate(-50%, 8px) scale(.94);
      opacity: 0;
      padding: 7px 13px;
      border: 1px solid rgba(255,255,255,.62);
      border-radius: 999px;
      color: #4e765f;
      background: rgba(255,255,255,.88);
      box-shadow: 0 8px 22px rgba(82,65,44,.10);
      backdrop-filter: blur(8px);
      font: 950 12px/1 system-ui, sans-serif;
      letter-spacing: .06em;
      pointer-events: none;
    }
  `;

  document.head.appendChild(style);
}

function orderTargets(cells) {
  return [...cells].sort((a, b) => {
    if (a.y !== b.y) return b.y - a.y;

    const ah = ((a.x * 73856093) ^ (a.y * 19349663)) >>> 0;
    const bh = ((b.x * 73856093) ^ (b.y * 19349663)) >>> 0;
    return ah - bh;
  });
}

class DemoBlueprintPiece extends FruitPiece {
  constructor({
    template,
    color,
    grid,
    simulation,
    targetCells,
    onDeposit
  }) {
    super({ template, color, grid, simulation });

    this.targetCells = orderTargets(targetCells);
    this.targetWritten = 0;
    this.onDeposit = onDeposit;
  }

  dissolveToProgress(progress) {
    // First keep the game's real crumble behavior: grains appear exactly
    // where the fruit hits, fall under CA gravity and visibly build the pile.
    super.dissolveToProgress(progress);

    // The demo scaffold is filled in the same color underneath the visible
    // pile. It stabilizes the three-key mechanism, but no longer replaces
    // the actual impact sand.
    const targetCount = Math.min(
      this.targetCells.length,
      Math.ceil(this.targetCells.length * progress)
    );

    let wroteAny = false;
    let minX = this.grid.width;
    let minY = this.grid.height;
    let maxX = -1;
    let maxY = -1;

    while (this.targetWritten < targetCount) {
      const cell = this.targetCells[this.targetWritten];
      this.targetWritten += 1;

      if (!this.grid.empty(cell.x, cell.y)) continue;

      this.grid.set(cell.x, cell.y, this.color);
      this.onDeposit?.(cell);
      wroteAny = true;
      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
    }

    if (wroteAny) {
      this.simulation.activateRect(
        minX - 2,
        minY - 2,
        maxX + 2,
        maxY + 2
      );
    }
  }
}

export class HomeDemoController {
  constructor(container) {
    ensureStyles();

    this.container = container;
    this.grid = new SandGrid();
    this.simulation = new HomeDemoSimulation(this.grid);
    this.renderer = new SandRenderer(this.grid);
    this.connectivity = new ConnectivityClear(this.grid, this.simulation);
    this.mechanism = createHomeDemoMechanism();

    this.apple = new FruitTemplate(APPLE_TEMPLATE);
    this.banana = new FruitTemplate(BANANA_TEMPLATE);

    this.root = document.createElement('div');
    this.root.className = 'home-demo';
    this.root.setAttribute('aria-hidden', 'true');

    this.renderer.canvas.className = 'home-demo__canvas';

    this.ambient = document.createElement('div');
    this.ambient.className = 'home-demo__ambient';

    this.sweep = document.createElement('div');
    this.sweep.className = 'home-demo__sweep';

    this.clearLabel = document.createElement('div');
    this.clearLabel.className = 'home-demo__clear-label';
    this.clearLabel.textContent = '同色贯通 · 消除！';

    this.root.append(
      this.renderer.canvas,
      this.ambient,
      this.sweep,
      this.clearLabel
    );
    this.container.appendChild(this.root);

    this.opened = true;
    this.current = null;
    this.sequence = [];
    this.sequenceIndex = 0;
    this.spawnAt = 0;
    this.spawnedAt = 0;
    this.released = false;
    this.lastTime = performance.now();
    this.lastPhysics = 0;
    this.phase = 'idle';
    this.stableTicks = 0;
    this.keyDropStartedAt = 0;
    this.keyWakeAttempts = 0;
    this.clearRole = null;
    this.clearCells = [];
    this.clearCursor = 0;
    this.clearStartedAt = 0;
    this.nextLoopAt = 0;
    this.loopIndex = 0;
    this.roleColors = null;
    this.chainColors = null;
    this.baseColors = null;
    this.baselineHash = 0;
    this.raf = null;

    this.resetDemo();

    this.animate = this.animate.bind(this);
    this.raf = requestAnimationFrame(this.animate);
  }

  show() {
    this.opened = true;
    this.root.style.display = 'block';
    this.lastTime = performance.now();
    this.resetDemo();

    if (!this.raf) {
      this.raf = requestAnimationFrame(this.animate);
    }
  }

  hide() {
    this.opened = false;
    this.root.style.display = 'none';

    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }

    this.sweep.getAnimations().forEach((animation) => animation.cancel());
    this.clearLabel.getAnimations().forEach((animation) => animation.cancel());
  }

  resetDemo() {
    this.grid.clear();
    this.simulation.clearLocks();
    this.simulation.reset();
    this.connectivity.reset();

    const palette = createHomeDemoPalette();
    this.chainColors = palette.chainColors;
    this.baseColors = palette.baseColors;

    seedHomeDemoPermanentBase(
      this.grid,
      this.simulation,
      this.baseColors
    );

    this.baselineHash = gridHash(this.grid);
    this.loopIndex = 0;
    this.beginNextLoop(performance.now(), true);
    this.renderer.update(null);
  }

  beginNextLoop(time, firstLoop = false) {
    this.loopIndex += 1;
    this.roleColors = roleColorMap(this.chainColors);

    this.simulation.reset();
    this.simulation.setRandom(
      createSeededRandom(0x51a7cafe)
    );
    this.connectivity.reset();

    this.sequence = [
      ...this.mechanism.buildSteps,
      this.mechanism.finalKeyStep
    ];

    this.current = null;
    this.sequenceIndex = 0;
    this.spawnAt = time + (firstLoop ? 420 : NEXT_LOOP_DELAY_MS);
    this.spawnedAt = 0;
    this.released = false;
    this.phase = 'dropping';
    this.stableTicks = 0;
    this.keyDropStartedAt = 0;
    this.keyWakeAttempts = 0;
    this.clearRole = null;
    this.clearCells = [];
    this.clearCursor = 0;
    this.clearStartedAt = 0;
    this.nextLoopAt = 0;
  }

  templateForStep(index) {
    return index % 2 === 0 ? this.apple : this.banana;
  }

  spawnNext(time) {
    if (
      this.phase !== 'dropping' ||
      this.current ||
      this.sequenceIndex >= this.sequence.length
    ) {
      return;
    }

    const descriptor = this.sequence[this.sequenceIndex];

    this.current = new DemoBlueprintPiece({
      template: this.templateForStep(this.sequenceIndex),
      color: this.roleColors[descriptor.role],
      grid: this.grid,
      simulation: this.simulation,
      targetCells: descriptor.cells,
      onDeposit: (cell) => {
        this.simulation.lockCell(cell.x, cell.y);
      }
    });

    this.current.fallStepMs = Math.max(
      1,
      CONFIG.FRUIT_FALL_STEP_MS / DEMO_FALL_SPEED_MULTIPLIER
    );

    this.current.setCenterX(descriptor.centerX);
    this.spawnedAt = time;
    this.released = false;
  }

  updateCurrent(deltaMs, time) {
    if (!this.current || this.phase !== 'dropping') return;

    const descriptor = this.sequence[this.sequenceIndex];

    if (this.current.state === 'CONTROL') {
      const elapsed = time - this.spawnedAt;
      const sway =
        descriptor.kind === 'trigger'
          ? Math.sin(elapsed * 0.01) * 1.5
          : Math.sin(elapsed * 0.012) * 3;

      this.current.setCenterX(
        Math.round(descriptor.centerX + sway)
      );

      if (!this.released && elapsed >= descriptor.holdMs) {
        this.current.release();
        this.released = true;
      }
    }

    const settled = this.current.update(deltaMs);

    if (settled || this.current.state === 'SAND') {
      this.current = null;
      this.sequenceIndex += 1;

      if (this.sequenceIndex < this.sequence.length) {
        this.spawnAt = time + NEXT_BLOCK_DELAY_MS;
      } else {
        this.phase = 'wait-a';
        this.stableTicks = 0;
      }
    }
  }

  startRoleClear(role, component, time) {
    this.phase = 'clearing';
    this.clearRole = role;
    this.clearStartedAt = time;
    this.clearCursor = 0;

    const roleColor = this.roleColors[role];
    const allRoleCells = [];

    for (let index = 0; index < this.grid.cells.length; index++) {
      if (this.grid.cells[index] === roleColor) {
        allRoleCells.push(index);
      }
    }

    this.clearCells = allRoleCells.sort((ia, ib) => {
      const ax = ia % this.grid.width;
      const bx = ib % this.grid.width;

      if (ax !== bx) return ax - bx;
      return ia - ib;
    });

    this.playClearCue(role);
  }

  removeClearCellsThrough(waveX, forceAll = false) {
    let removed = 0;
    let minX = this.grid.width;
    let minY = this.grid.height;
    let maxX = -1;
    let maxY = -1;

    while (this.clearCursor < this.clearCells.length) {
      const index = this.clearCells[this.clearCursor];
      const x = index % this.grid.width;
      const y = Math.floor(index / this.grid.width);

      if (!forceAll && x > waveX) break;

      this.clearCursor += 1;

      if (this.grid.cells[index] === 0) {
        this.simulation.unlockIndex(index);
        continue;
      }

      this.grid.set(x, y, 0);
      this.simulation.unlockIndex(index);
      removed += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    if (removed > 0) {
      this.simulation.activateRect(
        minX - 3,
        minY - 3,
        maxX + 3,
        maxY + 5
      );
    }
  }

  updateProgressiveClear(time) {
    const elapsed = time - this.clearStartedAt;
    const progress = Math.min(1, elapsed / CLEAR_DURATION_MS);
    const eased = 1 - Math.pow(1 - progress, 2.1);
    const waveX = Math.floor(
      -6 + eased * (this.grid.width + 12)
    );

    this.removeClearCellsThrough(waveX, progress >= 1);

    if (time - this.lastPhysics >= CONFIG.UPDATE_INTERVAL) {
      this.simulation.update();
      this.lastPhysics = time;
    }

    if (progress < 1) return;

    this.removeClearCellsThrough(this.grid.width, true);

    const finishedRole = this.clearRole;
    this.clearRole = null;
    this.clearCells = [];
    this.clearCursor = 0;

    if (finishedRole === 'A') {
      this.releaseKey('B', time);
      return;
    }

    if (finishedRole === 'B') {
      this.releaseKey('C', time);
      return;
    }

    this.phase = 'post-chain';
    this.stableTicks = 0;
    this.nextLoopAt = time + 300;
  }

  releaseKey(role, time) {
    const cells = this.mechanism.keyCells[role];

    this.simulation.unlockCells(cells);

    const shaft =
      role === 'B'
        ? HOME_DEMO_LAYOUT.B_SHAFT
        : HOME_DEMO_LAYOUT.C_SHAFT;

    this.simulation.activateRect(
      shaft.x1 - 4,
      this.mechanism.keyCells[role][0]?.y - 4 ?? shaft.y1 - 30,
      shaft.x2 + 4,
      shaft.y2 + 5
    );

    this.phase = role === 'B' ? 'drop-b-key' : 'drop-c-key';
    this.stableTicks = 0;
    this.keyDropStartedAt = time;
    this.keyWakeAttempts = 0;
  }

  roleForKeyPhase() {
    if (this.phase === 'drop-b-key') return 'B';
    if (this.phase === 'drop-c-key') return 'C';
    return null;
  }

  updateKeyDrop(time) {
    const role = this.roleForKeyPhase();
    if (!role) return;

    if (this.simulation.movedCount === 0) {
      this.stableTicks += 1;
    } else {
      this.stableTicks = 0;
    }

    if (this.stableTicks < STABLE_TICKS_REQUIRED) return;

    const component = findSpanningComponent(
      this.connectivity,
      this.roleColors[role]
    );

    if (component) {
      this.startRoleClear(role, component, time);
      return;
    }

    // A real sand key can occasionally settle one cell short because of
    // friction. Wake the same shaft again; no grains are injected or moved
    // artificially.
    if (this.keyWakeAttempts < 4) {
      this.keyWakeAttempts += 1;
      this.stableTicks = 0;

      const shaft =
        role === 'B'
          ? HOME_DEMO_LAYOUT.B_SHAFT
          : HOME_DEMO_LAYOUT.C_SHAFT;

      this.simulation.activateRect(
        shaft.x1 - 3,
        shaft.y1 - 50,
        shaft.x2 + 3,
        shaft.y2 + 4
      );
    }
  }

  hasAnyChainColor() {
    const colors = new Set([
      this.roleColors.A,
      this.roleColors.B,
      this.roleColors.C
    ]);

    for (const value of this.grid.cells) {
      if (colors.has(value)) return true;
    }

    return false;
  }

  updatePhysics(time) {
    if (this.phase === 'clearing') {
      this.updateProgressiveClear(time);
      return;
    }

    if (time - this.lastPhysics < CONFIG.UPDATE_INTERVAL) return;

    this.simulation.update();
    this.lastPhysics = time;

    if (this.phase === 'wait-a') {
      const component = findSpanningComponent(
        this.connectivity,
        this.roleColors.A
      );

      if (component) {
        this.startRoleClear('A', component, time);
      }

      return;
    }

    if (
      this.phase === 'drop-b-key' ||
      this.phase === 'drop-c-key'
    ) {
      this.updateKeyDrop(time);
      return;
    }

    if (this.phase === 'post-chain') {
      if (this.simulation.movedCount === 0) {
        this.stableTicks += 1;
      } else {
        this.stableTicks = 0;
      }

      if (
        this.stableTicks >= STABLE_TICKS_REQUIRED &&
        time >= this.nextLoopAt &&
        !this.hasAnyChainColor() &&
        gridHash(this.grid) === this.baselineHash
      ) {
        this.beginNextLoop(time);
      }
    }
  }

  playClearCue(role) {
    this.sweep.getAnimations().forEach((animation) => animation.cancel());
    this.clearLabel.getAnimations().forEach((animation) => animation.cancel());

    if (role === 'A') {
      this.clearLabel.textContent = '连通消除！';
    } else if (role === 'B') {
      this.clearLabel.textContent = 'COMBO ×2';
    } else {
      this.clearLabel.textContent = 'COMBO ×3';
    }

    this.sweep.animate(
      [
        { transform: 'translateX(0)', opacity: 0 },
        { transform: 'translateX(125%)', opacity: .95, offset: .16 },
        { transform: 'translateX(410%)', opacity: 0 }
      ],
      {
        duration: CLEAR_DURATION_MS,
        easing: 'cubic-bezier(.2,.75,.2,1)'
      }
    );

    this.clearLabel.animate(
      [
        {
          opacity: 0,
          transform: 'translate(-50%, 8px) scale(.94)'
        },
        {
          opacity: 1,
          transform: 'translate(-50%, 0) scale(1)',
          offset: .18
        },
        {
          opacity: 1,
          transform:
            role === 'C'
              ? 'translate(-50%, 0) scale(1.08)'
              : 'translate(-50%, 0) scale(1)',
          offset: .68
        },
        {
          opacity: 0,
          transform: 'translate(-50%, -7px) scale(.98)'
        }
      ],
      {
        duration: 1000,
        easing: 'ease-out'
      }
    );
  }

  animate(time) {
    this.raf = null;

    if (!this.opened) {
      this.lastTime = time;
      return;
    }

    const deltaMs = Math.min(
      50,
      Math.max(0, time - this.lastTime)
    );
    this.lastTime = time;

    if (
      this.phase === 'dropping' &&
      !this.current &&
      this.sequenceIndex < this.sequence.length &&
      time >= this.spawnAt
    ) {
      this.spawnNext(time);
    }

    this.updateCurrent(deltaMs, time);
    this.updatePhysics(time);
    this.renderer.update(this.current);

    if (this.opened) {
      this.raf = requestAnimationFrame(this.animate);
    }
  }
}
