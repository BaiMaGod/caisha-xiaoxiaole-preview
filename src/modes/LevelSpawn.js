// Draw independently from the full allowed palette, even after a color clears.
export function pickRandomLevelColor(palette, random = Math.random) {
  if (!Array.isArray(palette) || palette.length === 0) {
    throw new Error('Level palette must contain at least one color');
  }
  return palette[Math.min(
    palette.length - 1, Math.floor(random() * palette.length)
  )];
}

// Both Web and Canvas use this policy so their level rules stay in sync.
export function createLevelSpawnProvider(levelData, random = Math.random) {
  let nextStep = 0;
  return () => {
    if (levelData.id < 3) {
      const step = levelData.solution[nextStep++];
      return step ? { ...step } : {
        templateId: 'banana',
        color: levelData.palette[levelData.palette.length - 1]
      };
    }
    if (nextStep++ === 0) return { ...levelData.solution[0] };
    return { color: pickRandomLevelColor(levelData.palette, random) };
  };
}
