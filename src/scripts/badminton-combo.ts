/** Live streak call-outs: nothing for the first few strokes, then every stroke, with milestones emphasised. */
export const COMBO_FROM = 5;

export type ComboCall = { text: string; tier: 'hit' | 'milestone' | 'end' };

export function comboCall(streak: number, ended = false): ComboCall | undefined {
  if (!Number.isFinite(streak) || streak < COMBO_FROM) return undefined;
  const count = Math.floor(streak);
  if (ended) return { text: `${count} 连 · 断了`, tier: 'end' };
  return { text: count % 10 === 0 ? `${count} 连！` : String(count), tier: count % 10 === 0 ? 'milestone' : 'hit' };
}

/** Theme-specific flourish shown with the number: an arcade tag, a cartoon cheer, or a broadcast rating. */
export function comboFlourish(theme: string, streak: number, tier: ComboCall['tier']) {
  if (tier === 'end') return theme === 'arcade' ? 'GAME OVER' : theme === 'cartoon' ? '哎呀～' : 'RALLY END';
  if (theme === 'arcade') return tier === 'milestone' ? 'FEVER!' : 'COMBO';
  if (theme === 'cartoon') return tier === 'milestone' ? '超厉害！' : ['好球！', '漂亮！', '太棒了！'][streak % 3];
  if (theme === 'broadcast') return tier === 'milestone' || streak >= 15 ? 'PERFECT' : streak >= 8 ? 'GREAT' : 'GOOD';
  return '';
}
