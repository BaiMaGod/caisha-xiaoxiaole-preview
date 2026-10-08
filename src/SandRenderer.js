import {
  getParticleRgb,
  SETTLED_PARTICLE_INSET,
  SETTLED_PARTICLE_SIZE
} from './colors.js';
import { CONFIG } from './config.js';

const DISPLAY_BACKGROUND = '#fff8ea';
const MAX_DISPLAY_DPR = 2;

export function getDisplayBackingSize(
  cssWidth,
  cssHeight,
  devicePixelRatio = 1
) {
  const dpr = Math.max(
    1,
    Math.min(MAX_DISPLAY_DPR, Number(devicePixelRatio) || 1)
  );

  return {
    dpr,
    width: Math.max(1, Math.round(cssWidth * dpr)),
    height: Math.max(1, Math.round(cssHeight * dpr))
  };
}

export class SandRenderer {
  constructor(
    grid,
    {
      displayCanvas = null,
      createCanvas = () => document.createElement('canvas'),
      getDisplayMetrics = null
    } = {}
  ) {
    this.grid = grid;
    this.createCanvas = createCanvas;
    this.getDisplayMetrics = getDisplayMetrics;

    // 180x320 remains the fixed gameplay/physics raster. Clear effects read
    // from this canvas so gameplay never depends on screen resolution.
    this.logicalCanvas = createCanvas();
    this.logicalCanvas.width = grid.width;
    this.logicalCanvas.height = grid.height;
    this.logicalCtx = this.logicalCanvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    });

    // The DOM canvas is only the presentation surface. Its backing store is
    // resized to CSS pixels x DPR so a high-density phone does not simply
    // stretch the 180x320 gameplay raster as a low-resolution bitmap.
    this.canvas = displayCanvas ?? createCanvas();
    this.canvas.width = grid.width;
    this.canvas.height = grid.height;
    this.displayCtx = this.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    });

    if (!this.logicalCtx || !this.displayCtx) {
      throw new Error('Canvas2D is unavailable');
    }

    // Preserve the old public ctx meaning for any callers that need the
    // logical gameplay image rather than the presentation surface.
    this.ctx = this.logicalCtx;
    this.logicalCtx.imageSmoothingEnabled = false;

    this.cssWidth = grid.width;
    this.cssHeight = grid.height;
    this.displayDpr = 1;
    this.lineMode = 'failure';

    if (!getDisplayMetrics && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.present(true);
      });
      this.resizeObserver.observe(this.canvas);
    }
  }

  update(fruit = null, presentNow = true, showDeathLine = true) {
    this.logicalCtx.clearRect(
      0,
      0,
      this.logicalCanvas.width,
      this.logicalCanvas.height
    );

    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const type = this.grid.get(x, y);
        if (!type) continue;
        this.drawParticle(x, y, type, false);
      }
    }

    if (showDeathLine) this.drawDeathLine();

    if (fruit && fruit.state !== 'SAND') {
      this.drawFruit(fruit);
    }

    if (presentNow) this.present();
  }

  present(force = false) {
    const metrics = this.getDisplayMetrics?.() ?? (() => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        width: rect.width || this.grid.width,
        height: rect.height || this.grid.height,
        dpr: typeof window !== 'undefined' ? window.devicePixelRatio : 1
      };
    })();
    const cssWidth = Math.max(1, metrics.width);
    const cssHeight = Math.max(1, metrics.height);
    const viewport = metrics.viewport ?? {
      x: 0,
      y: 0,
      width: cssWidth,
      height: cssHeight
    };
    const backing = getDisplayBackingSize(
      cssWidth,
      cssHeight,
      metrics.dpr
    );

    if (
      force ||
      this.canvas.width !== backing.width ||
      this.canvas.height !== backing.height
    ) {
      this.canvas.width = backing.width;
      this.canvas.height = backing.height;
    }

    this.cssWidth = cssWidth;
    this.cssHeight = cssHeight;
    this.displayDpr = backing.dpr;
    this.viewport = viewport;

    const ctx = this.displayCtx;
    ctx.setTransform(backing.dpr, 0, 0, backing.dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Match the old opaque WebGL scene: first paint the cream background,
    // then linearly scale/composite the transparent logical sand texture.
    ctx.fillStyle = DISPLAY_BACKGROUND;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    ctx.fillStyle = DISPLAY_BACKGROUND;
    ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);
    ctx.drawImage(
      this.logicalCanvas,
      0,
      0,
      this.logicalCanvas.width,
      this.logicalCanvas.height,
      viewport.x,
      viewport.y,
      viewport.width,
      viewport.height
    );
  }

  drawDeathLine() {
    const y = CONFIG.DEATH_LINE_Y + 0.5;

    this.logicalCtx.save();
    this.logicalCtx.setLineDash([5, 4]);
    this.logicalCtx.lineWidth = 1;
    this.logicalCtx.strokeStyle = this.lineMode === 'finish'
      ? 'rgba(98, 195, 152, 0.88)' : 'rgba(255, 105, 105, 0.68)';
    this.logicalCtx.beginPath();
    this.logicalCtx.moveTo(0, y);
    this.logicalCtx.lineTo(this.grid.width, y);
    this.logicalCtx.stroke();
    this.logicalCtx.restore();
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

  createArtworkCanvas({ scale = 3, background = DISPLAY_BACKGROUND } = {}) {
    const safeScale = Math.max(1, Math.min(4, Math.round(scale)));
    const canvas = this.createCanvas();
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
      this.logicalCtx,
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
      // Use the shared settled-grain footprint. The 0.90-cell size keeps
      // the sand texture fine while reducing visible grid seams on scaled displays.
      ctx.fillRect(
        x + SETTLED_PARTICLE_INSET,
        y + SETTLED_PARTICLE_INSET,
        SETTLED_PARTICLE_SIZE,
        SETTLED_PARTICLE_SIZE
      );
    }
  }
}
