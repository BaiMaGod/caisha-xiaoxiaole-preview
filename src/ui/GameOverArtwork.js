import { ensureRainbowScoreStyles } from './RainbowScore.js';
import { renderArtworkPoster } from './PosterRenderer.js';

const GAME_OVER_STYLE_ID = 'caisha-game-over-artwork-styles';

function el(tag, className, text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Unable to export artwork canvas'));
    }, 'image/png');
  });
}

function ensureStyles() {
  if (document.getElementById(GAME_OVER_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = GAME_OVER_STYLE_ID;
  style.textContent = `
    .caisha-result {
      position: absolute;
      inset: 0;
      z-index: 60;
      display: none;
      overflow: hidden auto;
      padding:
        max(15px, env(safe-area-inset-top))
        18px
        max(16px, env(safe-area-inset-bottom));
      color: #5d4632;
      background:
        radial-gradient(circle at 18% 9%, rgba(255,255,255,.92) 0 6%, transparent 25%),
        radial-gradient(circle at 82% 31%, rgba(244,198,139,.24) 0 8%, transparent 29%),
        linear-gradient(180deg, rgba(255,250,241,.97), rgba(247,234,218,.98));
      backdrop-filter: blur(9px);
      font-family: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      user-select: none;
      touch-action: manipulation;
      isolation: isolate;
    }

    .caisha-result::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: -1;
      opacity: .23;
      pointer-events: none;
      background-image:
        radial-gradient(circle, rgba(105,76,50,.2) 0 .5px, transparent .7px),
        radial-gradient(circle, rgba(255,255,255,.9) 0 .65px, transparent .82px);
      background-size: 7px 7px, 11px 11px;
      background-position: 0 0, 3px 5px;
    }

    .caisha-result__card {
      width: 100%;
      min-height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      text-align: center;
    }

    .caisha-result__eyebrow {
      margin-top: 2px;
      color: rgba(105,76,51,.54);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .18em;
      opacity: 1;
      transform: translateY(0);
      transition: transform 280ms ease;
    }

    .caisha-result__frame-wrap {
      position: relative;
      height: clamp(238px, 43vh, 338px);
      aspect-ratio: 9 / 16;
      margin-top: 9px;
      perspective: 900px;
    }

    .caisha-result__frame-shadow {
      position: absolute;
      left: 9%;
      right: 9%;
      bottom: -9px;
      height: 22px;
      border-radius: 50%;
      background: rgba(72,45,24,.2);
      filter: blur(12px);
      opacity: .4;
      transform: scale(.95);
      transition: opacity 340ms ease, transform 400ms ease;
    }

    .caisha-result__frame {
      position: absolute;
      inset: 0;
      padding: clamp(8px, 1.6vh, 12px);
      overflow: hidden;
      border: 1px solid rgba(91,55,29,.25);
      border-radius: 10px;
      background:
        linear-gradient(90deg, rgba(78,45,20,.11), transparent 16%, rgba(255,255,255,.22) 43%, transparent 72%, rgba(80,44,18,.1)),
        repeating-linear-gradient(7deg, rgba(104,62,28,.08) 0 1px, transparent 1px 7px),
        linear-gradient(135deg, #c9955d 0%, #e8bd84 35%, #bd814c 67%, #e0ae72 100%);
      box-shadow:
        inset 0 1px 1px rgba(255,255,255,.58),
        inset 0 -2px 4px rgba(91,54,26,.18),
        0 11px 24px rgba(78,46,25,.15);
      opacity: 1;
      transform: translateY(0) scale(.96) rotateX(0);
      transform-origin: 50% 55%;
    }

    .caisha-result__frame::after {
      content: "";
      position: absolute;
      inset: 3px;
      border: 1px solid rgba(255,255,255,.25);
      border-radius: 7px;
      pointer-events: none;
    }

    .caisha-result__mat {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(6px, 1.2vh, 9px);
      border-radius: 4px;
      background:
        radial-gradient(circle at 28% 18%, rgba(255,255,255,.75), transparent 30%),
        linear-gradient(135deg, #fbf4e7, #efe3ce);
      box-shadow:
        inset 0 0 0 1px rgba(104,76,50,.11),
        inset 0 3px 8px rgba(102,72,43,.09);
    }

    .caisha-result__art {
      width: 100%;
      height: auto;
      max-height: 100%;
      aspect-ratio: 9 / 16;
      display: block;
      border-radius: 2px;
      background: #fff8ea;
      box-shadow:
        inset 0 0 12px rgba(79,54,35,.12),
        0 1px 1px rgba(255,255,255,.8);
      filter: saturate(1.05) contrast(1.02);
    }

    .caisha-result__copy {
      width: min(100%, 320px);
      margin-top: 15px;
      opacity: 1;
      transform: translateY(0);
      transition: transform 300ms ease;
    }

    .caisha-result__headline {
      color: #664832;
      font-size: clamp(17px, 4.7vw, 20px);
      line-height: 1.25;
      font-weight: 950;
      letter-spacing: -.02em;
    }

    .caisha-result__subline {
      margin-top: 5px;
      color: rgba(93,70,50,.62);
      font-size: 11px;
      line-height: 1.4;
      font-weight: 720;
    }

    .caisha-result__score {
      margin-top: 9px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 28px;
      padding: 6px 11px;
      border: 1px solid rgba(117,82,52,.1);
      border-radius: 999px;
      color: #78543a;
      background: rgba(255,255,255,.64);
      box-shadow: 0 5px 16px rgba(91,61,36,.06);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .03em;
    }

    .caisha-result__share-row {
      width: min(100%, 310px);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
      margin-top: 13px;
      opacity: 1;
      transform: translateY(0);
      transition: transform 280ms ease;
    }

    .caisha-result button {
      border: 0;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      font-family: inherit;
      transition: transform 120ms ease, filter 120ms ease, box-shadow 120ms ease;
    }

    .caisha-result button:active {
      transform: scale(.975);
    }

    .caisha-result__secondary {
      min-height: 42px;
      border: 1px solid rgba(108,76,51,.1) !important;
      border-radius: 15px;
      color: #715039;
      background: rgba(255,255,255,.72);
      box-shadow: 0 6px 15px rgba(87,58,33,.06);
      font-size: 12px;
      font-weight: 850;
    }

    .caisha-result__restart {
      width: min(100%, 310px);
      min-height: 50px;
      margin-top: 9px;
      overflow: hidden;
      border-radius: 18px;
      color: #fff;
      background:
        radial-gradient(circle at 17% 35%, rgba(255,255,255,.3) 0 1px, transparent 1.6px),
        radial-gradient(circle at 73% 68%, rgba(255,255,255,.2) 0 1px, transparent 1.5px),
        linear-gradient(135deg, #ff9168, #ed6f4f);
      background-size: 9px 9px, 13px 13px, auto;
      box-shadow:
        0 11px 21px rgba(219,99,66,.22),
        inset 0 1px 0 rgba(255,255,255,.32);
      font-size: 16px;
      font-weight: 950;
      letter-spacing: .04em;
      opacity: 1;
      transform: translateY(0);
      transition: transform 280ms ease, box-shadow 120ms ease;
    }

    .caisha-result__home {
      margin-top: 5px;
      padding: 8px 15px;
      color: rgba(99,72,50,.61);
      background: transparent;
      font-size: 11px;
      font-weight: 850;
      opacity: 1;
      transition: opacity 280ms ease;
    }

    .caisha-result__toast {
      position: sticky;
      left: 50%;
      bottom: 6px;
      z-index: 3;
      min-height: 30px;
      margin: 7px auto 0;
      padding: 7px 12px;
      border-radius: 999px;
      color: #fff;
      background: rgba(74,53,38,.88);
      box-shadow: 0 7px 18px rgba(54,35,22,.16);
      font-size: 10px;
      font-weight: 800;
      opacity: 0;
      transform: translateY(7px);
      pointer-events: none;
      transition: opacity 180ms ease, transform 180ms ease;
    }

    .caisha-result__toast.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .caisha-result.is-visible .caisha-result__eyebrow,
    .caisha-result.is-visible .caisha-result__copy,
    .caisha-result.is-visible .caisha-result__share-row,
    .caisha-result.is-visible .caisha-result__restart,
    .caisha-result.is-visible .caisha-result__home {
      opacity: 1;
      transform: translateY(0);
    }

    .caisha-result.is-visible .caisha-result__frame-shadow {
      opacity: .72;
      transform: scale(1);
    }

    .caisha-result.is-visible .caisha-result__frame {
      animation: caisha-frame-in 450ms cubic-bezier(.18,.85,.24,1.08) forwards;
    }

    @keyframes caisha-frame-in {
      0% {
        opacity: 1;
        transform: translateY(0) scale(.96) rotateX(0);
      }
      64% {
        opacity: 1;
        transform: translateY(0) scale(1.035) rotateX(0);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1) rotateX(0);
      }
    }

    @media (max-height: 680px) {
      .caisha-result {
        padding-top: 11px;
        padding-bottom: 10px;
      }
      .caisha-result__frame-wrap {
        height: 244px;
        margin-top: 6px;
      }
      .caisha-result__copy {
        margin-top: 11px;
      }
      .caisha-result__share-row {
        margin-top: 9px;
      }
      .caisha-result__restart {
        min-height: 45px;
      }
    }

    @media (max-height: 590px) {
      .caisha-result__frame-wrap {
        height: 205px;
      }
      .caisha-result__subline {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .caisha-result *,
      .caisha-result *::before,
      .caisha-result *::after {
        animation-duration: 1ms !important;
        transition-duration: 1ms !important;
        transition-delay: 0ms !important;
      }
    }
  `;

  document.head.appendChild(style);
}

export class GameOverArtwork {
  constructor(container, { onRestart, onHome } = {}) {
    ensureStyles();
    ensureRainbowScoreStyles();

    this.container = container;
    this.onRestart = onRestart;
    this.onHome = onHome;
    this.score = 0;
    this.rating = 'GOOD';
    this.opened = false;
    this.showTimer = null;
    this.toastTimer = null;

    this.root = el('section', 'caisha-result');
    this.root.setAttribute('aria-label', '本局沙画作品');

    const card = el('div', 'caisha-result__card');
    const eyebrow = el('div', 'caisha-result__eyebrow', '本局沙画完成');
    this.eyebrow = eyebrow;

    const frameWrap = el('div', 'caisha-result__frame-wrap');
    const frameShadow = el('div', 'caisha-result__frame-shadow');
    const frame = el('div', 'caisha-result__frame');
    const mat = el('div', 'caisha-result__mat');
    this.previewCanvas = el('canvas', 'caisha-result__art');
    mat.appendChild(this.previewCanvas);
    frame.appendChild(mat);
    frameWrap.append(frameShadow, frame);

    const copy = el('div', 'caisha-result__copy');
    const headline = el(
      'div',
      'caisha-result__headline',
      '这一局，拼出了一幅不错的沙画'
    );
    this.headline = headline;
    const subline = el(
      'div',
      'caisha-result__subline',
      '分享给好友看看你的作品'
    );
    this.subline = subline;
    this.scoreLine = el('div', 'caisha-result__score');
    copy.append(headline, subline, this.scoreLine);

    const shareRow = el('div', 'caisha-result__share-row');
    this.shareButton = el(
      'button',
      'caisha-result__secondary',
      '↗ 分享好友'
    );
    this.saveButton = el(
      'button',
      'caisha-result__secondary',
      '▣ 保存相册'
    );
    this.shareButton.type = 'button';
    this.saveButton.type = 'button';
    shareRow.append(this.shareButton, this.saveButton);

    this.restartButton = el(
      'button',
      'caisha-result__restart',
      '再来一局'
    );
    this.restartButton.type = 'button';

    this.homeButton = el(
      'button',
      'caisha-result__home',
      '返回首页'
    );
    this.homeButton.type = 'button';

    this.toast = el('div', 'caisha-result__toast');

    card.append(
      eyebrow,
      frameWrap,
      copy,
      shareRow,
      this.restartButton,
      this.homeButton,
      this.toast
    );
    this.root.appendChild(card);
    this.container.appendChild(this.root);

    this.restartButton.addEventListener('click', () => {
      this.hide();
      this.onRestart?.();
    });

    this.homeButton.addEventListener('click', () => {
      this.hide();
      this.onHome?.();
    });

    this.saveButton.addEventListener('click', () => {
      this.savePoster();
    });

    this.shareButton.addEventListener('click', () => {
      this.sharePoster();
    });
  }

  isOpen() {
    return this.opened;
  }

  show({ score = 0, rating = 'GOOD', artworkCanvas, mode = 'endless' } = {}) {
    clearTimeout(this.showTimer);
    clearTimeout(this.toastTimer);

    this.score = Number(score) || 0;
    this.rating = String(rating || 'GOOD').toUpperCase();
    this.mode = mode;
    this.eyebrow.textContent = mode === 'sandArt' ? '七彩流沙 · 原创沙画' : '本局沙画完成';
    this.headline.textContent = mode === 'sandArt' ? '你的沙画完成啦！' : '这一局，拼出了一幅不错的沙画';
    this.subline.textContent = mode === 'sandArt' ? '把独一无二的作品送给好友' : '分享给好友看看你的作品';
    this.restartButton.textContent = mode === 'sandArt' ? '再画一幅' : '再来一局';
    this.scoreLine.style.display = mode === 'sandArt' ? 'none' : 'inline-flex';
    this.scoreLine.replaceChildren(
      el('span', 'caisha-rainbow-score', this.score.toLocaleString()),
      document.createTextNode(` 分 · ${this.rating}`)
    );

    if (artworkCanvas) {
      this.setArtwork(artworkCanvas);
    }

    this.opened = true;
    this.root.style.display = 'block';
    this.root.scrollTop = 0;
    // All controls and the framed picture are visible on the first painted frame.
    // The wood frame keeps a short scale-in animation, never a fully blank result.
    this.root.classList.add('is-visible');
  }

  hide() {
    clearTimeout(this.showTimer);
    clearTimeout(this.toastTimer);
    this.opened = false;
    this.root.classList.remove('is-visible');
    this.root.style.display = 'none';
    this.toast.classList.remove('is-visible');
  }

  setArtwork(source) {
    const width = Math.max(1, source.width || 1);
    const height = Math.max(1, source.height || 1);

    this.previewCanvas.width = width;
    this.previewCanvas.height = height;

    const ctx = this.previewCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);
  }

  showToast(message) {
    clearTimeout(this.toastTimer);
    this.toast.textContent = message;
    this.toast.classList.add('is-visible');

    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove('is-visible');
    }, 1800);
  }

  renderPoster() {
    return renderArtworkPoster({
      createCanvas: () => document.createElement('canvas'),
      artworkCanvas: this.previewCanvas,
      score: this.score,
      rating: this.rating,
      mode: this.mode
    });
  }
  async savePoster({ fallbackMessage = '沙画作品已生成' } = {}) {
    try {
      const poster = this.renderPoster();
      const blob = await canvasToBlob(poster);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `七彩沙画消除-${Date.now()}.png`;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1200);
      this.showToast('已生成沙画图片，可保存到相册');
    } catch (error) {
      console.error(error);
      this.showToast(fallbackMessage);
    }
  }

  async sharePoster() {
    try {
      const poster = this.renderPoster();
      const blob = await canvasToBlob(poster);
      const file = new File(
        [blob],
        `七彩沙画消除-${Date.now()}.png`,
        { type: 'image/png' }
      );

      const payload = {
        title: '七彩沙画消除',
        text: '这一局，拼出了一幅不错的沙画',
        files: [file]
      };

      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare(payload))
      ) {
        await navigator.share(payload);
        return;
      }

      await this.savePoster({
        fallbackMessage: '当前浏览器暂不支持直接分享'
      });
      this.showToast('当前浏览器不支持直分享，已生成分享图');
    } catch (error) {
      if (error?.name === 'AbortError') return;

      console.error(error);
      this.showToast('分享未完成，可先保存图片再发送给好友');
    }
  }
}
