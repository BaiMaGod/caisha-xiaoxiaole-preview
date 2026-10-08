const SETTINGS_ASSET_DIR = 'images/settings-ui/';
const SETTINGS_STYLE_ID = 'caisha-settings-design-v2';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function assetUrl(name) {
  const base = import.meta.env?.BASE_URL || '/';
  return base + SETTINGS_ASSET_DIR + name;
}

function createAssetImage(name, alt = '') {
  const image = document.createElement('img');
  image.src = assetUrl(name);
  image.alt = alt;
  image.draggable = false;
  image.decoding = 'async';
  // Keep the accessible CSS/emoji fallback when an asset fails to decode or load.
  image.addEventListener('error', () => { image.style.display = 'none'; });
  return image;
}

function node(tag, className, text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function ensureStyles() {
  if (document.getElementById(SETTINGS_STYLE_ID)) return;
  const style = node('style');
  style.id = SETTINGS_STYLE_ID;
  style.textContent = "\n.caisha-settings-gear {\n  position: absolute; top: max(12px, env(safe-area-inset-top));\n  right: max(12px, env(safe-area-inset-right)); z-index: 45;\n  display: grid; place-items: center;\n  width: 52px; height: 54px; padding: 0; border: none;\n  background: transparent; cursor: pointer; touch-action: manipulation;\n  -webkit-tap-highlight-color: transparent; font-size: 32px;\n}\n.caisha-settings-gear img { position: absolute; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }\n.caisha-settings-overlay {\n  position: absolute; inset: 0; z-index: 70;\n  display: none; align-items: center; justify-content: center;\n  box-sizing: border-box; padding: max(18px, env(safe-area-inset-top)) 16px max(18px, env(safe-area-inset-bottom));\n  background: rgba(34,26,51,.57);\n  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);\n  touch-action: none;\n}\n.caisha-settings-overlay.is-open { display: flex; }\n.caisha-settings-panel {\n  position: relative; width: min(100%, 354px);\n  max-height: 94%; overflow-y: auto; box-sizing: border-box;\n  padding: 27px 19px 20px; border: 2px solid rgba(255,255,255,.94);\n  border-radius: 29px;\n  background:\n    radial-gradient(circle at 8% 5%,rgba(255,222,160,.48),transparent 44%),\n    radial-gradient(circle at 96% 98%,rgba(210,197,255,.43),transparent 40%),\n    linear-gradient(145deg,#fffcfa 0%,#fff4ec 100%);\n  box-shadow: 0 23px 66px rgba(49,29,51,.33),inset 0 1px 0 rgba(255,255,255,.97);\n  color: #6f4559;\n  font-family: ui-rounded,system-ui,-apple-system,BlinkMacSystemFont,\"Microsoft YaHei\",sans-serif;\n  user-select: none; -webkit-user-select: none;\n  animation: caisha-settings-pop 180ms cubic-bezier(.2,.8,.2,1) both;\n  overscroll-behavior: contain;\n}\n.caisha-settings-panel::before {\n  content: \"\"; position: absolute; inset: 0 0 auto;\n  height: 7px; border-radius: 27px 27px 0 0;\n  background: linear-gradient(90deg,#ff8c91,#ffc66f,#f5e07f,#89dcb4,#8bc8ff,#c2a3f6);\n}\n.caisha-settings-close {\n  position: absolute; top: 15px; right: 15px;\n  display: grid; place-items: center; width: 35px; height: 35px;\n  border-radius: 12px; border: 1px solid #f5dcdf;\n  color: #ad7e8c; background: rgba(255,255,255,.86);\n  box-shadow: 0 4px 11px rgba(117,78,89,.08);\n  cursor: pointer; font: 800 26px/1 system-ui,sans-serif; touch-action: manipulation;\n}\n.caisha-settings-head { text-align: center; padding-top: 2px; }\n.caisha-settings-head-icon {\n  display: grid; place-items: center; width: 50px; height: 50px;\n  margin: 0 auto 8px; border-radius: 17px;\n  background: linear-gradient(145deg,#ffe4e2,#ffe7bc 60%,#ede1ff);\n  box-shadow: 0 5px 13px rgba(229,157,112,.18),inset 0 1px 0 rgba(255,255,255,.95);\n  font-size: 26px;\n}\n.caisha-settings-title {\n  margin: 0; font-size: 24px; line-height: 1.25;\n  font-weight: 950; letter-spacing: .03em; color: #6f4559;\n}\n.caisha-settings-subtitle {\n  margin: 6px 0 18px; color: #aa8d97;\n  font-size: 12px; font-weight: 650;\n}\n.caisha-settings-rows { display: grid; gap: 12px; }\n.caisha-settings-volume {\n  --accent-start:#ffb568; --accent-end:#ff7f7b;\n  --progress:70%;\n  display: grid; grid-template-columns: 46px minmax(0,1fr);\n  gap: 12px; align-items: center;\n  box-sizing: border-box; min-height: 94px;\n  padding: 13px 13px 13px 11px;\n  border: 1.5px solid #f6dad7; border-radius: 19px;\n  background: linear-gradient(108deg,#fff,#fff1e9);\n  box-shadow: 0 5px 13px rgba(119,78,93,.055),inset 0 1px 0 #fff;\n}\n.caisha-settings-volume[data-volume=\"sfx\"] {\n  --accent-start:#7fdafa; --accent-end:#6f9ef9;\n  border-color: #dce5f7; background: linear-gradient(108deg,#fff,#f0f5ff);\n}\n.caisha-settings-volume__icon {\n  position: relative; display: grid; place-items: center;\n  width: 46px; height: 46px; border-radius: 16px;\n  background: #ffe5db; box-shadow: inset 0 1px 0 white;\n  font-size: 27px;\n}\n.caisha-settings-volume[data-volume=\"sfx\"] .caisha-settings-volume__icon { background: #dff0ff; }\n.caisha-settings-volume__icon img {\n  position: absolute; width: 39px; height: 39px; object-fit: contain; pointer-events: none;\n}\n.caisha-settings-volume__body { min-width: 0; }\n.caisha-settings-volume__labels { display: flex; gap: 4px; align-items: center; justify-content: space-between; margin-bottom: 13px; }\n.caisha-settings-volume__label { color: #734d5b; font: 850 14px/1 system-ui,sans-serif; }\n.caisha-settings-volume__badge {\n  min-width: 46px; padding: 6px 7px; box-sizing: border-box;\n  border-radius: 999px; background: rgba(255,255,255,.86);\n  color: #a47480; font: 900 12px/1 system-ui,sans-serif;\n  text-align: center; font-variant-numeric: tabular-nums;\n}\n.caisha-settings-volume__track {\n  position: relative; height: 15px;\n  border: 1px solid rgba(207,174,179,.18); border-radius: 99px;\n  background: #f2e7e9; box-shadow: inset 0 2px 4px rgba(133,104,115,.12),inset 0 1px 0 rgba(255,255,255,.85);\n  touch-action: none;\n}\n.caisha-settings-volume[data-volume=\"sfx\"] .caisha-settings-volume__track { background: #e5eaf4; }\n.caisha-settings-volume__fill {\n  position: absolute; inset: 0 auto 0 0; width: var(--progress); border-radius: inherit;\n  background: linear-gradient(90deg,var(--accent-start),var(--accent-end));\n  box-shadow: 0 1px 4px rgba(210,119,121,.15);\n  pointer-events: none;\n}\n.caisha-settings-volume__knob {\n  position: absolute; top: 50%; left: var(--progress);\n  display: grid; place-items: center;\n  width: 27px; height: 27px; border: 3px solid #fff; border-radius: 50%;\n  background: linear-gradient(145deg,var(--accent-start),var(--accent-end));\n  box-shadow: 0 3px 7px rgba(112,78,93,.23),inset 0 1px 3px rgba(255,255,255,.48);\n  transform: translate(-50%,-50%);\n  pointer-events: none;\n}\n.caisha-settings-volume__knob img { width: 28px; height: 28px; object-fit: contain; position: absolute; }\n.caisha-settings-volume__input {\n  position: absolute; left: -10px; top: -17px;\n  width: calc(100% + 20px); height: 47px; margin: 0;\n  cursor: pointer; opacity: 0; touch-action: none; z-index: 3;\n}\n.caisha-settings-footer {\n  margin: 17px 0 0; text-align: center; color: #b59da1;\n  font-size: 11px; line-height: 1.5; font-weight: 650;\n}\n.caisha-settings-close:focus-visible,.caisha-settings-gear:focus-visible,.caisha-settings-volume__input:focus-visible {\n  outline: 3px solid #a594f5; outline-offset: 3px;\n}\n@keyframes caisha-settings-pop {\n  from { opacity: .6; transform: translateY(8px) scale(.97); }\n  to { opacity: 1; transform: translateY(0) scale(1); }\n}\n@media(max-height:510px) {\n  .caisha-settings-panel { padding: 17px 17px 14px; }\n  .caisha-settings-head-icon { display: none; }\n  .caisha-settings-subtitle { margin-bottom: 10px; }\n  .caisha-settings-volume { min-height: 75px; padding-top: 9px; padding-bottom: 9px; }\n  .caisha-settings-footer { margin-top: 9px; }\n}\n@media(prefers-reduced-motion:reduce) { .caisha-settings-panel { animation: none; } }\n\n.caisha-settings-home {\n  display: flex; align-items: center; justify-content: center; gap: 8px;\n  width: 100%; height: 48px; margin-top: 17px;\n  border: 0; border-radius: 16px; background: linear-gradient(100deg,#ffa88f,#f28aad 60%,#bc9cf2);\n  color: #fff; font: 900 15px/1 system-ui,sans-serif;\n  text-shadow: 0 1px 1px rgba(114,72,103,.15);\n  box-shadow: 0 5px 13px rgba(207,111,145,.22),inset 0 1px 0 rgba(255,255,255,.46);\n  cursor: pointer; -webkit-tap-highlight-color: transparent;\n}\n.caisha-settings-home:active { transform: scale(.98); }\n.caisha-settings-home:focus-visible { outline: 3px solid #a594f5; outline-offset: 3px; }\n.caisha-settings-home[hidden] { display: none; }\n";
  document.head.appendChild(style);
}

export class SettingsPanel {
  constructor(container = document.body, { audio, onHome = null, canGoHome = () => false } = {}) {
    this.onHome = onHome;
    this.canGoHome = canGoHome;
    ensureStyles();
    this.container = container;
    this.audio = audio;
    this.opened = false;
    this.rows = new Map();

    this.gearButton = node('button', 'caisha-settings-gear', '⚙️');
    this.gearButton.type = 'button';
    this.gearButton.dataset.audioSkipClick = 'true';
    this.gearButton.setAttribute('aria-label', '打开设置');
    this.gearButton.appendChild(createAssetImage('setting_gear_rainbow.png'));

    this.overlay = node('div', 'caisha-settings-overlay');
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', '声音设置');
    this.panel = node('section', 'caisha-settings-panel');

    this.closeButton = node('button', 'caisha-settings-close', '×');
    this.closeButton.type = 'button';
    this.closeButton.dataset.audioSkipClick = 'true';
    this.closeButton.setAttribute('aria-label', '关闭设置');

    const head = node('div', 'caisha-settings-head');
    head.append(
      node('div', 'caisha-settings-head-icon', '🎵'),
      node('h2', 'caisha-settings-title', '声音设置'),
      node('p', 'caisha-settings-subtitle', '调整音量，享受七彩沙粒的节奏')
    );

    this.controls = node('div', 'caisha-settings-rows');
    this.controls.append(
      this.createVolumeRow({ key: 'music', label: '音乐音量', icon: 'music_icon.png', symbol: '♫', knob: 'slider_knob_orange.png' }),
      this.createVolumeRow({ key: 'sfx', label: '音效音量', icon: 'sfx_icon.png', symbol: '🔊', knob: 'slider_knob_blue.png' })
    );

    this.homeButton = node('button', 'caisha-settings-home', '⌂  返回主页');
    this.homeButton.type = 'button';
    this.homeButton.dataset.audioSkipClick = 'true';
    this.homeButton.setAttribute('aria-label', '返回主页');
    this.homeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!this.opened || !this.canGoHome?.()) return;
      this.close({ silent: true });
      this.audio?.playUiClick?.();
      this.onHome?.();
    });
    this.panel.append(
      this.closeButton,
      head,
      this.controls,
      this.homeButton,
      node('p', 'caisha-settings-footer', '拖动滑块，找到最舒服的声音大小')
    );
    this.overlay.appendChild(this.panel);
    this.container.append(this.gearButton, this.overlay);

    this.gearButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.audio?.unlock?.();
      this.audio?.playUiClick?.();
      this.open();
    });
    this.closeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.close();
    });
    this.overlay.addEventListener('pointerdown', (event) => {
      if (event.target === this.overlay) this.close();
    });
    this.onKeyDown = (event) => {
      if (event.key === 'Escape' && this.opened) this.close();
    };
    document.addEventListener('keydown', this.onKeyDown);
    this.refresh();
  }

  createVolumeRow({ key, label, icon, symbol, knob }) {
    const row = node('div', 'caisha-settings-volume');
    row.dataset.volume = key;

    const iconShell = node('div', 'caisha-settings-volume__icon', symbol);
    iconShell.appendChild(createAssetImage(icon));

    const body = node('div', 'caisha-settings-volume__body');
    const labels = node('div', 'caisha-settings-volume__labels');
    const badge = node('span', 'caisha-settings-volume__badge');
    labels.append(node('span', 'caisha-settings-volume__label', label), badge);

    // These parts are drawn with CSS, so a missing slider PNG can never
    // expose the browser's broken-image icon or break a control.
    const track = node('div', 'caisha-settings-volume__track');
    const fill = node('div', 'caisha-settings-volume__fill');
    const knobShell = node('div', 'caisha-settings-volume__knob');
    knobShell.appendChild(createAssetImage(knob));
    const input = node('input', 'caisha-settings-volume__input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.step = '1';
    input.setAttribute('aria-label', label);
    input.dataset.audioSkipClick = 'true';
    track.append(fill, knobShell, input);
    body.append(labels, track);
    row.append(iconShell, body);

    input.addEventListener('input', () => {
      this.audio?.unlock?.();
      const value = clamp(Number(input.value) / 100, 0, 1);
      if (key === 'music') this.audio?.setMusicVolume?.(value);
      else this.audio?.setSfxVolume?.(value);
      this.renderRow(key);
    });
    input.addEventListener('change', () => {
      if (key === 'sfx' && this.audio?.getSfxVolume?.() > 0) {
        this.audio.playUiClick?.({ force: true });
      }
    });

    this.rows.set(key, { row, input, badge });
    return row;
  }

  getVolume(key) {
    if (key === 'music') return clamp(this.audio?.getMusicVolume?.() ?? 0.7, 0, 1);
    return clamp(this.audio?.getSfxVolume?.() ?? 0.8, 0, 1);
  }

  renderRow(key) {
    const row = this.rows.get(key);
    if (!row) return;
    const percent = Math.round(this.getVolume(key) * 100);
    row.input.value = String(percent);
    row.row.style.setProperty('--progress', percent + '%');
    row.badge.textContent = percent + '%';
  }

  refresh() {
    this.renderRow('music');
    this.renderRow('sfx');
  }

  isOpen() { return this.opened; }

  open() {
    if (this.opened) return;
    this.opened = true;
    this.refresh();
    this.homeButton.hidden = !Boolean(this.onHome && this.canGoHome?.());
    this.overlay.classList.add('is-open');
    requestAnimationFrame(() => {
      this.rows.get('music')?.input?.focus?.({ preventScroll: true });
    });
  }

  close({ silent = false } = {}) {
    if (!this.opened) return;
    this.opened = false;
    this.overlay.classList.remove('is-open');
    if (!silent) this.audio?.playUiClick?.();
    this.gearButton.focus?.({ preventScroll: true });
  }
}
