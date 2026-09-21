export const COLOR_MAP = {
  // Pastel palette calibrated for direct Canvas2D output so the game keeps
  // the softer appearance of the previous WebGL presentation.
  1: [255, 160, 164],
  2: [255, 207, 140],
  3: [255, 238, 134],
  4: [173, 231, 182],
  5: [150, 232, 227],
  6: [149, 202, 255],
  7: [205, 163, 243]
};

export const SETTLED_PARTICLE_INSET = 0.08;
export const SETTLED_PARTICLE_SIZE = 0.84;

export function getParticleRgb(x, y, type, boost = 0) {
  const rgb = COLOR_MAP[type];
  if (!rgb) return null;

  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const hash =
    ((ix * 73856093) ^ (iy * 19349663) ^ (type * 83492791)) >>> 0;
  const offset = (hash % 13) - 6;

  return [
    Math.max(0, Math.min(255, rgb[0] + offset + boost)),
    Math.max(0, Math.min(255, rgb[1] + offset + boost)),
    Math.max(0, Math.min(255, rgb[2] + offset + boost))
  ];
}

export function rgbToCss(rgb, alpha = 1) {
  if (!rgb) return `rgba(255,255,255,${alpha})`;

  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}
