const HOME_STYLE_ID = 'dream-sand-home-screen-styles';

function el(tag, className, text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function ensureStyles() {
  if (document.getElementById(HOME_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = HOME_STYLE_ID;
  style.textContent = `
    .caisha-home {
      position: absolute;
      inset: 0;
      z-index: 30;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding:
        max(18px, env(safe-area-inset-top))
        17px
        max(15px, env(safe-area-inset-bottom));
      color: #fff7ec;
      background:
        radial-gradient(circle at 18% 13%, rgba(255,236,166,.28) 0 3%, transparent 24%),
        radial-gradient(circle at 82% 24%, rgba(158,220,255,.22) 0 4%, transparent 26%),
        radial-gradient(circle at 50% 68%, rgba(255,148,117,.30) 0 10%, transparent 42%),
        linear-gradient(180deg, #30285c 0%, #544070 27%, #9b5d79 52%, #e98272 76%, #f6bd78 100%);
      font-family: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      user-select: none;
      touch-action: manipulation;
      isolation: isolate;
    }

    .caisha-home::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -2;
      pointer-events: none;
      opacity: .45;
      background-image:
        radial-gradient(circle, rgba(255,255,255,.6) 0 .7px, transparent .9px),
        radial-gradient(circle, rgba(255,221,138,.42) 0 .8px, transparent 1px);
      background-size: 19px 19px, 31px 31px;
      background-position: 2px 5px, 13px 9px;
      mask-image: linear-gradient(180deg, #000 0 62%, transparent 92%);
    }

    .caisha-home::after {
      content: "";
      position: absolute;
      left: -18%;
      right: -18%;
      bottom: -18%;
      height: 42%;
      z-index: -1;
      pointer-events: none;
      border-radius: 50% 50% 0 0;
      background:
        radial-gradient(ellipse at 50% 0%, rgba(255,231,163,.34), transparent 56%),
        linear-gradient(180deg, rgba(255,170,105,.14), rgba(111,63,80,.22));
      filter: blur(3px);
    }

    .caisha-home__top {
      position: relative;
      z-index: 4;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      width: 100%;
    }

    .caisha-home__best,
    .caisha-home__effects {
      min-height: 38px;
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 999px;
      color: #fff7ea;
      background: rgba(33,26,62,.25);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.11),
        0 8px 24px rgba(29,20,55,.14);
      backdrop-filter: blur(12px);
    }

    .caisha-home__best {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 12px;
      font-size: 10px;
      font-weight: 850;
      letter-spacing: .04em;
    }

    .caisha-home__best strong {
      color: #ffd56f;
      font-size: 14px;
      letter-spacing: 0;
      text-shadow: 0 2px 8px rgba(255,192,78,.2);
    }

    .caisha-home__effects {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 11px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      font: 850 11px/1 system-ui, sans-serif;
      transition: transform 120ms ease, background 120ms ease;
    }

    .caisha-home__effects:active {
      transform: scale(.96);
      background: rgba(33,26,62,.38);
    }

    .caisha-home__effects-badge {
      display: none;
      min-width: 16px;
      height: 16px;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border-radius: 999px;
      color: #6f3150;
      background: #ffe47e;
      font-size: 9px;
      font-weight: 950;
      box-shadow: 0 3px 8px rgba(50,28,55,.16);
    }

    .caisha-home__brand {
      position: relative;
      z-index: 3;
      margin-top: clamp(14px, 3.2vh, 30px);
      text-align: center;
      pointer-events: none;
    }

    .caisha-home__eyebrow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 22px;
      padding: 4px 10px;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 999px;
      color: rgba(255,247,235,.76);
      background: rgba(37,28,67,.17);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
      font-size: 8px;
      font-weight: 900;
      letter-spacing: .24em;
      text-transform: uppercase;
    }

    .caisha-home__title {
      margin: 8px 0 0;
      font-size: clamp(38px, 10.8vw, 52px);
      line-height: .98;
      font-weight: 1000;
      letter-spacing: -.075em;
      text-shadow:
        0 3px 0 rgba(83,43,75,.20),
        0 9px 24px rgba(42,28,63,.28);
      white-space: nowrap;
    }

    .caisha-home__title-dream {
      color: #fff4d8;
    }

    .caisha-home__title-sand {
      display: inline-block;
      color: transparent;
      background: linear-gradient(
        115deg,
        #ff7d75 0%,
        #ffc45e 25%,
        #f8e56d 43%,
        #6ed9b2 62%,
        #69c7f2 79%,
        #c79aff 100%
      );
      -webkit-background-clip: text;
      background-clip: text;
      filter: drop-shadow(0 3px 0 rgba(80,42,70,.16));
    }

    .caisha-home__title-clear {
      color: #fff4d8;
    }

    .caisha-home__subtitle {
      margin-top: 9px;
      color: rgba(255,244,230,.73);
      font-size: 11px;
      font-weight: 760;
      letter-spacing: .08em;
      text-shadow: 0 2px 7px rgba(42,28,63,.24);
    }

    .caisha-home__stage {
      position: relative;
      z-index: 2;
      flex: 1 1 auto;
      width: 100%;
      min-height: 260px;
      margin-top: 2px;
      overflow: hidden;
    }

    .caisha-home__stage::before {
      content: "";
      position: absolute;
      left: 7%;
      right: 7%;
      top: 12%;
      bottom: 7%;
      z-index: 0;
      border-radius: 42% 42% 29% 29%;
      background:
        radial-gradient(ellipse at 50% 16%, rgba(255,255,255,.13), transparent 42%),
        radial-gradient(ellipse at 50% 72%, rgba(255,209,139,.10), transparent 52%);
      filter: blur(1px);
      pointer-events: none;
    }

    .caisha-home__canvas {
      position: absolute;
      inset: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      display: block;
    }

    .caisha-home__mode {
      position: absolute;
      left: 50%;
      bottom: 7px;
      z-index: 3;
      transform: translateX(-50%);
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 30px;
      padding: 6px 12px;
      border: 1px solid rgba(255,255,255,.16);
      border-radius: 999px;
      color: rgba(255,249,238,.86);
      background: rgba(47,33,69,.32);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.09),
        0 7px 20px rgba(49,28,60,.12);
      backdrop-filter: blur(10px);
      font-size: 10px;
      font-weight: 850;
      letter-spacing: .03em;
      white-space: nowrap;
      pointer-events: none;
    }

    .caisha-home__mode-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #7ae3bd;
      box-shadow: 0 0 0 4px rgba(122,227,189,.12), 0 0 12px rgba(122,227,189,.5);
    }

    .caisha-home__actions {
      position: relative;
      z-index: 5;
      flex: 0 0 auto;
      width: min(100%, 330px);
      margin: 7px auto 0;
    }

    .caisha-home__play {
      position: relative;
      width: 100%;
      min-height: 64px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border: 1px solid rgba(255,255,255,.40);
      border-radius: 24px;
      color: #613548;
      background:
        radial-gradient(circle at 18% 32%, rgba(255,255,255,.64) 0 1px, transparent 1.7px),
        radial-gradient(circle at 76% 67%, rgba(255,255,255,.48) 0 1px, transparent 1.7px),
        linear-gradient(135deg, #ffe27c 0%, #ffb55f 52%, #ff8b72 100%);
      background-size: 10px 10px, 14px 14px, auto;
      box-shadow:
        0 12px 0 rgba(112,56,73,.32),
        0 18px 34px rgba(49,30,66,.25),
        inset 0 2px 0 rgba(255,255,255,.5);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
    }

    .caisha-home__play:active {
      transform: translateY(5px) scale(.985);
      box-shadow:
        0 6px 0 rgba(112,56,73,.32),
        0 11px 24px rgba(49,30,66,.20),
        inset 0 2px 0 rgba(255,255,255,.5);
    }

    .caisha-home__play::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-130%) skewX(-22deg);
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.36), transparent);
      animation: dream-home-shine 3.2s ease-in-out infinite;
      pointer-events: none;
    }

    .caisha-home__play-icon {
      position: relative;
      z-index: 1;
      width: 34px;
      height: 34px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: #fff4d8;
      background: rgba(102,48,71,.72);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.17),
        0 4px 9px rgba(84,41,67,.18);
      font-size: 15px;
      line-height: 1;
      padding-left: 2px;
    }

    .caisha-home__play-copy {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 3px;
    }

    .caisha-home__play-title {
      font-size: 19px;
      line-height: 1;
      font-weight: 1000;
      letter-spacing: .04em;
    }

    .caisha-home__play-subtitle {
      color: rgba(97,53,72,.68);
      font-size: 9px;
      line-height: 1;
      font-weight: 850;
      letter-spacing: .09em;
    }

    .caisha-home__footer {
      position: relative;
      z-index: 4;
      flex: 0 0 auto;
      margin-top: 15px;
      color: rgba(255,246,233,.60);
      text-align: center;
      font-size: 9px;
      font-weight: 760;
      letter-spacing: .08em;
      text-shadow: 0 2px 7px rgba(42,28,63,.2);
    }

    @keyframes dream-home-shine {
      0%, 62% { transform: translateX(-130%) skewX(-22deg); }
      82%, 100% { transform: translateX(135%) skewX(-22deg); }
    }

    @media (max-height: 700px) {
      .caisha-home {
        padding-top: max(12px, env(safe-area-inset-top));
        padding-bottom: max(10px, env(safe-area-inset-bottom));
      }

      .caisha-home__brand {
        margin-top: 9px;
      }

      .caisha-home__title {
        font-size: clamp(34px, 9.8vw, 45px);
      }

      .caisha-home__subtitle {
        margin-top: 6px;
      }

      .caisha-home__stage {
        min-height: 222px;
      }

      .caisha-home__play {
        min-height: 57px;
      }

      .caisha-home__footer {
        margin-top: 10px;
      }
    }

    @media (max-height: 590px) {
      .caisha-home__eyebrow,
      .caisha-home__subtitle,
      .caisha-home__footer {
        display: none;
      }

      .caisha-home__title {
        margin-top: 4px;
      }

      .caisha-home__stage {
        min-height: 196px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .caisha-home__play::after {
        animation: none;
      }
    }
  `;

  document.head.appendChild(style);
}

function hash01(value) {
  const x = Math.sin(value * 91.731 + 17.17) * 43758.5453;
  return x - Math.floor(x);
}

export class HomeScreen {
  constructor(container, { progress, onStart, onEffects } = {}) {
    ensureStyles();

    this.container = container;
    this.progress = progress;
    this.onStart = onStart;
    this.onEffects = onEffects;
    this.opened = true;
    this.lastPaint = 0;
    this.animate = this.animate.bind(this);

    this.root = el('section', 'caisha-home');
    this.root.setAttribute('aria-label', '梦幻沙画消除首页');

    const top = el('div', 'caisha-home__top');
    this.best = el('div', 'caisha-home__best');

    this.effectsButton = el('button', 'caisha-home__effects');
    this.effectsButton.type = 'button';
    const effectsIcon = el('span', '', '✨');
    const effectsText = el('span', '', '消除特效');
    this.effectsBadge = el('span', 'caisha-home__effects-badge');
    this.effectsButton.append(effectsIcon, effectsText, this.effectsBadge);
    top.append(this.best, this.effectsButton);

    const brand = el('div', 'caisha-home__brand');
    const eyebrow = el('div', 'caisha-home__eyebrow', 'DREAM SAND ART');
    const title = el('h1', 'caisha-home__title');
    const titleDream = el('span', 'caisha-home__title-dream', '梦幻');
    const titleSand = el('span', 'caisha-home__title-sand', '沙画');
    const titleClear = el('span', 'caisha-home__title-clear', '消除');
    title.append(titleDream, titleSand, titleClear);
    const subtitle = el(
      'div',
      'caisha-home__subtitle',
      '落下彩沙 · 连通同色 · 一触消散'
    );
    brand.append(eyebrow, title, subtitle);

    const stage = el('div', 'caisha-home__stage');
    this.canvas = el('canvas', 'caisha-home__canvas');
    const mode = el('div', 'caisha-home__mode');
    mode.append(
      el('span', 'caisha-home__mode-dot'),
      el('span', '', '同色连通左右 · 整片消除')
    );
    stage.append(this.canvas, mode);

    const actions = el('div', 'caisha-home__actions');
    this.playButton = el('button', 'caisha-home__play');
    this.playButton.type = 'button';
    const playIcon = el('span', 'caisha-home__play-icon', '▶');
    const playCopy = el('span', 'caisha-home__play-copy');
    playCopy.append(
      el('span', 'caisha-home__play-title', '开始游戏'),
      el('span', 'caisha-home__play-subtitle', '开启你的梦幻沙画')
    );
    this.playButton.append(playIcon, playCopy);
    actions.append(this.playButton);

    const footer = el(
      'div',
      'caisha-home__footer',
      '左右拖动 · 松手下落 · 下滑加速'
    );

    this.root.append(top, brand, stage, actions, footer);
    this.container.appendChild(this.root);

    this.playButton.addEventListener('click', () => {
      this.onStart?.();
      this.hide();
    });

    this.effectsButton.addEventListener('click', () => {
      this.onEffects?.();
    });

    this.unsubscribe = this.progress?.subscribe((snapshot) => {
      this.renderProgress(snapshot);
    });

    if (this.progress) {
      this.renderProgress(this.progress.getSnapshot());
    } else {
      this.renderProgress({ stats: { bestScore: 0 }, newClearEffects: [] });
    }

    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObserver.observe(stage);
    this.resizeCanvas();
    this.frame = requestAnimationFrame(this.animate);
  }

  renderProgress(snapshot) {
    const bestScore = snapshot?.stats?.bestScore ?? 0;
    const newCount = snapshot?.newClearEffects?.length ?? 0;

    this.best.replaceChildren(
      el('span', '', '🏆 最高'),
      el('strong', '', Number(bestScore).toLocaleString())
    );

    if (newCount > 0) {
      this.effectsBadge.style.display = 'inline-flex';
      this.effectsBadge.textContent = String(newCount);
    } else {
      this.effectsBadge.style.display = 'none';
      this.effectsBadge.textContent = '';
    }
  }

  show() {
    this.opened = true;
    this.root.style.display = 'flex';

    if (this.progress) {
      this.renderProgress(this.progress.getSnapshot());
    }

    this.resizeCanvas();
  }

  hide() {
    this.opened = false;
    this.root.style.display = 'none';
  }

  isOpen() {
    return this.opened;
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  animate(time) {
    if (this.opened && time - this.lastPaint > 30) {
      this.draw(time * 0.001);
      this.lastPaint = time;
    }

    this.frame = requestAnimationFrame(this.animate);
  }

  draw(time) {
    const canvas = this.canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (!width || !height) return;

    const dpr = canvas.width / width;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    this.drawGlow(ctx, width, height);
    this.drawFloatingGrains(ctx, width, height, time);
    this.drawFruitShowcase(ctx, width, height, time);
    this.drawSandWorld(ctx, width, height, time);
    this.drawClearSweep(ctx, width, height, time);
  }

  drawGlow(ctx, width, height) {
    const glow = ctx.createRadialGradient(
      width * .5,
      height * .39,
      8,
      width * .5,
      height * .42,
      width * .56
    );
    glow.addColorStop(0, 'rgba(255,244,190,.18)');
    glow.addColorStop(.48, 'rgba(255,185,158,.08)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  drawFloatingGrains(ctx, width, height, time) {
    const colors = ['#fff1a8', '#ff9f92', '#70d7c1', '#77c9f2', '#d2a5ff'];

    for (let i = 0; i < 38; i++) {
      const seed = i + 1;
      const x = hash01(seed * 3.17) * width;
      const travel = height * .58 + 42;
      const speed = 8 + hash01(seed * 9.31) * 15;
      const y = ((hash01(seed * 5.73) * travel + time * speed) % travel) - 18;
      const pulse = .35 + .65 * (0.5 + 0.5 * Math.sin(time * 2 + seed));
      const size = .65 + hash01(seed * 7.41) * 1.5;

      ctx.globalAlpha = .18 + pulse * .36;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  drawFruitShowcase(ctx, width, height, time) {
    const top = Math.max(36, height * .08);
    const fall = (Math.sin(time * 1.35) + 1) * 7;

    this.drawApple(
      ctx,
      width * .50,
      top + 38 + fall,
      Math.min(width, height) * .115,
      '#ff746f',
      time
    );

    this.drawOrange(
      ctx,
      width * .23,
      top + 77 + Math.sin(time * 1.1 + 1.4) * 6,
      Math.min(width, height) * .09,
      '#ffc85b',
      time + 2
    );

    this.drawBanana(
      ctx,
      width * .76,
      top + 83 + Math.sin(time * 1.05 + 2.1) * 7,
      Math.min(width, height) * .12,
      '#78d9a8',
      time + 4
    );
  }

  drawGrainFill(ctx, bounds, color, seedOffset, time) {
    const { x, y, w, h } = bounds;
    ctx.globalCompositeOperation = 'source-atop';

    for (let i = 0; i < 78; i++) {
      const seed = seedOffset * 97 + i * 1.73;
      const px = x + hash01(seed * 2.31) * w;
      const py = y + hash01(seed * 4.27) * h;
      const size = .55 + hash01(seed * 7.17) * 1.1;
      const twinkle = .34 + .24 * Math.sin(time * 2 + seed);

      ctx.globalAlpha = Math.max(.18, twinkle);
      ctx.fillStyle = i % 5 === 0 ? '#fff8d9' : color;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  drawApple(ctx, cx, cy, scale, color, time) {
    ctx.save();
    ctx.shadowColor = 'rgba(36,21,58,.28)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - scale * .46);
    ctx.bezierCurveTo(
      cx - scale * .42,
      cy - scale * .70,
      cx - scale * .72,
      cy - scale * .20,
      cx - scale * .58,
      cy + scale * .32
    );
    ctx.bezierCurveTo(
      cx - scale * .42,
      cy + scale * .76,
      cx - scale * .12,
      cy + scale * .72,
      cx,
      cy + scale * .61
    );
    ctx.bezierCurveTo(
      cx + scale * .16,
      cy + scale * .74,
      cx + scale * .48,
      cy + scale * .73,
      cx + scale * .61,
      cy + scale * .28
    );
    ctx.bezierCurveTo(
      cx + scale * .74,
      cy - scale * .18,
      cx + scale * .43,
      cy - scale * .69,
      cx,
      cy - scale * .46
    );
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#6a5b4a';
    ctx.lineWidth = Math.max(2, scale * .07);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy - scale * .48);
    ctx.quadraticCurveTo(cx + scale * .06, cy - scale * .80, cx + scale * .16, cy - scale * .94);
    ctx.stroke();

    ctx.fillStyle = '#75d29e';
    ctx.beginPath();
    ctx.ellipse(
      cx + scale * .30,
      cy - scale * .75,
      scale * .25,
      scale * .11,
      -.38,
      0,
      Math.PI * 2
    );
    ctx.fill();

    this.drawGrainFill(
      ctx,
      {
        x: cx - scale * .62,
        y: cy - scale * .55,
        w: scale * 1.24,
        h: scale * 1.25
      },
      color,
      1,
      time
    );
    ctx.restore();
  }

  drawOrange(ctx, cx, cy, scale, color, time) {
    ctx.save();
    ctx.shadowColor = 'rgba(36,21,58,.24)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 7;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, scale * .62, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#76d49f';
    ctx.beginPath();
    ctx.ellipse(
      cx + scale * .12,
      cy - scale * .68,
      scale * .23,
      scale * .10,
      -.35,
      0,
      Math.PI * 2
    );
    ctx.fill();

    this.drawGrainFill(
      ctx,
      {
        x: cx - scale * .62,
        y: cy - scale * .62,
        w: scale * 1.24,
        h: scale * 1.24
      },
      color,
      2,
      time
    );
    ctx.restore();
  }

  drawBanana(ctx, cx, cy, scale, color, time) {
    ctx.save();
    ctx.shadowColor = 'rgba(36,21,58,.25)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 7;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineWidth = scale * .43;
    ctx.beginPath();
    ctx.arc(cx - scale * .08, cy - scale * .06, scale * .64, .18, 2.18);
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,250,219,.35)';
    ctx.lineWidth = scale * .10;
    ctx.beginPath();
    ctx.arc(cx - scale * .08, cy - scale * .06, scale * .64, .28, 2.04);
    ctx.stroke();

    ctx.globalAlpha = .72;
    for (let i = 0; i < 40; i++) {
      const t = .22 + (i / 39) * 1.82;
      const radius = scale * .64 + (hash01(i * 2.71) - .5) * scale * .18;
      const px = cx - scale * .08 + Math.cos(t) * radius;
      const py = cy - scale * .06 + Math.sin(t) * radius;
      ctx.fillStyle = i % 5 === 0 ? '#fff7d4' : color;
      ctx.beginPath();
      ctx.arc(px, py, .7 + hash01(i * 6.13) * .8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawSandWorld(ctx, width, height, time) {
    const layers = [
      { color: '#8f6ed2', base: .84, amp: 12, phase: .4 },
      { color: '#55aee0', base: .77, amp: 14, phase: 1.2 },
      { color: '#62c99f', base: .70, amp: 13, phase: 2.1 },
      { color: '#f0d657', base: .64, amp: 12, phase: 3.0 },
      { color: '#f2a24e', base: .58, amp: 11, phase: 4.2 },
      { color: '#ee7169', base: .52, amp: 10, phase: 5.0 }
    ];

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const baseY = height * layer.base;
      const drift = Math.sin(time * .35 + layer.phase) * 2;

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY);

      for (let x = 0; x <= width + 8; x += 7) {
        const wave =
          Math.sin(x * .028 + layer.phase + time * .16) * layer.amp +
          Math.sin(x * .061 + layer.phase * .8) * layer.amp * .24;
        ctx.lineTo(x, baseY + wave + drift);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.globalAlpha = .92;
      ctx.fillStyle = layer.color;
      ctx.fill();

      ctx.globalAlpha = .22;
      for (let g = 0; g < 34; g++) {
        const seed = (g + 1) * (i + 3) * 12.73;
        const px = hash01(seed) * width;
        const py = baseY + hash01(seed * 2.4) * Math.max(10, height - baseY);
        ctx.fillStyle = g % 4 === 0 ? '#fff8dc' : '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, .55 + hash01(seed * 3.8) * .95, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  drawClearSweep(ctx, width, height, time) {
    const y = height * .56;
    const sweep = ((time * .16) % 1) * (width + 90) - 45;

    ctx.save();
    const glow = ctx.createLinearGradient(0, y, width, y);
    glow.addColorStop(0, 'rgba(111,231,203,.08)');
    glow.addColorStop(.35, 'rgba(111,231,203,.22)');
    glow.addColorStop(.7, 'rgba(255,241,161,.18)');
    glow.addColorStop(1, 'rgba(255,255,255,.02)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, y - 5, width, 10);

    for (let i = 0; i < 28; i++) {
      const seed = i * 7.31;
      const px = sweep - hash01(seed + 2) * 56;
      const py = y + (hash01(seed + 4) - .5) * 34;
      const alpha = Math.max(0, 1 - Math.abs(sweep - px) / 62);

      ctx.globalAlpha = .2 + alpha * .55;
      ctx.fillStyle = i % 3 === 0 ? '#fff1a1' : '#87efd0';
      ctx.beginPath();
      ctx.arc(px, py, .8 + hash01(seed + 5) * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = .86;
    ctx.strokeStyle = '#b9ffe5';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#89f2cf';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(Math.max(0, sweep - 18), y - 7);
    ctx.lineTo(Math.min(width, sweep + 12), y - 7);
    ctx.stroke();
    ctx.restore();
  }
}
