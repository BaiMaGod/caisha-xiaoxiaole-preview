import { RAINBOW_SCORE_COLORS } from './RainbowScore.js';

// The browser and Mini Game export the same artwork composition.
export function renderArtworkPoster({ createCanvas, artworkCanvas, score = 0, rating = 'GOOD' }) {
    const canvas = createCanvas();
    canvas.width = 1080;
    canvas.height = 1440;

    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#fffaf1');
    bg.addColorStop(0.55, '#f8ecdc');
    bg.addColorStop(1, '#efddca');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 240; i++) {
      const x = (i * 137.31) % canvas.width;
      const y = (i * 73.17) % canvas.height;
      const radius = 0.7 + (i % 4) * 0.25;
      ctx.globalAlpha = 0.08 + (i % 3) * 0.025;
      ctx.fillStyle = i % 2 ? '#78583f' : '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#75523a';
    ctx.font = '900 42px system-ui, sans-serif';
    ctx.fillText('七彩沙画消除', 540, 88);

    ctx.fillStyle = 'rgba(112,81,57,.56)';
    ctx.font = '800 21px system-ui, sans-serif';
    ctx.fillText('本局沙画完成', 540, 126);

    const frameX = 256;
    const frameY = 168;
    const frameW = 568;
    const frameH = 1010;
    const wood = ctx.createLinearGradient(frameX, frameY, frameX + frameW, frameY + frameH);
    wood.addColorStop(0, '#b97943');
    wood.addColorStop(0.32, '#e2ae71');
    wood.addColorStop(0.67, '#bd8049');
    wood.addColorStop(1, '#e7bb80');

    ctx.save();
    ctx.shadowColor = 'rgba(75,45,25,.22)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 18;
    ctx.fillStyle = wood;
    ctx.fillRect(frameX, frameY, frameW, frameH);
    ctx.restore();

    for (let i = 0; i < 28; i++) {
      const y = frameY + 11 + ((i * 41.7) % (frameH - 22));
      ctx.strokeStyle = i % 3 === 0
        ? 'rgba(88,49,23,.11)'
        : 'rgba(255,255,255,.09)';
      ctx.lineWidth = 1 + (i % 2);
      ctx.beginPath();
      ctx.moveTo(frameX + 8, y);
      ctx.bezierCurveTo(
        frameX + frameW * .32,
        y + ((i % 5) - 2) * 3,
        frameX + frameW * .72,
        y - ((i % 4) - 1) * 3,
        frameX + frameW - 8,
        y + ((i % 3) - 1) * 2
      );
      ctx.stroke();
    }

    const mat = 30;
    ctx.fillStyle = '#f8efdf';
    ctx.fillRect(
      frameX + mat,
      frameY + mat,
      frameW - mat * 2,
      frameH - mat * 2
    );

    const artPad = 22;
    const availableX = frameX + mat + artPad;
    const availableY = frameY + mat + artPad;
    const availableW = frameW - (mat + artPad) * 2;
    const availableH = frameH - (mat + artPad) * 2;

    let artW = availableW;
    let artH = artW * (16 / 9);

    if (artH > availableH) {
      artH = availableH;
      artW = artH * (9 / 16);
    }

    const artX = availableX + (availableW - artW) / 2;
    const artY = availableY + (availableH - artH) / 2;

    ctx.fillStyle = '#fff8ea';
    ctx.fillRect(artX, artY, artW, artH);

    if (artworkCanvas.width && artworkCanvas.height) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      try { ctx.filter = 'saturate(1.05) contrast(1.02)'; } catch {}
      ctx.drawImage(artworkCanvas, artX, artY, artW, artH);
      ctx.restore();
    }

    ctx.fillStyle = '#664832';
    ctx.font = '900 34px system-ui, sans-serif';
    ctx.fillText(
      '这一局，拼出了一幅不错的沙画',
      540,
      1243
    );

    ctx.fillStyle = 'rgba(93,70,50,.64)';
    ctx.font = '700 23px system-ui, sans-serif';
    ctx.fillText('分享给好友看看你的作品', 540, 1284);

    // Match the on-screen rainbow score in saved/shared artwork.
    ctx.font = '900 28px system-ui, sans-serif';
    const scoreText = Number(score).toLocaleString();
    const suffix = ` 分 · ${rating}`;
    const scoreWidth = ctx.measureText(scoreText).width;
    const suffixWidth = ctx.measureText(suffix).width;
    const startX = 540 - (scoreWidth + suffixWidth) / 2;
    const rainbow = ctx.createLinearGradient(startX, 0, startX + Math.max(1, scoreWidth), 0);
    RAINBOW_SCORE_COLORS.forEach((color, index) => {
      rainbow.addColorStop(index / (RAINBOW_SCORE_COLORS.length - 1), color);
    });
    ctx.textAlign = 'left';
    ctx.fillStyle = rainbow;
    ctx.fillText(scoreText, startX, 1339);
    ctx.fillStyle = '#78543a';
    ctx.fillText(suffix, startX + scoreWidth, 1339);
    ctx.textAlign = 'center';

    ctx.fillStyle = 'rgba(93,70,50,.42)';
    ctx.font = '700 18px system-ui, sans-serif';
    ctx.fillText('RAINBOW SAND ART', 540, 1386);

    return canvas;
}
