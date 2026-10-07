const VOICE_CLIPS = {
  GOOD: 'audio/reward-good.mp3',
  GREAT: 'audio/reward-great.mp3',
  AMAZING: 'audio/reward-amazing.mp3',
  PERFECT: 'audio/reward-perfect.mp3',
  UNBELIEVABLE: 'audio/reward-unbelievable.mp3'
};

export { VOICE_CLIPS };

export function getRewardVoicePath(rating) {
  return VOICE_CLIPS[rating] ?? VOICE_CLIPS.GOOD;
}
