const WIDTH = 46;
const HEIGHT = 30;

function buildBananaRows() {
  const rows = [];

  // Build the banana around a curved center line rather than subtracting
  // two ellipses. This produces a thicker belly, tapered tips and a more
  // organic asymmetric silhouette.
  const centerline = [];

  for (let i = 0; i <= 100; i++) {
    const t = i / 100;

    const x =
      (1 - t) ** 2 * 5 +
      2 * (1 - t) * t * 22 +
      t ** 2 * 39;

    const y =
      (1 - t) ** 2 * 7 +
      2 * (1 - t) * t * 25 +
      t ** 2 * 9;

    const radius = 3 + 2.3 * Math.sin(Math.PI * t);

    centerline.push({ x, y, radius });
  }

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      let body = false;

      for (const point of centerline) {
        const dx = x - point.x;
        const dy = y - point.y;

        if (dx * dx + dy * dy <= point.radius * point.radius) {
          body = true;
          break;
        }
      }

      // Distinct short stalk on the right end.
      const stalk =
        (x >= 39 && x <= 41 && y >= 3 && y <= 10) ||
        (x >= 40 && x <= 42 && y >= 2 && y <= 5);

      // Round the left tip so it does not look like a crescent moon point.
      const leftTip =
        ((x - 4) / 2.8) ** 2 +
          ((y - 6) / 3.6) ** 2 <=
        1;

      row += body || stalk || leftTip ? '1' : '0';
    }

    rows.push(row);
  }

  return rows;
}

export const BANANA_TEMPLATE = {
  id: 'banana',
  name: '香蕉',
  width: WIDTH,
  height: HEIGHT,
  rows: buildBananaRows()
};
