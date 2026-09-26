const WIDTH = 39;
const HEIGHT = 30;

function buildHeartRows() {
  const rows = [];
  const centerX = 19;

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      // Match the softer reference heart: two plump round lobes with a
      // shallow central cleft, instead of the previous blocky top edge.
      const leftLobe =
        ((x - 11) / 9.7) ** 2 +
          ((y - 8.5) / 8.2) ** 2 <=
        1;

      const rightLobe =
        ((x - 27) / 9.7) ** 2 +
          ((y - 8.5) / 8.2) ** 2 <=
        1;

      // A rounded superellipse-style lower body keeps the heart full through
      // the middle, then tapers smoothly rather than collapsing into a long
      // sharp triangle.
      let lowerBody = false;

      if (y >= 7 && y <= 26) {
        const normalizedX = Math.abs(x - centerX) / 18;
        const normalizedY = Math.max(0, (y - 7) / 20.5);

        lowerBody =
          normalizedX ** 1.75 +
            normalizedY ** 1.52 <=
          1;
      }

      // Give the tip a small rounded cap so the silhouette reads like the
      // supplied sand-heart reference even at the game's coarse grain scale.
      const roundedTip =
        ((x - centerX) / 3.4) ** 2 +
          ((y - 26.7) / 2.5) ** 2 <=
        1;

      const topNotch =
        y <= 5 &&
        Math.abs(x - centerX) <
          Math.max(0, 2.9 - y * 0.38);

      const body =
        (leftLobe || rightLobe || lowerBody || roundedTip) &&
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
