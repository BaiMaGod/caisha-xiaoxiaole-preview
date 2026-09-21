import {
  getParticleRgb,
  SETTLED_PARTICLE_INSET,
  SETTLED_PARTICLE_SIZE
} from './colors.js';
import { CONFIG } from './config.js';

export class SandRenderer {
  constructor(grid) {
    this.grid = grid;
    this.canvas = document.createElement('canvas');
    this.canvas.width = grid.width;
    this.canvas.height = grid.height;
    this.ctx = this.canvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    });

    if (!this.ctx) {
      throw new Error('Canvas2D is unavailable');
    }

    this.ctx.imageSmoothingEnabled = false;
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

  }

  drawDeathLine() {
    const y = CONFIG.DEATH_LINE_Y + 0.5;

    this.ctx.save();
    this.ctx.setLineDash([5, 4]);
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgba(255, 105, 105, 0.68)';
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
      scaleX = 1 + pulse * 0.07;
      scaleY = 1 - pulse * 0.13;
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
        x += direction * breakProgress * ((hash % 5) / 8);
        y += breakProgress * ((hash % 7) / 14);
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

  createArtworkCanvas({ scale = 3, background = '#fff8ea' } = {}) {
    const safeScale = Math.max(1, Math.min(4, Math.round(scale)));
    const canvas = document.createElement('canvas');
    canvas.width = this.grid.width * safeScale;
    canvas.height = this.grid.height * safeScale;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return canvas;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(safeScale, safeScale);

    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const type = this.grid.get(x, y);
        if (!type) continue;

        // Artwork captures settled sand only. The death line, HUD and the
        // controllable fruit deliberately stay out of the framed result.
        this.drawParticleTo(ctx, x, y, type, false);
      }
    }

    ctx.restore();
    return canvas;
  }

  drawParticle(x, y, type, activeFruit, breakProgress = 0) {
    this.drawParticleTo(
      this.ctx,
      x,
      y,
      type,
      activeFruit,
      breakProgress
    );
  }

  drawParticleTo(
    ctx,
    x,
    y,
    type,
    activeFruit,
    breakProgress = 0
  ) {
    const boost = activeFruit ? 10 + Math.round(breakProgress * 7) : 0;
    const rgb = getParticleRgb(x, y, type, boost);
    if (!rgb) return;

    ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;

    if (activeFruit) {
      ctx.fillRect(x + 0.01, y + 0.01, 0.98, 0.98);
    } else {
      // Slight air gap between settled grains preserves a fine-sand texture
      // after the 180x320 logical canvas is scaled to the phone viewport.
      ctx.fillRect(
        x + SETTLED_PARTICLE_INSET,
        y + SETTLED_PARTICLE_INSET,
        SETTLED_PARTICLE_SIZE,
        SETTLED_PARTICLE_SIZE
      );
    }
  }
}
