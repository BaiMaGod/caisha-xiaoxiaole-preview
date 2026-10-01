import { SandGrid } from './SandGrid.js';
import { SandSimulation } from './SandSimulation.js';
import { ConnectivityClear } from './ConnectivityClear.js';
import { FruitTemplate } from './fruit/FruitTemplate.js';
import { FruitPiece } from './fruit/FruitPiece.js';
import { APPLE_TEMPLATE } from './fruit/templates/apple.js';
import { BANANA_TEMPLATE } from './fruit/templates/banana.js';
import { HEART_TEMPLATE } from './fruit/templates/heart.js';
import { STAR_TEMPLATE } from './fruit/templates/star.js';
import { CLOVER_TEMPLATE } from './fruit/templates/clover.js';
import { SWORD_TEMPLATE } from './fruit/templates/sword.js';

export const FIRST_DROP_GUIDE_COLORS = Object.freeze([1, 3, 4, 6, 7]);

const PILE_TEMPLATES = Object.freeze([
  APPLE_TEMPLATE,
  BANANA_TEMPLATE,
  HEART_TEMPLATE,
  STAR_TEMPLATE,
  CLOVER_TEMPLATE
]);

const FIRST_PIECE_TEMPLATES = Object.freeze([
  BANANA_TEMPLATE,
  SWORD_TEMPLATE,
  HEART_TEMPLATE,
  APPLE_TEMPLATE,
  CLOVER_TEMPLATE,
  STAR_TEMPLATE
]);

const INNER_CENTER_CANDIDATES = Object.freeze([58, 60, 56, 62, 54, 64, 52]);
const SETTLE_STABLE_TICKS = 5;
const MAX_SETTLE_TICKS = 420;
const MAX_FRUIT_TICKS = 1400;

function clampRandomSample(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(0.999999999, value));
}

function createSeededRandom(seed) {
  let state = (seed >>> 0) || 0x6d2b79f5;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function nextSeed(random) {
  return (
    Math.floor(clampRandomSample(random()) * 0xffffffff) ^ 0xa5a5a5a5
  ) >>> 0;
}

function shuffle(items, random) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function isFullySettled(simulation) {
  const currentEmpty =
    !simulation.currentRegion || simulation.currentRegion.isEmpty();
  const nextEmpty =
    !simulation.nextRegion || simulation.nextRegion.isEmpty();

  return (
    simulation.movedCount === 0 &&
    !simulation.fullUpdate &&
    currentEmpty &&
    nextEmpty
  );
}

function settleSimulation(simulation) {
  let stableTicks = 0;

  for (let tick = 0; tick < MAX_SETTLE_TICKS; tick++) {
    simulation.update();

    if (isFullySettled(simulation)) {
      stableTicks += 1;
      if (stableTicks >= SETTLE_STABLE_TICKS) return true;
    } else {
      stableTicks = 0;
    }
  }

  return false;
}

function simulateFruitDrop({ grid, simulation, definition, color, centerX }) {
  const fruit = new FruitPiece({
    template: new FruitTemplate(definition),
    color,
    grid,
    simulation
  });

  fruit.setCenterX(centerX);
  fruit.release();

  let tick = 0;

  while (fruit.state !== 'SAND' && tick++ < MAX_FRUIT_TICKS) {
    fruit.update(50);
    simulation.update();
  }

  if (fruit.state !== 'SAND') return false;

  return settleSimulation(simulation);
}

function cloneGrid(source) {
  const clone = new SandGrid();
  clone.cells.set(source.cells);
  clone.revision += 1;
  return clone;
}

function countSpanningClear(source) {
  const clone = cloneGrid(source);
  const simulation = new SandSimulation(clone);
  const clear = new ConnectivityClear(clone, simulation);
  return clear.resolve();
}

function findCenterFloorGap(grid) {
  const center = Math.floor(grid.width / 2);

  if (!grid.empty(center, grid.height - 1)) return null;

  let left = center;
  let right = center;

  while (left > 0 && grid.empty(left - 1, grid.height - 1)) {
    left -= 1;
  }

  while (
    right < grid.width - 1 &&
    grid.empty(right + 1, grid.height - 1)
  ) {
    right += 1;
  }

  return {
    left,
    right,
    centerX: (left + right) / 2,
    width: right - left + 1
  };
}

function buildNaturalPiles({ width, color, seed, innerCenter }) {
  const grid = new SandGrid();
  const random = createSeededRandom(seed);
  const simulation = new SandSimulation(grid, { random });
  const shuffled = shuffle(PILE_TEMPLATES, random);

  const leftCenters = [
    18,
    45 + Math.round((random() - 0.5) * 6),
    innerCenter + Math.round((random() - 0.5) * 4)
  ];
  const rightCenters = [
    width - 18,
    width - 45 + Math.round((random() - 0.5) * 6),
    width - innerCenter + Math.round((random() - 0.5) * 4)
  ];

  const drops = [
    { definition: shuffled[0], centerX: leftCenters[0] },
    { definition: shuffled[1], centerX: rightCenters[0] },
    { definition: shuffled[2], centerX: leftCenters[1] },
    { definition: shuffled[3], centerX: rightCenters[1] },
    { definition: shuffled[4], centerX: leftCenters[2] },
    { definition: shuffled[0], centerX: rightCenters[2] }
  ];

  for (const drop of drops) {
    if (
      !simulateFruitDrop({
        grid,
        simulation,
        definition: drop.definition,
        color,
        centerX: drop.centerX
      })
    ) {
      return null;
    }
  }

  if (!settleSimulation(simulation)) return null;

  return { grid, drops: drops.length };
}

function verifyFirstPiece({ baseGrid, color, definition, centerX, seed }) {
  const testGrid = cloneGrid(baseGrid);
  const simulation = new SandSimulation(testGrid, {
    random: createSeededRandom(seed)
  });

  simulation.reset();
  settleSimulation(simulation);

  if (
    !simulateFruitDrop({
      grid: testGrid,
      simulation,
      definition,
      color,
      centerX
    })
  ) {
    return 0;
  }

  const clear = new ConnectivityClear(testGrid, simulation);
  return clear.resolve();
}

function chooseVerifiedFirstPiece({ grid, color, gap, seed }) {
  const random = createSeededRandom(seed);
  const definitions = shuffle(FIRST_PIECE_TEMPLATES, random);
  const offsets = shuffle([0, -4, 4, -8, 8], random);

  for (const definition of definitions) {
    for (const offset of offsets) {
      const centerX = Math.max(
        definition.width / 2,
        Math.min(
          grid.width - definition.width / 2,
          gap.centerX + offset
        )
      );

      const cleared = verifyFirstPiece({
        baseGrid: grid,
        color,
        definition,
        centerX,
        seed:
          seed ^
          definition.width ^
          Math.round(centerX * 31)
      });

      if (cleared > 0) {
        return {
          templateId: definition.id,
          centerX,
          verifiedClearCount: cleared
        };
      }
    }
  }

  return null;
}

function copyGrid(source, target) {
  target.cells.set(source.cells);
  target.revision += 1;
}

export function buildFirstDropGuide(grid, { random = Math.random } = {}) {
  const baseSeed = nextSeed(random);
  const colorRandom = createSeededRandom(baseSeed ^ 0x13579bdf);
  const color =
    FIRST_DROP_GUIDE_COLORS[
      Math.floor(colorRandom() * FIRST_DROP_GUIDE_COLORS.length)
    ];

  const diagnostics = [];

  for (
    let attempt = 0;
    attempt < INNER_CENTER_CANDIDATES.length;
    attempt++
  ) {
    const innerCenter = INNER_CENTER_CANDIDATES[attempt];
    const built = buildNaturalPiles({
      width: grid.width,
      color,
      seed: baseSeed ^ ((attempt + 1) * 0x9e3779b9),
      innerCenter
    });

    if (!built) {
      diagnostics.push({ attempt, reason: 'build-failed' });
      continue;
    }

    // The hidden pre-simulation must never clear before the player acts.
    if (countSpanningClear(built.grid) > 0) {
      diagnostics.push({ attempt, reason: 'already-spanning' });
      continue;
    }

    const gap = findCenterFloorGap(built.grid);

    if (!gap || gap.width < 6 || gap.width > 54) {
      diagnostics.push({
        attempt,
        reason: 'bad-gap',
        gapWidth: gap?.width ?? null
      });
      continue;
    }

    const firstPiece = chooseVerifiedFirstPiece({
      grid: built.grid,
      color,
      gap,
      seed: baseSeed ^ ((attempt + 11) * 0x85ebca6b)
    });

    if (!firstPiece) {
      diagnostics.push({
        attempt,
        reason: 'no-verified-first-piece',
        gapWidth: gap.width
      });
      continue;
    }

    copyGrid(built.grid, grid);

    return {
      color,
      centerX: firstPiece.centerX,
      gapLeft: gap.left,
      gapRight: gap.right,
      templateId: firstPiece.templateId,
      preSimulatedDrops: built.drops,
      verifiedClearCount: firstPiece.verifiedClearCount
    };
  }

  throw new Error(
    `Unable to build a verified natural first-drop guide: ${JSON.stringify(diagnostics)}`
  );
}
