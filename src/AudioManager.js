import { RewardAudio } from './RewardAudio.js';

const AUDIO_MUTED_STORAGE_KEY = 'caisha.audio.muted.v1';
const AUDIO_MUSIC_VOLUME_STORAGE_KEY = 'caisha.audio.musicVolume.v1';
const AUDIO_SFX_VOLUME_STORAGE_KEY = 'caisha.audio.sfxVolume.v1';
const CLEAR_SWEEP_AUDIO_PATH = 'audio/clear-roulette-fast-v2.mp3';

export const DEFAULT_MUSIC_VOLUME = 0.7;
export const DEFAULT_SFX_VOLUME = 0.8;

const BASE_MASTER_GAIN = 0.9;
const BASE_SFX_GAIN = 0.9;
const BASE_UI_GAIN = 0.62;
const BASE_AMBIENCE_GAIN = 0.72;
const BASE_REWARD_GAIN = 0.82;

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

function safeReadVolume(storage, key) {
  try {
    const raw = storage?.getItem?.(key);

    if (raw === null || raw === undefined || raw === '') {
      return null;
    }

    const value = Number(raw);
    return Number.isFinite(value) ? clamp(value, 0, 1) : null;
  } catch {
    return null;
  }
}

function safeWriteVolume(storage, key, value) {
  try {
    storage?.setItem?.(key, String(clamp(Number(value) || 0, 0, 1)));
  } catch {
    // Storage can be unavailable in private browsing or embedded webviews.
  }
}

function scaledGain(baseGain, volume, defaultVolume) {
  if (volume <= 0) return 0;
  return baseGain * (volume / defaultVolume);
}

export class AudioManager {
  constructor(element, { storage = globalThis.localStorage } = {}) {
    this.element = element;
    this.storage = storage;

    const legacyMuted = safeReadMuted(storage);
    const storedMusicVolume = safeReadVolume(
      storage,
      AUDIO_MUSIC_VOLUME_STORAGE_KEY
    );
    const storedSfxVolume = safeReadVolume(
      storage,
      AUDIO_SFX_VOLUME_STORAGE_KEY
    );

    this.musicVolume =
      storedMusicVolume ?? (legacyMuted ? 0 : DEFAULT_MUSIC_VOLUME);
    this.sfxVolume =
      storedSfxVolume ?? (legacyMuted ? 0 : DEFAULT_SFX_VOLUME);
    this.lastNonZeroMusicVolume =
      this.musicVolume > 0 ? this.musicVolume : DEFAULT_MUSIC_VOLUME;
    this.lastNonZeroSfxVolume =
      this.sfxVolume > 0 ? this.sfxVolume : DEFAULT_SFX_VOLUME;

    this.context = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.uiGain = null;
    this.ambienceGain = null;
    this.rewardGain = null;
    this.compressor = null;
    this.rewardAudio = null;

    this.muted = this.musicVolume <= 0 && this.sfxVolume <= 0;
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
    this.clearSweepBuffer = null;
    this.clearSweepLoadPromise = null;
    this.clearSweepSource = null;
    this.clearSweepGain = null;

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

    this.masterGain.gain.value = BASE_MASTER_GAIN;
    this.sfxGain.gain.value = scaledGain(
      BASE_SFX_GAIN,
      this.sfxVolume,
      DEFAULT_SFX_VOLUME
    );
    this.uiGain.gain.value = scaledGain(
      BASE_UI_GAIN,
      this.sfxVolume,
      DEFAULT_SFX_VOLUME
    );
    this.ambienceGain.gain.value = scaledGain(
      BASE_AMBIENCE_GAIN,
      this.musicVolume,
      DEFAULT_MUSIC_VOLUME
    );
    this.rewardGain.gain.value = scaledGain(
      BASE_REWARD_GAIN,
      this.sfxVolume,
      DEFAULT_SFX_VOLUME
    );

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
    this.preloadClearSweep();
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

  getMusicVolume() {
    return this.musicVolume;
  }

  getSfxVolume() {
    return this.sfxVolume;
  }

  syncMutedState() {
    this.muted = this.musicVolume <= 0 && this.sfxVolume <= 0;
    safeWriteMuted(this.storage, this.muted);
    this.refreshMuteButton();
    return this.muted;
  }

  applyVolumeGains({ immediate = false } = {}) {
    const context = this.ensureContext();
    if (!context) return;

    const now = context.currentTime;
    const duration = immediate ? 0 : 0.045;
    const targets = [
      [
        this.sfxGain,
        scaledGain(BASE_SFX_GAIN, this.sfxVolume, DEFAULT_SFX_VOLUME)
      ],
      [
        this.uiGain,
        scaledGain(BASE_UI_GAIN, this.sfxVolume, DEFAULT_SFX_VOLUME)
      ],
      [
        this.ambienceGain,
        scaledGain(
          BASE_AMBIENCE_GAIN,
          this.musicVolume,
          DEFAULT_MUSIC_VOLUME
        )
      ],
      [
        this.rewardGain,
        scaledGain(BASE_REWARD_GAIN, this.sfxVolume, DEFAULT_SFX_VOLUME)
      ]
    ];

    for (const [node, target] of targets) {
      if (!node?.gain) continue;

      node.gain.cancelScheduledValues(now);

      if (duration <= 0) {
        node.gain.setValueAtTime(target, now);
        continue;
      }

      node.gain.setValueAtTime(node.gain.value, now);
      node.gain.linearRampToValueAtTime(target, now + duration);
    }
  }

  setMusicVolume(value) {
    this.musicVolume = clamp(Number(value) || 0, 0, 1);

    if (this.musicVolume > 0) {
      this.lastNonZeroMusicVolume = this.musicVolume;
    }

    safeWriteVolume(
      this.storage,
      AUDIO_MUSIC_VOLUME_STORAGE_KEY,
      this.musicVolume
    );
    this.syncMutedState();
    this.applyVolumeGains();

    return this.musicVolume;
  }

  setSfxVolume(value) {
    this.sfxVolume = clamp(Number(value) || 0, 0, 1);

    if (this.sfxVolume > 0) {
      this.lastNonZeroSfxVolume = this.sfxVolume;
    }

    safeWriteVolume(
      this.storage,
      AUDIO_SFX_VOLUME_STORAGE_KEY,
      this.sfxVolume
    );
    this.syncMutedState();
    this.applyVolumeGains();

    return this.sfxVolume;
  }

  setMuted(muted) {
    const shouldMute = Boolean(muted);

    if (shouldMute) {
      if (this.musicVolume > 0) {
        this.lastNonZeroMusicVolume = this.musicVolume;
      }

      if (this.sfxVolume > 0) {
        this.lastNonZeroSfxVolume = this.sfxVolume;
      }

      this.musicVolume = 0;
      this.sfxVolume = 0;
    } else if (this.musicVolume <= 0 && this.sfxVolume <= 0) {
      this.musicVolume =
        this.lastNonZeroMusicVolume || DEFAULT_MUSIC_VOLUME;
      this.sfxVolume =
        this.lastNonZeroSfxVolume || DEFAULT_SFX_VOLUME;
    }

    safeWriteVolume(
      this.storage,
      AUDIO_MUSIC_VOLUME_STORAGE_KEY,
      this.musicVolume
    );
    safeWriteVolume(
      this.storage,
      AUDIO_SFX_VOLUME_STORAGE_KEY,
      this.sfxVolume
    );
    this.syncMutedState();
    this.applyVolumeGains();

    return this.muted;
  }

  toggleMuted() {
    return this.setMuted(!this.isMuted());
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

    this.muteButton.textContent = this.isMuted() ? '🔇' : '🔊';
    this.muteButton.title = this.isMuted() ? '开启声音' : '关闭声音';
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

  loadClearSweep() {
    const context = this.ensureContext();

    if (!context) return Promise.resolve(null);
    if (this.clearSweepBuffer) return Promise.resolve(this.clearSweepBuffer);
    if (this.clearSweepLoadPromise) return this.clearSweepLoadPromise;

    const promise = (async () => {
      const baseUrl =
        typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
          ? import.meta.env.BASE_URL
          : '/';
      const url = `${baseUrl}${CLEAR_SWEEP_AUDIO_PATH}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load clear sweep audio: ${url}`);
      }

      const bytes = await response.arrayBuffer();
      const buffer = await context.decodeAudioData(bytes.slice(0));
      this.clearSweepBuffer = buffer;

      return buffer;
    })()
      .catch((error) => {
        console.warn('Clear sweep audio preload failed', error);
        return null;
      })
      .finally(() => {
        this.clearSweepLoadPromise = null;
      });

    this.clearSweepLoadPromise = promise;
    return promise;
  }

  preloadClearSweep() {
    return this.loadClearSweep();
  }

  stopClearSweepSource({ immediate = false } = {}) {
    const context = this.context;
    const source = this.clearSweepSource;
    const gain = this.clearSweepGain;

    this.clearSweepSource = null;
    this.clearSweepGain = null;

    if (!source) return;

    try {
      if (!immediate && context && gain) {
        const now = context.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
        source.stop(now + 0.025);
      } else {
        source.stop();
      }
    } catch {
      // Source may already have ended naturally.
    }
  }

  beginClearSweep({ cleared = 0, combo = 1 } = {}) {
    if (this.muted) return;

    const context = this.ensureContext();
    if (!context || context.state === 'suspended') return;

    this.stopClearSweepSource({ immediate: true });

    this.clearSweepIntensity = getClearSoundIntensity(cleared, combo);
    this.clearSweepLastBucket = -1;
    this.clearSweepCombo = Math.max(1, Number(combo) || 1);

    const buffer = this.clearSweepBuffer;

    if (!buffer) {
      // The asset is preloaded at startup. If the first clear beats the network,
      // keep loading it for the next clear rather than starting the rhythm late.
      this.preloadClearSweep();
      return;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    const intensity = clamp(this.clearSweepIntensity, 0.55, 1.08);

    source.buffer = buffer;
    gain.gain.value = 0.34 * intensity;

    source.connect(gain);
    gain.connect(this.sfxGain);

    this.clearSweepSource = source;
    this.clearSweepGain = gain;

    source.onended = () => {
      if (this.clearSweepSource === source) {
        this.clearSweepSource = null;
        this.clearSweepGain = null;
      }
    };

    source.start(context.currentTime);
  }

  updateClearSweep() {
    // The selected roulette clip already contains the dense rhythmic texture.
    // Keep this hook as a no-op so visual effects can continue reporting progress
    // without layering the old synthesized melody over the sample.
  }

  endClearSweep({ immediate = false } = {}) {
    // Normal clear completion must never truncate the roulette clip. The clear
    // animation is timed to the full sample, so let the source end naturally.
    // Only explicit interruption (home/restart/visibility) stops it immediately.
    if (immediate) {
      this.stopClearSweepSource({ immediate: true });
    }

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
