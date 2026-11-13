/** Live streak call-outs: nothing for the first few strokes, then every stroke, with milestones emphasised. */
export const COMBO_FROM = 5;

export type ComboCall = { text: string; tier: 'hit' | 'milestone' | 'end' };

export function comboCall(streak: number, ended = false): ComboCall | undefined {
  if (!Number.isFinite(streak) || streak < COMBO_FROM) return undefined;
  const count = Math.floor(streak);
  if (ended) return { text: `${count} 连 · 断了`, tier: 'end' };
  return { text: count % 10 === 0 ? `${count} 连！` : String(count), tier: count % 10 === 0 ? 'milestone' : 'hit' };
}
