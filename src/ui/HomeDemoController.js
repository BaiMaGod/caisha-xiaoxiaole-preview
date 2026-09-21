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
const DEMO_FALL_SPEED_MULTIPLIER = 2;
const NEXT_BLOCK_DELAY_MS = 240;
const LOOP_RESTORE_DELAY_MS = 860;

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
      left: -38%;
      top: 79%;
      width: 36%;
      height: 8px;
      opacity: 0;
      border-radius: 999px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(125,238,191,.18),
        rgba(255,245,167,.95),
        rgba(125,238,191,.62),
        transparent
      );
      filter: blur(.2px);
      box-shadow: 0 0 14px rgba(116,225,184,.52);
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
      background: rgba(255,255,255,.84);
      box-shadow: 0 8px 22px rgba(82,65,44,.10);
      backdrop-filter: blur(8px);
      font: 900 11px/1 system-ui, sans-serif;
      letter-spacing: .06em;
      pointer-events: none;
    }

    .home-demo__loop-mask {
      position: absolute;
      inset: 0;
      opacity: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at 50% 74%, rgba(255,247,212,.92), transparent 45%),
        rgba(255,248,234,.52);
      mix-blend-mode: screen;
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
    this.clearSystem = new ConnectivityClear(this.grid, this.simulation);

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

    this.loopMask = document.createElement('div');
    this.loopMask.className = 'home-demo__loop-mask';

    this.root.append(
      this.renderer.canvas,
      this.ambient,
      this.sweep,
      this.clearLabel,
      this.loopMask
    );
    this.container.appendChild(this.root);

    // A deterministic 10-block loop. The first 9 build a varied, believable
    // sand pile; the 10th green block is the teaching moment that completes
    // the prepared left-to-right connection.
    this.sequence = [
      { template: this.apple,  color: 1, center: 0.18, holdMs: 170 },
      { template: this.banana, color: 3, center: 0.77, holdMs: 150 },
      { template: this.apple,  color: 6, center: 0.36, holdMs: 165 },
      { template: this.banana, color: 7, center: 0.62, holdMs: 145 },
      { template: this.apple,  color: 2, center: 0.84, holdMs: 170 },
      { template: this.banana, color: 1, center: 0.25, holdMs: 145 },
      { template: this.apple,  color: 6, center: 0.69, holdMs: 160 },
      { template: this.banana, color: 3, center: 0.46, holdMs: 150 },
      { template: this.apple,  color: 4, center: 0.38, holdMs: 175 },
      { template: this.apple,  color: 4, center: 0.56, holdMs: 190 }
    ];

    this.opened = true;
    this.current = null;
    this.sequenceIndex = 0;
    this.spawnAt = 0;
    this.spawnedAt = 0;
    this.released = false;
    this.settleMs = 0;
    this.lastTime = performance.now();
    this.lastPhysics = 0;
    this.phase = 'dropping';
    this.restoreAt = 0;
    this.bridgeInjected = false;
    this.initialCells = null;
    this.raf = null;

    this.clearSystem.onClear = () => {
      if (this.phase === 'clearing') return;

      this.phase = 'clearing';
      this.playClearCue();
      this.restoreAt = performance.now() + LOOP_RESTORE_DELAY_MS;
    };

    this.resetDemo();
    this.animate = this.animate.bind(this);
    this.raf = requestAnimationFrame(this.animate);
  }

  show() {
    this.opened = true;
    this.root.style.display = 'block';
    this.resetDemo();
  }

  hide() {
    this.opened = false;
    this.root.style.display = 'none';
  }

  resetDemo() {
    this.grid.clear();
    this.simulation.reset();
    this.clearSystem.reset();
    this.seedBoard();

    this.initialCells = this.grid.cells.slice();

    this.current = null;
    this.sequenceIndex = 0;
    this.spawnAt = performance.now() + 420;
    this.spawnedAt = 0;
    this.released = false;
    this.settleMs = 0;
    this.lastPhysics = 0;
    this.phase = 'dropping';
    this.restoreAt = 0;
    this.bridgeInjected = false;

    this.renderer.update(null);
  }

  restoreLoopStart(time) {
    if (!this.initialCells) {
      this.resetDemo();
      return;
    }

    this.grid.cells.set(this.initialCells);
    this.simulation.reset();
    this.clearSystem.reset();

    this.current = null;
    this.sequenceIndex = 0;
    this.spawnAt = time + 360;
    this.spawnedAt = 0;
    this.released = false;
    this.settleMs = 0;
    this.lastPhysics = time;
    this.phase = 'dropping';
    this.restoreAt = 0;
    this.bridgeInjected = false;

    this.renderer.update(null);
    this.playLoopResetMask();
  }

  seedBoard() {
    const width = this.grid.width;
    const height = this.grid.height;
    const terrainColors = [1, 3, 6, 7, 2];

    for (let x = 0; x < width; x++) {
      const surface =
        267 +
        Math.round(Math.sin(x * 0.085) * 5) +
        Math.round(Math.sin(x * 0.031 + 1.4) * 4);

      for (let y = Math.max(267, surface); y < height; y++) {
        const segment = Math.floor(x / 24);
        const band = Math.floor((y - 263) / 15);
        const color = terrainColors[(segment + band * 2) % terrainColors.length];
        this.grid.set(x, y, color);
      }
    }

    // Two green banks intentionally stop short of the middle. The 10th drop
    // visually lands in this area; after it settles we only fill any tiny
    // remaining gaps and let ConnectivityClear perform the real clear.
    for (let y = 258; y <= 264; y++) {
      for (let x = 0; x <= 69; x++) {
        this.grid.set(x, y, 4);
      }

      for (let x = 112; x < width; x++) {
        this.grid.set(x, y, 4);
      }
    }

    this.paintPocket(18, 242, 26, 16, 7);
    this.paintPocket(127, 244, 29, 15, 6);
    this.paintPocket(56, 250, 21, 11, 3);
    this.paintPocket(97, 251, 18, 9, 1);

    this.simulation.activateRect(0, 232, width - 1, height - 1);
  }

  paintPocket(cx, cy, rx, ry, color) {
    for (let y = cy - ry; y <= cy + ry; y++) {
      for (let x = cx - rx; x <= cx + rx; x++) {
        const dx = (x - cx) / Math.max(1, rx);
        const dy = (y - cy) / Math.max(1, ry);

        if (dx * dx + dy * dy > 1) continue;

        if (this.grid.empty(x, y)) {
          this.grid.set(x, y, color);
        }
      }
    }
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
      color: descriptor.color,
      grid: this.grid,
      simulation: this.simulation
    });

    // Home demo only: fall exactly 2x faster than normal gameplay.
    this.current.fallStepMs = Math.max(
      1,
      CONFIG.FRUIT_FALL_STEP_MS / DEMO_FALL_SPEED_MULTIPLIER
    );

    this.current.setCenterX(
      Math.round(this.grid.width * descriptor.center)
    );

    this.spawnedAt = time;
    this.released = false;
    this.settleMs = 0;
  }

  updateCurrent(deltaMs, time) {
    if (!this.current || this.phase !== 'dropping') return;

    const descriptor = this.sequence[this.sequenceIndex];

    if (this.current.state === 'CONTROL') {
      const elapsed = time - this.spawnedAt;
      const sway = Math.sin(elapsed * 0.009) * 5;
      const target = this.grid.width * descriptor.center + sway;

      this.current.setCenterX(Math.round(target));

      if (!this.released && elapsed >= descriptor.holdMs) {
        this.current.release();
        this.released = true;
      }
    }

    const settled = this.current.update(deltaMs);

    if (settled || this.current.state === 'SAND') {
      this.current = null;
      this.sequenceIndex += 1;
      this.spawnAt = time + NEXT_BLOCK_DELAY_MS;
      this.settleMs = 0;

      if (this.sequenceIndex >= this.sequence.length) {
        this.phase = 'settling';
      }
    }
  }

  updatePhysics(time, deltaMs) {
    if (this.phase === 'clearing') return;
    if (time - this.lastPhysics < CONFIG.UPDATE_INTERVAL) return;

    this.simulation.update();
    this.lastPhysics = time;

    if (this.current) {
      this.settleMs = 0;
      return;
    }

    if (this.phase === 'dropping') return;

    this.settleMs += deltaMs;

    if (this.phase !== 'settling') return;

    // Give the 10th block time to fully turn into sand and settle.
    if (this.settleMs < 520) return;

    let cleared = this.clearSystem.resolve();

    if (cleared > 0) {
      return;
    }

    // Guarantee the teaching beat only after all 10 blocks have dropped.
    // The visible 10th green block does most of the work; this closes only
    // remaining microscopic gaps caused by cellular-automata randomness.
    if (!this.bridgeInjected && this.settleMs >= 760) {
      this.bridgeInjected = true;

      for (let x = 66; x <= 115; x++) {
        for (let y = 254; y <= 262; y++) {
          if (this.grid.empty(x, y)) {
            this.grid.set(x, y, 4);
          }
        }
      }

      this.simulation.activateRect(62, 248, 119, 268);
      cleared = this.clearSystem.resolve();

      if (cleared > 0) {
        return;
      }
    }

    // Absolute safety net: never let the homepage demo stall.
    if (this.settleMs >= 1450) {
      this.restoreLoopStart(time);
    }
  }

  playClearCue() {
    this.sweep.getAnimations().forEach((animation) => animation.cancel());
    this.clearLabel.getAnimations().forEach((animation) => animation.cancel());

    this.sweep.animate(
      [
        { transform: 'translateX(0)', opacity: 0 },
        { transform: 'translateX(125%)', opacity: .95, offset: .18 },
        { transform: 'translateX(410%)', opacity: 0 }
      ],
      {
        duration: 760,
        easing: 'cubic-bezier(.2,.75,.2,1)'
      }
    );

    this.clearLabel.animate(
      [
        { opacity: 0, transform: 'translate(-50%, 8px) scale(.94)' },
        { opacity: 1, transform: 'translate(-50%, 0) scale(1)', offset: .22 },
        { opacity: 1, transform: 'translate(-50%, 0) scale(1)', offset: .66 },
        { opacity: 0, transform: 'translate(-50%, -7px) scale(.98)' }
      ],
      {
        duration: 1050,
        easing: 'ease-out'
      }
    );
  }

  playLoopResetMask() {
    this.loopMask.getAnimations().forEach((animation) => animation.cancel());

    this.loopMask.animate(
      [
        { opacity: .68 },
        { opacity: .22, offset: .42 },
        { opacity: 0 }
      ],
      {
        duration: 260,
        easing: 'ease-out'
      }
    );
  }

  animate(time) {
    this.raf = requestAnimationFrame(this.animate);

    if (!this.opened) {
      this.lastTime = time;
      return;
    }

    const deltaMs = Math.min(50, Math.max(0, time - this.lastTime));
    this.lastTime = time;

    if (
      this.phase === 'clearing' &&
      this.restoreAt > 0 &&
      time >= this.restoreAt
    ) {
      this.restoreLoopStart(time);
      return;
    }

    if (
      this.phase === 'dropping' &&
      !this.current &&
      this.sequenceIndex < this.sequence.length &&
      time >= this.spawnAt
    ) {
      this.spawnNext(time);
    }

    this.updateCurrent(deltaMs, time);
    this.updatePhysics(time, deltaMs);
    this.renderer.update(this.current);
  }
}
