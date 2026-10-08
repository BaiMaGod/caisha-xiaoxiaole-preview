/**
 * Rainbow sand UI: reusable shapes and colors derived from the approved
 * selection / sand-art result concept artwork. Pure presentation layer:
 * no gameplay or settings state is modified.
 */
const STYLE_ID = 'caisha-rainbow-sand-theme-v1';

export function ensureRainbowSandTheme() {
  if (document.getElementById(STYLE_ID)) return;
  const base = import.meta.env?.BASE_URL || './';
  const asset = (filename) => `${base}images/ui-theme/${filename}`;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* One consistent warm cream / rainbow sand material system. */
    .caisha-mode-menu {
      background:
        linear-gradient(180deg, rgba(255,248,236,.15), rgba(255,231,216,.19)),
        url("${asset('sand-dream-bg.svg')}") center / cover no-repeat !important;
      backdrop-filter: blur(7px);
      -webkit-backdrop-filter: blur(7px);
    }
    .caisha-mode-menu__card {
      width: min(100%, 362px);
      padding: 23px 18px 17px;
      border: 2px solid rgba(255,255,255,.94);
      border-radius: 29px;
      background:
        radial-gradient(circle at 84% 16%, rgba(255,222,223,.4), transparent 28%),
        radial-gradient(circle at 3% 56%, rgba(255,216,143,.28), transparent 32%),
        linear-gradient(160deg, rgba(255,251,240,.96), rgba(255,242,234,.98)) !important;
      box-shadow:
        0 17px 36px rgba(122,77,65,.20),
        0 1px 0 rgba(255,255,255,.7) inset !important;
    }
    .caisha-mode-menu__card::before {
      height: 6px;
      background: linear-gradient(90deg,#ff9295,#ffc776,#e8df8f,#a8e3c6,#9acbff,#d7b9ff);
    }
    .caisha-mode-menu__head-icon {
      width: 65px;
      height: 65px;
      margin-bottom: 7px;
      border-radius: 23px;
      background: url("${asset('mode-rainbow.svg')}") center/86% no-repeat,
        linear-gradient(145deg,#fff9eb,#ffe3ee 60%,#efeeff) !important;
      box-shadow: 0 9px 17px rgba(174,112,101,.12),inset 0 2px 0 white !important;
      color: transparent;
      font-size: 0;
    }
    .caisha-mode-menu.is-level .caisha-mode-menu__head-icon {
      background: url("${asset('mode-flag.svg')}") center/86% no-repeat,
        linear-gradient(145deg,#fff9ee,#dff9fb) !important;
    }
    .caisha-mode-menu__title {
      color: #7b4351;
      font-size: clamp(22px,6vw,26px);
      font-weight: 950;
      text-shadow: 0 2px 0 rgba(255,255,255,.93);
    }
    .caisha-mode-menu__subtitle {
      color: #aa7e80;
      font-size: 12px;
      margin-bottom: 18px;
    }
    .caisha-mode-menu__item {
      min-height: 89px;
      gap: 12px;
      margin-bottom: 11px;
      padding: 12px 37px 12px 11px;
      overflow: hidden;
      border-width: 2px;
      border-radius: 21px;
      background:
        url("${asset('sand-wave.svg')}") bottom right/100% 34px no-repeat,
        linear-gradient(112deg,rgba(255,255,255,.98),var(--mode-bg,#fff0ef)) !important;
      box-shadow:
        inset 0 2px 0 rgba(255,255,255,.98),
        0 7px 16px rgba(119,78,93,.11),
        0 1px 0 rgba(255,255,255,.8) !important;
    }
    .caisha-mode-menu__item:nth-child(1) {
      --mode-bg:#ffe8e2;--mode-border:#ffd7cb;--mode-icon:#ffe5df;
    }
    .caisha-mode-menu__item:nth-child(2) {
      --mode-bg:#e2f8f8;--mode-border:#cceaf0;--mode-icon:#d9f4f6;
    }
    .caisha-mode-menu__item:nth-child(3) {
      --mode-bg:#eee7ff;--mode-border:#e0d5ff;--mode-icon:#eae1ff;
    }
    .caisha-mode-menu__mode-icon {
      flex-basis: 58px;
      height: 58px;
      border-radius: 18px;
      font-size: 0;
      background: url("${asset('mode-rainbow.svg')}") center / 86% no-repeat,
        var(--mode-icon) !important;
      box-shadow: inset 0 1px 0 white,0 2px 8px rgba(117,65,84,.06);
    }
    .caisha-mode-menu__item:nth-child(2) .caisha-mode-menu__mode-icon {
      background: url("${asset('mode-flag.svg')}") center / 86% no-repeat,
        var(--mode-icon) !important;
    }
    .caisha-mode-menu__item:nth-child(3) .caisha-mode-menu__mode-icon {
      background: url("${asset('mode-palette.svg')}") center / 86% no-repeat,
        var(--mode-icon) !important;
    }
    .caisha-mode-menu__item strong {
      font-size: 17px;
      color: #704451;
      text-shadow: 0 1px rgba(255,255,255,.7);
    }
    .caisha-mode-menu__item small {
      color: #ad8b8f;
      font-size: 11px;
    }
    .caisha-mode-menu__item::after {
      color: #df898d;
      font-size: 30px;
      right: 16px;
    }
    .caisha-mode-menu__back {
      min-height: 47px;
      margin-top: 7px;
      border: 2px solid #f3e0dc;
      border-radius: 999px;
      background: linear-gradient(165deg,rgba(255,255,255,.98),rgba(255,249,242,.96));
      color: #a06c6f;
      box-shadow: inset 0 2px 0 white,0 5px 14px rgba(116,77,65,.07);
    }
    .caisha-mode-menu__levels {
      gap: 9px;
    }
    .caisha-mode-menu__levels button {
      min-height: 73px;
      border-color: #e8d9f5;
      background:
        linear-gradient(145deg,rgba(255,255,255,.98),rgba(248,231,251,.85));
      color: #84629b;
      box-shadow: inset 0 2px 0 white,0 4px 12px rgba(118,77,93,.09);
    }
    .caisha-mode-menu__levels button:disabled {
      background: #f6f0ef;
      border-color: #eee4e9;
    }

    /* Frame contents remain the exact saved screenshot, never AI artwork. */
    .caisha-result {
      background:
        linear-gradient(180deg,rgba(255,251,244,.38),rgba(255,250,241,.45)),
        url("${asset('sand-dream-bg.svg')}") center/cover no-repeat !important;
      color:#76524a;
    }
    .caisha-result::before {
      opacity: .12;
      z-index: -1;
    }
    .caisha-result__card {
      position: relative;
      isolation: isolate;
    }
    .caisha-result__eyebrow {
      color: #ac786e;
      font-size: 11px;
      letter-spacing: .12em;
      text-shadow: 0 1px white;
    }
    .caisha-result__frame-wrap {
      height: clamp(228px,42vh,337px);
      margin-top: 11px;
    }
    .caisha-result__frame {
      border: 2px solid rgba(255,250,232,.95);
      border-radius: 14px;
      box-shadow:
        0 0 0 2px rgba(167,104,59,.36),
        0 15px 30px rgba(117,66,45,.17),
        inset 0 2px 3px rgba(255,255,255,.55);
    }
    .caisha-result__mat {
      border-radius: 6px;
      box-shadow: inset 0 0 0 1px rgba(124,71,43,.14);
    }
    .caisha-result__copy {
      position: relative;
      margin-top: 16px;
      padding: 9px 6px 4px;
      border-radius: 25px;
      background: radial-gradient(ellipse at center,rgba(255,249,235,.94),rgba(255,249,235,0) 74%);
    }
    .caisha-result__headline {
      color: #82464f;
      font-size: clamp(20px,5.5vw,25px);
      font-weight: 950;
      text-shadow: 0 2px #fff;
    }
    .caisha-result__subline {
      color: #ad7f72;
      font-size: 12px;
    }
    .caisha-result__share-row {
      width: min(100%,320px);
      gap: 10px;
      margin-top: 14px;
    }
    .caisha-result__secondary {
      min-height: 46px;
      border: 2px solid rgba(255,255,255,.97) !important;
      border-radius: 999px;
      color: #854d57;
      background:
        url("${asset('sand-wave.svg')}") bottom/100% 20px no-repeat,
        linear-gradient(145deg,#fffefe,#fff2ed);
      box-shadow: 0 8px 15px rgba(123,82,70,.1),inset 0 2px 0 white;
      font-size: 12px;
    }
    .caisha-result__restart {
      width: min(100%,320px);
      min-height: 51px;
      border: 2px solid rgba(255,246,226,.96) !important;
      border-radius: 999px;
      background:
        url("${asset('sand-wave.svg')}") bottom/100% 33px no-repeat,
        linear-gradient(115deg,#ffb08c,#ff806d 58%,#f57571) !important;
      box-shadow: 0 12px 21px rgba(223,120,91,.25),inset 0 2px 0 rgba(255,255,255,.5);
      font-size: 17px;
      text-shadow: 0 1px 2px rgba(155,72,55,.2);
    }
    .caisha-result__home {
      margin-top: 6px;
      min-height: 36px;
      color:#966b69;
      font-size: 12px;
    }
    .caisha-result__score {
      color:#9b6870;
      background:rgba(255,255,255,.79);
    }

    /* Level victory, failure and the retained artwork gallery. */
    .caisha-mode-panel {
      background:
        linear-gradient(180deg,rgba(255,250,242,.2),rgba(255,248,240,.34)),
        url("${asset('sand-dream-bg.svg')}") center/cover no-repeat !important;
      color:#794c56 !important;
    }
    .caisha-mode-panel__card {
      border: 2px solid #fff !important;
      border-radius: 27px !important;
      padding: 25px 18px !important;
      background: linear-gradient(160deg,#fffaf2,#ffedf0) !important;
      box-shadow:0 16px 32px rgba(124,77,66,.18),inset 0 3px 0 #fff !important;
    }
    .caisha-mode-panel__card h2 {
      margin:6px 0 10px;
      color:#854e5d !important;
      font-size:clamp(19px,5.2vw,24px) !important;
      line-height:1.3;
    }
    .caisha-mode-panel__card p { color:#a27670 !important; }
    .caisha-mode-panel__button {
      min-height: 43px;
      border: 2px solid #fff !important;
      border-radius:999px !important;
      background:linear-gradient(125deg,#ffac8f,#f88577) !important;
      box-shadow:0 6px 14px rgba(213,113,103,.18),inset 0 2px rgba(255,255,255,.4);
    }
    .caisha-mode-panel__card > button:last-child {
      background:linear-gradient(145deg,#fff,#fff1e9) !important;
      color:#985e68 !important;
    }
    .caisha-mode-panel__card > button:not(.caisha-mode-panel__button) {
      border:1px solid #f5deda !important;
      border-radius:18px !important;
      background:linear-gradient(140deg,#fff,#fff8ef) !important;
    }
    @media (max-height: 700px) {
      .caisha-mode-menu__card {padding: 17px 15px 13px;}
      .caisha-mode-menu__head-icon {width:52px;height:52px;margin-bottom:5px;}
      .caisha-mode-menu__subtitle {margin-bottom:12px;}
      .caisha-mode-menu__item {min-height:76px;margin-bottom:8px;padding-top:8px;padding-bottom:8px;}
      .caisha-mode-menu__mode-icon {flex-basis:50px;height:50px;}
      .caisha-result__frame-wrap {height:clamp(200px,38vh,270px);}
      .caisha-result__copy {margin-top:8px;}
      .caisha-result__share-row {margin-top:8px;}
    }
    @media (max-height: 590px) {
      .caisha-mode-menu__card {padding:11px 13px;}
      .caisha-mode-menu__item {min-height:65px;}
      .caisha-mode-menu__mode-icon {flex-basis:43px;height:43px;}
      .caisha-result__frame-wrap {height:190px;}
      .caisha-result__copy {padding:3px 0 0;}
    }
    @media (prefers-reduced-motion:reduce) {
      .caisha-mode-menu *, .caisha-result *, .caisha-mode-panel * {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
      }
    }
  `;
  document.head.appendChild(style);
}
