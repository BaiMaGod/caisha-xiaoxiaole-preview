import { SandGrid } from '../SandGrid.js';
import { SandSimulation } from '../SandSimulation.js';
import { ConnectivityClear } from '../ConnectivityClear.js';
import { FruitManager } from '../fruit/FruitManager.js';
import { FruitPiece } from '../fruit/FruitPiece.js';
import { buildFirstDropGuide } from '../FirstDropGuide.js';
import { countSand } from './ModeLogic.js';

export const PROTOTYPE_LEVEL_COUNT = 12;
const cached = new Map();
const names = [
  '彩虹初遇', '双坡搭桥', '流沙连通',
  '双色接力', '爱心沙丘', '层层铺展',
  '叠沙通道', '四叶双坡', '加厚沙丘',
  '三色流转', '叠层迷阵', '彩沙总动员'
];
const plans = [
  { base: 1, bShape: 'banana', pairs: 1, offset: 0 },
  { base: 2, bShape: 'heart', pairs: 1, offset: 0 },
  { base: 3, bShape: 'apple', pairs: 1, offset: 0 },
  { base: 1, bShape: 'star', pairs: 2, offset: 0 },
  { base: 2, bShape: 'clover', pairs: 2, offset: 0 },
  { base: 3, bShape: 'apple', pairs: 3, offset: 0 },
  { base: 3, bShape: 'banana', pairs: 1, offset: 0, cCenters: [60] },
  { base: 2, bShape: 'banana', pairs: 1, offset: 0, cCenters: [40, 140] },
  { base: 3, bShape: 'banana', pairs: 1, offset: 0, cCenters: [40] }
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
    id, name: names[id - 1], guide,
    cells: grid.cells.slice(),
    initialSand: countSand(grid),
    solution, palette: [guide.color], referenceDrops: 1,
    runtimeSeed: 97431 + id * 137
  };
}

function buildLayered(id) {
  const p = plans[id - 4];
  const base = getPrototypeLevel(p.base);
  const grid = new SandGrid();
  grid.cells.set(base.cells);
  grid.revision++;
  const prefillSeed = p.cCenters
    ? 127 : 7241 + p.base * 333 + p.pairs * 5 + p.offset;
  const random = createLevelRandom(prefillSeed);
  const sim = new SandSimulation(grid, { random });
  const [b, c] = [1, 2, 3, 4, 5, 6, 7]
    .filter(color => color !== base.guide.color);

  // Physically drop all starting layers and let them settle off-screen.
  for (let i = 0; i < p.pairs; i++) {
    dropPiece(grid, sim, {
      templateId: p.bShape, color: b, centerX: 18 + p.offset * i
    });
    dropPiece(grid, sim, {
      templateId: p.bShape, color: b, centerX: 162 - p.offset * i
    });
  }
  for (const centerX of p.cCenters ?? [])
    dropPiece(grid, sim, { templateId: 'banana', color: c, centerX });

  const cells = grid.cells.slice();
  if (hasSpanningClear(cells))
    throw new Error('Prebuilt board auto-clears at level ' + id);
  const initialSand = countSand(grid);
  if (initialSand <= base.initialSand)
    throw new Error('Missing colored prefill at level ' + id);

  const runtimeSeed = p.cCenters ? random.state() : 919 * p.base + 17;
  sim.setRandom(createLevelRandom(runtimeSeed));
  const solution = [{ ...base.solution[0] }];
  dropPiece(grid, sim, solution[0]);
  resolveAll(grid, sim);

  const bPositions = p.cCenters
    ? [90, 65, 115, 90, 65, 115, 50, 130, 30, 150, 20, 160]
    : [90, 65, 115, 50, 130, 30, 150, 90, 65, 115, 50, 130,
      30, 150, 18, 162, 90, 65, 115, 50, 130];
  for (const centerX of bPositions) {
    if (countColor(grid, b) === 0) break;
    const action = { templateId: 'banana', color: b, centerX };
    solution.push(action);
    dropPiece(grid, sim, action);
    resolveAll(grid, sim);
  }
  if (p.cCenters) {
    const cPositions = [150, 110, 70, 30, 18, 90, 50, 130,
      150, 110, 70, 30, 18, 90, 50, 130];
    for (const centerX of cPositions) {
      if (countSand(grid) === 0 || countColor(grid, c) === 0) break;
      const action = { templateId: 'banana', color: c, centerX };
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
    id, name: names[id - 1], guide: base.guide,
    cells, initialSand, solution,
    palette: p.cCenters ? [base.guide.color, b, c] : [base.guide.color, b],
    referenceDrops: solution.length, runtimeSeed
  };
}

export function getPrototypeLevel(level) {
  const id = Math.floor(Number(level));
  if (!Number.isInteger(id) || id < 1 || id > PROTOTYPE_LEVEL_COUNT)
    throw new RangeError('Level not available');
  if (!cached.has(id))
    cached.set(id, id <= 3 ? buildBase(id) : buildLayered(id));
  const data = cached.get(id);
  return {
    ...data,
    cells: data.cells.slice(),
    solution: data.solution.map(step => ({ ...step }))
  };
}
