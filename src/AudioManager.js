import { RewardAudio } from './RewardAudio.js';

const AUDIO_MUTED_STORAGE_KEY = 'caisha.audio.muted.v1';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getSandFlowLevel(movedCount) {
  const moved = Math.max(0, Number(movedCount) || 0);

  if (moved < 2) return 0;

  return clamp(Math.sqrt(moved / 900), 0, 1);
}

export function getClearSoundIntensity(cleared, combo = 1) {
  const particles = Math.max(1, Number(cleared) || 1);
  const chain = Math.max(1, Number(combo) || 1);

  return clamp(
    0.46 + Math.log10(particles) * 0.18 + (chain - 1) * 0.055,
    0.55,
    1.28
  );
}

function safeReadMuted(storage) {
  try {
    return storage?.getItem?.(AUDIO_MUTED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function safeWriteMuted(storage, muted) {
  try {
    storage?.setItem?.(AUDIO_MUTED_STORAGE_KEY, muted ? '1' : '0');
  } catch {
    // Storage can be unavailable in private browsing or embedded webviews.
  }
}

export class AudioManager {
  constructor(element, { storage = globalThis.localStorage } = {}) {
    this.element = element;
    this.storage = storage;
    this.context = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.uiGain = null;
    this.ambienceGain = null;
    this.rewardGain = null;
    this.compressor = null;
    this.rewardAudio = null;

    this.muted = safeReadMuted(storage);
    this.userUnlocked = false;
    this.suspendedByVisibility = false;

    this.activeSources = new Set();
    this.activeOscillators = new Set();
    this.noiseBuffer = null;
    this.sandSource = null;
    this.sandFilter = null;
    this.sandGain = null;

    this.clearSweepIntensity = 0;
    this.clearSweepLastBucket = -1;
    this.clearSweepCombo = 1;

    this.lastUiSoundAt = -Infinity;
    this.muteButton = null;

    this.ensureContext();

    const unlock = () => this.unlock();

    element?.addEventListener?.('pointerdown', unlock, { passive: true });
    element?.addEventListener?.('touchstart', unlock, { passive: true });

    element?.addEventListener?.('click', (event) => {
      const target = event.target;
      const button = target?.closest?.('button');

      if (
        !button ||
        button.disabled ||
        button.dataset.audioSkipClick === 'true'
      ) {
        return;
      }

      this.playUiClick();
    });
  }

  ensureContext() {
    if (this.context) return this.context;
    if (typeof window === 'undefined') return null;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    const context = new AudioContextClass();

    this.context = context;
    this.masterGain = context.createGain();
    this.sfxGain = context.createGain();
    this.uiGain = context.createGain();
    this.ambienceGain = context.createGain();
    this.rewardGain = context.createGain();

    this.masterGain.gain.value = this.muted ? 0 : 0.9;
    this.sfxGain.gain.value = 0.9;
    this.uiGain.gain.value = 0.62;
    this.ambienceGain.gain.value = 0.72;
    this.rewardGain.gain.value = 0.82;

    this.compressor = context.createDynamicsCompressor?.() ?? null;

    if (this.compressor) {
      this.compressor.threshold.value = -13;
      this.compressor.knee.value = 16;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.006;
      this.compressor.release.value = 0.16;

      this.masterGain.connect(this.compressor);
      this.compressor.connect(context.destination);
    } else {
      this.masterGain.connect(context.destination);
    }

    this.sfxGain.connect(this.masterGain);
    this.uiGain.connect(this.masterGain);
    this.ambienceGain.connect(this.masterGain);
    this.rewardGain.connect(this.masterGain);

    this.rewardAudio = new RewardAudio(null, {
      context,
      destination: this.rewardGain,
      autoUnlock: false
    });

    this.rewardAudio.preloadVoices();
    return context;
  }

  unlock() {
    const context = this.ensureContext();
    if (!context) return;

    this.userUnlocked = true;
    this.suspendedByVisibility = false;
    context.resume?.();
    this.ensureSandLoop();
    this.rewardAudio?.preloadVoices();
  }

  suspendForVisibility() {
    if (!this.context) return;

    this.suspendedByVisibility = true;
    this.setSandFlow(0);
    this.endClearSweep({ immediate: true });
    this.context.suspend?.();
  }

  resumeFromVisibility() {
    if (!this.context || !this.userUnlocked) return;

    this.suspendedByVisibility = false;
    this.context.resume?.();
    this.ensureSandLoop();
  }

  isMuted() {
    return this.muted;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    safeWriteMuted(this.storage, this.muted);

    const context = this.ensureContext();

    if (context && this.masterGain) {
      const now = context.currentTime;
      const target = this.muted ? 0 : 0.9;

      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(target, now + 0.045);
    }

    this.refreshMuteButton();
    return this.muted;
  }

  toggleMuted() {
    return this.setMuted(!this.muted);
  }

  mountMuteButton(container) {
    if (!container || this.muteButton || typeof document === 'undefined') {
      return this.muteButton;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.audioSkipClick = 'true';
    button.setAttribute('aria-label', '声音开关');
    button.style.position = 'absolute';
    button.style.right = '12px';
    button.style.bottom = 'max(12px, env(safe-area-inset-bottom))';
    button.style.zIndex = '35';
    button.style.width = '38px';
    button.style.height = '38px';
    button.style.display = 'grid';
    button.style.placeItems = 'center';
    button.style.padding = '0';
    button.style.border = '1px solid rgba(111,82,57,.10)';
    button.style.borderRadius = '50%';
    button.style.background = 'rgba(255,255,255,.82)';
    button.style.boxShadow = '0 5px 16px rgba(91,65,42,.10)';
    button.style.backdropFilter = 'blur(8px)';
    button.style.font = '700 18px/1 system-ui, sans-serif';
    button.style.cursor = 'pointer';
    button.style.touchAction = 'manipulation';
    button.style.opacity = '.88';

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const muted = this.toggleMuted();

      if (!muted) {
        this.unlock();
        this.playUiClick({ force: true });
      }
    });

    this.muteButton = button;
    container.appendChild(button);
    this.refreshMuteButton();

    return button;
  }

  refreshMuteButton() {
    if (!this.muteButton) return;

    this.muteButton.textContent = this.muted ? '🔇' : '🔊';
    this.muteButton.title = this.muted ? '开启声音' : '关闭声音';
  }

  playUiClick({ force = false } = {}) {
    if (this.muted && !force) return;

    const nowMs =
      typeof performance !== 'undefined' ? performance.now() : Date.now();

    if (!force && nowMs - this.lastUiSoundAt < 55) return;
    this.lastUiSoundAt = nowMs;

    const context = this.ensureContext();
    if (!context || context.state === 'suspended') return;

    const now = context.currentTime;
    this.scheduleTone({
      destination: this.uiGain,
      start: now,
      frequency: 720,
      endFrequency: 900,
      duration: 0.045,
      peak: 0.045,
      type: 'sine'
    });
  }

  playRelease() {
    if (this.muted) return;

    const context = this.ensureContext();
    if (!context || context.state === 'suspended') return;

    const now = context.currentTime;

    // Light, cheerful confirmation: a tiny two-note "pop" instead of material noise.
    this.scheduleTone({
      destination: this.sfxGain,
      start: now,
      frequency: 880,
      endFrequency: 932,
      duration: 0.055,
      peak: 0.032,
      type: 'sine'
    });

    this.scheduleTone({
      destination: this.sfxGain,
      start: now + 0.045,
      frequency: 1046.5,
      endFrequency: 1174.7,
      duration: 0.075,
      peak: 0.035,
      type: 'triangle'
    });
  }

  playFallStart() {
    if (this.muted) return;

    const context = this.ensureContext();
    if (!context || context.state === 'suspended') return;

    const now = context.currentTime;

    // A short playful "drop" cue. It stays tonal and game-like, not realistic.
    this.scheduleTone({
      destination: this.sfxGain,
      start: now,
      frequency: 659.25,
      endFrequency: 587.33,
      duration: 0.085,
      peak: 0.026,
      type: 'triangle'
    });

    this.scheduleTone({
      destination: this.sfxGain,
      start: now + 0.065,
      frequency: 783.99,
      endFrequency: 698.46,
      duration: 0.09,
      peak: 0.022,
      type: 'sine'
    });
  }

  playFastDrop() {
    if (this.muted) return;

    const context = this.ensureContext();
    if (!context || context.state === 'suspended') return;

    const now = context.currentTime;
    const notes = [1046.5, 1318.5, 1568];

    notes.forEach((frequency, index) => {
      this.scheduleTone({
        destination: this.sfxGain,
        start: now + index * 0.045,
        frequency,
        endFrequency: frequency * 1.035,
        duration: 0.075,
        peak: 0.029 + index * 0.003,
        type: index === 1 ? 'triangle' : 'sine'
      });
    });
  }

  playImpact(intensity = 1) {
    if (this.muted) return;

    const context = this.ensureContext();
    if (!context || context.state === 'suspended') return;

    const scale = clamp(Number(intensity) || 1, 0.7, 1.3);
    const now = context.currentTime;

    this.playNoiseBurst({
      destination: this.sfxGain,
      duration: 0.13,
      peak: 0.07 * scale,
      filterType: 'lowpass',
      startFrequency: 720,
      endFrequency: 340,
      q: 0.65
    });

    this.scheduleTone({
      destination: this.sfxGain,
      start: now,
      frequency: 120,
      endFrequency: 72,
      duration: 0.14,
      peak: 0.045 * scale,
      type: 'sine'
    });
  }

  playCrumble() {
    if (this.muted) return;

    const context = this.ensureContext();
    if (!context || context.state === 'suspended') return;

    this.playNoiseBurst({
      destination: this.sfxGain,
      duration: 0.3,
      peak: 0.052,
      filterType: 'bandpass',
      startFrequency: 1350,
      endFrequency: 760,
      q: 0.7
    });
  }

  beginClearSweep({ cleared = 0, combo = 1 } = {}) {
    if (this.muted) return;

    const context = this.ensureContext();
    if (!context || context.state === 'suspended') return;

    this.clearSweepIntensity = getClearSoundIntensity(cleared, combo);
    this.clearSweepLastBucket = -1;
    this.clearSweepCombo = Math.max(1, Number(combo) || 1);

    const now = context.currentTime;
    const comboLift = Math.min(5, this.clearSweepCombo - 1) * 24;

    // Opening chime announces that a rewarding clear has begun.
    this.scheduleTone({
      destination: this.sfxGain,
      start: now,
      frequency: 659.25 + comboLift,
      endFrequency: 783.99 + comboLift,
      duration: 0.1,
      peak: 0.026 * this.clearSweepIntensity,
      type: 'triangle'
    });
  }

  updateClearSweep({ progress = 0, clearedVisual = 0, total = 1 } = {}) {
    const context = this.ensureContext();

    if (!context || this.muted || context.state === 'suspended') {
      return;
    }

    const p = clamp(Number(progress) || 0, 0, 1);
    if (p <= 0.01 || p >= 0.995) return;

    // One musical step for each section of the actual left-to-right visual wave.
    // The notes rise as the clear travels right, so the player hears progress.
    const bucketCount = 12;
    const bucket = Math.floor(p * bucketCount);

    if (bucket <= this.clearSweepLastBucket) return;
    this.clearSweepLastBucket = bucket;

    const scale = [
      659.25, 783.99, 880, 987.77,
      1046.5, 1174.66, 1318.51
    ];
    const intensity = this.clearSweepIntensity || 0.7;
    const comboLift = Math.min(5, this.clearSweepCombo - 1) * 22;
    const note = scale[bucket % scale.length] +
      (bucket >= scale.length ? 130.81 : 0) +
      comboLift;
    const visualRatio = clamp(
      (Number(clearedVisual) || 0) / Math.max(1, Number(total) || 1),
      0,
      1
    );
    const now = context.currentTime;

    this.scheduleTone({
      destination: this.sfxGain,
      start: now,
      frequency: note,
      endFrequency: note * (1.025 + visualRatio * 0.018),
      duration: 0.085,
      peak: (0.024 + visualRatio * 0.01) * intensity,
      type: bucket % 3 === 1 ? 'triangle' : 'sine',
      pan: -0.72 + p * 1.44
    });

    // Every third step adds a quiet harmony so large clears feel more rewarding.
    if (bucket > 0 && bucket % 3 === 0) {
      this.scheduleTone({
        destination: this.sfxGain,
        start: now + 0.012,
        frequency: note * 1.25,
        endFrequency: note * 1.28,
        duration: 0.09,
        peak: 0.012 * intensity,
        type: 'sine',
        pan: -0.68 + p * 1.36
      });
    }
  }

  endClearSweep({ immediate = false } = {}) {
    this.clearSweepIntensity = 0;
    this.clearSweepLastBucket = -1;
    this.clearSweepCombo = 1;
  }

  playReward(rating, intensity = 1) {
    if (this.muted) return Promise.resolve();

    const context = this.ensureContext();
    if (!context || context.state === 'suspended') {
      return Promise.resolve();
    }

    return this.rewardAudio?.play(rating, intensity) ?? Promise.resolve();
  }

  playGameOver() {
    if (this.muted) return;

    const context = this.ensureContext();
    if (!context || context.state === 'suspended') return;

    this.setSandFlow(0);

    const now = context.currentTime;

    this.playNoiseBurst({
      destination: this.sfxGain,
      duration: 0.42,
      peak: 0.065,
      filterType: 'lowpass',
      startFrequency: 840,
      endFrequency: 260,
      q: 0.55
    });

    this.scheduleTone({
      destination: this.sfxGain,
      start: now,
      frequency: 235,
      endFrequency: 92,
      duration: 0.42,
      peak: 0.055,
      type: 'sine'
    });
  }

  updateSandFlow(movedCount) {
    if (this.muted || !this.userUnlocked || this.suspendedByVisibility) {
      this.setSandFlow(0);
      return;
    }

    const level = getSandFlowLevel(movedCount);
    this.setSandFlow(level);
  }

  setSandFlow(level) {
    const context = this.ensureContext();
    if (!context) return;

    this.ensureSandLoop();

    if (!this.sandGain || !this.sandFilter) return;

    const target = clamp(Number(level) || 0, 0, 1);
    const now = context.currentTime;

    this.sandGain.gain.cancelScheduledValues(now);
    this.sandGain.gain.setTargetAtTime(
      target * 0.055,
      now,
      target > 0 ? 0.035 : 0.09
    );

    this.sandFilter.frequency.cancelScheduledValues(now);
    this.sandFilter.frequency.setTargetAtTime(
      650 + target * 1050,
      now,
      0.055
    );
  }

  ensureSandLoop() {
    const context = this.ensureContext();

    if (!context || this.sandSource) return;

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = this.getNoiseBuffer();
    source.loop = true;

    filter.type = 'bandpass';
    filter.frequency.value = 850;
    filter.Q.value = 0.55;

    gain.gain.value = 0;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambienceGain);

    source.start();

    this.sandSource = source;
    this.sandFilter = filter;
    this.sandGain = gain;

    source.onended = () => {
      if (this.sandSource === source) {
        this.sandSource = null;
        this.sandFilter = null;
        this.sandGain = null;
      }
    };
  }

  getNoiseBuffer() {
    if (this.noiseBuffer) return this.noiseBuffer;

    const context = this.ensureContext();
    if (!context) return null;

    const length = Math.max(1, Math.floor(context.sampleRate * 1.2));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);

    let previous = 0;

    for (let i = 0; i < channel.length; i++) {
      const white = Math.random() * 2 - 1;
      previous = previous * 0.32 + white * 0.68;
      channel[i] = previous * 0.72;
    }

    this.noiseBuffer = buffer;
    return buffer;
  }

  playNoiseBurst({
    destination,
    duration,
    peak,
    filterType,
    startFrequency,
    endFrequency,
    q = 0.7
  }) {
    const context = this.ensureContext();
    if (!context || !destination) return;

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const now = context.currentTime;
    const stopAt = now + Math.max(0.03, duration);

    source.buffer = this.getNoiseBuffer();
    source.loop = true;

    filter.type = filterType;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(
      Math.max(40, startFrequency),
      now
    );
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(40, endFrequency),
      stopAt
    );

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, peak),
      now + Math.min(0.025, duration * 0.2)
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    this.trackSource(source);
    source.start(now);
    source.stop(stopAt + 0.01);
  }

  scheduleTone({
    destination,
    start,
    frequency,
    endFrequency,
    duration,
    peak,
    type = 'sine',
    pan = 0
  }) {
    const context = this.ensureContext();
    if (!context || !destination) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      Math.max(20, frequency),
      start
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      start + duration
    );

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, peak),
      start + Math.min(0.012, duration * 0.25)
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + duration
    );

    const panner = context.createStereoPanner?.() ?? null;

    oscillator.connect(gain);

    if (panner) {
      panner.pan.value = clamp(Number(pan) || 0, -1, 1);
      gain.connect(panner);
      panner.connect(destination);
    } else {
      gain.connect(destination);
    }

    this.activeOscillators.add(oscillator);

    oscillator.onended = () => {
      this.activeOscillators.delete(oscillator);
    };

    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  }

  trackSource(source) {
    this.activeSources.add(source);

    source.onended = () => {
      this.activeSources.delete(source);
    };
  }

  stopTransient() {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // Source already ended.
      }
    }

    for (const oscillator of this.activeOscillators) {
      try {
        oscillator.stop();
      } catch {
        // Oscillator already ended.
      }
    }

    this.activeSources.clear();
    this.activeOscillators.clear();
    this.rewardAudio?.stop();
    this.setSandFlow(0);
    this.endClearSweep({ immediate: true });
  }
}
