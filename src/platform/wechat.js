export function createWechatPlatform({ rewardedAdUnitId = '', debugPerformance = false } = {}) {
  if (typeof wx === 'undefined') throw new Error('WeChat mini-game runtime is unavailable');
  // The first wx.createCanvas() is the on-screen canvas. Create it before any
  // logical/artwork/effect canvas.
  const canvas = wx.createCanvas();
  const sounds = new Map();
  let rewardedAd = null;
  let adPromise = null;
  wx.showShareMenu?.({ withShareTicket: false });
  wx.onShareAppMessage?.(() => ({ title: '七彩沙画消除' }));

  function screenInfo() {
    const info = wx.getWindowInfo?.() ?? wx.getSystemInfoSync();
    const menu = wx.getMenuButtonBoundingClientRect?.();
    const safeTop = Number(menu?.bottom) > 0
      ? menu.bottom + 8
      : Number(info.statusBarHeight) > 0
        ? info.statusBarHeight + 44
        : 70;
    return {
      width: info.windowWidth || info.screenWidth,
      height: info.windowHeight || info.screenHeight,
      dpr: info.pixelRatio || 1,
      safeTop
    };
  }

  function exportImage(source) {
    if (typeof source.toTempFilePathSync === 'function') {
      try {
        return Promise.resolve(source.toTempFilePathSync({
          destWidth: source.width,
          destHeight: source.height
        }));
      } catch {
        // Some runtime versions expose the sync method but only export via
        // the callback API for an off-screen canvas.
      }
    }
    return new Promise((resolve, reject) => source.toTempFilePath({
      destWidth: source.width,
      destHeight: source.height,
      success: ({ tempFilePath }) => resolve(tempFilePath),
      fail: reject
    }));
  }

  return {
    kind: 'wechat',
    debugPerformance,
    rewardedAdAvailable: Boolean(rewardedAdUnitId && wx.createRewardedVideoAd),
    canvas,
    storage: {
      getItem(key) { return wx.getStorageSync(key) || null; },
      setItem(key, value) { wx.setStorageSync(key, value); }
    },
    getScreenInfo: screenInfo,
    createOffscreenCanvas: () => wx.createCanvas(),
    loadImage(path) {
      const image = wx.createImage();
      image.src = path;
      return image;
    },
    onInput(handler) {
      const bind = (type) => (event) => {
        const touch = event.changedTouches?.[0] ?? event.touches?.[0];
        if (touch) handler({ type, x: touch.clientX, y: touch.clientY });
      };
      wx.onTouchStart(bind('start'));
      wx.onTouchMove(bind('move'));
      wx.onTouchEnd(bind('end'));
      wx.onTouchCancel(bind('cancel'));
    },
    onResize(handler) { wx.onWindowResize?.(handler); },
    onVisibility(handler) {
      wx.onShow(() => handler(true));
      wx.onHide(() => handler(false));
    },
    requestFrame(handler) {
      if (canvas.requestAnimationFrame) return canvas.requestAnimationFrame(handler);
      if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(handler);
      return setTimeout(() => handler(Date.now()), 16);
    },
    playSound(path) {
      try {
        let audio = sounds.get(path);
        if (!audio) {
          audio = wx.createInnerAudioContext();
          audio.src = path;
          sounds.set(path, audio);
        }
        audio.stop();
        audio.play();
      } catch (error) {
        console.warn('Audio playback failed', error);
      }
    },
    stopSounds() {
      for (const audio of sounds.values()) {
        try { audio.stop(); } catch {}
      }
    },
    async saveCanvas(source) {
      const filePath = await exportImage(source);
      return new Promise((resolve, reject) => wx.saveImageToPhotosAlbum({
        filePath, success: resolve, fail: reject
      }));
    },
    async shareCanvas(source, title) {
      const imageUrl = await exportImage(source);
      wx.shareAppMessage({ title, imageUrl });
      return '已打开分享';
    },
    async showRewardedAd() {
      if (!rewardedAdUnitId || !wx.createRewardedVideoAd) return false;
      if (adPromise) return adPromise;
      if (!rewardedAd) rewardedAd = wx.createRewardedVideoAd({ adUnitId: rewardedAdUnitId });
      adPromise = new Promise((resolve) => {
        let settled = false;
        const finish = (completed) => {
          if (settled) return;
          settled = true;
          rewardedAd.offClose?.(close);
          rewardedAd.offError?.(failed);
          resolve(completed);
        };
        const close = (result) => {
          finish(result?.isEnded === true);
        };
        const failed = () => finish(false);
        rewardedAd.onClose(close);
        rewardedAd.onError?.(failed);
        Promise.resolve()
          .then(() => rewardedAd.show())
          .catch(() => rewardedAd.load().then(() => rewardedAd.show()))
          .catch(failed);
      });
      try { return await adPromise; }
      finally { adPromise = null; }
    }
  };
}
