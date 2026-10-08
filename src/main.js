import { SandGrid } from './SandGrid.js';
import { SandSimulation } from './SandSimulation.js';
import { SandRenderer } from './SandRenderer.js';
import { SandStats } from './SandStats.js';
import { ConnectivityClear } from './ConnectivityClear.js';
import { GameHUD } from './GameHUD.js';
import { GameRules } from './GameRules.js';
import { ClearEffectManager, getClearRating } from './ClearEffectManager.js';
import { AudioManager } from './AudioManager.js';
import { SettlementGate } from './SettlementGate.js';
import { FruitManager } from './fruit/FruitManager.js';
import { FruitController } from './fruit/FruitController.js';
import { CONFIG } from './config.js';
import { buildFirstDropGuide } from './FirstDropGuide.js';
import { PlayerProgress } from './progress/PlayerProgress.js';
import { UnlockManager } from './progress/UnlockManager.js';
import { EffectCollectionPanel } from './ui/EffectCollectionPanel.js';
import { HomeScreen } from './ui/HomeScreen.js';
import { HomeDemoController } from './ui/HomeDemoController.js';
import { GameOverArtwork } from './ui/GameOverArtwork.js';
import { SettingsPanel } from './ui/SettingsPanel.js';
import { GAME_MODES, ModeProgress, countSand } from './modes/ModeLogic.js';
import { getPrototypeLevel, createLevelRandom } from './modes/Levels.js';
import { SandArtTools } from './modes/SandArtTools.js';
import { ArtToolbar } from './ui/ArtToolbar.js';
import { ModePanels } from './ui/ModePanels.js';

const gameShell = document.getElementById('game-shell');
const gameRoot = document.getElementById('game-root');

if (!gameShell || !gameRoot) {
  throw new Error('Missing mobile game container');
}

const grid = new SandGrid();
const simulation = new SandSimulation(grid);
const art = new SandArtTools(grid, simulation);
const modeProgress = new ModeProgress();
let currentMode = GAME_MODES.ENDLESS;
let currentLevel = 1;
let levelData = null;
let levelVictoryPending = false;
let lastDraftSaveTime = 0;
let artFinishing = false;
let artFinishElapsed = 0;
let artFinishStableTicks = 0;
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
const audio = new AudioManager(gameShell);
const settingsPanel = new SettingsPanel(gameShell, {
  audio,
  onHome: () => returnHome(),
  canGoHome: () => !homeScreen.isOpen()
});

const settlementGate = new SettlementGate(3);
const debugEffectUiEnabled = Boolean(
  import.meta.env.DEV && CONFIG.DEBUG_SHOW_CLEAR_EFFECT_BUTTON
);
const effectPanel = new EffectCollectionPanel(gameShell, {
  progress,
  unlockManager,
  enabled: debugEffectUiEnabled
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
  showEffectsButton: debugEffectUiEnabled,
  onStart: (mode, level) => {
    homeDemo.hide();
    restartGame(mode, level);
  },
  getUnlockedLevel: () => modeProgress.unlockedLevel,
  onGallery: () => openArtworkGallery(),
  onEffects: () => effectPanel.open()
});

const gameOverArtwork = new GameOverArtwork(gameShell, {
  onRestart: () => restartGame(currentMode, currentLevel),
  onHome: () => returnHome()
});

const modePanels = new ModePanels(gameShell);
const artToolbar = new ArtToolbar(gameShell, {
  onHome: () => returnHome(),
  onTool: (tool) => {
    if (!setArtTool(tool)) artToolbar.setTool(art.tool);
  },
  onSize: (size) => art.setRadius(size),
  onColor: (color) => {
    art.setColor(color);
    if (fruitManager.current?.state === 'CONTROL') {
      fruitManager.current.color = art.color;
    }
  },
  onUndo: () => { art.undo(); renderGameCanvas(true); },
  onRedo: () => { art.redo(); renderGameCanvas(true); },
  onClear: () => { art.clear(); renderGameCanvas(true); }
});
const modeHomeButton = document.createElement('button');
modeHomeButton.type = 'button';
modeHomeButton.textContent = '‹ 返回首页';
modeHomeButton.style.cssText =
  'display:none;position:absolute;top:max(68px,calc(env(safe-area-inset-top) + 58px));right:12px;z-index:15;'+
  'border:1px solid #ebdbc9;background:#fff9ed;color:#73513c;border-radius:14px;'+
  'padding:9px 11px;font:800 12px system-ui;';
modeHomeButton.addEventListener('click', () => returnHome());
gameShell.appendChild(modeHomeButton);
const levelStatus = document.createElement('div');
levelStatus.style.cssText =
  'display:none;position:absolute;left:12px;top:max(12px,env(safe-area-inset-top));z-index:14;'+
  'min-width:95px;padding:8px 11px;border-radius:14px;background:rgba(255,255,255,.91);'+
  'color:#68503c;font:800 12px/1.45 system-ui,sans-serif;box-shadow:0 4px 14px rgba(91,65,42,.08);pointer-events:none;';
gameShell.appendChild(levelStatus);
let lastLevelStatusRevision = -1;

function setArtTool(tool) {
  if (artFinishing || !art.active) return false;
  if (fruitManager.current && !['CONTROL', 'SAND'].includes(fruitManager.current.state)) return false;
  art.setTool(tool);
  if (tool === 'shape') {
    fruitManager.setSpawnProvider(() => ({ color: art.color }));
    fruitManager.reset();
  } else {
    fruitManager.setEnabled(false);
    fruitManager.current = null;
  }
  renderGameCanvas(true);
  return true;
}
let drawingArt = false;
function getArtPos(event) {
  const r = sandRenderer.canvas.getBoundingClientRect();
  return {
    x: (event.clientX - r.left) / Math.max(1, r.width) * grid.width,
    y: (event.clientY - r.top) / Math.max(1, r.height) * grid.height
  };
}
function captureArtPointer(event) {
  if (currentMode !== GAME_MODES.ART || art.tool === 'shape' || !art.active ||
      artFinishing || homeScreen.isOpen() || gameOver || gameOverArtwork.isOpen()) return;
  if (event.type === 'pointerdown') {
    event.preventDefault();
    event.stopImmediatePropagation();
    drawingArt = true;
    const p = getArtPos(event);
    art.beginStroke(p.x, p.y);
    sandRenderer.canvas.setPointerCapture?.(event.pointerId);
  } else if (drawingArt && event.type === 'pointermove') {
    event.preventDefault();
    event.stopImmediatePropagation();
    const p = getArtPos(event);
    art.strokeTo(p.x, p.y);
  } else if (drawingArt && (event.type === 'pointerup' || event.type === 'pointercancel')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    drawingArt = false;
    art.endStroke();
  }
}
for (const type of ['pointerdown','pointermove','pointerup','pointercancel'])
  sandRenderer.canvas.addEventListener(type, captureArtPointer, { capture: true });

function openArtworkGallery() {
  modePanels.showGallery(modeProgress.artworks, {
    onClose: () => {},
    onView: (canvas) => {
      currentMode = GAME_MODES.ART;
      homeDemo.hide();
      gameOver = true;
      gameOverArtwork.show({ mode: 'sandArt', artworkCanvas: canvas });
    }
  });
}
hud.setGameVisible(false);

new FruitController(sandRenderer.canvas, fruitManager, grid, {
  canInteract: () => !gameOver && !artFinishing && !homeScreen.isOpen() &&
    (currentMode !== GAME_MODES.ART || art.tool === 'shape'),
  onRelease: () => {
    hud.notifyDropReleased();

    if (!homeDemo.isRunning() && !homeScreen.isOpen()) {
      audio.playRelease();
    }
  },
  onFastDrop: () => {
    if (!homeDemo.isRunning() && !homeScreen.isOpen()) {
      audio.playFastDrop();
    }
  }
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

  if (currentMode === GAME_MODES.ENDLESS) {
    progress.recordClear({ cleared, score, combo });
    unlockManager.checkAll();
  }
  if (currentMode === GAME_MODES.LEVEL && countSand(grid) === 0)
    levelVictoryPending = true;

  hud.showCombo(combo);

  clearEffects.play(payload, {
    // Start the selected dense roulette rhythm on the exact visual clear frame.
    // The clear animation is timed to the full roulette sample. The source
    // ends naturally, then reward audio starts without truncating the tail.
    onStart: () => audio.beginClearSweep(payload),
    onComplete: () => {
      audio.endClearSweep();
      hud.setScore(score);

      return audio.playReward(
        rating,
        Math.min(4, cleared / 1000 + combo * 0.25)
      );
    }
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
  audio.playGameOver();
  if (currentMode === GAME_MODES.LEVEL) {
    modeHomeButton.style.display = 'none';
    levelStatus.style.display = 'none';
    clearEffects.clear();
    modePanels.showLose({
      level: currentLevel,
      remaining: countSand(grid),
      retry: () => restartGame(GAME_MODES.LEVEL, currentLevel),
      home: () => returnHome()
    });
    return;
  }
  if (currentMode === GAME_MODES.ENDLESS) {
    progress.recordGameOver(clearSystem.score);
    unlockManager.checkAll();
  }

  const artworkCanvas = sandRenderer.createArtworkCanvas({
    scale: 3
  });

  gameOverArtwork.show({
    score: clearSystem.score,
    rating: getClearRating(clearSystem.score),
    artworkCanvas
  });
}

if (import.meta.env.DEV) {
  globalThis.__legacyGame = {
    grid,
    triggerGameOver,
    progress,
    clearSystem,
    audio,
    settingsPanel,
    getLevelGuideCenter: () => levelData?.guide.centerX ?? null,
    getMode: () => currentMode,
    art
  };
}

function resetHomeDemoWorld(baselineCells = null) {
  art.stop();
  art.fixed.fill(0);
  clearEffects.clear();
  audio.stopTransient();
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

function prepareFirstDropGuide() {
  fruitManager.setSpawnProvider(null);

  if (!CONFIG.FIRST_DROP_GUIDE_ENABLED) {
    return;
  }

  const guide = buildFirstDropGuide(grid);
  let pending = true;

  fruitManager.setSpawnProvider(() => {
    if (!pending) return null;

    pending = false;
    fruitManager.setSpawnProvider(null);

    return {
      templateId: guide.templateId,
      color: guide.color,
      centerX: guide.centerX
    };
  });
}

function restartGame(mode = currentMode, level = currentLevel) {
  currentMode = mode;
  currentLevel = level;
  levelData = null;
  levelVictoryPending = false;
  lastDraftSaveTime = 0;
  artFinishing = false;
  artFinishElapsed = 0;
  artFinishStableTicks = 0;
  art.stop();
  art.fixed.fill(0);
  modePanels.hide();
  gameShell.classList.toggle('caisha-art-mode', mode === GAME_MODES.ART);
  artToolbar.show(mode === GAME_MODES.ART);
  modeHomeButton.style.display = mode === GAME_MODES.LEVEL ? 'block' : 'none';
  levelStatus.style.display = mode === GAME_MODES.LEVEL ? 'block' : 'none';
  lastLevelStatusRevision = -1;
  sandRenderer.lineMode = mode === GAME_MODES.ART ? 'finish' : 'failure';
  settingsPanel.close({ silent: true });
  gameOverArtwork.hide();
  hud.setGameVisible(false);
  grid.clear();

  // Pre-simulate the onboarding terrain while the previous screen is still
  // covering the playfield. The player only sees the final settled piles.
  if (mode === GAME_MODES.ENDLESS) {
    prepareFirstDropGuide();
  } else if (mode === GAME_MODES.LEVEL) {
    levelData = getPrototypeLevel(level);
    grid.cells.set(levelData.cells);
    grid.revision++;
    let nextStep = 0;
    const queue = levelData.solution;
    const fallback = levelData.palette[levelData.palette.length - 1];
    fruitManager.setSpawnProvider(() => {
      const step = queue[nextStep++];
      return step ? { ...step } : { templateId: 'banana', color: fallback };
    });
    simulation.setRandom(createLevelRandom(levelData.runtimeSeed));
  } else {
    fruitManager.setSpawnProvider(null);
    art.reset();
    const draft = modeProgress.readDraft(grid.width, grid.height);
    if (draft) art.restore(draft);
  }

  simulation.reset();
  clearSystem.reset();
  rules.reset();
  fruitManager.reset();
  if (mode === GAME_MODES.ART) setArtTool('flow');
  hud.reset();
  clearEffects.clear();
  audio.stopTransient();
  settlementGate.reset();
  hud.setGameVisible(mode === GAME_MODES.ENDLESS);

  gameOver = false;
  lastFruitState = fruitManager.current?.state ?? null;

  const now = performance.now();
  lastSimulation = now;
  lastFrame = now;

  renderGameCanvas(true);
}

function returnHome() {
  // Returning while the finishing animation is running saves the draft.
  if (currentMode === GAME_MODES.ART && !gameOver) {
    if (countSand(grid) > 0) modeProgress.saveDraft(grid, art.fixed);
    else modeProgress.clearDraft();
  }
  drawingArt = false;
  artFinishing = false;
  art.stop();
  art.fixed.fill(0);
  fruitManager.setSpawnProvider(null);
  artToolbar.show(false);
  gameShell.classList.remove('caisha-art-mode');
  modeHomeButton.style.display = 'none';
  levelStatus.style.display = 'none';
  modePanels.hide();
  sandRenderer.lineMode = 'failure';
  hud.setGameVisible(false);
  audio.stopTransient();
  clearEffects.clear();
  effectPanel.close();
  settingsPanel.close({ silent: true });
  gameOverArtwork.hide();
  homeScreen.show();
  homeDemo.show();
}

function triggerArtComplete() {
  if (gameOver || currentMode !== GAME_MODES.ART) return;
  artFinishing = false;
  gameOver = true;
  drawingArt = false;
  art.stop();
  fruitManager.setEnabled(false);
  artToolbar.show(false);
  audio.stopTransient();
  modeProgress.saveArtwork(grid, art.fixed);
  modeProgress.clearDraft();
  const artworkCanvas = sandRenderer.createArtworkCanvas({ scale: 3 });
  gameOverArtwork.show({ mode: 'sandArt', artworkCanvas });
}
function triggerLevelComplete() {
  if (gameOver || currentMode !== GAME_MODES.LEVEL) return;
  gameOver = true;
  fruitManager.setEnabled(false);
  modeHomeButton.style.display = 'none';
  levelStatus.style.display = 'none';
  const stars = modeProgress.winLevel(currentLevel, hud.dropHintCount,
    levelData?.referenceDrops || 1);
  modePanels.showWin({
    level: currentLevel, stars, drops: hud.dropHintCount,
    next: currentLevel < 12 ? () => restartGame(GAME_MODES.LEVEL, currentLevel+1) : null,
    retry: () => restartGame(GAME_MODES.LEVEL, currentLevel),
    home: () => returnHome()
  });
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

  if (
    !gameOver &&
    !effectPanel.isOpen() &&
    !settingsPanel.isOpen() &&
    simulationActive
  ) {
    if (clearEffects.isBusy()) {
      // Hold the board still while the currently equipped clear effect plays.
      audio.updateSandFlow(0);
      lastSimulation = time;
    } else {
      const previousFruitState = lastFruitState;

      if (demoActive) {
        homeDemo.update(time);
      }

      if (!demoActive && currentMode === GAME_MODES.ART) {
        art.update(deltaMs);
        if (lastDraftSaveTime === 0) lastDraftSaveTime = time;
        if (time - lastDraftSaveTime > 7000 && countSand(grid) > 0) {
          modeProgress.saveDraft(grid, art.fixed);
          lastDraftSaveTime = time;
        }
      }
      fruitManager.update(deltaMs);

      const fruitState = fruitManager.current?.state ?? null;

      if (fruitState !== previousFruitState && fruitState === 'FALLING') {
        clearSystem.resetCombo();

        if (!demoActive) {
          audio.playFallStart();
        }
      }

      if (!demoActive && previousFruitState === 'FALLING' && fruitState === 'IMPACT') {
        audio.playImpact();
      }

      if (!demoActive && previousFruitState === 'IMPACT' && fruitState === 'BREAKING') {
        audio.playCrumble();
      }

      if (previousFruitState === 'BREAKING' && fruitState === null) {
        settlementGate.begin();
      }

      lastFruitState = fruitState;

      if (!demoActive && currentMode !== GAME_MODES.ART && rules.checkDeathLine()) {
        triggerGameOver();
      }

      if (!gameOver && time - lastSimulation >= CONFIG.UPDATE_INTERVAL) {
        simulation.update(() => {
          if (!demoActive && currentMode !== GAME_MODES.ART && rules.checkDeathLine()) {
            triggerGameOver();
            return false;
          }

          return !gameOver;
        });

        audio.updateSandFlow(
          !demoActive && !gameOver ? simulation.movedCount : 0
        );

        // A supported pile touching the finish line locks inputs immediately.
        // Keep the grid simulated for a few stable ticks before capturing.
        if (!gameOver && currentMode === GAME_MODES.ART) {
          if (!artFinishing && art.isComplete()) {
            artFinishing = true;
            artFinishElapsed = 0;
            artFinishStableTicks = 0;
            drawingArt = false;
            art.stop();
            // Freeze new input, not the currently released shape's physics.
            const state = fruitManager.current?.state;
            if (!state || state === 'CONTROL' || state === 'SAND')
              fruitManager.setEnabled(false);
          }
          if (artFinishing) {
            if (!fruitManager.current) fruitManager.setEnabled(false);
            artFinishElapsed += deltaMs;
            const movingFruit = fruitManager.current &&
              !['SAND', 'CONTROL'].includes(fruitManager.current.state);
            if (simulation.movedCount === 0 && !movingFruit)
              artFinishStableTicks++;
            else artFinishStableTicks = 0;
            if (artFinishStableTicks >= 4 ||
                (artFinishElapsed >= 2000 && !movingFruit) ||
                artFinishElapsed >= 5000)
              triggerArtComplete();
          }
        }
        if (!gameOver && currentMode !== GAME_MODES.ART && settlementGate.isBlocking()) {
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

        if (!demoActive && !gameOver && currentMode === GAME_MODES.LEVEL &&
            levelVictoryPending && !settlementGate.isBlocking() &&
            !clearEffects.isBusy() && countSand(grid) === 0)
          triggerLevelComplete();
        lastSimulation = time;
      }
    }
  } else {
    audio.updateSandFlow(0);
  }

  if (!gameOver && !homeScreen.isOpen() && currentMode === GAME_MODES.LEVEL &&
      lastLevelStatusRevision !== grid.revision) {
    levelStatus.textContent = '第 ' + currentLevel + ' 关 · 剩余 ' +
      countSand(grid).toLocaleString() + ' 粒';
    lastLevelStatusRevision = grid.revision;
  }
  stats.update();
  renderGameCanvas();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (currentMode === GAME_MODES.ART && !gameOver && countSand(grid) > 0)
      modeProgress.saveDraft(grid, art.fixed);
    audio.suspendForVisibility();
    return;
  }

  audio.resumeFromVisibility();

  const now = performance.now();
  lastFrame = now;
  lastSimulation = now;
  renderGameCanvas(true);
});

renderGameCanvas(true);
loop(performance.now());
