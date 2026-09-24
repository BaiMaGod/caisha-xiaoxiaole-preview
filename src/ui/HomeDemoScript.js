export const HOME_DEMO_PHYSICS_SEED = 0x51a7cafe;
export const HOME_DEMO_BASE_SEED = 0x0badcafe;

export const HOME_DEMO_ROLES = Object.freeze([
  'A','B','C','D','E','F','G'
]);

// Searched against the real FruitPiece + SandSimulation +
// ConnectivityClear pipeline. The first 12 drops do not clear; drop 13
// starts a deterministic A -> B -> C three-stage cascade.
export const HOME_DEMO_SCRIPT = Object.freeze([
  { role:'A', centerX:36,  templateId:'banana', holdMs:90 },
  { role:'B', centerX:89,  templateId:'banana', holdMs:86 },
  { role:'A', centerX:68,  templateId:'apple',  holdMs:92 },
  { role:'B', centerX:24,  templateId:'banana', holdMs:82 },
  { role:'B', centerX:126, templateId:'apple',  holdMs:90 },
  { role:'C', centerX:108, templateId:'apple',  holdMs:92 },
  { role:'C', centerX:36,  templateId:'banana', holdMs:84 },
  { role:'B', centerX:42,  templateId:'banana', holdMs:84 },
  { role:'A', centerX:72,  templateId:'apple',  holdMs:94 },
  { role:'C', centerX:45,  templateId:'apple',  holdMs:92 },
  { role:'C', centerX:108, templateId:'banana', holdMs:88 },
  { role:'A', centerX:138, templateId:'banana', holdMs:92 },
  { role:'A', centerX:93,  templateId:'banana', holdMs:210 }
]);

// The initial hill is itself generated through the real gameplay pipeline.
// Only D/E/F/G are used, so the A/B/C cascade never deletes the base.
export const HOME_DEMO_BASELINE_SCRIPT = Object.freeze([
  { role:'D', centerX:18,  templateId:'apple' },
  { role:'E', centerX:52,  templateId:'banana' },
  { role:'F', centerX:88,  templateId:'apple' },
  { role:'G', centerX:126, templateId:'apple' },
  { role:'D', centerX:160, templateId:'banana' },
  { role:'E', centerX:145, templateId:'apple' },
  { role:'F', centerX:108, templateId:'apple' },
  { role:'G', centerX:72,  templateId:'banana' },
  { role:'D', centerX:34,  templateId:'apple' },
  { role:'E', centerX:24,  templateId:'apple' },
  { role:'F', centerX:61,  templateId:'banana' },
  { role:'G', centerX:99,  templateId:'apple' },
  { role:'D', centerX:137, templateId:'apple' },
  { role:'E', centerX:158, templateId:'banana' },
  { role:'F', centerX:119, templateId:'apple' },
  { role:'G', centerX:81,  templateId:'apple' },
  { role:'D', centerX:43,  templateId:'banana' }
]);

export function createSeededRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function shuffle(values, random = Math.random) {
  const out = [...values];

  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out;
}

export function createDemoRoleColors(random = Math.random) {
  const colors = shuffle([1,2,3,4,5,6,7], random);

  return Object.fromEntries(
    HOME_DEMO_ROLES.map((role, index) => [role, colors[index]])
  );
}

export function rotateChainRoleColors(roleColors, random = Math.random) {
  const chain = shuffle(
    [roleColors.A, roleColors.B, roleColors.C],
    random
  );

  return {
    ...roleColors,
    A: chain[0],
    B: chain[1],
    C: chain[2]
  };
}
