import { FruitTemplate } from './FruitTemplate.js';
import { FruitPiece } from './FruitPiece.js';
import { APPLE_TEMPLATE } from './templates/apple.js';
import { BANANA_TEMPLATE } from './templates/banana.js';

const EXISTING_COLOR_BIAS = 0.78;

const BASE_COLORS = [1, 3, 4, 6, 7];
const CYAN_COLOR = 5;
const ORANGE_COLOR = 2;

export function getUnlockedColors(score) {
  if (score >= 50000) {
    return [...BASE_COLORS, CYAN_COLOR, ORANGE_COLOR];
  }

  if (score >= 20000) {
    return [...BASE_COLORS, CYAN_COLOR];
  }

  return [...BASE_COLORS];
}

export class FruitManager {
  constructor(
    grid,
    simulation,
    {
      getScore = () => 0,
      random = Math.random
    } = {}
  ) {
    this.grid = grid;
    this.simulation = simulation;
    this.getScore = getScore;
    this.random = random;

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
      this.templates[Math.floor(this.random() * this.templates.length)];

    this.current = new FruitPiece({
      template,
      color: this.pickNextColor(),
      grid: this.grid,
      simulation: this.simulation
    });
  }

  pickNextColor() {
    const unlockedColors = getUnlockedColors(this.getScore());
    const unlockedSet = new Set(unlockedColors);
    const counts = new Map();
    let occupied = 0;

    for (const color of unlockedColors) {
      counts.set(color, 0);
    }

    for (const value of this.grid.cells) {
      if (!unlockedSet.has(value)) continue;

      counts.set(value, counts.get(value) + 1);
      occupied++;
    }

    if (occupied === 0 || this.random() >= EXISTING_COLOR_BIAS) {
      return unlockedColors[
        Math.floor(this.random() * unlockedColors.length)
      ];
    }

    const weighted = [];
    let totalWeight = 0;

    for (const color of unlockedColors) {
      const count = counts.get(color);

      if (count <= 0) continue;

      const weight = Math.sqrt(count);
      weighted.push({ color, weight });
      totalWeight += weight;
    }

    if (totalWeight <= 0) {
      return unlockedColors[
        Math.floor(this.random() * unlockedColors.length)
      ];
    }

    let roll = this.random() * totalWeight;

    for (const item of weighted) {
      roll -= item.weight;

      if (roll <= 0) {
        return item.color;
      }
    }

    return weighted[weighted.length - 1].color;
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

  startFastDrop() {
    if (!this.enabled || !this.current) {
      return { active: false, released: false };
    }

    const wasControllable = this.current.state === 'CONTROL';

    if (wasControllable) {
      this.current.release();
    }

    if (this.current.state !== 'FALLING') {
      return { active: false, released: false };
    }

    this.current.setFastDrop(true);

    return {
      active: true,
      released: wasControllable
    };
  }

  stopFastDrop() {
    this.current?.setFastDrop(false);
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
