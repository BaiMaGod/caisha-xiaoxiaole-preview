import { CanvasGame } from '../runtime/CanvasGame.js';
import { createWechatPlatform } from './wechat.js';

const game = new CanvasGame(createWechatPlatform({
  rewardedAdUnitId: __WECHAT_REWARDED_AD_UNIT_ID__,
  debugPerformance: __WECHAT_DEBUG_PERF__
}));
if (__WECHAT_DEBUG_PERF__) globalThis.__canvasGame = game;
