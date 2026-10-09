export type RotationTarget = 'earth' | 'moon' | 'saturn' | 'galaxy';
export type DragAxis = 'pending' | 'horizontal' | 'vertical';
export const rotationTargets = ['earth', 'moon', 'saturn', 'galaxy'] as const;

export function rotationTargetForChapter(id: string): RotationTarget | undefined {
  if (id === 'earth' || id === 'moon' || id === 'saturn') return id;
  return id === 'arm' || id === 'galaxy' ? 'galaxy' : undefined;
}

/** Disable dragging in transitions where no single model dominates the frame. */
export function rotationTargetAtProgress(progress: number): RotationTarget | undefined {
  if (!Number.isFinite(progress)) return undefined;
  if (progress >= 0 && progress <= .075) return 'earth';
  if (progress >= .125 && progress <= .205) return 'moon';
  if (progress >= .255 && progress <= .345) return 'saturn';
  return progress >= .825 && progress <= 1 ? 'galaxy' : undefined;
}

/** Once a gesture has a direction, never take it away from native scrolling. */
export function dragAxis(dx: number, dy: number, previous: DragAxis = 'pending'): DragAxis {
  if (previous !== 'pending') return previous;
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return 'pending';
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return 'pending';
  return Math.abs(dx) >= Math.abs(dy) * 1.25 ? 'horizontal' : 'vertical';
}

/** Roughly one viewport-wide gesture makes one turn; additional turns stay unlimited. */
export function dragRadians(pixels: number, width: number): number {
  if (!Number.isFinite(pixels)) return 0;
  return pixels * Math.PI * 2 / Math.max(240, (Number.isFinite(width) ? width : 390) * 1.1);
}

export function dragVelocity(pixels: number, milliseconds: number, width: number): number {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0 || milliseconds > 140) return 0;
  return Math.min(6, Math.max(-6, dragRadians(pixels, width) * 1000 / Math.max(8, milliseconds)));
}

export function advanceRotation(velocity: number, delta: number): { angle: number; velocity: number } {
  if (!Number.isFinite(velocity) || !Number.isFinite(delta) || delta <= 0 || Math.abs(velocity) < .015) return { angle: 0, velocity: 0 };
  const next = velocity * Math.exp(-5.5 * Math.min(.05, delta));
  return { angle: (velocity - next) / 5.5, velocity: Math.abs(next) < .015 ? 0 : next };
}
