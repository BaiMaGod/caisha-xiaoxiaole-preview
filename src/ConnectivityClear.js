export class ConnectivityClear {
  constructor(grid, simulation) {
    this.grid = grid;
    this.simulation = simulation;
    this.score = 0;
    this.combo = 0;
    this.visited = new Uint8Array(grid.width * grid.height);
    this.queue = new Int32Array(grid.width * grid.height);
    this.onBeforeClear = null;
    this.onClear = null;
  }

  resolve({ maxGroups = Infinity } = {}) {
    let totalCleared = 0;
    const groups = [];
    const groupLimit = Number.isFinite(maxGroups)
      ? Math.max(1, Math.floor(maxGroups))
      : Infinity;

    // First collect spanning components without mutating the grid.
    // Normal gameplay keeps the default unlimited behavior. The scripted home
    // demo can request one group at a time so each settled cascade stage gets
    // its own clear animation instead of merging multiple colors together.
    search:
    for (let color = 1; color <= 7; color++) {
      this.visited.fill(0);

      for (let y = 0; y < this.grid.height; y++) {
        if (this.grid.get(0, y) !== color) continue;

        const startIndex = this.grid.index(0, y);
        if (this.visited[startIndex]) continue;

        const component = this.collectComponent(0, y, color);
        if (!component.reachesRight) continue;

        const cells = component.cells.slice();

        if (cells.length > 0) {
          totalCleared += cells.length;
          groups.push({ color, cells });

          if (groups.length >= groupLimit) {
            break search;
          }
        }
      }
    }

    if (totalCleared <= 0) {
      return 0;
    }

    // Called while every target grain still exists in SandGrid.
    this.onBeforeClear?.({
      cleared: totalCleared,
      groups
    });

    let actualCleared = 0;

    for (const group of groups) {
      actualCleared += this.clearComponent(group.cells);
    }

    if (actualCleared > 0) {
      this.score += actualCleared;
      this.combo += 1;
      this.onClear?.({
        cleared: actualCleared,
        score: this.score,
        combo: this.combo,
        groups
      });
    }

    return actualCleared;
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
      if (x === this.grid.width - 1) reachesRight = true;

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (
          nx < 0 ||
          ny < 0 ||
          nx >= this.grid.width ||
          ny >= this.grid.height
        ) continue;

        if (this.grid.get(nx, ny) !== color) continue;

        const nextIndex = this.grid.index(nx, ny);
        if (this.visited[nextIndex]) continue;

        this.visited[nextIndex] = 1;
        this.queue[tail++] = nextIndex;
      }
    }

    return { cells, reachesRight };
  }

  clearComponent(cells) {
    if (cells.length === 0) return 0;

    let minX = this.grid.width;
    let maxX = 0;
    let maxY = 0;

    for (const index of cells) {
      const x = index % this.grid.width;
      const y = Math.floor(index / this.grid.width);

      this.grid.set(x, y, 0);
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
