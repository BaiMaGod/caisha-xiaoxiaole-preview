import { CONFIG } from '../config.js';
import { SandGrid } from '../SandGrid.js';
import { SandSimulation } from '../SandSimulation.js';
import { ConnectivityClear } from '../ConnectivityClear.js';
import { GameRules } from '../GameRules.js';
import { SettlementGate } from '../SettlementGate.js';
import { FruitManager } from '../fruit/FruitManager.js';
import { PlayerProgress } from '../progress/PlayerProgress.js';
import { UnlockManager } from '../progress/UnlockManager.js';
import { getClearRating } from '../ClearRating.js';
import { HomeDemoController } from '../ui/HomeDemoController.js';

// Game rules and progression live here. The host only supplies storage and
// presentation callbacks; no browser or mini-game API enters this module.
export class GameSession {
  constructor({ storage = null, onBeforeClear, onClear, onGameOver } = {}) {
    this.grid = new SandGrid();
    this.simulation = new SandSimulation(this.grid);
    this.clearSystem = new ConnectivityClear(this.grid, this.simulation);
    this.rules = new GameRules(this.grid);
    this.settlementGate = new SettlementGate(3);
    this.progress = new PlayerProgress(storage);
    this.unlockManager = new UnlockManager(this.progress, {
      debugUnlockAll: false
    });
    this.unlockManager.checkAll();
    this.fruitManager = new FruitManager(this.grid, this.simulation, {
      getScore: () => this.clearSystem.score
    });

    this.mode = 'home';
    this.dropCount = 0;
    this.lastFruitState = this.fruitManager.current?.state ?? null;
    this.simulationElapsed = 0;
    this.onBeforeClear = onBeforeClear;
    this.onClear = onClear;
    this.onGameOver = onGameOver;

    this.homeDemo = new HomeDemoController({
      container: null,
      fruitManager: this.fruitManager,
      grid: this.grid,
      simulation: this.simulation,
      onResetWorld: (baseline) => this.resetHomeDemoWorld(baseline)
    });

    this.clearSystem.onBeforeClear = (payload) => {
      this.onBeforeClear?.(payload);
    };
    this.clearSystem.onClear = (payload) => {
      if (this.mode === 'home') {
        this.homeDemo.onClear(payload);
        this.onClear?.({ ...payload, rating: getClearRating(payload.cleared), demo: true });
        return;
      }
      this.progress.recordClear(payload);
      this.unlockManager.checkAll();
      this.onClear?.({ ...payload, rating: getClearRating(payload.cleared) });
    };
    this.homeDemo.show();
  }

  resetHomeDemoWorld(baseline) {
    this.grid.clear();
    this.grid.cells.set(baseline);
    this.grid.revision += 1;
    this.simulation.reset();
    this.clearSystem.reset();
    this.rules.reset();
    this.settlementGate.reset();
    this.fruitManager.reset();
    this.lastFruitState = this.fruitManager.current?.state ?? null;
    this.simulationElapsed = 0;
  }

  start() {
    this.homeDemo.hide();
    this.grid.clear();
    this.simulation.reset();
    this.clearSystem.reset();
    this.rules.reset();
    this.settlementGate.reset();
    this.fruitManager.reset();
    this.fruitManager.setEnabled(true);
    this.mode = 'playing';
    this.dropCount = 0;
    this.lastFruitState = this.fruitManager.current?.state ?? null;
    this.simulationElapsed = 0;
  }

  goHome() {
    this.mode = 'home';
    this.homeDemo.show();
  }

  setPointerX(gridX) {
    if (this.mode === 'playing') this.fruitManager.setPointerX(gridX);
  }

  releaseFruit() {
    if (this.mode !== 'playing') return false;
    const released = this.fruitManager.releaseCurrent();
    if (released) this.dropCount += 1;
    return released;
  }

  startFastDrop() {
    if (this.mode !== 'playing') return { active: false, released: false };
    const result = this.fruitManager.startFastDrop();
    if (result.released) this.dropCount += 1;
    return result;
  }

  update(deltaMs, time = 0) {
    const demoActive = this.mode === 'home' && this.homeDemo.isRunning();
    if (this.mode !== 'playing' && !demoActive) return;
    const dt = Math.max(0, Math.min(50, Number(deltaMs) || 0));
    const previousFruitState = this.lastFruitState;
    if (demoActive) this.homeDemo.update(time);
    this.fruitManager.update(dt);
    const fruitState = this.fruitManager.current?.state ?? null;

    if (fruitState !== previousFruitState && fruitState === 'FALLING') {
      this.clearSystem.resetCombo();
    }
    if (previousFruitState === 'BREAKING' && fruitState === null) {
      this.settlementGate.begin();
    }
    this.lastFruitState = fruitState;

    if (!demoActive && this.rules.checkDeathLine()) {
      this.end();
      return;
    }

    this.simulationElapsed += dt;
    if (this.simulationElapsed < CONFIG.UPDATE_INTERVAL) return;
    this.simulationElapsed = 0;

    this.simulation.update(() => {
      if (!demoActive && this.rules.checkDeathLine()) {
        this.end();
        return false;
      }
      return true;
    });
    if (this.mode !== 'playing' && !demoActive) return;

    if (this.settlementGate.isBlocking()) {
      const settled = this.settlementGate.observe(this.simulation.movedCount);
      if (settled && fruitState !== 'IMPACT' && fruitState !== 'BREAKING') {
        const cleared = this.clearSystem.resolve({
          maxGroups: demoActive ? 1 : Infinity
        });
        if (cleared > 0) this.settlementGate.begin();
      }
    }
  }

  end() {
    if (this.mode !== 'playing') return;
    this.mode = 'over';
    this.fruitManager.setEnabled(false);
    const score = this.clearSystem.score;
    this.progress.recordGameOver(score);
    this.unlockManager.checkAll();
    this.onGameOver?.({ score, rating: getClearRating(score) });
  }
}
