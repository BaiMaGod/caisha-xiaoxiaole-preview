import { SandRenderer } from '../SandRenderer.js';
import { GameSession } from './GameSession.js';
import { CLEAR_EFFECTS, CLEAR_EFFECT_IDS } from '../clear-effects/ClearEffectRegistry.js';
import { getParticleRgb, SETTLED_PARTICLE_INSET, SETTLED_PARTICLE_SIZE } from '../colors.js';
import { getRewardVoicePath } from '../RewardVoicePaths.js';
import { CONFIG } from '../config.js';
import { renderArtworkPoster } from '../ui/PosterRenderer.js';
import {
  CLEAR_EFFECT_TOTAL_MS,
  getClearBounds,
  getParticleClearRandom,
  isParticleJumpCleared
} from '../clear-effects/effects/DefaultJumpEffect.js';
import {
  WIND_EFFECT_TOTAL_MS,
  getWindErosionOffset,
  getWindFrontX,
  getWindParticleHitProgress
} from '../clear-effects/effects/WindDissolveEffect.js';

const DESIGN_W = 405;
const DESIGN_H = 720;
const ART_BG = '#fff8ea';

function rounded(ctx, x, y, w, h, radius, fill, stroke = null) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function label(ctx, value, x, y, size = 18, color = '#654735', align = 'center', weight = 700) {
  ctx.font = `${weight} ${size}px sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(String(value), x, y);
}

function hit(rect, x, y) {
  return x >= rect.x && y >= rect.y && x <= rect.x + rect.w && y <= rect.y + rect.h;
}

function fruitKey(fruit) {
  if (!fruit) return '';
  return [
    fruit.state, fruit.x, fruit.y, fruit.color,
    Math.round(fruit.impactTimer ?? 0),
    Math.round(fruit.breakTimer ?? 0), fruit.dissolvedCount ?? 0
  ].join(':');
}

export class CanvasGame {
  constructor(platform) {
    this.platform = platform;
    this.debugEffectUiEnabled = Boolean(
      platform.debugMode && CONFIG.DEBUG_SHOW_CLEAR_EFFECT_BUTTON
    );
    this.screen = 'home';
    this.returnScreen = 'home';
    this.hidden = false;
    this.buttons = [];
    this.drag = null;
    this.adPending = false;
    this.effectScroll = 0;
    this.effectMaxScroll = 0;
    this.effect = null;
    this.effectSerial = 0;
    this.displayScore = 0;
    this.artwork = null;
    this.overRating = 'GOOD';
    this.toastText = '';
    this.toastUntil = 0;
    this.lastTime = 0;
    this.lastRevision = -1;
    this.lastFruit = '';
    this.lastScreen = '';
    this.needsDraw = true;
    this.performance = {
      since: 0, frames: 0, updateMs: 0, drawMs: 0, maxDrawMs: 0
    };

    this.session = new GameSession({
      storage: platform.storage,
      onBeforeClear: (payload) => this.beginClearEffect(payload),
      onClear: (payload) => this.handleClear(payload),
      onGameOver: (payload) => this.handleGameOver(payload)
    });

    this.metrics = this.getMetrics();
    this.renderer = new SandRenderer(this.session.grid, {
      displayCanvas: platform.canvas,
      createCanvas: () => platform.createOffscreenCanvas(),
      getDisplayMetrics: () => this.metrics
    });
    this.ctx = this.renderer.displayCtx;
    this.titleImage = platform.loadImage('images/qicai_title_mobile.png');
    this.startImage = platform.loadImage('images/start_game_button_v3.png');
    if (this.titleImage) this.titleImage.onload = () => { this.needsDraw = true; };
    if (this.startImage) this.startImage.onload = () => { this.needsDraw = true; };

    platform.onInput((event) => this.onInput(event));
    platform.onResize(() => {
      this.metrics = this.getMetrics();
      this.lastRevision = -1;
      this.needsDraw = true;
    });
    platform.onVisibility((visible) => {
      this.hidden = !visible;
      this.lastTime = 0;
      if (!visible) platform.stopSounds();
      else this.needsDraw = true;
    });

    this.frame = this.frame.bind(this);
    platform.requestFrame(this.frame);
  }

  getMetrics() {
    const { width, height, dpr, safeTop = 0 } = this.platform.getScreenInfo();
    const boardWidth = Math.min(width, height * 9 / 16);
    const boardHeight = boardWidth * 16 / 9;
    return {
      width, height, dpr, safeTop,
      stageHeight: height * DESIGN_W / boardWidth,
      viewport: {
        x: (width - boardWidth) / 2,
        y: (height - boardHeight) / 2,
        width: boardWidth,
        height: boardHeight
      }
    };
  }

  topControlsY() {
    return Math.max(18,
      this.metrics.safeTop * DESIGN_W / this.metrics.viewport.width + 8);
  }

  frame(time) {
    this.platform.requestFrame(this.frame);
    if (this.hidden) return;
    const now = Number.isFinite(time) ? time : Date.now();
    const dt = this.lastTime ? Math.min(50, Math.max(0, now - this.lastTime)) : 0;
    this.lastTime = now;

    if (this.effect && !this.isEffectBusy(now)) {
      if (this.effect.audioPath) this.platform.playSound(this.effect.audioPath);
      if (this.effect.score != null) this.displayScore = this.effect.score;
      this.effect = null;
    }

    const updateStart = this.platform.debugPerformance ? Date.now() : 0;
    if ((this.screen === 'playing' || this.screen === 'home') &&
      !this.isEffectBusy(now)) {
      this.session.update(dt, now);
    }
    if (this.platform.debugPerformance) {
      this.performance.updateMs += Date.now() - updateStart;
    }
    if (this.toastText && now >= this.toastUntil) {
      this.toastText = '';
      this.needsDraw = true;
    }
    if (this.screen !== 'playing' && this.screen !== 'home' && !this.needsDraw) return;
    const drawStart = this.platform.debugPerformance ? Date.now() : 0;
    this.draw(now);
    this.needsDraw = false;
    if (this.platform.debugPerformance) {
      const perf = this.performance;
      const drawMs = Date.now() - drawStart;
      perf.drawMs += drawMs;
      perf.maxDrawMs = Math.max(perf.maxDrawMs, drawMs);
      perf.frames += 1;
      if (!perf.since) perf.since = now;
      if (now - perf.since >= 1000) {
        const seconds = (now - perf.since) / 1000;
        console.info(`game perf fps=${(perf.frames / seconds).toFixed(1)} ` +
          `update=${(perf.updateMs / perf.frames).toFixed(1)}ms ` +
          `draw=${(perf.drawMs / perf.frames).toFixed(1)}ms ` +
          `maxDraw=${perf.maxDrawMs}ms`);
        perf.since = now;
        perf.frames = 0;
        perf.updateMs = 0;
        perf.drawMs = 0;
        perf.maxDrawMs = 0;
      }
    }
  }

  isEffectBusy(now) {
    return this.effect && now - this.effect.startedAt < this.effect.duration;
  }

  renderBoard() {
    const activeBoard = this.session.mode === 'playing' || this.session.mode === 'home';
    const fruit = activeBoard ? this.session.fruitManager.current : null;
    const key = fruitKey(fruit);
    if (
      this.lastRevision !== this.session.grid.revision ||
      this.lastFruit !== key ||
      this.lastScreen !== this.screen
    ) {
      this.renderer.update(fruit, false, activeBoard);
      this.lastRevision = this.session.grid.revision;
      this.lastFruit = key;
      this.lastScreen = this.screen;
    }
    this.renderer.present();
  }

  draw(now) {
    this.renderBoard();
    this.buttons.length = 0;
    const { x, width } = this.metrics.viewport;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, 0);
    ctx.scale(width / DESIGN_W, width / DESIGN_W);

    if (this.screen === 'home') this.drawHome();
    else if (this.screen === 'playing') this.drawPlaying(now);
    else if (this.screen === 'paused') this.drawPaused();
    else if (this.screen === 'over') this.drawOver();
    else if (this.screen === 'effects') this.drawEffects();

    if (this.toastText && now < this.toastUntil) {
      rounded(ctx, 65, 620, 275, 42, 18, 'rgba(48,38,65,0.88)');
      label(ctx, this.toastText, 202, 641, 14, '#fff');
    }
    ctx.restore();
  }

  button(id, title, x, y, w, h, action, primary = true) {
    const ctx = this.ctx;
    rounded(ctx, x, y, w, h, h / 2,
      primary ? '#ff8057' : '#fff7eb',
      primary ? null : 'rgba(107,75,52,0.18)');
    label(ctx, title, x + w / 2, y + h / 2 + 1, h >= 50 ? 18 : 15,
      primary ? '#fff' : '#77543d');
    this.buttons.push({ id, x, y, w, h, action });
  }

  drawHome() {
    const ctx = this.ctx;
    const topY = this.topControlsY();
    const shade = ctx.createLinearGradient(0, 0, 0, 270);
    shade.addColorStop(0, 'rgba(255,248,234,0.97)');
    shade.addColorStop(0.55, 'rgba(255,248,234,0.78)');
    shade.addColorStop(1, 'rgba(255,248,234,0)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, DESIGN_W, 270);

    rounded(ctx, 18, topY, 88, 40, 20, 'rgba(255,255,255,0.9)', 'rgba(105,78,55,.10)');
    label(ctx, `🏆 最高  ${this.session.progress.state.stats.bestScore}`, 62, topY + 20, 11, '#664c37');
    if (this.debugEffectUiEnabled) {
      this.button('effects', '✨ 消除特效', 289, topY, 98, 40,
        () => this.openEffects(), false);
    }

    const titleY = Math.max(96, topY + 36);
    if (this.titleImage?.width > 0) {
      try { ctx.drawImage(this.titleImage, 28, titleY, 349, 58); } catch {}
    } else {
      label(ctx, '七彩沙画消除', 202, titleY + 27, 38, '#d45b70');
    }

    const start = () => this.startGame();
    const startY = this.metrics.stageHeight / 2 - 44;
    if (this.startImage?.width > 0) {
      try {
        const sourceWidth = this.startImage.width;
        const sourceHeight = this.startImage.height;
        const cropWidth = sourceWidth * 280 / 520;
        ctx.drawImage(this.startImage, (sourceWidth - cropWidth) / 2, 0,
          cropWidth, sourceHeight, 47, startY, 311, 88);
        this.buttons.push({ id: 'start', x: 47, y: startY, w: 311, h: 88, action: start });
      } catch { this.button('start', '开始游戏', 47, startY, 311, 88, start); }
    } else {
      this.button('start', '开始游戏', 47, startY, 311, 88, start);
    }
  }

  drawPlaying(now) {
    const ctx = this.ctx;
    const topY = this.topControlsY();
    rounded(ctx, 12, topY, 112, 58, 15, 'rgba(255,255,255,0.91)');
    label(ctx, 'SCORE', 25, topY + 16, 11, '#a48771', 'left');
    label(ctx, this.displayScore, 25, topY + 39, 22, '#5b3e2d', 'left');
    if (this.debugEffectUiEnabled) {
      this.button('effects', '特效', 331, topY + 5, 62, 38,
        () => this.openEffects(), false);
    }
    this.button('pause', '暂停', 257, topY + 5, 66, 38,
      () => this.pauseGame(), false);
    if (this.session.dropCount < 3) {
      const tipY = this.metrics.viewport.y * DESIGN_W / this.metrics.viewport.width +
        CONFIG.DEATH_LINE_Y / CONFIG.HEIGHT * DESIGN_H - 32;
      rounded(ctx, 94, tipY, 217, 31, 16, 'rgba(255,255,255,0.88)');
      label(ctx, '左右拖动 · 松手下落 · 下滑×2', 202, tipY + 16, 11, '#80634d');
    }
    if (this.effect && now - this.effect.startedAt < this.effect.duration) {
      this.drawClearEffect(now);
    }
  }

  drawPaused() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(30,24,47,0.72)';
    ctx.fillRect(0, 0, DESIGN_W, this.metrics.stageHeight);
    rounded(ctx, 39, 236, 327, 252, 24, '#fff9ec');
    label(ctx, '游戏已暂停', 202, 285, 28, '#6b4938');
    this.button('resume', '继续游戏', 65, 335, 275, 55,
      () => this.resumeGame());
    this.button('home', '返回首页', 65, 410, 275, 46,
      () => this.goHome(), false);
  }

  drawOver() {
    const ctx = this.ctx;
    const bg = ctx.createLinearGradient(0, 0, 0, this.metrics.stageHeight);
    bg.addColorStop(0, '#fffaf2');
    bg.addColorStop(0.65, '#f8ebda');
    bg.addColorStop(1, '#fff8ed');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, DESIGN_W, this.metrics.stageHeight);
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle = i % 3 === 0 ? 'rgba(145,105,72,.08)' : 'rgba(255,255,255,.28)';
      ctx.fillRect((i * 113.7) % DESIGN_W, (i * 59.3) % this.metrics.stageHeight, 1, 1);
    }
    const offsetY = Math.max(0, (this.topControlsY() - 18) * 0.5);
    ctx.save();
    ctx.translate(0, offsetY);
    label(ctx, '本局沙画完成', 202, 27, 11, '#b29a82', 'center', 700);

    const wood = ctx.createLinearGradient(98, 44, 307, 416);
    wood.addColorStop(0, '#b97943');
    wood.addColorStop(0.35, '#e2ae71');
    wood.addColorStop(0.7, '#bd8049');
    wood.addColorStop(1, '#e7bb80');
    ctx.save();
    ctx.shadowColor = 'rgba(75,45,25,.23)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;
    rounded(ctx, 98, 44, 209, 372, 9, wood);
    ctx.restore();
    for (let i = 0; i < 16; i++) {
      const yy = 54 + i * 22;
      ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,.08)' : 'rgba(88,49,23,.1)';
      ctx.beginPath();
      ctx.moveTo(104, yy);
      ctx.lineTo(301, yy + (i % 3) - 1);
      ctx.stroke();
    }
    rounded(ctx, 110, 57, 185, 346, 4, '#f8efdf');
    rounded(ctx, 120, 85, 165, 292, 2, '#fff8ea');
    if (this.artwork) ctx.drawImage(this.artwork, 120, 85, 165, 292);

    label(ctx, '这一局，拼出了一幅不错的沙画', 202, 448, 18, '#664832');
    label(ctx, '分享给好友看看你的作品', 202, 476, 12, '#967d69');
    rounded(ctx, 151, 491, 103, 30, 15, 'rgba(255,255,255,.7)');
    label(ctx, `${this.session.clearSystem.score} 分 · ${this.overRating}`,
      202, 506, 12, '#78543a');

    rounded(ctx, 32, 535, 165, 46, 15, 'rgba(255,255,255,.78)', '#e9ddcf');
    label(ctx, '↗ 分享好友', 114, 558, 13, '#715039');
    this.buttons.push({ id: 'share', x: 32, y: 535 + offsetY, w: 165, h: 46,
      action: () => this.shareArtwork() });
    rounded(ctx, 208, 535, 165, 46, 15, 'rgba(255,255,255,.78)', '#e9ddcf');
    label(ctx, '▣ 保存相册', 290, 558, 13, '#715039');
    this.buttons.push({ id: 'save', x: 208, y: 535 + offsetY, w: 165, h: 46,
      action: () => this.saveArtwork() });
    rounded(ctx, 32, 591, 341, 55, 18, '#ff805f');
    label(ctx, '再来一局', 202, 619, 18, '#fff');
    this.buttons.push({ id: 'again', x: 32, y: 591 + offsetY, w: 341, h: 55,
      action: () => this.startGame() });
    label(ctx, '返回首页', 202, 670, 12, '#8f7461');
    this.buttons.push({ id: 'home', x: 135, y: 650 + offsetY, w: 135, h: 40,
      action: () => this.goHome() });
    ctx.restore();
  }

  drawEffects() {
    const ctx = this.ctx;
    const stageH = this.metrics.stageHeight;
    const panelTop = Math.max(20, this.topControlsY() + 2);
    ctx.fillStyle = 'rgba(75,58,43,0.43)';
    ctx.fillRect(0, 0, DESIGN_W, stageH);
    rounded(ctx, 16, panelTop, 373, stageH - panelTop - 20, 25, '#fffaf3');
    label(ctx, '消除特效', 36, panelTop + 41, 25, '#6f4c39', 'left');
    this.button('back', '关闭', 315, panelTop + 16, 57, 35,
      () => this.closeEffects(), false);
    const stats = this.session.progress.state.stats;
    const selected = CLEAR_EFFECTS.find((item) =>
      item.id === this.session.progress.getSelectedEffectId());
    label(ctx, `当前：${selected?.name ?? '彩沙跳消'} · 最高分 ${stats.bestScore} · 累计消除 ${stats.totalClearedParticles} 粒`,
      36, panelTop + 71, 10, '#927765', 'left', 600);

    const heights = CLEAR_EFFECTS.map((effect) => effect.implemented ? 176 : 142);
    const totalHeight = heights.reduce((a, b) => a + b, 0) + (heights.length - 1) * 12;
    const listTop = panelTop + 94;
    const listBottom = stageH - 34;
    this.effectListTop = listTop;
    this.effectListBottom = listBottom;
    this.effectMaxScroll = Math.max(0, listTop + totalHeight - listBottom);
    this.effectScroll = Math.max(0, Math.min(this.effectScroll, this.effectMaxScroll));
    ctx.save();
    ctx.beginPath();
    ctx.rect(25, listTop - 3, 355, listBottom - listTop + 3);
    ctx.clip();
    let y = listTop - this.effectScroll;
    for (let i = 0; i < CLEAR_EFFECTS.length; i++) {
      const effect = CLEAR_EFFECTS[i];
      const h = heights[i];
      if (y + h < listTop || y > listBottom) {
        y += h + 12;
        continue;
      }
      rounded(ctx, 35, y, 335, h, 18,
        this.session.progress.getSelectedEffectId() === effect.id ? '#fff5e9' : '#fff',
        this.session.progress.getSelectedEffectId() === effect.id ? '#ff9f7b' : '#eee4da');
      rounded(ctx, 52, y + 16, 43, 43, 13,
        effect.id === CLEAR_EFFECT_IDS.WIND ? '#e6f8fd' : '#fff2e4');
      label(ctx, effect.icon, 73, y + 38, 24, '#6a4936');
      label(ctx, `${effect.name}${effect.implemented ? '' : ' · 敬请期待'}`,
        111, y + 34, 16, '#6a4936', 'left');
      label(ctx, effect.rarity, 111, y + 56, 11, '#b17a55', 'left');
      label(ctx, effect.description, 52, y + 81, 11, '#896a54', 'left', 500);
      const unlocked = this.session.progress.isUnlocked(effect.id);
      const selectedEffect = this.session.progress.getSelectedEffectId() === effect.id;
      const requirement = effect.unlock?.type === 'ad'
        ? `观看 ${effect.unlock.value} 次激励广告`
        : effect.unlock?.type === 'score'
          ? `最高分达到 ${effect.unlock.value}`
          : effect.unlock?.type === 'total_clear'
            ? `累计消除 ${effect.unlock.value} 粒`
            : '默认拥有';
      label(ctx, unlocked ? '✓ 已解锁' : requirement,
        52, y + 109, 11, unlocked ? '#4e9b70' : '#9a7254', 'left');
      const actionVisible = y + 126 >= listTop && y + 158 <= listBottom;
      if (selectedEffect) {
        if (effect.implemented && actionVisible) this.button(`selected-${effect.id}`, '已装备', 52, y + 126, 86, 32,
          () => {}, true);
      } else if (unlocked && effect.implemented && actionVisible) {
        this.button(`equip-${effect.id}`, '装备', 52, y + 126, 70, 32,
          () => {
            this.session.progress.selectEffect(effect.id);
            this.needsDraw = true;
          });
      } else if (effect.implemented && effect.unlock?.type === 'ad' &&
        this.platform.rewardedAdAvailable && actionVisible) {
        if (this.adPending) {
          label(ctx, '广告加载中', 52, y + 141, 13, '#ae9280', 'left');
        } else {
          this.button(`ad-${effect.id}`, '看广告', 52, y + 126, 87, 32,
            () => this.unlockWithAd(effect.id));
        }
      }
      y += h + 12;
    }
    ctx.restore();
  }

  onInput({ type, x, y }) {
    if (this.hidden) return;
    const b = this.metrics.viewport;
    const dx = (x - b.x) * DESIGN_W / b.width;
    const dy = y * DESIGN_W / b.width;
    if (type === 'start') {
      const button = this.buttons.findLast?.((item) => hit(item, dx, dy)) ??
        [...this.buttons].reverse().find((item) => hit(item, dx, dy));
      if (button) {
        this.drag = { kind: 'button', button, x: dx, y: dy };
        return;
      }
      if (this.screen === 'effects' && dy >= this.effectListTop - 3 &&
        dy <= this.effectListBottom) {
        this.drag = { kind: 'scroll', y: dy, start: this.effectScroll };
        return;
      }
      if (this.screen !== 'playing' || dx < 0 || dx > DESIGN_W || dy < 0 || dy > DESIGN_H) return;
      this.drag = { x: dx, y: dy, fast: false };
      this.session.setPointerX(dx / DESIGN_W * this.session.grid.width);
    } else if (type === 'move' && this.drag) {
      if (this.drag.kind === 'button') {
        const distance = Math.hypot(dx - this.drag.x, dy - this.drag.y);
        if (distance <= 12) return;
        if (this.screen === 'effects' &&
          this.drag.y >= this.effectListTop - 3 &&
          this.drag.y <= this.effectListBottom) {
          this.drag = { kind: 'scroll', y: this.drag.y, start: this.effectScroll };
        } else {
          this.drag = null;
          return;
        }
      }
      if (this.drag.kind === 'scroll') {
        this.effectScroll = Math.max(0, Math.min(this.effectMaxScroll,
          this.drag.start + this.drag.y - dy));
        this.needsDraw = true;
        return;
      }
      this.session.setPointerX(dx / DESIGN_W * this.session.grid.width);
      const deltaX = dx - this.drag.x;
      const deltaY = dy - this.drag.y;
      if (!this.drag.fast && deltaY > 24 && deltaY > Math.abs(deltaX) * 0.6) {
        const result = this.session.startFastDrop();
        this.drag.fast = result.active;
      }
    } else if ((type === 'end' || type === 'cancel') && this.drag) {
      if (this.drag.kind === 'button') {
        const button = this.drag.button;
        this.drag = null;
        if (type === 'end' && hit(button, dx, dy)) button.action();
        return;
      }
      if (this.drag.kind === 'scroll') {
        this.drag = null;
        return;
      }
      this.session.setPointerX(dx / DESIGN_W * this.session.grid.width);
      this.session.releaseFruit();
      this.drag = null;
    }
  }

  startGame() {
    this.session.start();
    this.screen = 'playing';
    this.artwork = null;
    this.effect = null;
    this.displayScore = 0;
    this.lastRevision = -1;
    this.needsDraw = true;
  }

  pauseGame() {
    if (this.screen !== 'playing') return;
    this.screen = 'paused';
    this.drag = null;
    this.platform.stopSounds();
    this.needsDraw = true;
  }

  resumeGame() {
    if (this.screen !== 'paused') return;
    this.screen = 'playing';
    this.lastTime = 0;
    this.needsDraw = true;
  }

  goHome() {
    this.session.goHome();
    this.screen = 'home';
    this.platform.stopSounds();
    this.lastRevision = -1;
    this.needsDraw = true;
  }

  openEffects() {
    if (!this.debugEffectUiEnabled) return;
    this.returnScreen = this.screen;
    this.screen = 'effects';
    this.effectScroll = 0;
    this.needsDraw = true;
  }

  closeEffects() {
    this.screen = this.returnScreen;
    this.needsDraw = true;
  }

  async unlockWithAd(effectId) {
    if (this.adPending) return;
    this.adPending = true;
    this.needsDraw = true;
    try {
      const completed = await this.platform.showRewardedAd();
      if (completed) {
        this.session.unlockManager.completeAd(effectId);
        this.toast('特效已解锁');
      } else {
        this.toast('广告未完成，未发放奖励');
      }
    } catch {
      this.toast('广告暂时不可用');
    } finally {
      this.adPending = false;
      this.needsDraw = true;
    }
  }

  beginClearEffect({ groups }) {
    const particles = [];
    const seed = ++this.effectSerial;
    for (const group of groups) {
      for (const index of group.cells) {
        const gridX = index % this.session.grid.width;
        const gridY = Math.floor(index / this.session.grid.width);
        particles.push({ gridX, gridY, color: group.color,
          clearRandom: getParticleClearRandom(gridX, gridY, group.color, seed) });
      }
    }
    const canvas = this.platform.createOffscreenCanvas();
    canvas.width = this.session.grid.width;
    canvas.height = this.session.grid.height;
    const id = this.session.progress.getSelectedEffectId();
    const bounds = getClearBounds(particles);
    const flyers = [];
    if (id === CLEAR_EFFECT_IDS.WIND) {
      const step = Math.max(1, Math.floor(particles.length / 240));
      for (let i = 0; i < particles.length && flyers.length < 240; i += step) {
        const particle = particles[i];
        flyers.push({ ...particle,
          hitProgress: getWindParticleHitProgress(particle, bounds, seed),
          life: .14 + particle.clearRandom * .11,
          phase: particle.clearRandom * Math.PI * 2,
          dust: i % 3 === 0 });
      }
    }
    this.effect = { canvas, ctx: canvas.getContext('2d'), particles,
      bounds, flyers, seed, startedAt: this.lastTime,
      duration: id === CLEAR_EFFECT_IDS.WIND ? WIND_EFFECT_TOTAL_MS : CLEAR_EFFECT_TOTAL_MS,
      id, cleared: 0, rating: '', score: null, audioPath: null,
      lastRenderAt: -Infinity };
  }

  drawClearEffect(now) {
    const effect = this.effect;
    if (!effect) return;
    const elapsed = Math.max(0, now - effect.startedAt);
    const progress = Math.min(1, elapsed / effect.duration);
    if (now - effect.lastRenderAt >= 30) {
      const frameCtx = effect.ctx;
      frameCtx.clearRect(0, 0, effect.canvas.width, effect.canvas.height);
      const windFront = effect.id === CLEAR_EFFECT_IDS.WIND
        ? getWindFrontX(progress, effect.bounds) : 0;
      for (const particle of effect.particles) {
        const removed = effect.id === CLEAR_EFFECT_IDS.WIND
          ? particle.gridX <= windFront +
            getWindErosionOffset(particle.gridX, particle.gridY, effect.seed)
          : isParticleJumpCleared(elapsed, particle, effect.bounds);
        if (removed) continue;
        const rgb = getParticleRgb(particle.gridX, particle.gridY, particle.color);
        frameCtx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        frameCtx.fillRect(particle.gridX + SETTLED_PARTICLE_INSET,
          particle.gridY + SETTLED_PARTICLE_INSET,
          SETTLED_PARTICLE_SIZE, SETTLED_PARTICLE_SIZE);
      }
      effect.lastRenderAt = now;
    }
    const ctx = this.ctx;
    const boardTop = this.metrics.viewport.y * DESIGN_W / this.metrics.viewport.width;
    ctx.drawImage(effect.canvas, 0, boardTop, DESIGN_W, DESIGN_H);
    if (effect.id === CLEAR_EFFECT_IDS.WIND) {
      const frontX = getWindFrontX(progress, effect.bounds) /
        this.session.grid.width * DESIGN_W;
      ctx.save();
      ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) {
        const yy = boardTop + (effect.bounds.minY +
          (i + 0.7) / 7 * (effect.bounds.maxY - effect.bounds.minY + 1)) /
          this.session.grid.height * DESIGN_H;
        ctx.beginPath();
        ctx.moveTo(frontX - 30, yy + Math.sin(progress * 9 + i) * 4);
        ctx.quadraticCurveTo(frontX - 13, yy - 5, frontX + 8, yy);
        ctx.strokeStyle = 'rgba(255,255,255,.22)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      for (const flyer of effect.flyers) {
        const local = (progress - flyer.hitProgress) / flyer.life;
        if (local < 0 || local >= 1) continue;
        const eased = 1 - (1 - local) ** 3;
        const x = (flyer.gridX + 0.5) / this.session.grid.width * DESIGN_W +
          85 * eased;
        const y = boardTop + (flyer.gridY + 0.5) /
          this.session.grid.height * DESIGN_H - 27 * eased +
          Math.sin(flyer.phase + local * 8) * 3;
        const rgb = getParticleRgb(flyer.gridX, flyer.gridY, flyer.color, 6);
        ctx.globalAlpha = (1 - local) * (flyer.dust ? .45 : .85);
        ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        if (flyer.dust) {
          ctx.beginPath();
          ctx.arc(x, y, .7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, 4, 1.3);
        }
      }
      ctx.restore();
    }
    const scoreX = (effect.bounds.minX + effect.bounds.maxX + 1) /
      (2 * this.session.grid.width) * DESIGN_W;
    const scoreY = Math.max(55, boardTop + effect.bounds.minY /
      this.session.grid.height * DESIGN_H - 28);
    const visibleCount = Math.max(1, Math.round(effect.cleared * progress));
    label(ctx, `+${visibleCount}`, scoreX, scoreY - Math.sin(progress * Math.PI * 8) * 3,
      29, '#ed7457');
  }

  handleClear({ cleared, score, rating, demo = false }) {
    if (this.effect) {
      this.effect.cleared = cleared;
      this.effect.rating = rating;
      if (!demo) {
        this.effect.score = score;
        this.effect.audioPath = getRewardVoicePath(rating);
      }
    } else if (!demo) {
      this.displayScore = score;
      this.platform.playSound(getRewardVoicePath(rating));
    }
  }

  handleGameOver({ rating = 'GOOD' } = {}) {
    this.artwork = this.renderer.createArtworkCanvas({ scale: 3 });
    this.overRating = rating;
    this.screen = 'over';
    this.platform.stopSounds();
    this.needsDraw = true;
  }

  makePoster() {
    return renderArtworkPoster({
      createCanvas: () => this.platform.createOffscreenCanvas(),
      artworkCanvas: this.artwork,
      score: this.session.clearSystem.score,
      rating: this.overRating
    });
  }

  async shareArtwork() {
    try {
      const result = await this.platform.shareCanvas(this.makePoster(), '七彩沙画消除 · 我的沙画作品');
      this.toast(result || '已打开分享');
    } catch (error) {
      if (error?.name !== 'AbortError') this.toast('分享未完成');
    }
  }

  async saveArtwork() {
    try {
      await this.platform.saveCanvas(this.makePoster());
      this.toast('沙画图片已保存');
    } catch {
      this.toast('保存失败，请检查相册权限');
    }
  }

  toast(message) {
    this.toastText = message;
    this.toastUntil = this.lastTime + 2200;
    this.needsDraw = true;
  }
}
