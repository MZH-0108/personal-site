import * as THREE from 'three';
import { createBodyField, updateBodyField, type BodySeed } from './creative-bodies';
import { createParticleField, particleRandom, retargetParticleField, updateParticleField, type ParticleSeed } from './creative-particles';

export type CreativeFrame = {
  time: number;
  delta: number;
  pointer: { x: number; y: number; active: boolean };
  released: boolean;
  pulse: number;
  reduced: boolean;
  /** Scroll chapter position: 0 is the opening word, each whole number the next chapter's shape. */
  progress: number;
};

const DESKTOP_COUNT = 2450;
const COMPACT_COUNT = 1250;

/** Sample the actual local font silhouette, not a handwritten approximation of MZH. */
function wordSeeds(): ParticleSeed[] {
  const mask = document.createElement('canvas');
  mask.width = 1000; mask.height = 390;
  const context = mask.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('The word silhouette could not be prepared.');
  context.font = '900 310px Arial, Helvetica, sans-serif';
  context.textAlign = 'center'; context.textBaseline = 'alphabetic';
  context.fillStyle = '#fff'; context.fillText('MZH', 500, 312);
  const pixels = context.getImageData(0, 0, mask.width, mask.height).data;
  const random = particleRandom(108);
  const candidates: ParticleSeed[] = [];
  let row = 0;
  for (let gridY = 80; gridY < 315; gridY += 6.3, row++) {
    for (let gridX = 135 + (row % 2 ? 3.6 : 0); gridX < 870; gridX += 6.9) {
      const x = gridX + (random() - .5) * 4.8;
      const y = gridY + (random() - .5) * 4.8;
      const pixel = (Math.floor(y) * mask.width + Math.floor(x)) * 4;
      if (pixels[pixel + 3] < 180) continue;
      const jitterX = (random() - .5) * .045, jitterY = (random() - .5) * .045;
      const localY = (198 - y) * .017;
      const edge = [[-5, 0], [5, 0], [0, -5], [0, 5]].some(([dx, dy]) => pixels[((Math.floor(y) + dy) * mask.width + Math.floor(x) + dx) * 4 + 3] < 180);
      candidates.push({
        x: (x - 500) * .017 + localY * .13 + jitterX,
        y: localY + jitterY,
        z: edge && random() < .45 ? -.65 - random() * .28 : .13 + (random() - .5) * .17,
        radius: .076 + Math.pow(random(), 2.4) * .066,
        blue: random() < .105,
        scatterX: (random() - .5) * 4.9,
        scatterY: (random() - .35) * 3.2,
        scatterZ: (random() - .3) * 3.6,
      });
    }
  }
  // Shuffle before limiting so narrow screens retain all three letters evenly.
  for (let index = candidates.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swap]] = [candidates[swap], candidates[index]];
  }
  const result = candidates.slice(0, DESKTOP_COUNT);
  return result;
}

type Draw = (context: CanvasRenderingContext2D) => void;

/** Sample any drawn silhouette into resting positions that share the word's scale and origin. */
function shapeTargets(draw: Draw, count: number, seed: number): Float32Array {
  const mask = document.createElement('canvas');
  mask.width = 1000; mask.height = 390;
  const context = mask.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('A chapter silhouette could not be prepared.');
  context.fillStyle = context.strokeStyle = '#fff';
  context.lineCap = context.lineJoin = 'round';
  draw(context);
  const pixels = context.getImageData(0, 0, mask.width, mask.height).data;
  const random = particleRandom(seed);
  const points: number[] = [];
  let row = 0;
  for (let gridY = 30; gridY < 362; gridY += 5.2, row++) {
    for (let gridX = 90 + (row % 2 ? 2.8 : 0); gridX < 910; gridX += 5.6) {
      const x = gridX + (random() - .5) * 3.6, y = gridY + (random() - .5) * 3.6;
      if (pixels[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] >= 180) points.push(x, y);
    }
  }
  const total = points.length / 2;
  if (!total) throw new Error('A chapter silhouette came out empty.');
  for (let index = total - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [points[index * 2], points[swap * 2]] = [points[swap * 2], points[index * 2]];
    [points[index * 2 + 1], points[swap * 2 + 1]] = [points[swap * 2 + 1], points[index * 2 + 1]];
  }
  const targets = new Float32Array(count * 3);
  for (let index = 0; index < count; index++) {
    const pick = index % total;
    targets[index * 3] = (points[pick * 2] - 500) * .017 + (random() - .5) * .05;
    targets[index * 3 + 1] = (198 - points[pick * 2 + 1]) * .017 + (random() - .5) * .05;
    // Particles beyond the first pass over the silhouette settle behind it, giving the shape thickness.
    targets[index * 3 + 2] = (index < total ? .12 : -.5) + (random() - .5) * .34;
  }
  return targets;
}

const roundedRect = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
};

/** A phone beside three menu cards: the family ordering mini program. */
const drawOrdering: Draw = context => {
  roundedRect(context, 250, 50, 178, 290, 30); context.fill();
  [128, 250, 372].forEach((y, index) => { roundedRect(context, 470, y - 78, 300 - index * 26, 62, 20); context.fill(); });
  context.globalCompositeOperation = 'destination-out';
  roundedRect(context, 270, 84, 138, 60, 12); context.fill();
  [176, 214, 252].forEach(y => { roundedRect(context, 270, y, 138, 16, 8); context.fill(); });
  context.beginPath(); context.arc(339, 308, 12, 0, Math.PI * 2); context.fill();
  [81, 203, 325].forEach(y => { context.beginPath(); context.arc(504, y, 13, 0, Math.PI * 2); context.fill(); });
  context.globalCompositeOperation = 'source-over';
};

/** Receding horseshoe arches over a roadway: a tunnel seen from its portal. */
const drawTunnel: Draw = context => {
  const arch = (radiusX: number, radiusY: number, width: number) => {
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(500 - radiusX, 338);
    context.lineTo(500 - radiusX, 250);
    context.ellipse(500, 250, radiusX, radiusY, 0, Math.PI, Math.PI * 2);
    context.lineTo(500 + radiusX, 338);
    context.stroke();
  };
  arch(262, 178, 50); arch(170, 116, 32); arch(98, 66, 20);
  context.beginPath(); context.moveTo(486, 252); context.lineTo(514, 252); context.lineTo(560, 340); context.lineTo(440, 340); context.closePath(); context.fill();
};

/** Angle brackets around a slash: code, and teaching it. */
const drawCode: Draw = context => {
  context.lineWidth = 50;
  context.beginPath(); context.moveTo(360, 78); context.lineTo(212, 196); context.lineTo(360, 314); context.stroke();
  context.beginPath(); context.moveTo(640, 78); context.lineTo(788, 196); context.lineTo(640, 314); context.stroke();
  context.beginPath(); context.moveTo(556, 58); context.lineTo(444, 334); context.stroke();
};

/** A loose cloud that clears the centre of the stage while the work cards are on screen. */
function cloudTargets(count: number, seed: number): Float32Array {
  const random = particleRandom(seed);
  const targets = new Float32Array(count * 3);
  for (let index = 0; index < count; index++) {
    targets[index * 3] = (random() - .5) * 19;
    targets[index * 3 + 1] = -1.4 + random() * 6.4;
    targets[index * 3 + 2] = -7.5 + random() * 8;
  }
  return targets;
}

type BodyKind = 'sphere' | 'gem' | 'ring' | 'pill';
type BodyTone = 'blue' | 'graphite' | 'pearl';
type BodySpec = BodySeed & { kind: BodyKind; tone: BodyTone };
const body = (homeX: number, homeY: number, homeZ: number, radius: number, kind: BodyKind, tone: BodyTone): BodySpec => ({ homeX, homeY, homeZ, radius, kind, tone });
// Homes are relative to the word's centre. Wide screens keep the copy's side clear; narrow ones ring the word above and below.
const WIDE_BODIES: BodySpec[] = [
  body(-3.5, 3.0, -.6, .46, 'sphere', 'blue'), body(-1.1, 3.4, .7, .34, 'gem', 'graphite'), body(1.5, 3.2, -.9, .56, 'ring', 'pearl'),
  body(4.1, 3.1, .5, .40, 'pill', 'blue'), body(6.0, 1.5, -.5, .52, 'sphere', 'pearl'), body(6.4, -.7, .8, .32, 'gem', 'blue'),
  body(4.9, -2.3, 1.3, .44, 'ring', 'graphite'), body(2.2, -2.5, 1.7, .30, 'sphere', 'blue'), body(-.4, -2.4, 1.5, .42, 'pill', 'pearl'),
  body(-2.9, -2.4, 1.1, .36, 'gem', 'graphite'), body(.9, -3.3, 2.6, .26, 'sphere', 'blue'), body(3.2, .5, 2.9, .24, 'gem', 'pearl'),
  body(-.9, 1.0, 3.0, .20, 'sphere', 'graphite'),
];
const COMPACT_BODIES: BodySpec[] = [
  body(-2.0, 2.5, .5, .30, 'sphere', 'blue'), body(-.5, 3.0, -.5, .24, 'gem', 'graphite'), body(1.1, 2.4, .8, .34, 'ring', 'pearl'),
  body(2.2, 3.1, -.3, .22, 'pill', 'blue'), body(2.0, -1.9, 1.3, .26, 'sphere', 'pearl'), body(-1.7, -1.9, 1.1, .24, 'gem', 'blue'),
];
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export async function createCreativeScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x090f18, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x090f18, .022);
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 70);
  const cameraTarget = new THREE.Vector3();
  const resources = new Set<THREE.BufferGeometry | THREE.Material | THREE.Texture>();
  const keep = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(resource: T): T => { resources.add(resource); return resource; };
  const instances = new Set<THREE.InstancedMesh>();
  let environment: THREE.WebGLRenderTarget | undefined;
  let disposed = false;
  let compact = false;
  let activeCount = 0;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    instances.forEach(instance => instance.dispose()); instances.clear();
    resources.forEach(resource => resource.dispose()); resources.clear();
    environment?.dispose(); scene.clear(); renderer.dispose(); renderer.forceContextLoss();
    delete canvas.dataset.particles;
  };
  try {
  // A few broad studio softboxes yield clean metal highlights, not busy room reflections.
  const studio = new THREE.Scene(); studio.background = new THREE.Color(0x05070c);
  const studioResources: (THREE.BufferGeometry | THREE.Material)[] = [];
  const pmrem = new THREE.PMREMGenerator(renderer);
  try {
    const panel = (position: [number, number, number], width: number, height: number, rgb: [number, number, number]) => {
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(...rgb), side: THREE.DoubleSide, toneMapped: false });
      studioResources.push(geometry, material);
      const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); mesh.lookAt(0, 0, 0); studio.add(mesh);
    };
    panel([-3, 5, 4], 8, 9, [3.8, 4.0, 4.4]);
    panel([5, 2, -4], 4, 10, [.25, .38, 1.2]);
    panel([-5, 0, -2], 4, 7, [.6, .65, .8]);
    environment = pmrem.fromScene(studio, .06);
    scene.environment = environment.texture;
  } finally { studioResources.forEach(resource => resource.dispose()); studio.clear(); pmrem.dispose(); }

  const key = new THREE.DirectionalLight(0xf0f4ff, 2.0);
  key.position.set(-4, 6, 7); scene.add(key);
  const fill = new THREE.DirectionalLight(0x567dff, 1.5);
  fill.position.set(5, 1, -3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 2.0);
  rim.position.set(-1, 2, -5); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xb4c8ff, 0x050711, .20));

  const stage = new THREE.Group(); stage.rotation.set(.07, -.20, .055);
  const seeds = wordSeeds();
  const field = createParticleField(seeds);
  // Chapter shapes, in scroll order. The journey opens and closes on the word itself.
  const wordTargets = field.targets.slice();
  const shapes = [wordTargets, shapeTargets(drawOrdering, seeds.length, 211), shapeTargets(drawTunnel, seeds.length, 307), shapeTargets(drawCode, seeds.length, 409), cloudTargets(seeds.length, 503), wordTargets];
  const lastShape = shapes.length - 1;
  let shapedProgress = -1, shapedReduced = false;
  const wordBounds = new THREE.Box3();
  const boundPoint = new THREE.Vector3();
  seeds.forEach(seed => {
    wordBounds.expandByPoint(boundPoint.set(seed.x - seed.radius * 1.2, seed.y - seed.radius * 1.2, seed.z - seed.radius));
    wordBounds.expandByPoint(boundPoint.set(seed.x + seed.radius * 1.2, seed.y + seed.radius * 1.2, seed.z + seed.radius));
  });
  const fittedBounds = new THREE.Box3();
  const fittedSize = new THREE.Vector3();
  const geometry = keep(new THREE.SphereGeometry(1, 20, 12));
  const silver = keep(new THREE.MeshPhysicalMaterial({ color: 0xe8edf6, metalness: .88, roughness: .23, clearcoat: .20, clearcoatRoughness: .22, envMapIntensity: .95 }));
  const balls = new THREE.InstancedMesh(geometry, silver, seeds.length);
  instances.add(balls);
  balls.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  balls.frustumCulled = false;
  const color = new THREE.Color();
  seeds.forEach((seed, index) => { balls.setColorAt(index, color.set(seed.blue ? 0x0547ff : 0xc6d0df)); });
  if (balls.instanceColor) balls.instanceColor.needsUpdate = true;
  stage.add(balls); scene.add(stage);

  const reflectionMaterial = keep(new THREE.MeshBasicMaterial({ color: 0x557cc0, transparent: true, opacity: .065, depthWrite: false, depthTest: false }));
  const reflection = new THREE.InstancedMesh(geometry, reflectionMaterial, seeds.length);
  instances.add(reflection);
  reflection.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  reflection.frustumCulled = false; reflection.renderOrder = 1;
  stage.add(reflection);
  // A matte dark deck must not reflect the bright environment as a grey backdrop.
  const floorMaterial = keep(new THREE.MeshBasicMaterial({ color: 0x090f18 }));
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(110, 90)), floorMaterial);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.17;
  scene.add(floor);

  // A low-cost physical floor light pool; no external bitmap or full-screen post processing.
  const glowMaterial = keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uIntensity: { value: .18 } },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv; uniform float uIntensity; void main(){vec2 p=(vUv-.5)*2.;float fade=exp(-dot(p,p)*4.5);gl_FragColor=vec4(.025,.13,.85,fade*uIntensity);}`,
  }));
  const glow = new THREE.Mesh(keep(new THREE.PlaneGeometry(15, 7)), glowMaterial);
  glow.rotation.x = -Math.PI / 2; glow.position.set(1.4, -2.16, .8); scene.add(glow);

  // Floating bodies around the word: shoved by the pointer, bouncing off each other.
  const bodyGroup = new THREE.Group(); scene.add(bodyGroup);
  const bodyGeometry: Record<BodyKind, THREE.BufferGeometry> = {
    sphere: keep(new THREE.SphereGeometry(1, 48, 32)),
    gem: keep(new THREE.IcosahedronGeometry(1, 0)),
    ring: keep(new THREE.TorusGeometry(.72, .28, 20, 48)),
    pill: keep(new THREE.CapsuleGeometry(.5, .9, 8, 20)),
  };
  const bodyMaterial: Record<BodyTone, THREE.MeshPhysicalMaterial> = {
    blue: keep(new THREE.MeshPhysicalMaterial({ color: 0x1b4dff, metalness: .1, roughness: .22, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: 1.1 })),
    graphite: keep(new THREE.MeshPhysicalMaterial({ color: 0x2a3448, metalness: .78, roughness: .3, envMapIntensity: 1.15 })),
    pearl: keep(new THREE.MeshPhysicalMaterial({ color: 0xdfe5f0, metalness: .08, roughness: .3, clearcoat: .6, clearcoatRoughness: .25, envMapIntensity: .8 })),
  };
  const gemMaterial = new Map<BodyTone, THREE.MeshPhysicalMaterial>();
  const materialFor = (spec: BodySpec) => {
    if (spec.kind !== 'gem') return bodyMaterial[spec.tone];
    let faceted = gemMaterial.get(spec.tone);
    if (!faceted) { faceted = keep(bodyMaterial[spec.tone].clone()); faceted.flatShading = true; gemMaterial.set(spec.tone, faceted); }
    return faceted;
  };
  const bodyMeshes = WIDE_BODIES.map(() => { const mesh = new THREE.Mesh<THREE.BufferGeometry, THREE.Material>(geometry, bodyMaterial.blue); mesh.visible = false; bodyGroup.add(mesh); return mesh; });
  let bodySpecs: BodySpec[] = WIDE_BODIES;
  let bodyField = createBodyField(bodySpecs);
  const bodyPointer = { x: 0, y: 0, active: false };
  const layoutBodies = (specs: BodySpec[]) => {
    bodySpecs = specs; bodyField = createBodyField(specs);
    bodyMeshes.forEach((mesh, index) => {
      const spec = specs[index];
      mesh.visible = Boolean(spec);
      if (!spec) return;
      mesh.geometry = bodyGeometry[spec.kind]; mesh.material = materialFor(spec);
      mesh.rotation.set(index * 1.7, index * .9, index * 2.3);
    });
  };

  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();
  const hit = new THREE.Vector3();
  const pointerPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const transform = new THREE.Object3D();
  const localPointer = { x: 0, y: 0, active: false };

  const resize = (width: number, height: number, requestedDpr: number) => {
    if (disposed) return;
    const safeWidth = Math.max(1, width), safeHeight = Math.max(1, height);
    compact = safeWidth / safeHeight < 1.08 || safeWidth < 700;
    const shortLandscape = safeWidth > 700 && safeHeight < 470;
    activeCount = Math.min(seeds.length, compact ? COMPACT_COUNT : DESKTOP_COUNT);
    canvas.dataset.particles = String(activeCount);
    renderer.setPixelRatio(Math.max(.8, Math.min(Number.isFinite(requestedDpr) ? requestedDpr : 1, compact ? 1.25 : 1.5)));
    renderer.setSize(safeWidth, safeHeight, false);
    camera.aspect = safeWidth / safeHeight;
    camera.fov = compact ? 44 : 36;
    stage.scale.set(compact ? .82 : .76, compact ? 1 : .94, 1);
    stage.position.set(compact ? 0 : shortLandscape ? 4.3 : 1.18, compact ? -.40 : shortLandscape ? 2.05 : 1.02, 0);
    stage.updateMatrixWorld(true);
    bodyGroup.position.copy(stage.position);
    const nextBodies = compact ? COMPACT_BODIES : WIDE_BODIES;
    if (nextBodies !== bodySpecs || !bodyMeshes[0].visible) layoutBodies(nextBodies);
    fittedBounds.copy(wordBounds).applyMatrix4(stage.matrixWorld).getSize(fittedSize);
    // Fit the actual font's full bounds, including perspective depth and 6% margins.
    const horizontalDistance = fittedSize.x / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * .90);
    const distance = compact ? Math.max(14.2, horizontalDistance + fittedSize.z * .4) : 13.8;
    camera.position.set(.35, compact ? 1.1 : 1.8, distance);
    cameraTarget.set(0, compact ? .2 : .35, 0);
    camera.lookAt(cameraTarget); camera.updateProjectionMatrix();
    balls.count = activeCount; reflection.count = compact || shortLandscape ? 0 : activeCount;
    glow.position.x = compact ? 0 : 1.4;
    // Keep the entire portrait word above the deck, not submerged behind it.
    floor.position.y = compact ? -2.85 : -2.17;
    glow.position.y = floor.position.y + .01;
  };

  const update = (state: CreativeFrame) => {
    if (disposed) return;
    localPointer.active = false; bodyPointer.active = false;
    if (Number.isFinite(state.pointer.x) && Number.isFinite(state.pointer.y)) {
      pointerNDC.set(state.pointer.x, state.pointer.y);
      raycaster.setFromCamera(pointerNDC, camera);
      if (raycaster.ray.intersectPlane(pointerPlane, hit)) {
        bodyPointer.x = hit.x - bodyGroup.position.x; bodyPointer.y = hit.y - bodyGroup.position.y; bodyPointer.active = state.pointer.active;
        stage.worldToLocal(hit);
        localPointer.x = hit.x; localPointer.y = hit.y; localPointer.active = state.pointer.active;
      }
    }
    const progress = Math.min(lastShape, Math.max(0, Number.isFinite(state.progress) ? state.progress : 0));
    if (progress !== shapedProgress || state.reduced !== shapedReduced) {
      retargetParticleField(field, shapes, progress, state.reduced);
      shapedProgress = progress; shapedReduced = state.reduced;
    }
    // Bodies frame the word at both ends of the journey and clear the stage for the chapters between.
    const presence = Math.max(1 - smoothstep(.05, .55, progress), smoothstep(lastShape - .55, lastShape - .08, progress));
    bodyGroup.visible = presence > .002;
    if (bodyGroup.visible) {
      updateBodyField(bodyField, { delta: state.delta, time: state.time, pointer: bodyPointer, pulse: state.pulse, reduced: state.reduced, spread: 1 - presence });
      const grow = 1 - (1 - presence) ** 3;
      bodySpecs.forEach((spec, index) => {
        const mesh = bodyMeshes[index], offset = index * 3;
        mesh.position.set(bodyField.positions[offset], bodyField.positions[offset + 1], bodyField.positions[offset + 2]);
        mesh.scale.setScalar(spec.radius * grow);
        if (!state.reduced) {
          const speed = Math.hypot(bodyField.velocities[offset], bodyField.velocities[offset + 1]);
          const turn = state.delta * (.22 + speed * .55);
          mesh.rotation.x += turn * (index % 2 ? 1 : -.7); mesh.rotation.y += turn * (index % 3 ? .8 : -1);
        }
      });
    }
    updateParticleField(field, { ...state, pointer: localPointer, count: activeCount });
    for (let index = 0; index < activeCount; index++) {
      const seed = seeds[index], offset = index * 3;
      transform.position.set(field.positions[offset], field.positions[offset + 1], field.positions[offset + 2]);
      transform.rotation.set(index * .27, index * .13, seed.blue ? index * .8 : 0);
      const radius = seed.radius * (compact ? 1.17 : 1);
      transform.scale.set(seed.blue && index % 3 === 0 ? radius * 1.9 : radius, seed.blue && index % 3 === 0 ? radius * .70 : radius, radius);
      transform.updateMatrix(); balls.setMatrixAt(index, transform.matrix);
      if (!compact) {
        const height = Math.max(0, field.positions[offset + 1] + 2.1);
        transform.position.y = -2.17 - height * .30;
        transform.scale.set(seed.radius * 1.15, seed.radius * .22, seed.radius * 1.1);
        transform.updateMatrix(); reflection.setMatrixAt(index, transform.matrix);
      }
    }
    balls.instanceMatrix.needsUpdate = true;
    if (!compact) reflection.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  };

  resize(canvas.clientWidth || 1440, canvas.clientHeight || 914, 1);
  update({ time: 0, delta: 0, pointer: { x: 0, y: 0, active: false }, released: false, pulse: 0, reduced: true, progress: 0 });
  try { await renderer.compileAsync(scene, camera); } catch { /* The first render remains an available fallback. */ }
  return { update, resize, dispose };
  } catch (error) { dispose(); throw error; }
}
