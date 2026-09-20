import { CLEAR_EFFECTS } from '../clear-effects/ClearEffectRegistry.js';
import { CONFIG } from '../config.js';

export class UnlockManager {
  constructor(
    progress,
    {
      debugUnlockAll = CONFIG.DEBUG_UNLOCK_ALL_CLEAR_EFFECTS
    } = {}
  ) {
    this.progress = progress;
    this.debugUnlockAll = Boolean(debugUnlockAll);
  }

  checkAll() {
    const snapshot = this.progress.getSnapshot();
    const unlockedNow = [];

    for (const effect of CLEAR_EFFECTS) {
      if (this.progress.isUnlocked(effect.id)) continue;

      if (this.debugUnlockAll) {
        if (this.progress.unlock(effect.id, false)) {
          unlockedNow.push(effect);
        }
        continue;
      }

      const { type, value } = effect.unlock ?? {};

      let unlocked = false;

      if (type === 'default') {
        unlocked = true;
      } else if (type === 'score') {
        unlocked = snapshot.stats.bestScore >= value;
      } else if (type === 'total_clear') {
        unlocked = snapshot.stats.totalClearedParticles >= value;
      } else if (type === 'single_clear') {
        unlocked = snapshot.stats.maxSingleClear >= value;
      } else if (type === 'combo') {
        unlocked = snapshot.stats.maxCombo >= value;
      } else if (type === 'play_count') {
        unlocked = snapshot.stats.playCount >= value;
      }

      if (unlocked && this.progress.unlock(effect.id)) {
        unlockedNow.push(effect);
      }
    }

    return unlockedNow;
  }

  completeAd(effectId) {
    const effect = CLEAR_EFFECTS.find((item) => item.id === effectId);

    if (!effect || effect.unlock?.type !== 'ad') {
      return false;
    }

    const progress = this.progress.addAdProgress(effectId, 1);

    if (progress >= effect.unlock.value) {
      return this.progress.unlock(effectId);
    }

    return false;
  }
}
