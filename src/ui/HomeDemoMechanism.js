import { CONFIG } from '../config.js';
import { SandSimulation } from '../SandSimulation.js';

export const HOME_DEMO_CHAIN_ROLES = ['A', 'B', 'C'];
export const HOME_DEMO_ALL_COLORS = [1, 2, 3, 4, 5, 6, 7];

export const HOME_DEMO_LAYOUT = Object.freeze({
  A_GAP: { x1: 29, y1: 244, x2: 42, y2: 252 },
  B_GAP: { x1: 90, y1: 260, x2: 96, y2: 270 },
  C_GAP: { x1: 144, y1: 276, x2: 152, y2: 288 },

  B_KEY: { x1: 84, y1: 209, x2: 102, y2: 220 },
  C_KEY: { x1: 137, y1: 211, x2: 158, y2: 223 },

  A_SUPPORT: { x1: 84, y1: 221, x2: 102, y2: 246 },
  B_SUPPORT: { x1: 137, y1: 224, x2: 158, y2: 264 },

  B_SHAFT: { x1: 84, y1: 246, x2: 102, y2: 271 },
  C_SHAFT: { x1: 137, y1: 262, x2: 158, y2: 289 }
});

function addRect(target, x1, y1, x2, y2) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      target.add(x + ',' + y);
    }
  }
}

function addTaperedColumn(target, rect, seed = 1) {
  const cx = (rect.x1 + rect.x2) / 2;
  const height = Math.max(1, rect.y2 - rect.y1);

  for (let y = rect.y1; y <= rect.y2; y++) {
    const t = (y - rect.y1) / height;
    const hash =
      ((Math.round(cx) * 73856093) ^
        (y * 19349663) ^
        (seed * 83492791)) >>> 0;
    const jitter = (hash % 3) - 1;
    const halfWidth = Math.max(
      2,
      Math.round(2.5 + t * 2.2 + jitter * 0.45)
    );

    for (let x = Math.round(cx) - halfWidth; x <= Math.round(cx) + halfWidth; x++) {
      target.add(x + ',' + y);
    }
  }
}

function addCurvedBridge(
  target,
  { x1, x2, topY, bottomY, thickness = 4, phase = 0 }
) {
  const cx = (x1 + x2) / 2;
  const radius = Math.max(1, (x2 - x1) / 2);

  for (let x = x1; x <= x2; x++) {
    const edge = Math.min(1, Math.abs(x - cx) / radius);
    const curve = Math.pow(edge, 1.55);
    const wave = Math.round(Math.sin(x * 0.31 + phase) * 0.8);
    const y0 = Math.round(
      topY + (bottomY - topY) * curve + wave
    );

    for (let y = y0; y < y0 + thickness; y++) {
      target.add(x + ',' + y);
    }
  }
}

function gapRibbonCells(rect, phase = 0) {
  const set = new Set();
  const centerY = Math.round((rect.y1 + rect.y2) / 2);

  for (let x = rect.x1; x <= rect.x2; x++) {
    const wave =
      Math.round(Math.sin(x * 0.42 + phase) * 1.2);
    const y0 = centerY - 2 + wave;

    for (let y = y0; y <= y0 + 4; y++) {
      set.add(x + ',' + y);
    }
  }

  return toCells(set);
}


function addRibbon(target, {
  x1,
  x2,
  baseY,
  thickness = 5,
  gap = null,
  phase = 0
}) {
  for (let x = x1; x <= x2; x++) {
    if (gap && x >= gap.x1 && x <= gap.x2) continue;

    const wave =
      Math.round(Math.sin(x * 0.095 + phase) * 2.2) +
      Math.round(Math.sin(x * 0.031 + phase * 1.7) * 1.4);
    const y0 = baseY + wave;

    for (let y = y0; y < y0 + thickness; y++) {
      target.add(x + ',' + y);
    }
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

function moundCells(rect, seed = 1) {
  const set = new Set();
  const cx = (rect.x1 + rect.x2) / 2;
  const width = rect.x2 - rect.x1 + 1;
  const height = rect.y2 - rect.y1 + 1;

  for (let y = rect.y1; y <= rect.y2; y++) {
    const t = (y - rect.y1) / Math.max(1, height - 1);
    const halfWidth = Math.max(
      2,
      Math.round((width * (0.24 + t * 0.28)))
    );

    for (let x = rect.x1; x <= rect.x2; x++) {
      const hash =
        ((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) >>> 0;
      const edgeJitter = ((hash % 3) - 1);
      const localHalf = halfWidth + edgeJitter;

      if (Math.abs(x - cx) <= localHalf) {
        set.add(x + ',' + y);
      }
    }
  }

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
  if (!cells.length) return Math.floor(CONFIG.WIDTH / 2);

  const total = cells.reduce((sum, cell) => sum + cell.x, 0);
  return Math.round(total / cells.length);
}

function boundsOf(cells) {
  let minX = CONFIG.WIDTH;
  let minY = CONFIG.HEIGHT;
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

  // A: shallow wavy band with one real key gap. It also owns the support
  // column that keeps B's key suspended until A clears.
  addRibbon(a, {
    x1: 0,
    x2: 179,
    baseY: 246,
    thickness: 5,
    gap: HOME_DEMO_LAYOUT.A_GAP,
    phase: 0.4
  });

  addTaperedColumn(
    a,
    HOME_DEMO_LAYOUT.A_SUPPORT,
    11
  );

  // B support for C cuts through A's band. Route A around it with a small
  // natural-looking arch instead of leaving a second accidental A gap.
  for (let x = 132; x <= 163; x++) {
    for (let y = 238; y <= 255; y++) {
      a.delete(x + ',' + y);
    }
  }
  addCurvedBridge(a, {
    x1: 128,
    x2: 167,
    topY: 198,
    bottomY: 245,
    thickness: 4,
    phase: 0.6
  });

  // B: deeper wavy receiver with its own center gap plus a support branch
  // that holds C's key.
  addRibbon(b, {
    x1: 0,
    x2: 179,
    baseY: 263,
    thickness: 5,
    gap: HOME_DEMO_LAYOUT.B_GAP,
    phase: 1.7
  });

  addTaperedColumn(
    b,
    HOME_DEMO_LAYOUT.B_SUPPORT,
    23
  );

  // Downward shoulders follow the natural shape of a settled sand mound.
  // They remain separated until the falling B key fills the center.
  addRect(b, 88, 266, 89, 269);
  addRect(b, 97, 266, 98, 269);

  // C: lowest receiver. It intentionally sits just above the permanent
  // natural base and has a wider gap so its falling key visibly pours in.
  addRibbon(c, {
    x1: 0,
    x2: 179,
    baseY: 281,
    thickness: 5,
    gap: HOME_DEMO_LAYOUT.C_GAP,
    phase: 2.8
  });

  // C receiver also narrows into two low shoulders. The released C mound
  // reaches these shoulders only after B support disappears.
  addRect(c, 142, 285, 143, 288);
  addRect(c, 153, 285, 154, 288);

  const aCells = toCells(a);
  const bCells = toCells(b);
  const cCells = toCells(c);

  const aParts = splitIntoParts(aCells, 4);
  const bParts = splitIntoParts(bCells, 3);
  const cParts = splitIntoParts(cCells, 3);

  const cKey = moundCells(HOME_DEMO_LAYOUT.C_KEY, 31);
  const bKey = moundCells(HOME_DEMO_LAYOUT.B_KEY, 17);
  const aKey = gapRibbonCells(HOME_DEMO_LAYOUT.A_GAP, 0.9);

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
    finalKeyStep: makeStep('A', aKey, 'trigger', 180)
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
  const patch =
    Math.floor(
      (
        x +
        y * 0.31 +
        Math.sin(x * 0.073 + y * 0.021) * 18 +
        Math.sin(x * 0.019 - y * 0.047) * 13
      ) / 24
    );

  const index =
    ((patch % baseColors.length) + baseColors.length) %
    baseColors.length;

  return baseColors[index];
}

function naturalSurfaceY(x) {
  const broad = Math.sin(x * 0.047 + 0.5) * 5.5;
  const medium = Math.sin(x * 0.11 + 2.1) * 3.6;
  const fine = Math.sin(x * 0.23 + 0.9) * 1.8;

  const leftHill = 8 * Math.exp(-((x - 38) ** 2) / 900);
  const rightHill = 10 * Math.exp(-((x - 142) ** 2) / 760);
  const centerDip = -6 * Math.exp(-((x - 91) ** 2) / 520);

  return Math.max(
    292,
    Math.min(
      306,
      Math.round(
        302 - broad - medium - fine - leftHill - rightHill - centerDip
      )
    )
  );
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

  // One contiguous irregular sand hill. No horizontal shelves or white
  // stripes: the surface itself is a multi-frequency height field.
  for (let x = 0; x < grid.width; x++) {
    const surface = naturalSurfaceY(x);

    for (let y = surface; y < grid.height; y++) {
      addPermanentCell(
        grid,
        simulation,
        x,
        y,
        baseColors,
        written
      );
    }
  }

  // Local B pedestal: catches B key, ends before the C receiver.
  for (let y = 270; y <= 279; y++) {
    for (let x = 91; x <= 95; x++) {
      addPermanentCell(
        grid,
        simulation,
        x,
        y,
        baseColors,
        written
      );
    }
  }

  // Local C pedestal merges into the natural base below.
  for (let y = 289; y < grid.height; y++) {
    for (let x = 146; x <= 150; x++) {
      addPermanentCell(
        grid,
        simulation,
        x,
        y,
        baseColors,
        written
      );
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
  let satisfied = 0;

  for (const cell of cells) {
    const current = grid.get(cell.x, cell.y);

    if (current === 0) {
      grid.set(cell.x, cell.y, color);
      simulation.lockCell(cell.x, cell.y);
      satisfied += 1;
      continue;
    }

    if (current === color) {
      simulation.lockCell(cell.x, cell.y);
      satisfied += 1;
    }
  }

  return satisfied;
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
    if (
      x < 0 ||
      y < 0 ||
      x >= this.grid.width ||
      y >= this.grid.height
    ) {
      return;
    }

    this.locked[this.grid.index(x, y)] = 1;
  }

  unlockCell(x, y) {
    if (
      x < 0 ||
      y < 0 ||
      x >= this.grid.width ||
      y >= this.grid.height
    ) {
      return;
    }

    const index = this.grid.index(x, y);
    this.locked[index] = 0;
    this.sleepFrames[index] = 0;
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
    if (this.sleepFrames[index] > CONFIG.SLEEP_THRESHOLD) return;

    this.velocity[index] = Math.min(
      this.velocity[index] + CONFIG.GRAVITY,
      CONFIG.MAX_VELOCITY
    );

    if (this.grid.empty(x, y + 1)) {
      this.move(x, y, x, y + 1);
      return;
    }

    if (this.random() <= CONFIG.FRICTION) {
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
