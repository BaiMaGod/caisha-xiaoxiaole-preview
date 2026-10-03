import { CONFIG } from './config.js';

export class TouchController {
  constructor(grid) {
    this.grid = grid;
    this.x = 60;
    this.y = 20;
    this.down = false;

    window.addEventListener('pointerdown', () => this.down = true);
    window.addEventListener('pointerup', () => this.down = false);
    window.addEventListener('pointermove', (e) => {
      this.x = Math.floor(e.clientX / CONFIG.WIDTH * grid.width);
      this.y = Math.floor(e.clientY / window.innerHeight * grid.height);
    });
  }

  update() {
    if (!this.down) return;

    for (let i = 0; i < CONFIG.POUR_RADIUS; i++) {
      const x = Math.floor(this.x + Math.random() * 6 - 3);
      const y = Math.floor(this.y + Math.random() * 6 - 3);
      this.grid.set(x, y, 1 + Math.floor(Math.random() * 7));
    }
  }
}
