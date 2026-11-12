import { describe, expect, it } from 'vitest';
import { createParticleField, particleRandom, updateParticleField, type ParticleInput, type ParticleSeed } from './creative-particles';

const seeds: ParticleSeed[] = [
  { x: 0, y: 0, z: 0, radius: .08, blue: false, scatterX: 2, scatterY: 1, scatterZ: 1 },
  { x: 3, y: 1, z: .1, radius: .08, blue: true, scatterX: -1, scatterY: 2, scatterZ: 1 },
];
const input: ParticleInput = { delta: 1 / 60, time: 0, pointer: { x: 0, y: 0, active: false }, released: false, pulse: 0, reduced: false };

describe('creative particle field', () => {
  it('creates repeatable distributed randomness', () => {
    const first = particleRandom(), second = particleRandom();
    expect(Array.from({ length: 30 }, first)).toEqual(Array.from({ length: 30 }, second));
  });
  it('keeps the unperturbed word still', () => {
    const field = createParticleField(seeds);
    updateParticleField(field, input);
    expect([...field.positions]).toEqual([0, 0, 0, 3, 1, expect.closeTo(.1)]);
  });
  it('releases and regathers without losing finite positions', () => {
    const field = createParticleField(seeds);
    for (let step = 0; step < 160; step++) updateParticleField(field, { ...input, released: true, time: step / 60 });
    expect(field.positions[0]).toBeGreaterThan(1.7);
    for (let step = 0; step < 240; step++) updateParticleField(field, input);
    expect(field.positions[0]).toBeCloseTo(0, 4);
    expect([...field.positions, ...field.velocities].every(Number.isFinite)).toBe(true);
  });
  it('uses immediate, static poses for reduced motion', () => {
    const field = createParticleField(seeds);
    updateParticleField(field, { ...input, released: true, reduced: true });
    expect([...field.positions]).toEqual([2, 1, 1, 2, 3, expect.closeTo(1.1)]);
    updateParticleField(field, { ...input, reduced: true });
    expect(field.positions[0]).toBe(0);
  });
  it('responds locally to a pointer and a fresh pulse', () => {
    const field = createParticleField(seeds);
    updateParticleField(field, { ...input, pointer: { x: .2, y: 0, active: true }, reduced: true });
    expect(field.positions[2]).toBeLessThan(0);
    expect(field.positions[3]).toBe(3);
    updateParticleField(field, { ...input, pulse: 1 });
    expect(field.velocities.some(value => Math.abs(value) > .1)).toBe(true);
  });
  it('keeps the click position when pointer capture has ended', () => {
    const first = createParticleField(seeds), second = createParticleField(seeds);
    updateParticleField(first, { ...input, pulse: 1, pointer: { x: 0, y: 0, active: false } });
    updateParticleField(second, { ...input, pulse: 1, pointer: { x: 3, y: 1, active: false } });
    expect(Math.abs(first.velocities[2])).toBeGreaterThan(Math.abs(second.velocities[2]));
    expect(Math.abs(second.velocities[5])).toBeGreaterThan(Math.abs(first.velocities[5]));
  });
});
