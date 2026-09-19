import { COLOR_MAP } from './colors.js';

export const CLEAR_FLASH_MS = 110;
export const CLEAR_RESTORE_MS = 90;
export const CLEAR_FADE_MS = 1500;
export const CLEAR_FADE_START_MS =
  CLEAR_FLASH_MS + CLEAR_RESTORE_MS;
export const CLEAR_EFFECT_TOTAL_MS =
  CLEAR_FADE_START_MS + CLEAR_FADE_MS;

const PARTICLE_FADE_MS = 190;
const SCORE_BOUNCE_MS = 105;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function colorToCss(type, alpha = 1) {
  const rgb = COLOR_MAP[type] ?? [255, 255, 255];
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
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
      // Important: return to the exact original sand color/size before
      // starting the fade. No glow, tint, or scaling in this phase.
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

  drawHighlightFlash(progress) {
    const cellW = this.cssWidth / this.grid.width;
    const cellH = this.cssHeight / this.grid.height;
    const pulse = Math.sin(progress * Math.PI);

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    for (const particle of this.current.particles) {
      this.ctx.fillStyle = colorToCss(
        particle.color,
        0.88 + pulse * 0.12
      );
      this.ctx.shadowColor = colorToCss(particle.color, 0.95);
      this.ctx.shadowBlur = 6 + pulse * 11;

      this.ctx.fillRect(
        particle.gridX * cellW,
        particle.gridY * cellH,
        cellW,
        cellH
      );
    }

    this.ctx.restore();
  }

  drawOriginalParticles() {
    const cellW = this.cssWidth / this.grid.width;
    const cellH = this.cssHeight / this.grid.height;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.shadowBlur = 0;

    for (const particle of this.current.particles) {
      this.ctx.fillStyle = colorToCss(particle.color, 1);
      this.ctx.fillRect(
        particle.gridX * cellW,
        particle.gridY * cellH,
        cellW,
        cellH
      );
    }

    this.ctx.restore();
  }

  drawLeftToRightFade(elapsed) {
    const cellW = this.cssWidth / this.grid.width;
    const cellH = this.cssHeight / this.grid.height;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.shadowBlur = 0;

    for (const particle of this.current.particles) {
      const alpha = getSweepParticleAlpha(
        elapsed,
        particle.normalizedX
      );

      if (alpha <= 0) continue;

      // Preserve the exact original RGB during disappearance. Only alpha
      // changes; there is no glow, hue shift, or particle resizing.
      this.ctx.fillStyle = colorToCss(particle.color, alpha);
      this.ctx.fillRect(
        particle.gridX * cellW,
        particle.gridY * cellH,
        cellW,
        cellH
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
    const x = this.cssWidth / 2;
    const y = this.cssHeight * 0.205 + offsetY;
    const baseFontSize = clamp(this.cssWidth * 0.095, 32, 48);
    const fontSize = baseFontSize * scale;
    const label = `+${value}`;

    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font =
      `900 ${fontSize}px "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif`;

    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = Math.max(4, fontSize * 0.13);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.98)';
    this.ctx.shadowColor = 'rgba(187, 76, 43, 0.24)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetY = 3;
    this.ctx.strokeText(label, x, y);

    this.ctx.shadowColor = 'rgba(255, 112, 72, 0.28)';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetY = 2;

    const gradient = this.ctx.createLinearGradient(
      0,
      y - fontSize * 0.55,
      0,
      y + fontSize * 0.55
    );
    gradient.addColorStop(0, '#ff9a5a');
    gradient.addColorStop(0.48, '#ff7048');
    gradient.addColorStop(1, '#f24f5f');

    this.ctx.fillStyle = gradient;
    this.ctx.fillText(label, x, y);

    // Tiny highlight gives the number a soft candy-like finish.
    this.ctx.globalAlpha = 0.32;
    this.ctx.font =
      `900 ${fontSize * 0.985}px "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif`;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(label, x, y - fontSize * 0.035);

    this.ctx.restore();
  }
}
