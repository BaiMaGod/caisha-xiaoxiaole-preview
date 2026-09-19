const RATING_STYLES = {
  GOOD: {
    notes: [659.25, 783.99, 987.77],
    gaps: [0, 0.075, 0.155],
    voiceRate: 1.08,
    detune: 120,
    sparkle: 1567.98
  },
  GREAT: {
    notes: [659.25, 830.61, 987.77, 1318.51],
    gaps: [0, 0.065, 0.135, 0.215],
    voiceRate: 1.1,
    detune: 165,
    sparkle: 1760
  },
  PERFECT: {
    notes: [698.46, 880, 1046.5, 1318.51, 1567.98],
    gaps: [0, 0.06, 0.125, 0.195, 0.275],
    voiceRate: 1.12,
    detune: 205,
    sparkle: 2093
  },
  UNBELIEVABLE: {
    notes: [783.99, 987.77, 1174.66, 1567.98, 1975.53, 2349.32],
    gaps: [0, 0.055, 0.115, 0.18, 0.255, 0.345],
    voiceRate: 1.14,
    detune: 250,
    sparkle: 2637.02
  }
};

const VOICE_CLIPS = {
  GOOD: 'audio/reward-good.mp3',
  GREAT: 'audio/reward-great.mp3',
  PERFECT: 'audio/reward-perfect.mp3',
  UNBELIEVABLE: 'audio/reward-unbelievable.mp3'
};

export function getRewardVoicePath(rating) {
  return VOICE_CLIPS[rating] ?? VOICE_CLIPS.GOOD;
}

export function getRewardSoundStyle(rating) {
  return RATING_STYLES[rating] ?? RATING_STYLES.GOOD;
}

export class RewardAudio {
  constructor(element) {
    this.context = null;
    this.voiceBuffers = new Map();
    this.voiceLoadPromise = null;
    this.activeVoiceSources = new Set();
    this.activeOscillators = new Set();

    this.ensureContext();
    this.preloadVoices();

    const unlock = () => this.unlock();
    element.addEventListener('pointerdown', unlock, { passive: true });
    element.addEventListener('touchstart', unlock, { passive: true });
  }

  ensureContext() {
    if (this.context) return this.context;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    this.context = new AudioContextClass();
    return this.context;
  }

  unlock() {
    const context = this.ensureContext();
    context?.resume?.();
    this.preloadVoices();
  }

  preloadVoices() {
    const context = this.ensureContext();

    if (!context || this.voiceLoadPromise) {
      return this.voiceLoadPromise;
    }

    this.voiceLoadPromise = Promise.all(
      Object.entries(VOICE_CLIPS).map(async ([rating, relativePath]) => {
        const url = `${import.meta.env.BASE_URL}${relativePath}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to load reward voice: ${url}`);
        }

        const bytes = await response.arrayBuffer();
        const buffer = await context.decodeAudioData(bytes.slice(0));
        this.voiceBuffers.set(rating, buffer);
      })
    ).catch((error) => {
      console.warn('Reward voice preload failed', error);
    });

    return this.voiceLoadPromise;
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

    if (!context) {
      return Promise.resolve();
    }

    const style = getRewardSoundStyle(rating);

    const startBuffer = () => {
      const buffer =
        this.voiceBuffers.get(rating) ??
        this.voiceBuffers.get('GOOD');

      if (!buffer) {
        return Promise.resolve();
      }

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
        filter.frequency.value = 2500;
        filter.gain.value = 2.5;

        voiceGain.gain.value = 0.72;

        source.connect(filter);
        filter.connect(voiceGain);
        voiceGain.connect(context.destination);

        this.activeVoiceSources.add(source);

        source.onended = () => {
          this.activeVoiceSources.delete(source);
          resolve();
        };

        // Still starts on the exact frame that the final star completes.
        source.start(0);
      });
    };

    if (this.voiceBuffers.has(rating)) {
      return startBuffer();
    }

    return Promise.resolve(this.preloadVoices()).then(startBuffer);
  }

  playCuteArcadeFx(rating, intensity) {
    const context = this.ensureContext();

    if (!context) {
      return Promise.resolve();
    }

    const style = getRewardSoundStyle(rating);
    const now = context.currentTime;
    const scale = Math.min(1.15, 0.78 + intensity * 0.08);

    // Soft "pop" at the exact reward moment.
    this.scheduleTone({
      start: now,
      frequency: 330,
      endFrequency: 520,
      duration: 0.11,
      peak: 0.12 * scale,
      type: 'sine'
    });

    // Rising, bouncy notes make the reward feel playful instead of formal.
    style.notes.forEach((frequency, index) => {
      this.scheduleTone({
        start: now + style.gaps[index],
        frequency,
        endFrequency: frequency * 1.045,
        duration: 0.19,
        peak: (0.085 + index * 0.008) * scale,
        type: index % 2 === 0 ? 'sine' : 'triangle'
      });
    });

    const sparkleStart =
      now + style.gaps[style.gaps.length - 1] + 0.085;

    this.scheduleTone({
      start: sparkleStart,
      frequency: style.sparkle,
      endFrequency: style.sparkle * 1.18,
      duration: 0.16,
      peak: 0.075 * scale,
      type: 'sine'
    });

    this.scheduleTone({
      start: sparkleStart + 0.045,
      frequency: style.sparkle * 1.5,
      endFrequency: style.sparkle * 1.62,
      duration: 0.12,
      peak: 0.045 * scale,
      type: 'sine'
    });

    const durationMs =
      Math.ceil(
        (style.gaps[style.gaps.length - 1] + 0.32) * 1000
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
    if (!context) return;

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
    gain.connect(context.destination);

    this.activeOscillators.add(oscillator);
    oscillator.onended = () => {
      this.activeOscillators.delete(oscillator);
    };

    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  }
}
