export const RATING_LABELS = {
  1: 'Endured it',
  2: 'It was fine',
  3: 'Good race',
  4: 'Brilliant',
  5: 'All-timer',
}

export function getRatingLabel(rating) {
  return RATING_LABELS[rating] ?? null
}
