import * as THREE from 'three';
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

const gameShell = document.getElementById('game-shell');
const gameRoot = document.getElementById('game-root');

if (!gameShell || !gameRoot) {
  throw new Error('Missing mobile game container');
}

const boardAspect = CONFIG.WIDTH / CONFIG.HEIGHT;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#fff8ea');

const camera = new THREE.OrthographicCamera(
  -boardAspect,
  boardAspect,
  1,
  -1,
  0.1,
  10
);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  alpha: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
gameRoot.appendChild(renderer.domElement);

const grid = new SandGrid();
const simulation = new SandSimulation(grid);
const sandRenderer = new SandRenderer(grid);
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
  gameShell,
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

const homeScreen = new HomeScreen(gameShell, {
  progress,
  onStart: () => restartGame(),
  onEffects: () => effectPanel.open()
});

// The game exists behind the home screen, but no fruit or physics should move
// until the player explicitly starts a run.
fruitManager.setEnabled(false);

new FruitController(renderer.domElement, fruitManager, grid, {
  onRelease: () => hud.notifyDropReleased()
});

// ConnectivityClear calls this while every target grain still exists.
// Rendering here guarantees the clear-effect snapshot is the exact current
// low-resolution sand image that the player was seeing before deletion.
clearSystem.onBeforeClear = () => {
  sandRenderer.update(fruitManager.current);
};

clearSystem.onClear = (payload) => {
  const { cleared, score, combo } = payload;
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

const material = new THREE.MeshBasicMaterial({
  map: sandRenderer.texture,
  transparent: true
});

const mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(boardAspect * 2, 2),
  material
);
scene.add(mesh);

let lastSimulation = 0;
let lastFrame = performance.now();

let lastFruitState = fruitManager.current?.state ?? null;
let gameOver = false;

function triggerGameOver() {
  if (gameOver) return;

  gameOver = true;
  fruitManager.setEnabled(false);
  progress.recordGameOver(clearSystem.score);
  unlockManager.checkAll();
  hud.showGameOver(clearSystem.score);
}

function restartGame() {
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

  sandRenderer.update(fruitManager.current);
}

hud.setRestartHandler(restartGame);
hud.setHomeHandler(() => {
  rewardAudio.stop();
  clearEffects.clear();
  effectPanel.close();
  fruitManager.setEnabled(false);
  homeScreen.show();
});

function canResolveConnectivity(fruitState) {
  // During IMPACT/BREAKING the fruit is still writing grains into SandGrid.
  // Once that write is finished, connectivity should be checked every physics
  // tick instead of waiting for the whole board to become completely still.
  return fruitState !== 'IMPACT' && fruitState !== 'BREAKING';
}

function loop(time) {
  requestAnimationFrame(loop);

  const deltaMs = Math.min(50, time - lastFrame);
  lastFrame = time;

  if (!gameOver && !effectPanel.isOpen() && !homeScreen.isOpen()) {
    if (clearEffects.isBusy()) {
      // Hold the board still while the currently equipped clear effect plays.
      lastSimulation = time;
    } else {
      const previousFruitState = lastFruitState;

      fruitManager.update(deltaMs);

      const fruitState = fruitManager.current?.state ?? null;

      if (fruitState !== previousFruitState && fruitState === 'FALLING') {
        clearSystem.resetCombo();
      }

      if (previousFruitState === 'BREAKING' && fruitState === null) {
        settlementGate.begin();
      }

      lastFruitState = fruitState;

      if (rules.checkDeathLine()) {
        triggerGameOver();
      }

      if (!gameOver && time - lastSimulation >= CONFIG.UPDATE_INTERVAL) {
        const settling = settlementGate.isBlocking();
        let clearedBeforePhysics = 0;

        if (!settling && canResolveConnectivity(fruitState)) {
          clearedBeforePhysics = clearSystem.resolve();
        }

        if (clearedBeforePhysics === 0 && !gameOver) {
          simulation.update(() => {
            if (rules.checkDeathLine()) {
              triggerGameOver();
              return false;
            }

            if (
              !gameOver &&
              !settlementGate.isBlocking() &&
              canResolveConnectivity(fruitState)
            ) {
              const cleared = clearSystem.resolve();

              if (cleared > 0) {
                return false;
              }
            }

            return !gameOver;
          });

          // A freshly sandified fruit must finish falling before it can trigger
          // a clear. Three consecutive motionless physics ticks are required.
          if (settlementGate.isBlocking()) {
            const justSettled = settlementGate.observe(simulation.movedCount);

            if (
              justSettled &&
              !gameOver &&
              canResolveConnectivity(fruitState)
            ) {
              clearSystem.resolve();
            }
          }
        }

        lastSimulation = time;
      }
    }
  }

  stats.update();
  sandRenderer.update(fruitManager.current);
  renderer.render(scene, camera);
}

function resize() {
  const rect = gameRoot.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const viewAspect = width / height;

  renderer.setSize(width, height, false);

  if (viewAspect >= boardAspect) {
    camera.left = -viewAspect;
    camera.right = viewAspect;
    camera.top = 1;
    camera.bottom = -1;
  } else {
    const halfHeight = boardAspect / viewAspect;
    camera.left = -boardAspect;
    camera.right = boardAspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
  }

  camera.updateProjectionMatrix();
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(gameRoot);
resize();

sandRenderer.update(fruitManager.current);
loop(performance.now());
