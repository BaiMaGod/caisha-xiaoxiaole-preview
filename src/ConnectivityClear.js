export class ConnectivityClear {
  constructor(grid, simulation) {
    this.grid = grid;
    this.simulation = simulation;
    this.score = 0;
    this.combo = 0;

    this.visited = new Uint8Array(grid.width * grid.height);
    this.queue = new Int32Array(grid.width * grid.height);

    this.onClear = null;
  }

  resolve() {
    let totalCleared = 0;

    for (let color = 1; color <= 7; color++) {
      this.visited.fill(0);

      for (let y = 0; y < this.grid.height; y++) {
        if (this.grid.get(0, y) !== color) continue;

        const startIndex = this.grid.index(0, y);
        if (this.visited[startIndex]) continue;

        const component = this.collectComponent(0, y, color);

        if (!component.reachesRight) continue;

        totalCleared += this.clearComponent(component.cells);
      }
    }

    if (totalCleared > 0) {
      this.score += totalCleared;
      this.combo += 1;

      this.onClear?.({
        cleared: totalCleared,
        score: this.score,
        combo: this.combo
      });
    }

    return totalCleared;
  }

  collectComponent(startX, startY, color) {
    let head = 0;
    let tail = 0;
    let reachesRight = false;

    const cells = [];

    const startIndex = this.grid.index(startX, startY);
    this.visited[startIndex] = 1;
    this.queue[tail++] = startIndex;

    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1,  0],           [1,  0],
      [-1,  1], [0,  1], [1,  1]
    ];

    while (head < tail) {
      const index = this.queue[head++];
      const x = index % this.grid.width;
      const y = Math.floor(index / this.grid.width);

      cells.push(index);

      if (x === this.grid.width - 1) {
        reachesRight = true;
      }

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (
          nx < 0 ||
          ny < 0 ||
          nx >= this.grid.width ||
          ny >= this.grid.height
        ) {
          continue;
        }

        if (this.grid.get(nx, ny) !== color) continue;

        const nextIndex = this.grid.index(nx, ny);
        if (this.visited[nextIndex]) continue;

        this.visited[nextIndex] = 1;
        this.queue[tail++] = nextIndex;
      }
    }

    return {
      cells,
      reachesRight
    };
  }

  clearComponent(cells) {
    if (cells.length === 0) return 0;

    let minX = this.grid.width;
    let maxX = 0;
    let maxY = 0;

    for (const index of cells) {
      const x = index % this.grid.width;
      const y = Math.floor(index / this.grid.width);

      this.grid.cells[index] = 0;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    this.simulation.activateRect(
      Math.max(0, minX - 2),
      0,
      Math.min(this.grid.width - 1, maxX + 2),
      Math.min(this.grid.height - 1, maxY + 4)
    );

    return cells.length;
  }

  resetCombo() {
    this.combo = 0;
  }

  reset() {
    this.score = 0;
    this.combo = 0;
    this.visited.fill(0);
    this.queue.fill(0);
  }
}
