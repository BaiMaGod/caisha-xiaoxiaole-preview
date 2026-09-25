const WIDTH = 39;
const HEIGHT = 45;

function buildCloverRows() {
  const rows = [];
  const leaves = [
    [19, 9.5],
    [9.5, 19],
    [28.5, 19],
    [19, 28.5]
  ];

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      const leaf = leaves.some(
        ([centerX, centerY]) =>
          ((x - centerX) / 8) ** 2 +
            ((y - centerY) / 7.3) ** 2 <=
          1
      );

      const center =
        ((x - 19) / 5) ** 2 +
          ((y - 19) / 5) ** 2 <=
        1;

      const dx = x - 19;
      const dy = y - 19;

      // Carve four diagonal notches so the silhouette reads as
      // four distinct rounded leaves rather than one large blob.
      const notch =
        Math.abs(dx) > 5 &&
        Math.abs(dy) > 5 &&
        Math.abs(Math.abs(dx) - Math.abs(dy)) <
          3.2;

      const stemCenter =
        19 - Math.max(0, y - 31) * 0.22;

      const stem =
        y >= 31 &&
        y <= 43 &&
        Math.abs(x - stemCenter) <= 1.8;

      const body = (leaf || center) && !notch;

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
