import { SandGrid } from '../SandGrid.js';
import { SandSimulation } from '../SandSimulation.js';
import { SandRenderer } from '../SandRenderer.js';
import { ConnectivityClear } from '../ConnectivityClear.js';
import { FruitPiece } from '../fruit/FruitPiece.js';
import { FruitTemplate } from '../fruit/FruitTemplate.js';
import { APPLE_TEMPLATE } from '../fruit/templates/apple.js';
import { BANANA_TEMPLATE } from '../fruit/templates/banana.js';
import { CONFIG } from '../config.js';

const DEMO_STYLE_ID = 'dream-sand-home-demo-styles';
const TARGET_COLOR = 4;
const DEMO_FALL_SPEED_MULTIPLIER = 2;
const NEXT_BLOCK_DELAY_MS = 230;
const CLEAR_DURATION_MS = 900;
const NEXT_LOOP_DELAY_MS = 420;

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
      inset: 0;
      width: 100%;
      height: 100%;
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
      top: 78%;
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
      top: 68%;
      transform: translate(-50%, 8px) scale(.94);
      opacity: 0;
      padding: 7px 13px;
      border: 1px solid rgba(255,255,255,.62);
      border-radius: 999px;
      color: #4e765f;
      background: rgba(255,255,255,.86);
      box-shadow: 0 8px 22px rgba(82,65,44,.10);
      backdrop-filter: blur(8px);
      font: 900 11px/1 system-ui, sans-serif;
      letter-spacing: .06em;
      pointer-events: none;
    }
  `;

  document.head.appendChild(style);
}

export class HomeDemoController {
  constructor(container) {
    ensureStyles();

    this.container = container;
    this.grid = new SandGrid();
    this.simulation = new SandSimulation(this.grid);
    this.renderer = new SandRenderer(this.grid);
    this.connectivity = new ConnectivityClear(this.grid, this.simulation);

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

    // The first nine blocks deliberately build two separate green banks and
    // leave a clean center gap. The tenth wide banana lands in that gap and
    // completes the left-to-right connection.
    //
    // All ten blocks use the same target color. Once that component clears,
    // every particle added during the demo is gone. The colorful base below
    // never participates in the clear, so the board naturally returns to the
    // exact visual state it had before block #1 — no snapshot restore.
    this.sequence = [
      { template: this.apple,  centerX: 16,  holdMs: 115 },
      { template: this.apple,  centerX: 31,  holdMs: 100 },
      { template: this.banana, centerX: 48,  holdMs: 105 },
      { template: this.apple,  centerX: 61,  holdMs: 100 },

      { template: this.apple,  centerX: 119, holdMs: 100 },
      { template: this.banana, centerX: 134, holdMs: 105 },
      { template: this.apple,  centerX: 150, holdMs: 100 },
      { template: this.apple,  centerX: 164, holdMs: 105 },
      { template: this.banana, centerX: 172, holdMs: 110 },

      { template: this.banana, centerX: 90,  holdMs: 145 }
    ];

    this.opened = true;
    this.current = null;
    this.sequenceIndex = 0;
    this.spawnAt = 0;
    this.spawnedAt = 0;
    this.released = false;
    this.lastTime = performance.now();
    this.lastPhysics = 0;
    this.phase = 'dropping';
    this.finalSettledAt = 0;
    this.clearStartedAt = 0;
    this.postClearStableTicks = 0;
    this.nextLoopAt = 0;
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
    this.simulation.reset();
    this.connectivity.reset();
    this.seedStableBase();

    this.current = null;
    this.sequenceIndex = 0;
    this.spawnAt = performance.now() + 380;
    this.spawnedAt = 0;
    this.released = false;
    this.lastPhysics = 0;
    this.phase = 'dropping';
    this.finalSettledAt = 0;
    this.clearStartedAt = 0;
    this.postClearStableTicks = 0;
    this.nextLoopAt = 0;
    this.baselineHash = this.hashGrid();

    this.renderer.update(null);
  }

  seedStableBase() {
    const width = this.grid.width;
    const height = this.grid.height;
    const baseTop = 268;

    // The base is completely filled below a flat surface, so waking it during
    // impacts cannot make it slide or collapse. TARGET_COLOR is intentionally
    // excluded, keeping demo-added green sand isolated from the permanent art.
    const baseColors = [1, 3, 6, 7, 2];

    for (let y = baseTop; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const waveA = Math.floor(
          2.4 * Math.sin(x * 0.075 + y * 0.035)
        );
        const waveB = Math.floor(
          1.8 * Math.sin(x * 0.031 - y * 0.052 + 1.7)
        );
        const band = Math.floor((y - baseTop + waveA + waveB) / 10);
        const segment = Math.floor((x + band * 13) / 30);
        const color =
          baseColors[
            ((segment + band * 2) % baseColors.length + baseColors.length) %
              baseColors.length
          ];

        this.grid.set(x, y, color);
      }
    }
  }

  hashGrid() {
    let hash = 2166136261 >>> 0;

    for (let i = 0; i < this.grid.cells.length; i++) {
      hash ^= this.grid.cells[i] + (i & 255);
      hash = Math.imul(hash, 16777619) >>> 0;
    }

    return hash;
  }

  beginNextLoop(time) {
    // Do not restore or rewrite any particle here. The whole point of the demo
    // loop is that progressive clearing has already returned the board to the
    // original base through normal physics.
    this.current = null;
    this.sequenceIndex = 0;
    this.spawnAt = time + NEXT_LOOP_DELAY_MS;
    this.spawnedAt = 0;
    this.released = false;
    this.phase = 'dropping';
    this.finalSettledAt = 0;
    this.clearStartedAt = 0;
    this.postClearStableTicks = 0;
    this.nextLoopAt = 0;

    // Reset only simulation bookkeeping; SandGrid itself is untouched.
    this.simulation.reset();
    this.connectivity.reset();
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

    this.current = new FruitPiece({
      template: descriptor.template,
      color: TARGET_COLOR,
      grid: this.grid,
      simulation: this.simulation
    });

    // Home demo only: exactly 2x the normal game fall speed.
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
      const sway = Math.sin(elapsed * 0.012) * 3;

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
        this.phase = 'waiting-for-bridge';
        this.finalSettledAt = time;
      }
    }
  }

  findSpanningTarget() {
    this.connectivity.visited.fill(0);

    for (let y = 0; y < this.grid.height; y++) {
      if (this.grid.get(0, y) !== TARGET_COLOR) continue;

      const startIndex = this.grid.index(0, y);
      if (this.connectivity.visited[startIndex]) continue;

      const component =
        this.connectivity.collectComponent(0, y, TARGET_COLOR);

      if (component.reachesRight) {
        return component;
      }
    }

    return null;
  }

  startProgressiveClear(time) {
    this.phase = 'clearing';
    this.clearStartedAt = time;
    this.playClearCue();
  }

  clearTargetBehindWave(waveX, forceAll = false) {
    let minX = this.grid.width;
    let maxX = -1;
    let maxY = -1;
    let removed = 0;

    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        if (this.grid.get(x, y) !== TARGET_COLOR) continue;
        if (!forceAll && x > waveX) continue;

        this.grid.set(x, y, 0);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        removed++;
      }
    }

    if (removed > 0) {
      this.simulation.activateRect(
        Math.max(0, minX - 4),
        0,
        Math.min(this.grid.width - 1, maxX + 5),
        Math.min(this.grid.height - 1, maxY + 8)
      );
    }

    return removed;
  }

  updateProgressiveClear(time) {
    const elapsed = time - this.clearStartedAt;
    const progress = Math.min(1, elapsed / CLEAR_DURATION_MS);
    const eased = 1 - Math.pow(1 - progress, 2.15);
    const waveX = Math.floor(
      -8 + eased * (this.grid.width + 16)
    );

    this.clearTargetBehindWave(waveX, progress >= 1);

    if (time - this.lastPhysics >= CONFIG.UPDATE_INTERVAL) {
      this.simulation.update();
      this.lastPhysics = time;
    }

    if (progress < 1) return;

    // One final pass catches green grains that moved behind the sweep during
    // the clear. No baseline particles are touched.
    this.clearTargetBehindWave(this.grid.width, true);

    this.phase = 'post-clear-settle';
    this.postClearStableTicks = 0;
    this.nextLoopAt = time + 260;
  }

  updatePhysics(time) {
    if (this.phase === 'clearing') {
      this.updateProgressiveClear(time);
      return;
    }

    if (time - this.lastPhysics < CONFIG.UPDATE_INTERVAL) return;

    this.simulation.update();
    this.lastPhysics = time;

    if (this.phase === 'waiting-for-bridge') {
      const component = this.findSpanningTarget();

      if (component) {
        this.startProgressiveClear(time);
        return;
      }

      // The last banana is intentionally wide and the banks are positioned to
      // overlap it. Give cellular sand a short moment to settle before checking
      // again; unlike the previous version, no hidden cells are injected.
      if (time - this.finalSettledAt > 1300) {
        // Safety: keep physics alive rather than freezing the homepage. The
        // next checks normally find the span as the final grains finish sliding.
        this.simulation.activateRect(
          0,
          210,
          this.grid.width - 1,
          this.grid.height - 1
        );
      }

      return;
    }

    if (this.phase === 'post-clear-settle') {
      if (this.simulation.movedCount === 0) {
        this.postClearStableTicks += 1;
      } else {
        this.postClearStableTicks = 0;
      }

      const noTargetLeft = !this.grid.cells.includes(TARGET_COLOR);
      const naturallyBackAtStart =
        noTargetLeft && this.hashGrid() === this.baselineHash;

      if (
        naturallyBackAtStart &&
        this.postClearStableTicks >= 2 &&
        time >= this.nextLoopAt
      ) {
        this.beginNextLoop(time);
      }
    }
  }

  playClearCue() {
    this.sweep.getAnimations().forEach((animation) => animation.cancel());
    this.clearLabel.getAnimations().forEach((animation) => animation.cancel());

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
          offset: .2
        },
        {
          opacity: 1,
          transform: 'translate(-50%, 0) scale(1)',
          offset: .66
        },
        {
          opacity: 0,
          transform: 'translate(-50%, -7px) scale(.98)'
        }
      ],
      {
        duration: 1050,
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
