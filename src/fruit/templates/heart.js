const WIDTH = 39;
const HEIGHT = 30;

function buildHeartRows() {
  const rows = [];

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      // Wider, fuller lobes keep the heart cute instead of tall and sharp.
      const leftLobe =
        ((x - 11.5) / 9.8) ** 2 +
          ((y - 9.5) / 8.3) ** 2 <=
        1;

      const rightLobe =
        ((x - 27.5) / 9.8) ** 2 +
          ((y - 9.5) / 8.3) ** 2 <=
        1;

      // The lower body tapers gently and ends with a broad rounded tip.
      const lowerDepth = Math.max(0, y - 9);
      const lowerHalfWidth = Math.max(
        2.5,
        18 - lowerDepth * 0.78
      );

      const lowerBody =
        y >= 8 &&
        y <= 28 &&
        Math.abs(x - 19.5) <= lowerHalfWidth;

      // Keep a soft, shallow cleft between the two upper lobes.
      const topNotch =
        y < 7 &&
        Math.abs(x - 19.5) <
          Math.max(0.8, 3.4 - y * 0.4);

      const body =
        (leftLobe || rightLobe || lowerBody) &&
        !topNotch;

      row += body ? '1' : '0';
    }

    rows.push(row);
  }

  return rows;
}

export const HEART_TEMPLATE = {
  id: 'heart',
  name: '爱心',
  width: WIDTH,
  height: HEIGHT,
  rows: buildHeartRows()
};
