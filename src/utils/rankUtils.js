import { RANKS } from '../constants/ranks';

export function computeRankProgress(xp) {
  if (typeof xp !== 'number' || xp < 0) {
    return { current: RANKS[0], next: RANKS[1], progress: 0, nextPoints: RANKS[1].points, currentPoints: RANKS[0].points };
  }
  // Encontrar current rank (inclusivo no limite)
  let current = RANKS[0];
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].points) current = RANKS[i];
    else break;
  }
  const idx = RANKS.findIndex(r => r.points === current.points);
  const next = idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
  const currentPoints = current.points;
  const nextPoints = next ? next.points : currentPoints;
  const raw = next ? (xp - currentPoints) / (nextPoints - currentPoints) : 1;
  const progress = Math.max(0, Math.min(1, raw));
  return { current, next, progress, nextPoints, currentPoints };
}
