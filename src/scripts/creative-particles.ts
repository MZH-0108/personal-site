export type ParticleSeed = { x: number; y: number; z: number; radius: number; blue: boolean; scatterX: number; scatterY: number; scatterZ: number };
/** `targets` is where each particle rests; it starts as the word and can be retargeted to morph into other shapes. */
export type ParticleField = { seeds: readonly ParticleSeed[]; positions: Float32Array; velocities: Float32Array; targets: Float32Array; lastPulse: number };
export type ParticleInput = { delta: number; time: number; pointer: { x: number; y: number; active: boolean }; released: boolean; pulse: number; reduced: boolean; count?: number };

export function particleRandom(seed = 147) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(1664525, value) + 1013904223) >>> 0; return value / 4294967296; };
}

export function createParticleField(seeds: readonly ParticleSeed[]): ParticleField {
  const positions = new Float32Array(seeds.length * 3);
  seeds.forEach((seed, index) => { positions[index * 3] = seed.x; positions[index * 3 + 1] = seed.y; positions[index * 3 + 2] = seed.z; });
  return { seeds, positions, velocities: new Float32Array(positions.length), targets: positions.slice(), lastPulse: 0 };
}

/** Local spring forces are O(n); particles do not run an all-pairs collision solver. */
export function updateParticleField(field: ParticleField, input: ParticleInput) {
  const count = Math.min(field.seeds.length, Math.max(0, input.count ?? field.seeds.length));
  const delta = Math.min(.05, Math.max(0, Number.isFinite(input.delta) ? input.delta : 0));
  const pulseChanged = Number.isFinite(input.pulse) && input.pulse !== field.lastPulse;
  const hasPointer = input.pointer.active && Number.isFinite(input.pointer.x) && Number.isFinite(input.pointer.y);
  const centerX = Number.isFinite(input.pointer.x) ? input.pointer.x : 1.8;
  const centerY = Number.isFinite(input.pointer.y) ? input.pointer.y : .15;
  const steps = Math.max(1, Math.ceil(delta / .012));
  const step = delta / steps;
  const damping = Math.exp(-9 * step);

  for (let index = 0; index < count; index++) {
    const seed = field.seeds[index];
    const offset = index * 3;
    const baseX = field.targets[offset], baseY = field.targets[offset + 1];
    const targetX = baseX + (input.released ? seed.scatterX : 0);
    const targetY = baseY + (input.released ? seed.scatterY : 0);
    const targetZ = field.targets[offset + 2] + (input.released ? seed.scatterZ : 0);
    const dx = baseX - centerX, dy = baseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const safeDistance = Math.max(.08, distance);
    const pointerForce = hasPointer ? Math.max(0, 1 - distance / 1.5) ** 2 : 0;
    const pulseForce = Math.max(0, 1 - distance / 3.4) ** 2;

    if (input.reduced) {
      const staticPulse = input.pulse % 2 ? pulseForce * .8 : 0;
      field.positions[offset] = targetX + dx / safeDistance * (pointerForce * .65 + staticPulse);
      field.positions[offset + 1] = targetY + dy / safeDistance * (pointerForce * .65 + staticPulse);
      field.positions[offset + 2] = targetZ - pointerForce * .9 + staticPulse * .6;
      field.velocities[offset] = field.velocities[offset + 1] = field.velocities[offset + 2] = 0;
      continue;
    }
    if (pulseChanged) {
      field.velocities[offset] += dx / safeDistance * pulseForce * 8;
      field.velocities[offset + 1] += dy / safeDistance * pulseForce * 8;
      field.velocities[offset + 2] += pulseForce * 5;
    }
    for (let iteration = 0; iteration < steps; iteration++) {
      for (let axis = 0; axis < 3; axis++) {
        const target = axis === 0 ? targetX : axis === 1 ? targetY : targetZ;
        const pointerOffset = axis === 0 ? dx / safeDistance * pointerForce * .7 : axis === 1 ? dy / safeDistance * pointerForce * .7 : -pointerForce * 1.2;
        const drift = input.released ? Math.sin(input.time * .65 + index * 1.37 + axis) * .12 : 0;
        field.velocities[offset + axis] = (field.velocities[offset + axis] + (target + pointerOffset + drift - field.positions[offset + axis]) * 65 * step) * damping;
        field.positions[offset + axis] += field.velocities[offset + axis] * step;
      }
    }
  }
  field.lastPulse = Number.isFinite(input.pulse) ? input.pulse : field.lastPulse;
}

const smooth = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * Blend the resting targets between consecutive shapes. `progress` 0 is the first shape, 1 the second, and so on.
 * Mid-transition the particles loosen along their scatter vectors so one shape visibly dissolves into the next.
 */
export function retargetParticleField(field: ParticleField, shapes: readonly Float32Array[], progress: number, reduced = false) {
  if (!shapes.length) return;
  const last = shapes.length - 1;
  const clamped = Math.min(last, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const index = Math.min(Math.max(0, last - 1), Math.floor(clamped));
  const from = shapes[index], to = shapes[Math.min(last, index + 1)];
  const fraction = clamped - index;
  const blend = reduced ? (fraction < .5 ? 0 : 1) : smooth(.18, .82, fraction);
  const loosen = reduced ? 0 : Math.sin(blend * Math.PI) * .42;
  const length = Math.min(field.targets.length, from.length, to.length);
  for (let offset = 0; offset < length; offset += 3) {
    const seed = field.seeds[offset / 3];
    field.targets[offset] = from[offset] + (to[offset] - from[offset]) * blend + seed.scatterX * loosen;
    field.targets[offset + 1] = from[offset + 1] + (to[offset + 1] - from[offset + 1]) * blend + seed.scatterY * loosen;
    field.targets[offset + 2] = from[offset + 2] + (to[offset + 2] - from[offset + 2]) * blend + seed.scatterZ * loosen;
  }
}

/** Map a scroll offset onto chapter positions: 0 at the first chapter's top, 1 at the second's, clamped at both ends. */
export function chapterProgress(tops: readonly number[], offset: number) {
  if (tops.length < 2 || !Number.isFinite(offset)) return 0;
  if (offset <= tops[0]) return 0;
  for (let index = 0; index < tops.length - 1; index++) {
    const start = tops[index], end = tops[index + 1];
    if (offset < end) return index + (end > start ? (offset - start) / (end - start) : 0);
  }
  return tops.length - 1;
}
