const WIDTH = 39;
const HEIGHT = 40;

function buildCloverRows() {
  const rows = [];
  const centerX = 19;
  const centerY = 17.5;

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      const dx = x - centerX;
      const dy = (y - centerY) * 1.02;
      const radius = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Four smooth diagonal lobes reproduce the reference clover's
      // heart-like leaves. The polar curve naturally creates soft notches at
      // the top, left, right and bottom without the old "four circles" look.
      const lobeStrength = Math.abs(Math.sin(angle * 2));
      const leafBoundary =
        9.4 +
        8.2 * lobeStrength ** 0.58;

      const leaves = radius <= leafBoundary;

      // Keep the leaves joined through a full, rounded center so the piece
      // reads as one soft clover while falling and crumbling.
      const center =
        ((x - centerX) / 6.2) ** 2 +
          ((y - centerY) / 5.8) ** 2 <=
        1;

      // Short, subtly curved stem like the supplied reference.
      let stem = false;

      if (y >= 30 && y <= 38) {
        const stemCenter =
          centerX - (y - 30) * 0.16;
        const halfWidth =
          2.2 - (y - 30) * 0.06;

        stem =
          Math.abs(x - stemCenter) <= halfWidth;
      }

      const stemTipCenterX =
        centerX - 8 * 0.16;

      const roundedStemTip =
        ((x - stemTipCenterX) / 2.1) ** 2 +
          ((y - 37.4) / 1.8) ** 2 <=
        1;

      row += leaves || center || stem || roundedStemTip ? '1' : '0';
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
