import { CONFIG } from './config.js';

export class GameRules {
  constructor(grid) {
    this.grid = grid;
    this.gameOver = false;
  }

  checkDeathLine() {
    if (this.gameOver) return true;

    for (let y = 0; y <= CONFIG.DEATH_LINE_Y; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        if (this.grid.get(x, y) > 0) {
          this.gameOver = true;
          return true;
        }
      }
    }

    return false;
  }

  reset() {
    this.gameOver = false;
  }
}
