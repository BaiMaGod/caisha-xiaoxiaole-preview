const WIDTH = 37;
const HEIGHT = 34;

function buildHeartRows() {
  const rows = [];

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      const leftLobe =
        ((x - 11.5) / 8.8) ** 2 +
          ((y - 10.5) / 8.3) ** 2 <=
        1;

      const rightLobe =
        ((x - 25.5) / 8.8) ** 2 +
          ((y - 10.5) / 8.3) ** 2 <=
        1;

      const lowerDepth = Math.max(0, y - 9);
      const lowerHalfWidth = Math.max(
        0.5,
        17 - lowerDepth * 0.72
      );

      const lowerBody =
        y >= 8 &&
        y <= 32 &&
        Math.abs(x - 18.5) <= lowerHalfWidth;

      const topNotch =
        y < 8 &&
        Math.abs(x - 18.5) <
          3.2 - y * 0.25;

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
