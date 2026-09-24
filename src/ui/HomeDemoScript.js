export const HOME_DEMO_SCRIPT = Object.freeze([
  { role: 'A', x: 0.14, holdMs: 90 },
  { role: 'D', x: 0.82, holdMs: 80 },
  { role: 'B', x: 0.31, holdMs: 85 },
  { role: 'C', x: 0.69, holdMs: 90 },
  { role: 'A', x: 0.47, holdMs: 95 },
  { role: 'E', x: 0.90, holdMs: 80 },
  { role: 'B', x: 0.12, holdMs: 85 },
  { role: 'C', x: 0.57, holdMs: 90 },
  { role: 'F', x: 0.76, holdMs: 80 },
  { role: 'A', x: 0.27, holdMs: 95 },
  { role: 'B', x: 0.64, holdMs: 90 },
  { role: 'C', x: 0.41, holdMs: 100 },
  { role: 'A', x: 0.52, holdMs: 220 }
]);

export const HOME_DEMO_ROLES = Object.freeze([
  'A','B','C','D','E','F','G'
]);

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
