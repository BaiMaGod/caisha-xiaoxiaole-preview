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
    this.playChime(rating, intensity);
    this.speakRating(rating);
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

    if (!this.context) return;

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
  }

  speakRating(rating) {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      rating === 'UNBELIEVABLE'
        ? 'Unbelievable!'
        : rating.charAt(0) + rating.slice(1).toLowerCase() + '!'
    );

    utterance.lang = 'en-US';
    utterance.rate = rating === 'UNBELIEVABLE' ? 1.05 : 1.12;
    utterance.pitch = rating === 'PERFECT' || rating === 'UNBELIEVABLE' ? 1.25 : 1.12;
    utterance.volume = 0.86;

    window.speechSynthesis.speak(utterance);
  }
}
