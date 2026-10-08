import { ensureRainbowScoreStyles } from './RainbowScore.js';
import { LEVEL_NAMES } from '../modes/Levels.js';
import { ensureRainbowSandTheme } from './RainbowSandTheme.js';

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
      color: #7d55ab;
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
      width: min(calc(100% - 32px), 280px);
      margin: 0;
      transform: translate(-50%, -50%);
    }

    .caisha-home__play {
      position: relative;
      display: block;
      width: 100%;
      height: 88px;
      min-height: 88px;
      overflow: hidden;
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
      max-width: 100%;
      height: 100%;
      object-fit: contain;
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


    /* Play-mode picker: light candy panel with distinct, tappable modes. */
    .caisha-mode-menu {
      position: absolute;
      inset: 0;
      z-index: 5;
      display: none;
      align-items: center;
      justify-content: center;
      padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
      background: rgba(34, 26, 51, .56);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .caisha-mode-menu.is-open { display: flex; }
    .caisha-mode-menu__card {
      position: relative;
      width: min(100%, 362px);
      max-height: min(650px, 91%);
      overflow-y: auto;
      padding: 31px 19px 19px;
      border: 2px solid rgba(255, 255, 255, .94);
      border-radius: 29px;
      background:
        radial-gradient(circle at 16% 0%, rgba(255, 216, 142, .43), transparent 40%),
        radial-gradient(circle at 100% 68%, rgba(211, 194, 255, .28), transparent 45%),
        linear-gradient(162deg, #fffcf8 0%, #fff5ee 100%);
      box-shadow: 0 22px 62px rgba(45, 27, 46, .32), inset 0 1px 0 #fff;
      text-align: center;
      overscroll-behavior: contain;
      animation: caisha-dialog-pop 180ms cubic-bezier(.2,.8,.2,1) both;
    }
    .caisha-mode-menu__card::before {
      content: "";
      position: absolute;
      inset: 0 0 auto 0;
      height: 7px;
      border-radius: 27px 27px 0 0;
      background: linear-gradient(90deg,#ff8c91,#ffc66f,#f5e07f,#89dcb4,#8bc8ff,#c2a3f6);
    }
    .caisha-mode-menu__head-icon {
      display: grid; place-items: center;
      width: 51px; height: 51px;
      margin: 0 auto 8px;
      border-radius: 18px;
      background: linear-gradient(142deg,#fff3c4,#ffdeeb 55%,#e6dbff);
      box-shadow: 0 5px 14px rgba(232,165,117,.18), inset 0 1px 0 #fff;
      font-size: 28px;
    }
    .caisha-mode-menu__title {
      margin: 0;
      font-size: 24px;
      line-height: 1.24;
      letter-spacing: .02em;
      font-weight: 950;
      color: #6f4559;
    }
    .caisha-mode-menu__subtitle {
      margin: 6px 0 19px;
      color: #ab8f91;
      font-size: 12px;
      font-weight: 650;
    }
    .caisha-mode-menu__item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 91px;
      margin: 0 0 11px;
      padding: 12px 37px 12px 12px;
      border: 1.5px solid var(--mode-border, #f8d5d6);
      border-radius: 20px;
      background: linear-gradient(112deg, #fff, var(--mode-bg, #fff0ef));
      box-shadow: 0 6px 15px rgba(119, 78, 93, .055), inset 0 1px 0 rgba(255,255,255,.95);
      color: #734c60;
      text-align: left;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: transform 125ms ease, box-shadow 125ms ease;
    }
    .caisha-mode-menu__item:active { transform: scale(.975); }
    .caisha-mode-menu__item:focus-visible, .caisha-mode-menu__back:focus-visible,
    .caisha-mode-menu__levels button:focus-visible {
      outline: 3px solid #a594f5;
      outline-offset: 2px;
    }
    .caisha-mode-menu__item:nth-child(1) {
      --mode-bg: #fff0e9; --mode-border: #f9d8c8; --mode-icon: #ffe6dd;
    }
    .caisha-mode-menu__item:nth-child(2) {
      --mode-bg: #ebf9fa; --mode-border: #d1edf0; --mode-icon: #daf4f6;
    }
    .caisha-mode-menu__item:nth-child(3) {
      --mode-bg: #f1edff; --mode-border: #e2d9fa; --mode-icon: #e9e2ff;
    }
    .caisha-mode-menu__mode-icon {
      display: grid; place-items: center; flex: 0 0 57px;
      height: 57px;
      border-radius: 17px;
      background: var(--mode-icon, #ffe9db);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.98);
      font-size: 29px;
    }
    .caisha-mode-menu__copy { display: block; min-width: 0; }
    .caisha-mode-menu__item strong {
      display: block; margin-bottom: 5px;
      color: #69475a; font-size: 17px; line-height: 1.1; font-weight: 900;
    }
    .caisha-mode-menu__item small {
      display: block;
      font-size: 11px; line-height: 1.45; color: #a38c94; font-weight: 650;
    }
    .caisha-mode-menu__item::after {
      content: "›"; position: absolute; right: 16px; top: 50%;
      transform: translateY(-53%);
      color: #c8a8b3; font: 900 27px/1 system-ui, sans-serif;
    }
    .caisha-mode-menu__back {
      width: 100%; min-height: 47px; margin-top: 7px;
      border: 1px solid #eedcdf; border-radius: 16px;
      background: rgba(255,255,255,.76); color: #9c737e;
      font: 850 13px/1 system-ui, sans-serif;
      cursor: pointer;
    }
    .caisha-mode-menu__levels {
      display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 10px;
      margin-bottom: 11px;
    }
    .caisha-mode-menu__levels button {
      min-height: 75px; padding: 8px 4px;
      border: 1.5px solid #dfd1f6; border-radius: 17px;
      background: linear-gradient(145deg,#fff,#f1eaff);
      color: #78639d; font: 850 14px system-ui,sans-serif;
      box-shadow: 0 5px 12px rgba(119,78,93,.06);
      cursor: pointer;
    }
    .caisha-mode-menu__levels button:disabled {
      color: #beaebc; background: #f4edf0; border-color: #eee6e9;
      box-shadow: none; cursor: not-allowed;
    }
    .caisha-mode-menu__level-number {
      display: block; font-size: 15px; font-weight: 900; line-height: 1.4;
    }
    .caisha-mode-menu__level-name {
      display: block; margin-top: 2px; font-size: 10px;
      line-height: 1.3; font-weight: 700; color: #a793a8;
    }
    @keyframes caisha-dialog-pop {
      from { opacity: .6; transform: translateY(8px) scale(.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (max-height: 590px) {
      .caisha-mode-menu__card { padding: 20px 14px 14px; }
      .caisha-mode-menu__head-icon { width: 42px; height: 42px; font-size: 23px; margin-bottom: 5px; }
      .caisha-mode-menu__subtitle { margin-bottom: 12px; }
      .caisha-mode-menu__item { min-height: 73px; padding-top: 7px; padding-bottom: 7px; margin-bottom: 8px; }
      .caisha-mode-menu__mode-icon { flex-basis: 46px; height: 46px; font-size: 24px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .caisha-mode-menu__card { animation: none; }
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
        height: 88px;
        min-height: 88px;
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
  constructor(
    container,
    { progress, onStart, onEffects, onGallery, getUnlockedLevel, showEffectsButton = false } = {}
  ) {
    ensureStyles();
    ensureRainbowSandTheme();
    ensureRainbowScoreStyles();

    this.container = container;
    this.progress = progress;
    this.onStart = onStart;
    this.onEffects = onEffects;
    this.onGallery = onGallery;
    this.getUnlockedLevel = getUnlockedLevel ?? (() => 1);
    this.showEffectsButton = Boolean(showEffectsButton);
    this.opened = true;

    this.root = el('section', 'caisha-home');
    this.root.setAttribute('aria-label', '七彩沙画消除首页');

    const top = el('div', 'caisha-home__top');
    this.best = el('div', 'caisha-home__best');

    this.effectsButton = el('button', 'caisha-home__effects');
    this.effectsButton.type = 'button';
    this.effectsButton.style.display = this.showEffectsButton
      ? 'inline-flex'
      : 'none';
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
    playImage.src = homeAsset('start_game_button_v3.png');
    playImage.alt = '开始游戏';
    playImage.width = 520;
    playImage.height = 88;
    playImage.draggable = false;
    this.playButton.setAttribute('aria-label', '开始游戏');
    this.playButton.append(playImage);
    actions.append(this.playButton);

    this.modeMenu = el('div', 'caisha-mode-menu');
    this.modeMenu.setAttribute('role', 'dialog');
    this.modeMenu.setAttribute('aria-modal', 'true');
    this.modeMenu.setAttribute('aria-label', '选择玩法');
    const card = el('div', 'caisha-mode-menu__card');
    this.modeHeadIcon = el('div', 'caisha-mode-menu__head-icon', '🌈');
    this.modeTitle = el('div', 'caisha-mode-menu__title', '选择玩法');
    this.modeSubtitle = el('div', 'caisha-mode-menu__subtitle', '开启一场缤纷的沙粒冒险');
    this.modeItems = el('div');
    this.modeBack = el('button', 'caisha-mode-menu__back', '← 返回首页');
    this.modeBack.type = 'button';
    this.modeBack.addEventListener('click', () => this.closeModeMenu());
    this.modeMenu.addEventListener('pointerdown', (event) => {
      if (event.target === this.modeMenu) this.closeModeMenu();
    });
    this.modeMenu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.closeModeMenu();
    });
    card.append(this.modeHeadIcon, this.modeTitle, this.modeSubtitle, this.modeItems, this.modeBack);
    this.modeMenu.append(card);
    this.root.append(top, brand, actions, this.modeMenu);
    this.container.appendChild(this.root);

    this.playButton.addEventListener('click', () => this.openModeMenu());

    this.openModeMenu = () => {
      this.modeMenu.classList.remove('is-level');
      this.modeTitle.textContent = '选择玩法';
      this.modeItems.replaceChildren();
      this.modeHeadIcon.textContent = '🌈';
      this.modeSubtitle.textContent = '开启一场缤纷的沙粒冒险';
      const item = (symbol, title, description, run) => {
        const button = el('button', 'caisha-mode-menu__item');
        button.type = 'button';
        const icon = el('span', 'caisha-mode-menu__mode-icon', symbol);
        icon.setAttribute('aria-hidden', 'true');
        const copy = el('span', 'caisha-mode-menu__copy');
        copy.append(el('strong', '', title), el('small', '', description));
        button.append(icon, copy);
        button.addEventListener('click', run);
        this.modeItems.appendChild(button);
      };
      item('🌈', '无尽模式', '左右同色贯通，挑战最高纪录', () => this.selectMode('endless'));
      item('🏁', '关卡模式', '闯过精心设计的彩沙挑战', () => this.openLevelMenu());
      item('🎨', '沙画模式', '堆叠缤纷彩沙，创作独特画作', () => this.selectMode('sandArt'));
      // The gallery feature remains in the project; its menu entry is hidden for now.
      this.modeBack.onclick = null;
      this.modeBack.textContent = '← 返回首页';
      this.modeMenu.classList.add('is-open');
      this.modeItems.querySelector('button')?.focus({ preventScroll: true });
    };

    this.openLevelMenu = () => {
      this.modeMenu.classList.add('is-level');
      this.modeTitle.textContent = '选择关卡';
      this.modeHeadIcon.textContent = '🏁';
      this.modeSubtitle.textContent = '12 个缤纷关卡，逐步解锁';
      this.modeItems.replaceChildren();
      const levels = el('div', 'caisha-mode-menu__levels');
      for (let n = 1; n <= 12; n++) {
        const button = el('button');
        const locked = n > this.getUnlockedLevel();
        button.type = 'button';
        button.disabled = locked;
        button.append(
          el('span', 'caisha-mode-menu__level-number', (locked ? '🔒 ' : '') + '第' + n + '关'),
          el('span', 'caisha-mode-menu__level-name', LEVEL_NAMES[n - 1])
        );
        button.addEventListener('click', () => this.selectMode('level', n));
        levels.appendChild(button);
      }
      this.modeItems.appendChild(levels);
      this.modeBack.textContent = '← 返回玩法';
      this.modeBack.onclick = () => {
        this.modeBack.onclick = null;
        this.modeBack.textContent = '← 返回首页';
        this.openModeMenu();
      };
    };

    this.closeModeMenu = () => {
      this.modeMenu.classList.remove('is-open');
      this.modeBack.onclick = null;
      this.modeBack.textContent = '返回首页';
    };

    this.selectMode = (mode, level = 1) => {
      this.onStart?.(mode, level);
      this.closeModeMenu();
      this.hide();
    };

    this.effectsButton.addEventListener('click', () => {
      if (this.showEffectsButton) this.onEffects?.();
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
      el('strong', 'caisha-rainbow-score', Number(bestScore).toLocaleString())
    );

    if (this.showEffectsButton && newCount > 0) {
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
    this.closeModeMenu?.();

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
