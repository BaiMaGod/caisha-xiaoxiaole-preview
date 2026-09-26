const HOME_STYLE_ID = 'dream-sand-home-screen-styles';

function homeAsset(filename) {
  const base = import.meta.env?.BASE_URL || '/';
  return `${base}images/${filename}`;
}

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
        16px
        max(16px, env(safe-area-inset-bottom));
      color: #5d4632;
      font-family: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      user-select: none;
      touch-action: manipulation;
      isolation: isolate;
      background: transparent;
    }

    .caisha-home::before,
    .caisha-home::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      z-index: -1;
      pointer-events: none;
    }

    .caisha-home::before {
      top: 0;
      height: 31%;
      background: linear-gradient(
        180deg,
        rgba(255,248,234,.97) 0%,
        rgba(255,248,234,.78) 54%,
        rgba(255,248,234,0) 100%
      );
    }

    .caisha-home::after {
      display: none;
    }

    .caisha-home__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      width: 100%;
    }

    .caisha-home__best,
    .caisha-home__effects {
      min-height: 37px;
      border: 1px solid rgba(105,78,55,.10);
      border-radius: 999px;
      color: #664c37;
      background: rgba(255,255,255,.83);
      box-shadow:
        0 7px 20px rgba(91,61,36,.08),
        inset 0 1px 0 rgba(255,255,255,.9);
      backdrop-filter: blur(10px);
    }

    .caisha-home__best {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 11px;
      font-size: 10px;
      font-weight: 850;
      letter-spacing: .03em;
    }

    .caisha-home__best strong {
      color: #ea7355;
      font-size: 14px;
      letter-spacing: 0;
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
      transition: transform 120ms ease;
    }

    .caisha-home__effects:active {
      transform: scale(.96);
    }

    .caisha-home__effects-badge {
      display: none;
      min-width: 16px;
      height: 16px;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border-radius: 999px;
      color: #fff;
      background: #ef7657;
      font-size: 9px;
      font-weight: 950;
    }

    .caisha-home__brand {
      margin-top: clamp(15px, 3.2vh, 28px);
      text-align: center;
      pointer-events: none;
    }

    .caisha-home__title-image {
      display: block;
      width: min(86vw, 340px);
      max-width: 100%;
      height: auto;
      margin: 0 auto;
      filter: drop-shadow(0 5px 12px rgba(89,58,34,.08));
      pointer-events: none;
      user-select: none;
    }

    .caisha-home__title {
      margin: 6px 0 0;
      font-size: clamp(38px, 10.6vw, 52px);
      line-height: .98;
      font-weight: 1000;
      letter-spacing: -.075em;
      white-space: nowrap;
      filter: drop-shadow(0 5px 12px rgba(89,58,34,.08));
    }

    .caisha-home__title-dark {
      color: #694b35;
    }

    .caisha-home__title-rainbow {
      display: inline-block;
      color: transparent;
      background: linear-gradient(
        112deg,
        #ef665e 0%,
        #ef9e3c 22%,
        #ddc342 40%,
        #61b97a 59%,
        #58a7d6 77%,
        #8d75ca 100%
      );
      -webkit-background-clip: text;
      background-clip: text;
    }

    .caisha-home__subtitle {
      margin-top: 8px;
      color: rgba(95,70,49,.66);
      font-size: 11px;
      font-weight: 780;
      letter-spacing: .06em;
    }

    .caisha-home__demo-tip {
      align-self: center;
      margin-top: 9px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 29px;
      padding: 6px 11px;
      border: 1px solid rgba(108,79,54,.09);
      border-radius: 999px;
      color: rgba(87,66,48,.72);
      background: rgba(255,255,255,.74);
      box-shadow: 0 5px 16px rgba(88,58,34,.05);
      backdrop-filter: blur(8px);
      font-size: 9px;
      font-weight: 820;
      pointer-events: none;
    }

    .caisha-home__demo-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #6fca83;
      box-shadow: 0 0 0 4px rgba(111,202,131,.12);
      animation: caisha-demo-pulse 1.45s ease-in-out infinite;
    }

    .caisha-home__spacer {
      flex: 1 1 auto;
      min-height: 40px;
      pointer-events: none;
    }

    .caisha-home__actions {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 2;
      width: min(calc(100% - 32px), 260px);
      margin: 0;
      transform: translate(-50%, -50%);
    }

    .caisha-home__play {
      position: relative;
      display: block;
      width: 100%;
      aspect-ratio: 260 / 44;
      min-height: 44px;
      overflow: visible;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: transform 120ms ease, filter 120ms ease;
    }

    .caisha-home__play:active {
      transform: scale(.97);
      filter: brightness(.97);
    }

    .caisha-home__play::after {
      display: none;
    }

    .caisha-home__play-image {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
      pointer-events: none;
      user-select: none;
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
      font-size: 17px;
      line-height: 1;
      font-weight: 1000;
      letter-spacing: .04em;
    }

    .caisha-home__play-subtitle {
      color: rgba(255,255,255,.78);
      font-size: 9px;
      line-height: 1;
      font-weight: 820;
      letter-spacing: .08em;
    }

    .caisha-home__footer {
      flex: 0 0 auto;
      margin-top: 15px;
      color: rgba(91,68,49,.52);
      text-align: center;
      font-size: 9px;
      font-weight: 760;
      letter-spacing: .08em;
    }

    @keyframes caisha-home-shine {
      0%, 62% { transform: translateX(-130%) skewX(-22deg); }
      82%, 100% { transform: translateX(135%) skewX(-22deg); }
    }

    @keyframes caisha-demo-pulse {
      0%, 100% { transform: scale(.84); opacity: .62; }
      50% { transform: scale(1.08); opacity: 1; }
    }

    @media (max-height: 700px) {
      .caisha-home {
        padding-top: max(12px, env(safe-area-inset-top));
        padding-bottom: max(10px, env(safe-area-inset-bottom));
      }

      .caisha-home__brand {
        margin-top: 10px;
      }

      .caisha-home__title {
        font-size: clamp(34px, 9.7vw, 45px);
      }

      .caisha-home__subtitle {
        margin-top: 5px;
      }

      .caisha-home__demo-tip {
        margin-top: 6px;
      }

      .caisha-home__spacer {
        min-height: 34px;
      }

      .caisha-home__play {
        min-height: 44px;
      }

      .caisha-home__footer {
        margin-top: 10px;
      }
    }

    @media (max-height: 590px) {
      .caisha-home__subtitle,
      .caisha-home__footer {
        display: none;
      }

      .caisha-home__title {
        margin-top: 3px;
      }

      .caisha-home__spacer {
        min-height: 28px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .caisha-home__play::after,
      .caisha-home__demo-dot {
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

    this.root = el('section', 'caisha-home');
    this.root.setAttribute('aria-label', '七彩沙画消除首页');

    const top = el('div', 'caisha-home__top');
    this.best = el('div', 'caisha-home__best');

    this.effectsButton = el('button', 'caisha-home__effects');
    this.effectsButton.type = 'button';
    this.effectsBadge = el('span', 'caisha-home__effects-badge');
    this.effectsButton.append(
      el('span', '', '✨'),
      el('span', '', '消除特效'),
      this.effectsBadge
    );
    top.append(this.best, this.effectsButton);

    const brand = el('div', 'caisha-home__brand');
    const title = el('img', 'caisha-home__title-image');
    title.src = homeAsset('qicai_title_mobile.png');
    title.alt = '七彩沙画消除';
    title.draggable = false;

    brand.append(title);

    const actions = el('div', 'caisha-home__actions');
    this.playButton = el('button', 'caisha-home__play');
    this.playButton.type = 'button';

    const playImage = el('img', 'caisha-home__play-image');
    playImage.src = homeAsset('start_game_button_v2.png');
    playImage.alt = '开始游戏';
    playImage.width = 260;
    playImage.height = 44;
    playImage.draggable = false;
    this.playButton.setAttribute('aria-label', '开始游戏');
    this.playButton.append(playImage);
    actions.append(this.playButton);

    this.root.append(top, brand, actions);
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
  }

  hide() {
    this.opened = false;
    this.root.style.display = 'none';
  }

  isOpen() {
    return this.opened;
  }
}
