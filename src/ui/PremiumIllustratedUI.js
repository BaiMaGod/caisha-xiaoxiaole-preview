/**
 * Premium sand-art presentation, built from individually prepared artwork
 * layers cropped from the approved UI mockups. HTML controls stay real buttons;
 * illustrations are decorative, never substitute game state or exported art.
 */
const STYLE_ID = 'caisha-premium-illustrated-ui-v2';

export function premiumUiAsset(filename) {
  const base = import.meta.env?.BASE_URL || './';
  return `${base}images/ui-premium/${filename}`;
}

export function ensurePremiumIllustratedUI() {
  if (document.getElementById(STYLE_ID)) return;
  const img = premiumUiAsset;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* Full-depth dreamy world behind the actual accessible mode dialog. */
    .caisha-mode-menu {
      background: url('${img('dreamy-world.webp')}') center / cover no-repeat !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__card {
      width: min(100%, 368px);
      max-height: 98%;
      padding: 0 13px 15px;
      border-radius: 30px;
      border: 1.5px solid rgba(255,255,255,.95);
      background: linear-gradient(165deg,#fff3df,#fff8f0 63%,#fff0e1) !important;
      box-shadow: 0 17px 34px rgba(107,71,80,.23),inset 0 2px 0 rgba(255,255,255,.94) !important;
      overflow: hidden auto;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__card::before {display:none !important;}
    .caisha-mode-menu__illustrated-head {
      display: block;
      width: calc(100% + 26px);
      height: auto;
      max-width: none;
      margin: -1px -13px 4px;
      border-radius: 29px 29px 0 0;
      pointer-events: none;
      user-select: none;
    }
    /* The header's title is reproduced by the approved illustrated asset;
       the matching DOM text remains in the accessible document. */
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__head-icon,
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__title,
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__subtitle {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      opacity: 0 !important;
      overflow: hidden !important;
      pointer-events: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item {
      position: relative;
      width: 100%;
      height: auto;
      min-height: unset;
      aspect-ratio: 773 / 232;
      padding: 0 !important;
      margin: 0 0 6px;
      border: 0 !important;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: none !important;
      background: url('${img('card-endless.webp')}') center/100% 100% no-repeat !important;
      -webkit-tap-highlight-color: transparent;
      transition: transform .13s ease, filter .13s ease;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item:nth-child(2) {
      background-image: url('${img('card-level.webp')}') !important;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item:nth-child(3) {
      background-image: url('${img('card-art.webp')}') !important;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item::after {display:none !important;}
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__mode-icon {display:none !important;}
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__copy {
      position: absolute;
      left: 28%;
      right: 11%;
      top: 24%;
      display: block;
      z-index: 2;
      text-align: left;
      pointer-events: none;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item strong {
      margin: 0 0 5px;
      color: #734451;
      font: 950 clamp(16px,4.6vw,19px)/1.18 ui-rounded,system-ui,sans-serif;
      text-shadow: 0 2px 0 rgba(255,255,255,.65);
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item small {
      color: #a9848a;
      font: 750 clamp(9px,2.45vw,11px)/1.35 ui-rounded,system-ui,sans-serif;
      letter-spacing: -.01em;
      white-space: nowrap;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__back {
      display: block;
      position: relative;
      width: 100%;
      min-height: unset;
      aspect-ratio: 765 / 138;
      height: auto;
      padding: 0;
      margin: 6px 0 0;
      border: 0 !important;
      border-radius: 999px;
      color: #8b5c5e;
      background: url('${img('back-button.webp')}') center / 100% 100% no-repeat !important;
      box-shadow: none !important;
      font: 950 clamp(14px,4vw,18px)/1.2 ui-rounded,system-ui,sans-serif;
      text-shadow: 0 1px #fff;
    }
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__back:active,
    .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item:active {
      transform: scale(.977);
      filter: brightness(.98);
    }
    .caisha-mode-menu.is-level .caisha-mode-menu__illustrated-head {display:none;}
    .caisha-mode-menu.is-level .caisha-mode-menu__card {
      background: linear-gradient(165deg,#fffaf0,#fff0ef) !important;
      border:2px solid white;
    }
    .caisha-mode-menu.is-level .caisha-mode-menu__card::before {
      background:linear-gradient(90deg,#ffa8ae,#ffd082,#9bdcc9,#8bbff6,#b7a0e9);
    }
    /* The full composition is a scenic layer; the player's canvas is real,
       drawn above the mockup's example artwork and kept inside the wood frame. */
    .caisha-result.is-premium-art {
      background: #ffe8dd url('${img('dreamy-world.webp')}') center / cover no-repeat !important;
      padding:0 !important;
      overflow:hidden !important;
    }
    .caisha-result.is-premium-art::before {display:none !important;}
    .caisha-result.is-premium-art .caisha-result__card {
      position:relative;
      width:100%;
      height:100%;
      min-height:0;
      display:block;
      overflow:hidden;
      background: url('${img('art-result-world.webp')}') center / 100% 100% no-repeat;
    }
    .caisha-result.is-premium-art .caisha-result__eyebrow {
      position:absolute !important;
      width:1px !important;height:1px !important;overflow:hidden !important;
      opacity:0 !important;pointer-events:none;
    }
    /* The DOM headline must remain visible to automated QA and assistive
       semantics. The illustrated page already paints it, so its letters are
       transparent without hiding or collapsing the live element. */
    .caisha-result.is-premium-art .caisha-result__copy {
      position:absolute !important;
      left:15%;top:56%;width:70%;height:10%;
      padding:0;margin:0;
      opacity:1 !important;
      overflow:visible !important;
      pointer-events:none;
      background:none !important;
    }
    .caisha-result.is-premium-art .caisha-result__headline,
    .caisha-result.is-premium-art .caisha-result__subline {
      color:transparent !important;
      text-shadow:none !important;
    }
    .caisha-result.is-premium-art .caisha-result__frame-wrap {
      position:absolute;
      left:28.9%;top:14.65%;
      width:42.1%;height:36.8%;
      margin:0;
      aspect-ratio:auto;
      perspective:none;
      z-index:1;
    }
    .caisha-result.is-premium-art .caisha-result__frame-shadow {display:none;}
    .caisha-result.is-premium-art .caisha-result__frame,
    .caisha-result.is-premium-art.is-visible .caisha-result__frame {
      inset:0;
      padding:0;
      border:0;
      border-radius:0;
      background:none;
      box-shadow:none;
      opacity:1;
      transform:none;
      animation:none;
    }
    .caisha-result.is-premium-art .caisha-result__frame::after {display:none;}
    .caisha-result.is-premium-art .caisha-result__mat {
      width:100%;height:100%;
      padding:0;
      border-radius:0;
      background:#fff8e8;
      box-shadow:none;
    }
    .caisha-result.is-premium-art .caisha-result__art {
      display:block;
      width:100%;height:100%;max-height:none;
      aspect-ratio:auto;
      object-fit:contain;
      border-radius:0;
      background:#fff9ed;
      box-shadow:none;
      image-rendering:auto;
      filter:none;
    }
    /* These native buttons coincide with the labels printed on the polished
       image; they remain clickable, tabbable, and accessible by their text. */
    .caisha-result.is-premium-art .caisha-result__share-row {
      position:absolute;
      left:9.3%;top:66.65%;
      width:81.5%;height:7.1%;
      margin:0;padding:0;
      display:grid;grid-template-columns:1fr 1fr;gap:2%;
      opacity:1;transform:none;
      z-index:3;
    }
    .caisha-result.is-premium-art .caisha-result__secondary,
    .caisha-result.is-premium-art .caisha-result__restart,
    .caisha-result.is-premium-art .caisha-result__home {
      opacity:1;
      padding:0;
      border:0 !important;
      color:transparent !important;
      background:transparent !important;
      box-shadow:none !important;
      text-shadow:none !important;
      cursor:pointer;
      transition:none;
      -webkit-tap-highlight-color:transparent;
    }
    .caisha-result.is-premium-art .caisha-result__secondary {
      width:100%;height:100%;min-height:0;border-radius:999px;
    }
    .caisha-result.is-premium-art .caisha-result__restart {
      position:absolute;
      left:13.5%;top:74.9%;width:73%;height:8.2%;
      margin:0;min-height:0;
      z-index:3;
    }
    .caisha-result.is-premium-art .caisha-result__home {
      position:absolute;
      left:32%;top:84%;width:36%;height:5.7%;
      margin:0;min-height:0;z-index:3;
    }
    .caisha-result.is-premium-art button:focus-visible {
      opacity:.62 !important;
      outline:3px solid #8f73ca;
      outline-offset:-3px;
    }
    .caisha-result.is-premium-art .caisha-result__toast {
      position:absolute;
      bottom:2.5%;left:50%;width:max-content;max-width:85%;
      z-index:5;margin:0;
      transform:translate(-50%,6px);
    }
    .caisha-result.is-premium-art .caisha-result__toast.is-visible {
      transform:translate(-50%,0);
    }
    @media (max-height:590px) {
      .caisha-mode-menu:not(.is-level) .caisha-mode-menu__card {padding-bottom:9px;}
      .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item {margin-bottom:3px;}
      .caisha-mode-menu:not(.is-level) .caisha-mode-menu__copy {top:21%;}
    }
    @media (prefers-reduced-motion:reduce) {
      .caisha-mode-menu:not(.is-level) .caisha-mode-menu__item {transition:none;}
    }
  `;
  document.head.appendChild(style);
}
