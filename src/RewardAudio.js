const RATING_NOTES = {
  GOOD: [523.25, 659.25],
  GREAT: [523.25, 659.25, 783.99],
  PERFECT: [587.33, 739.99, 880.0, 1174.66],
  UNBELIEVABLE: [659.25, 783.99, 987.77, 1318.51, 1567.98]
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

export class RewardAudio {
  constructor(element) {
    this.context = null;
    this.voiceBuffers = new Map();
    this.voiceLoadPromise = null;
    this.activeVoiceSources = new Set();

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

    // Both start from the same reward frame. The chime is immediate, while
    // the local voice clip is already decoded in memory in normal gameplay.
    const chimeDone = this.playChime(rating, intensity);
    const voiceDone = this.playVoice(rating);

    return Promise.all([chimeDone, voiceDone]);
  }

  stop() {
    for (const source of this.activeVoiceSources) {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
    }

    this.activeVoiceSources.clear();
  }

  playVoice(rating) {
    const context = this.ensureContext();

    if (!context) {
      return Promise.resolve();
    }

    const startBuffer = () => {
      const buffer =
        this.voiceBuffers.get(rating) ??
        this.voiceBuffers.get('GOOD');

      if (!buffer) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const source = context.createBufferSource();
        const gain = context.createGain();

        source.buffer = buffer;
        gain.gain.value = 1;

        source.connect(gain);
        gain.connect(context.destination);

        this.activeVoiceSources.add(source);

        source.onended = () => {
          this.activeVoiceSources.delete(source);
          resolve();
        };

        // No scheduled offset and no TTS engine: voice begins immediately.
        source.start(0);
      });
    };

    if (this.voiceBuffers.has(rating)) {
      return startBuffer();
    }

    return Promise.resolve(this.preloadVoices()).then(startBuffer);
  }

  playChime(rating, intensity) {
    const context = this.ensureContext();

    if (!context) {
      return Promise.resolve();
    }

    const notes = RATING_NOTES[rating] ?? RATING_NOTES.GOOD;
    const now = context.currentTime;
    const gainScale = Math.min(1, 0.58 + intensity * 0.1);

    notes.forEach((frequency, index) => {
      const start = now + index * 0.065;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18 * gainScale, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.23);
    });

    const durationMs =
      Math.ceil(((notes.length - 1) * 0.065 + 0.23) * 1000) + 30;

    return new Promise((resolve) => {
      setTimeout(resolve, durationMs);
    });
  }
}
