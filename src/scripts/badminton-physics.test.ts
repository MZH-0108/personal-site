import { describe, expect, it } from 'vitest';
import { createShuttle, followPointer, serve, stepShuttle, strike, TERMINAL, type Bounds, type Racket } from './badminton-physics';

const bounds: Bounds = { left: -4, right: 4, floor: -3, top: 4 };
const still = (x = 0, y = -1.5): Racket => ({ x, y, vx: 0, vy: 0 });
const fixed = () => .5;
const run = (frames: number, step: () => string | void) => { const events: string[] = []; for (let i = 0; i < frames; i++) { const e = step(); if (e && e !== 'none') events.push(e); } return events; };

describe('badminton shuttle flight', () => {
  it('falls at close to its terminal speed rather than accelerating freely', () => {
    const shuttle = createShuttle(0, 60);
    run(240, () => { stepShuttle(shuttle, still(9, -99), { ...bounds, right: 99, floor: -99 }, 1 / 60, fixed); });
    expect(-shuttle.vy).toBeGreaterThan(TERMINAL * .97);
    expect(-shuttle.vy).toBeLessThan(TERMINAL * 1.01);
  });

  it('flips cork-first on the way down after being struck upward', () => {
    const shuttle = createShuttle(0, -1.5);
    strike(shuttle, { x: 0, y: -1.5, vx: 0, vy: 4 }, bounds);
    expect(Math.sin(shuttle.angle)).toBeGreaterThan(.9);
    const far = still(99, -99);
    run(150, () => { stepShuttle(shuttle, far, { ...bounds, floor: -99 }, 1 / 60, fixed); });
    expect(shuttle.vy).toBeLessThan(0);
    expect(Math.sin(shuttle.angle)).toBeLessThan(-.9);
  });

  it('stalls sharply: a stronger swing gives a higher but proportionally shorter rise', () => {
    const apex = (swing: number) => {
      const shuttle = createShuttle(0, 0);
      strike(shuttle, { x: 0, y: 0, vx: 0, vy: swing }, bounds);
      let top = 0;
      while (shuttle.vy > 0) { stepShuttle(shuttle, still(99, -99), { ...bounds, top: 99 }, 1 / 120, fixed); top = Math.max(top, shuttle.y); }
      return top;
    };
    const soft = apex(1.5), hard = apex(8);
    expect(hard).toBeGreaterThan(soft);
    expect(hard / soft).toBeLessThan(2);
    expect(hard).toBeLessThan(4.5);
  });
});

describe('badminton strokes', () => {
  it('counts an upward swing under the shuttle as a hit', () => {
    const shuttle = createShuttle(0, -1.3);
    shuttle.vy = -3;
    const event = stepShuttle(shuttle, { x: .1, y: -1.42, vx: 0, vy: 4 }, bounds, 1 / 60, fixed);
    expect(event).toBe('hit');
    expect(shuttle.vy).toBeGreaterThan(6);
  });

  it('only dead-bounces off a racket held still, then comes to rest on the strings', () => {
    const shuttle = createShuttle(0, 0);
    const racket = still(0, -1.5);
    const events = run(400, () => stepShuttle(shuttle, racket, bounds, 1 / 60, fixed));
    expect(events).not.toContain('hit');
    expect(events).toContain('bounce');
    expect(shuttle.mode).toBe('resting');
  });

  it('launches a resting shuttle when the racket is flicked upward', () => {
    const shuttle = createShuttle(0, -1.5);
    shuttle.mode = 'resting';
    expect(stepShuttle(shuttle, { x: 0, y: -1.5, vx: 0, vy: 3 }, bounds, 1 / 60, fixed)).toBe('hit');
    expect(shuttle.mode).toBe('flying');
  });

  it('drops to the floor when missed and is served again', () => {
    const shuttle = createShuttle(0, 0);
    const events = run(300, () => stepShuttle(shuttle, still(3.5, 2), bounds, 1 / 60, fixed));
    expect(events.slice(0, 2)).toEqual(['drop', 'serve']);
    expect(shuttle.y).toBeLessThanOrEqual(bounds.top);
  });

  it('keeps the shuttle between the side walls', () => {
    const shuttle = createShuttle(3.9, 0);
    shuttle.vx = 6;
    run(30, () => { stepShuttle(shuttle, still(-99, -99), bounds, 1 / 60, fixed); });
    expect(shuttle.x).toBeLessThanOrEqual(bounds.right);
    expect(shuttle.vx).toBeLessThanOrEqual(0);
  });

  it('serves near the centre from the top', () => {
    const shuttle = createShuttle();
    serve(shuttle, bounds, fixed);
    expect(shuttle).toMatchObject({ x: 0, y: bounds.top, mode: 'flying' });
  });

  it('ignores non-finite and zero time steps', () => {
    const shuttle = createShuttle(0, 1);
    expect(stepShuttle(shuttle, still(), bounds, Number.NaN, fixed)).toBe('none');
    expect(stepShuttle(shuttle, still(), bounds, 0, fixed)).toBe('none');
    expect(shuttle.y).toBe(1);
  });
});

describe('racket follow', () => {
  it('trails the pointer and reports an upward velocity when swung up', () => {
    const racket = still(0, -2);
    for (let i = 0; i < 6; i++) followPointer(racket, 0, -2 + (i + 1) * .12, 1 / 60);
    expect(racket.vy).toBeGreaterThan(3);
    expect(racket.y).toBeGreaterThan(-2);
    expect(racket.y).toBeLessThan(-2 + .72);
  });
  it('settles on a still pointer', () => {
    const racket = still(0, 0);
    for (let i = 0; i < 120; i++) followPointer(racket, 1, 1, 1 / 60);
    expect(racket.x).toBeCloseTo(1, 3);
    expect(Math.abs(racket.vy)).toBeLessThan(.01);
  });
});
