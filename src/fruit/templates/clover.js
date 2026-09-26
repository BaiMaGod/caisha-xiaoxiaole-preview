const WIDTH = 39;
const HEIGHT = 40;

function buildCloverRows() {
  const rows = [];

  // Four large circular leaves arranged diagonally produce a softer,
  // friendlier clover silhouette than the previous cardinal cross shape.
  const leaves = [
    [11.5, 11.5],
    [26.5, 11.5],
    [11.5, 26.5],
    [26.5, 26.5]
  ];

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      const leaf = leaves.some(
        ([centerX, centerY]) =>
          ((x - centerX) / 8.7) ** 2 +
            ((y - centerY) / 8.7) ** 2 <=
          1
      );

      const center =
        ((x - 19) / 4.6) ** 2 +
          ((y - 19) / 4.6) ** 2 <=
        1;

      // Small inward cuts keep all four leaves readable while preserving
      // the rounded outer contour.
      const topNotch =
        y <= 8 &&
        Math.abs(x - 19) <= 2.2;

      const leftNotch =
        x <= 8 &&
        Math.abs(y - 19) <= 2.2;

      const rightNotch =
        x >= 30 &&
        Math.abs(y - 19) <= 2.2;

      const bottomNotch =
        y >= 30 &&
        y <= 32 &&
        Math.abs(x - 19) <= 2;

      const stemCenter =
        19 - Math.max(0, y - 31) * 0.25;

      const stem =
        y >= 31 &&
        y <= 39 &&
        Math.abs(x - stemCenter) <= 1.5;

      const body =
        (leaf || center) &&
        !(
          topNotch ||
          leftNotch ||
          rightNotch ||
          bottomNotch
        );

      row += body || stem ? '1' : '0';
    }

    rows.push(row);
  }

  return rows;
}

export const CLOVER_TEMPLATE = {
  id: 'clover',
  name: '四叶草',
  width: WIDTH,
  height: HEIGHT,
  rows: buildCloverRows()
};
