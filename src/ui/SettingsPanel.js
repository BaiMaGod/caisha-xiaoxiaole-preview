const SETTINGS_ASSET_DIR = 'images/settings-ui/';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function assetUrl(name) {
  const baseUrl =
    typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
      ? import.meta.env.BASE_URL
      : './';

  return `${baseUrl}${SETTINGS_ASSET_DIR}${name}`;
}

function createAssetImage(name, alt = '') {
  const image = document.createElement('img');
  image.src = assetUrl(name);
  image.alt = alt;
  image.draggable = false;
  image.decoding = 'async';
  return image;
}

export class SettingsPanel {
  constructor(container = document.body, { audio, onHome = null, canGoHome = () => false } = {}) {
    this.onHome = onHome;
    this.canGoHome = canGoHome;
    this.container = container;
    this.audio = audio;
    this.opened = false;
    this.rows = new Map();

    this.gearButton = document.createElement('button');
    this.gearButton.type = 'button';
    this.gearButton.dataset.audioSkipClick = 'true';
    this.gearButton.setAttribute('aria-label', '打开设置');
    Object.assign(this.gearButton.style, {
      position: 'absolute',
      right: 'max(12px, env(safe-area-inset-right))',
      top: 'max(12px, env(safe-area-inset-top))',
      zIndex: '45',
      width: '52px',
      height: '54px',
      padding: '0',
      border: '0',
      background: 'transparent',
      cursor: 'pointer',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent'
    });

    const gearImage = createAssetImage('setting_gear_rainbow.png', '');
    Object.assign(gearImage.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      objectFit: 'contain',
      pointerEvents: 'none'
    });
    this.gearButton.appendChild(gearImage);

    this.overlay = document.createElement('div');
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', '设置');
    Object.assign(this.overlay.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '70',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 14px',
      boxSizing: 'border-box',
      background: 'rgba(55, 43, 34, .30)',
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)',
      touchAction: 'none'
    });

    this.panel = document.createElement('div');
    Object.assign(this.panel.style, {
      position: 'relative',
      width: 'min(92vw, 356px)',
      aspectRatio: '406 / 316',
      color: '#71351f',
      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Microsoft YaHei", "Segoe UI", sans-serif',
      userSelect: 'none',
      WebkitUserSelect: 'none'
    });

    const panelBackground = createAssetImage('panel_background.png', '');
    Object.assign(panelBackground.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
      objectFit: 'fill',
      pointerEvents: 'none',
      filter: 'drop-shadow(0 13px 18px rgba(74, 48, 29, .19))'
    });

    this.closeButton = document.createElement('button');
    this.closeButton.type = 'button';
    this.closeButton.dataset.audioSkipClick = 'true';
    this.closeButton.setAttribute('aria-label', '关闭设置');
    Object.assign(this.closeButton.style, {
      position: 'absolute',
      right: '-5px',
      top: '-5px',
      zIndex: '4',
      width: '49px',
      height: '50px',
      padding: '0',
      border: '0',
      background: 'transparent',
      cursor: 'pointer',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent'
    });

    const closeImage = createAssetImage('close_button.png', '');
    Object.assign(closeImage.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      objectFit: 'contain',
      pointerEvents: 'none'
    });
    this.closeButton.appendChild(closeImage);

    this.controls = document.createElement('div');
    Object.assign(this.controls.style, {
      position: 'absolute',
      left: '9%',
      right: '7.5%',
      top: '31%',
      bottom: '23%',
      zIndex: '2',
      display: 'grid',
      gridTemplateRows: '1fr 1fr',
      rowGap: '7%'
    });

    this.controls.append(
      this.createVolumeRow({
        key: 'music',
        label: '音乐音量',
        icon: 'music_icon.png',
        fill: 'slider_fill_orange.png',
        knob: 'slider_knob_orange.png'
      }),
      this.createVolumeRow({
        key: 'sfx',
        label: '音效音量',
        icon: 'sfx_icon.png',
        fill: 'slider_fill_blue.png',
        knob: 'slider_knob_blue.png'
      })
    );

    // Keep the original illustrated settings panel intact. The navigation
    // control lives BELOW the artwork so no original asset is moved or covered.
    this.homeButton = document.createElement('button');
    this.homeButton.type = 'button';
    this.homeButton.dataset.audioSkipClick = 'true';
    this.homeButton.textContent = '⌂ 返回主页';
    this.homeButton.setAttribute('aria-label', '返回主页');
    Object.assign(this.homeButton.style, {
      position: 'absolute',
      top: 'calc(100% + 10px)',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'none',
      minWidth: '168px',
      height: '41px',
      padding: '5px 20px',
      borderRadius: '999px',
      border: '2px solid #ffd5a5',
      background: 'linear-gradient(180deg, #fffaf2, #ffe4be)',
      color: '#865039',
      boxShadow: '0 6px 15px rgba(88, 56, 34, .14)',
      font: '850 14px system-ui, sans-serif',
      cursor: 'pointer',
      touchAction: 'manipulation'
    });
    this.homeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!this.opened || !this.canGoHome?.()) return;
      this.close({ silent: true });
      this.audio?.playUiClick?.();
      this.onHome?.();
    });
    this.panel.append(panelBackground, this.controls, this.closeButton, this.homeButton);
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
      if (event.target === this.overlay) {
        this.close();
      }
    });

    this.onKeyDown = (event) => {
      if (event.key === 'Escape' && this.opened) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.onKeyDown);

    this.refresh();
  }

  createVolumeRow({ key, label, icon, fill, knob }) {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'grid',
      gridTemplateColumns: '47px minmax(0, 1fr) 52px',
      gridTemplateRows: '23px 34px',
      columnGap: '8px',
      alignItems: 'center',
      alignContent: 'center',
      minWidth: '0'
    });

    const iconImage = createAssetImage(icon, '');
    Object.assign(iconImage.style, {
      gridColumn: '1',
      gridRow: '1 / span 2',
      justifySelf: 'center',
      width: key === 'music' ? '39px' : '43px',
      height: '43px',
      objectFit: 'contain',
      pointerEvents: 'none'
    });

    const labelElement = document.createElement('div');
    labelElement.textContent = label;
    Object.assign(labelElement.style, {
      gridColumn: '2 / span 2',
      gridRow: '1',
      alignSelf: 'end',
      margin: '0 0 3px 2px',
      fontSize: '14px',
      lineHeight: '1',
      fontWeight: '800',
      color: '#71351f',
      letterSpacing: '.01em'
    });

    const track = document.createElement('div');
    Object.assign(track.style, {
      gridColumn: '2',
      gridRow: '2',
      position: 'relative',
      height: '32px',
      minWidth: '0',
      touchAction: 'none'
    });

    const trackImage = createAssetImage('slider_track_empty.png', '');
    Object.assign(trackImage.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      top: '50%',
      width: '100%',
      height: '16px',
      transform: 'translateY(-50%)',
      objectFit: 'fill',
      pointerEvents: 'none'
    });

    const fillMask = document.createElement('div');
    Object.assign(fillMask.style, {
      position: 'absolute',
      left: '0',
      top: '50%',
      width: '0%',
      height: '16px',
      transform: 'translateY(-50%)',
      overflow: 'hidden',
      borderRadius: '999px',
      pointerEvents: 'none',
      // Fallback for the damaged/missing orange fill PNG seen in preview.
      background: key === 'music'
        ? 'linear-gradient(180deg, #ffe58c, #ffa233)'
        : 'linear-gradient(180deg, #83d9ff, #288bed)'
    });

    const fillImage = createAssetImage(fill, '');
    fillImage.addEventListener('error', () => {
      fillImage.style.display = 'none';
    });
    Object.assign(fillImage.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      objectFit: 'fill',
      pointerEvents: 'none'
    });
    fillMask.appendChild(fillImage);

    const knobImage = createAssetImage(knob, '');
    Object.assign(knobImage.style, {
      position: 'absolute',
      left: '0%',
      top: '50%',
      width: '32px',
      height: '32px',
      transform: 'translate(-50%, -50%)',
      objectFit: 'contain',
      pointerEvents: 'none'
    });

    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.step = '1';
    input.setAttribute('aria-label', label);
    Object.assign(input.style, {
      position: 'absolute',
      inset: '-7px -12px',
      width: 'calc(100% + 24px)',
      height: '46px',
      margin: '0',
      opacity: '0',
      cursor: 'pointer',
      zIndex: '5',
      touchAction: 'none'
    });

    track.append(trackImage, fillMask, knobImage, input);

    const badge = document.createElement('div');
    Object.assign(badge.style, {
      gridColumn: '3',
      gridRow: '2',
      display: 'grid',
      placeItems: 'center',
      width: '52px',
      height: '30px',
      backgroundImage: `url("${assetUrl('percent_badge_bg.png')}")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'contain',
      color: '#71351f',
      fontSize: '13px',
      fontWeight: '850',
      lineHeight: '1',
      fontVariantNumeric: 'tabular-nums'
    });

    input.addEventListener('input', () => {
      this.audio?.unlock?.();
      const value = clamp(Number(input.value) / 100, 0, 1);

      if (key === 'music') {
        this.audio?.setMusicVolume?.(value);
      } else {
        this.audio?.setSfxVolume?.(value);
      }

      this.renderRow(key);
    });

    input.addEventListener('change', () => {
      if (key === 'sfx' && this.audio?.getSfxVolume?.() > 0) {
        this.audio.playUiClick?.({ force: true });
      }
    });

    this.rows.set(key, {
      input,
      fillMask,
      knobImage,
      badge
    });

    row.append(iconImage, labelElement, track, badge);
    return row;
  }

  getVolume(key) {
    if (key === 'music') {
      return clamp(this.audio?.getMusicVolume?.() ?? 0.7, 0, 1);
    }

    return clamp(this.audio?.getSfxVolume?.() ?? 0.8, 0, 1);
  }

  renderRow(key) {
    const row = this.rows.get(key);
    if (!row) return;

    const volume = this.getVolume(key);
    const percent = Math.round(volume * 100);
    const knobPercent = clamp(percent, 2, 98);

    row.input.value = String(percent);
    row.fillMask.style.width = `${percent}%`;
    row.knobImage.style.left = `${knobPercent}%`;
    row.badge.textContent = `${percent}%`;
  }

  refresh() {
    this.renderRow('music');
    this.renderRow('sfx');
  }

  isOpen() {
    return this.opened;
  }

  open() {
    if (this.opened) return;

    this.opened = true;
    this.refresh();
    this.homeButton.style.display =
      this.onHome && this.canGoHome?.() ? 'block' : 'none';
    this.overlay.style.display = 'flex';

    requestAnimationFrame(() => {
      this.rows.get('music')?.input?.focus?.({ preventScroll: true });
    });
  }

  close({ silent = false } = {}) {
    if (!this.opened) return;

    this.opened = false;
    this.overlay.style.display = 'none';

    if (!silent) {
      this.audio?.playUiClick?.();
    }

    this.gearButton.focus?.({ preventScroll: true });
  }
}
