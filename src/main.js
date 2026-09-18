import * as THREE from 'three';
import { SandGrid } from './SandGrid.js';
import { SandSimulation } from './SandSimulation.js';
import { SandRenderer } from './SandRenderer.js';
import { SandStats } from './SandStats.js';
import { ConnectivityClear } from './ConnectivityClear.js';
import { GameHUD } from './GameHUD.js';
import { GameRules } from './GameRules.js';
import { FruitManager } from './fruit/FruitManager.js';
import { FruitController } from './fruit/FruitController.js';
import { CONFIG } from './config.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#fff7e8');

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const grid = new SandGrid();
const simulation = new SandSimulation(grid);
const sandRenderer = new SandRenderer(grid);
const stats = new SandStats(simulation);

const fruitManager = new FruitManager(grid, simulation);
new FruitController(renderer.domElement, fruitManager, grid);

const clearSystem = new ConnectivityClear(grid, simulation);
const rules = new GameRules(grid);
const hud = new GameHUD();

clearSystem.onClear = ({ score, combo }) => {
  hud.setScore(score);
  hud.showCombo(combo);
};

const material = new THREE.MeshBasicMaterial({
  map: sandRenderer.texture,
  transparent: true
});

const mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  material
);
scene.add(mesh);

let lastSimulation = 0;
let lastFrame = performance.now();

let stableTicks = 0;
let checkedAtRest = false;
let lastFruitState = fruitManager.current?.state ?? null;
let gameOver = false;

function triggerGameOver() {
  if (gameOver) return;

  gameOver = true;
  fruitManager.setEnabled(false);
  hud.showGameOver(clearSystem.score);
}

function restartGame() {
  grid.clear();
  simulation.reset();
  clearSystem.reset();
  rules.reset();
  fruitManager.reset();
  hud.reset();

  gameOver = false;
  stableTicks = 0;
  checkedAtRest = false;
  lastFruitState = fruitManager.current?.state ?? null;

  const now = performance.now();
  lastSimulation = now;
  lastFrame = now;

  sandRenderer.update(fruitManager.current);
}

hud.setRestartHandler(restartGame);

function loop(time) {
  requestAnimationFrame(loop);

  const deltaMs = Math.min(50, time - lastFrame);
  lastFrame = time;

  if (!gameOver) {
    fruitManager.update(deltaMs);

    const fruitState = fruitManager.current?.state ?? null;

    if (fruitState !== lastFruitState) {
      stableTicks = 0;
      checkedAtRest = false;

      if (fruitState === 'FALLING') {
        clearSystem.resetCombo();
      }
    }

    lastFruitState = fruitState;

    // Sand written during fruit breaking can touch the line before
    // the next simulation tick, so check every frame.
    if (rules.checkDeathLine()) {
      triggerGameOver();
    }

    if (!gameOver && time - lastSimulation >= CONFIG.UPDATE_INTERVAL) {
      simulation.update();

      if (rules.checkDeathLine()) {
        triggerGameOver();
      }

      if (!gameOver) {
        if (simulation.movedCount === 0) {
          stableTicks++;
        } else {
          stableTicks = 0;
          checkedAtRest = false;
        }

        if (
          stableTicks >= 4 &&
          !checkedAtRest &&
          fruitState !== 'FALLING' &&
          fruitState !== 'IMPACT' &&
          fruitState !== 'BREAKING'
        ) {
          const cleared = clearSystem.resolve();

          if (cleared > 0) {
            stableTicks = 0;
            checkedAtRest = false;
          } else {
            checkedAtRest = true;
          }
        }
      }

      lastSimulation = time;
    }
  }

  stats.update();
  sandRenderer.update(fruitManager.current);
  renderer.render(scene, camera);
}

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize);

sandRenderer.update(fruitManager.current);
loop(performance.now());
