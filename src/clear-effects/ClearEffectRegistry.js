export const CLEAR_EFFECT_IDS = {
  DEFAULT: 'default_jump',
  WIND: 'wind_dissolve',
  STARLIGHT: 'starlight_fade',
  WATER: 'water_wave'
};

export const CLEAR_EFFECTS = [
  {
    id: CLEAR_EFFECT_IDS.DEFAULT,
    name: '彩沙跳消',
    icon: '✨',
    rarity: '普通',
    implemented: true,
    description: '彩沙沿波前从左向右随机跳跃消失。',
    unlock: { type: 'default', value: 0 }
  },
  {
    id: CLEAR_EFFECT_IDS.WIND,
    name: '风吹沙散',
    icon: '🌬️',
    rarity: '稀有',
    implemented: true,
    description: '一阵风掠过沙画，彩沙被卷向右上方并化成细尘。',
    unlock: { type: 'ad', value: 1 }
  },
  {
    id: CLEAR_EFFECT_IDS.STARLIGHT,
    name: '星光消融',
    icon: '✦',
    rarity: '稀有',
    implemented: false,
    description: '沙粒变成星点，闪烁后缓缓向上消融。',
    unlock: { type: 'score', value: 10000 }
  },
  {
    id: CLEAR_EFFECT_IDS.WATER,
    name: '水波冲刷',
    icon: '〰',
    rarity: '稀有',
    implemented: false,
    description: '透明水波从左向右扫过，将彩沙轻柔冲散。',
    unlock: { type: 'total_clear', value: 30000 }
  }
];

export function getClearEffectDefinition(id) {
  return CLEAR_EFFECTS.find((effect) => effect.id === id) ?? CLEAR_EFFECTS[0];
}

export function getImplementedClearEffect(id) {
  const effect = getClearEffectDefinition(id);
  return effect.implemented ? effect : CLEAR_EFFECTS[0];
}
