/**
 * Picture-asset mode UI. Every image was rendered separately as a game asset.
 * The existing DOM buttons keep all click handlers and keyboard semantics.
 * Level completion, star ratings and locking are always driven by live state.
 */
const ID='caisha-mode-hd-asset-ui-v1';
export function ensureHDModeUI(){
  if(document.getElementById(ID)) return;
  const base=import.meta.env?.BASE_URL || './';
  const a=(name)=>`url("${base}images/mode-hd/${name}.webp")`;
  const style=document.createElement('style');
  style.id=ID;
  style.textContent=`
  .caisha-mode-menu.is-main,.caisha-mode-menu.is-level{
    padding:max(6px,env(safe-area-inset-top)) 6px max(7px,env(safe-area-inset-bottom)) !important;
    background:linear-gradient(180deg,#fff4e511,#fff8ec26),${a('background')} center / cover no-repeat !important;
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__card,
  .caisha-mode-menu.is-level .caisha-mode-menu__card{
    box-sizing:border-box;display:flex; flex-direction:column;
    width:min(100%,420px);height:100%;max-height:100%;min-height:0;
    margin:auto;padding:0 5px 8px;overflow-y:auto;overflow-x:hidden;
    background:transparent !important;box-shadow:none !important;border:0 !important;
    scrollbar-width:none;
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__card::before,
  .caisha-mode-menu.is-level .caisha-mode-menu__card::before{display:none !important;}
  .caisha-mode-menu.is-main .caisha-mode-menu__brand{display:none !important;}
  .caisha-mode-menu.is-main .caisha-mode-menu__illustrated-head{
    display:block !important;flex:0 0 auto;align-self:center;width:100% !important;
    max-width:400px !important;height:auto !important;
    max-height:clamp(87px,17vh,135px) !important;
    margin:clamp(7px,1.3vh,14px) auto 0 !important;
    object-fit:contain;filter:drop-shadow(0 4px 4px #a25a837d);pointer-events:none;
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__title{
    box-sizing:border-box;flex:0 0 auto;align-self:center;
    width:min(66%,260px) !important;height:auto !important;
    aspect-ratio:2.7;max-height:clamp(55px,11vh,78px);
    margin:0 auto clamp(7px,1.3vh,12px) !important;padding:0 !important;
    background:${a('mode-title')} center/contain no-repeat !important;
    box-shadow:none !important;border:0 !important;border-radius:0 !important;
    font-size:0 !important;line-height:0;opacity:1 !important;
    color:transparent !important;-webkit-text-fill-color:transparent !important;
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__head-icon,
  .caisha-mode-menu.is-main .caisha-mode-menu__subtitle,
  .caisha-mode-menu.is-level .caisha-mode-menu__head-icon{display:none !important;}
  .caisha-mode-menu.is-main .caisha-mode-menu__items{
    display:flex;flex-direction:column;justify-content:center;align-items:stretch;
    gap:clamp(6px,1.2vh,12px);flex:1 0 auto;width:100%;margin:0;
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__item{
    box-sizing:border-box;position:relative;display:block;flex:0 0 auto;
    width:100%;height:auto;min-height:0;margin:0 !important;padding:0 !important;
    aspect-ratio:2.10;
    border:0 !important;border-radius:0 !important;outline-offset:1px;
    background-size:contain !important;background-position:center !important;
    background-repeat:no-repeat !important;box-shadow:none !important;
    transition:transform .12s ease,filter .12s ease;
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__item[data-mode="sandArt"]{
    background-image:${a('sand-card')} !important;
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__item[data-mode="level"]{
    background-image:${a('level-card')} !important;
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__item[data-mode="endless"]{
    aspect-ratio:3.18;min-height:0;max-height:none;
    background-image:${a('endless-card')} !important;
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__item::before,
  .caisha-mode-menu.is-main .caisha-mode-menu__item::after{display:none !important;content:none !important;}
  .caisha-mode-menu.is-main .caisha-mode-menu__item .caisha-mode-menu__mode-icon,
  .caisha-mode-menu.is-main .caisha-mode-menu__item .caisha-mode-menu__copy{
    position:absolute !important;width:1px !important;height:1px !important;
    left:0 !important;top:0 !important;overflow:hidden !important;
    opacity:0 !important;pointer-events:none !important;
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__item:active{transform:scale(.967);filter:brightness(1.07);}
  .caisha-mode-menu.is-main .caisha-mode-menu__back,
  .caisha-mode-menu.is-level .caisha-mode-menu__back{
    position:relative;display:block !important;flex:0 0 auto;align-self:center;
    width:min(83%,324px);max-height:none;min-height:0;height:auto;
    aspect-ratio:3.1;margin:clamp(4px,.6vh,7px) auto 3px;padding:0 !important;
    border:0 !important;border-radius:0 !important;box-shadow:none !important;
    background:${a('home-button')} center/contain no-repeat !important;
    font-size:0 !important;line-height:0 !important;
    color:transparent !important;-webkit-text-fill-color:transparent !important;
    text-shadow:none !important;
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__back:active,
  .caisha-mode-menu.is-level .caisha-mode-menu__back:active{transform:scale(.975);}
  .caisha-mode-menu.is-level .caisha-mode-menu__illustrated-head{display:none !important;}
  .caisha-mode-menu.is-level .caisha-mode-menu__card{padding-top:clamp(8px,1.6vh,16px);}
  .caisha-mode-menu.is-level .caisha-mode-menu__title{
    display:block !important;position:relative !important;flex:0 0 auto;
    width:min(94%,360px) !important;height:auto !important;
    aspect-ratio:2.95;margin:0 auto 3px !important;padding:0 !important;
    background:${a('map-title')} center/contain no-repeat !important;
    border:0 !important;border-radius:0 !important;box-shadow:none !important;
    font-size:0 !important;line-height:0 !important;
    color:transparent !important;-webkit-text-fill-color:transparent !important;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__subtitle{
    position:absolute !important;width:1px !important;height:1px !important;
    margin:0 !important;padding:0 !important;opacity:0 !important;overflow:hidden !important;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__items{
    position:relative;flex:1 0 auto;min-height:0;width:100%;padding:0;
    aspect-ratio:1122 / 1402;
    border:0 !important;border-radius:0 !important;box-shadow:none !important;
    background:${a('level-map')} center/100% 100% no-repeat !important;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__levels{
    box-sizing:border-box;position:absolute;inset:0;
    display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
    grid-template-rows:repeat(4,minmax(0,1fr));
    gap:0;padding:11% 4% 6%;margin:0;width:100%;height:100%;min-height:0;
    background:none !important;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__levels button{
    box-sizing:border-box;position:relative;display:flex;
    align-items:center;justify-content:center; flex-direction:column;
    width:98%;height:95%;min-width:0;min-height:0;
    padding:0;margin:auto;
    aspect-ratio:auto;overflow:visible;
    border:0 !important;border-radius:19px !important;
    background:transparent !important;box-shadow:none !important;
    transform:none !important;filter:none !important;
    color:transparent !important;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__levels button:disabled::before{
    content:"";position:absolute;inset:5% 0 0;
    background:rgba(163,160,176,.44);
    backdrop-filter:grayscale(1) brightness(.78);
    -webkit-backdrop-filter:grayscale(1) brightness(.78);
    border:1px solid #ffffffa6;border-radius:17px;
    box-shadow:inset 0 2px 4px #595b6d33,0 2px 9px #63627a3b;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__levels button .caisha-mode-menu__level-number{
    position:relative;display:none;line-height:1.05;font-size:18px !important;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__levels button:disabled .caisha-mode-menu__level-number{
    display:block;margin-top:0;font-size:18px !important;font-weight:950;
    color:#f5f6ff !important;text-shadow:0 2px #514c72 !important;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__level-name{
    position:absolute;z-index:2;left:0;right:0;bottom:20%;max-width:100%;
    display:block;margin:0 auto !important;padding:1px 1px;
    overflow:hidden;white-space:nowrap;text-overflow:ellipsis;
    background:#fff0dbee !important;border-radius:99px;
    color:#804b2e !important;
    font:850 clamp(9px,2.6vw,11px)/1.25 ui-rounded,system-ui,sans-serif !important;
    text-align:center;text-shadow:none !important;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__level-stars{
    position:absolute;z-index:2;bottom:1%;left:0;right:0;
    display:block;min-height:14px;margin:0;padding:2px 1px;
    border-radius:99px;background:#fff2d8f2 !important;
    color:#d38b18 !important;font-size:12px !important;line-height:1 !important;
    text-align:center;text-shadow:0 1px #fff !important;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__levels button:disabled .caisha-mode-menu__level-name{
    color:#88838c !important;background:#e2dfe2ee !important;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__levels button:disabled .caisha-mode-menu__level-stars{
    display:none;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__levels button.is-current{
    outline:2px solid #ffdc80 !important;outline-offset:-2px !important;
  }
  .caisha-mode-menu.is-level .caisha-mode-menu__back{
    width:min(89%,350px);aspect-ratio:3.05;
    background-image:${a('level-back')} !important;
    margin-top:clamp(2px,.6vh,8px);
  }
  .caisha-mode-menu.is-main .caisha-mode-menu__item:focus-visible,
  .caisha-mode-menu.is-level .caisha-mode-menu__levels button:focus-visible,
  .caisha-mode-menu.is-main .caisha-mode-menu__back:focus-visible,
  .caisha-mode-menu.is-level .caisha-mode-menu__back:focus-visible{
    outline:3px solid #5941bb !important;outline-offset:2px;
  }
  @media(max-height:740px){
    .caisha-mode-menu.is-main .caisha-mode-menu__illustrated-head{max-height:13vh !important;}
    .caisha-mode-menu.is-main .caisha-mode-menu__title{max-height:58px;}
    .caisha-mode-menu.is-main .caisha-mode-menu__items{gap:2px;}
    .caisha-mode-menu.is-main .caisha-mode-menu__item{aspect-ratio:2.30;}
    .caisha-mode-menu.is-main .caisha-mode-menu__item[data-mode="endless"]{aspect-ratio:3.6;}
    .caisha-mode-menu.is-main .caisha-mode-menu__back{aspect-ratio:3.5;}
    .caisha-mode-menu.is-level .caisha-mode-menu__title{max-height:95px;}
  }
  @media(max-width:350px){
    .caisha-mode-menu.is-main .caisha-mode-menu__title{width:72% !important;}
    .caisha-mode-menu.is-level .caisha-mode-menu__level-name{font-size:9px !important;}
  }
  @media(prefers-reduced-motion:reduce){
    .caisha-mode-menu.is-main .caisha-mode-menu__item{transition:none !important;}
  }
  `;
  document.head.appendChild(style);
}