/**
 * What to celebrate after each counted stroke.
 * - From the fifth stroke on, every stroke pops its number beside the shuttle.
 * - Every tenth stroke is a cheer instead: an English word that escalates as the rally grows.
 * - A rally of five or more that ends gets a quiet "rally end" note.
 */
export const COMBO_FROM = 5;

const CHEERS = ['Good!', 'Great!', 'Excellent!', 'Amazing!', 'Unbelievable!', 'Incredible!', 'Fantastic!', 'Outstanding!', 'Legendary!', 'Unstoppable!'];

export type ComboCall =
  | { kind: 'pop'; text: string; count: number }
  /** `level` 1–5 drives how loud the cheer looks (colour, size, amount of confetti). */
  | { kind: 'cheer'; text: string; count: number; level: number }
  | { kind: 'end'; text: string; count: number };

export function comboCall(streak: number, ended = false): ComboCall | undefined {
  if (!Number.isFinite(streak) || streak < COMBO_FROM) return undefined;
  const count = Math.floor(streak);
  if (ended) return { kind: 'end', text: `RALLY END · ${count}`, count };
  if (count % 10 === 0) {
    const index = Math.min(CHEERS.length, count / 10) - 1;
    return { kind: 'cheer', text: CHEERS[index], count, level: Math.min(5, Math.ceil((index + 1) / 2)) };
  }
  return { kind: 'pop', text: String(count), count };
}

/**
 * Playful, never-quite-straight placement for a number pop: a tilt, a size nudge, and a drift away
 * from the side the shuttle is heading. `random` is injectable for tests.
 */
export function popStyle(count: number, heading: number, random = Math.random) {
  const side = heading >= 0 ? -1 : 1;
  return {
    side,
    rotate: Math.round((random() * 2 - 1) * 14 + side * 4),
    scale: Number((Math.min(1.45, .9 + count * .012) * (.92 + random() * .16)).toFixed(3)),
    drift: Math.round(side * (26 + random() * 34)),
  };
}
