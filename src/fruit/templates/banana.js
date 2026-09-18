const WIDTH = 44;
const HEIGHT = 26;

function buildBananaRows() {
  const rows = [];

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      const outer =
        ((x - 21.5) / 19.2) ** 2 +
          ((y - 12.8) / 10.2) ** 2 <=
        1;

      // Cut an ellipse from the upper half to create the banana crescent.
      const inner =
        ((x - 21.5) / 15.7) ** 2 +
          ((y - 7.7) / 7.6) ** 2 <=
        1;

      const leftTip =
        ((x - 3.7) / 3.1) ** 2 +
          ((y - 7.6) / 4.5) ** 2 <=
        1;

      const rightTip =
        ((x - 39.3) / 3.1) ** 2 +
          ((y - 7.1) / 4.7) ** 2 <=
        1;

      const crescent = outer && !inner;
      row += crescent || leftTip || rightTip ? '1' : '0';
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
