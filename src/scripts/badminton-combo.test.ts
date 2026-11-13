import { describe, expect, it } from 'vitest';
import { comboCall } from './badminton-combo';

describe('badminton combo call-outs', () => {
  it('stays quiet below five strokes', () => {
    for (const streak of [0, 1, 4, Number.NaN]) expect(comboCall(streak)).toBeUndefined();
    expect(comboCall(4, true)).toBeUndefined();
  });
  it('calls every stroke from five on', () => {
    expect(comboCall(5)).toEqual({ text: '5', tier: 'hit' });
    expect(comboCall(13)).toEqual({ text: '13', tier: 'hit' });
  });
  it('emphasises every tenth stroke', () => {
    expect(comboCall(10)).toEqual({ text: '10 连！', tier: 'milestone' });
    expect(comboCall(30)?.tier).toBe('milestone');
  });
  it('marks the end of a long rally', () => {
    expect(comboCall(12, true)).toEqual({ text: '12 连 · 断了', tier: 'end' });
  });
});
