export const FIRST_DROP_GUIDE_COLORS = Object.freeze([
  1,
  3,
  4,
  6,
  7
]);

const DEFAULT_GAP_WIDTH = 14;
const DEFAULT_MAX_PILE_HEIGHT = 16;
const FIRST_DROP_TEMPLATE_ID = 'apple';

function clampRandomSample(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(0.999999999, value));
}

export function buildFirstDropGuide(
  grid,
  {
    random = Math.random,
    gapWidth = DEFAULT_GAP_WIDTH,
    maxPileHeight = DEFAULT_MAX_PILE_HEIGHT
  } = {}
) {
  const sample = clampRandomSample(random());
  const color =
    FIRST_DROP_GUIDE_COLORS[
      Math.floor(sample * FIRST_DROP_GUIDE_COLORS.length)
    ];

  const safeGapWidth = Math.max(
    8,
    Math.min(
      grid.width - 4,
      Math.round(gapWidth)
    )
  );

  const safeMaxPileHeight = Math.max(
    4,
    Math.min(
      grid.height - 1,
      Math.round(maxPileHeight)
    )
  );

  const centerX = grid.width / 2;
  const gapLeft = Math.floor(
    centerX - safeGapWidth / 2
  );
  const gapRight = gapLeft + safeGapWidth - 1;

  for (let x = 0; x < grid.width; x++) {
    if (x >= gapLeft && x <= gapRight) {
      continue;
    }

    const distanceToGap =
      x < gapLeft
        ? gapLeft - x
        : x - gapRight;

    // The one-cell-per-column ramp is stable under the sand automaton:
    // every surface grain has support directly below and on both lower
    // diagonals. That keeps the center opening from filling itself before
    // the player makes the first drop.
    const columnHeight = Math.min(
      safeMaxPileHeight,
      distanceToGap
    );

    for (let depth = 0; depth < columnHeight; depth++) {
      grid.set(
        x,
        grid.height - 1 - depth,
        color
      );
    }
  }

  return {
    color,
    centerX,
    gapLeft,
    gapRight,
    templateId: FIRST_DROP_TEMPLATE_ID
  };
}
