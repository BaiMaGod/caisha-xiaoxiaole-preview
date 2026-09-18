import { CONFIG } from './config.js';

export class SandGrid {
  constructor() {
    this.width = CONFIG.WIDTH;
    this.height = CONFIG.HEIGHT;
    this.cells = new Uint8Array(this.width * this.height);
  }

  index(x, y) {
    return y * this.width + x;
  }

  get(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return -1;
    return this.cells[this.index(x, y)];
  }

  set(x, y, value) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.cells[this.index(x, y)] = value;
  }

  empty(x, y) {
    return this.get(x, y) === 0;
  }

  clear() {
    this.cells.fill(0);
  }
}
