export function getClearRating(cleared) {
  if (cleared >= 3000) return 'UNBELIEVABLE';
  if (cleared >= 2000) return 'PERFECT';
  if (cleared >= 1500) return 'AMAZING';
  if (cleared >= 1000) return 'GREAT';
  return 'GOOD';
}
