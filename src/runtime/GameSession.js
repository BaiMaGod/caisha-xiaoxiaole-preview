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
import { GAME_MODES, MODE_SETTINGS, ModeProgress, countSand } from '../modes/ModeLogic.js';
import { SandArtTools } from '../modes/SandArtTools.js';
import { getPrototypeLevel } from '../modes/Levels.js';

// Game rules and progression live here. The host only supplies storage and
// presentation callbacks; no browser or mini-game API enters this module.
export class GameSession {
  constructor({ storage = null, onBeforeClear, onClear, onGameOver, onArtComplete, onLevelComplete } = {}) {
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

    this.art = new SandArtTools(this.grid, this.simulation);
    this.modeProgress = new ModeProgress(storage);
    this.playMode = GAME_MODES.ENDLESS;
    this.level = 1;
    this.levelData = null;
    this.onArtComplete = onArtComplete;
    this.onLevelComplete = onLevelComplete;
    this.levelVictoryPending = false;
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
      if (this.playMode === GAME_MODES.ENDLESS) {
        this.progress.recordClear(payload);
        this.unlockManager.checkAll();
      }
      this.onClear?.({ ...payload, rating: getClearRating(payload.cleared) });
      if (this.playMode === GAME_MODES.LEVEL && countSand(this.grid) === 0) {
        this.levelVictoryPending = true;
      }
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

  start(playMode = GAME_MODES.ENDLESS, level = 1) {
    if (!MODE_SETTINGS[playMode]) throw new Error('Unknown game mode');
    this.homeDemo.hide();
    this.playMode = playMode;
    this.level = level;
    this.levelData = null;
    this.levelVictoryPending = false;
    this.art.stop();
    this.art.fixed.fill(0);
    this.grid.clear();
    this.fruitManager.setSpawnProvider(null);
    this.clearSystem.reset();
    this.rules.reset();
    this.settlementGate.reset();

    if (playMode === GAME_MODES.ART) {
      this.art.reset();
      this.fruitManager.setEnabled(false);
      this.fruitManager.current = null;
    } else if (playMode === GAME_MODES.LEVEL) {
      this.levelData = getPrototypeLevel(level);
      this.grid.cells.set(this.levelData.cells);
      this.grid.revision++;
      let first = true;
      const guide = this.levelData.guide;
      this.fruitManager.setSpawnProvider(() => {
        if (first) {
          first = false;
          return { templateId: guide.templateId,
            color: guide.color, centerX: guide.centerX };
        }
        return { color: guide.color };
      });
      this.fruitManager.reset();
    } else {
      this.fruitManager.reset();
    }
    this.simulation.reset();
    this.mode = 'playing';
    this.dropCount = 0;
    this.lastFruitState = this.fruitManager.current?.state ?? null;
    this.simulationElapsed = 0;
  }

  setArtTool(tool) {
    if (this.mode !== 'playing' || this.playMode !== GAME_MODES.ART) return false;
    if (this.fruitManager.current && !['CONTROL', 'SAND'].includes(this.fruitManager.current.state)) return false;
    this.art.setTool(tool);
    if (this.art.tool === 'shape') {
      this.fruitManager.setSpawnProvider(() => ({ color: this.art.color }));
      this.fruitManager.reset();
    } else {
      this.fruitManager.setEnabled(false);
      this.fruitManager.current = null;
    }
    return true;
  }

  setArtColor(color) {
    this.art.setColor(color);
    if (this.playMode === GAME_MODES.ART &&
        this.fruitManager.current?.state === 'CONTROL') {
      this.fruitManager.current.color = this.art.color;
    }
  }

  finishArt() {
    if (this.mode !== 'playing' || this.playMode !== GAME_MODES.ART) return;
    this.mode = 'over';
    this.art.stop();
    this.fruitManager.setEnabled(false);
    const work = this.modeProgress.saveArtwork(this.grid, this.art.fixed, true);
    this.onArtComplete?.({ artwork: work });
  }

  completeLevel() {
    if (this.mode !== 'playing' || this.playMode !== GAME_MODES.LEVEL) return;
    this.mode = 'over';
    this.fruitManager.setEnabled(false);
    this.levelVictoryPending = false;
    const stars = this.modeProgress.winLevel(
      this.level, this.dropCount, this.levelData?.referenceDrops || 1);
    this.onLevelComplete?.({ level: this.level, stars, drops: this.dropCount });
  }

  goHome() {
    this.art.stop();
    this.art.fixed.fill(0);
    this.fruitManager.setSpawnProvider(null);
    this.mode = 'home';
    this.homeDemo.show();
  }

  setPointerX(gridX) {
    if (this.mode === 'playing' &&
      (this.playMode !== GAME_MODES.ART || this.art.tool === 'shape'))
      this.fruitManager.setPointerX(gridX);
  }

  releaseFruit() {
    if (this.mode !== 'playing' ||
      (this.playMode === GAME_MODES.ART && this.art.tool !== 'shape')) return false;
    const released = this.fruitManager.releaseCurrent();
    if (released) this.dropCount += 1;
    return released;
  }

  startFastDrop() {
    if (this.mode !== 'playing' ||
      (this.playMode === GAME_MODES.ART && this.art.tool !== 'shape'))
      return { active: false, released: false };
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

    if (!demoActive && this.playMode !== GAME_MODES.ART && this.rules.checkDeathLine()) {
      this.end();
      return;
    }

    if (!demoActive && this.playMode === GAME_MODES.ART) this.art.update(dt);
    this.simulationElapsed += dt;
    if (this.simulationElapsed < CONFIG.UPDATE_INTERVAL) return;
    this.simulationElapsed = 0;

    this.simulation.update(() => {
      if (!demoActive && this.playMode !== GAME_MODES.ART && this.rules.checkDeathLine()) {
        this.end();
        return false;
      }
      return true;
    });
    if (this.mode !== 'playing' && !demoActive) return;

    if (!demoActive && this.playMode === GAME_MODES.ART) {
      if (this.art.isComplete()) this.finishArt();
      return;
    }
    if (this.settlementGate.isBlocking()) {
      const settled = this.settlementGate.observe(this.simulation.movedCount);
      if (settled && fruitState !== 'IMPACT' && fruitState !== 'BREAKING') {
        const cleared = this.clearSystem.resolve({
          maxGroups: demoActive ? 1 : Infinity
        });
        if (cleared > 0) this.settlementGate.begin();
      }
    }
    if (!demoActive && this.playMode === GAME_MODES.LEVEL &&
        this.levelVictoryPending && !this.settlementGate.isBlocking() &&
        countSand(this.grid) === 0) this.completeLevel();
  }

  end() {
    if (this.mode !== 'playing') return;
    this.mode = 'over';
    this.fruitManager.setEnabled(false);
    const score = this.clearSystem.score;
    if (this.playMode === GAME_MODES.ENDLESS) {
      this.progress.recordGameOver(score);
      this.unlockManager.checkAll();
    }
    this.onGameOver?.({ score, rating: getClearRating(score),
      mode: this.playMode, level: this.level });
  }
}
