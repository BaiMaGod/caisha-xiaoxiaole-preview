import {
  CLEAR_EFFECT_IDS,
  getClearEffectDefinition
} from '../clear-effects/ClearEffectRegistry.js';

export const PLAYER_PROGRESS_STORAGE_KEY = 'caisha-player-progress-v1';

function createDefaultState() {
  return {
    version: 1,
    selectedClearEffect: CLEAR_EFFECT_IDS.DEFAULT,
    unlockedClearEffects: [CLEAR_EFFECT_IDS.DEFAULT],
    newClearEffects: [],
    adUnlockProgress: {},
    stats: {
      bestScore: 0,
      totalClearedParticles: 0,
      maxSingleClear: 0,
      maxCombo: 0,
      playCount: 0
    }
  };
}

function safeNumber(value) {
  return Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
}

export class PlayerProgress {
  constructor(storage = globalThis.localStorage ?? null) {
    this.storage = storage;
    this.listeners = new Set();
    this.state = this.load();
  }

  load() {
    const fallback = createDefaultState();

    if (!this.storage) return fallback;

    try {
      const raw = this.storage.getItem(PLAYER_PROGRESS_STORAGE_KEY);
      if (!raw) return fallback;

      const parsed = JSON.parse(raw);
      const unlocked = Array.isArray(parsed.unlockedClearEffects)
        ? [...new Set(parsed.unlockedClearEffects)]
        : [];

      if (!unlocked.includes(CLEAR_EFFECT_IDS.DEFAULT)) {
        unlocked.unshift(CLEAR_EFFECT_IDS.DEFAULT);
      }

      const selectedDefinition = getClearEffectDefinition(
        parsed.selectedClearEffect
      );
      const selected =
        unlocked.includes(selectedDefinition.id) && selectedDefinition.implemented
          ? selectedDefinition.id
          : CLEAR_EFFECT_IDS.DEFAULT;

      return {
        ...fallback,
        ...parsed,
        selectedClearEffect: selected,
        unlockedClearEffects: unlocked,
        newClearEffects: Array.isArray(parsed.newClearEffects)
          ? parsed.newClearEffects.filter((id) => unlocked.includes(id))
          : [],
        adUnlockProgress: {
          ...fallback.adUnlockProgress,
          ...(parsed.adUnlockProgress ?? {})
        },
        stats: {
          bestScore: safeNumber(parsed.stats?.bestScore),
          totalClearedParticles: safeNumber(
            parsed.stats?.totalClearedParticles
          ),
          maxSingleClear: safeNumber(parsed.stats?.maxSingleClear),
          maxCombo: safeNumber(parsed.stats?.maxCombo),
          playCount: safeNumber(parsed.stats?.playCount)
        }
      };
    } catch {
      return fallback;
    }
  }

  save() {
    try {
      this.storage?.setItem(
        PLAYER_PROGRESS_STORAGE_KEY,
        JSON.stringify(this.state)
      );
    } catch {
      // Storage failure must not interrupt gameplay.
    }

    for (const listener of this.listeners) {
      listener(this.getSnapshot());
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSnapshot() {
    return JSON.parse(JSON.stringify(this.state));
  }

  getSelectedEffectId() {
    return this.state.selectedClearEffect;
  }

  isUnlocked(effectId) {
    return this.state.unlockedClearEffects.includes(effectId);
  }

  unlock(effectId, markNew = true) {
    if (this.isUnlocked(effectId)) return false;

    this.state.unlockedClearEffects.push(effectId);

    if (markNew && !this.state.newClearEffects.includes(effectId)) {
      this.state.newClearEffects.push(effectId);
    }

    this.save();
    return true;
  }

  markSeen(effectId) {
    const before = this.state.newClearEffects.length;
    this.state.newClearEffects = this.state.newClearEffects.filter(
      (id) => id !== effectId
    );

    if (this.state.newClearEffects.length !== before) {
      this.save();
    }
  }

  selectEffect(effectId) {
    const definition = getClearEffectDefinition(effectId);

    if (!definition.implemented || !this.isUnlocked(effectId)) {
      return false;
    }

    this.state.selectedClearEffect = effectId;
    this.markSeen(effectId);
    this.save();
    return true;
  }

  addAdProgress(effectId, amount = 1) {
    const current = safeNumber(this.state.adUnlockProgress[effectId]);
    this.state.adUnlockProgress[effectId] = current + Math.max(0, amount);
    this.save();
    return this.state.adUnlockProgress[effectId];
  }

  recordClear({ cleared, score, combo }) {
    const stats = this.state.stats;
    stats.bestScore = Math.max(stats.bestScore, safeNumber(score));
    stats.totalClearedParticles += safeNumber(cleared);
    stats.maxSingleClear = Math.max(stats.maxSingleClear, safeNumber(cleared));
    stats.maxCombo = Math.max(stats.maxCombo, safeNumber(combo));
    this.save();
  }

  recordGameOver(score) {
    const stats = this.state.stats;
    stats.bestScore = Math.max(stats.bestScore, safeNumber(score));
    stats.playCount += 1;
    this.save();
  }
}
