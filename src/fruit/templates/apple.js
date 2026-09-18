const WIDTH = 31;
const HEIGHT = 30;

function buildAppleRows() {
  const rows = [];

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      const centralBody =
        ((x - 15) / 12.7) ** 2 +
          ((y - 17.2) / 11.6) ** 2 <=
        1;

      const leftShoulder =
        ((x - 10.2) / 8.6) ** 2 +
          ((y - 10.8) / 6.4) ** 2 <=
        1;

      const rightShoulder =
        ((x - 19.8) / 8.6) ** 2 +
          ((y - 10.8) / 6.4) ** 2 <=
        1;

      const topNotch =
        y <= 8 &&
        Math.abs(x - 15) <= 1.15 + Math.max(0, 8 - y) * 0.22;

      const stem = y <= 5 && x >= 15 && x <= 16;

      const leaf =
        ((x - 21.5) / 5.2) ** 2 +
          ((y - 4.1) / 2.3) ** 2 <=
        1 &&
        x >= 16;

      const body =
        (centralBody || leftShoulder || rightShoulder) && !topNotch;

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
