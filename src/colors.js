export const COLOR_MAP = {
  // Keep the original linear-space palette used by the Three.js version.
  // Canvas2D display conversion happens only after per-particle variation and
  // active-fruit boost have been applied, matching the old WebGL pipeline.
  1: [255, 90, 95],
  2: [255, 159, 67],
  3: [255, 217, 61],
  4: [107, 203, 119],
  5: [78, 205, 196],
  6: [77, 150, 255],
  7: [155, 93, 229]
};

// Settled grains are slightly larger than before to reduce visible grid seams
// while preserving a centered air gap around each logical cell.
export const SETTLED_PARTICLE_INSET = 0.05;
export const SETTLED_PARTICLE_SIZE = 0.90;

function clampByte(value) {
  return Math.max(0, Math.min(255, value));
}

export function linearToSrgbByte(channel) {
  const linear = clampByte(channel) / 255;
  const srgb =
    linear <= 0.0031308
      ? linear * 12.92
      : 1.055 * linear ** (1 / 2.4) - 0.055;

  return Math.round(clampByte(srgb * 255));
}

export function getDisplayColorRgb(type, boost = 0) {
  const rgb = COLOR_MAP[type];
  if (!rgb) return null;

  return [
    linearToSrgbByte(rgb[0] + boost),
    linearToSrgbByte(rgb[1] + boost),
    linearToSrgbByte(rgb[2] + boost)
  ];
}

export function getParticleRgb(x, y, type, boost = 0) {
  const rgb = COLOR_MAP[type];
  if (!rgb) return null;

  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const hash =
    ((ix * 73856093) ^ (iy * 19349663) ^ (type * 83492791)) >>> 0;
  const offset = (hash % 13) - 6;

  return [
    linearToSrgbByte(rgb[0] + offset + boost),
    linearToSrgbByte(rgb[1] + offset + boost),
    linearToSrgbByte(rgb[2] + offset + boost)
  ];
}

export function rgbToCss(rgb, alpha = 1) {
  if (!rgb) return `rgba(255,255,255,${alpha})`;

  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}
