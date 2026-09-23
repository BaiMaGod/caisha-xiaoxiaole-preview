import {
  getDisplayColorRgb,
  getParticleRgb,
  rgbToCss,
  SETTLED_PARTICLE_INSET,
  SETTLED_PARTICLE_SIZE
} from '../../colors.js';
import { CONFIG } from '../../config.js';
import { BaseClearEffect } from '../BaseClearEffect.js';

export const CLEAR_FLASH_MS = 110;
export const CLEAR_RESTORE_MS = 90;
export const CLEAR_FADE_MS = 1500;

export function getClearEffectTiming(
  highlightEnabled = CONFIG.CLEAR_HIGHLIGHT_ENABLED
) {
  const fadeStartMs = highlightEnabled
    ? CLEAR_FLASH_MS + CLEAR_RESTORE_MS
    : 0;

  return {
    highlightEnabled,
    fadeStartMs,
    totalMs: fadeStartMs + CLEAR_FADE_MS
  };
}

const CLEAR_TIMING = getClearEffectTiming();
export const CLEAR_FADE_START_MS = CLEAR_TIMING.fadeStartMs;
export const CLEAR_EFFECT_TOTAL_MS = CLEAR_TIMING.totalMs;

const SCORE_BOUNCE_MS = 105;
export const CLEAR_RANDOM_AHEAD_COLUMNS = 9;

// Normal settled sand intentionally has tiny gaps for texture. During the
// random jump-clear phase those gaps read as a checkerboard once neighboring
// grains disappear, so remaining grains use a gapless, slightly overlapped
// footprint while keeping the exact same per-grain RGB.
export const CLEAR_JUMP_PARTICLE_INSET = -0.03;
export const CLEAR_JUMP_PARTICLE_SIZE = 1.06;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function baseColorToCss(type, alpha = 1) {
  return rgbToCss(
    getDisplayColorRgb(type) ?? [255, 255, 255],
    alpha
  );
}

export function getClearRating(cleared) {
  if (cleared >= 3000) return 'UNBELIEVABLE';
  if (cleared >= 2000) return 'PERFECT';
  if (cleared >= 1000) return 'GREAT';
  return 'GOOD';
}

export function getParticleClearRandom(
  gridX,
  gridY,
  color,
  effectSeed = 0
) {
  let hash =
    ((gridX + 1) * 73856093) ^
    ((gridY + 1) * 19349663) ^
    ((color + 1) * 83492791) ^
    ((effectSeed + 1) * 2654435761);

  hash >>>= 0;
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 2246822519) >>> 0;
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 3266489917) >>> 0;
  hash ^= hash >>> 16;

  return (hash >>> 0) / 4294967296;
}

export function getClearWaveProgress(elapsedMs) {
  return clamp(
    (elapsedMs - CLEAR_FADE_START_MS) / CLEAR_FADE_MS,
    0,
    1
  );
}

export function getClearWaveFrontX(elapsedMs, bounds) {
  if (elapsedMs < CLEAR_FADE_START_MS) {
    return bounds.minX - 1;
  }

  const progress = getClearWaveProgress(elapsedMs);

  return (
    bounds.minX +
    (bounds.maxX - bounds.minX) * progress
  );
}

export function getJumpClearProbability(distanceAheadColumns) {
  if (distanceAheadColumns <= 0) return 1;

  const band = Math.ceil(distanceAheadColumns);

  if (band > CLEAR_RANDOM_AHEAD_COLUMNS) {
    return 0;
  }

  // Ahead of the wave front, clear probability now falls linearly by 10%
  // per column: 90%, 80%, ... 10% across the next nine columns.
  return (10 - band) / 10;
}

export function isParticleJumpCleared(
  elapsedMs,
  particle,
  bounds
) {
  if (elapsedMs < CLEAR_FADE_START_MS) return false;
  if (elapsedMs >= CLEAR_EFFECT_TOTAL_MS) return true;

  const frontX = getClearWaveFrontX(elapsedMs, bounds);
  const distanceAhead = particle.gridX - frontX;
  const probability = getJumpClearProbability(distanceAhead);

  return particle.clearRandom < probability;
}

export function getClearedParticleCount(
  elapsedMs,
  particles,
  bounds
) {
  if (elapsedMs < CLEAR_FADE_START_MS) return 0;
  if (elapsedMs >= CLEAR_EFFECT_TOTAL_MS) return particles.length;

  let count = 0;

  for (const particle of particles) {
    if (isParticleJumpCleared(elapsedMs, particle, bounds)) {
      count += 1;
    }
  }

  return count;
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

export class DefaultJumpEffect extends BaseClearEffect {
  constructor(container, grid, sourceCanvas = null) {
    super();
    this.container = container;
    this.grid = grid;
    this.sourceCanvas = sourceCanvas;
    this.queue = [];
    this.current = null;
    this.raf = 0;
    this.scoreLingerTimer = 0;
    this.effectSerial = 0;

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
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
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
    const effectSeed = ++this.effectSerial;

    for (const group of groups) {
      for (const index of group.cells) {
        const x = index % this.grid.width;
        const y = Math.floor(index / this.grid.width);

        particles.push({
          gridX: x,
          gridY: y,
          color: group.color,
          clearRandom: getParticleClearRandom(
            x,
            y,
            group.color,
            effectSeed
          )
        });
      }
    }

    const snapshotCanvas = this.captureSourceSnapshot(groups);
    const maskCanvas = this.createDisplayCanvas();
    const frameCanvas = this.createDisplayCanvas();

    return {
      groups,
      cleared,
      combo,
      particles,
      bounds: getClearBounds(particles),
      scoreColor: getDominantClearColor(groups),
      snapshotCanvas,
      maskCanvas,
      maskCtx: maskCanvas?.getContext('2d') ?? null,
      frameCanvas,
      frameCtx: frameCanvas?.getContext('2d') ?? null,
      startedAt: 0,
      startRewardAudio: null
    };
  }

  createDisplayCanvas() {
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(
      1,
      this.sourceCanvas?.width ?? this.canvas.width
    );
    canvas.height = Math.max(
      1,
      this.sourceCanvas?.height ?? this.canvas.height
    );

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    return canvas;
  }

  fillDisplayMaskCell(ctx, canvas, gridX, gridY) {
    const left = Math.round((gridX / this.grid.width) * canvas.width);
    const right = Math.round(
      ((gridX + 1) / this.grid.width) * canvas.width
    );
    const top = Math.round((gridY / this.grid.height) * canvas.height);
    const bottom = Math.round(
      ((gridY + 1) / this.grid.height) * canvas.height
    );

    ctx.fillRect(
      left,
      top,
      Math.max(1, right - left),
      Math.max(1, bottom - top)
    );
  }

  fillDisplayParticleFootprint(ctx, canvas, gridX, gridY) {
    const cellW = canvas.width / this.grid.width;
    const cellH = canvas.height / this.grid.height;

    ctx.fillRect(
      (gridX + SETTLED_PARTICLE_INSET) * cellW,
      (gridY + SETTLED_PARTICLE_INSET) * cellH,
      SETTLED_PARTICLE_SIZE * cellW,
      SETTLED_PARTICLE_SIZE * cellH
    );
  }

  captureSourceSnapshot(groups) {
    if (!this.sourceCanvas) return null;

    const snapshotCanvas = this.createDisplayCanvas();
    const selectionMask = this.createDisplayCanvas();

    if (!snapshotCanvas || !selectionMask) return null;

    const snapshotCtx = snapshotCanvas.getContext('2d');
    const maskCtx = selectionMask.getContext('2d');

    if (!snapshotCtx || !maskCtx) return null;

    snapshotCtx.clearRect(
      0,
      0,
      snapshotCanvas.width,
      snapshotCanvas.height
    );
    snapshotCtx.imageSmoothingEnabled = true;
    snapshotCtx.imageSmoothingQuality = 'high';

    // Capture the already-presented DPR-resolution game frame. This preserves
    // the same soft sand edge the player sees before the clear starts and
    // avoids enlarging the 180x320 logical raster inside the effect layer.
    snapshotCtx.drawImage(
      this.sourceCanvas,
      0,
      0,
      snapshotCanvas.width,
      snapshotCanvas.height
    );

    maskCtx.clearRect(
      0,
      0,
      selectionMask.width,
      selectionMask.height
    );
    maskCtx.fillStyle = '#fff';

    for (const group of groups) {
      for (const index of group.cells) {
        const x = index % this.grid.width;
        const y = Math.floor(index / this.grid.width);
        this.fillDisplayParticleFootprint(
          maskCtx,
          selectionMask,
          x,
          y
        );
      }
    }

    snapshotCtx.save();
    snapshotCtx.globalCompositeOperation = 'destination-in';
    snapshotCtx.drawImage(selectionMask, 0, 0);
    snapshotCtx.restore();

    return snapshotCanvas;
  }

  drawSnapshotCanvas(snapshotCanvas) {
    if (!snapshotCanvas) return false;

    this.ctx.save();
    // The snapshot is already captured at display/DPR resolution, so this is
    // effectively a 1:1 presentation instead of nearest-neighbor magnification.
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(
      snapshotCanvas,
      0,
      0,
      snapshotCanvas.width,
      snapshotCanvas.height,
      0,
      0,
      this.cssWidth,
      this.cssHeight
    );
    this.ctx.restore();

    return true;
  }

  buildJumpClearSnapshot(elapsed) {
    const effect = this.current;

    if (
      !effect?.snapshotCanvas ||
      !effect.maskCanvas ||
      !effect.maskCtx ||
      !effect.frameCanvas ||
      !effect.frameCtx
    ) {
      return null;
    }

    const { maskCtx, frameCtx, maskCanvas, frameCanvas } = effect;

    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.fillStyle = '#fff';

    for (const particle of effect.particles) {
      if (
        isParticleJumpCleared(
          elapsed,
          particle,
          effect.bounds
        )
      ) {
        continue;
      }

      this.fillDisplayMaskCell(
        maskCtx,
        maskCanvas,
        particle.gridX,
        particle.gridY
      );
    }

    frameCtx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
    frameCtx.globalCompositeOperation = 'source-over';
    frameCtx.drawImage(effect.snapshotCanvas, 0, 0);
    frameCtx.globalCompositeOperation = 'destination-in';
    frameCtx.drawImage(maskCanvas, 0, 0);
    frameCtx.globalCompositeOperation = 'source-over';

    return frameCanvas;
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

    if (
      CONFIG.CLEAR_HIGHLIGHT_ENABLED &&
      elapsed < CLEAR_FLASH_MS
    ) {
      this.drawSnapshotHighlight(elapsed / CLEAR_FLASH_MS);
    } else if (
      CONFIG.CLEAR_HIGHLIGHT_ENABLED &&
      elapsed < CLEAR_FADE_START_MS
    ) {
      this.drawSnapshotOriginal();
    } else {
      this.drawLeftToRightJumpClear(elapsed);
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

  drawJumpParticle(particle) {
    const cellW = this.cssWidth / this.grid.width;
    const cellH = this.cssHeight / this.grid.height;
    const rgb = getParticleRgb(
      particle.gridX,
      particle.gridY,
      particle.color,
      0
    );

    if (!rgb) return;

    this.ctx.fillStyle = rgbToCss(rgb, 1);
    this.ctx.fillRect(
      (particle.gridX + CLEAR_JUMP_PARTICLE_INSET) * cellW,
      (particle.gridY + CLEAR_JUMP_PARTICLE_INSET) * cellH,
      CLEAR_JUMP_PARTICLE_SIZE * cellW,
      CLEAR_JUMP_PARTICLE_SIZE * cellH
    );
  }

  drawSnapshotHighlight(progress) {
    const snapshot = this.current?.snapshotCanvas;

    if (!snapshot) {
      this.drawHighlightFlash(progress);
      return;
    }

    const pulse = Math.sin(progress * Math.PI);

    this.ctx.save();
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.filter = `brightness(${1 + pulse * 0.32}) saturate(${1 + pulse * 0.08})`;
    this.ctx.drawImage(
      snapshot,
      0,
      0,
      this.cssWidth,
      this.cssHeight
    );
    this.ctx.restore();
  }

  drawSnapshotOriginal() {
    const snapshot = this.current?.snapshotCanvas;

    if (snapshot && this.drawSnapshotCanvas(snapshot)) {
      return;
    }

    this.drawOriginalParticles();
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

  drawLeftToRightJumpClear(elapsed) {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;

    for (const particle of this.current.particles) {
      if (
        isParticleJumpCleared(
          elapsed,
          particle,
          this.current.bounds
        )
      ) {
        continue;
      }

      // Keep the grain-by-grain clear path (no full-cell mask), but use the
      // previously-proven gapless clear footprint. Normal settled sand has a
      // deliberate 0.16-cell gap; during random disappearance that gap turns
      // into a visible checker/grid pattern. Slight overlap removes the seam
      // without bringing back the oversized 1x1 mask holes.
      this.drawJumpParticle(particle);
    }

    this.ctx.restore();
  }

  drawClearScore(elapsed) {
    const value = getClearedParticleCount(
      elapsed,
      this.current.particles,
      this.current.bounds
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
      getDisplayColorRgb(this.current.scoreColor) ??
      getDisplayColorRgb(1);

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
