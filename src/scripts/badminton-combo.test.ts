import { describe, expect, it } from 'vitest';
import { comboCall, popStyle } from './badminton-combo';

describe('badminton combo calls', () => {
  it('stays quiet below five strokes', () => {
    for (const streak of [0, 1, 4, Number.NaN]) expect(comboCall(streak)).toBeUndefined();
    expect(comboCall(4, true)).toBeUndefined();
  });

  it('pops the number for ordinary strokes from five on', () => {
    expect(comboCall(5)).toEqual({ kind: 'pop', text: '5', count: 5 });
    expect(comboCall(13)).toEqual({ kind: 'pop', text: '13', count: 13 });
  });

  it('cheers in English on every tenth stroke, escalating', () => {
    expect(comboCall(10)).toMatchObject({ kind: 'cheer', text: 'Good!', level: 1 });
    expect(comboCall(20)).toMatchObject({ text: 'Great!', level: 1 });
    expect(comboCall(30)).toMatchObject({ text: 'Excellent!', level: 2 });
    expect(comboCall(50)).toMatchObject({ text: 'Unbelievable!', level: 3 });
    expect(comboCall(100)).toMatchObject({ text: 'Unstoppable!', level: 5 });
    expect(comboCall(250)).toMatchObject({ text: 'Unstoppable!', level: 5 });
  });

  it('notes the end of a long rally', () => {
    expect(comboCall(12, true)).toEqual({ kind: 'end', text: 'RALLY END · 12', count: 12 });
  });
});

describe('number pop styling', () => {
  it('drifts away from the direction the shuttle is heading', () => {
    expect(popStyle(7, 2, () => .5)).toMatchObject({ side: -1 });
    expect(popStyle(7, -2, () => .5)).toMatchObject({ side: 1 });
    expect(popStyle(7, 2, () => .5).drift).toBeLessThan(0);
  });
  it('tilts and grows a little with the rally, within bounds', () => {
    for (const r of [0, .5, .999]) {
      const style = popStyle(40, 1, () => r);
      expect(Math.abs(style.rotate)).toBeLessThanOrEqual(18);
      expect(style.scale).toBeGreaterThan(.8);
      expect(style.scale).toBeLessThan(1.7);
    }
    expect(popStyle(60, 1, () => .5).scale).toBeGreaterThan(popStyle(6, 1, () => .5).scale);
  });
});
