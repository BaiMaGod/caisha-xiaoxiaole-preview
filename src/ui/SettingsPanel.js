function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function gearSvg() {
  const teeth = Array.from({ length: 8 }, (_, index) => {
    const angle = index * 45;
    return `<rect x="45" y="7" width="10" height="22" rx="5"
      fill="url(#gearPaint)" transform="rotate(${angle} 50 50)"/>`;
  }).join('');

  return `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="gearRing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fffdf5"/>
          <stop offset="1" stop-color="#fff0d5"/>
        </linearGradient>
        <linearGradient id="gearPaint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffc529"/>
          <stop offset=".55" stop-color="#ffa500"/>
          <stop offset="1" stop-color="#f08200"/>
        </linearGradient>
        <filter id="gearShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.3" flood-color="#a65a16" flood-opacity=".28"/>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#gearRing)" stroke="#ffab30" stroke-width="3"/>
      <g filter="url(#gearShadow)">
        ${teeth}
        <circle cx="50" cy="50" r="27" fill="url(#gearPaint)" stroke="#eb8500" stroke-width="2"/>
        <circle cx="50" cy="50" r="11" fill="#fff8e9" stroke="#e88b10" stroke-width="2"/>
        <ellipse cx="41" cy="34" rx="8" ry="4" fill="#fff" opacity=".5" transform="rotate(-24 41 34)"/>
      </g>
    </svg>
  `;
}

function closeSvg() {
  return `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="closeRing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fffdf3"/>
          <stop offset="1" stop-color="#ffe4b9"/>
        </linearGradient>
        <linearGradient id="closePaint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ff7181"/>
          <stop offset=".55" stop-color="#ff5267"/>
          <stop offset="1" stop-color="#df334b"/>
        </linearGradient>
        <filter id="closeShadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#922b2f" flood-opacity=".26"/>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#closeRing)" stroke="#ffb05a" stroke-width="3"/>
      <circle cx="50" cy="50" r="35" fill="url(#closePaint)" stroke="#e33d52" stroke-width="2" filter="url(#closeShadow)"/>
      <path d="M35 35 L65 65 M65 35 L35 65" stroke="#fff" stroke-width="12"
        stroke-linecap="round" filter="url(#closeShadow)"/>
      <ellipse cx="38" cy="29" rx="9" ry="5" fill="#fff" opacity=".28" transform="rotate(-20 38 29)"/>
    </svg>
  `;
}

function musicSvg() {
  return `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="musicPaint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ff6a82"/>
          <stop offset="1" stop-color="#dc294e"/>
        </linearGradient>
      </defs>
      <path d="M41 20v50.5c-3.8-2.6-9-3.6-14.2-2.2-9.3 2.5-15 10.4-12.8 17.8
        2.2 7.3 11.6 11.2 20.9 8.7 7.6-2.1 12.8-7.7 13.2-13.8V39l35-8v31.5
        c-3.8-2.6-9-3.6-14.2-2.2-9.3 2.5-15 10.4-12.8 17.8 2.2 7.3 11.6
        11.2 20.9 8.7 8.3-2.3 13.8-8.8 13.3-15.6V10L41 20z"
        fill="url(#musicPaint)" stroke="#c82646" stroke-width="2" stroke-linejoin="round"/>
      <path d="M49 25l34-7" stroke="#fff" stroke-width="4" opacity=".35" stroke-linecap="round"/>
    </svg>
  `;
}

function sfxSvg() {
  return `
    <svg viewBox="0 0 110 100" aria-hidden="true">
      <defs>
        <linearGradient id="speakerPaint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#68c6ff"/>
          <stop offset="1" stop-color="#2386ef"/>
        </linearGradient>
      </defs>
      <path d="M10 38h20l25-22c4-3 9-.3 9 4v60c0 4.3-5 7-9 4L30 62H10
        c-4 0-7-3-7-7V45c0-4 3-7 7-7z"
        fill="url(#speakerPaint)" stroke="#1d78d7" stroke-width="3" stroke-linejoin="round"/>
      <path d="M76 35c8 8 8 22 0 30M88 24c15 15 15 37 0 52"
        fill="none" stroke="#2d91f0" stroke-width="8" stroke-linecap="round"/>
      <path d="M38 29l14-12" stroke="#fff" stroke-width="5" opacity=".38" stroke-linecap="round"/>
    </svg>
  `;
}

function panelDecorationSvg() {
  const paw = (x, y) => `
    <g transform="translate(${x} ${y})" fill="#f5a85d" opacity=".72">
      <ellipse cx="0" cy="8" rx="15" ry="13"/>
      <circle cx="-18" cy="-8" r="6"/>
      <circle cx="-6" cy="-15" r="6"/>
      <circle cx="7" cy="-15" r="6"/>
      <circle cx="19" cy="-7" r="6"/>
    </g>`;

  return `
    <svg viewBox="0 0 812 633" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="panelFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fffdf5"/>
          <stop offset="1" stop-color="#fff9ed"/>
        </linearGradient>
        <linearGradient id="headerFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffe9bf"/>
          <stop offset="1" stop-color="#ffd69c"/>
        </linearGradient>
        <linearGradient id="sandFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffe5aa"/>
          <stop offset=".55" stop-color="#ffd487"/>
          <stop offset="1" stop-color="#ffc76e"/>
        </linearGradient>
        <filter id="panelShadow" x="-15%" y="-15%" width="130%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#6f4424" flood-opacity=".23"/>
        </filter>
        <radialGradient id="redBall">
          <stop offset="0" stop-color="#ff9a9d"/>
          <stop offset=".7" stop-color="#ff5267"/>
          <stop offset="1" stop-color="#dc2d45"/>
        </radialGradient>
        <radialGradient id="blueBall">
          <stop offset="0" stop-color="#9ae0ff"/>
          <stop offset=".7" stop-color="#43b8f7"/>
          <stop offset="1" stop-color="#2087d7"/>
        </radialGradient>
        <radialGradient id="purpleBall">
          <stop offset="0" stop-color="#d8b4ff"/>
          <stop offset=".7" stop-color="#a96fff"/>
          <stop offset="1" stop-color="#7942dc"/>
        </radialGradient>
      </defs>

      <rect x="18" y="14" width="776" height="600" rx="52" fill="url(#panelFill)"
        stroke="#f3ae61" stroke-width="6" filter="url(#panelShadow)"/>
      <path d="M22 58Q22 24 58 24H754Q790 24 790 58V146
        C706 125 640 170 550 145
        C470 122 402 172 314 148
        C228 124 157 170 22 139Z"
        fill="url(#headerFill)" opacity=".95"/>
      <path d="M22 58Q22 24 58 24H754Q790 24 790 58"
        fill="none" stroke="#fff7df" stroke-width="7" opacity=".9"/>

      ${paw(294,83)}
      ${paw(518,83)}

      <text x="406" y="111" text-anchor="middle"
        font-family="system-ui,-apple-system,'Microsoft YaHei',sans-serif"
        font-size="62" font-weight="900" fill="#6b321c"
        paint-order="stroke" stroke="#fff8e9" stroke-width="3">设置</text>

      <path d="M23 514
        C104 470 167 545 255 523
        C347 500 404 564 505 533
        C602 503 684 468 789 514
        V574Q789 609 750 609H62Q23 609 23 572Z"
        fill="url(#sandFill)" opacity=".9"/>

      <g fill="#f2b75d" opacity=".45">
        <circle cx="74" cy="526" r="3"/><circle cx="92" cy="541" r="2.5"/>
        <circle cx="133" cy="518" r="2"/><circle cx="170" cy="551" r="3"/>
        <circle cx="225" cy="534" r="2.5"/><circle cx="294" cy="548" r="2"/>
        <circle cx="353" cy="523" r="2.5"/><circle cx="421" cy="559" r="3"/>
        <circle cx="487" cy="539" r="2"/><circle cx="564" cy="520" r="3"/>
        <circle cx="625" cy="542" r="2.5"/><circle cx="706" cy="520" r="2"/>
        <circle cx="742" cy="550" r="3"/>
      </g>

      <circle cx="81" cy="548" r="18" fill="url(#redBall)"/>
      <circle cx="185" cy="533" r="13" fill="url(#blueBall)"/>
      <circle cx="273" cy="575" r="12" fill="#ffb542"/>
      <circle cx="714" cy="557" r="20" fill="url(#purpleBall)"/>
      <ellipse cx="75" cy="541" rx="6" ry="4" fill="#fff" opacity=".45"/>
      <ellipse cx="181" cy="528" rx="5" ry="3" fill="#fff" opacity=".42"/>
      <ellipse cx="707" cy="549" rx="7" ry="4" fill="#fff" opacity=".42"/>
    </svg>
  `;
}

function createIcon(kind) {
  const wrap = document.createElement('div');
  wrap.innerHTML = kind === 'music' ? musicSvg() : sfxSvg();
  Object.assign(wrap.style, {
    width: kind === 'music' ? '43px' : '47px',
    height: '47px',
    display: 'grid',
    placeItems: 'center',
    alignSelf: 'center'
  });
  const svg = wrap.querySelector('svg');
  Object.assign(svg.style, {
    width: '100%',
    height: '100%',
    display: 'block',
    overflow: 'visible'
  });
  return wrap;
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
    this.gearButton.innerHTML = gearSvg();
    Object.assign(this.gearButton.style, {
      position: 'absolute',
      right: 'max(12px, env(safe-area-inset-right))',
      bottom: 'max(12px, env(safe-area-inset-bottom))',
      zIndex: '45',
      width: '48px',
      height: '48px',
      padding: '0',
      border: '0',
      borderRadius: '50%',
      background: 'transparent',
      cursor: 'pointer',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
      filter: 'drop-shadow(0 5px 10px rgba(92,55,25,.13))'
    });
    Object.assign(this.gearButton.querySelector('svg').style, {
      width: '100%',
      height: '100%',
      display: 'block'
    });

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
      padding: '22px 18px',
      boxSizing: 'border-box',
      background: 'rgba(55,43,34,.30)',
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)'
    });

    this.panel = document.createElement('div');
    Object.assign(this.panel.style, {
      position: 'relative',
      width: 'min(88vw, 348px)',
      aspectRatio: '812 / 633',
      color: '#6b321c',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Microsoft YaHei", "Segoe UI", sans-serif',
      userSelect: 'none',
      WebkitUserSelect: 'none'
    });

    this.decoration = document.createElement('div');
    this.decoration.innerHTML = panelDecorationSvg();
    Object.assign(this.decoration.style, {
      position: 'absolute',
      inset: '0',
      pointerEvents: 'none'
    });
    const panelSvg = this.decoration.querySelector('svg');
    Object.assign(panelSvg.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      overflow: 'visible'
    });

    this.closeButton = document.createElement('button');
    this.closeButton.type = 'button';
    this.closeButton.dataset.audioSkipClick = 'true';
    this.closeButton.setAttribute('aria-label', '关闭设置');
    this.closeButton.innerHTML = closeSvg();
    Object.assign(this.closeButton.style, {
      position: 'absolute',
      right: '-2px',
      top: '-4px',
      zIndex: '4',
      width: '48px',
      height: '48px',
      padding: '0',
      border: '0',
      borderRadius: '50%',
      background: 'transparent',
      cursor: 'pointer',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent'
    });
    Object.assign(this.closeButton.querySelector('svg').style, {
      width: '100%',
      height: '100%',
      display: 'block',
      overflow: 'visible'
    });

    this.controls = document.createElement('div');
    Object.assign(this.controls.style, {
      position: 'absolute',
      left: '8.5%',
      right: '7.2%',
      top: '28.5%',
      bottom: '16.5%',
      zIndex: '2',
      display: 'grid',
      gridTemplateRows: '1fr 1fr',
      rowGap: '5%'
    });

    this.controls.append(
      this.createVolumeRow({
        key: 'music',
        label: '音乐音量'
      }),
      this.createVolumeRow({
        key: 'sfx',
        label: '音效音量'
      })
    );

    this.panel.append(this.decoration, this.controls, this.closeButton);
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

  createVolumeRow({ key, label }) {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'grid',
      gridTemplateColumns: '48px minmax(0, 1fr) 54px',
      gridTemplateRows: '25px 38px',
      alignItems: 'center',
      columnGap: '8px',
      alignContent: 'center'
    });

    const icon = createIcon(key);
    icon.style.gridColumn = '1';
    icon.style.gridRow = '1 / span 2';

    const labelElement = document.createElement('div');
    labelElement.textContent = label;
    Object.assign(labelElement.style, {
      gridColumn: '2 / span 2',
      gridRow: '1',
      alignSelf: 'end',
      margin: '0 0 2px 1px',
      fontSize: '15px',
      lineHeight: '1',
      fontWeight: '850',
      letterSpacing: '.02em',
      color: '#6a321d'
    });

    const track = document.createElement('div');
    Object.assign(track.style, {
      gridColumn: '2',
      gridRow: '2',
      position: 'relative',
      height: '34px',
      minWidth: '0',
      touchAction: 'none'
    });

    const trackBase = document.createElement('div');
    Object.assign(trackBase.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      top: '50%',
      height: '13px',
      transform: 'translateY(-50%)',
      borderRadius: '999px',
      border: '2px solid rgba(255,255,255,.9)',
      background: 'linear-gradient(180deg,#ead8cc,#e2cbbd)',
      boxShadow:
        'inset 0 1px 2px rgba(111,67,36,.18), 0 2px 4px rgba(111,67,36,.10)'
    });

    const fill = document.createElement('div');
    Object.assign(fill.style, {
      position: 'absolute',
      left: '0',
      top: '50%',
      width: '0%',
      height: '13px',
      transform: 'translateY(-50%)',
      borderRadius: '999px',
      background:
        key === 'music'
          ? 'linear-gradient(90deg,#ffd16c,#ffa622)'
          : 'linear-gradient(90deg,#6dc7ff,#2d91f0)',
      boxShadow:
        key === 'music'
          ? 'inset 0 2px 0 rgba(255,255,255,.42), 0 2px 5px rgba(235,132,12,.22)'
          : 'inset 0 2px 0 rgba(255,255,255,.42), 0 2px 5px rgba(37,126,218,.22)',
      pointerEvents: 'none'
    });

    const knob = document.createElement('div');
    Object.assign(knob.style, {
      position: 'absolute',
      left: '0%',
      top: '50%',
      width: '31px',
      height: '31px',
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      border:
        key === 'music'
          ? '2px solid #ee8d0a'
          : '2px solid #1e78d2',
      background:
        key === 'music'
          ? 'radial-gradient(circle at 32% 26%,#fff8d6 0 11%,#ffd36a 14% 44%,#ffa523 70%,#ef7d00 100%)'
          : 'radial-gradient(circle at 32% 26%,#e7f7ff 0 11%,#68c8ff 14% 44%,#349cf4 70%,#1c6ed1 100%)',
      boxShadow: '0 4px 7px rgba(79,49,29,.24)',
      pointerEvents: 'none'
    });

    const shine = document.createElement('div');
    Object.assign(shine.style, {
      position: 'absolute',
      left: '6px',
      top: '5px',
      width: '9px',
      height: '6px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,.75)',
      transform: 'rotate(-28deg)'
    });
    knob.appendChild(shine);

    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.step = '1';
    input.setAttribute('aria-label', label);
    Object.assign(input.style, {
      position: 'absolute',
      inset: '-5px -12px',
      width: 'calc(100% + 24px)',
      height: '44px',
      margin: '0',
      opacity: '0',
      cursor: 'pointer',
      zIndex: '5',
      touchAction: 'none'
    });

    track.append(trackBase, fill, knob, input);

    const badge = document.createElement('div');
    Object.assign(badge.style, {
      gridColumn: '3',
      gridRow: '2',
      display: 'grid',
      placeItems: 'center',
      width: '52px',
      height: '31px',
      borderRadius: '16px',
      border: '1px solid rgba(220,184,143,.32)',
      background: 'linear-gradient(180deg,#fffdfa,#fff8ee)',
      boxShadow: '0 4px 9px rgba(91,58,34,.10)',
      color: '#6a321d',
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

    this.rows.set(key, { input, fill, knob, badge });
    row.append(icon, labelElement, track, badge);

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
    row.fill.style.width = `${percent}%`;
    row.knob.style.left = `${knobPercent}%`;
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
