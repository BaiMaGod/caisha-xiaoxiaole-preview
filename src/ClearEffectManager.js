import { COLOR_MAP } from './colors.js';

export const CLEAR_EFFECT_TOTAL_MS = 1000;
export const CLEAR_FLASH_MS = 160;

const CLEAR_SWEEP_MS = CLEAR_EFFECT_TOTAL_MS - CLEAR_FLASH_MS;
const PARTICLE_FADE_MS = 140;

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
  if (cleared <= 0 || elapsedMs < CLEAR_FLASH_MS) {
    return 0;
  }

  const progress = clamp(
    (elapsedMs - CLEAR_FLASH_MS) / CLEAR_SWEEP_MS,
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
  if (elapsedMs < CLEAR_FLASH_MS) {
    return 1;
  }

  const x = clamp(normalizedX, 0, 1);
  const fadeStart =
    CLEAR_FLASH_MS +
    x * Math.max(0, CLEAR_SWEEP_MS - PARTICLE_FADE_MS);

  const fadeProgress = clamp(
    (elapsedMs - fadeStart) / PARTICLE_FADE_MS,
    0,
    1
  );

  return 1 - fadeProgress;
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

    // Audio begins only after the final sand grain has faded and the counter
    // has reached the exact number of cleared particles.
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

    // Keep the final +score visible briefly while the reward voice starts.
    // Physics can already resume because the effect is no longer busy.
    if (this.scoreLingerTimer) {
      clearTimeout(this.scoreLingerTimer);
    }

    this.scoreLingerTimer = setTimeout(() => {
      this.scoreLingerTimer = 0;

      if (!this.current && this.queue.length === 0) {
        this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      }
    }, 320);
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
    } else {
      this.drawLeftToRightFade(elapsed);
      this.drawClearScore(elapsed);
    }

    if (elapsed >= CLEAR_EFFECT_TOTAL_MS) {
      // Draw the exact final +score once before handing off to the voice cue.
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
    const pulse = 0.68 + Math.sin(progress * Math.PI) * 0.32;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    for (const particle of this.current.particles) {
      this.ctx.fillStyle = colorToCss(
        particle.color,
        0.72 + pulse * 0.28
      );
      this.ctx.shadowColor = colorToCss(particle.color, 1);
      this.ctx.shadowBlur = 7 + pulse * 10;

      this.ctx.fillRect(
        particle.gridX * cellW,
        particle.gridY * cellH,
        Math.max(1.5, cellW * 1.35),
        Math.max(1.5, cellH * 1.35)
      );
    }

    this.ctx.restore();
  }

  drawLeftToRightFade(elapsed) {
    const cellW = this.cssWidth / this.grid.width;
    const cellH = this.cssHeight / this.grid.height;

    this.ctx.save();

    for (const particle of this.current.particles) {
      const alpha = getSweepParticleAlpha(
        elapsed,
        particle.normalizedX
      );

      if (alpha <= 0) continue;

      this.ctx.fillStyle = colorToCss(
        particle.color,
        0.96 * alpha
      );

      // Add a soft glow only near the disappearing wave front.
      if (alpha < 0.82) {
        this.ctx.shadowColor = colorToCss(
          particle.color,
          0.75 * alpha
        );
        this.ctx.shadowBlur = 4 + (1 - alpha) * 7;
      } else {
        this.ctx.shadowBlur = 0;
      }

      this.ctx.fillRect(
        particle.gridX * cellW,
        particle.gridY * cellH,
        Math.max(1.25, cellW * (0.96 + alpha * 0.12)),
        Math.max(1.25, cellH * (0.96 + alpha * 0.12))
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

    const sweepProgress = clamp(
      (elapsed - CLEAR_FLASH_MS) / CLEAR_SWEEP_MS,
      0,
      1
    );

    const bounce =
      Math.sin(Math.min(1, sweepProgress * 5) * Math.PI) * 5;

    const x = this.cssWidth / 2;
    const y = this.cssHeight * 0.22 - bounce;
    const fontSize = clamp(this.cssWidth * 0.085, 28, 42);

    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font =
      `900 ${fontSize}px/1 system-ui, -apple-system, sans-serif`;

    this.ctx.lineWidth = Math.max(3, fontSize * 0.12);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.94)';
    this.ctx.shadowColor = 'rgba(255, 133, 76, 0.32)';
    this.ctx.shadowBlur = 12;

    const label = `+${value}`;

    this.ctx.strokeText(label, x, y);
    this.ctx.fillStyle = '#ff7048';
    this.ctx.fillText(label, x, y);

    this.ctx.restore();
  }
}
