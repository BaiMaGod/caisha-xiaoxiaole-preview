import { FruitTemplate } from './FruitTemplate.js';
import { FruitPiece } from './FruitPiece.js';
import { APPLE_TEMPLATE } from './templates/apple.js';
import { BANANA_TEMPLATE } from './templates/banana.js';

const COLOR_COUNT = 7;
const EXISTING_COLOR_BIAS = 0.78;

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
      color: this.pickNextColor(),
      grid: this.grid,
      simulation: this.simulation
    });
  }

  pickNextColor() {
    const counts = new Array(COLOR_COUNT).fill(0);
    let occupied = 0;

    for (const value of this.grid.cells) {
      if (value < 1 || value > COLOR_COUNT) continue;
      counts[value - 1]++;
      occupied++;
    }

    if (occupied === 0 || Math.random() >= EXISTING_COLOR_BIAS) {
      return 1 + Math.floor(Math.random() * COLOR_COUNT);
    }

    // Existing colors are preferred, but sqrt weighting prevents the
    // biggest pile from monopolizing every future fruit.
    const weights = counts.map((count) => (count > 0 ? Math.sqrt(count) : 0));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    if (totalWeight <= 0) {
      return 1 + Math.floor(Math.random() * COLOR_COUNT);
    }

    let roll = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];

      if (roll <= 0) {
        return i + 1;
      }
    }

    return counts.findIndex((count) => count > 0) + 1;
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
    if (!this.enabled || !this.current) return false;

    const wasControllable = this.current.state === 'CONTROL';
    this.current.release();
    return wasControllable && this.current.state === 'FALLING';
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
