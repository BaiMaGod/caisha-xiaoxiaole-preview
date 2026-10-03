export const CONFIG = {
  // 9:16 logical board. At ~405px mobile width, one grain is ~2.25px.
  WIDTH: 180,
  HEIGHT: 320,
  UPDATE_INTERVAL: 1000 / 30,

  // game rules
  DEATH_LINE_Y: 48,

  // sand physics
  FRICTION: 0.35,
  GRAVITY: 0.15,
  MAX_VELOCITY: 1,
  SLEEP_THRESHOLD: 8,
  SAND_SUBSTEPS: 3,

  // falling fruit
  // Increase falling speed by another 50% from the previous 8ms/row setting.
  // Speed is inverse to step time: 8ms / 1.5 = 16/3ms per logical row.
  FRUIT_FALL_STEP_MS: 16 / 3,
  FRUIT_FAST_DROP_MULTIPLIER: 3,
  FRUIT_IMPACT_DURATION_MS: 90,
  FRUIT_BREAK_DURATION_MS: 300,

  // onboarding
  // Before the playfield is shown, pre-simulate several real falling pieces
  // into two same-color piles with a center gap. The first controllable piece
  // matches that color and is verified to complete a left-to-right clear.
  // Disable this for the old empty-board opening.
  FIRST_DROP_GUIDE_ENABLED: true,

  // debug
  // Keep this enabled during effect development so every registered clear
  // effect is immediately available. Set to false before production release.
  DEBUG_UNLOCK_ALL_CLEAR_EFFECTS: false,

  // clear effects
  // Keep the highlight implementation available, but disable it by default
  // while we evaluate the direct random jump-clear look.
  CLEAR_HIGHLIGHT_ENABLED: false,

  POUR_RADIUS: 3
};
