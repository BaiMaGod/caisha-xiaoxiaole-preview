import { VOICE_CLIPS } from './RewardVoicePaths.js';
export { getRewardVoicePath } from './RewardVoicePaths.js';

const RATING_STYLES = {
  GOOD: {
    notes: [659.25, 783.99, 987.77],
    gaps: [0, 0.075, 0.155],
    voiceRate: 1.02,
    detune: 40,
    sparkle: 1400
  },
  GREAT: {
    notes: [659.25, 830.61, 987.77, 1244.51],
    gaps: [0, 0.065, 0.135, 0.215],
    voiceRate: 1.035,
    detune: 65,
    sparkle: 1580
  },
  PERFECT: {
    notes: [698.46, 880, 1046.5, 1244.51, 1396.91],
    gaps: [0, 0.06, 0.125, 0.195, 0.275],
    voiceRate: 1.05,
    detune: 90,
    sparkle: 1820
  },
  UNBELIEVABLE: {
    notes: [783.99, 987.77, 1174.66, 1396.91, 1661.22, 1975.53],
    gaps: [0, 0.055, 0.115, 0.18, 0.255, 0.345],
    voiceRate: 1.065,
    detune: 115,
    sparkle: 2100
  }
};

export function getRewardSoundStyle(rating) {
  return RATING_STYLES[rating] ?? RATING_STYLES.GOOD;
}

export class RewardAudio {
  constructor(
    element,
    {
      context = null,
      destination = null,
      autoUnlock = true
    } = {}
  ) {
    this.context = context;
    this.destination = destination;
    this.voiceBuffers = new Map();
    this.voiceLoadPromises = new Map();
    this.activeVoiceSources = new Set();
    this.activeOscillators = new Set();

    this.ensureContext();
    this.preloadVoices();

    if (autoUnlock && element) {
      const unlock = () => this.unlock();
      element.addEventListener('pointerdown', unlock, { passive: true });
      element.addEventListener('touchstart', unlock, { passive: true });
    }
  }

  ensureContext() {
    if (this.context) return this.context;
    if (typeof window === 'undefined') return null;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    this.context = new AudioContextClass();
    return this.context;
  }

  getDestination() {
    const context = this.ensureContext();
    return this.destination ?? context?.destination ?? null;
  }

  unlock() {
    const context = this.ensureContext();
    context?.resume?.();
    this.preloadVoices();
  }

  loadVoice(rating, relativePath) {
    const context = this.ensureContext();

    if (!context) {
      return Promise.resolve(null);
    }

    if (this.voiceBuffers.has(rating)) {
      return Promise.resolve(this.voiceBuffers.get(rating));
    }

    if (this.voiceLoadPromises.has(rating)) {
      return this.voiceLoadPromises.get(rating);
    }

    const promise = (async () => {
      const baseUrl =
        typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
          ? import.meta.env.BASE_URL
          : '/';
      const url = `${baseUrl}${relativePath}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load reward voice: ${url}`);
      }

      const bytes = await response.arrayBuffer();
      const buffer = await context.decodeAudioData(bytes.slice(0));
      this.voiceBuffers.set(rating, buffer);
      return buffer;
    })()
      .catch((error) => {
        console.warn('Reward voice preload failed', rating, error);
        return null;
      })
      .finally(() => {
        this.voiceLoadPromises.delete(rating);
      });

    this.voiceLoadPromises.set(rating, promise);
    return promise;
  }

  preloadVoices() {
    return Promise.allSettled(
      Object.entries(VOICE_CLIPS).map(([rating, relativePath]) =>
        this.loadVoice(rating, relativePath)
      )
    );
  }

  play(rating, intensity = 1) {
    const context = this.ensureContext();

    if (!context) {
      return Promise.resolve();
    }

    context.resume?.();

    const cuteFxDone = this.playCuteArcadeFx(rating, intensity);
    const voiceDone = this.playCuteVoice(rating);

    return Promise.all([cuteFxDone, voiceDone]);
  }

  stop() {
    for (const source of this.activeVoiceSources) {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
    }

    for (const oscillator of this.activeOscillators) {
      try {
        oscillator.stop();
      } catch {
        // Already stopped.
      }
    }

    this.activeVoiceSources.clear();
    this.activeOscillators.clear();
  }

  playCuteVoice(rating) {
    const context = this.ensureContext();
    const destination = this.getDestination();

    if (!context || !destination) {
      return Promise.resolve();
    }

    const buffer =
      this.voiceBuffers.get(rating) ??
      this.voiceBuffers.get('GOOD');

    // Do not start a voice late after the visual reward has already finished.
    // Missing voices keep loading for the next clear and the synth reward still plays.
    if (!buffer) {
      this.preloadVoices();
      return Promise.resolve();
    }

    const style = getRewardSoundStyle(rating);

    return new Promise((resolve) => {
      const source = context.createBufferSource();
      const voiceGain = context.createGain();
      const filter = context.createBiquadFilter();

      source.buffer = buffer;
      source.playbackRate.value = style.voiceRate;

      if ('detune' in source) {
        source.detune.value = style.detune;
      }

      filter.type = 'highshelf';
      filter.frequency.value = 3200;
      filter.gain.value = -3;

      voiceGain.gain.value = 0.48;

      source.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(destination);

      this.activeVoiceSources.add(source);

      source.onended = () => {
        this.activeVoiceSources.delete(source);
        resolve();
      };

      source.start(0);
    });
  }

  playCuteArcadeFx(rating, intensity) {
    const context = this.ensureContext();

    if (!context) {
      return Promise.resolve();
    }

    const style = getRewardSoundStyle(rating);
    const now = context.currentTime;
    const scale = Math.min(1.08, 0.7 + intensity * 0.07);

    this.scheduleTone({
      start: now,
      frequency: 320,
      endFrequency: 470,
      duration: 0.1,
      peak: 0.07 * scale,
      type: 'sine'
    });

    style.notes.forEach((frequency, index) => {
      this.scheduleTone({
        start: now + style.gaps[index],
        frequency,
        endFrequency: Math.min(2200, frequency * 1.035),
        duration: 0.18,
        peak: (0.052 + index * 0.005) * scale,
        type: index % 2 === 0 ? 'sine' : 'triangle'
      });
    });

    const sparkleStart =
      now + style.gaps[style.gaps.length - 1] + 0.085;

    this.scheduleTone({
      start: sparkleStart,
      frequency: style.sparkle,
      endFrequency: Math.min(2350, style.sparkle * 1.1),
      duration: 0.15,
      peak: 0.044 * scale,
      type: 'sine'
    });

    this.scheduleTone({
      start: sparkleStart + 0.045,
      frequency: Math.min(2250, style.sparkle * 1.18),
      endFrequency: Math.min(2400, style.sparkle * 1.24),
      duration: 0.11,
      peak: 0.026 * scale,
      type: 'sine'
    });

    const durationMs =
      Math.ceil(
        (style.gaps[style.gaps.length - 1] + 0.3) * 1000
      );

    return new Promise((resolve) => {
      setTimeout(resolve, durationMs);
    });
  }

  scheduleTone({
    start,
    frequency,
    endFrequency,
    duration,
    peak,
    type
  }) {
    const context = this.ensureContext();
    const destination = this.getDestination();

    if (!context || !destination) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      start + duration
    );

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, peak),
      start + 0.012
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + duration
    );

    oscillator.connect(gain);
    gain.connect(destination);

    this.activeOscillators.add(oscillator);
    oscillator.onended = () => {
      this.activeOscillators.delete(oscillator);
    };

    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  }
}
