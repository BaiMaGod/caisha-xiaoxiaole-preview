import { COLOR_MAP } from './colors.js';

const GLOW_MS = 220;
const FLY_MS = 460;
const STAR_FORM_PER_STAR_MS = 360;
const STAR_FADE_MS = 320;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
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

export function getStarFormationDuration(starCount) {
  return Math.max(0, starCount) * STAR_FORM_PER_STAR_MS;
}

export function getSequentialStarProgresses(elapsedMs, starCount) {
  const progresses = [];

  for (let i = 0; i < starCount; i++) {
    progresses.push(
      clamp(
        (elapsedMs - i * STAR_FORM_PER_STAR_MS) / STAR_FORM_PER_STAR_MS,
        0,
        1
      )
    );
  }

  return progresses;
}

function buildStarGrains(radius, rotation, seed) {
  const vertices = [];

  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + rotation + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? radius : radius * 0.44;

    vertices.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r
    });
  }

  const grains = [];
  let grainIndex = 0;

  for (let edge = 0; edge < vertices.length; edge++) {
    const a = vertices[edge];
    const b = vertices[(edge + 1) % vertices.length];
    const grainsPerEdge = 7;

    for (let i = 0; i < grainsPerEdge; i++) {
      const t = i / grainsPerEdge;
      const hash =
        ((seed + (grainIndex + 1) * 2654435761) >>> 0);

      grains.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        delay: (hash % 22) / 100,
        cloudX: ((hash >>> 5) % 19) - 9,
        cloudY: ((hash >>> 11) % 19) - 9,
        radius: 1.05 + ((hash >>> 17) % 45) / 100
      });

      grainIndex++;
    }
  }

  return grains;
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

  play(payload, startRewardAudio = null) {
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
      const size = 12 + (seed % 3);
      const rotation = ((seed % 24) - 12) * (Math.PI / 180);

      stars.push({
        size,
        rotation,
        color: groups[i % groups.length]?.color ?? 3,
        grains: buildStarGrains(size, rotation, seed)
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
      audioStarted: false,
      audioDone: false,
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

  startAudioAfterStarsReady() {
    if (!this.current || this.current.audioStarted) return;

    this.current.audioStarted = true;

    let rewardResult;

    try {
      rewardResult = this.current.startRewardAudio?.();
    } catch {
      rewardResult = null;
    }

    if (!rewardResult || typeof rewardResult.then !== 'function') {
      this.current.audioDone = true;
      return;
    }

    const effect = this.current;

    Promise.resolve(rewardResult).finally(() => {
      effect.audioDone = true;

      if (this.current === effect) {
        this.scheduleFrame();
      }
    });
  }

  frame(time) {
    this.raf = 0;

    if (!this.current) {
      this.startNext();
      return;
    }

    const elapsed = time - this.current.startedAt;
    const starStart = GLOW_MS + FLY_MS;
    const starFormationDuration = getStarFormationDuration(
      this.current.stars.length
    );

    this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);

    if (elapsed < GLOW_MS) {
      this.drawGlow(elapsed / GLOW_MS);
    } else if (elapsed < starStart) {
      this.drawFlight((elapsed - GLOW_MS) / FLY_MS);
    } else {
      const starElapsed = elapsed - starStart;

      if (starElapsed < starFormationDuration) {
        this.drawSequentialStarFormation(starElapsed, 1);
      } else {
        this.drawSequentialStarFormation(starFormationDuration, 1);
        this.startAudioAfterStarsReady();

        if (this.current.audioDone) {
          if (this.current.fadeStartedAt === null) {
            this.current.fadeStartedAt = time;
          }

          const fadeProgress = clamp(
            (time - this.current.fadeStartedAt) / STAR_FADE_MS,
            0,
            1
          );

          this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
          this.drawSequentialStarFormation(
            starFormationDuration,
            1 - fadeProgress
          );

          if (fadeProgress >= 1) {
            this.current = null;
            this.startNext();
          }
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

  drawSequentialStarFormation(elapsedMs, alpha) {
    const centerX = this.cssWidth / 2;
    const centerY = this.cssHeight * 0.46;
    const count = this.current.stars.length;
    const spacing = 44;
    const startX = centerX - ((count - 1) * spacing) / 2;
    const progresses = getSequentialStarProgresses(elapsedMs, count);

    this.ctx.save();
    this.ctx.globalAlpha = clamp(alpha, 0, 1);

    for (let i = 0; i < count; i++) {
      const progress = progresses[i];
      if (progress <= 0) continue;

      const star = this.current.stars[i];
      const targetX = startX + i * spacing;

      this.drawFormingSandStar(
        star,
        centerX,
        centerY,
        targetX,
        centerY,
        progress
      );
    }

    this.ctx.restore();
  }

  drawFormingSandStar(star, originX, originY, targetX, targetY, progress) {
    this.ctx.save();
    this.ctx.fillStyle = colorToCss(star.color, 0.96);
    this.ctx.shadowColor = colorToCss(star.color, 0.92);
    this.ctx.shadowBlur = 7;
    this.ctx.globalCompositeOperation = 'lighter';

    for (const grain of star.grains) {
      const grainProgress = clamp(
        (progress - grain.delay) / Math.max(0.01, 1 - grain.delay),
        0,
        1
      );

      if (grainProgress <= 0) continue;

      const t = easeOutCubic(grainProgress);
      const cloudX = originX + grain.cloudX;
      const cloudY = originY + grain.cloudY;
      const endX = targetX + grain.x;
      const endY = targetY + grain.y;
      const arc = Math.sin(t * Math.PI) * 10;

      const x = cloudX + (endX - cloudX) * t;
      const y = cloudY + (endY - cloudY) * t - arc;

      this.ctx.beginPath();
      this.ctx.arc(
        x,
        y,
        grain.radius * (0.75 + t * 0.25),
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
