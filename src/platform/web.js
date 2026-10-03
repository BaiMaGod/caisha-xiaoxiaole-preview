export function createWebPlatform(canvas) {
  const sounds = new Map();
  const storage = {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value)
  };

  return {
    kind: 'web',
    rewardedAdAvailable: false,
    canvas,
    storage,
    getScreenInfo: () => ({
      width: canvas.getBoundingClientRect().width || innerWidth,
      height: canvas.getBoundingClientRect().height || innerHeight,
      dpr: devicePixelRatio || 1
    }),
    createOffscreenCanvas: () => document.createElement('canvas'),
    loadImage(path) {
      const image = new Image();
      image.src = `${import.meta.env.BASE_URL}${path}`;
      return image;
    },
    onInput(handler) {
      canvas.style.touchAction = 'none';
      for (const [name, type] of [
        ['pointerdown', 'start'],
        ['pointermove', 'move'],
        ['pointerup', 'end'],
        ['pointercancel', 'cancel']
      ]) {
        canvas.addEventListener(name, (event) => {
          if (type === 'start') canvas.setPointerCapture?.(event.pointerId);
          const rect = canvas.getBoundingClientRect();
          handler({ type, x: event.clientX - rect.left, y: event.clientY - rect.top });
        });
      }
    },
    onResize(handler) { window.addEventListener('resize', handler); },
    onVisibility(handler) {
      document.addEventListener('visibilitychange', () => handler(!document.hidden));
    },
    requestFrame(handler) { return requestAnimationFrame(handler); },
    playSound(path) {
      let audio = sounds.get(path);
      if (!audio) {
        audio = new Audio(`${import.meta.env.BASE_URL}${path}`);
        sounds.set(path, audio);
      }
      audio.currentTime = 0;
      audio.play().catch(() => {});
    },
    stopSounds() {
      for (const audio of sounds.values()) audio.pause();
    },
    async saveCanvas(source) {
      const blob = await new Promise((resolve, reject) =>
        source.toBlob((value) => value ? resolve(value) : reject(new Error('图片生成失败')))
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `七彩沙画消除-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    async shareCanvas(source, title) {
      const blob = await new Promise((resolve, reject) =>
        source.toBlob((value) => value ? resolve(value) : reject(new Error('图片生成失败')))
      );
      const file = new File([blob], '七彩沙画.png', { type: 'image/png' });
      if (!navigator.share || (navigator.canShare && !navigator.canShare({ files: [file] }))) {
        await this.saveCanvas(source);
        return '已下载分享图';
      }
      await navigator.share({ title, files: [file] });
      return '已打开分享';
    },
    async showRewardedAd() { return false; }
  };
}
