import { SandGrid } from '../SandGrid.js';
import { buildFirstDropGuide } from '../FirstDropGuide.js';
import { countSand } from './ModeLogic.js';

export const PROTOTYPE_LEVEL_COUNT = 3;
const cache = new Map();

// Every initial mound is made by actual FruitPiece drops and SandSimulation
// settlement in buildFirstDropGuide. Each opening is checked for a legal
// left-to-right clear. We ship three playable validation levels first.
export function getPrototypeLevel(level) {
  const id = Math.floor(Number(level));
  if (!Number.isInteger(id) || id < 1 || id > PROTOTYPE_LEVEL_COUNT) {
    throw new RangeError('Level not available');
  }
  if (!cache.has(id)) {
    const grid = new SandGrid();
    const random = () => (0.17 + id * 0.213) % 1;
    const guide = buildFirstDropGuide(grid, { random });
    cache.set(id, {
      id,
      name: ['彩虹初遇', '双坡搭桥', '流沙连通'][id - 1],
      cells: grid.cells.slice(),
      guide,
      initialSand: countSand(grid),
      referenceDrops: 1
    });
  }
  const levelData = cache.get(id);
  return { ...levelData, cells: levelData.cells.slice() };
}
