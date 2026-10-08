import { SandRenderer } from '../SandRenderer.js';
import { GameSession } from './GameSession.js';
import { CLEAR_EFFECTS, CLEAR_EFFECT_IDS } from '../clear-effects/ClearEffectRegistry.js';
import { getParticleRgb, SETTLED_PARTICLE_INSET, SETTLED_PARTICLE_SIZE } from '../colors.js';
import { getRewardVoicePath } from '../RewardVoicePaths.js';
import { CONFIG } from '../config.js';
import { GAME_MODES, ART_COLORS, decodeArtwork } from '../modes/ModeLogic.js';
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
    this.selectedMode = GAME_MODES.ENDLESS;
    this.selectedLevel = 1;
    this.overMode = GAME_MODES.ENDLESS;
    this.levelResult = null;
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
      onGameOver: (payload) => this.handleGameOver(payload),
      onArtComplete: (payload) => this.handleArtComplete(payload),
      onLevelComplete: (payload) => this.handleLevelComplete(payload)
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
      if (!visible) {
        this.session.saveArtDraft();
        platform.stopSounds();
      }
      else this.needsDraw = true;
    });
    platform.onAdAvailabilityChange?.(() => { this.needsDraw = true; });

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
    else if (this.screen === 'modes') this.drawModeSelect();
    else if (this.screen === 'levels') this.drawLevelSelect();
    else if (this.screen === 'gallery') this.drawGallery();
    else if (this.screen === 'win') this.drawLevelWin();
    else if (this.screen === 'fail') this.drawLevelFail();
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

    const start = () => { this.screen = 'modes'; this.needsDraw = true; };
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
    if (this.platform.shareGameAvailable) {
      this.button('share-game', '分享游戏', 110, startY + 106, 185, 42,
        () => this.shareGame(), false);
    }
  }

  drawModeSelect() {
    const ctx = this.ctx, mid = this.metrics.stageHeight / 2;
    ctx.fillStyle = 'rgba(49,34,42,.54)';
    ctx.fillRect(0, 0, DESIGN_W, this.metrics.stageHeight);
    rounded(ctx, 28, mid-185, 349, 371, 24, '#fff8ec');
    label(ctx, '选择玩法', 202, mid-142, 25, '#764a33');
    this.button('endless','🌈 无尽模式',57,mid-115,291,66,
      () => this.startGame(GAME_MODES.ENDLESS,1));
    this.button('level','🏁 关卡模式',57,mid-35,291,66,() => {
      this.screen='levels'; this.needsDraw=true;
    });
    this.button('art','🎨 沙画模式',57,mid+45,291,66,
      () => this.startGame(GAME_MODES.ART,1));
    this.button('gallery','🖼 我的沙画',57,mid+121,145,38,() => {
      this.screen='gallery'; this.needsDraw=true;
    },false);
    this.button('home','返回首页',210,mid+121,136,38,() => this.goHome(),false);
  }

  drawLevelSelect() {
    const ctx = this.ctx;
    const top = Math.max(84, this.metrics.stageHeight / 2 - 270);
    ctx.fillStyle = 'rgba(49,34,42,.58)';
    ctx.fillRect(0, 0, DESIGN_W, this.metrics.stageHeight);
    rounded(ctx, 28, top - 35, 349, 500, 24, '#fff8ec');
    label(ctx, '🏁 关卡挑战 · 12 关', 202, top, 21, '#744d37');
    for (let n = 1; n <= 12; n++) {
      const locked = n > this.session.modeProgress.unlockedLevel;
      const col = (n - 1) % 3;
      const row = Math.floor((n - 1) / 3);
      this.button('level-' + n,
        locked ? '🔒 第' + n + '关' : '第' + n + '关',
        49 + col * 105, top + 47 + row * 87, 97, 70,
        () => { if (!locked) this.startGame(GAME_MODES.LEVEL, n); },
        !locked);
    }
    this.button('back', '返回玩法', 90, top + 408, 225, 45, () => {
      this.screen = 'modes'; this.needsDraw = true;
    }, false);
  }

  drawLevelWin() {
    const ctx=this.ctx, mid=this.metrics.stageHeight/2, result=this.levelResult;
    ctx.fillStyle='rgba(45,31,45,.7)';
    ctx.fillRect(0,0,DESIGN_W,this.metrics.stageHeight);
    rounded(ctx,27,mid-182,351,364,26,'#fff8ec');
    label(ctx,'🎉 第 '+result.level+' 关挑战成功',202,mid-129,23,'#6b4938');
    label(ctx,'⭐'.repeat(result.stars),202,mid-62,30,'#e9a84a');
    label(ctx,'全清 · 使用沙块 '+result.drops+' 个',202,mid-15,16,'#74563d');
    if(result.level<12)this.button('next','下一关',59,mid+24,286,49,
      ()=>this.startGame(GAME_MODES.LEVEL,result.level+1));
    this.button('retry','再玩一次',59,mid+83,139,44,
      ()=>this.startGame(GAME_MODES.LEVEL,result.level),false);
    this.button('home','返回首页',208,mid+83,137,44,()=>this.goHome(),false);
  }

  drawLevelFail() {
    const ctx = this.ctx, mid = this.metrics.stageHeight / 2;
    ctx.fillStyle = 'rgba(45,31,45,.74)';
    ctx.fillRect(0, 0, DESIGN_W, this.metrics.stageHeight);
    rounded(ctx, 27, mid - 164, 351, 328, 26, '#fff8ec');
    label(ctx, '第 ' + this.selectedLevel + ' 关挑战失败', 202,
      mid - 101, 24, '#a55342');
    label(ctx, '沙堆碰到失败线', 202, mid - 55, 16, '#76563d');
    label(ctx, '剩余 ' + this.session.grid.cells.reduce((n,v)=>n+(v>0),0) +
      ' 粒沙 · 调整落点再试一次', 202, mid - 18, 13, '#927765');
    this.button('retry', '重试本关', 58, mid + 25, 289, 56,
      () => this.startGame(GAME_MODES.LEVEL, this.selectedLevel));
    this.button('home', '返回首页', 94, mid + 97, 217, 45,
      () => this.goHome(), false);
  }

  drawArtControls() {
    const ctx=this.ctx, top=this.topControlsY();
    rounded(ctx,12,top,220,42,14,'rgba(255,255,255,.88)');
    label(ctx,'🎨 沙画 · 完成线',24,top+21,14,'#79513e','left');
    this.button('brush-size','笔刷'+this.session.art.radius,238,top+3,72,36,()=>{
      const sizes=[1,2,4];
      const at=sizes.indexOf(this.session.art.radius);
      this.session.art.setRadius(sizes[(at+1)%3]);this.needsDraw=true;
    },false);
    this.button('home','首页',316,top+3,75,36,()=>this.goHome(),false);
    const y=this.metrics.stageHeight-136;
    rounded(ctx,5,y-8,395,144,17,'rgba(255,248,235,.94)');
    const names=[['flow','流沙'],['fixed','固沙'],['shape','形状'],['erase','橡皮']];
    for(let i=0;i<4;i++){
      const [tool,title]=names[i];
      this.button(tool,title,10+i*99,y,88,35,
        ()=>{if(!this.session.setArtTool(tool))this.toast('请等待沙块落稳');this.needsDraw=true;},
        this.session.art.tool===tool);
    }
    const colors=['#ed6764','#f3a34a','#e8d15c','#65bc75','#5cc7cc','#6590d4','#a17acc'];
    for(let i=0;i<7;i++){
      const x=28+i*51,cy=y+61;
      ctx.beginPath();ctx.arc(x,cy,15,0,Math.PI*2);
      ctx.fillStyle=colors[i];ctx.fill();
      if(this.session.art.color===ART_COLORS[i]){
        ctx.strokeStyle='#61402c';ctx.lineWidth=2;ctx.stroke();
      }
      this.buttons.push({id:'color-'+i,x:x-22,y:cy-24,w:44,h:48,
        action:()=>{this.session.setArtColor(ART_COLORS[i]);this.needsDraw=true;}});
    }
    this.button('undo','↶ 撤销',11,y+88,90,35,()=>this.session.art.undo(),false);
    this.button('redo','↷ 重做',108,y+88,90,35,()=>this.session.art.redo(),false);
    this.button('clear','清空画布',206,y+88,190,35,()=>{
      if(this.confirmClear){
        this.session.art.clear();this.confirmClear=false;
      }else{
        this.confirmClear=true;this.toast('再点一次清空画布');
      }
      this.needsDraw=true;
    },false);
  }

  drawGallery() {
    const ctx=this.ctx,mid=this.metrics.stageHeight/2;
    ctx.fillStyle='rgba(47,34,47,.66)';
    ctx.fillRect(0,0,DESIGN_W,this.metrics.stageHeight);
    rounded(ctx,24,mid-200,357,405,22,'#fff8ec');
    label(ctx,'🖼 我的沙画',202,mid-167,22,'#764e37');
    const works=this.session.modeProgress.artworks.slice(0,5);
    if(!works.length)label(ctx,'还没有作品，先创作一幅吧！',202,mid-60,15,'#94765a');
    for(let i=0;i<works.length;i++)this.button('work-'+i,
      '作品 '+(i+1)+' · '+works[i].date.slice(0,10),
      54,mid-132+i*57,297,45,()=>this.viewArtwork(works[i]),false);
    this.button('back','返回玩法',107,mid+160,191,38,()=>{
      this.screen='modes';this.needsDraw=true;
    },false);
  }

  viewArtwork(work) {
    try {
      const {cells}=decodeArtwork(work.runs,work.width*work.height);
      const canvas=this.platform.createOffscreenCanvas();
      canvas.width=work.width;canvas.height=work.height;
      const ctx=canvas.getContext('2d');
      ctx.fillStyle=ART_BG;ctx.fillRect(0,0,canvas.width,canvas.height);
      for(let i=0;i<cells.length;i++){
        if(!cells[i])continue;
        const x=i%work.width,y=Math.floor(i/work.width);
        const rgb=getParticleRgb(x,y,cells[i]);
        ctx.fillStyle='rgb('+rgb.join(',')+')';
        ctx.fillRect(x+SETTLED_PARTICLE_INSET,y+SETTLED_PARTICLE_INSET,
          SETTLED_PARTICLE_SIZE,SETTLED_PARTICLE_SIZE);
      }
      this.artwork=canvas;
      this.overMode=GAME_MODES.ART;
      this.screen='over';
      this.needsDraw=true;
    } catch { this.toast('作品数据无法读取'); }
  }

  drawPlaying(now) {
    if (this.session.playMode === GAME_MODES.ART) {
      this.drawArtControls();
      return;
    }
    const ctx = this.ctx;
    const topY = this.topControlsY();
    rounded(ctx, 12, topY, 112, 58, 15, 'rgba(255,255,255,0.91)');
    label(ctx, this.session.playMode === GAME_MODES.LEVEL
      ? '第 ' + this.session.level + ' 关' : 'SCORE', 25, topY + 16, 11, '#a48771', 'left');
    label(ctx, this.session.playMode === GAME_MODES.LEVEL
      ? '剩余 ' + this.session.grid.cells.reduce((n,v)=>n+(v>0),0)
      : this.displayScore, 25, topY + 39,
      this.session.playMode === GAME_MODES.LEVEL ? 14 : 22, '#5b3e2d', 'left');
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

    label(ctx, this.overMode === GAME_MODES.ART
      ? '你的沙画完成啦！' : '这一局，拼出了一幅不错的沙画', 202, 448, 18, '#664832');
    label(ctx, '分享给好友看看你的作品', 202, 476, 12, '#967d69');
    rounded(ctx, 151, 491, 103, 30, 15, 'rgba(255,255,255,.7)');
    label(ctx, this.overMode === GAME_MODES.ART ? '七彩流沙 · 我的原创作品' :
      `${this.session.clearSystem.score} 分 · ${this.overRating}`,
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
    label(ctx, this.overMode === GAME_MODES.ART ? '再画一幅' : '再来一局', 202, 619, 18, '#fff');
    this.buttons.push({ id: 'again', x: 32, y: 591 + offsetY, w: 341, h: 55,
      action: () => this.startGame(this.overMode, this.selectedLevel) });
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
        ? `完整观看 ${effect.unlock.value} 次广告可解锁`
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
      if (this.screen !== 'playing' || dx < 0 || dx > DESIGN_W ||
          dy < 0 || dy > this.metrics.stageHeight) return;
      if (this.session.playMode === GAME_MODES.ART && this.session.art.tool !== 'shape') {
        const yGrid = (dy - b.y * DESIGN_W / b.width) / DESIGN_H * this.session.grid.height;
        const xGrid = dx / DESIGN_W * this.session.grid.width;
        this.drag = { kind: 'art' };
        this.session.art.beginStroke(xGrid, yGrid);
        this.needsDraw = true;
        return;
      }
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
      if (this.drag.kind === 'art') {
        const gy = (dy - b.y * DESIGN_W / b.width) / DESIGN_H * this.session.grid.height;
        this.session.art.strokeTo(dx / DESIGN_W * this.session.grid.width, gy);
        this.needsDraw = true;
        return;
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
      if (this.drag.kind === 'art') {
        this.session.art.endStroke();
        this.drag = null;
        this.needsDraw = true;
        return;
      }
      this.session.setPointerX(dx / DESIGN_W * this.session.grid.width);
      this.session.releaseFruit();
      this.drag = null;
    }
  }

  startGame(mode = this.selectedMode, level = this.selectedLevel) {
    this.selectedMode = mode;
    this.selectedLevel = level;
    this.session.start(mode, level);
    this.renderer.lineMode = mode === GAME_MODES.ART ? 'finish' : 'failure';
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
    this.renderer.lineMode = 'failure';
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

  handleGameOver({ rating = 'GOOD', mode = GAME_MODES.ENDLESS } = {}) {
    this.overMode = mode;
    if (mode === GAME_MODES.LEVEL) {
      this.screen = 'fail';
      this.platform.stopSounds();
      this.needsDraw = true;
      return;
    }
    this.artwork = this.renderer.createArtworkCanvas({ scale: 3 });
    this.overRating = rating;
    this.screen = 'over';
    this.platform.stopSounds();
    this.needsDraw = true;
  }

  handleArtComplete() {
    this.overMode=GAME_MODES.ART;
    this.artwork=this.renderer.createArtworkCanvas({scale:3});
    this.screen='over';
    this.platform.stopSounds();
    this.needsDraw=true;
  }

  handleLevelComplete(result) {
    this.levelResult=result;
    this.screen='win';
    this.platform.stopSounds();
    this.needsDraw=true;
  }

  makePoster() {
    return renderArtworkPoster({
      createCanvas: () => this.platform.createOffscreenCanvas(),
      artworkCanvas: this.artwork,
      score: this.session.clearSystem.score,
      rating: this.overRating,
      mode: this.overMode
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

  async shareGame() {
    try {
      const result = await this.platform.shareGame();
      this.toast(result || '已打开游戏分享');
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
