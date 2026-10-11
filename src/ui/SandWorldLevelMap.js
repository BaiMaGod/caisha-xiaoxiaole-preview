/**
 * Sand-world level picker. Scenery and pearl node artwork never bake in game state.
 * Labels, locks, navigation and stars are derived from the current saved progress.
 */
const STYLE_ID = 'caisha-sandworld-level-map-v1';
const POSITIONS = [
  [50,1.0],[22,18.0],[78,18.0],
  [17.5,35.0],[50,35.0],[82.5,35.0],
  [30,52.0],[70,52.0],
  [18,65.5],[50,65.5],[82,65.5],
  [50,79.0]
];
const COLORS = ['pink','amber','purple','blue','mint','pink','purple','orange','blue','pink','mint','purple'];
const routes = `M50 9 Q31 14 22 24 Q50 30 78 24 Q88 29 18 40 Q33 45 50 41 Q67 37 82 41 Q78 50 30 57 Q50 63 70 57 Q68 67 18 74 Q33 78 50 75 Q69 71 82 75 Q87 83 50 90`;
const rootClass = 'sandworld-v1';

export function ensureSandWorldLevelMap() {
  if (document.getElementById(STYLE_ID)) return;
  const base = import.meta.env?.BASE_URL || './';
  const a = file => `url("${base}images/sandmap-v2/${file}")`;
  const scene = `${base}images/mode-hd/background.webp`;
  const css = `
  .caisha-mode-menu.is-level.${rootClass} {
    background: url("${scene}") center center / cover no-repeat !important;
    padding:max(6px,env(safe-area-inset-top)) 8px max(7px,env(safe-area-inset-bottom)) !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-mode-menu__card {
    display:flex !important;flex-direction:column !important;justify-content:flex-start !important;
    width:min(100%,428px) !important;padding:0 4px 10px !important;
    height:100% !important;max-height:100% !important;min-height:0 !important;
    overflow-y:auto !important;overflow-x:hidden !important;scrollbar-width:none;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-mode-menu__title {
    flex:none !important;align-self:center !important;width:min(94%,360px) !important;
    max-height:none !important;aspect-ratio:2.95 !important;margin:1px auto 4px !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-mode-menu__items {
    position:relative !important;display:block !important;flex:0 0 auto !important;
    box-sizing:border-box;width:100% !important;height:clamp(510px,69svh,690px) !important;
    min-height:510px !important;max-height:none !important;aspect-ratio:auto !important;
    padding:0 !important;margin:0 auto !important;
    overflow:hidden !important;border:3px solid #fff8d5 !important;border-radius:29px !important;
    background:
      linear-gradient(160deg,#fff4e823,#ffedf113),
      url("${scene}") center 58% / cover no-repeat !important;
    box-shadow:inset 0 0 0 2px #edb974c9,inset 0 5px 8px #fff8,0 6px 0 #bc9065a0,0 10px 18px #7d63884d !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-mode-menu__items::before {
    content:"";position:absolute;pointer-events:none;inset:0;
    background:linear-gradient(180deg,#fff8ec40 0%,transparent 30%,#fff8f10d 70%,#fff5cb40 100%);
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__route {
    pointer-events:none;position:absolute;inset:0;width:100%;height:100%;z-index:1;
    overflow:visible;filter:drop-shadow(0 2px 3px #f8c88baf);
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-mode-menu__levels {
    box-sizing:border-box !important;position:absolute !important;inset:0 !important;
    display:block !important;width:100% !important;height:100% !important;
    padding:0 !important;margin:0 !important;min-height:0 !important;
    background:transparent !important;z-index:2;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-mode-menu__levels .caisha-sandworld__node {
    --node-width:clamp(83px,27%,111px);
    box-sizing:border-box !important;display:block !important;position:absolute !important;
    width:var(--node-width) !important;height:auto !important;
    min-width:0 !important;min-height:0 !important;max-width:none !important;
    aspect-ratio:5/6 !important;transform:translateX(-50%) !important;
    border:none !important;border-radius:0 !important;
    background:transparent !important;box-shadow:none !important;outline-offset:2px;
    padding:0 !important;margin:0 !important;overflow:visible !important;
    cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
    opacity:1 !important;filter:none !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__node::before,
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__node::after {
    content:none !important;display:none !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__art {
    position:absolute;display:block;inset:0;z-index:0;width:100%;height:100%;
    object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none;
    transition:transform .15s ease,filter .15s ease;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__number {
    position:absolute;display:block;z-index:3;top:22%;left:0;right:0;
    font:1000 clamp(24px,6.4vw,32px)/1 ui-rounded,system-ui,sans-serif !important;
    color:white !important;-webkit-text-fill-color:white !important;
    -webkit-text-stroke:1px #9978b5;text-align:center;
    text-shadow:0 2px 1px #76528c,0 3px 4px #5337799c !important;
    pointer-events:none;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__name {
    position:absolute;z-index:3;display:block;top:77.4%;left:13%;width:74%;
    margin:0;padding:0;line-height:1.2;
    background:transparent !important;color:#8a4b32 !important;
    -webkit-text-fill-color:#8a4b32 !important;
    font:900 clamp(9px,2.6vw,12px)/1.2 ui-rounded,system-ui,sans-serif !important;
    text-shadow:0 1px white !important;
    white-space:nowrap;overflow:visible;text-align:center;pointer-events:none;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__stars {
    position:absolute;z-index:4;top:63.5%;left:6%;width:88%;height:16%;
    display:flex;align-items:center;justify-content:center;gap:2px;
    padding:0 !important;margin:0 !important;min-height:0 !important;
    background:transparent !important;color:#ffe381 !important;
    font-size:clamp(12px,3.5vw,17px) !important;line-height:1 !important;
    text-shadow:0 1px 1px #ad732c,0 0 3px #fff0a9 !important;pointer-events:none;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__stars .is-empty {
    color:#f7f2fa !important;-webkit-text-stroke:1px #a69aaf;
    text-shadow:0 1px 1px #918ba066 !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__lock {
    display:grid;position:absolute;z-index:4;top:35%;right:8%;
    width:31%;aspect-ratio:1;place-items:center;
    font-size:clamp(17px,5vw,25px);line-height:1;
    filter:drop-shadow(0 2px 2px #795a7777);pointer-events:none;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__node:disabled {
    cursor:not-allowed !important;opacity:1 !important;
    background:none !important;filter:none !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__node:disabled .caisha-sandworld__art {
    filter:saturate(.68) brightness(.93) !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__node:disabled .caisha-sandworld__number {
    color:#f5f3ff !important;-webkit-text-fill-color:#f5f3ff !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__node:disabled .caisha-sandworld__name {
    color:#96818d !important;-webkit-text-fill-color:#96818d !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__node.is-current {
    outline:none !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__node.is-current .caisha-sandworld__art {
    filter:drop-shadow(0 0 7px #fff4b9) !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__node:active:not(:disabled) .caisha-sandworld__art {
    transform:scale(.95);
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__node:focus-visible {
    outline:3px solid #6b47ca !important;border-radius:50% !important;
  }
  .caisha-mode-menu.is-level.${rootClass} .caisha-mode-menu__back {
    flex:none !important;width:min(85%,320px) !important;margin:5px auto 4px !important;
    aspect-ratio:3.08 !important;min-height:0 !important;
  }
  @media(max-width:350px){
    .caisha-mode-menu.is-level.${rootClass} .caisha-mode-menu__levels .caisha-sandworld__node {--node-width:29%;}
    .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__name {font-size:9px !important;}
  }
  @media(max-height:690px){
    .caisha-mode-menu.is-level.${rootClass} .caisha-mode-menu__title {max-height:89px !important;}
    .caisha-mode-menu.is-level.${rootClass} .caisha-mode-menu__items {min-height:490px !important;height:490px !important;}
  }
  @media(prefers-reduced-motion:reduce){
    .caisha-mode-menu.is-level.${rootClass} .caisha-sandworld__art {transition:none;}
  }
  `;
  const style=document.createElement('style');style.id=STYLE_ID;
  style.textContent=css;document.head.appendChild(style);
}

export function renderSandWorldMap({ levelNames, unlockedLevel, getStars, onSelect }) {
  const map=document.createElement('div');
  map.className='caisha-sandworld-map';
  map.setAttribute('aria-label','12关彩沙地图');

  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.classList.add('caisha-sandworld__route');
  svg.setAttribute('viewBox','0 0 100 100');
  svg.setAttribute('preserveAspectRatio','none');
  svg.setAttribute('aria-hidden','true');
  const addPath=(d,stroke,width,dash='',opacity='1')=>{
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',routes);path.setAttribute('fill','none');
    path.setAttribute('stroke',stroke);path.setAttribute('stroke-width',width);
    path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');
    if(dash)path.setAttribute('stroke-dasharray',dash);
    path.setAttribute('opacity',opacity);svg.append(path);
  };
  addPath(routes,'#cf8ac7','3.5','', '.43');
  addPath(routes,'#fff6dd','2.5','', '.95');
  addPath(routes,'#f5c78c','0.60','0.13 1.55','.9');
  map.append(svg);

  const wrapper=document.createElement('div');
  wrapper.className='caisha-mode-menu__levels';
  const base=import.meta.env?.BASE_URL || './';
  for(let i=0;i<POSITIONS.length;i++){
    const n=i+1,locked=n>unlockedLevel;
    const stars=locked?0:Math.max(0,Math.min(3,Number(getStars(n))||0));
    const button=document.createElement('button');
    button.type='button';button.className='caisha-sandworld__node';
    button.dataset.level=String(n);button.disabled=locked;
    button.classList.toggle('is-current',n===unlockedLevel);
    button.style.left=POSITIONS[i][0]+'%';button.style.top=POSITIONS[i][1]+'%';
    button.setAttribute('aria-label',`第${n}关 ${levelNames[i]}${locked?'，未解锁':`，${stars}星`}`);
    const art=document.createElement('img');
    art.className='caisha-sandworld__art';
    art.src=base+'images/sandmap-v2/node-'+COLORS[i]+'.webp';
    art.alt='';art.draggable=false;art.decoding='async';
    const number=document.createElement('span');number.className='caisha-sandworld__number';number.textContent=String(n);
    const name=document.createElement('span');name.className='caisha-sandworld__name';name.textContent=levelNames[i];
    const rating=document.createElement('span');rating.className='caisha-sandworld__stars';rating.setAttribute('aria-hidden','true');
    for(let j=0;j<3;j++){
      const s=document.createElement('span');const filled=j<stars;s.className=filled?'is-filled':'is-empty';
      s.textContent=filled?'★':'☆';rating.append(s);
    }
    button.append(art,number,rating,name);
    if(locked){
      const lock=document.createElement('span');lock.className='caisha-sandworld__lock';lock.textContent='🔒';
      lock.setAttribute('aria-hidden','true');button.append(lock);
    }
    button.addEventListener('click',()=>onSelect(n));
    wrapper.append(button);
  }
  map.append(wrapper);
  return map;
}