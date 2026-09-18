import * as THREE from 'three';
import { COLOR_MAP } from './colors.js';
import { CONFIG } from './config.js';

export class SandRenderer {
  constructor(grid) {
    this.grid = grid;
    this.canvas = document.createElement('canvas');
    this.canvas.width = grid.width;
    this.canvas.height = grid.height;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
  }

  update(fruit = null) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const type = this.grid.get(x, y);
        if (!type) continue;
        this.drawParticle(x, y, type, false);
      }
    }

    this.drawDeathLine();

    if (fruit && fruit.state !== 'SAND') {
      this.drawFruit(fruit);
    }

    this.texture.needsUpdate = true;
  }

  drawDeathLine() {
    const y = CONFIG.DEATH_LINE_Y + 0.5;

    this.ctx.save();
    this.ctx.setLineDash([2, 2]);
    this.ctx.lineWidth = 0.65;
    this.ctx.strokeStyle = 'rgba(255, 93, 93, 0.95)';
    this.ctx.beginPath();
    this.ctx.moveTo(0, y);
    this.ctx.lineTo(this.grid.width, y);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawFruit(fruit) {
    const centerX = (fruit.template.width - 1) / 2;
    const centerY = (fruit.template.height - 1) / 2;

    let scaleX = 1;
    let scaleY = 1;

    if (fruit.state === 'IMPACT') {
      const pulse = Math.sin(fruit.getImpactProgress() * Math.PI);
      scaleX = 1 + pulse * 0.08;
      scaleY = 1 - pulse * 0.16;
    }

    const breakProgress = fruit.getBreakProgress();

    for (let i = 0; i < fruit.template.cells.length; i++) {
      if (fruit.isCellDissolved(i)) continue;

      const cell = fruit.template.cells[i];
      const localX = centerX + (cell.x - centerX) * scaleX;
      const localY = centerY + (cell.y - centerY) * scaleY;

      let x = fruit.x + localX;
      let y = fruit.y + localY;

      if (fruit.state === 'BREAKING') {
        const hash = ((i * 2654435761) >>> 0) % 1000;
        const direction = hash % 2 === 0 ? -1 : 1;
        x += direction * breakProgress * ((hash % 5) / 10);
        y += breakProgress * ((hash % 7) / 20);
      }

      if (
        x < -1 ||
        y < -1 ||
        x > this.grid.width ||
        y > this.grid.height
      ) {
        continue;
      }

      this.drawParticle(x, y, fruit.color, true, breakProgress);
    }
  }

  drawParticle(x, y, type, activeFruit, breakProgress = 0) {
    const rgb = COLOR_MAP[type];
    if (!rgb) return;

    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const hash =
      ((ix * 73856093) ^ (iy * 19349663) ^ (type * 83492791)) >>> 0;
    const offset = (hash % 17) - 8;
    const boost = activeFruit ? 12 + Math.round(breakProgress * 8) : 0;

    const r = Math.max(0, Math.min(255, rgb[0] + offset + boost));
    const g = Math.max(0, Math.min(255, rgb[1] + offset + boost));
    const b = Math.max(0, Math.min(255, rgb[2] + offset + boost));

    this.ctx.fillStyle = `rgb(${r},${g},${b})`;
    this.ctx.beginPath();
    this.ctx.arc(
      x + 0.5,
      y + 0.5,
      activeFruit ? 0.49 : 0.45,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }
}
