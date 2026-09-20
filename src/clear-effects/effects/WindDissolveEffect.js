import { BaseClearEffect } from '../BaseClearEffect.js';
import {
  COLOR_MAP,
  getParticleRgb,
  rgbToCss
} from '../../colors.js';
import {
  compensateSnapshotPixelsForDisplay,
  getClearBounds,
  getDominantClearColor,
  getParticleClearRandom,
  getScoreAnchor
} from './DefaultJumpEffect.js';

export const WIND_EFFECT_TOTAL_MS = 1500;
export const WIND_FLYER_LIMIT = 240;
export const WIND_DUST_LIMIT = 120;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(value) {
  return 1 - (1 - value) ** 3;
}

function smoothstep(value) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function hash01(x, y, seed = 0) {
  let hash =
    ((x + 1) * 73856093) ^
    ((y + 1) * 19349663) ^
    ((seed + 1) * 83492791);

  hash >>>= 0;
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 2246822519) >>> 0;
  hash ^= hash >>> 13;

  return (hash >>> 0) / 4294967296;
}

export function getWindErosionOffset(gridX, gridY, seed = 0) {
  const broad =
    Math.sin(gridY * 0.19 + seed * 0.77) * 3.2 +
    Math.sin(gridY * 0.061 + gridX * 0.083 + seed) * 2.1;
  const grain = (hash01(gridX, gridY, seed) - 0.5) * 5.5;
  return broad + grain;
}

export class WindDissolveEffect extends BaseClearEffect {
  constructor(container, grid, sourceCanvas = null) {
    super();

    this.effectId = 'wind_dissolve';
    this.container = container;
    this.grid = grid;
    this.sourceCanvas = sourceCanvas;
    this.current = null;
    this.raf = 0;
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
  }

  isBusy() {
    return Boolean(this.current);
  }

  clear() {
    this.current = null;

    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }

    this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
  }

  play(payload, startRewardAudio = null) {
    this.clear();
    this.current = this.buildEffect(payload);
    this.current.startRewardAudio = startRewardAudio;
    this.current.startedAt = performance.now();
    this.scheduleFrame();
  }

  scheduleFrame() {
    if (!this.current || this.raf) return;
    this.raf = requestAnimationFrame((time) => this.frame(time));
  }

  createLogicalCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = this.grid.width;
    canvas.height = this.grid.height;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.imageSmoothingEnabled = false;

    return canvas;
  }

  captureSourceSnapshot(groups) {
    if (!this.sourceCanvas) return null;

    const snapshotCanvas = this.createLogicalCanvas();
    const selectionMask = this.createLogicalCanvas();
    const snapshotCtx = snapshotCanvas.getContext('2d');
    const maskCtx = selectionMask.getContext('2d');

    if (!snapshotCtx || !maskCtx) return null;

    snapshotCtx.drawImage(this.sourceCanvas, 0, 0);
    maskCtx.fillStyle = '#fff';

    for (const group of groups) {
      for (const index of group.cells) {
        const x = index % this.grid.width;
        const y = Math.floor(index / this.grid.width);
        maskCtx.fillRect(x, y, 1, 1);
      }
    }

    snapshotCtx.save();
    snapshotCtx.globalCompositeOperation = 'destination-in';
    snapshotCtx.drawImage(selectionMask, 0, 0);
    snapshotCtx.restore();

    const imageData = snapshotCtx.getImageData(
      0,
      0,
      snapshotCanvas.width,
      snapshotCanvas.height
    );

    compensateSnapshotPixelsForDisplay(imageData.data);
    snapshotCtx.putImageData(imageData, 0, 0);

    return snapshotCanvas;
  }

  buildEffect({ groups, cleared, combo }) {
    const particles = [];
    const effectSeed = ++this.effectSerial;

    for (const group of groups) {
      for (const index of group.cells) {
        const gridX = index % this.grid.width;
        const gridY = Math.floor(index / this.grid.width);

        particles.push({
          gridX,
          gridY,
          color: group.color,
          clearRandom: getParticleClearRandom(
            gridX,
            gridY,
            group.color,
            effectSeed
          )
        });
      }
    }

    const bounds = getClearBounds(particles);
    const snapshotCanvas = this.captureSourceSnapshot(groups);
    const maskCanvas = this.createLogicalCanvas();
    const frameCanvas = this.createLogicalCanvas();

    const flyerStep = Math.max(
      1,
      Math.floor(particles.length / WIND_FLYER_LIMIT)
    );
    const dustStep = Math.max(
      1,
      Math.floor(particles.length / WIND_DUST_LIMIT)
    );

    const flyers = [];
    const dust = [];

    for (let i = 0; i < particles.length; i += flyerStep) {
      const particle = particles[i];
      const r1 = hash01(particle.gridX, particle.gridY, effectSeed);
      const r2 = hash01(particle.gridY, particle.gridX, effectSeed + 9);

      flyers.push({
        ...particle,
        speed: 0.78 + r1 * 0.55,
        lift: 11 + r2 * 34,
        drift: 34 + r1 * 76,
        phase: r2 * Math.PI * 2,
        size: 0.7 + r1 * 1.3
      });

      if (flyers.length >= WIND_FLYER_LIMIT) break;
    }

    for (let i = Math.floor(dustStep / 2); i < particles.length; i += dustStep) {
      const particle = particles[i];
      const r1 = hash01(particle.gridX, particle.gridY, effectSeed + 17);
      const r2 = hash01(particle.gridY, particle.gridX, effectSeed + 31);

      dust.push({
        ...particle,
        speed: 0.55 + r1 * 0.6,
        lift: 20 + r2 * 54,
        drift: 50 + r1 * 100,
        phase: r1 * Math.PI * 2,
        size: 0.35 + r2 * 0.65
      });

      if (dust.length >= WIND_DUST_LIMIT) break;
    }

    return {
      groups,
      cleared,
      combo,
      effectSeed,
      particles,
      flyers,
      dust,
      bounds,
      scoreColor: getDominantClearColor(groups),
      snapshotCanvas,
      maskCanvas,
      maskCtx: maskCanvas.getContext('2d'),
      frameCanvas,
      frameCtx: frameCanvas.getContext('2d'),
      startedAt: 0,
      startRewardAudio: null,
      clearedVisual: 0
    };
  }

  frame(time) {
    this.raf = 0;
    if (!this.current) return;

    const elapsed = Math.max(0, time - this.current.startedAt);
    const progress = clamp(elapsed / WIND_EFFECT_TOTAL_MS, 0, 1);

    this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);

    this.drawWindStreaks(progress);
    this.drawErodedSnapshot(progress);
    this.drawFlyingParticles(progress, this.current.flyers, false);
    this.drawFlyingParticles(progress, this.current.dust, true);
    this.drawScore(progress);

    if (progress >= 1) {
      const finished = this.current;
      this.current = null;

      try {
        finished.startRewardAudio?.();
      } catch {
        // Reward audio must never block effect completion.
      }

      this.ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      return;
    }

    this.scheduleFrame();
  }

  drawErodedSnapshot(progress) {
    const effect = this.current;
    const {
      maskCtx,
      frameCtx,
      maskCanvas,
      frameCanvas,
      snapshotCanvas,
      bounds
    } = effect;

    if (!snapshotCanvas || !maskCtx || !frameCtx) return;

    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCtx.fillStyle = '#fff';

    const range = Math.max(1, bounds.maxX - bounds.minX + 1);
    const sweep = easeOutCubic(clamp(progress / 0.9, 0, 1));
    const frontX = bounds.minX - 7 + (range + 18) * sweep;
    let remaining = 0;

    for (const particle of effect.particles) {
      const erosion =
        frontX +
        getWindErosionOffset(
          particle.gridX,
          particle.gridY,
          effect.effectSeed
        );

      const survives = progress < 0.96 && particle.gridX > erosion;

      if (survives) {
        maskCtx.fillRect(particle.gridX, particle.gridY, 1, 1);
        remaining += 1;
      }
    }

    effect.clearedVisual = effect.particles.length - remaining;

    frameCtx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
    frameCtx.globalCompositeOperation = 'source-over';
    frameCtx.drawImage(snapshotCanvas, 0, 0);
    frameCtx.globalCompositeOperation = 'destination-in';
    frameCtx.drawImage(maskCanvas, 0, 0);
    frameCtx.globalCompositeOperation = 'source-over';

    this.ctx.save();
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(
      frameCanvas,
      0,
      0,
      this.cssWidth,
      this.cssHeight
    );
    this.ctx.restore();
  }

  getReleaseProgress(particle) {
    const { bounds } = this.current;
    const range = Math.max(1, bounds.maxX - bounds.minX + 1);

    return clamp(
      ((particle.gridX - bounds.minX) / range) * 0.72,
      0,
      0.72
    );
  }

  drawFlyingParticles(progress, particles, isDust) {
    const cellW = this.cssWidth / this.grid.width;
    const cellH = this.cssHeight / this.grid.height;

    this.ctx.save();
    this.ctx.globalCompositeOperation = isDust ? 'lighter' : 'source-over';

    for (const particle of particles) {
      const release = this.getReleaseProgress(particle);
      const local = clamp(
        (progress - release) / Math.max(0.001, 1 - release),
        0,
        1
      );

      if (local <= 0 || local >= 1) continue;

      const eased = easeOutCubic(local);
      const alpha =
        (isDust ? 0.34 : 0.88) *
        Math.sin(Math.PI * smoothstep(local));

      if (alpha <= 0.01) continue;

      const startX = (particle.gridX + 0.5) * cellW;
      const startY = (particle.gridY + 0.5) * cellH;

      const x =
        startX +
        particle.drift * eased +
        Math.sin(particle.phase + local * 8) * (isDust ? 10 : 5);
      const y =
        startY -
        particle.lift * eased -
        Math.sin(particle.phase + local * 4) * (isDust ? 5 : 2);

      const rgb = getParticleRgb(
        particle.gridX,
        particle.gridY,
        particle.color,
        isDust ? 9 : 3
      );

      this.ctx.fillStyle = rgbToCss(rgb, alpha);

      if (isDust) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(-0.18 + Math.sin(particle.phase + local * 3) * 0.12);
        this.ctx.fillRect(
          -particle.size * 1.8,
          -particle.size * 0.45,
          particle.size * 3.6,
          particle.size * 0.9
        );
        this.ctx.restore();
      }
    }

    this.ctx.restore();
  }

  drawWindStreaks(progress) {
    if (progress <= 0.04 || progress >= 0.94) return;

    const effect = this.current;
    const { bounds } = effect;
    const cellW = this.cssWidth / this.grid.width;
    const cellH = this.cssHeight / this.grid.height;
    const range = Math.max(1, bounds.maxX - bounds.minX + 1);
    const front =
      (bounds.minX - 4 + (range + 12) * easeOutCubic(progress / 0.94)) *
      cellW;

    this.ctx.save();
    this.ctx.lineCap = 'round';

    for (let i = 0; i < 7; i++) {
      const y =
        (bounds.minY + ((i + 0.7) / 7) * (bounds.maxY - bounds.minY + 1)) *
        cellH;
      const wave = Math.sin(progress * 9 + i * 1.7);
      const length = 18 + (i % 3) * 9;

      this.ctx.beginPath();
      this.ctx.moveTo(front - length, y + wave * 4);
      this.ctx.quadraticCurveTo(
        front - length * 0.45,
        y - 5 - wave * 2,
        front + 7,
        y + wave * 2
      );
      this.ctx.strokeStyle = `rgba(255,255,255,${0.08 + (i % 2) * 0.045})`;
      this.ctx.lineWidth = 1 + (i % 2) * 0.6;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawScore(progress) {
    const value = Math.min(
      this.current.particles.length,
      Math.max(0, this.current.clearedVisual)
    );

    if (value <= 0) return;

    const fontSize = clamp(this.cssWidth * 0.09, 29, 44);
    const anchor = getScoreAnchor({
      bounds: this.current.bounds,
      gridWidth: this.grid.width,
      gridHeight: this.grid.height,
      cssWidth: this.cssWidth,
      cssHeight: this.cssHeight,
      fontSize
    });

    const hop = Math.sin(progress * Math.PI * 10) * 1.8;
    const rgb = COLOR_MAP[this.current.scoreColor] ?? COLOR_MAP[1];

    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font =
      `900 ${fontSize}px "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif`;
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = Math.max(4, fontSize * 0.13);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.98)';
    this.ctx.strokeText(`+${value}`, anchor.x, anchor.y + hop);
    this.ctx.fillStyle = rgbToCss(rgb, 1);
    this.ctx.fillText(`+${value}`, anchor.x, anchor.y + hop);
    this.ctx.restore();
  }
}
