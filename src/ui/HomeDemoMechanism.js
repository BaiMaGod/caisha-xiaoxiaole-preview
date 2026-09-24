import { SandSimulation } from '../SandSimulation.js';

export const HOME_DEMO_CHAIN_ROLES = ['A', 'B', 'C'];
export const HOME_DEMO_ALL_COLORS = [1, 2, 3, 4, 5, 6, 7];

export const HOME_DEMO_LAYOUT = Object.freeze({
  A_GAP: { x1: 28, y1: 244, x2: 40, y2: 249 },
  B_GAP: { x1: 85, y1: 262, x2: 95, y2: 267 },
  C_GAP: { x1: 139, y1: 280, x2: 151, y2: 285 },

  B_KEY: { x1: 85, y1: 216, x2: 95, y2: 225 },
  C_KEY: { x1: 139, y1: 213, x2: 151, y2: 222 },

  A_SUPPORT: { x1: 85, y1: 226, x2: 95, y2: 243 },
  B_SUPPORT: { x1: 139, y1: 223, x2: 151, y2: 261 },

  B_SHAFT: { x1: 82, y1: 250, x2: 98, y2: 267 },
  C_SHAFT: { x1: 135, y1: 250, x2: 155, y2: 285 }
});

function addRect(target, x1, y1, x2, y2) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      target.add(x + ',' + y);
    }
  }
}

function addHorizontal(target, y1, y2, segments) {
  for (const [x1, x2] of segments) {
    addRect(target, x1, y1, x2, y2);
  }
}

function toCells(keys) {
  return [...keys].map((key) => {
    const comma = key.indexOf(',');
    return {
      x: Number(key.slice(0, comma)),
      y: Number(key.slice(comma + 1))
    };
  });
}

function rectCells(rect) {
  const set = new Set();
  addRect(set, rect.x1, rect.y1, rect.x2, rect.y2);
  return toCells(set);
}

function sortedCells(cells) {
  return [...cells].sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    return a.y - b.y;
  });
}

function splitIntoParts(cells, count) {
  const ordered = sortedCells(cells);
  const parts = Array.from({ length: count }, () => []);

  for (let i = 0; i < ordered.length; i++) {
    const part = Math.min(
      count - 1,
      Math.floor((i / ordered.length) * count)
    );
    parts[part].push(ordered[i]);
  }

  return parts;
}

function centerX(cells) {
  if (!cells.length) return 90;
  const total = cells.reduce((sum, cell) => sum + cell.x, 0);
  return Math.round(total / cells.length);
}

function boundsOf(cells) {
  let minX = 180;
  let minY = 320;
  let maxX = 0;
  let maxY = 0;

  for (const cell of cells) {
    minX = Math.min(minX, cell.x);
    minY = Math.min(minY, cell.y);
    maxX = Math.max(maxX, cell.x);
    maxY = Math.max(maxY, cell.y);
  }

  return { minX, minY, maxX, maxY };
}

export function createHomeDemoMechanism() {
  const a = new Set();
  const b = new Set();
  const c = new Set();

  // A receiver is intentionally broken twice:
  // 1) x=28..40 is the real A key gap;
  // 2) x=139..151 is occupied by B's support column.
  // A climbs over the B support as an arch, so B support never creates
  // a second accidental A gap.
  addHorizontal(a, 244, 249, [
    [0, 27],
    [41, 138],
    [152, 179]
  ]);

  addRect(a, 132, 199, 138, 243);
  addRect(a, 152, 199, 158, 243);
  addRect(a, 132, 199, 158, 205);
  addRect(
    a,
    HOME_DEMO_LAYOUT.A_SUPPORT.x1,
    HOME_DEMO_LAYOUT.A_SUPPORT.y1,
    HOME_DEMO_LAYOUT.A_SUPPORT.x2,
    HOME_DEMO_LAYOUT.A_SUPPORT.y2
  );

  // B is split at x=85..95. The separate B key initially rests on A support.
  addHorizontal(b, 262, 267, [
    [0, 84],
    [96, 179]
  ]);
  addRect(
    b,
    HOME_DEMO_LAYOUT.B_SUPPORT.x1,
    HOME_DEMO_LAYOUT.B_SUPPORT.y1,
    HOME_DEMO_LAYOUT.B_SUPPORT.x2,
    HOME_DEMO_LAYOUT.B_SUPPORT.y2
  );

  // C is split at x=139..151. Its key rests on B support.
  addHorizontal(c, 280, 285, [
    [0, 138],
    [152, 179]
  ]);

  const aCells = toCells(a);
  const bCells = toCells(b);
  const cCells = toCells(c);

  const aParts = splitIntoParts(aCells, 4);
  const bParts = splitIntoParts(bCells, 3);
  const cParts = splitIntoParts(cCells, 3);

  const cKey = rectCells(HOME_DEMO_LAYOUT.C_KEY);
  const bKey = rectCells(HOME_DEMO_LAYOUT.B_KEY);
  const aKey = rectCells(HOME_DEMO_LAYOUT.A_GAP);

  const makeStep = (role, cells, kind, holdMs = 95) => ({
    role,
    cells,
    kind,
    holdMs,
    centerX: centerX(cells),
    bounds: boundsOf(cells)
  });

  return {
    structuralCells: {
      A: aCells,
      B: bCells,
      C: cCells
    },
    keyCells: {
      A: aKey,
      B: bKey,
      C: cKey
    },
    buildSteps: [
      ...cParts.map((cells) => makeStep('C', cells, 'structure')),
      ...bParts.map((cells) => makeStep('B', cells, 'structure')),
      makeStep('C', cKey, 'key'),
      ...aParts.map((cells) => makeStep('A', cells, 'structure')),
      makeStep('B', bKey, 'key')
    ],
    finalKeyStep: makeStep('A', aKey, 'trigger', 175)
  };
}

export function createSeededRandom(seed = 0x51a7cafe) {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function shuffleValues(values, random = Math.random) {
  const result = [...values];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function createHomeDemoPalette(random = Math.random) {
  const shuffled = shuffleValues(HOME_DEMO_ALL_COLORS, random);

  return {
    chainColors: shuffled.slice(0, 3),
    baseColors: shuffled.slice(3)
  };
}

export function roleColorMap(chainColors, random = Math.random) {
  const shuffled = shuffleValues(chainColors, random);

  return {
    A: shuffled[0],
    B: shuffled[1],
    C: shuffled[2]
  };
}

function permanentColorAt(x, y, baseColors) {
  const band = Math.floor((x + y * 0.37) / 18);
  const wave = Math.floor(2 * Math.sin(x * 0.11 + y * 0.037));
  const index =
    ((band + wave) % baseColors.length + baseColors.length) %
    baseColors.length;

  return baseColors[index];
}

function addPermanentCell(grid, simulation, x, y, baseColors, written) {
  if (x < 0 || y < 0 || x >= grid.width || y >= grid.height) return;
  if (!grid.empty(x, y)) return;

  grid.set(x, y, permanentColorAt(x, y, baseColors));
  simulation.lockCell(x, y);
  written.push({ x, y });
}

export function seedHomeDemoPermanentBase(
  grid,
  simulation,
  baseColors
) {
  const written = [];

  // Deep stable base.
  for (let y = 292; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      addPermanentCell(grid, simulation, x, y, baseColors, written);
    }
  }

  // Shelf directly below A. Leave open shafts for B and C keys.
  for (let y = 250; y <= 253; y++) {
    for (let x = 0; x < grid.width; x++) {
      const inBShaft = x >= 82 && x <= 98;
      const inCShaft = x >= 135 && x <= 155;
      if (inBShaft || inCShaft) continue;

      addPermanentCell(grid, simulation, x, y, baseColors, written);
    }
  }

  // Shelf directly below B. C needs to pass through this layer later.
  for (let y = 268; y <= 271; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (x >= 135 && x <= 155) continue;

      addPermanentCell(grid, simulation, x, y, baseColors, written);
    }
  }

  // C catch shelf; joins naturally into the deep base below.
  for (let y = 286; y <= 291; y++) {
    for (let x = 0; x < grid.width; x++) {
      addPermanentCell(grid, simulation, x, y, baseColors, written);
    }
  }

  // Narrow B funnel beneath A shelf.
  for (let y = 254; y <= 261; y++) {
    for (const x of [82, 83, 84, 96, 97, 98]) {
      addPermanentCell(grid, simulation, x, y, baseColors, written);
    }
  }

  // Narrow C funnel beneath B shelf.
  for (let y = 272; y <= 279; y++) {
    for (const x of [135, 136, 137, 138, 152, 153, 154, 155]) {
      addPermanentCell(grid, simulation, x, y, baseColors, written);
    }
  }

  return written;
}

export function placeLockedCells(
  grid,
  simulation,
  cells,
  color
) {
  let written = 0;

  for (const cell of cells) {
    if (!grid.empty(cell.x, cell.y)) continue;

    grid.set(cell.x, cell.y, color);
    simulation.lockCell(cell.x, cell.y);
    written += 1;
  }

  return written;
}

export function gridHash(grid) {
  let hash = 2166136261 >>> 0;

  for (let i = 0; i < grid.cells.length; i++) {
    hash ^= grid.cells[i] + (i & 255);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  return hash;
}

export function findSpanningComponent(connectivity, color) {
  const { grid } = connectivity;
  connectivity.visited.fill(0);

  for (let y = 0; y < grid.height; y++) {
    if (grid.get(0, y) !== color) continue;

    const startIndex = grid.index(0, y);
    if (connectivity.visited[startIndex]) continue;

    const component = connectivity.collectComponent(0, y, color);

    if (component.reachesRight) {
      return component;
    }
  }

  return null;
}

export class HomeDemoSimulation extends SandSimulation {
  constructor(grid, { random = createSeededRandom() } = {}) {
    super(grid);
    this.random = random;
    this.locked = new Uint8Array(grid.width * grid.height);
  }

  setRandom(random) {
    this.random = random;
  }

  clearLocks() {
    this.locked.fill(0);
  }

  lockCell(x, y) {
    if (x < 0 || y < 0 || x >= this.grid.width || y >= this.grid.height) {
      return;
    }

    this.locked[this.grid.index(x, y)] = 1;
  }

  unlockCell(x, y) {
    if (x < 0 || y < 0 || x >= this.grid.width || y >= this.grid.height) {
      return;
    }

    this.locked[this.grid.index(x, y)] = 0;
    this.sleepFrames[this.grid.index(x, y)] = 0;
  }

  lockCells(cells) {
    for (const cell of cells) this.lockCell(cell.x, cell.y);
  }

  unlockCells(cells) {
    for (const cell of cells) this.unlockCell(cell.x, cell.y);
  }

  unlockIndex(index) {
    if (index < 0 || index >= this.locked.length) return;
    this.locked[index] = 0;
    this.sleepFrames[index] = 0;
  }

  stepOnce() {
    const leftToRight = this.random() < 0.5;
    this.flip = leftToRight;

    if (this.fullUpdate) {
      this.updateArea(
        0,
        this.grid.width - 1,
        0,
        this.grid.height - 2,
        leftToRight
      );
      this.fullUpdate = false;
    } else if (!this.currentRegion.isEmpty()) {
      this.updateArea(
        this.currentRegion.minX,
        this.currentRegion.maxX,
        this.currentRegion.minY,
        this.currentRegion.maxY,
        leftToRight
      );
    } else {
      return false;
    }

    const finishedRegion = this.currentRegion;
    this.currentRegion = this.nextRegion;
    this.nextRegion = finishedRegion;
    this.nextRegion.clear();

    return true;
  }

  updateCell(x, y) {
    const value = this.grid.get(x, y);
    if (value <= 0) return;

    const index = this.grid.index(x, y);
    if (this.locked[index]) return;
    if (this.sleepFrames[index] > 8) return;

    this.velocity[index] = Math.min(
      this.velocity[index] + 0.15,
      1
    );

    if (this.grid.empty(x, y + 1)) {
      this.move(x, y, x, y + 1);
      return;
    }

    if (this.random() <= 0.35) {
      this.sleepFrames[index] = Math.min(
        255,
        this.sleepFrames[index] + 1
      );
      return;
    }

    const directions = this.random() < 0.5 ? [-1, 1] : [1, -1];

    for (const dir of directions) {
      if (!this.grid.empty(x + dir, y + 1)) continue;

      this.move(x, y, x + dir, y + 1);
      return;
    }

    this.sleepFrames[index] = Math.min(
      255,
      this.sleepFrames[index] + 1
    );
  }
}
