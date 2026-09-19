const RATING_NOTES = {
  GOOD: [523.25, 659.25],
  GREAT: [523.25, 659.25, 783.99],
  PERFECT: [587.33, 739.99, 880.0, 1174.66],
  UNBELIEVABLE: [659.25, 783.99, 987.77, 1318.51, 1567.98]
};

export class RewardAudio {
  constructor(element) {
    this.context = null;
    this.unlocked = false;
    this.voice = null;
    this.speechWarmed = false;

    const unlock = () => this.unlock();
    element.addEventListener('pointerdown', unlock, { passive: true });
    element.addEventListener('touchstart', unlock, { passive: true });

    this.loadVoice();
  }

  unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.context = new AudioContextClass();
      }
    }

    this.context?.resume?.();
    this.unlocked = true;

    // Warm the OS/browser TTS engine during the user's first gesture instead
    // of waiting until the reward animation has already finished.
    this.warmSpeech();
  }

  loadVoice() {
    if (
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      return;
    }

    const synth = window.speechSynthesis;

    const pickVoice = () => {
      const voices = synth.getVoices?.() ?? [];

      this.voice =
        voices.find((voice) => /^en-US$/i.test(voice.lang)) ??
        voices.find((voice) => /^en[-_]/i.test(voice.lang)) ??
        voices[0] ??
        null;
    };

    pickVoice();

    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', pickVoice);
    } else if ('onvoiceschanged' in synth) {
      synth.onvoiceschanged = pickVoice;
    }
  }

  warmSpeech() {
    if (
      this.speechWarmed ||
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      return;
    }

    const synth = window.speechSynthesis;
    this.loadVoice();

    const warmup = new SpeechSynthesisUtterance('.');
    warmup.lang = 'en-US';
    warmup.volume = 0;
    warmup.rate = 10;

    if (this.voice) {
      warmup.voice = this.voice;
    }

    this.speechWarmed = true;
    synth.speak(warmup);
  }

  play(rating, intensity = 1) {
    // Both are triggered synchronously in the same call made by the final
    // star-formation frame. The chime guarantees immediate audible feedback;
    // warmed TTS follows without the old cancel/restart delay.
    const chimeDone = this.playChime(rating, intensity);
    const speechDone = this.speakRating(rating);

    return Promise.all([chimeDone, speechDone]);
  }

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  playChime(rating, intensity) {
    if (!this.context) {
      this.unlock();
    }

    if (!this.context) {
      return Promise.resolve();
    }

    this.context.resume?.();

    const notes = RATING_NOTES[rating] ?? RATING_NOTES.GOOD;
    const now = this.context.currentTime;
    const gainScale = Math.min(1, 0.42 + intensity * 0.08);

    notes.forEach((frequency, index) => {
      const start = now + index * 0.075;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();

      oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12 * gainScale, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.23);

      oscillator.connect(gain);
      gain.connect(this.context.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.24);
    });

    const durationMs =
      Math.ceil(((notes.length - 1) * 0.075 + 0.24) * 1000) + 40;

    return new Promise((resolve) => {
      setTimeout(resolve, durationMs);
    });
  }

  speakRating(rating) {
    if (
      !('speechSynthesis' in window) ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      return Promise.resolve();
    }

    const synth = window.speechSynthesis;
    this.loadVoice();

    const phrase =
      rating === 'UNBELIEVABLE'
        ? 'Unbelievable!'
        : rating.charAt(0) + rating.slice(1).toLowerCase() + '!';

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(phrase);
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      utterance.lang = 'en-US';
      utterance.rate = rating === 'UNBELIEVABLE' ? 1.05 : 1.12;
      utterance.pitch =
        rating === 'PERFECT' || rating === 'UNBELIEVABLE'
          ? 1.25
          : 1.12;
      utterance.volume = 0.9;
      utterance.onend = finish;
      utterance.onerror = finish;

      if (this.voice) {
        utterance.voice = this.voice;
      }

      // Important: do not call cancel() here. Canceling immediately before
      // speak() makes some Chrome/Edge builds reinitialize TTS and introduces
      // the multi-second delay seen after the stars have already formed.
      synth.speak(utterance);

      // Safety only for broken engines that never dispatch onend/onerror.
      // This does not delay speech start and only affects when stars may fade.
      const watchdog = () => {
        if (settled) return;

        if (!synth.speaking && !synth.pending) {
          finish();
          return;
        }

        setTimeout(watchdog, 250);
      };

      setTimeout(watchdog, 4000);
    });
  }
}
