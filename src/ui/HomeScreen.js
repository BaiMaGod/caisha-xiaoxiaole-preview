const HOME_STYLE_ID = 'caisha-home-screen-styles';

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
      align-items: center;
      overflow: hidden;
      padding: max(24px, env(safe-area-inset-top)) 22px max(22px, env(safe-area-inset-bottom));
      color: #5d4632;
      background:
        radial-gradient(circle at 20% 12%, rgba(255,255,255,.92) 0 7%, transparent 28%),
        radial-gradient(circle at 84% 26%, rgba(255,224,187,.42) 0 5%, transparent 24%),
        linear-gradient(180deg, #fffaf0 0%, #fff5e6 46%, #f8eadc 100%);
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
      opacity: .26;
      background-image:
        radial-gradient(circle, rgba(102,76,53,.18) 0 .55px, transparent .7px),
        radial-gradient(circle, rgba(255,255,255,.85) 0 .7px, transparent .85px);
      background-size: 7px 7px, 11px 11px;
      background-position: 0 0, 3px 4px;
      pointer-events: none;
    }

    .caisha-home::after {
      content: "";
      position: absolute;
      width: 280px;
      height: 280px;
      left: 50%;
      bottom: -180px;
      transform: translateX(-50%);
      border-radius: 50%;
      background: rgba(232,180,126,.16);
      filter: blur(2px);
      z-index: -1;
      pointer-events: none;
    }

    .caisha-home__top {
      width: 100%;
      display: flex;
      justify-content: center;
      padding-top: 5px;
    }

    .caisha-home__best {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 30px;
      padding: 7px 12px;
      border: 1px solid rgba(116,81,52,.09);
      border-radius: 999px;
      color: rgba(93,70,50,.78);
      background: rgba(255,255,255,.68);
      box-shadow: 0 8px 24px rgba(87,57,31,.06);
      backdrop-filter: blur(8px);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .04em;
    }

    .caisha-home__best strong {
      color: #ef754f;
      font-size: 13px;
      letter-spacing: 0;
    }

    .caisha-home__brand {
      margin-top: clamp(30px, 7vh, 54px);
      text-align: center;
    }

    .caisha-home__eyebrow {
      margin-bottom: 6px;
      color: rgba(115,83,58,.54);
      font-size: 9px;
      font-weight: 900;
      letter-spacing: .34em;
      text-transform: uppercase;
    }

    .caisha-home__title {
      margin: 0;
      font-size: clamp(39px, 11vw, 52px);
      line-height: .98;
      font-weight: 950;
      letter-spacing: -.08em;
      filter: drop-shadow(0 5px 9px rgba(93,58,31,.08));
    }

    .caisha-home__title-rainbow {
      display: inline-block;
      padding-right: .07em;
      color: transparent;
      background:
        linear-gradient(105deg,
          #ef5d58 0 16%,
          #f1a33a 16% 33%,
          #e4c742 33% 49%,
          #65b978 49% 66%,
          #5aaad8 66% 82%,
          #8e79cf 82% 100%);
      -webkit-background-clip: text;
      background-clip: text;
    }

    .caisha-home__title-dark {
      color: #6a4b35;
    }

    .caisha-home__subtitle {
      margin-top: 11px;
      color: rgba(93,70,50,.63);
      font-size: 12px;
      font-weight: 750;
      letter-spacing: .03em;
    }

    .caisha-home__art {
      position: relative;
      width: min(100%, 330px);
      height: clamp(178px, 28vh, 224px);
      margin-top: clamp(12px, 3vh, 24px);
      overflow: hidden;
      border-radius: 28px;
      border: 1px solid rgba(115,82,54,.08);
      background:
        linear-gradient(180deg, rgba(255,255,255,.54), rgba(255,251,244,.18));
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.86),
        0 18px 38px rgba(94,60,30,.07);
    }

    .caisha-home__art::before {
      content: "";
      position: absolute;
      width: 76px;
      height: 76px;
      right: 25px;
      top: 22px;
      border-radius: 50%;
      background: rgba(255,201,104,.2);
      box-shadow: 0 0 34px rgba(255,201,104,.22);
      pointer-events: none;
    }

    .caisha-home__canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
    }

    .caisha-home__rule {
      position: absolute;
      left: 18px;
      right: 18px;
      bottom: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      min-height: 27px;
      border-radius: 999px;
      color: rgba(93,70,50,.7);
      background: rgba(255,255,255,.78);
      box-shadow: 0 5px 14px rgba(90,57,29,.06);
      backdrop-filter: blur(7px);
      font-size: 10px;
      font-weight: 800;
      pointer-events: none;
    }

    .caisha-home__rule-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ef8059;
      box-shadow: 10px 0 0 #e0bc47, 20px 0 0 #65b77c;
      margin-right: 18px;
    }

    .caisha-home__actions {
      width: min(100%, 310px);
      margin-top: auto;
      display: grid;
      gap: 10px;
    }

    .caisha-home__play,
    .caisha-home__effects {
      width: 100%;
      border: 0;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
    }

    .caisha-home__play:active,
    .caisha-home__effects:active {
      transform: scale(.975);
    }

    .caisha-home__play {
      position: relative;
      min-height: 58px;
      overflow: hidden;
      border-radius: 21px;
      color: #fff;
      background:
        radial-gradient(circle at 18% 35%, rgba(255,255,255,.32) 0 1px, transparent 1.6px),
        radial-gradient(circle at 73% 65%, rgba(255,255,255,.22) 0 1px, transparent 1.5px),
        linear-gradient(135deg, #ff8b62, #ef6c4d);
      background-size: 9px 9px, 13px 13px, auto;
      box-shadow:
        0 13px 24px rgba(224,101,69,.24),
        inset 0 1px 0 rgba(255,255,255,.35);
      font: 900 18px/1 system-ui, sans-serif;
      letter-spacing: .04em;
    }

    .caisha-home__play::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-120%) skewX(-24deg);
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.24), transparent);
      animation: caisha-home-shine 3.8s ease-in-out infinite;
      pointer-events: none;
    }

    .caisha-home__effects {
      min-height: 45px;
      border: 1px solid rgba(112,78,51,.1);
      border-radius: 17px;
      color: #74523a;
      background: rgba(255,255,255,.7);
      box-shadow: 0 7px 18px rgba(84,54,30,.06);
      backdrop-filter: blur(8px);
      font: 850 13px/1 system-ui, sans-serif;
    }

    .caisha-home__footer {
      margin-top: 12px;
      color: rgba(92,70,50,.44);
      font-size: 9px;
      font-weight: 750;
      letter-spacing: .08em;
    }

    @keyframes caisha-home-shine {
      0%, 62% { transform: translateX(-120%) skewX(-24deg); }
      82%, 100% { transform: translateX(125%) skewX(-24deg); }
    }

    @media (max-height: 650px) {
      .caisha-home {
        padding-top: 16px;
        padding-bottom: 14px;
      }
      .caisha-home__brand {
        margin-top: 18px;
      }
      .caisha-home__art {
        height: 162px;
        margin-top: 10px;
      }
      .caisha-home__subtitle {
        margin-top: 7px;
      }
      .caisha-home__footer {
        margin-top: 7px;
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
    this.root.setAttribute('aria-label', '彩沙消消乐首页');

    const top = el('div', 'caisha-home__top');
    this.best = el('div', 'caisha-home__best');
    top.appendChild(this.best);

    const brand = el('div', 'caisha-home__brand');
    const eyebrow = el('div', 'caisha-home__eyebrow', 'SAND ART PUZZLE');
    const title = el('h1', 'caisha-home__title');
    const titleRainbow = el('span', 'caisha-home__title-rainbow', '彩沙');
    const titleDark = el('span', 'caisha-home__title-dark', '消消乐');
    title.append(titleRainbow, titleDark);
    const subtitle = el(
      'div',
      'caisha-home__subtitle',
      '让同色沙粒连成一片，吹散整条彩沙'
    );
    brand.append(eyebrow, title, subtitle);

    const art = el('div', 'caisha-home__art');
    this.canvas = el('canvas', 'caisha-home__canvas');
    const rule = el('div', 'caisha-home__rule');
    const ruleDot = el('span', 'caisha-home__rule-dot');
    const ruleText = el('span', '', '连通左右 · 整片消除');
    rule.append(ruleDot, ruleText);
    art.append(this.canvas, rule);

    const actions = el('div', 'caisha-home__actions');
    this.playButton = el('button', 'caisha-home__play', '开始游戏');
    this.playButton.type = 'button';
    this.effectsButton = el('button', 'caisha-home__effects', '✨ 选择消除特效');
    this.effectsButton.type = 'button';
    actions.append(this.playButton, this.effectsButton);

    const footer = el('div', 'caisha-home__footer', '左右拖动 · 松手下落 · 下滑加速');

    this.root.append(top, brand, art, actions, footer);
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
    this.resizeObserver.observe(art);
    this.resizeCanvas();
    this.frame = requestAnimationFrame(this.animate);
  }

  renderProgress(snapshot) {
    const bestScore = snapshot?.stats?.bestScore ?? 0;
    const newCount = snapshot?.newClearEffects?.length ?? 0;
    this.best.innerHTML =
      '<span>🏆 BEST</span><strong>' +
      Number(bestScore).toLocaleString() +
      '</strong>';

    this.effectsButton.textContent =
      newCount > 0
        ? `✨ 选择消除特效 · ${newCount} NEW`
        : '✨ 选择消除特效';
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
    if (this.opened && time - this.lastPaint > 32) {
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

    const layers = [
      { color: '#8e78c8', y: .79, amp: 9, phase: .1 },
      { color: '#5aa8d3', y: .72, amp: 11, phase: 1.2 },
      { color: '#65b57a', y: .65, amp: 12, phase: 2.1 },
      { color: '#e1c341', y: .58, amp: 11, phase: 3.2 },
      { color: '#eea23c', y: .51, amp: 10, phase: 4.0 },
      { color: '#ee665b', y: .44, amp: 9, phase: 5.1 }
    ];

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const baseY = height * layer.y;
      const drift = Math.sin(time * .45 + layer.phase) * 2.2;

      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY);

      for (let x = 0; x <= width + 8; x += 8) {
        const wave =
          Math.sin(x * .025 + layer.phase + time * .13) * layer.amp +
          Math.sin(x * .052 + layer.phase * .7) * layer.amp * .28;
        ctx.lineTo(x, baseY + wave + drift);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.globalAlpha = .88;
      ctx.fillStyle = layer.color;
      ctx.fill();

      ctx.globalAlpha = .22;
      ctx.fillStyle = '#fff7e9';
      for (let g = 0; g < 34; g++) {
        const seed = (g + 1) * (i + 3) * 17.371;
        const x = (seed * 13.7) % width;
        const yOffset = (seed * 7.9) % Math.max(10, height - baseY);
        const y = Math.min(height - 7, baseY + yOffset);
        const size = .55 + ((seed * 2.7) % 1.25);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = .45;
    for (let i = 0; i < 20; i++) {
      const seed = (i + 11) * 31.739;
      const x = (seed * 9.17) % width;
      const fall = (time * (7 + (i % 5) * 2) + seed) % (height * .36);
      const y = 22 + fall;
      const colors = ['#ef665a', '#efa33d', '#dbc442', '#65b67a', '#5aa8d3'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, .7 + (i % 3) * .3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}
