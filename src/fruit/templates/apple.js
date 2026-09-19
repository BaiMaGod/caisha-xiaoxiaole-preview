const WIDTH = 35;
const HEIGHT = 32;

function buildAppleRows() {
  const rows = [];

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      // Two upper lobes make the apple shoulders clearly readable.
      const leftShoulder =
        ((x - 11.8) / 9.6) ** 2 +
          ((y - 13.7) / 7.3) ** 2 <=
        1;

      const rightShoulder =
        ((x - 22.2) / 9.6) ** 2 +
          ((y - 13.7) / 7.3) ** 2 <=
        1;

      // A larger lower ellipse gives the fruit a full apple belly.
      const lowerBody =
        ((x - 17) / 13.5) ** 2 +
          ((y - 20.2) / 10.7) ** 2 <=
        1;

      let body = leftShoulder || rightShoulder || lowerBody;

      // Deep top cleft between the two shoulders.
      const topNotch =
        y <= 10 &&
        Math.abs(x - 17) <= 1.2 + Math.max(0, 10 - y) * 0.18;

      // Slight bottom cleft prevents the silhouette from reading as a ball.
      const bottomCleft =
        y >= 28 &&
        Math.abs(x - 17) <= (y - 27) * 0.8;

      body = body && !topNotch && !bottomCleft;

      // Short tilted stem.
      const stem =
        (x >= 13 && x <= 15 && y >= 1 && y <= 7) ||
        (x >= 14 && x <= 16 && y >= 0 && y <= 3);

      // Broad leaf leaning to the right.
      const leaf =
        ((x - 22.5) / 5.2) ** 2 +
          ((y - 4.2) / 2.4) ** 2 <=
          1 &&
        x >= 17;

      row += stem || leaf || body ? '1' : '0';
    }

    rows.push(row);
  }

  return rows;
}

export const APPLE_TEMPLATE = {
  id: 'apple',
  name: '苹果',
  width: WIDTH,
  height: HEIGHT,
  rows: buildAppleRows()
};
