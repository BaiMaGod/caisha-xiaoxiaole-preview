import { FruitTemplate } from './FruitTemplate.js';
import { FruitPiece } from './FruitPiece.js';
import { APPLE_TEMPLATE } from './templates/apple.js';
import { BANANA_TEMPLATE } from './templates/banana.js';

export class FruitManager {
  constructor(grid, simulation) {
    this.grid = grid;
    this.simulation = simulation;

    this.templates = [
      new FruitTemplate(APPLE_TEMPLATE),
      new FruitTemplate(BANANA_TEMPLATE)
    ];

    this.current = null;
    this.spawnDelayMs = 350;
    this.spawnTimer = 0;
    this.enabled = true;

    this.spawnRandomFruit();
  }

  spawnRandomFruit() {
    if (!this.enabled) return;

    const template =
      this.templates[Math.floor(Math.random() * this.templates.length)];

    this.current = new FruitPiece({
      template,
      color: 1 + Math.floor(Math.random() * 7),
      grid: this.grid,
      simulation: this.simulation
    });
  }

  update(deltaMs) {
    if (!this.enabled) return;

    if (!this.current) {
      this.spawnTimer += deltaMs;

      if (this.spawnTimer >= this.spawnDelayMs) {
        this.spawnTimer = 0;
        this.spawnRandomFruit();
      }

      return;
    }

    const settled = this.current.update(deltaMs);

    if (settled || this.current.state === 'SAND') {
      this.current = null;
      this.spawnTimer = 0;
    }
  }

  setPointerX(gridX) {
    if (!this.enabled) return;
    this.current?.setCenterX(gridX);
  }

  releaseCurrent() {
    if (!this.enabled) return;
    this.current?.release();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  reset() {
    this.enabled = true;
    this.current = null;
    this.spawnTimer = 0;
    this.spawnRandomFruit();
  }
}
