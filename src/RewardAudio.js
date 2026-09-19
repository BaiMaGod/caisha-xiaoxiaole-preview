const RATING_NOTES = {
  GOOD: [523.25, 659.25],
  GREAT: [523.25, 659.25, 783.99],
  PERFECT: [587.33, 739.99, 880.0, 1174.66],
  UNBELIEVABLE: [659.25, 783.99, 987.77, 1318.51, 1567.98]
};

const SPEECH_FALLBACK_MS = {
  GOOD: 950,
  GREAT: 1050,
  PERFECT: 1250,
  UNBELIEVABLE: 1850
};

export class RewardAudio {
  constructor(element) {
    this.context = null;
    this.unlocked = false;

    const unlock = () => this.unlock();
    element.addEventListener('pointerdown', unlock, { passive: true });
    element.addEventListener('touchstart', unlock, { passive: true });
  }

  unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      this.context = new AudioContextClass();
    }

    this.context.resume?.();
    this.unlocked = true;
  }

  play(rating, intensity = 1) {
    return Promise.all([
      this.playChime(rating, intensity),
      this.speakRating(rating)
    ]);
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

    const durationMs = Math.ceil(((notes.length - 1) * 0.075 + 0.24) * 1000) + 40;

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

    window.speechSynthesis.cancel();

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
      utterance.volume = 0.86;
      utterance.onend = finish;
      utterance.onerror = finish;

      window.speechSynthesis.speak(utterance);

      setTimeout(finish, SPEECH_FALLBACK_MS[rating] ?? 1200);
    });
  }
}
