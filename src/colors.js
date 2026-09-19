export const COLOR_MAP = {
  1: [255, 90, 95],
  2: [255, 159, 67],
  3: [255, 217, 61],
  4: [107, 203, 119],
  5: [78, 205, 196],
  6: [77, 150, 255],
  7: [155, 93, 229]
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
