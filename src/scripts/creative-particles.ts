export type ParticleSeed = { x: number; y: number; z: number; radius: number; blue: boolean; scatterX: number; scatterY: number; scatterZ: number };
export type ParticleField = { seeds: readonly ParticleSeed[]; positions: Float32Array; velocities: Float32Array; lastPulse: number };
export type ParticleInput = { delta: number; time: number; pointer: { x: number; y: number; active: boolean }; released: boolean; pulse: number; reduced: boolean; count?: number };

export function particleRandom(seed = 147) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(1664525, value) + 1013904223) >>> 0; return value / 4294967296; };
}

export function createParticleField(seeds: readonly ParticleSeed[]): ParticleField {
  const positions = new Float32Array(seeds.length * 3);
  seeds.forEach((seed, index) => { positions[index * 3] = seed.x; positions[index * 3 + 1] = seed.y; positions[index * 3 + 2] = seed.z; });
  return { seeds, positions, velocities: new Float32Array(positions.length), lastPulse: 0 };
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
    const targetX = seed.x + (input.released ? seed.scatterX : 0);
    const targetY = seed.y + (input.released ? seed.scatterY : 0);
    const targetZ = seed.z + (input.released ? seed.scatterZ : 0);
    const dx = seed.x - centerX, dy = seed.y - centerY;
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
