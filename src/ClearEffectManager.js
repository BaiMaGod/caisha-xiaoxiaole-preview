import { COLOR_MAP } from './colors.js';

const GLOW_MS = 220;
const FLY_MS = 460;
const STAR_FORM_MS = 260;
const STAR_MIN_HOLD_MS = 550;
const STAR_FADE_MS = 320;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
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

export function getStarCount(cleared) {
  if (cleared >= 3000) return 4;
  if (cleared >= 2000) return 3;
  if (cleared >= 1000) return 2;
  return 1;
}

export class ClearEffectManager {
  constructor(container, grid) {
    this.container = container;
    this.grid = grid;
    this.queue = [];
    this.current = null;
    this.raf = 0;

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

    this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
  }

  play(payload, audioDonePromise = null) {
    const effect = this.buildEffect(payload);
    effect.audioDone = !audioDonePromise;

    if (audioDonePromise) {
      Promise.resolve(audioDonePromise).finally(() => {
        effect.audioDone = true;
        this.scheduleFrame();
      });
    }

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
    const sourceParticles = [];
    const maxFlyParticles = clamp(Math.round(Math.sqrt(cleared) * 5.5), 36, 150);
    const flat = [];

    for (const group of groups) {
      for (const index of group.cells) {
        flat.push({ index, color: group.color });
      }
    }

    const stride = Math.max(1, Math.floor(flat.length / maxFlyParticles));

    for (let i = 0; i < flat.length; i += stride) {
      const item = flat[i];
      const x = item.index % this.grid.width;
      const y = Math.floor(item.index / this.grid.width);
      const seed = ((item.index * 2654435761) >>> 0);

      sourceParticles.push({
        gridX: x + 0.5,
        gridY: y + 0.5,
        color: item.color,
        seed
      });

      if (sourceParticles.length >= maxFlyParticles) break;
    }

    const starCount = getStarCount(cleared);
    const stars = [];

    for (let i = 0; i < starCount; i++) {
      const seed = ((i + 1) * 2246822519 + cleared * 3266489917) >>> 0;

      stars.push({
        size: 11 + (seed % 4),
        rotation: ((seed % 34) - 17) * (Math.PI / 180),
        color: groups[i % groups.length]?.color ?? 3
      });
    }

    return {
      groups,
      cleared,
      combo,
      sourceParticles,
      stars,
      startedAt: 0,
      fadeStartedAt: null,
      audioDone: false
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

  frame(time) {
    this.raf = 0;

    if (!this.current) {
      this.startNext();
      return;
    }

    const elapsed = time - this.current.startedAt;
    const starStart = GLOW_MS + FLY_MS;

    this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);

    if (elapsed < GLOW_MS) {
      this.drawGlow(elapsed / GLOW_MS);
    } else if (elapsed < starStart) {
      this.drawFlight((elapsed - GLOW_MS) / FLY_MS);
    } else {
      const starElapsed = elapsed - starStart;

      if (starElapsed < STAR_FORM_MS) {
        this.drawStars(starElapsed / STAR_FORM_MS, 1);
      } else {
        const minimumHoldDone = starElapsed >= STAR_FORM_MS + STAR_MIN_HOLD_MS;

        if (minimumHoldDone && this.current.audioDone) {
          if (this.current.fadeStartedAt === null) {
            this.current.fadeStartedAt = time;
          }

          const fadeProgress = clamp(
            (time - this.current.fadeStartedAt) / STAR_FADE_MS,
            0,
            1
          );

          this.drawStars(1, 1 - fadeProgress);

          if (fadeProgress >= 1) {
            this.current = null;
            this.startNext();
          }
        } else {
          this.drawStars(1, 1);
        }
      }
    }

    this.scheduleFrame();
  }

  gridToScreen(gridX, gridY) {
    return {
      x: (gridX / this.grid.width) * this.cssWidth,
      y: (gridY / this.grid.height) * this.cssHeight
    };
  }

  drawGlow(progress) {
    const pulse = 0.72 + Math.sin(progress * Math.PI * 4) * 0.2;
    const cellW = this.cssWidth / this.grid.width;
    const cellH = this.cssHeight / this.grid.height;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    for (const group of this.current.groups) {
      this.ctx.fillStyle = colorToCss(group.color, 0.58 * pulse);
      this.ctx.shadowColor = colorToCss(group.color, 0.96);
      this.ctx.shadowBlur = 6 + progress * 10;

      const stride = Math.max(1, Math.floor(group.cells.length / 2400));

      for (let i = 0; i < group.cells.length; i += stride) {
        const index = group.cells[i];
        const x = index % this.grid.width;
        const y = Math.floor(index / this.grid.width);

        this.ctx.fillRect(
          x * cellW,
          y * cellH,
          Math.max(1.5, cellW * 1.35),
          Math.max(1.5, cellH * 1.35)
        );
      }
    }

    this.ctx.restore();
  }

  drawFlight(progress) {
    const t = easeInOutCubic(progress);
    const centerX = this.cssWidth / 2;
    const centerY = this.cssHeight * 0.46;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    for (const particle of this.current.sourceParticles) {
      const start = this.gridToScreen(particle.gridX, particle.gridY);
      const jitterX = ((particle.seed % 31) - 15) * (1 - t) * 0.7;
      const jitterY = (((particle.seed >>> 5) % 31) - 15) * (1 - t) * 0.55;
      const bend = Math.sin(t * Math.PI) * (((particle.seed >>> 10) % 2) ? 18 : -18);

      const x = start.x + (centerX - start.x) * t + jitterX + bend;
      const y = start.y + (centerY - start.y) * t + jitterY - Math.sin(t * Math.PI) * 24;
      const radius = 1.4 + t * 1.5;

      this.ctx.beginPath();
      this.ctx.fillStyle = colorToCss(particle.color, 0.92);
      this.ctx.shadowColor = colorToCss(particle.color, 0.95);
      this.ctx.shadowBlur = 7;
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawStars(progress, alpha) {
    const centerX = this.cssWidth / 2;
    const centerY = this.cssHeight * 0.46;
    const count = this.current.stars.length;
    const spacing = 42;
    const pop = easeOutBack(clamp(progress, 0, 1));
    const startX = centerX - ((count - 1) * spacing) / 2;

    this.ctx.save();
    this.ctx.globalAlpha = clamp(alpha, 0, 1);

    for (let i = 0; i < count; i++) {
      const star = this.current.stars[i];
      const targetX = startX + i * spacing;
      const x = centerX + (targetX - centerX) * pop;
      const y = centerY;

      this.drawSandStar(
        x,
        y,
        star.size * pop,
        star.rotation * pop,
        star.color
      );
    }

    this.ctx.restore();
  }

  drawSandStar(x, y, radius, rotation, color) {
    if (radius <= 0) return;

    const points = [];

    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + rotation + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? radius : radius * 0.44;

      points.push({
        x: x + Math.cos(angle) * r,
        y: y + Math.sin(angle) * r
      });
    }

    this.ctx.save();
    this.ctx.fillStyle = colorToCss(color, 0.96);
    this.ctx.shadowColor = colorToCss(color, 0.9);
    this.ctx.shadowBlur = 7;

    for (let edge = 0; edge < points.length; edge++) {
      const a = points[edge];
      const b = points[(edge + 1) % points.length];
      const grainCount = 5;

      for (let i = 0; i < grainCount; i++) {
        const t = i / grainCount;
        const gx = a.x + (b.x - a.x) * t;
        const gy = a.y + (b.y - a.y) * t;

        this.ctx.beginPath();
        this.ctx.arc(gx, gy, 1.25, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }
}
