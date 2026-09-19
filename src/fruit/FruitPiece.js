import { CONFIG } from '../config.js';

export class FruitPiece {
  constructor({ template, color, grid, simulation }) {
    this.template = template;
    this.color = color;
    this.grid = grid;
    this.simulation = simulation;

    this.x = Math.floor((grid.width - template.width) / 2);
    this.y = 4;
    this.state = 'CONTROL';

    this.fallAccumulator = 0;
    this.fallStepMs = CONFIG.FRUIT_FALL_STEP_MS;

    this.impactTimer = 0;
    this.breakTimer = 0;
    this.dissolved = new Uint8Array(template.cells.length);
    this.dissolveOrder = this.buildDissolveOrder();
    this.dissolvedCount = 0;
  }

  setCenterX(centerX) {
    if (this.state !== 'CONTROL') return;

    const nextX = Math.round(centerX - this.template.width / 2);
    this.x = Math.max(
      0,
      Math.min(this.grid.width - this.template.width, nextX)
    );
  }

  release() {
    if (this.state === 'CONTROL') {
      this.state = 'FALLING';
    }
  }

  update(deltaMs) {
    if (this.state === 'FALLING') {
      return this.updateFalling(deltaMs);
    }

    if (this.state === 'IMPACT') {
      return this.updateImpact(deltaMs);
    }

    if (this.state === 'BREAKING') {
      return this.updateBreaking(deltaMs);
    }

    return this.state === 'SAND';
  }

  updateFalling(deltaMs) {
    this.fallAccumulator += deltaMs;

    while (this.fallAccumulator >= this.fallStepMs) {
      this.fallAccumulator -= this.fallStepMs;

      if (this.canMoveDown()) {
        this.y += 1;
        continue;
      }

      this.startImpact();
      break;
    }

    return false;
  }

  updateImpact(deltaMs) {
    this.impactTimer += deltaMs;

    if (this.impactTimer >= CONFIG.FRUIT_IMPACT_DURATION_MS) {
      const overflow = this.impactTimer - CONFIG.FRUIT_IMPACT_DURATION_MS;
      this.state = 'BREAKING';
      this.breakTimer = Math.max(0, overflow);
      this.dissolveToProgress(
        Math.min(1, this.breakTimer / CONFIG.FRUIT_BREAK_DURATION_MS)
      );
    }

    return false;
  }

  updateBreaking(deltaMs) {
    this.breakTimer += deltaMs;

    const progress = Math.min(
      1,
      this.breakTimer / CONFIG.FRUIT_BREAK_DURATION_MS
    );

    this.dissolveToProgress(progress);

    if (progress >= 1) {
      this.state = 'SAND';
      return true;
    }

    return false;
  }

  startImpact() {
    this.state = 'IMPACT';
    this.impactTimer = 0;

    this.simulation.activateRect(
      this.x - 2,
      this.y + this.template.height - 4,
      this.x + this.template.width + 2,
      this.y + this.template.height + 3
    );
  }

  canMoveDown() {
    for (const cell of this.template.cells) {
      const x = this.x + cell.x;
      const y = this.y + cell.y + 1;

      if (y >= this.grid.height) return false;
      if (y >= 0 && !this.grid.empty(x, y)) return false;
    }

    return true;
  }

  buildDissolveOrder() {
    const occupied = new Set(
      this.template.cells.map((cell) => `${cell.x},${cell.y}`)
    );

    const neighbors = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1]
    ];

    return this.template.cells
      .map((cell, index) => {
        const hash =
          ((cell.x * 73856093) ^
            (cell.y * 19349663) ^
            ((index + 1) * 83492791)) >>> 0;

        const noise = (hash % 10000) / 10000;

        let exposedSides = 0;

        for (const [dx, dy] of neighbors) {
          if (!occupied.has(`${cell.x + dx},${cell.y + dy}`)) {
            exposedSides++;
          }
        }

        const edgeBias = exposedSides / 4;
        const bottomBias = cell.y / Math.max(1, this.template.height - 1);

        // Randomized crumble is intentionally dominant so the fruit breaks
        // across many rows at once instead of peeling away in horizontal layers.
        const score =
          noise * 0.72 +
          edgeBias * 0.20 +
          bottomBias * 0.08;

        return { index, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.index);
  }

  dissolveToProgress(progress) {
    const targetCount = Math.min(
      this.template.cells.length,
      Math.ceil(this.template.cells.length * progress)
    );

    let wroteAny = false;

    while (this.dissolvedCount < targetCount) {
      const cellIndex = this.dissolveOrder[this.dissolvedCount];
      this.dissolvedCount++;

      if (this.dissolved[cellIndex]) continue;

      const cell = this.template.cells[cellIndex];
      const x = this.x + cell.x;
      const y = this.y + cell.y;

      this.dissolved[cellIndex] = 1;

      if (
        x >= 0 &&
        x < this.grid.width &&
        y >= 0 &&
        y < this.grid.height &&
        this.grid.empty(x, y)
      ) {
        this.grid.set(x, y, this.color);
        wroteAny = true;
      }
    }

    if (wroteAny) {
      this.simulation.activateRect(
        this.x - 3,
        this.y - 2,
        this.x + this.template.width + 3,
        this.y + this.template.height + 5
      );
    }
  }

  isCellDissolved(index) {
    return this.dissolved[index] === 1;
  }

  getImpactProgress() {
    if (this.state !== 'IMPACT') return 0;

    return Math.min(
      1,
      this.impactTimer / CONFIG.FRUIT_IMPACT_DURATION_MS
    );
  }

  getBreakProgress() {
    if (this.state !== 'BREAKING') {
      return this.state === 'SAND' ? 1 : 0;
    }

    return Math.min(
      1,
      this.breakTimer / CONFIG.FRUIT_BREAK_DURATION_MS
    );
  }
}
