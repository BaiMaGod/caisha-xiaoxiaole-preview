import { CONFIG } from '../config.js';
import {
  HOME_DEMO_SCRIPT,
  createDemoRoleColors
} from './HomeDemoScript.js';

const STYLE_ID = 'home-demo-shared-gameplay-styles';

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .home-demo-combo {
      position: absolute;
      left: 50%;
      top: 66%;
      z-index: 26;
      transform: translate(-50%, 8px) scale(.94);
      opacity: 0;
      pointer-events: none;
      padding: 7px 13px;
      border-radius: 999px;
      color: #4e765f;
      background: rgba(255,255,255,.88);
      border: 1px solid rgba(255,255,255,.64);
      box-shadow: 0 8px 22px rgba(82,65,44,.10);
      backdrop-filter: blur(8px);
      font: 900 11px/1 system-ui, sans-serif;
      letter-spacing: .05em;
    }
  `;
  document.head.appendChild(style);
}

export class HomeDemoController {
  constructor({
    container,
    fruitManager,
    grid,
    onResetWorld
  }) {
    ensureStyles();

    this.container = container;
    this.fruitManager = fruitManager;
    this.grid = grid;
    this.onResetWorld = onResetWorld;

    this.running = false;
    this.scriptIndex = 0;
    this.completedDrops = 0;
    this.roleColors = createDemoRoleColors();
    this.configuredFruit = null;
    this.configuredAt = 0;
    this.lastFruit = null;
    this.lastSafetyCheck = 0;

    this.comboChip = document.createElement('div');
    this.comboChip.className = 'home-demo-combo';
    this.container.appendChild(this.comboChip);
  }

  show() {
    this.running = true;
    this.scriptIndex = 0;
    this.completedDrops = 0;
    this.roleColors = createDemoRoleColors();
    this.configuredFruit = null;
    this.lastFruit = null;
    this.container.classList.add('home-demo-active');
    this.onResetWorld?.();
  }

  hide() {
    this.running = false;
    this.configuredFruit = null;
    this.lastFruit = null;
    this.container.classList.remove('home-demo-active');
    this.comboChip.getAnimations().forEach((a) => a.cancel());
    this.comboChip.style.opacity = '0';
  }

  isRunning() {
    return this.running;
  }

  update(time) {
    if (!this.running) return;

    const fruit = this.fruitManager.current;

    if (this.lastFruit && !fruit) {
      this.completedDrops += 1;
      if (this.completedDrops % HOME_DEMO_SCRIPT.length === 0) {
        this.roleColors = createDemoRoleColors();
      }
    }

    this.lastFruit = fruit;

    if (fruit && fruit !== this.configuredFruit) {
      this.configureFruit(fruit, time);
    }

    if (fruit?.state === 'CONTROL' && fruit === this.configuredFruit) {
      const spec = HOME_DEMO_SCRIPT[
        (this.scriptIndex - 1 + HOME_DEMO_SCRIPT.length) %
          HOME_DEMO_SCRIPT.length
      ];

      const elapsed = time - this.configuredAt;
      const sway = Math.sin(elapsed * 0.011) * 2.2;
      const centerX = (spec.x * this.grid.width) + sway;
      this.fruitManager.setPointerX(centerX);

      if (elapsed >= spec.holdMs) {
        this.fruitManager.releaseCurrent();
      }
    }

    if (time - this.lastSafetyCheck >= 450) {
      this.lastSafetyCheck = time;

      if (this.isNearDeathLine() && !this.fruitManager.current) {
        this.scriptIndex = 0;
        this.completedDrops = 0;
        this.roleColors = createDemoRoleColors();
        this.configuredFruit = null;
        this.lastFruit = null;
        this.onResetWorld?.();
      }
    }
  }

  configureFruit(fruit, time) {
    const spec = HOME_DEMO_SCRIPT[
      this.scriptIndex % HOME_DEMO_SCRIPT.length
    ];

    this.scriptIndex += 1;
    this.configuredFruit = fruit;
    this.configuredAt = time;

    fruit.color = this.roleColors[spec.role];
    fruit.fallStepMs = Math.max(
      1,
      CONFIG.FRUIT_FALL_STEP_MS / 2
    );

    this.fruitManager.setPointerX(spec.x * this.grid.width);
  }

  isNearDeathLine() {
    const maxY = Math.min(
      this.grid.height - 1,
      CONFIG.DEATH_LINE_Y + 20
    );

    for (let y = 0; y <= maxY; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        if (this.grid.get(x, y) > 0) return true;
      }
    }

    return false;
  }

  onClear(payload) {
    if (!this.running) return;

    const combo = payload?.combo ?? 1;
    this.comboChip.textContent =
      combo >= 3
        ? 'COMBO ×3'
        : combo === 2
          ? 'COMBO ×2'
          : '连通消除！';

    this.comboChip.getAnimations().forEach((a) => a.cancel());
    this.comboChip.animate(
      [
        {
          opacity: 0,
          transform: 'translate(-50%, 8px) scale(.94)'
        },
        {
          opacity: 1,
          transform: 'translate(-50%, 0) scale(1)',
          offset: .22
        },
        {
          opacity: 1,
          transform:
            combo >= 3
              ? 'translate(-50%, 0) scale(1.08)'
              : 'translate(-50%, 0) scale(1)',
          offset: .68
        },
        {
          opacity: 0,
          transform: 'translate(-50%, -6px) scale(.98)'
        }
      ],
      {
        duration: 900,
        easing: 'ease-out'
      }
    );
  }
}
