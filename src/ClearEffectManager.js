import {
  COLOR_MAP,
  getParticleRgb,
  rgbToCss,
  SETTLED_PARTICLE_INSET,
  SETTLED_PARTICLE_SIZE
} from './colors.js';

export const CLEAR_FLASH_MS = 110;
export const CLEAR_RESTORE_MS = 90;
export const CLEAR_FADE_MS = 1500;
export const CLEAR_FADE_START_MS =
  CLEAR_FLASH_MS + CLEAR_RESTORE_MS;
export const CLEAR_EFFECT_TOTAL_MS =
  CLEAR_FADE_START_MS + CLEAR_FADE_MS;

const PARTICLE_FADE_MS = 190;
const SCORE_BOUNCE_MS = 105;

// During fade, settled-grain gaps become visually amplified by alpha blending.
// Slightly overlap neighboring cells so the disappearing mass stays continuous
// instead of revealing a checker/grid pattern.
export const CLEAR_FADE_PARTICLE_INSET = -0.05;
export const CLEAR_FADE_PARTICLE_SIZE = 1.1;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function baseColorToCss(type, alpha = 1) {
  return rgbToCss(COLOR_MAP[type] ?? [255, 255, 255], alpha);
}

export function getClearRating(cleared) {
  if (cleared >= 3000) return 'UNBELIEVABLE';
  if (cleared >= 2000) return 'PERFECT';
  if (cleared >= 1000) return 'GREAT';
  return 'GOOD';
}

export function getClearScoreCount(elapsedMs, cleared) {
  if (cleared <= 0 || elapsedMs < CLEAR_FADE_START_MS) {
    return 0;
  }

  const progress = clamp(
    (elapsedMs - CLEAR_FADE_START_MS) / CLEAR_FADE_MS,
    0,
    1
  );

  if (progress <= 0) return 1;

  return Math.min(
    cleared,
    Math.max(1, Math.ceil(cleared * progress))
  );
}

export function getSweepParticleAlpha(elapsedMs, normalizedX) {
  if (elapsedMs < CLEAR_FADE_START_MS) {
    return 1;
  }

  const x = clamp(normalizedX, 0, 1);
  const fadeStart =
    CLEAR_FADE_START_MS +
    x * Math.max(0, CLEAR_FADE_MS - PARTICLE_FADE_MS);

  const fadeProgress = clamp(
    (elapsedMs - fadeStart) / PARTICLE_FADE_MS,
    0,
    1
  );

  return 1 - fadeProgress;
}

export function getScoreBounce(elapsedMs) {
  if (elapsedMs < CLEAR_FADE_START_MS) {
    return { scale: 1, offsetY: 0 };
  }

  if (elapsedMs >= CLEAR_EFFECT_TOTAL_MS) {
    return { scale: 1.08, offsetY: -2 };
  }

  const local = elapsedMs - CLEAR_FADE_START_MS;
  const phase = (local % SCORE_BOUNCE_MS) / SCORE_BOUNCE_MS;
  const hop = Math.sin(phase * Math.PI);

  return {
    scale: 1 + hop * 0.105,
    offsetY: -hop * 4.5
  };
}

export function getDominantClearColor(groups) {
  if (!groups?.length) return 1;

  let winner = groups[0];

  for (const group of groups) {
    if ((group.cells?.length ?? 0) > (winner.cells?.length ?? 0)) {
      winner = group;
    }
  }

  return winner.color;
}

export function getClearBounds(particles) {
  if (!particles?.length) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const particle of particles) {
    minX = Math.min(minX, particle.gridX);
    maxX = Math.max(maxX, particle.gridX);
    minY = Math.min(minY, particle.gridY);
    maxY = Math.max(maxY, particle.gridY);
  }

  return { minX, maxX, minY, maxY };
}

export function getScoreAnchor({
  bounds,
  gridWidth,
  gridHeight,
  cssWidth,
  cssHeight,
  fontSize
}) {
  const cellW = cssWidth / gridWidth;
  const cellH = cssHeight / gridHeight;
  const pileCenterX = ((bounds.minX + bounds.maxX + 1) / 2) * cellW;
  const pileTopY = bounds.minY * cellH;

  const x = clamp(
    pileCenterX,
    fontSize * 1.15,
    cssWidth - fontSize * 1.15
  );

  const desiredY = pileTopY - fontSize * 0.62 - 9;
  const y = clamp(
    desiredY,
    fontSize * 0.8,
    cssHeight - fontSize * 0.8
  );

  return { x, y };
}

export class ClearEffectManager {
  constructor(container, grid) {
    this.container = container;
    this.grid = grid;
    this.queue = [];
    this.current = null;
    this.raf = 0;
    this.scoreLingerTimer = 0;

    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    this.canvas.style.zIndex = '9';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';

    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.cssWidth = Math.max(1, rect.width);
    this.cssHeight = Math.max(1, rect.height);

    this.canvas.width = Math.round(this.cssWidth * dpr);
    this.canvas.height = Math.round(this.cssHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  isBusy() {
    return Boolean(this.current || this.queue.length);
  }

  clear() {
    this.queue.length = 0;
    this.current = null;

    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }

    if (this.scoreLingerTimer) {
      clearTimeout(this.scoreLingerTimer);
      this.scoreLingerTimer = 0;
    }

    this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
  }

  play(payload, startRewardAudio = null) {
    if (this.scoreLingerTimer) {
      clearTimeout(this.scoreLingerTimer);
      this.scoreLingerTimer = 0;
    }

    const effect = this.buildEffect(payload);
    effect.startRewardAudio = startRewardAudio;

    this.queue.push(effect);

    if (!this.current) {
      this.startNext();
    }

    this.scheduleFrame();
  }

  scheduleFrame() {
    if (!this.current || this.raf) return;
    this.raf = requestAnimationFrame((time) => this.frame(time));
  }

  buildEffect({ groups, cleared, combo }) {
    const particles = [];

    for (const group of groups) {
      for (const index of group.cells) {
        const x = index % this.grid.width;
        const y = Math.floor(index / this.grid.width);

        particles.push({
          gridX: x,
          gridY: y,
          normalizedX:
            this.grid.width <= 1
              ? 0
              : x / (this.grid.width - 1),
          color: group.color
        });
      }
    }

    return {
      groups,
      cleared,
      combo,
      particles,
      bounds: getClearBounds(particles),
      scoreColor: getDominantClearColor(groups),
      startedAt: 0,
      startRewardAudio: null
    };
  }

  startNext() {
    if (this.queue.length === 0) {
      this.current = null;
      this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      return;
    }

    this.current = this.queue.shift();
    this.current.startedAt = performance.now();
  }

  finishCurrent() {
    if (!this.current) return;

    const finished = this.current;

    try {
      finished.startRewardAudio?.();
    } catch {
      // Reward audio must never block finishing the visual clear.
    }

    this.current = null;

    if (this.queue.length > 0) {
      this.startNext();
      return;
    }

    if (this.scoreLingerTimer) {
      clearTimeout(this.scoreLingerTimer);
    }

    this.scoreLingerTimer = setTimeout(() => {
      this.scoreLingerTimer = 0;

      if (!this.current && this.queue.length === 0) {
        this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      }
    }, 360);
  }

  frame(time) {
    this.raf = 0;

    if (!this.current) {
      this.startNext();
      return;
    }

    const elapsed = Math.max(0, time - this.current.startedAt);

    this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);

    if (elapsed < CLEAR_FLASH_MS) {
      this.drawHighlightFlash(elapsed / CLEAR_FLASH_MS);
    } else if (elapsed < CLEAR_FADE_START_MS) {
      this.drawOriginalParticles();
    } else {
      this.drawLeftToRightFade(elapsed);
      this.drawClearScore(elapsed);
    }

    if (elapsed >= CLEAR_EFFECT_TOTAL_MS) {
      this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      this.drawClearScore(CLEAR_EFFECT_TOTAL_MS);
      this.finishCurrent();
      return;
    }

    this.scheduleFrame();
  }

  drawSettledParticle(particle, alpha = 1) {
    const cellW = this.cssWidth / this.grid.width;
    const cellH = this.cssHeight / this.grid.height;
    const rgb = getParticleRgb(
      particle.gridX,
      particle.gridY,
      particle.color,
      0
    );

    if (!rgb) return;

    this.ctx.fillStyle = rgbToCss(rgb, alpha);
    this.ctx.fillRect(
      (particle.gridX + SETTLED_PARTICLE_INSET) * cellW,
      (particle.gridY + SETTLED_PARTICLE_INSET) * cellH,
      SETTLED_PARTICLE_SIZE * cellW,
      SETTLED_PARTICLE_SIZE * cellH
    );
  }

  drawHighlightFlash(progress) {
    const cellW = this.cssWidth / this.grid.width;
    const cellH = this.cssHeight / this.grid.height;
    const pulse = Math.sin(progress * Math.PI);

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    for (const particle of this.current.particles) {
      const rgb = getParticleRgb(
        particle.gridX,
        particle.gridY,
        particle.color,
        0
      );

      this.ctx.fillStyle = rgbToCss(rgb, 0.88 + pulse * 0.12);
      this.ctx.shadowColor = baseColorToCss(particle.color, 0.95);
      this.ctx.shadowBlur = 6 + pulse * 11;

      this.ctx.fillRect(
        (particle.gridX + SETTLED_PARTICLE_INSET) * cellW,
        (particle.gridY + SETTLED_PARTICLE_INSET) * cellH,
        SETTLED_PARTICLE_SIZE * cellW,
        SETTLED_PARTICLE_SIZE * cellH
      );
    }

    this.ctx.restore();
  }

  drawOriginalParticles() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;

    for (const particle of this.current.particles) {
      this.drawSettledParticle(particle, 1);
    }

    this.ctx.restore();
  }

  drawLeftToRightFade(elapsed) {
    const cellW = this.cssWidth / this.grid.width;
    const cellH = this.cssHeight / this.grid.height;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.imageSmoothingEnabled = false;

    for (const particle of this.current.particles) {
      const alpha = getSweepParticleAlpha(
        elapsed,
        particle.normalizedX
      );

      if (alpha <= 0) continue;

      const rgb = getParticleRgb(
        particle.gridX,
        particle.gridY,
        particle.color,
        0
      );

      if (!rgb) continue;

      // Keep every grain's exact original RGB, but remove the normal 0.16-cell
      // visual gap while fading. A tiny overlap prevents subpixel seams from
      // turning into a visible grid on scaled/mobile canvases.
      this.ctx.fillStyle = rgbToCss(rgb, alpha);
      this.ctx.fillRect(
        (particle.gridX + CLEAR_FADE_PARTICLE_INSET) * cellW,
        (particle.gridY + CLEAR_FADE_PARTICLE_INSET) * cellH,
        CLEAR_FADE_PARTICLE_SIZE * cellW,
        CLEAR_FADE_PARTICLE_SIZE * cellH
      );
    }

    this.ctx.restore();
  }

  drawClearScore(elapsed) {
    const value = getClearScoreCount(
      elapsed,
      this.current.cleared
    );

    if (value <= 0) return;

    const { scale, offsetY } = getScoreBounce(elapsed);
    const baseFontSize = clamp(this.cssWidth * 0.092, 30, 46);
    const fontSize = baseFontSize * scale;
    const anchor = getScoreAnchor({
      bounds: this.current.bounds,
      gridWidth: this.grid.width,
      gridHeight: this.grid.height,
      cssWidth: this.cssWidth,
      cssHeight: this.cssHeight,
      fontSize
    });
    const x = anchor.x;
    const y = anchor.y + offsetY;
    const label = `+${value}`;
    const rgb =
      COLOR_MAP[this.current.scoreColor] ??
      COLOR_MAP[1];

    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font =
      `900 ${fontSize}px "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif`;

    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = Math.max(4, fontSize * 0.13);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.98)';
    this.ctx.shadowColor = rgbToCss(rgb, 0.3);
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetY = 3;
    this.ctx.strokeText(label, x, y);

    // Main fill is exactly the color family of the eliminated sand.
    this.ctx.shadowColor = rgbToCss(rgb, 0.28);
    this.ctx.shadowBlur = 7;
    this.ctx.shadowOffsetY = 2;
    this.ctx.fillStyle = rgbToCss(rgb, 1);
    this.ctx.fillText(label, x, y);

    this.ctx.restore();
  }
}
