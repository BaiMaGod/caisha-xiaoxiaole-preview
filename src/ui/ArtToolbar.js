import { ART_COLORS } from '../modes/ModeLogic.js';
import { ensureArtStudioTheme } from './ArtStudioTheme.js';

const COLOR_HEX = ['#ed6764','#f3a34a','#e8d15c','#65bc75','#5cc7cc','#6590d4','#a17acc'];
export class ArtToolbar {
  constructor(container, { onHome, onTool, onColor, onSize, onUndo, onRedo, onClear } = {}) {
    ensureArtStudioTheme();
    this.root = document.createElement('section');
    this.root.classList.add('caisha-art-studio');
    this.root.setAttribute('aria-label', '沙画创作工具栏');
    this.root.style.cssText = 'display:none;position:absolute;inset:0;z-index:14;pointer-events:none;font:800 12px system-ui,sans-serif;color:#704f3b;';
    const top = document.createElement('div');
    top.classList.add('caisha-art-studio__top');
    top.style.cssText = 'position:absolute;top:max(10px,env(safe-area-inset-top));left:10px;right:10px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;pointer-events:auto;';
    const bottom = document.createElement('div');
    bottom.classList.add('caisha-art-studio__bottom');
    bottom.style.cssText = 'position:absolute;bottom:max(13px,env(safe-area-inset-bottom));left:8px;right:8px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;pointer-events:auto;padding:8px 5px;background:rgba(255,248,236,.9);border-radius:18px;box-shadow:0 5px 20px #865b3930;';
    const button = (parent, text, handler) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.style.cssText = 'min-height:33px;padding:6px 10px;border:1px solid #e7cfb8;background:#fffbf3;color:#734a34;border-radius:12px;font:800 12px system-ui;touch-action:manipulation;cursor:pointer';
      b.addEventListener('click', handler);
      parent.appendChild(b);
      return b;
    };
    button(top, '‹ 首页', onHome);
    let radiusIndex = 1;
    const radii = [1, 2, 4];
    const sizeButton = button(top, '笔刷·中', () => {
      radiusIndex = (radiusIndex + 1) % 3;
      sizeButton.textContent = '笔刷·' + ['细','中','粗'][radiusIndex];
      onSize?.(radii[radiusIndex]);
    });
    const caption = document.createElement('span');
    caption.textContent = '🎨 沙画工坊 · 堆到完成线';
    caption.classList.add('caisha-art-studio__caption');
    caption.style.cssText = 'border-radius:12px;padding:10px;background:rgba(255,255,255,.85)';
    top.appendChild(caption);
    this.toolButtons = [];
    for (const [tool, title] of [['flow','流沙笔'],['fixed','固沙笔'],['shape','形状'],['erase','橡皮擦']]) {
      const b = button(bottom, title, () => { this.setTool(tool); onTool?.(tool); });
      this.toolButtons.push({ tool, button: b });
    }
    const palette = document.createElement('div');
    palette.classList.add('caisha-art-studio__palette');
    palette.style.cssText = 'display:flex;gap:7px;width:100%;justify-content:center;padding:4px 0;';
    this.colorButtons = [];
    for (let i = 0; i < ART_COLORS.length; i++) {
      const color = ART_COLORS[i];
      const b = button(palette, '●', () => { this.setColor(color); onColor?.(color); });
      b.setAttribute('aria-label', ['红','橙','黄','绿','青','蓝','紫'][i]);
      b.style.color = COLOR_HEX[i];
      b.style.fontSize = '21px';
      b.style.padding = '0 6px';
      this.colorButtons.push({ color, button: b });
    }
    bottom.appendChild(palette);
    button(bottom, '↶ 撤销', onUndo);
    button(bottom, '↷ 重做', onRedo);
    button(bottom, '清空', () => { if (confirm('确定清空当前沙画吗？')) onClear?.(); });
    this.root.append(top, bottom);
    container.appendChild(this.root);
    this.setTool('flow');
    this.setColor(1);
  }
  setTool(tool) {
    for (const item of this.toolButtons) {
      item.button.classList.toggle('is-active',item.tool===tool);
      item.button.style.background = item.tool === tool ? '#ffe4c3' : '#fffbf3';
      item.button.style.borderColor = item.tool === tool ? '#e99c64' : '#e7cfb8';
    }
  }
  setColor(color) {
    for (const item of this.colorButtons) {
      item.button.classList.toggle('is-active',item.color===color);
      item.button.style.outline = item.color === color ? '2px solid #b77b50' : 'none';
    }
  }
  show(visible) { this.root.style.display = visible ? 'block' : 'none'; }
}
