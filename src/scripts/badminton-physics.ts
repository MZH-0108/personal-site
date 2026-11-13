/**
 * Badminton juggling physics, in screen-plane game units (x right, y up).
 *
 * A shuttlecock is unusual: its feather skirt gives it very high quadratic drag, so it leaves the
 * racket fast, stalls sharply near the top, and the drag torque swings the cork round to lead the
 * fall. Both behaviours come from two terms below: `DRAG` on the velocity, and an aerodynamic
 * torque that turns the nose toward the direction of travel in proportion to speed squared.
 */

export const GRAVITY = 9;
/** Terminal fall speed. Real shuttles fall at roughly 6.8 m/s; this is tuned to the stage scale. */
export const TERMINAL = 5.2;
const DRAG = GRAVITY / (TERMINAL * TERMINAL);
/** How strongly air turns the cork toward the direction of travel, and how much the skirt damps the swing. */
const ALIGN = 1.6;
const ANGULAR_DAMPING = 5.5;

/** Racket face, as a disc in the screen plane around the head centre. */
export const CONTACT_RADIUS = .62;
/** Upward racket speed that turns a contact into a counted stroke rather than a dead bounce. */
export const SWING_SPEED = 1.4;
const HIT_COOLDOWN = .22;
const REST_SPEED = 1.1;

export type ShuttleMode = 'flying' | 'resting' | 'dropped';
export type Shuttle = {
  x: number; y: number; vx: number; vy: number;
  /** Direction the cork points, in radians (−π/2 is straight down). */
  angle: number; angular: number;
  /** Rotation about the shuttle's own axis; real shuttles spin as they fly. */
  spin: number;
  mode: ShuttleMode;
  /** Seconds left before a dropped shuttle is served again, or before another stroke can register. */
  timer: number; cooldown: number;
  /** Where the shuttle sits on the strings while resting, relative to the racket head. */
  restOffset: number;
};
export type Racket = { x: number; y: number; vx: number; vy: number };
export type Bounds = { left: number; right: number; floor: number; top: number };
export type StepEvent = 'none' | 'hit' | 'bounce' | 'rest' | 'drop' | 'serve';

export function createShuttle(x = 0, y = 3): Shuttle {
  return { x, y, vx: 0, vy: 0, angle: -Math.PI / 2, angular: 0, spin: 0, mode: 'flying', timer: 0, cooldown: 0, restOffset: 0 };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const wrapAngle = (value: number) => Math.atan2(Math.sin(value), Math.cos(value));

/** Serve a fresh shuttle from above the stage, dropping toward the centre. */
export function serve(shuttle: Shuttle, bounds: Bounds, random = Math.random) {
  const span = (bounds.right - bounds.left) * .18;
  shuttle.x = (bounds.left + bounds.right) / 2 + (random() - .5) * span;
  shuttle.y = bounds.top;
  shuttle.vx = 0; shuttle.vy = -.5;
  shuttle.angle = -Math.PI / 2; shuttle.angular = (random() - .5) * .6;
  shuttle.mode = 'flying'; shuttle.timer = 0; shuttle.cooldown = 0;
}

/**
 * Resolve a stroke. Upward racket speed sets the height; hitting off-centre or with a sideways swing
 * sends it sideways, with a gentle pull back toward the middle so a rally stays on screen.
 */
export function strike(shuttle: Shuttle, racket: Racket, bounds: Bounds) {
  const centre = (bounds.left + bounds.right) / 2;
  const lift = clamp(racket.vy, SWING_SPEED, 9);
  shuttle.vy = clamp(5.2 + lift * .78, 6.2, 12.5);
  shuttle.vx = clamp(racket.vx * .32 + (shuttle.x - racket.x) * 2.4 + (centre - shuttle.x) * .35, -4.2, 4.2);
  // The racket face snaps the cork upward; the drag torque then does the flip on the way down.
  shuttle.angle = Math.atan2(shuttle.vy, shuttle.vx);
  shuttle.angular = 0;
  shuttle.mode = 'flying';
  shuttle.cooldown = HIT_COOLDOWN;
}

export function stepShuttle(shuttle: Shuttle, racket: Racket, bounds: Bounds, delta: number, random = Math.random): StepEvent {
  const dt = clamp(Number.isFinite(delta) ? delta : 0, 0, .05);
  if (dt === 0) return 'none';
  shuttle.cooldown = Math.max(0, shuttle.cooldown - dt);

  if (shuttle.mode === 'dropped') {
    shuttle.timer -= dt;
    shuttle.spin += dt * .3;
    if (shuttle.timer > 0) return 'none';
    serve(shuttle, bounds, random);
    return 'serve';
  }

  if (shuttle.mode === 'resting') {
    // Sitting on the strings: ride along with the racket until it is flicked upward.
    shuttle.x = racket.x + shuttle.restOffset;
    shuttle.y = racket.y;
    shuttle.vx = racket.vx; shuttle.vy = racket.vy;
    shuttle.angle += wrapAngle(-Math.PI / 2 - shuttle.angle) * Math.min(1, dt * 10);
    shuttle.angular = 0;
    if (racket.vy > SWING_SPEED) { strike(shuttle, racket, bounds); return 'hit'; }
    return 'none';
  }

  // Sub-step so fast strokes cannot tunnel through the racket face.
  const steps = Math.ceil(dt / .006);
  const h = dt / steps;
  let event: StepEvent = 'none';
  for (let step = 0; step < steps && event === 'none'; step++) {
    const speed = Math.hypot(shuttle.vx, shuttle.vy);
    shuttle.vx += -DRAG * speed * shuttle.vx * h;
    shuttle.vy += (-GRAVITY - DRAG * speed * shuttle.vy) * h;
    shuttle.x += shuttle.vx * h;
    shuttle.y += shuttle.vy * h;

    const heading = Math.atan2(shuttle.vy, shuttle.vx);
    // Linear in the wrapped angle (not its sine), so a shuttle pointing exactly against its travel still turns over.
    const torque = speed > .05 ? ALIGN * speed * speed * wrapAngle(heading - shuttle.angle) : 0;
    shuttle.angular += (torque - ANGULAR_DAMPING * shuttle.angular) * h;
    shuttle.angle = wrapAngle(shuttle.angle + shuttle.angular * h);
    shuttle.spin += speed * 1.6 * h;

    if (shuttle.x < bounds.left) { shuttle.x = bounds.left; shuttle.vx = Math.abs(shuttle.vx) * .45; }
    if (shuttle.x > bounds.right) { shuttle.x = bounds.right; shuttle.vx = -Math.abs(shuttle.vx) * .45; }

    const dx = shuttle.x - racket.x, dy = shuttle.y - racket.y;
    const relative = shuttle.vy - racket.vy;
    // Contact: inside the face disc, and closing on it from above (or the racket rising into it).
    if (shuttle.cooldown === 0 && Math.abs(dx) < CONTACT_RADIUS && dy < .14 && dy > -.34 && relative < .4) {
      if (racket.vy > SWING_SPEED) { strike(shuttle, racket, bounds); event = 'hit'; }
      else if (Math.abs(relative) < REST_SPEED) {
        shuttle.mode = 'resting'; shuttle.restOffset = clamp(dx, -CONTACT_RADIUS * .6, CONTACT_RADIUS * .6); event = 'rest';
      } else {
        // A racket held still gives only a dead bounce, so a rally needs real strokes.
        shuttle.y = racket.y + .14; shuttle.vy = racket.vy + Math.abs(relative) * .28; shuttle.vx = shuttle.vx * .6 + dx * .8;
        shuttle.cooldown = HIT_COOLDOWN * .5; event = 'bounce';
      }
    }

    if (shuttle.y <= bounds.floor) {
      shuttle.y = bounds.floor; shuttle.vx = 0; shuttle.vy = 0; shuttle.angular = 0;
      // Dropped shuttles lie on their side, cork down-slope.
      shuttle.angle = shuttle.angle > -Math.PI / 2 && shuttle.angle < Math.PI / 2 ? -.32 : Math.PI + .32;
      shuttle.mode = 'dropped'; shuttle.timer = 1.1;
      event = 'drop';
    }
  }
  return event;
}

/** A light spring so the racket head trails the pointer with some weight; returns the new racket velocity. */
export function followPointer(racket: Racket, targetX: number, targetY: number, delta: number) {
  const dt = clamp(Number.isFinite(delta) ? delta : 0, 0, .05);
  if (dt === 0) return racket;
  const x = Number.isFinite(targetX) ? targetX : racket.x, y = Number.isFinite(targetY) ? targetY : racket.y;
  const blend = 1 - Math.exp(-dt * 26);
  const nextX = racket.x + (x - racket.x) * blend, nextY = racket.y + (y - racket.y) * blend;
  // Velocity is smoothed over a few frames so a single jittery pointer sample cannot fake a swing.
  const smoothing = 1 - Math.exp(-dt * 30);
  racket.vx += ((nextX - racket.x) / dt - racket.vx) * smoothing;
  racket.vy += ((nextY - racket.y) / dt - racket.vy) * smoothing;
  racket.x = nextX; racket.y = nextY;
  return racket;
}
