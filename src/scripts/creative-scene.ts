import * as THREE from 'three';
import { createParticleField, particleRandom, updateParticleField, type ParticleSeed } from './creative-particles';

export type CreativeFrame = {
  time: number;
  delta: number;
  pointer: { x: number; y: number; active: boolean };
  released: boolean;
  pulse: number;
  reduced: boolean;
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
    localPointer.active = false;
    if (Number.isFinite(state.pointer.x) && Number.isFinite(state.pointer.y)) {
      pointerNDC.set(state.pointer.x, state.pointer.y);
      raycaster.setFromCamera(pointerNDC, camera);
      if (raycaster.ray.intersectPlane(pointerPlane, hit)) {
        stage.worldToLocal(hit);
        localPointer.x = hit.x; localPointer.y = hit.y; localPointer.active = state.pointer.active;
      }
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
  update({ time: 0, delta: 0, pointer: { x: 0, y: 0, active: false }, released: false, pulse: 0, reduced: true });
  try { await renderer.compileAsync(scene, camera); } catch { /* The first render remains an available fallback. */ }
  return { update, resize, dispose };
  } catch (error) { dispose(); throw error; }
}
