/**
 * Unified, low-saturation sand-paper UI for mode selection and level selection.
 * The drawings are intentionally decorative: completion, stars and locks come
 * exclusively from the player's progress, not from a baked screenshot.
 */
const ID = 'caisha-soft-sand-screens-v2';
const SVG_NS = 'http://www.w3.org/2000/svg';

export function ensureSoftSandScreens() {
  if (document.getElementById(ID)) return;
  const style = document.createElement('style');
  style.id = ID;
  style.textContent = `
    .caisha-mode-menu.soft-sand-v2 {
      display:none;
      position:absolute;inset:0;z-index:30;
      padding:0 !important;
      overflow:hidden !important;
      background:radial-gradient(ellipse at 50% 20%,#fffefa 0%,#fffaf0 48%,#fef5e6 100%) !important;
      -webkit-backdrop-filter:none !important;backdrop-filter:none !important;
      color:#805d49;font-family:ui-rounded,"Microsoft YaHei",system-ui,sans-serif;
      touch-action:pan-y;
    }
    .caisha-mode-menu.soft-sand-v2.is-open {display:flex !important;}
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__card {
      position:relative !important;z-index:2;box-sizing:border-box;
      display:flex !important;flex-direction:column !important;align-items:stretch !important;
      justify-content:flex-start !important;
      width:min(100%,430px) !important;height:100% !important;max-height:none !important;
      min-height:0 !important;margin:0 auto !important;
      padding:max(16px,env(safe-area-inset-top)) 17px max(18px,env(safe-area-inset-bottom)) !important;
      border:0 !important;border-radius:0 !important;
      background:transparent !important;box-shadow:none !important;
      overflow-x:hidden !important;overflow-y:auto !important;
      scrollbar-width:none;overscroll-behavior:contain;animation:none !important;
    }
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__card::-webkit-scrollbar {display:none;}
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__card::before {display:none !important;}
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__illustrated-head,
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__brand,
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__head-icon {display:none !important;}
    .caisha-mode-menu.soft-sand-v2 .soft-sand__topbar {
      position:relative;flex:0 0 auto;min-height:53px;
      display:flex;align-items:center;justify-content:center;margin-bottom:21px;
    }
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__back {
      position:absolute !important;left:0;top:3px;z-index:4;display:grid !important;
      place-items:center;width:46px !important;height:46px !important;min-height:46px !important;
      max-height:none !important;aspect-ratio:1 !important;margin:0 !important;
      padding:0 !important;border:1.5px solid #eee2d4 !important;border-radius:50% !important;
      background:#fffcf6 !important;box-shadow:0 4px 13px #70533814 !important;
      font-size:0 !important;line-height:1 !important;
      color:transparent !important;-webkit-text-fill-color:transparent !important;
      text-shadow:none !important;cursor:pointer;
    }
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__back::after {
      content:"";display:block;width:12px;height:12px;
      border-left:4px solid #846753;border-bottom:4px solid #846753;
      transform:translateX(3px) rotate(45deg);border-radius:2px;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__record {
      box-sizing:border-box;max-width:calc(100% - 112px);min-height:45px;
      display:flex;align-items:center;gap:8px;
      padding:7px 16px;border:1px solid #f0e5d7;border-radius:999px;
      background:#fffdfa;box-shadow:0 4px 17px #967c5c16;
      font-size:13px;font-weight:850;color:#765946;white-space:nowrap;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__record strong {
      color:#bd765b;font-size:18px;letter-spacing:.02em;font-variant-numeric:tabular-nums;
    }
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__title {
      display:block !important;position:relative !important;align-self:center !important;
      box-sizing:border-box;flex:0 0 auto;width:auto !important;height:auto !important;
      max-height:none !important;aspect-ratio:auto !important;
      padding:0 9px 12px !important;margin:0 auto 6px !important;
      border:0 !important;border-radius:0 !important;
      background:linear-gradient(100deg,#e4a377,#dc897f 35%,#8fc9ac 60%,#91bbd7 85%,#b9a4cc) !important;
      background-clip:text !important;-webkit-background-clip:text !important;
      box-shadow:none !important;
      color:transparent !important;-webkit-text-fill-color:transparent !important;
      text-shadow:none !important;
      font:950 clamp(26px,7.4vw,37px)/1.35 ui-rounded,"Microsoft YaHei",system-ui,sans-serif !important;
      letter-spacing:.055em;white-space:nowrap;opacity:1 !important;
    }
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__title::after {
      content:"";position:absolute;left:12%;right:12%;bottom:1px;height:3px;
      border-radius:100%;background:repeating-linear-gradient(90deg,#f4d5c8 0 18px,transparent 18px 31px);
    }
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__subtitle {
      display:block !important;position:static !important;width:auto !important;height:auto !important;
      overflow:visible !important;opacity:1 !important;
      text-align:center;padding:0 !important;margin:0 auto 19px !important;
      color:#aa907b !important;font:700 12px/1.5 system-ui,sans-serif !important;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__subtitle{display:none !important;}
    .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__items {
      box-sizing:border-box !important;position:relative !important;
      display:flex !important;flex-direction:column !important;align-items:stretch !important;
      justify-content:flex-start !important;
      flex:0 0 auto !important;width:100% !important;height:auto !important;
      min-height:0 !important;max-height:none !important;aspect-ratio:auto !important;
      padding:0 !important;margin:12px auto 0 !important;
      overflow:visible !important;border:0 !important;border-radius:0 !important;
      background:transparent !important;box-shadow:none !important;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__items {
      gap:clamp(12px,2.6svh,19px);padding-bottom:23vh !important;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__item {
      position:relative !important;display:flex !important;align-items:center !important;
      box-sizing:border-box;flex:0 0 auto !important;
      width:100% !important;height:clamp(115px,19svh,162px) !important;
      min-height:115px !important;max-height:none !important;aspect-ratio:auto !important;
      padding:12px 32px 13px 10px !important;margin:0 !important;
      border:1.5px solid #f0e7d9 !important;border-radius:28px !important;
      background:linear-gradient(155deg,#fffdf8f5,#fff9eef2) !important;
      box-shadow:0 8px 22px #82644b14,inset 0 1px #fff !important;
      overflow:hidden !important;transform:none;filter:none;cursor:pointer;
      -webkit-tap-highlight-color:transparent;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__item::before {
      content:"";position:absolute;display:block !important;inset:auto 0 0;height:29%;
      background:
        radial-gradient(ellipse 72% 150% at 2% 140%,#f5d7c9 0 61%,transparent 62%),
        radial-gradient(ellipse 90% 160% at 55% 155%,#c8e4d6 0 64%,transparent 65%),
        radial-gradient(ellipse 75% 145% at 105% 148%,#c9deeb 0 60%,transparent 61%);
      opacity:.85;pointer-events:none;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__item::after {
      content:"›";position:absolute;z-index:3;right:12px;top:50%;bottom:auto;
      display:grid !important;place-items:center;
      width:30px;height:30px;border:1px solid #e8dccd;border-radius:50%;
      background:#fff9ef;color:#8e725b;
      font:800 26px/1 system-ui,sans-serif;transform:translateY(-50%);
      text-shadow:none;box-shadow:none;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__mode-icon {display:none !important;}
    .caisha-mode-menu.soft-sand-v2.is-main .soft-sand__mode-art {
      position:relative;z-index:1;display:grid;place-items:center;flex:0 0 38%;
      height:93%;max-width:38%;min-width:0;
      border:0;border-radius:18px;pointer-events:none;isolation:isolate;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .soft-sand__mode-art::before {
      content:"";position:absolute;inset:40% 8% 12%;z-index:-1;
      background:linear-gradient(145deg,#f3ddc6,#dae7d6 50%,#cadae7);
      border-radius:58% 43% 25% 22% / 73% 65% 15% 20%;
      transform:rotate(-7deg);opacity:.72;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .soft-sand__mode-art svg {
      width:100%;height:100%;max-height:120px;overflow:visible;
      filter:drop-shadow(0 2px 2px #876d5519);pointer-events:none;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__copy {
      position:relative !important;display:block !important;z-index:2;
      flex:1 1 auto !important;left:auto !important;top:auto !important;right:auto !important;
      width:auto !important;height:auto !important;max-width:none !important;
      min-width:0;text-align:left !important;opacity:1 !important;overflow:visible !important;
      pointer-events:none;transform:none !important;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__item strong {
      display:block;margin:0 0 7px;
      color:#7d523e !important;-webkit-text-fill-color:#7d523e !important;
      -webkit-text-stroke:0 !important;text-shadow:none !important;
      font:900 clamp(19px,5.6vw,27px)/1.2 ui-rounded,system-ui,sans-serif !important;
      letter-spacing:.01em;white-space:nowrap;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__item small {
      display:block;max-width:185px;white-space:normal;
      color:#a18b79 !important;font:650 clamp(10px,2.75vw,12px)/1.48 system-ui,sans-serif !important;
      text-shadow:none;letter-spacing:0;
    }
    .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__item:active {transform:scale(.984) !important;}
    .caisha-mode-menu.soft-sand-v2.is-level .caisha-mode-menu__items {
      margin-top:6px !important;padding-bottom:21vh !important;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__grid {
      position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
      gap:12px 10px;width:100%;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__level {
      position:relative;display:flex !important;flex-direction:column;align-items:center;
      width:100%;min-width:0;min-height:0;height:auto;aspect-ratio:.87;
      padding:8px 5px 7px;margin:0;
      border:1.5px solid #fff9f2 !important;border-radius:19px !important;
      color:#795845 !important;
      background:linear-gradient(153deg,#fffdf7,#fff7e9) !important;
      box-shadow:0 5px 16px #876c501b,inset 0 0 0 1px #e8ddcd !important;
      overflow:hidden;cursor:pointer;-webkit-tap-highlight-color:transparent;
      transform:none !important;filter:none !important;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__level.is-current {
      border-color:#d7a895 !important;box-shadow:0 0 0 2px #ebc0ad,0 6px 15px #8e5b4320 !important;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__level:disabled {
      opacity:.75 !important;cursor:not-allowed;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__level-number {
      position:relative;z-index:2;font:900 clamp(23px,6.5vw,34px)/1.1 ui-rounded,system-ui,sans-serif;
      color:#886651;margin:0 0 3px;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__thumb {
      display:block;position:relative;z-index:1;flex:1 1 auto;
      width:100%;height:50px;max-height:76px;min-height:0;overflow:hidden;
      opacity:.93;pointer-events:none;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__thumb svg {
      display:block;width:100%;height:100%;
      filter:drop-shadow(0 1px 1px #96755811);
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__thumb::after {
      content:"";position:absolute;inset:0;pointer-events:none;
      background-image:
        radial-gradient(circle,#fff9efb3 .75px,transparent 1.2px),
        radial-gradient(circle,#8e796014 .7px,transparent 1.4px);
      background-size:5px 6px,7px 9px;background-position:2px 3px,0 0;
      opacity:.86;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__stars {
      position:relative;z-index:2;display:flex;justify-content:center;gap:3px;
      flex:0 0 auto;margin-top:2px;font-size:clamp(12px,3.5vw,17px);line-height:1;
      color:#e3a65d;text-shadow:0 1px #fff8eb;pointer-events:none;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__stars .is-empty{color:#d8ccc0;}
    .caisha-mode-menu.soft-sand-v2 .soft-sand__lock {
      position:absolute;z-index:3;left:50%;top:50%;
      transform:translate(-50%,-20%);font-size:clamp(20px,5vw,26px);
      color:#9b8571;filter:saturate(.3);pointer-events:none;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__level:disabled .soft-sand__thumb {
      opacity:.46;filter:grayscale(.3);
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__level:disabled .soft-sand__stars {opacity:.55;}
    .caisha-mode-menu.soft-sand-v2 button:focus-visible {
      outline:3px solid #ad9075 !important;outline-offset:3px !important;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__scenery {
      pointer-events:none;position:absolute;left:0;right:0;bottom:0;
      width:100%;height:clamp(120px,23svh,210px);z-index:1;overflow:hidden;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__scenery span {
      position:absolute;display:block;inset:0;opacity:.7;
      border-radius:48% 56% 0 0 / 72% 85% 0 0;
      background-image:
        radial-gradient(circle,#ffffff7d .6px,transparent 1px);
      background-size:7px 7px;
    }
    .caisha-mode-menu.soft-sand-v2.is-level .soft-sand__scenery {
      opacity:.34;height:clamp(80px,15svh,130px);
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__scenery span:nth-child(1) {
      background-color:#bfdcc8;transform:translate(-10%,6%) scale(1.25);
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__scenery span:nth-child(2) {
      background-color:#bbd9e1;transform:translate(18%,33%) scale(1.25);opacity:.7;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__scenery span:nth-child(3) {
      background-color:#d0bfe0;transform:translate(-24%,50%) scale(1.35);opacity:.64;
    }
    .caisha-mode-menu.soft-sand-v2 .soft-sand__scenery span:nth-child(4) {
      background-color:#f0d5b9;transform:translate(29%,72%) scale(1.5);opacity:.78;
    }
    @media(max-height:740px) {
      .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__card {padding-top:max(8px,env(safe-area-inset-top)) !important;}
      .caisha-mode-menu.soft-sand-v2 .soft-sand__topbar{margin-bottom:12px;}
      .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__item{height:clamp(110px,18svh,135px) !important;}
      .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__items{margin-top:5px !important;}
      .caisha-mode-menu.soft-sand-v2 .soft-sand__grid{gap:9px 7px;}
      .caisha-mode-menu.soft-sand-v2 .soft-sand__level{border-radius:15px !important;}
    }
    @media(max-width:350px) {
      .caisha-mode-menu.soft-sand-v2 .caisha-mode-menu__card{padding-left:10px !important;padding-right:10px !important;}
      .caisha-mode-menu.soft-sand-v2 .soft-sand__record{font-size:11px;padding:7px 11px;}
      .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__item{padding-right:29px !important;}
      .caisha-mode-menu.soft-sand-v2.is-main .caisha-mode-menu__item strong{font-size:18px !important;}
      .caisha-mode-menu.soft-sand-v2 .soft-sand__grid{gap:8px 6px;}
    }
    @media(prefers-reduced-motion:reduce) {
      .caisha-mode-menu.soft-sand-v2 *{animation:none !important;transition:none !important;}
    }
  `;
  document.head.appendChild(style);
}


export function makeModeIllustration(mode) {
  const svg=document.createElementNS(SVG_NS,'svg');
  svg.setAttribute('viewBox','0 0 150 110');
  svg.setAttribute('aria-hidden','true');
  const defs=`<defs>
    <linearGradient id="soft-rainbow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e7ae83"/><stop offset=".3" stop-color="#e5a8b1"/>
      <stop offset=".56" stop-color="#a3d4c1"/><stop offset=".82" stop-color="#a0c9df"/>
      <stop offset="1" stop-color="#cbb8e2"/>
    </linearGradient>
  </defs>`;
  const bodies={
    endless:`<text x="75" y="83" text-anchor="middle"
      font-family="ui-rounded,system-ui,sans-serif" font-size="115"
      font-weight="900" fill="url(#soft-rainbow)">∞</text>`,
    sandArt:`<path d="M73 15 C42 7 23 29 22 56 C20 81 43 98 69 94
      C79 93 83 84 79 77 C75 68 81 64 91 64 C108 63 126 56
      123 40 C120 22 96 15 73 15Z"
      fill="#ebd0ae" stroke="#ddbe9c" stroke-width="2"/>
      <circle cx="51" cy="35" r="10" fill="#e8b1ad"/>
      <circle cx="80" cy="29" r="10" fill="#e9ca84"/>
      <circle cx="105" cy="44" r="10" fill="#9fcdb7"/>
      <circle cx="54" cy="65" r="10" fill="#9bc7df"/>
      <circle cx="78" cy="56" r="10" fill="#c6b2dc"/>
      <path d="M95 91 L127 46" stroke="#b58765" stroke-linecap="round" stroke-width="8"/>
      <path d="M127 45 L134 30 L120 38Z" fill="#8dbbcc"/>`,
    level:`<path d="M5 90 Q31 61 51 68 Q72 33 97 61 Q119 61 145 87Z"
      fill="#a5d6c6"/><path d="M8 94 Q39 72 64 81 Q88 53 111 71
      Q129 78 145 91Z" fill="#e7c995"/>
      <path d="M68 53 L68 20" stroke="#ad8974" stroke-width="4" stroke-linecap="round"/>
      <path d="M70 21 Q91 18 96 30 Q79 35 70 33Z" fill="#e4a8a4"/>
      <circle cx="38" cy="35" r="8" fill="#efd9a7" opacity=".75"/>`
  };
  const specks=Array.from({length:28},(_,i)=>{
    const x=8+((i*41+17)%131),y=12+((i*19+31)%85);
    const colors=['#eab9ac','#d8c397','#add6c6','#a3cada','#cab8d5'];
    return `<circle cx="${x}" cy="${y}" r="${i%5===0?1.7:.9}" fill="${colors[i%5]}" opacity=".76"/>`;
  }).join('');
  svg.innerHTML=defs+bodies[mode]+specks;
  return svg;
}

function sandThumb(n) {
  // Deterministic, lightweight, illustrative shapes—not a screenshot or a
  // promise about the exact current board. Gameplay is untouched.
  const colors=['#eeb7af','#efd39a','#aad9b7','#9bd3dd','#a6bee0','#c7b5dc','#f4c8ab'];
  const svg=document.createElementNS(SVG_NS,'svg');
  svg.setAttribute('viewBox','0 0 140 84');
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  svg.setAttribute('aria-hidden','true');
  const paths = [
    'M0 83 L0 65 Q17 38 35 55 Q55 16 79 50 Q111 33 140 63 L140 84Z',
    'M0 84 L0 47 Q33 41 55 65 Q98 22 140 49 L140 84Z',
    'M0 84 L0 71 Q26 26 54 56 Q88 8 140 64 L140 84Z',
    'M0 84 L0 51 Q34 19 73 53 Q111 80 140 43 L140 84Z',
    'M0 84 L0 72 Q41 36 67 69 Q106 26 140 57 L140 84Z'
  ];
  for(let j=0;j<3;j++){
    const p=document.createElementNS(SVG_NS,'path');
    p.setAttribute('d',paths[(n+j*2)%paths.length]);
    p.setAttribute('fill',colors[(n+j*2)%colors.length]);
    p.setAttribute('transform',`translate(0 ${j*10})`);
    svg.append(p);
  }
  for(let i=0;i<18;i++){
    const dot=document.createElementNS(SVG_NS,'circle');
    const x=(n*29+i*43)%140,y=13+((n*7+i*17)%60);
    dot.setAttribute('cx',String(x));dot.setAttribute('cy',String(y));
    dot.setAttribute('r',i%5===0?'1.35':'.75');
    dot.setAttribute('fill',colors[(n+i)%colors.length]);
    dot.setAttribute('opacity','.76');svg.append(dot);
  }
  return svg;
}

export function renderSoftSandLevels({levelNames,unlockedLevel,getStars,onSelect}) {
  const grid=document.createElement('div');
  grid.className='soft-sand__grid';
  grid.setAttribute('aria-label','关卡列表');
  for(let i=0;i<levelNames.length;i++){
    const n=i+1;
    const locked=n>unlockedLevel;
    const stars=locked?0:Math.max(0,Math.min(3,Number(getStars(n))||0));
    const button=document.createElement('button');
    button.type='button';
    button.className='soft-sand__level';
    button.dataset.level=String(n);
    button.disabled=locked;
    if(n===unlockedLevel && !locked)button.classList.add('is-current');
    button.setAttribute('aria-label',`第${n}关 ${levelNames[i]}${locked?'，未解锁':`，${stars}星`}`);
    const number=document.createElement('span');
    number.className='soft-sand__level-number';
    number.textContent=String(n);
    const art=document.createElement('span');
    art.className='soft-sand__thumb';art.append(sandThumb(n));
    art.setAttribute('aria-hidden','true');
    const rating=document.createElement('span');
    rating.className='soft-sand__stars';rating.setAttribute('aria-hidden','true');
    for(let j=0;j<3;j++){
      const star=document.createElement('span');
      star.className=j<stars?'is-filled':'is-empty';
      star.textContent='★';rating.append(star);
    }
    button.append(number,art,rating);
    if(locked){
      const lock=document.createElement('span');
      lock.className='soft-sand__lock';lock.textContent='🔒';
      lock.setAttribute('aria-hidden','true');button.append(lock);
    }
    button.addEventListener('click',()=>{if(!locked)onSelect(n);});
    grid.append(button);
  }
  return grid;
}
