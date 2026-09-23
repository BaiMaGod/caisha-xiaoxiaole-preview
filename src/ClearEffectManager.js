import { DefaultJumpEffect } from './clear-effects/effects/DefaultJumpEffect.js';
import { WindDissolveEffect } from './clear-effects/effects/WindDissolveEffect.js';
import {
  CLEAR_EFFECT_IDS,
  getImplementedClearEffect
} from './clear-effects/ClearEffectRegistry.js';

export {
  CLEAR_EFFECT_TOTAL_MS,
  CLEAR_FADE_MS,
  CLEAR_FADE_START_MS,
  CLEAR_FLASH_MS,
  CLEAR_JUMP_PARTICLE_INSET,
  CLEAR_JUMP_PARTICLE_SIZE,
  CLEAR_RANDOM_AHEAD_COLUMNS,
  CLEAR_RESTORE_MS,
  getClearBounds,
  getClearEffectTiming,
  getClearedParticleCount,
  getClearRating,
  getClearWaveFrontX,
  getClearWaveProgress,
  getDominantClearColor,
  getJumpClearProbability,
  getParticleClearRandom,
  getScoreAnchor,
  getScoreBounce,
  isParticleJumpCleared
} from './clear-effects/effects/DefaultJumpEffect.js';

export class ClearEffectManager {
  constructor(
    container,
    grid,
    sourceCanvas = null,
    { getEffectId = () => CLEAR_EFFECT_IDS.DEFAULT } = {}
  ) {
    this.getEffectId = getEffectId;
    this.activeEffectId = null;

    this.effects = new Map([
      [
        CLEAR_EFFECT_IDS.DEFAULT,
        new DefaultJumpEffect(container, grid, sourceCanvas)
      ],
      [
        CLEAR_EFFECT_IDS.WIND,
        new WindDissolveEffect(container, grid, sourceCanvas)
      ]
    ]);
  }

  resolveEffectId() {
    return getImplementedClearEffect(this.getEffectId?.()).id;
  }

  play(payload, startRewardAudio = null) {
    const effectId = this.resolveEffectId();
    const renderer =
      this.effects.get(effectId) ??
      this.effects.get(CLEAR_EFFECT_IDS.DEFAULT);

    for (const [id, effect] of this.effects) {
      if (id !== effectId) effect.clear();
    }

    this.activeEffectId = effectId;
    renderer.play(payload, startRewardAudio);
  }

  isBusy() {
    if (!this.activeEffectId) return false;
    return Boolean(this.effects.get(this.activeEffectId)?.isBusy());
  }

  clear() {
    for (const effect of this.effects.values()) {
      effect.clear();
    }

    this.activeEffectId = null;
  }
}
