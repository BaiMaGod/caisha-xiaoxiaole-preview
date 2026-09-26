import { SandGrid } from './SandGrid.js';
import { SandSimulation } from './SandSimulation.js';
import { SandRenderer } from './SandRenderer.js';
import { SandStats } from './SandStats.js';
import { ConnectivityClear } from './ConnectivityClear.js';
import { GameHUD } from './GameHUD.js';
import { GameRules } from './GameRules.js';
import { ClearEffectManager, getClearRating } from './ClearEffectManager.js';
import { RewardAudio } from './RewardAudio.js';
import { SettlementGate } from './SettlementGate.js';
import { FruitManager } from './fruit/FruitManager.js';
import { FruitController } from './fruit/FruitController.js';
import { CONFIG } from './config.js';
import { PlayerProgress } from './progress/PlayerProgress.js';
import { UnlockManager } from './progress/UnlockManager.js';
import { EffectCollectionPanel } from './ui/EffectCollectionPanel.js';
import { HomeScreen } from './ui/HomeScreen.js';
import { HomeDemoController } from './ui/HomeDemoController.js';
import { GameOverArtwork } from './ui/GameOverArtwork.js';

const gameShell = document.getElementById('game-shell');
const gameRoot = document.getElementById('game-root');

if (!gameShell || !gameRoot) {
  throw new Error('Missing mobile game container');
}

const grid = new SandGrid();
const simulation = new SandSimulation(grid);
const sandRenderer = new SandRenderer(grid);
sandRenderer.canvas.className = 'game-canvas';
sandRenderer.canvas.setAttribute('aria-label', '七彩沙画消除游戏画布');
gameRoot.appendChild(sandRenderer.canvas);

const stats = new SandStats(simulation);
const progress = new PlayerProgress();
const unlockManager = new UnlockManager(progress);
unlockManager.checkAll();

const clearSystem = new ConnectivityClear(grid, simulation);
const fruitManager = new FruitManager(grid, simulation, {
  getScore: () => clearSystem.score
});
const rules = new GameRules(grid);
const hud = new GameHUD(gameShell);
const clearEffects = new ClearEffectManager(
  gameRoot,
  grid,
  sandRenderer.canvas,
  {
    getEffectId: () => progress.getSelectedEffectId()
  }
);
const rewardAudio = new RewardAudio(gameShell);
const settlementGate = new SettlementGate(3);
const effectPanel = new EffectCollectionPanel(gameShell, {
  progress,
  unlockManager
});

const homeDemo = new HomeDemoController({
  container: gameShell,
  fruitManager,
  grid,
  simulation,
  onResetWorld: (baselineCells) =>
    resetHomeDemoWorld(baselineCells)
});

const homeScreen = new HomeScreen(gameShell, {
  progress,
  onStart: () => {
    homeDemo.hide();
    restartGame();
  },
  onEffects: () => effectPanel.open()
});

const gameOverArtwork = new GameOverArtwork(gameShell, {
  onRestart: () => restartGame(),
  onHome: () => returnHome()
});

hud.setGameVisible(false);

new FruitController(sandRenderer.canvas, fruitManager, grid, {
  onRelease: () => hud.notifyDropReleased()
});

// ConnectivityClear calls this while every target grain still exists.
// Rendering here guarantees the DPR-resolution presentation canvas used by
// clear effects contains the exact current board before deletion.
clearSystem.onBeforeClear = () => {
  renderGameCanvas(true);
};

clearSystem.onClear = (payload) => {
  const { cleared, score, combo } = payload;

  if (homeDemo.isRunning()) {
    homeDemo.onClear(payload);
    clearEffects.play(payload);
    return;
  }

  const rating = getClearRating(cleared);

  progress.recordClear({ cleared, score, combo });
  unlockManager.checkAll();

  hud.showCombo(combo);

  clearEffects.play(payload, () => {
    hud.setScore(score);

    return rewardAudio.play(
      rating,
      Math.min(4, cleared / 1000 + combo * 0.25)
    );
  });
};

let lastSimulation = 0;
let lastFrame = performance.now();

let lastRenderedGridRevision = -1;
let lastRenderedFruit = null;
let lastRenderedFruitKey = '';

function getFruitRenderKey(fruit) {
  if (!fruit) return '';

  return [
    fruit.state,
    fruit.x,
    fruit.y,
    fruit.color,
    Math.round(fruit.impactTimer ?? 0),
    Math.round(fruit.breakTimer ?? 0),
    fruit.dissolvedCount ?? 0
  ].join(':');
}

function renderGameCanvas(force = false) {
  const fruit = fruitManager.current;
  const fruitKey = getFruitRenderKey(fruit);

  if (
    !force &&
    grid.revision === lastRenderedGridRevision &&
    fruit === lastRenderedFruit &&
    fruitKey === lastRenderedFruitKey
  ) {
    return;
  }

  sandRenderer.update(fruit);
  lastRenderedGridRevision = grid.revision;
  lastRenderedFruit = fruit;
  lastRenderedFruitKey = fruitKey;
}

let lastFruitState = fruitManager.current?.state ?? null;
let gameOver = false;

homeDemo.show();

function triggerGameOver() {
  if (gameOver) return;

  gameOver = true;
  fruitManager.setEnabled(false);
  progress.recordGameOver(clearSystem.score);
  unlockManager.checkAll();

  const artworkCanvas = sandRenderer.createArtworkCanvas({
    scale: 3
  });

  gameOverArtwork.show({
    score: clearSystem.score,
    rating: getClearRating(clearSystem.score),
    artworkCanvas
  });
}

function resetHomeDemoWorld(baselineCells = null) {
  clearEffects.clear();
  rewardAudio.stop();
  grid.clear();

  if (baselineCells) {
    grid.cells.set(baselineCells);
    grid.revision += 1;
  }

  simulation.reset();
  clearSystem.reset();
  rules.reset();
  settlementGate.reset();
  fruitManager.reset();

  gameOver = false;
  lastFruitState = fruitManager.current?.state ?? null;

  const now = performance.now();
  lastSimulation = now;
  lastFrame = now;

  renderGameCanvas(true);
}

function restartGame() {
  gameOverArtwork.hide();
  hud.setGameVisible(true);
  grid.clear();
  simulation.reset();
  clearSystem.reset();
  rules.reset();
  fruitManager.reset();
  hud.reset();
  clearEffects.clear();
  rewardAudio.stop();
  settlementGate.reset();

  gameOver = false;
  lastFruitState = fruitManager.current?.state ?? null;

  const now = performance.now();
  lastSimulation = now;
  lastFrame = now;

  renderGameCanvas(true);
}

function returnHome() {
  hud.setGameVisible(false);
  rewardAudio.stop();
  clearEffects.clear();
  effectPanel.close();
  gameOverArtwork.hide();
  homeScreen.show();
  homeDemo.show();
}

function canResolveConnectivity(fruitState) {
  // During IMPACT/BREAKING the fruit is still writing grains into SandGrid.
  // Connectivity is resolved only after SettlementGate confirms the board has
  // stayed motionless for the required number of physics ticks.
  return fruitState !== 'IMPACT' && fruitState !== 'BREAKING';
}

function loop(time) {
  requestAnimationFrame(loop);

  const deltaMs = Math.min(50, time - lastFrame);
  lastFrame = time;

  const demoActive = homeDemo.isRunning();
  const simulationActive = !homeScreen.isOpen() || demoActive;

  if (!gameOver && !effectPanel.isOpen() && simulationActive) {
    if (clearEffects.isBusy()) {
      // Hold the board still while the currently equipped clear effect plays.
      lastSimulation = time;
    } else {
      const previousFruitState = lastFruitState;

      if (demoActive) {
        homeDemo.update(time);
      }

      fruitManager.update(deltaMs);

      const fruitState = fruitManager.current?.state ?? null;

      if (fruitState !== previousFruitState && fruitState === 'FALLING') {
        clearSystem.resetCombo();
      }

      if (previousFruitState === 'BREAKING' && fruitState === null) {
        settlementGate.begin();
      }

      lastFruitState = fruitState;

      if (!demoActive && rules.checkDeathLine()) {
        triggerGameOver();
      }

      if (!gameOver && time - lastSimulation >= CONFIG.UPDATE_INTERVAL) {
        simulation.update(() => {
          if (!demoActive && rules.checkDeathLine()) {
            triggerGameOver();
            return false;
          }

          return !gameOver;
        });

        // Every connectivity check must pass through the same settlement gate.
        // This applies both to the first clear after a fruit turns into sand and
        // to every later cascade caused by grains falling into the cleared space.
        if (!gameOver && settlementGate.isBlocking()) {
          const justSettled = settlementGate.observe(simulation.movedCount);

          if (
            justSettled &&
            canResolveConnectivity(fruitState)
          ) {
            const cleared = clearSystem.resolve({
              maxGroups: demoActive ? 1 : Infinity
            });

            // A clear changes the board and wakes nearby grains, so lock
            // connectivity again until the resulting sand flow fully settles.
            if (cleared > 0) {
              settlementGate.begin();
            }
          }
        }

        lastSimulation = time;
      }
    }
  }

  stats.update();
  renderGameCanvas();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;

  const now = performance.now();
  lastFrame = now;
  lastSimulation = now;
  renderGameCanvas(true);
});

renderGameCanvas(true);
loop(performance.now());
