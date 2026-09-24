import { SandGrid } from '../SandGrid.js';
import { SandSimulation } from '../SandSimulation.js';
import { ConnectivityClear } from '../ConnectivityClear.js';
import { FruitTemplate } from '../fruit/FruitTemplate.js';
import { FruitPiece } from '../fruit/FruitPiece.js';
import { APPLE_TEMPLATE } from '../fruit/templates/apple.js';
import { BANANA_TEMPLATE } from '../fruit/templates/banana.js';
import {
  HOME_DEMO_BASELINE_SCRIPT,
  HOME_DEMO_BASE_SEED,
  createSeededRandom
} from './HomeDemoScript.js';

const APPLE = new FruitTemplate(APPLE_TEMPLATE);
const BANANA = new FruitTemplate(BANANA_TEMPLATE);
const baselineCache = new Map();

function settle(simulation, maxTicks = 140) {
  let stableTicks = 0;

  for (let i = 0; i < maxTicks; i++) {
    simulation.update();

    if (simulation.movedCount === 0) {
      stableTicks += 1;
    } else {
      stableTicks = 0;
    }

    if (stableTicks >= 3) return;
  }
}

function dropBaselineFruit(grid, simulation, step, color) {
  const template =
    step.templateId === 'banana' ? BANANA : APPLE;

  const fruit = new FruitPiece({
    template,
    color,
    grid,
    simulation
  });

  fruit.setCenterX(step.centerX);
  fruit.release();

  let guard = 0;

  while (fruit.state !== 'SAND' && guard++ < 12) {
    if (fruit.state === 'FALLING') {
      fruit.update(5000);
    } else if (fruit.state === 'IMPACT') {
      fruit.update(100);
    } else {
      fruit.update(340);
    }
  }
}

export function buildHomeDemoBaseline(roleColors) {
  const cacheKey = [
    roleColors.D,
    roleColors.E,
    roleColors.F,
    roleColors.G
  ].join(':');

  const cached = baselineCache.get(cacheKey);
  if (cached) return cached.slice();

  const grid = new SandGrid();
  const simulation = new SandSimulation(grid, {
    random: createSeededRandom(HOME_DEMO_BASE_SEED)
  });
  const clearSystem = new ConnectivityClear(grid, simulation);

  for (const step of HOME_DEMO_BASELINE_SCRIPT) {
    dropBaselineFruit(
      grid,
      simulation,
      step,
      roleColors[step.role]
    );
    settle(simulation, 100);
    clearSystem.resolve();
  }

  settle(simulation, 140);

  const cells = grid.cells.slice();
  baselineCache.set(cacheKey, cells);

  return cells.slice();
}
