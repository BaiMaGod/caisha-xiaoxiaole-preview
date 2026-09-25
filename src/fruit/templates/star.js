const WIDTH = 39;
const HEIGHT = 37;

function pointInPolygon(x, y, points) {
  let inside = false;
  let j = points.length - 1;

  for (let i = 0; i < points.length; i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];

    if (
      (yi > y) !== (yj > y) &&
      x <
        ((xj - xi) * (y - yi)) /
          (yj - yi) +
          xi
    ) {
      inside = !inside;
    }

    j = i;
  }

  return inside;
}

function buildStarRows() {
  const centerX = (WIDTH - 1) / 2;
  const centerY = (HEIGHT - 1) / 2 + 0.5;
  const outerRadius = 17.5;
  const innerRadius = 8.6;
  const points = [];

  for (let i = 0; i < 10; i++) {
    const angle =
      -Math.PI / 2 + (i * Math.PI) / 5;
    const radius =
      i % 2 === 0 ? outerRadius : innerRadius;

    points.push([
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius
    ]);
  }

  const rows = [];

  for (let y = 0; y < HEIGHT; y++) {
    let row = '';

    for (let x = 0; x < WIDTH; x++) {
      row += pointInPolygon(
        x + 0.5,
        y + 0.5,
        points
      )
        ? '1'
        : '0';
    }

    rows.push(row);
  }

  return rows;
}

export const STAR_TEMPLATE = {
  id: 'star',
  name: '五角星',
  width: WIDTH,
  height: HEIGHT,
  rows: buildStarRows()
};
