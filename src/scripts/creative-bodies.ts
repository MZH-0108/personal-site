export type BodySeed = { homeX: number; homeY: number; homeZ: number; radius: number };
export type BodyField = { seeds: readonly BodySeed[]; positions: Float32Array; velocities: Float32Array; lastPulse: number };
export type BodyInput = {
  delta: number;
  time: number;
  pointer: { x: number; y: number; active: boolean };
  pulse: number;
  reduced: boolean;
  /** 0 keeps the bodies around their homes; 1 pushes them outward and up, off the stage. */
  spread: number;
  count?: number;
};

const REACH = 2.1;
const SPRING = 7;
const DRAG = 2.4;
const BOUNCE = .55;

export function createBodyField(seeds: readonly BodySeed[]): BodyField {
  const positions = new Float32Array(seeds.length * 3);
  seeds.forEach((seed, index) => { positions[index * 3] = seed.homeX; positions[index * 3 + 1] = seed.homeY; positions[index * 3 + 2] = seed.homeZ; });
  return { seeds, positions, velocities: new Float32Array(positions.length), lastPulse: 0 };
}

/**
 * Floating bodies are sphere colliders tied to a home by a soft spring. The pointer shoves them aside,
 * a click throws them outward, and an all-pairs pass keeps them from overlapping. The set is small
 * (well under 20), so the quadratic collision pass costs less than a single particle update.
 */
export function updateBodyField(field: BodyField, input: BodyInput) {
  const count = Math.min(field.seeds.length, Math.max(0, input.count ?? field.seeds.length));
  const delta = Math.min(.05, Math.max(0, Number.isFinite(input.delta) ? input.delta : 0));
  const spread = Math.min(1, Math.max(0, Number.isFinite(input.spread) ? input.spread : 0));
  const hasPointer = input.pointer.active && Number.isFinite(input.pointer.x) && Number.isFinite(input.pointer.y);
  const pointerX = Number.isFinite(input.pointer.x) ? input.pointer.x : 0;
  const pointerY = Number.isFinite(input.pointer.y) ? input.pointer.y : 0;
  const pulseChanged = Number.isFinite(input.pulse) && input.pulse !== field.lastPulse;
  const { positions, velocities, seeds } = field;
  const homeOf = (index: number, axis: number) => {
    const seed = seeds[index];
    if (axis === 0) return seed.homeX * (1 + spread * 1.5);
    if (axis === 1) return seed.homeY * (1 + spread * .9) + spread * 4.2;
    return seed.homeZ - spread * 3;
  };

  if (input.reduced) {
    for (let index = 0; index < count; index++) {
      const offset = index * 3, seed = seeds[index];
      const homeX = homeOf(index, 0), homeY = homeOf(index, 1);
      const dx = homeX - pointerX, dy = homeY - pointerY;
      const distance = Math.max(.08, Math.sqrt(dx * dx + dy * dy));
      const push = hasPointer ? Math.max(0, 1 - distance / (REACH + seed.radius)) ** 2 * .9 : 0;
      positions[offset] = homeX + dx / distance * push;
      positions[offset + 1] = homeY + dy / distance * push;
      positions[offset + 2] = homeOf(index, 2);
      velocities[offset] = velocities[offset + 1] = velocities[offset + 2] = 0;
    }
    field.lastPulse = Number.isFinite(input.pulse) ? input.pulse : field.lastPulse;
    return;
  }

  if (pulseChanged) {
    for (let index = 0; index < count; index++) {
      const offset = index * 3;
      const dx = positions[offset] - pointerX, dy = positions[offset + 1] - pointerY;
      const distance = Math.max(.08, Math.sqrt(dx * dx + dy * dy));
      const force = Math.max(0, 1 - distance / 7) ** 2 * 11;
      velocities[offset] += dx / distance * force;
      velocities[offset + 1] += dy / distance * force;
      velocities[offset + 2] += force * .35;
    }
  }

  const steps = Math.max(1, Math.ceil(delta / .008));
  const step = delta / steps;
  const damping = Math.exp(-DRAG * step);
  for (let iteration = 0; iteration < steps; iteration++) {
    for (let index = 0; index < count; index++) {
      const offset = index * 3, seed = seeds[index];
      // A slow per-body bob keeps the idle scene alive without any pointer input.
      const bobX = Math.sin(input.time * .5 + index * 2.1) * .16;
      const bobY = Math.cos(input.time * .62 + index * 1.3) * .2;
      let forceX = (homeOf(index, 0) + bobX - positions[offset]) * SPRING;
      let forceY = (homeOf(index, 1) + bobY - positions[offset + 1]) * SPRING;
      const forceZ = (homeOf(index, 2) - positions[offset + 2]) * SPRING;
      if (hasPointer) {
        const dx = positions[offset] - pointerX, dy = positions[offset + 1] - pointerY;
        const distance = Math.max(.08, Math.sqrt(dx * dx + dy * dy));
        const push = Math.max(0, 1 - distance / (REACH + seed.radius)) ** 2 * 130;
        forceX += dx / distance * push; forceY += dy / distance * push;
      }
      velocities[offset] = (velocities[offset] + forceX * step) * damping;
      velocities[offset + 1] = (velocities[offset + 1] + forceY * step) * damping;
      velocities[offset + 2] = (velocities[offset + 2] + forceZ * step) * damping;
      positions[offset] += velocities[offset] * step;
      positions[offset + 1] += velocities[offset + 1] * step;
      positions[offset + 2] += velocities[offset + 2] * step;
    }
    for (let first = 0; first < count; first++) {
      for (let second = first + 1; second < count; second++) {
        const a = first * 3, b = second * 3;
        let nx = positions[b] - positions[a], ny = positions[b + 1] - positions[a + 1], nz = positions[b + 2] - positions[a + 2];
        const distance = Math.sqrt(nx * nx + ny * ny + nz * nz);
        const reach = seeds[first].radius + seeds[second].radius;
        if (distance >= reach) continue;
        if (distance < 1e-5) { nx = 1; ny = 0; nz = 0; } else { nx /= distance; ny /= distance; nz /= distance; }
        // Heavier (larger) bodies yield less, both in the positional fix and in the bounce.
        const massA = seeds[first].radius ** 3, massB = seeds[second].radius ** 3;
        const shareA = massB / (massA + massB), shareB = massA / (massA + massB);
        const overlap = reach - distance;
        positions[a] -= nx * overlap * shareA; positions[a + 1] -= ny * overlap * shareA; positions[a + 2] -= nz * overlap * shareA;
        positions[b] += nx * overlap * shareB; positions[b + 1] += ny * overlap * shareB; positions[b + 2] += nz * overlap * shareB;
        const closing = (velocities[b] - velocities[a]) * nx + (velocities[b + 1] - velocities[a + 1]) * ny + (velocities[b + 2] - velocities[a + 2]) * nz;
        if (closing >= 0) continue;
        const impulse = -(1 + BOUNCE) * closing;
        velocities[a] -= nx * impulse * shareA; velocities[a + 1] -= ny * impulse * shareA; velocities[a + 2] -= nz * impulse * shareA;
        velocities[b] += nx * impulse * shareB; velocities[b + 1] += ny * impulse * shareB; velocities[b + 2] += nz * impulse * shareB;
      }
    }
  }
  field.lastPulse = Number.isFinite(input.pulse) ? input.pulse : field.lastPulse;
}
