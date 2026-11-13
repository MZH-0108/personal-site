import { describe, expect, it } from 'vitest';
import { createBodyField, updateBodyField, type BodyInput, type BodySeed } from './creative-bodies';

const seeds: BodySeed[] = [
  { homeX: -2, homeY: 1, homeZ: 0, radius: .5 },
  { homeX: 2, homeY: -1, homeZ: .5, radius: .3 },
];
const input: BodyInput = { delta: 1 / 60, time: 0, pointer: { x: 0, y: 0, active: false }, pulse: 0, reduced: false, spread: 0 };
const run = (field: ReturnType<typeof createBodyField>, frames: number, overrides: Partial<BodyInput> = {}) => {
  for (let frame = 0; frame < frames; frame++) updateBodyField(field, { ...input, ...overrides });
};
const distance = (field: ReturnType<typeof createBodyField>, first: number, second: number) =>
  Math.hypot(...[0, 1, 2].map(axis => field.positions[first * 3 + axis] - field.positions[second * 3 + axis]));

describe('creative floating bodies', () => {
  it('idles close to home', () => {
    const field = createBodyField(seeds);
    run(field, 240);
    expect(Math.abs(field.positions[0] + 2)).toBeLessThan(.3);
    expect(Math.abs(field.positions[4] + 1)).toBeLessThan(.3);
  });
  it('is shoved away by a nearby pointer and drifts back afterwards', () => {
    const field = createBodyField(seeds);
    run(field, 90, { pointer: { x: -1.6, y: 1, active: true } });
    expect(field.positions[0]).toBeLessThan(-2.3);
    run(field, 420);
    expect(Math.abs(field.positions[0] + 2)).toBeLessThan(.3);
  });
  it('separates overlapping bodies', () => {
    const field = createBodyField([{ homeX: 0, homeY: 0, homeZ: 0, radius: .5 }, { homeX: .2, homeY: 0, homeZ: 0, radius: .5 }]);
    run(field, 30);
    expect(distance(field, 0, 1)).toBeGreaterThanOrEqual(.999);
  });
  it('throws bodies outward on a fresh pulse and stays finite', () => {
    const field = createBodyField(seeds);
    updateBodyField(field, { ...input, pulse: 1 });
    expect(field.velocities[0]).toBeLessThan(0);
    expect(field.velocities[3]).toBeGreaterThan(0);
    run(field, 300, { pulse: 1 });
    expect([...field.positions, ...field.velocities].every(Number.isFinite)).toBe(true);
  });
  it('leaves the stage as spread grows', () => {
    const field = createBodyField(seeds);
    run(field, 400, { spread: 1 });
    expect(field.positions[0]).toBeLessThan(-4);
    expect(field.positions[1]).toBeGreaterThan(5);
  });
  it('snaps to static poses for reduced motion', () => {
    const field = createBodyField(seeds);
    updateBodyField(field, { ...input, reduced: true, pointer: { x: -1.6, y: 1, active: true } });
    expect(field.positions[0]).toBeLessThan(-2);
    expect([...field.velocities].every(value => value === 0)).toBe(true);
    updateBodyField(field, { ...input, reduced: true });
    expect(field.positions[0]).toBe(-2);
  });
});
