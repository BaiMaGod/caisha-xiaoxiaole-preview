export class DirtyRegion {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.clear();
  }

  mark(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;

    this.minX = Math.min(this.minX, x);
    this.maxX = Math.max(this.maxX, x);
    this.minY = Math.min(this.minY, y);
    this.maxY = Math.max(this.maxY, y);
  }

  expand(x, y, radius = 1) {
    const minX = Math.max(0, x - radius);
    const minY = Math.max(0, y - radius);
    const maxX = Math.min(this.width - 1, x + radius);
    const maxY = Math.min(this.height - 1, y + radius);

    this.mark(minX, minY);
    this.mark(maxX, maxY);
  }

  clear() {
    this.minX = this.width;
    this.minY = this.height;
    this.maxX = -1;
    this.maxY = -1;
  }

  isEmpty() {
    return this.maxX < 0;
  }
}
