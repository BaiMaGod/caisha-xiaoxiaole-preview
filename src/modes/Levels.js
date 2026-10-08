import { SandGrid } from '../SandGrid.js';
import { SandSimulation } from '../SandSimulation.js';
import { ConnectivityClear } from '../ConnectivityClear.js';
import { FruitManager } from '../fruit/FruitManager.js';
import { FruitPiece } from '../fruit/FruitPiece.js';
import { buildFirstDropGuide } from '../FirstDropGuide.js';
import { countSand } from './ModeLogic.js';

export const PROTOTYPE_LEVEL_COUNT = 12;
const cached = new Map();
// Each playable stage has its own physical sand recipe, not just a recolored
// copy of the opening guide. Later stages add new colors and distinct mounds.
export const LEVEL_NAMES = Object.freeze([
  '彩虹初遇', '两岸小桥', '交错双坡',
  '三色接力', '双岛挑战', '偏心沙谷',
  '爱心花坡', '星星叠山', '高低沙丘',
  '四色初探', '彩虹回廊', '终极彩沙'
]);
const plans = [
  // level 2: introduce a second color on two shallow banks
  { base: 1, bShape: 'banana', pairs: 1 },
  // level 3: a noticeably taller, wider two-color bank
  { base: 2, bShape: 'star', pairs: 2 },
  // levels 4–6: introduce distinct three-color terrain
  { base: 3, bShape: 'banana', pairs: 1, cCenters: [60] },
  { base: 2, bShape: 'banana', pairs: 1, cCenters: [40, 140] },
  { base: 3, bShape: 'banana', pairs: 1, cCenters: [40] },
  // levels 7–9: change both the color obstacles and initial mound silhouette
  { base: 2, bShape: 'heart', pairs: 1, cCenters: [60] },
  { base: 4, bShape: 'banana', pairs: 1, cCenters: [40, 140] },
  { base: 1, bShape: 'banana', pairs: 1, cCenters: [40] },
  // levels 10–12: an additional color changes the intended clear order
  { base: 3, bShape: 'banana', pairs: 1, cCenters: [60], dCenters: [90] },
  { base: 2, bShape: 'clover', pairs: 2, cCenters: [40, 140], dCenters: [90] },
  { base: 3, bShape: 'clover', pairs: 2, cCenters: [40, 140], dCenters: [90] }
];

export function createLevelRandom(seed) {
  let state = seed >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  random.state = () => state;
  return random;
}

const shapeTemplates = (() => {
  const g = new SandGrid();
  const manager = new FruitManager(g, new SandSimulation(g));
  return Object.fromEntries(manager.templates.map(t => [t.id, t]));
})();

function fullySettled(simulation, limit = 360) {
  let stable = 0;
  for (let tick = 0; tick < limit; tick++) {
    simulation.update();
    if (simulation.movedCount === 0 && !simulation.fullUpdate &&
        simulation.currentRegion.isEmpty() && simulation.nextRegion.isEmpty())
      stable++;
    else stable = 0;
    if (stable >= 4) return true;
  }
  return false;
}

function dropPiece(grid, sim, { templateId, color, centerX }) {
  const template = shapeTemplates[templateId];
  if (!template) throw new Error('Invalid level shape: ' + templateId);
  const piece = new FruitPiece({ template, color, grid, simulation: sim });
  piece.setCenterX(centerX);
  piece.release();
  for (let tick = 0; tick < 150 && piece.state !== 'SAND'; tick++) {
    piece.update(50);
    sim.update();
  }
  if (piece.state !== 'SAND' || !fullySettled(sim))
    throw new Error('Unstable level simulation');
}

function resolveAll(grid, sim) {
  const clear = new ConnectivityClear(grid, sim);
  for (let pass = 0; pass < 12; pass++) {
    const value = clear.resolve();
    if (value <= 0) break;
    if (!fullySettled(sim)) throw new Error('Level cascade did not settle');
  }
}

function countColor(grid, color) {
  let n = 0;
  for (const v of grid.cells) if (v === color) n++;
  return n;
}

function hasSpanningClear(cells) {
  const clone = new SandGrid();
  clone.cells.set(cells);
  const sim = new SandSimulation(clone);
  return new ConnectivityClear(clone, sim).resolve() > 0;
}

function buildBase(id) {
  const grid = new SandGrid();
  const random = () => (0.17 + id * 0.213) % 1;
  const guide = buildFirstDropGuide(grid, { random });
  const solution = [{
    templateId: guide.templateId,
    color: guide.color,
    centerX: guide.centerX
  }];
  return {
    id, name: LEVEL_NAMES[id - 1], guide,
    cells: grid.cells.slice(),
    initialSand: countSand(grid),
    solution, palette: [guide.color], referenceDrops: 1,
    runtimeSeed: 97431 + id * 137
  };
}

function buildLayeredAttempt(id, p) {
  if (!p) throw new Error('Missing distinct level recipe ' + id);
  // Use a separate verified one-color underlay even when its seed number is
  // now a playable layered level. Avoid recursively cloning another level.
  const base = buildBase(p.base);
  const grid = new SandGrid();
  grid.cells.set(base.cells);
  grid.revision++;

  // The same seed is used to pre-simulate and replay the player's solution.
  // Determinism prevents "solvable in test but not in the browser" boards.
  const prefillSeed = p.cCenters ? 127 : 7241 + p.base * 333 + p.pairs * 5;
  const random = createLevelRandom(prefillSeed);
  const sim = new SandSimulation(grid, { random });
  const [b, c, d] = [1, 2, 3, 4, 5, 6, 7]
    .filter(color => color !== base.guide.color);
  const colorSteps = [
    { color: b, centers: [] },
    ...(p.cCenters ? [{ color: c, centers: p.cCenters }] : []),
    ...(p.dCenters ? [{ color: d, centers: p.dCenters }] : [])
  ];

  // Actual settled physics: varied shapes/pair counts make distinct slopes,
  // and side-to-side color gaps are still genuine gameplay obstacles.
  for (let i = 0; i < p.pairs; i++) {
    const spread = i === 0 ? 0 : (p.offset ?? 0);
    dropPiece(grid, sim, {
      templateId: p.bShape, color: b, centerX: 18 + spread * i
    });
    dropPiece(grid, sim, {
      templateId: p.bShape, color: b, centerX: 162 - spread * i
    });
  }
  for (const layer of colorSteps.slice(1)) {
    const shape = layer.color === d ? 'heart' : 'banana';
    for (const centerX of layer.centers)
      dropPiece(grid, sim, { templateId: shape, color: layer.color, centerX });
  }

  const cells = grid.cells.slice();
  if (hasSpanningClear(cells))
    throw new Error('Prebuilt board auto-clears at level ' + id);
  const initialSand = countSand(grid);
  if (initialSand <= base.initialSand)
    throw new Error('Missing colorful terrain at level ' + id);

  const runtimeSeed = p.cCenters ? random.state() : 919 * p.base + 17;
  sim.setRandom(createLevelRandom(runtimeSeed));
  const solution = [{ ...base.solution[0] }];
  dropPiece(grid, sim, solution[0]);
  resolveAll(grid, sim);

  const bPositions = p.cCenters
    ? [90, 65, 115, 90, 65, 115, 50, 130, 30, 150, 20, 160]
    : [90, 65, 115, 50, 130, 30, 150, 90, 65, 115, 50, 130,
      30, 150, 18, 162, 90, 65, 115, 50, 130];
  const cPositions = [150, 110, 70, 30, 18, 90, 50, 130,
    150, 110, 70, 30, 18, 90, 50, 130];
  const dPositions = [90, 50, 130, 30, 150, 65, 115, 18, 162,
    90, 50, 130, 30, 150, 65, 115, 18, 162];

  // A deterministic verified playthrough is part of every level definition.
  // The game only exposes prebuilt boards that fully clear with these drops.
  for (const [layer, positions] of colorSteps.map((part, i) => [
    part, i === 0 ? bPositions : part.color === c ? cPositions : dPositions
  ])) {
    for (const centerX of positions) {
      if (countSand(grid) === 0 || countColor(grid, layer.color) === 0) break;
      const action = { templateId: 'banana', color: layer.color, centerX };
      solution.push(action);
      dropPiece(grid, sim, action);
      resolveAll(grid, sim);
    }
  }
  const remaining = countSand(grid);
  if (remaining !== 0)
    throw new Error('No verified full-clear plan for level ' + id +
      ' (remaining ' + remaining + ')');

  return {
    id, name: LEVEL_NAMES[id - 1], guide: base.guide, cells, initialSand,
    solution, palette: [base.guide.color, ...colorSteps.map(step => step.color)],
    referenceDrops: solution.length, runtimeSeed
  };
}

// Test proposed challenge profiles against the exact simulation. A complicated
// layout is never exposed just because it looks different: it must also clear.
// Fall back to another distinct three-color profile when physics blocks a route.
function buildLayered(id) {
  const primary = plans[id - 2];
  if (!primary) throw new Error('Missing distinct level recipe ' + id);
  const alternate = {
    8: [
      { base: 5, bShape: 'banana', pairs: 1, cCenters: [60] },
      { base: 3, bShape: 'banana', pairs: 1, cCenters: [40, 140] },
      { base: 2, bShape: 'banana', pairs: 1, cCenters: [40, 140] }
    ],
    9: [
      { base: 1, bShape: 'heart', pairs: 1, cCenters: [60] },
      { base: 3, bShape: 'banana', pairs: 1, cCenters: [40] }
    ],
    10: [
      { base: 3, bShape: 'banana', pairs: 1, cCenters: [40, 140], dCenters: [18, 162] },
      { base: 3, bShape: 'banana', pairs: 1, cCenters: [60] }
    ],
    11: [
      { base: 2, bShape: 'banana', pairs: 1, cCenters: [40, 140], dCenters: [18, 162] },
      { base: 2, bShape: 'banana', pairs: 1, cCenters: [40, 140] }
    ],
    12: [
      { base: 1, bShape: 'clover', pairs: 2, cCenters: [40, 140], dCenters: [90] },
      { base: 2, bShape: 'clover', pairs: 2, cCenters: [40, 140], dCenters: [90] },
      { base: 3, bShape: 'banana', pairs: 1, cCenters: [40] }
    ]
  };
  const candidates = [primary, ...(alternate[id] ?? [])];
  const errors = [];
  for (const recipe of candidates) {
    try {
      const level = buildLayeredAttempt(id, recipe);
      level.recipe = {
        base: recipe.base, pairs: recipe.pairs,
        bShape: recipe.bShape,
        extraColors: Number(Boolean(recipe.cCenters)) + Number(Boolean(recipe.dCenters))
      };
      return level;
    } catch (err) {
      errors.push(String(err?.message || err));
    }
  }
  throw new Error('Level ' + id + ' did not pass simulation: ' + errors.join('; '));
}

export function getPrototypeLevel(level) {
  const id = Math.floor(Number(level));
  if (!Number.isInteger(id) || id < 1 || id > PROTOTYPE_LEVEL_COUNT)
    throw new RangeError('Level not available');
  if (!cached.has(id))
    cached.set(id, id === 1 ? buildBase(id) : buildLayered(id));
  const data = cached.get(id);
  return {
    ...data,
    cells: data.cells.slice(),
    solution: data.solution.map(step => ({ ...step }))
  };
}
