import { decodeArtwork } from '../modes/ModeLogic.js';
import { getParticleRgb, SETTLED_PARTICLE_INSET, SETTLED_PARTICLE_SIZE } from '../colors.js';
import { ensureRainbowSandTheme } from './RainbowSandTheme.js';

const style = 'position:absolute;inset:0;z-index:51;background:rgba(40,28,33,.69);padding:max(28px,env(safe-area-inset-top)) 20px;overflow:auto;font:800 14px system-ui,sans-serif;color:#664832;';
function button(text, action) {
  const b = document.createElement('button');
  b.textContent = text;
  b.type = 'button';
  b.className = 'caisha-mode-panel__button';
  b.style.cssText='border:0;background:linear-gradient(120deg,#ffad7d,#f17f61);color:white;border-radius:15px;padding:13px 17px;margin:5px;font:900 15px system-ui;';
  b.addEventListener('click', action); return b;
}
export class ModePanels {
  constructor(parent) {
    ensureRainbowSandTheme();
    this.root = document.createElement('div');
    this.root.style.cssText = style + 'display:none;align-items:center;justify-content:center;';
    this.root.classList.add('caisha-mode-panel');
    this.card = document.createElement('div');
    this.card.classList.add('caisha-mode-panel__card');
    this.card.style.cssText = 'width:min(100%,380px);margin:auto;padding:22px 16px;text-align:center;background:#fff9ec;border-radius:24px;box-shadow:0 16px 44px #35232380;';
    this.root.appendChild(this.card);
    parent.appendChild(this.root);
  }
  hide() { this.root.style.display='none'; }
  showWin({ level, stars, drops, next, retry, home }) {
    this.card.replaceChildren();
    const title = document.createElement('h2');
    title.textContent = '🎉 第 '+level+' 关挑战成功！';
    this.card.append(title);
    const info = document.createElement('p');
    info.textContent = '⭐'.repeat(stars) + ' · 使用 '+drops+' 个沙块 · 全部清空';
    this.card.append(info);
    if (next) this.card.appendChild(button('下一关', () => { this.hide(); next(); }));
    this.card.appendChild(button('再玩一次', () => { this.hide(); retry(); }));
    this.card.appendChild(button('返回首页', () => { this.hide(); home(); }));
    this.root.style.display='flex';
  }
  showLose({ level, remaining, retry, home }) {
    this.card.replaceChildren();
    const title = document.createElement('h2');
    title.textContent = '第 ' + level + ' 关挑战失败';
    title.style.cssText = 'font-size:25px;margin:6px 0 12px;color:#a55342;';
    const info = document.createElement('p');
    info.textContent = '沙堆触碰了失败线 · 尚余 ' +
      Number(remaining).toLocaleString() + ' 粒';
    info.style.cssText = 'font-size:13px;line-height:1.8;color:#96745e;';
    const advice = document.createElement('p');
    advice.textContent = '调整下一块沙子的落点，再试一次吧！';
    advice.style.cssText = 'font-size:12px;color:#9b8874;';
    this.card.append(title, info, advice);
    this.card.appendChild(button('重试本关', () => { this.hide(); retry(); }));
    this.card.appendChild(button('返回首页', () => { this.hide(); home(); }));
    this.root.style.display = 'flex';
  }

  showGallery(artworks, { onClose, onView }) {
    this.card.replaceChildren();
    const title=document.createElement('h2'); title.textContent='🖼 我的沙画';
    this.card.append(title);
    if (!artworks.length) {
      const p=document.createElement('p'); p.textContent='还没有作品。到沙画模式完成一幅吧！';
      this.card.append(p);
    }
    for (const work of artworks.slice(0,10)) {
      try {
        const {cells} = decodeArtwork(work.runs,work.width*work.height);
        const canvas=document.createElement('canvas');
        canvas.width=work.width;canvas.height=work.height;
        canvas.style.cssText='width:82px;height:146px;object-fit:contain;border:5px solid #dfb888;border-radius:5px;background:#fff8ea;';
        const ctx=canvas.getContext('2d');
        for(let i=0;i<cells.length;i++){
          if(!cells[i])continue;
          const x=i%work.width,y=Math.floor(i/work.width);
          const rgb=getParticleRgb(x,y,cells[i]);
          ctx.fillStyle='rgb('+rgb.join(',')+')';
          ctx.fillRect(x+SETTLED_PARTICLE_INSET,y+SETTLED_PARTICLE_INSET,
            SETTLED_PARTICLE_SIZE,SETTLED_PARTICLE_SIZE);
        }
        const item=document.createElement('button');
        item.type='button';
        item.style.cssText='display:flex;align-items:center;gap:16px;width:100%;margin:8px 0;padding:8px;border:1px solid #eedac7;border-radius:16px;background:white;color:#76563d;text-align:left;';
        item.append(canvas,document.createTextNode(new Date(work.date).toLocaleString()+' · 查看作品'));
        item.addEventListener('click',()=>{this.hide();onView?.(canvas,work);});
        this.card.append(item);
      }catch{}
    }
    this.card.appendChild(button('关闭',()=>{this.hide();onClose?.();}));
    this.root.style.display='flex';
  }
}
