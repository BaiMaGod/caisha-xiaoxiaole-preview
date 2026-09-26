const WIDTH = 52;
const HEIGHT = 23;

function buildSwordRows() {
  const rows = [];
  const centerY = (HEIGHT - 1) / 2;

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      const dy = Math.abs(y - centerY);

      // Left-side pommel and grip.
      const pommel =
        ((x - 3) / 3.1) ** 2 +
          ((y - centerY) / 4) ** 2 <=
        1;

      const grip =
        x >= 5 &&
        x <= 13 &&
        dy <= 2.2;

      // Tall crossguard makes the horizontal orientation unmistakable.
      const guard =
        x >= 13 &&
        x <= 17 &&
        dy <= 9;

      // Long horizontal blade.
      const blade =
        x >= 17 &&
        x <= 44 &&
        dy <= 3.2;

      // Taper only the final section so the sword has a clear right tip
      // without making the whole silhouette look needle-thin.
      let tip = false;

      if (x >= 44 && x <= 51) {
        const halfHeight = Math.max(
          0.4,
          3.2 - (x - 44) * (2.8 / 7)
        );

        tip = dy <= halfHeight;
      }

      row += pommel || grip || guard || blade || tip
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
