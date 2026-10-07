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

function setImageSource(image, name) {
  image.src = assetUrl(name);
  image.draggable = false;
  image.setAttribute('aria-hidden', 'true');
}

export class SettingsPanel {
  constructor(container = document.body, { audio } = {}) {
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
      width: '44px',
      height: '44px',
      padding: '0',
      border: '0',
      borderRadius: '50%',
      background: 'transparent',
      cursor: 'pointer',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent'
    });

    this.gearImage = document.createElement('img');
    setImageSource(this.gearImage, 'setting_gear.png');
    Object.assign(this.gearImage.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      objectFit: 'contain',
      pointerEvents: 'none'
    });
    this.gearButton.appendChild(this.gearImage);

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
      padding: '24px 20px',
      boxSizing: 'border-box',
      background: 'rgba(54, 38, 26, 0.34)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      touchAction: 'none'
    });

    this.panel = document.createElement('div');
    Object.assign(this.panel.style, {
      position: 'relative',
      width: 'min(88vw, 326px)',
      padding: '25px 20px 22px',
      boxSizing: 'border-box',
      borderRadius: '27px',
      border: '1px solid rgba(255,255,255,0.82)',
      background:
        'linear-gradient(180deg, rgba(255,253,247,.99), rgba(255,247,233,.985))',
      boxShadow: '0 22px 60px rgba(75,45,20,.28)',
      color: '#654a35',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      userSelect: 'none',
      WebkitUserSelect: 'none'
    });

    this.title = document.createElement('div');
    this.title.textContent = '设置';
    Object.assign(this.title.style, {
      marginBottom: '20px',
      textAlign: 'center',
      fontSize: '25px',
      lineHeight: '1',
      fontWeight: '850',
      letterSpacing: '.08em',
      color: '#684934'
    });

    this.closeButton = document.createElement('button');
    this.closeButton.type = 'button';
    this.closeButton.dataset.audioSkipClick = 'true';
    this.closeButton.setAttribute('aria-label', '关闭设置');
    Object.assign(this.closeButton.style, {
      position: 'absolute',
      right: '12px',
      top: '12px',
      width: '36px',
      height: '36px',
      padding: '0',
      border: '0',
      borderRadius: '50%',
      background: 'transparent',
      cursor: 'pointer',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent'
    });

    this.closeImage = document.createElement('img');
    setImageSource(this.closeImage, 'close_button.png');
    Object.assign(this.closeImage.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      objectFit: 'contain',
      pointerEvents: 'none'
    });
    this.closeButton.appendChild(this.closeImage);

    this.panel.append(
      this.title,
      this.createVolumeRow({
        key: 'music',
        label: '音乐',
        icon: 'music_icon.png',
        fill: 'slider_fill_orange.png',
        knob: 'slider_knob_orange.png'
      }),
      this.createVolumeRow({
        key: 'sfx',
        label: '音效',
        icon: 'sfx_icon.png',
        fill: 'slider_fill_blue.png',
        knob: 'slider_knob_blue.png'
      }),
      this.closeButton
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
      gridTemplateColumns: '48px minmax(0, 1fr) 54px',
      alignItems: 'center',
      columnGap: '10px',
      minHeight: '70px',
      marginTop: key === 'music' ? '0' : '10px'
    });

    const iconWrap = document.createElement('div');
    Object.assign(iconWrap.style, {
      display: 'grid',
      placeItems: 'center',
      width: '48px',
      height: '48px'
    });

    const iconImage = document.createElement('img');
    setImageSource(iconImage, icon);
    Object.assign(iconImage.style, {
      width: '46px',
      height: '46px',
      objectFit: 'contain'
    });
    iconWrap.appendChild(iconImage);

    const center = document.createElement('div');
    center.style.minWidth = '0';

    const labelElement = document.createElement('div');
    labelElement.textContent = label;
    Object.assign(labelElement.style, {
      margin: '0 0 8px 2px',
      fontSize: '14px',
      lineHeight: '1',
      fontWeight: '800',
      color: '#775640'
    });

    const track = document.createElement('div');
    Object.assign(track.style, {
      position: 'relative',
      height: '32px',
      margin: '0 8px',
      touchAction: 'none'
    });

    const trackImage = document.createElement('img');
    setImageSource(trackImage, 'slider_track_empty.png');
    Object.assign(trackImage.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      top: '50%',
      width: '100%',
      height: '17px',
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
      height: '17px',
      transform: 'translateY(-50%)',
      overflow: 'hidden',
      borderRadius: '999px',
      pointerEvents: 'none'
    });

    const fillImage = document.createElement('img');
    setImageSource(fillImage, fill);
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

    const knobImage = document.createElement('img');
    setImageSource(knobImage, knob);
    Object.assign(knobImage.style, {
      position: 'absolute',
      left: '0%',
      top: '50%',
      width: '28px',
      height: '28px',
      transform: 'translate(-50%, -50%)',
      objectFit: 'contain',
      pointerEvents: 'none',
      filter: 'drop-shadow(0 2px 3px rgba(87,57,33,.16))'
    });

    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.step = '1';
    input.setAttribute('aria-label', `${label}音量`);
    Object.assign(input.style, {
      position: 'absolute',
      inset: '-5px -12px',
      width: 'calc(100% + 24px)',
      height: '42px',
      margin: '0',
      opacity: '0',
      cursor: 'pointer',
      zIndex: '5',
      touchAction: 'none'
    });

    track.append(trackImage, fillMask, knobImage, input);
    center.append(labelElement, track);

    const badge = document.createElement('div');
    Object.assign(badge.style, {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      width: '54px',
      height: '40px',
      backgroundImage: `url("${assetUrl('percent_badge_bg.png')}")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'contain',
      color: '#72513a',
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

    this.rows.set(key, { input, fillMask, knobImage, badge });
    row.append(iconWrap, center, badge);
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
