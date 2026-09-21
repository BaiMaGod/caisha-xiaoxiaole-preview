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

    this.root.append(
      this.renderer.canvas,
      this.ambient,
      this.sweep,
      this.clearLabel
    );
    this.container.appendChild(this.root);

    this.sequence = [
      { template: this.banana, color: 3, center: 0.24, holdMs: 420 },
      { template: this.apple, color: 6, center: 0.73, holdMs: 360 },
      { template: this.apple, color: 4, center: 0.50, holdMs: 520 }
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
    this.cycleResetAt = 0;
    this.guaranteedBridgeUsed = false;
    this.raf = null;

    this.clearSystem.onClear = () => {
      this.playClearCue();
      this.cycleResetAt = performance.now() + 1450;
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

    this.current = null;
    this.sequenceIndex = 0;
    this.spawnAt = performance.now() + 650;
    this.spawnedAt = 0;
    this.released = false;
    this.settleMs = 0;
    this.lastPhysics = 0;
    this.cycleResetAt = 0;
    this.guaranteedBridgeUsed = false;

    this.renderer.update(null);
  }

  seedBoard() {
    const width = this.grid.width;
    const height = this.grid.height;
    const terrainColors = [1, 3, 6, 7, 2];

    for (let x = 0; x < width; x++) {
      const surface =
        262 +
        Math.round(Math.sin(x * 0.085) * 5) +
        Math.round(Math.sin(x * 0.031 + 1.4) * 4);

      for (let y = Math.max(262, surface); y < height; y++) {
        const segment = Math.floor(x / 24);
        const band = Math.floor((y - 258) / 15);
        const color = terrainColors[(segment + band * 2) % terrainColors.length];
        this.grid.set(x, y, color);
      }
    }

    // Two stable green banks leave a center gap. The final green fruit falls
    // into that gap and completes a real left-to-right connected component.
    for (let y = 255; y <= 261; y++) {
      for (let x = 0; x <= 74; x++) {
        this.grid.set(x, y, 4);
      }
      for (let x = 105; x < width; x++) {
        this.grid.set(x, y, 4);
      }
    }

    // Add a few small color pockets so the board looks like a real mid-game
    // state instead of a flat scripted platform.
    this.paintPocket(18, 235, 28, 19, 7);
    this.paintPocket(124, 239, 31, 17, 6);
    this.paintPocket(57, 244, 24, 13, 3);
    this.paintPocket(97, 247, 20, 10, 1);

    this.simulation.activateRect(0, 228, width - 1, height - 1);
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
    if (this.current || this.sequenceIndex >= this.sequence.length) return;

    const descriptor = this.sequence[this.sequenceIndex];
    this.current = new FruitPiece({
      template: descriptor.template,
      color: descriptor.color,
      grid: this.grid,
      simulation: this.simulation
    });

    this.current.setCenterX(
      Math.round(this.grid.width * descriptor.center)
    );

    this.spawnedAt = time;
    this.released = false;
    this.settleMs = 0;
  }

  updateCurrent(deltaMs, time) {
    if (!this.current) return;

    const descriptor = this.sequence[this.sequenceIndex];

    if (this.current.state === 'CONTROL') {
      const elapsed = time - this.spawnedAt;
      const sway = Math.sin(elapsed * 0.006) * 7;
      const target =
        this.grid.width * descriptor.center + sway;

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
      this.spawnAt = time + 520;
      this.settleMs = 0;
    }
  }

  updatePhysics(time, deltaMs) {
    if (time - this.lastPhysics < CONFIG.UPDATE_INTERVAL) return;

    this.simulation.update();
    this.lastPhysics = time;

    if (this.current) {
      this.settleMs = 0;
      return;
    }

    this.settleMs += deltaMs;

    if (this.sequenceIndex < this.sequence.length) {
      return;
    }

    // Let the final fruit settle naturally first.
    if (this.settleMs < 520) return;

    let cleared = this.clearSystem.resolve();

    // The demo must always teach the rule. If the randomly settling grains did
    // not quite touch both green banks, finish only the tiny hidden bridge at
    // the top of the prepared gap, then run the real connectivity clear.
    if (cleared === 0 && !this.guaranteedBridgeUsed && this.settleMs >= 900) {
      this.guaranteedBridgeUsed = true;

      for (let x = 72; x <= 108; x++) {
        for (let y = 252; y <= 259; y++) {
          if (this.grid.empty(x, y)) {
            this.grid.set(x, y, 4);
          }
        }
      }

      this.simulation.activateRect(68, 246, 112, 264);
      cleared = this.clearSystem.resolve();
    }

    if (cleared === 0 && this.settleMs >= 1900) {
      this.cycleResetAt = time + 700;
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
        { opacity: 1, transform: 'translate(-50%, 0) scale(1)', offset: .24 },
        { opacity: 1, transform: 'translate(-50%, 0) scale(1)', offset: .68 },
        { opacity: 0, transform: 'translate(-50%, -7px) scale(.98)' }
      ],
      {
        duration: 1050,
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

    if (this.cycleResetAt && time >= this.cycleResetAt) {
      this.resetDemo();
      return;
    }

    if (!this.current && this.sequenceIndex < this.sequence.length && time >= this.spawnAt) {
      this.spawnNext(time);
    }

    this.updateCurrent(deltaMs, time);
    this.updatePhysics(time, deltaMs);
    this.renderer.update(this.current);
  }
}
