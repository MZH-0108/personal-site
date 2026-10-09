import { describe, expect, it } from 'vitest';
import { advanceRotation, dragAxis, dragRadians, dragVelocity, rotationTargetAtProgress, rotationTargetForChapter } from './cosmic-rotation';

describe('cosmic drag rotation', () => {
  it('only enables the visible spheres and galaxy', () => {
    expect(['earth', 'moon', 'saturn', 'deep', 'nebula', 'cluster', 'arm', 'galaxy'].map(rotationTargetForChapter)).toEqual(['earth', 'moon', 'saturn', undefined, undefined, undefined, 'galaxy', 'galaxy']);
  });
  it('ignores small taps and prioritizes native scrolling for diagonals', () => {
    expect(dragAxis(5, 5)).toBe('pending');
    expect(dragAxis(50, 4)).toBe('horizontal');
    expect(dragAxis(5, 30)).toBe('vertical');
    expect(dragAxis(12, 11)).toBe('vertical');
    expect(dragAxis(60, 0, 'vertical')).toBe('vertical');
    expect(dragAxis(0, 60, 'horizontal')).toBe('horizontal');
  });
  it('does not rotate an invisible destination during camera transitions', () => {
    expect([0, .16, .28, .4, .55, .7, .85, 1].map(rotationTargetAtProgress)).toEqual(['earth', 'moon', 'saturn', undefined, undefined, undefined, 'galaxy', 'galaxy']);
    expect(rotationTargetAtProgress(.081)).toBeUndefined();
    expect(rotationTargetAtProgress(.22)).toBeUndefined();
    expect(rotationTargetAtProgress(Number.NaN)).toBeUndefined();
  });
  it('supports a complete turn and further turns without clamping', () => {
    expect(dragRadians(390 * 1.1, 390)).toBeCloseTo(Math.PI * 2);
    expect(dragRadians(1440 * 1.1 * 3, 1440)).toBeCloseTo(Math.PI * 6);
    expect(dragRadians(-390 * 1.1, 390)).toBeCloseTo(-Math.PI * 2);
    expect(dragRadians(Number.NaN, 390)).toBe(0);
  });
  it('does not fling after a hold and caps very fast movement', () => {
    expect(dragVelocity(100, 200, 390)).toBe(0);
    expect(dragVelocity(1000, 1, 390)).toBe(6);
    expect(dragVelocity(-1000, 1, 390)).toBe(-6);
  });
  it('gently decays inertia in either direction without overshooting', () => {
    const forward = advanceRotation(3, 1 / 60);
    const backward = advanceRotation(-3, 1 / 60);
    expect(forward.angle).toBeGreaterThan(0);
    expect(forward.velocity).toBeLessThan(3);
    expect(backward.angle).toBeCloseTo(-forward.angle);
    expect(backward.velocity).toBeCloseTo(-forward.velocity);
    expect(advanceRotation(.001, 1 / 60)).toEqual({ angle: 0, velocity: 0 });
    expect(advanceRotation(3, Number.NaN)).toEqual({ angle: 0, velocity: 0 });
  });
});
