import { CONFIG } from '../config.js';
import {
  HOME_DEMO_PHYSICS_SEED,
  HOME_DEMO_SCRIPT,
  createDemoRoleColors,
  createSeededRandom,
  rotateChainRoleColors
} from './HomeDemoScript.js';
import { buildHomeDemoBaseline } from './HomeDemoBaseline.js';

const STYLE_ID = 'home-demo-shared-gameplay-styles';
const STABLE_TICKS_BEFORE_NEXT_LOOP = 6;

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
    simulation,
    onResetWorld
  }) {
    ensureStyles();

    this.container = container;
    this.fruitManager = fruitManager;
    this.grid = grid;
    this.simulation = simulation;
    this.onResetWorld = onResetWorld;

    this.running = false;
    this.roleColors = createDemoRoleColors();
    this.spawnIndex = 0;
    this.activeSpec = null;
    this.configuredFruit = null;
    this.configuredAt = 0;
    this.awaitingCascade = false;
    this.cascadeClears = 0;
    this.cascadeComplete = false;
    this.postCascadeStableTicks = 0;

    this.comboChip = document.createElement('div');
    this.comboChip.className = 'home-demo-combo';
    this.container.appendChild(this.comboChip);
  }

  show() {
    this.running = true;
    this.roleColors = createDemoRoleColors();
    this.spawnIndex = 0;
    this.activeSpec = null;
    this.configuredFruit = null;
    this.awaitingCascade = false;
    this.cascadeClears = 0;
    this.cascadeComplete = false;
    this.postCascadeStableTicks = 0;

    this.container.classList.add('home-demo-active');

    this.fruitManager.setSpawnProvider(
      () => this.provideSpawn()
    );
    this.simulation.setRandom(
      createSeededRandom(HOME_DEMO_PHYSICS_SEED)
    );

    const baseline = buildHomeDemoBaseline(this.roleColors);
    this.onResetWorld?.(baseline);
  }

  hide() {
    this.running = false;
    this.activeSpec = null;
    this.configuredFruit = null;
    this.awaitingCascade = false;
    this.cascadeComplete = false;

    this.fruitManager.setSpawnProvider(null);
    this.simulation.setRandom(Math.random);

    this.container.classList.remove('home-demo-active');
    this.comboChip.getAnimations().forEach(
      (animation) => animation.cancel()
    );
    this.comboChip.style.opacity = '0';
  }

  isRunning() {
    return this.running;
  }

  provideSpawn() {
    if (!this.running || this.awaitingCascade) {
      return null;
    }

    if (this.spawnIndex >= HOME_DEMO_SCRIPT.length) {
      this.awaitingCascade = true;
      return null;
    }

    const spec = HOME_DEMO_SCRIPT[this.spawnIndex++];
    this.activeSpec = spec;

    if (this.spawnIndex >= HOME_DEMO_SCRIPT.length) {
      this.awaitingCascade = true;
      this.cascadeClears = 0;
    }

    return {
      templateId: spec.templateId,
      color: this.roleColors[spec.role],
      centerX: spec.centerX
    };
  }

  update(time) {
    if (!this.running) return;

    const fruit = this.fruitManager.current;

    if (fruit && fruit !== this.configuredFruit) {
      this.configuredFruit = fruit;
      this.configuredAt = time;

      fruit.fallStepMs = Math.max(
        1,
        CONFIG.FRUIT_FALL_STEP_MS / 2
      );

      if (this.activeSpec) {
        this.fruitManager.setPointerX(
          this.activeSpec.centerX
        );
      }
    }

    if (
      fruit &&
      fruit === this.configuredFruit &&
      fruit.state === 'CONTROL' &&
      this.activeSpec
    ) {
      const elapsed = time - this.configuredAt;
      const sway = Math.sin(elapsed * 0.011) * 1.6;

      this.fruitManager.setPointerX(
        this.activeSpec.centerX + sway
      );

      if (elapsed >= this.activeSpec.holdMs) {
        this.fruitManager.releaseCurrent();
      }
    }

    if (!fruit && this.configuredFruit) {
      this.configuredFruit = null;
      this.activeSpec = null;
    }

    if (this.cascadeComplete && !fruit) {
      if (this.simulation.movedCount === 0) {
        this.postCascadeStableTicks += 1;
      } else {
        this.postCascadeStableTicks = 0;
      }

      if (
        this.postCascadeStableTicks >=
        STABLE_TICKS_BEFORE_NEXT_LOOP
      ) {
        this.beginNextLoop();
      }
    }
  }

  beginNextLoop() {
    this.roleColors = rotateChainRoleColors(
      this.roleColors
    );

    this.spawnIndex = 0;
    this.activeSpec = null;
    this.configuredFruit = null;
    this.awaitingCascade = false;
    this.cascadeClears = 0;
    this.cascadeComplete = false;
    this.postCascadeStableTicks = 0;

    this.simulation.setRandom(
      createSeededRandom(HOME_DEMO_PHYSICS_SEED)
    );
  }

  cleanupChainResidue() {
    const chainColors = new Set([
      this.roleColors.A,
      this.roleColors.B,
      this.roleColors.C
    ]);

    let removed = 0;

    for (
      let index = 0;
      index < this.grid.cells.length;
      index++
    ) {
      if (!chainColors.has(this.grid.cells[index])) {
        continue;
      }

      const x = index % this.grid.width;
      const y = Math.floor(index / this.grid.width);

      this.grid.set(x, y, 0);
      removed += 1;
    }

    return removed;
  }

  onClear(payload) {
    if (!this.running) return;

    if (this.awaitingCascade) {
      const clearedGroups = Math.max(
        1,
        payload?.groups?.length ?? 1
      );
      this.cascadeClears += clearedGroups;

      if (this.cascadeClears >= 3) {
        this.cleanupChainResidue();
        this.cascadeComplete = true;
        this.postCascadeStableTicks = 0;
      }
    }

    const combo =
      this.awaitingCascade
        ? Math.min(3, Math.max(1, this.cascadeClears))
        : (payload?.combo ?? 1);

    this.comboChip.textContent =
      combo >= 3
        ? 'COMBO ×3'
        : combo === 2
          ? 'COMBO ×2'
          : '连通消除！';

    this.comboChip.getAnimations().forEach(
      (animation) => animation.cancel()
    );

    this.comboChip.animate(
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
        duration: 950,
        easing: 'ease-out'
      }
    );
  }
}
