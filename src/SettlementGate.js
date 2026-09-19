export class SettlementGate {
  constructor(requiredStableTicks = 3) {
    this.requiredStableTicks = Math.max(1, requiredStableTicks);
    this.active = false;
    this.stableTicks = 0;
  }

  begin() {
    this.active = true;
    this.stableTicks = 0;
  }

  reset() {
    this.active = false;
    this.stableTicks = 0;
  }

  isBlocking() {
    return this.active;
  }

  observe(movedCount) {
    if (!this.active) return false;

    if (movedCount === 0) {
      this.stableTicks += 1;
    } else {
      this.stableTicks = 0;
    }

    if (this.stableTicks >= this.requiredStableTicks) {
      this.active = false;
      return true;
    }

    return false;
  }
}
