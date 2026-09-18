import { CONFIG } from './config.js';

export class ChunkManager {
  constructor() {
    this.chunkSize = 10;
    this.cols = Math.ceil(CONFIG.WIDTH / this.chunkSize);
    this.rows = Math.ceil(CONFIG.HEIGHT / this.chunkSize);

    this.active = new Uint8Array(this.cols * this.rows);
    this.markAll();
  }

  index(cx, cy) {
    return cy * this.cols + cx;
  }

  mark(cx, cy) {
    if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) return;
    this.active[this.index(cx, cy)] = 1;
  }

  markPosition(x, y) {
    this.mark(
      Math.floor(x / this.chunkSize),
      Math.floor(y / this.chunkSize)
    );
  }

  markAll() {
    this.active.fill(1);
  }

  clear() {
    this.active.fill(0);
  }

  getActiveChunks() {
    const result = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.active[this.index(x, y)]) {
          result.push({ x, y });
        }
      }
    }

    return result;
  }
}
