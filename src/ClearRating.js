export function getClearRating(cleared) {
  if (cleared >= 4000) return 'UNBELIEVABLE';
  if (cleared >= 3000) return 'PERFECT';
  if (cleared >= 2000) return 'GREAT';
  if (cleared >= 1000) return 'GOOD';
  return 'AMAZING';
}
