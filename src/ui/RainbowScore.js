// Shared seven-color number treatment for gameplay, records and results.
// Keep colors saturated enough to remain readable on the game's ivory cards.
export const RAINBOW_SCORE_COLORS = Object.freeze([
  '#df5360', // red
  '#d77e27', // orange
  '#b9951e', // yellow
  '#329c60', // green
  '#2197a0', // cyan
  '#407bbf', // blue
  '#8154b3'  // purple
]);

const STYLE_ID = 'caisha-rainbow-score-style';

export function ensureRainbowScoreStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .caisha-rainbow-score {
      display: inline-block;
      color: #8154b3;
      font-weight: 900;
      font-variant-numeric: tabular-nums;
    }

    @supports ((-webkit-background-clip: text) or (background-clip: text)) {
      .caisha-rainbow-score {
        background-image: linear-gradient(105deg, ${RAINBOW_SCORE_COLORS.join(', ')});
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  `;

  document.head.appendChild(style);
}
