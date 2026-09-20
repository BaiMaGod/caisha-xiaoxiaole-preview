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
  // 8ms per logical row is 50% faster than the previous 12ms setting.
  FRUIT_FALL_STEP_MS: 8,
  FRUIT_FAST_DROP_MULTIPLIER: 3,
  FRUIT_IMPACT_DURATION_MS: 90,
  FRUIT_BREAK_DURATION_MS: 300,

  // clear effects
  // Keep the highlight implementation available, but disable it by default
  // while we evaluate the direct random jump-clear look.
  CLEAR_HIGHLIGHT_ENABLED: false,

  POUR_RADIUS: 3
};
