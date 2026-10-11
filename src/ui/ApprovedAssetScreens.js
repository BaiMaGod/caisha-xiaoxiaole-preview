/**
 * Approved illustrated UI (11 October): artwork cropped from the exact
 * user-approved mode/level mockup. These are real image files, not CSS-painted
 * imitations. All controls, save progress, scores and unlocks remain live DOM.
 */
const STYLE_ID = 'caisha-approved-assets-20261011';
const BASE = () => (import.meta.env?.BASE_URL || './') + 'images/approved-ui/';
const img = filename => BASE() + filename;

export function ensureApprovedAssetScreens() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
  .caisha-mode-menu.approved-art-v1 {
    display:none;position:absolute;inset:0;z-index:30;
    padding:0 !important;overflow:hidden !important;
    background:#fff9ec url('${img('background-mode.webp')}') center/100% 100% no-repeat !important;
    color:#79513f;backdrop-filter:none !important;-webkit-backdrop-filter:none !important;
    touch-action:pan-y;
  }
  .caisha-mode-menu.approved-art-v1.is-level {
    background-image:url('${img('background-level.webp')}') !important;
  }
  .caisha-mode-menu.approved-art-v1.is-open {display:flex !important;}
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__card {
    box-sizing:border-box;position:relative !important;display:flex !important;
    flex-direction:column !important;align-items:center !important;
    justify-content:flex-start !important;gap:0;
    width:min(100%,440px) !important;max-width:440px !important;
    height:100% !important;max-height:100% !important;min-height:0 !important;
    margin:0 auto !important;
    padding:max(14px,env(safe-area-inset-top)) 17px max(14px,env(safe-area-inset-bottom)) !important;
    overflow-y:auto !important;overflow-x:hidden !important;
    border:0 !important;border-radius:0 !important;
    background:transparent !important;box-shadow:none !important;
    scrollbar-width:none;overscroll-behavior:contain;animation:none !important;
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__card::-webkit-scrollbar{display:none;}
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__card::before{display:none !important;}
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__head-icon,
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__illustrated-head,
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__brand,
  .caisha-mode-menu.approved-art-v1 .soft-sand__scenery{display:none !important;}
  .caisha-mode-menu.approved-art-v1 .approved-art__topbar {
    width:100%;min-height:51px;display:flex;align-items:center;justify-content:center;
    flex:0 0 auto;position:relative;margin-bottom:clamp(6px,1.3vh,17px);
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__back,
  .caisha-mode-menu.approved-art-v1 .approved-art__gear {
    display:flex !important;align-items:center;justify-content:center;
    box-sizing:border-box;position:absolute !important;top:2px;
    width:46px !important;height:46px !important;min-height:46px !important;
    aspect-ratio:1 !important;margin:0 !important;padding:0 !important;
    border:1px solid #eee6dc !important;border-radius:50% !important;
    background:#fffdfaeb !important;box-shadow:0 3px 14px #8a67441b !important;
    color:#775a47 !important;-webkit-text-fill-color:#775a47 !important;
    font:800 27px/1 ui-rounded,system-ui,sans-serif !important;
    text-shadow:none !important;cursor:pointer;z-index:3;
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__back {left:0;font-size:0 !important;}
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__back::after {
    content:' ';width:13px;height:13px;border-left:4px solid #795c48;
    border-bottom:4px solid #795c48;border-radius:2px;
    transform:translateX(3px) rotate(45deg);
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__gear {right:0;font-size:26px !important;}
  .caisha-mode-menu.approved-art-v1 .approved-art__record {
    min-height:43px;max-width:calc(100% - 110px);padding:7px 16px;
    box-sizing:border-box;display:flex;justify-content:center;align-items:center;gap:7px;
    border:1px solid #eee6dc;border-radius:999px;background:#fffcf8e8;
    box-shadow:0 3px 14px #82664e13;
    color:#6f513f;font:800 13px/1.25 ui-rounded,system-ui,sans-serif;white-space:nowrap;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__record strong {
    color:#b57760;font-size:clamp(15px,4.2vw,20px);font-weight:950;
    background:linear-gradient(90deg,#d37b57,#d8aa51,#78b6a3,#759fc6);
    color:transparent;-webkit-background-clip:text;background-clip:text;
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__title {
    position:absolute !important;width:1px !important;height:1px !important;
    opacity:0 !important;overflow:hidden !important;padding:0 !important;margin:0 !important;
    border:0 !important;box-shadow:none !important;pointer-events:none;
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__subtitle {display:none !important;}
  .caisha-mode-menu.approved-art-v1 .approved-art__headline {
    flex:0 0 auto;display:block;max-width:100%;height:auto;object-fit:contain;
    pointer-events:none;user-select:none;-webkit-user-drag:none;
  }
  .caisha-mode-menu.approved-art-v1.is-main .approved-art__headline {
    width:min(100%,360px);max-height:clamp(72px,13.6svh,108px);
    margin:6px auto clamp(7px,1.9svh,20px);
  }
  .caisha-mode-menu.approved-art-v1.is-level .approved-art__headline {
    width:min(100%,352px);max-height:clamp(103px,18svh,157px);
    margin:0 auto clamp(6px,1.1svh,12px);
  }
  .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__items {
    box-sizing:border-box !important;display:flex !important;align-items:stretch !important;
    flex-direction:column !important;flex:0 0 auto !important;
    width:100% !important;height:auto !important;min-height:0 !important;
    max-height:none !important;aspect-ratio:auto !important;
    position:relative !important;padding:0 !important;margin:0 !important;
    border:0 !important;border-radius:0 !important;
    background:transparent !important;box-shadow:none !important;overflow:visible !important;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__items {
    gap:clamp(10px,1.8svh,19px);padding-bottom:18svh !important;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item {
    box-sizing:border-box !important;position:relative !important;display:block !important;
    flex:0 0 auto !important;width:100% !important;height:auto !important;
    min-height:0 !important;max-height:none !important;aspect-ratio:506/257 !important;
    overflow:visible !important;margin:0 !important;padding:0 !important;
    border:0 !important;border-radius:0 !important;
    background:none !important;box-shadow:none !important;
    transform:none;filter:none;cursor:pointer;touch-action:manipulation;
    -webkit-tap-highlight-color:transparent;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item::before,
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item::after {display:none !important;content:none !important;}
  .caisha-mode-menu.approved-art-v1.is-main .approved-art__mode-picture {
    display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:fill;
    border:0;border-radius:0;pointer-events:none;user-select:none;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__mode-icon,
  .caisha-mode-menu.approved-art-v1.is-main .soft-sand__mode-art,
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__copy {
    position:absolute !important;width:1px !important;height:1px !important;
    left:0 !important;top:0 !important;overflow:hidden !important;
    opacity:0 !important;pointer-events:none !important;
  }
  .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__item:active {
    transform:scale(.977) !important;filter:brightness(.985) !important;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-grid {
    width:100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
    gap:clamp(9px,1.4svh,17px) clamp(10px,2.1vw,16px);
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-card {
    position:relative;box-sizing:border-box;display:block !important;
    width:100%;min-width:0;height:auto;min-height:0;aspect-ratio:140/148;
    padding:0 !important;margin:0 !important;overflow:hidden;
    border:0 !important;border-radius:14px !important;
    background:#fff4e2 center / 100% 100% no-repeat !important;
    box-shadow:0 5px 12px #92694b20 !important;
    cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
    color:#805846 !important;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-card.is-current {
    outline:2px solid #eba996 !important;outline-offset:1px;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-card:disabled {
    cursor:not-allowed !important;filter:saturate(.58) brightness(.975) !important;
    opacity:.84 !important;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__number {
    position:absolute;top:14%;left:0;right:0;
    color:#805845 !important;-webkit-text-fill-color:#805845 !important;
    text-align:center;font:950 clamp(20px,6.8vw,37px)/1 ui-rounded,system-ui,sans-serif;
    text-shadow:0 1px #fff9ee;pointer-events:none;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__stars {
    display:flex;align-items:center;justify-content:center;gap:1px;
    position:absolute;top:45%;left:0;right:0;height:26%;pointer-events:none;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__stars img {
    width:clamp(16px,4.2vw,25px);height:auto;aspect-ratio:1;object-fit:contain;
    display:block;user-select:none;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__lock {
    position:absolute;z-index:2;top:16%;left:50%;width:clamp(22px,5vw,29px);
    height:auto;transform:translateX(-50%);pointer-events:none;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-card:disabled .approved-art__number {
    top:44%;color:#947c6c !important;-webkit-text-fill-color:#947c6c !important;
    font-size:clamp(17px,5vw,26px);
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__level-card:disabled .approved-art__stars {top:68%;opacity:.56;}
  .caisha-mode-menu.approved-art-v1.is-level .caisha-mode-menu__items {padding-bottom:15svh !important;}
  .caisha-mode-menu.approved-art-v1 .approved-art__page-dots {
    display:flex;align-items:center;justify-content:center;gap:11px;
    width:100%;margin-top:clamp(8px,1.8svh,16px);
    font-size:0;pointer-events:none;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__page-dots span {
    width:8px;height:8px;border-radius:50%;background:#dec5a8;
  }
  .caisha-mode-menu.approved-art-v1 .approved-art__page-dots span:first-child{background:#a7846e;}
  .caisha-mode-menu.approved-art-v1 button:focus-visible {
    outline:3px solid #c28e76 !important;outline-offset:3px !important;
  }
  @media(max-height:740px){
    .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__card {padding-top:max(7px,env(safe-area-inset-top)) !important;}
    .caisha-mode-menu.approved-art-v1 .approved-art__topbar{margin-bottom:4px;min-height:44px;}
    .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__back,
    .caisha-mode-menu.approved-art-v1 .approved-art__gear{width:40px !important;height:40px !important;min-height:40px !important;}
    .caisha-mode-menu.approved-art-v1.is-main .approved-art__headline {max-height:70px;margin:1px auto 4px;}
    .caisha-mode-menu.approved-art-v1.is-main .caisha-mode-menu__items {gap:6px;}
    .caisha-mode-menu.approved-art-v1.is-level .approved-art__headline {max-height:95px;margin:0 auto 4px;}
    .caisha-mode-menu.approved-art-v1 .approved-art__level-grid{gap:7px;}
  }
  @media(max-width:350px){
    .caisha-mode-menu.approved-art-v1 .caisha-mode-menu__card {padding-left:10px !important;padding-right:10px !important;}
    .caisha-mode-menu.approved-art-v1 .approved-art__record {padding:7px 10px;font-size:11px;}
    .caisha-mode-menu.approved-art-v1 .approved-art__level-grid{gap:8px;}
  }
  @media(prefers-reduced-motion:reduce){
    .caisha-mode-menu.approved-art-v1 * {transition:none !important;animation:none !important;}
  }
  `;
  document.head.appendChild(style);
}

export function approvedUiAsset(name) { return img(name); }

export function renderApprovedLevels({levelNames,unlockedLevel,getStars,onSelect}) {
  const grid = document.createElement('div');
  grid.className='approved-art__level-grid';
  grid.setAttribute('aria-label','关卡列表');
  for (let i=0;i<levelNames.length;i++) {
    const number = i+1;
    const locked = number>unlockedLevel;
    const stars = locked ? 0 : Math.max(0,Math.min(3,Number(getStars(number))||0));
    const button = document.createElement('button');
    button.type='button';
    button.className='approved-art__level-card';
    button.dataset.level=String(number);
    button.disabled=locked;
    button.style.setProperty('background-image',`url("${img(`level-card-${String(number).padStart(2,'0')}.webp`)}")`,'important');
    if(number===unlockedLevel)button.classList.add('is-current');
    button.setAttribute('aria-label',`第${number}关 ${levelNames[i]}${locked?'，未解锁':`，${stars}星`}`);
    const n=document.createElement('span');n.className='approved-art__number';n.textContent=String(number);
    const row=document.createElement('span');row.className='approved-art__stars';row.setAttribute('aria-hidden','true');
    for(let j=0;j<3;j++){
      const star=document.createElement('img');
      star.src=img(j<stars?'star-filled.png':'star-empty.png');
      star.alt='';star.draggable=false;row.append(star);
    }
    button.append(n,row);
    if(locked){
      const icon=document.createElement('img');icon.className='approved-art__lock';
      icon.src=img('lock.png');icon.alt='';icon.draggable=false;
      icon.setAttribute('aria-hidden','true');button.append(icon);
    }
    button.addEventListener('click',()=>{if(!locked)onSelect(number);});
    grid.append(button);
  }
  return grid;
}