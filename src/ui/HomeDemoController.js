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
const RESCUE_SETTLE_WAIT_MS = 420;
const FINAL_DROP_VALLEY_SEARCH_RADIUS = 42;
const CHAIN_ROLES = Object.freeze(['A', 'B', 'C']);
const TEMPLATE_WIDTHS = Object.freeze({
  apple: 35,
  banana: 46
});

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
    this.clearedChainRoles = new Set();
    this.rescueSpec = null;
    this.rescueCount = 0;
    this.rescueStableSince = 0;

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
    this.clearedChainRoles.clear();
    this.rescueSpec = null;
    this.rescueCount = 0;
    this.rescueStableSince = 0;

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
    this.clearedChainRoles.clear();
    this.rescueSpec = null;
    this.rescueStableSince = 0;

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
    if (!this.running) {
      return null;
    }

    if (this.rescueSpec) {
      const spec = this.rescueSpec;
      this.rescueSpec = null;
      this.activeSpec = spec;
      this.rescueStableSince = 0;

      return {
        templateId: spec.templateId,
        color: this.roleColors[spec.role],
        centerX: spec.centerX
      };
    }

    if (this.awaitingCascade) {
      return null;
    }

    if (this.spawnIndex >= HOME_DEMO_SCRIPT.length) {
      this.awaitingCascade = true;
      return null;
    }

    const rawSpec = HOME_DEMO_SCRIPT[this.spawnIndex++];
    const isFinalScriptDrop =
      this.spawnIndex >= HOME_DEMO_SCRIPT.length;

    const spec = isFinalScriptDrop
      ? {
          ...rawSpec,
          centerX: this.chooseValleyCenter(
            rawSpec.centerX,
            TEMPLATE_WIDTHS[rawSpec.templateId] ?? 35,
            FINAL_DROP_VALLEY_SEARCH_RADIUS
          ),
          sway: 0.8
        }
      : rawSpec;

    this.activeSpec = spec;

    if (isFinalScriptDrop) {
      this.awaitingCascade = true;
      this.cascadeClears = 0;
      this.clearedChainRoles.clear();
      this.rescueStableSince = 0;
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
      const swayAmplitude =
        Number.isFinite(this.activeSpec.sway)
          ? this.activeSpec.sway
          : 1.6;
      const sway =
        Math.sin(elapsed * 0.011) * swayAmplitude;

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

    if (
      this.awaitingCascade &&
      !this.cascadeComplete &&
      !fruit &&
      !this.rescueSpec
    ) {
      if (this.isBoardFullySettled()) {
        if (!this.rescueStableSince) {
          this.rescueStableSince = time;
        } else if (
          time - this.rescueStableSince >=
          RESCUE_SETTLE_WAIT_MS
        ) {
          this.queueBridgeRescue();
        }
      } else {
        this.rescueStableSince = 0;
      }
    } else if (!this.cascadeComplete) {
      this.rescueStableSince = 0;
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

  isBoardFullySettled() {
    const currentRegionEmpty =
      !this.simulation.currentRegion ||
      this.simulation.currentRegion.isEmpty();
    const nextRegionEmpty =
      !this.simulation.nextRegion ||
      this.simulation.nextRegion.isEmpty();

    return (
      this.simulation.movedCount === 0 &&
      !this.simulation.fullUpdate &&
      currentRegionEmpty &&
      nextRegionEmpty
    );
  }

  getSurfaceY(x) {
    const clampedX = Math.max(
      0,
      Math.min(this.grid.width - 1, Math.round(x))
    );

    for (let y = 0; y < this.grid.height; y++) {
      if (this.grid.get(clampedX, y) > 0) {
        return y;
      }
    }

    return this.grid.height;
  }

  chooseValleyCenter(
    preferredX,
    templateWidth,
    searchRadius = 36
  ) {
    const halfWidth = templateWidth / 2;
    const minCenter = halfWidth;
    const maxCenter = this.grid.width - halfWidth;
    const preferred = Math.max(
      minCenter,
      Math.min(maxCenter, preferredX)
    );
    const minX = Math.max(
      minCenter,
      preferred - searchRadius
    );
    const maxX = Math.min(
      maxCenter,
      preferred + searchRadius
    );

    let bestX = preferred;
    let bestScore = -Infinity;

    for (
      let centerX = Math.ceil(minX);
      centerX <= Math.floor(maxX);
      centerX += 2
    ) {
      const offsets = [
        -templateWidth * 0.28,
        -templateWidth * 0.14,
        0,
        templateWidth * 0.14,
        templateWidth * 0.28
      ];

      let surfaceSum = 0;

      for (const offset of offsets) {
        surfaceSum += this.getSurfaceY(centerX + offset);
      }

      const averageSurface =
        surfaceSum / offsets.length;
      const centerSurface =
        this.getSurfaceY(centerX);

      // Larger Y means a lower/deeper surface. Weight the exact landing
      // point heavily so a wide fruit does not choose a sharp hill tip just
      // because both sides of that tip happen to be deep.
      const score =
        centerSurface * 0.68 +
        averageSurface * 0.32 -
        Math.abs(centerX - preferred) * 0.035;

      if (score > bestScore) {
        bestScore = score;
        bestX = centerX;
      }
    }

    return Math.round(bestX);
  }

  chooseBridgeCenter(
    color,
    preferredX,
    templateWidth
  ) {
    const width = this.grid.width;
    const halfWidth = Math.ceil(templateWidth / 2);
    const hasColor = new Uint8Array(width);
    let coloredColumns = 0;

    for (
      let index = 0;
      index < this.grid.cells.length;
      index++
    ) {
      if (this.grid.cells[index] !== color) {
        continue;
      }

      const x = index % width;

      if (!hasColor[x]) {
        hasColor[x] = 1;
        coloredColumns += 1;
      }
    }

    if (coloredColumns === 0) {
      return this.chooseValleyCenter(
        preferredX,
        templateWidth,
        56
      );
    }

    // First guarantee that this color actually owns both board edges.
    // Keeping the rescue fruit flush with the wall prevents a steep hill
    // from splitting every grain away from the edge.
    if (!hasColor[0]) {
      return halfWidth;
    }

    if (!hasColor[width - 1]) {
      return width - halfWidth;
    }

    let bestStart = -1;
    let bestEnd = -1;
    let runStart = -1;

    for (let x = 1; x < width - 1; x++) {
      if (!hasColor[x] && runStart < 0) {
        runStart = x;
      }

      const runEnded =
        runStart >= 0 &&
        (hasColor[x] || x === width - 2);

      if (!runEnded) continue;

      const runEnd =
        hasColor[x] ? x - 1 : x;
      const runLength = runEnd - runStart + 1;
      const bestLength =
        bestStart < 0
          ? -1
          : bestEnd - bestStart + 1;

      if (runLength > bestLength) {
        bestStart = runStart;
        bestEnd = runEnd;
      }

      runStart = -1;
    }

    if (bestStart >= 0) {
      const gapCenter = (bestStart + bestEnd) / 2;
      const gapRadius = Math.min(
        28,
        Math.max(10, (bestEnd - bestStart + 1) / 2)
      );

      return this.chooseValleyCenter(
        gapCenter,
        templateWidth,
        gapRadius
      );
    }

    return this.chooseValleyCenter(
      preferredX,
      templateWidth,
      56
    );
  }

  queueBridgeRescue() {
    const targetRole = CHAIN_ROLES.find(
      (role) => !this.clearedChainRoles.has(role)
    );

    if (!targetRole) {
      this.cascadeComplete = true;
      this.postCascadeStableTicks = 0;
      return;
    }

    const templateId =
      this.rescueCount % 2 === 0
        ? 'banana'
        : 'apple';
    const templateWidth =
      TEMPLATE_WIDTHS[templateId];
    const color = this.roleColors[targetRole];

    this.rescueSpec = {
      role: targetRole,
      templateId,
      centerX: this.chooseBridgeCenter(
        color,
        this.grid.width / 2,
        templateWidth
      ),
      holdMs: 78,
      sway: 0,
      rescue: true
    };

    this.rescueCount += 1;
    this.rescueStableSince = 0;
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
    this.clearedChainRoles.clear();
    this.rescueSpec = null;
    this.rescueCount = 0;
    this.rescueStableSince = 0;

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
      let gainedChainRole = false;

      for (const group of payload?.groups ?? []) {
        for (const role of CHAIN_ROLES) {
          if (group.color !== this.roleColors[role]) {
            continue;
          }

          const sizeBefore =
            this.clearedChainRoles.size;
          this.clearedChainRoles.add(role);

          if (
            this.clearedChainRoles.size >
            sizeBefore
          ) {
            gainedChainRole = true;
          }
        }
      }

      this.cascadeClears =
        this.clearedChainRoles.size;

      if (gainedChainRole) {
        this.rescueSpec = null;
        this.rescueStableSince = 0;
      }

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
