const VOICE_ASSET_VERSION = '20261007b';

const VOICE_CLIPS = {
  GOOD: `audio/reward-good.mp3?v=${VOICE_ASSET_VERSION}`,
  GREAT: `audio/reward-great.mp3?v=${VOICE_ASSET_VERSION}`,
  AMAZING: `audio/reward-amazing.mp3?v=${VOICE_ASSET_VERSION}`,
  PERFECT: `audio/reward-perfect.mp3?v=${VOICE_ASSET_VERSION}`,
  UNBELIEVABLE: `audio/reward-unbelievable.mp3?v=${VOICE_ASSET_VERSION}`
};

export { VOICE_ASSET_VERSION, VOICE_CLIPS };

export function getRewardVoicePath(rating) {
  return VOICE_CLIPS[rating] ?? VOICE_CLIPS.GOOD;
}
