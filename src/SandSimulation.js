import { CONFIG } from './config.js';
import { DirtyRegion } from './DirtyRegion.js';
import { ChunkManager } from './ChunkManager.js';

export class SandSimulation {
  constructor(grid, { random = Math.random } = {}) {
    this.grid = grid;
    this.random = random;
    this.flip = false;
    this.movedCount = 0;

    this.sleepFrames = new Uint8Array(grid.width * grid.height);
    this.velocity = new Float32Array(grid.width * grid.height);

    this.currentRegion = new DirtyRegion(grid.width, grid.height);
    this.nextRegion = new DirtyRegion(grid.width, grid.height);
    this.chunkManager = new ChunkManager();

    this.fullUpdate = true;
  }

  setRandom(random = Math.random) {
    this.random = random;
  }

  update(afterSubstep = null) {
    this.movedCount = 0;

    const substeps = Math.max(1, CONFIG.SAND_SUBSTEPS || 1);

    for (let i = 0; i < substeps; i++) {
      if (!this.stepOnce()) break;

      if (afterSubstep?.(i) === false) {
        break;
      }
    }
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

  updateArea(minX, maxX, minY, maxY, leftToRight) {
    minX = Math.max(0, minX);
    maxX = Math.min(this.grid.width - 1, maxX);
    minY = Math.max(0, minY);
    maxY = Math.min(this.grid.height - 2, maxY);

    for (let y = maxY; y >= minY; y--) {
      if (leftToRight) {
        for (let x = minX; x <= maxX; x++) {
          this.updateCell(x, y);
        }
      } else {
        for (let x = maxX; x >= minX; x--) {
          this.updateCell(x, y);
        }
      }
    }
  }

  updateCell(x, y) {
    const value = this.grid.get(x, y);
    if (value <= 0) return;

    const index = this.grid.index(x, y);
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
      this.sleepFrames[index] = Math.min(255, this.sleepFrames[index] + 1);
      return;
    }

    const directions = this.random() < 0.5 ? [-1, 1] : [1, -1];

    for (const dir of directions) {
      if (!this.grid.empty(x + dir, y + 1)) continue;

      this.move(x, y, x + dir, y + 1);
      return;
    }

    this.sleepFrames[index] = Math.min(255, this.sleepFrames[index] + 1);
  }

  move(x1, y1, x2, y2) {
    const sourceIndex = this.grid.index(x1, y1);
    const targetIndex = this.grid.index(x2, y2);
    const value = this.grid.get(x1, y1);
    const sourceVelocity = this.velocity[sourceIndex];

    this.grid.set(x1, y1, 0);
    this.grid.set(x2, y2, value);

    this.velocity[sourceIndex] = 0;
    this.velocity[targetIndex] = sourceVelocity * 0.82;

    this.wakeAround(x1, y1, 2);
    this.wakeAround(x2, y2, 2);

    this.nextRegion.expand(x1, y1, 3);
    this.nextRegion.expand(x2, y2, 3);

    this.chunkManager.markPosition(x2, y2);
    this.movedCount++;
  }

  wakeAround(x, y, radius = 2) {
    const minX = Math.max(0, x - radius);
    const maxX = Math.min(this.grid.width - 1, x + radius);
    const minY = Math.max(0, y - radius);
    const maxY = Math.min(this.grid.height - 1, y + radius);

    for (let yy = minY; yy <= maxY; yy++) {
      for (let xx = minX; xx <= maxX; xx++) {
        this.sleepFrames[this.grid.index(xx, yy)] = 0;
      }
    }
  }

  activateRect(minX, minY, maxX, maxY) {
    minX = Math.max(0, Math.floor(minX));
    minY = Math.max(0, Math.floor(minY));
    maxX = Math.min(this.grid.width - 1, Math.ceil(maxX));
    maxY = Math.min(this.grid.height - 1, Math.ceil(maxY));

    this.currentRegion.mark(minX, minY);
    this.currentRegion.mark(maxX, maxY);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        this.sleepFrames[this.grid.index(x, y)] = 0;
      }
    }
  }

  reset() {
    this.flip = false;
    this.movedCount = 0;
    this.sleepFrames.fill(0);
    this.velocity.fill(0);

    this.currentRegion.clear();
    this.nextRegion.clear();

    this.chunkManager.clear();
    this.chunkManager.markAll();

    this.fullUpdate = true;
  }
}
