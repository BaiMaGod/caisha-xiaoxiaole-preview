export class BaseClearEffect {
  constructor() {
    this.effectId = 'base';
  }

  play() {
    throw new Error('Clear effect must implement play()');
  }

  isBusy() {
    return false;
  }

  clear() {}
}
