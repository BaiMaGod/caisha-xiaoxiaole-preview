const WIDTH = 25;
const HEIGHT = 50;

function buildSwordRows() {
  const rows = [];
  const centerX = (WIDTH - 1) / 2;

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      const dx = Math.abs(x - centerX);

      let blade = false;

      if (y <= 6) {
        blade = dx <= Math.max(0.5, y * 0.75);
      } else if (y <= 32) {
        blade = dx <= 3;
      } else if (y <= 34) {
        blade = dx <= 4;
      }

      const guard =
        y >= 33 &&
        y <= 36 &&
        dx <= 11;

      const grip =
        y >= 36 &&
        y <= 46 &&
        dx <= 2;

      const pommel =
        y >= 46 &&
        y <= 49 &&
        (dx / 4) ** 2 +
          ((y - 47.5) / 2.1) ** 2 <=
          1;

      row += blade || guard || grip || pommel
        ? '1'
        : '0';
    }

    rows.push(row);
  }

  return rows;
}

export const SWORD_TEMPLATE = {
  id: 'sword',
  name: '长剑',
  width: WIDTH,
  height: HEIGHT,
  rows: buildSwordRows()
};
