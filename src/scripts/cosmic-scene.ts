import * as THREE from 'three';

export type CosmicState = {
  progress: number;
  time: number;
  pointer: { x: number; y: number };
  night: boolean;
  orbit: number;
  warp: number;
  reduced: boolean;
  signal?: number;
  rotation?: { earth: number; moon: number; saturn: number; galaxy: number };
};

type CosmicTextures = { earth: string; night: string; clouds: string; moon: string; saturn: string };
type CameraKey = { at: number; camera: THREE.Vector3; mobile: THREE.Vector3; target: THREE.Vector3; mobileTarget: THREE.Vector3 };

const vertexSurface = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const finishColor = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const vector = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** A single continuous camera path; the compact layout uses its own lens and framing. */
const cameraKeys: CameraKey[] = [
  { at: 0, camera: vector(0, .6, 15), mobile: vector(0, 1.2, 19), target: vector(.4, .3, 0), mobileTarget: vector(3.8, -2.2, 0) },
  { at: .18, camera: vector(-.4, 1, 11.8), mobile: vector(.4, 1.5, 16), target: vector(1.1, .25, -1), mobileTarget: vector(3.8, -1.7, 0) },
  { at: .28, camera: vector(-3.6, 1.3, 4), mobile: vector(1.5, 2.4, 8), target: vector(-.8, .6, -17), mobileTarget: vector(.5, -1.5, -14) },
  { at: .39, camera: vector(.7, 1.1, -10), mobile: vector(1.5, 1.7, -6), target: vector(-4.9, .7, -26), mobileTarget: vector(-3, -1.5, -26) },
  { at: .49, camera: vector(1.3, 1.2, -18.5), mobile: vector(1.4, 2, -14), target: vector(-5.4, .7, -27), mobileTarget: vector(-3, -1.25, -26) },
  { at: .57, camera: vector(.9, 1.4, -28), mobile: vector(1.4, 2.1, -18), target: vector(1.8, .4, -50), mobileTarget: vector(3.7, -3.3, -51) },
  { at: .66, camera: vector(-1.6, 1.2, -38), mobile: vector(1.2, 3, -23), target: vector(1.6, .4, -55), mobileTarget: vector(4, -4.2, -55) },
  { at: .76, camera: vector(-4.7, 1.6, -47), mobile: vector(-2.5, 3.1, -37), target: vector(2.4, .5, -59), mobileTarget: vector(4, -2.6, -57) },
  { at: .86, camera: vector(-2.2, .9, -67), mobile: vector(-4, 1.8, -63), target: vector(0, .2, -99), mobileTarget: vector(.4, -1.7, -99) },
  { at: 1, camera: vector(0, .3, -92), mobile: vector(0, .3, -92), target: vector(0, .25, -125), mobileTarget: vector(0, -1.2, -125) },
].map(key => ({ ...key, at: key.at * .42 })).concat([
  { at: .47, camera: vector(-1, 1, -109), mobile: vector(2, 2, -108), target: vector(2, 1, -157), mobileTarget: vector(7, -2, -158) },
  { at: .55, camera: vector(-4, 2, -133), mobile: vector(4, 4, -124), target: vector(2, 2, -163), mobileTarget: vector(8, -3, -163) },
  { at: .62, camera: vector(3, 3, -173), mobile: vector(6, 5, -167), target: vector(6, 2, -220), mobileTarget: vector(8, -2, -220) },
  { at: .70, camera: vector(0, 2, -195), mobile: vector(6, 7, -189), target: vector(1, 2, -225), mobileTarget: vector(8, -2, -225) },
  { at: .78, camera: vector(11, 5, -236), mobile: vector(10, 7, -230), target: vector(15, 3, -279), mobileTarget: vector(10, -2, -280) },
  { at: .85, camera: vector(20, 7, -265), mobile: vector(16, 9, -254), target: vector(4, 2, -288), mobileTarget: vector(7, -5, -288) },
  { at: .92, camera: vector(9, 18, -230), mobile: vector(11, 19, -203), target: vector(-2, 2, -288), mobileTarget: vector(8, -17, -288) },
  { at: 1, camera: vector(-14, 31, -202), mobile: vector(8, 22, -160), target: vector(-4, 0, -288), mobileTarget: vector(8, -24, -288) },
]);

function sampleCamera(progress: number, field: 'camera' | 'mobile' | 'target' | 'mobileTarget', result: THREE.Vector3) {
  let index = 0;
  while (index < cameraKeys.length - 2 && progress > cameraKeys[index + 1].at) index++;
  const first = cameraKeys[index];
  const second = cameraKeys[index + 1];
  const previous = cameraKeys[Math.max(0, index - 1)];
  const following = cameraKeys[Math.min(cameraKeys.length - 1, index + 2)];
  const span = second.at - first.at;
  const amount = clamp((progress - first.at) / span);
  const amount2 = amount * amount;
  const amount3 = amount2 * amount;
  const h00 = 2 * amount3 - 3 * amount2 + 1;
  const h10 = amount3 - 2 * amount2 + amount;
  const h01 = -2 * amount3 + 3 * amount2;
  const h11 = amount3 - amount2;
  for (const component of ['x', 'y', 'z'] as const) {
    const slope0 = (second[field][component] - previous[field][component]) / (second.at - previous.at);
    const slope1 = (following[field][component] - first[field][component]) / (following.at - first.at);
    result[component] = h00 * first[field][component] + h10 * span * slope0 + h01 * second[field][component] + h11 * span * slope1;
  }
}

export async function createCosmicScene(canvas: HTMLCanvasElement, urls: CosmicTextures) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.13;
  renderer.setClearColor(0x02050d, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .12, 280);
  const cameraTarget = new THREE.Vector3();
  const resources = new Set<THREE.BufferGeometry | THREE.Material | THREE.Texture>();
  const keep = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(resource: T) => { resources.add(resource); return resource; };
  let disposed = false;
  let compact = false;
  let pixelRatio = 1;
  let nightAmount = 0;
  let previousTime: number | undefined;
  let motionTime = 0;
  const sunDirection = vector(-.65, .48, .73).normalize();
  const daylight = sunDirection.clone();
  const nightlight = vector(-.34, .14, -.94).normalize();
  const keyLight = new THREE.DirectionalLight(0xfff2de, 3.3);
  keyLight.position.copy(sunDirection).multiplyScalar(30);
  scene.add(keyLight);
  scene.add(new THREE.HemisphereLight(0x8fa8db, 0x111019, .24));

  const surfaceGeometry = keep(new THREE.SphereGeometry(1, 56, 36));
  const earthUniforms = {
    uDay: { value: null as THREE.Texture | null },
    uNight: { value: null as THREE.Texture | null },
    uHasDay: { value: 0 },
    uHasNight: { value: 0 },
    uLight: { value: sunDirection },
  };
  const earthMaterial = keep(new THREE.ShaderMaterial({
    uniforms: earthUniforms,
    vertexShader: vertexSurface,
    fragmentShader: /* glsl */ `
      uniform sampler2D uDay;
      uniform sampler2D uNight;
      uniform float uHasDay;
      uniform float uHasNight;
      uniform vec3 uLight;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 view = normalize(cameraPosition - vPosition);
        float sun = dot(normal, uLight);
        vec3 albedo = mix(vec3(.024, .10, .23), texture2D(uDay, vUv).rgb, uHasDay);
        float terminator = smoothstep(-.075, .12, sun);
        float illumination = .024 + terminator * (.18 + .98 * max(sun, 0.));
        vec3 color = albedo * illumination;
        vec3 cities = texture2D(uNight, vUv).rgb;
        float nightMask = 1. - smoothstep(-.11, .14, sun);
        color += cities * nightMask * uHasNight * 1.55;
        float ocean = smoothstep(.02, .15, albedo.b - max(albedo.r, albedo.g) * .85);
        vec3 halfDirection = normalize(uLight + view);
        float reflected = pow(max(dot(normal, halfDirection), 0.), 85.) * ocean * terminator;
        color += vec3(.67, .75, .89) * reflected * .26;
        gl_FragColor = vec4(color, 1.);
        ${finishColor}
      }
    `,
  }));
  const earthSystem = new THREE.Group();
  earthSystem.position.set(3.8, .3, 0);
  earthSystem.rotation.order = 'YXZ';
  earthSystem.rotation.z = .12;
  const earth = new THREE.Mesh(surfaceGeometry, earthMaterial);
  earth.scale.setScalar(3.8);
  earth.rotation.y = -.85;
  earthSystem.add(earth);
  const cloudUniforms = { uMap: { value: null as THREE.Texture | null }, uReady: { value: 0 }, uLight: { value: sunDirection } };
  const clouds = new THREE.Mesh(surfaceGeometry, keep(new THREE.ShaderMaterial({
    uniforms: cloudUniforms,
    vertexShader: vertexSurface,
    transparent: true,
    depthWrite: false,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uReady;
      uniform vec3 uLight;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vec3 sampleColor = texture2D(uMap, vUv).rgb;
        float brightness = max(sampleColor.r, max(sampleColor.g, sampleColor.b));
        float alpha = pow(brightness, 1.18) * .65 * uReady;
        if (alpha < .012) discard;
        float light = .035 + .98 * max(dot(normalize(vNormal), uLight), 0.);
        gl_FragColor = vec4(vec3(.95, .97, 1.) * light, alpha);
        ${finishColor}
      }
    `,
  })));
  clouds.scale.setScalar(3.825);
  earthSystem.add(clouds);
  const atmosphere = new THREE.Mesh(surfaceGeometry, keep(new THREE.ShaderMaterial({
    uniforms: { uLight: { value: sunDirection } },
    vertexShader: vertexSurface,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fragmentShader: /* glsl */ `
      uniform vec3 uLight;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 view = normalize(cameraPosition - vPosition);
        float rim = pow(1. - abs(dot(normal, view)), 4.5);
        float lit = .18 + .82 * smoothstep(-.45, .7, dot(normal, uLight));
        gl_FragColor = vec4(vec3(.14, .39, .82) * lit, rim * .36);
        ${finishColor}
      }
    `,
  })));
  atmosphere.scale.setScalar(3.895);
  earthSystem.add(atmosphere);
  scene.add(earthSystem);

  const moonMaterial = keep(new THREE.MeshStandardMaterial({ color: 0xc5c0b7, roughness: .98, metalness: 0, bumpScale: .045, transparent: true }));
  const moon = new THREE.Mesh(surfaceGeometry, moonMaterial);
  moon.scale.setScalar(2.3);
  moon.position.set(-3, 1, -26);
  moon.rotation.set(.1, -.7, .03, 'YXZ');
  scene.add(moon);

  const saturnMaterial = keep(new THREE.MeshStandardMaterial({ color: 0xe8d5ad, roughness: .95, metalness: 0, transparent: true }));
  const saturnSystem = new THREE.Group();
  saturnSystem.position.set(4, 0, -55);
  saturnSystem.rotation.set(.44, 0, -.36, 'YXZ');
  const saturn = new THREE.Mesh(surfaceGeometry, saturnMaterial);
  saturn.scale.set(3.5, 3.23, 3.5);
  saturnSystem.add(saturn);
  const ringMaterial = keep(new THREE.ShaderMaterial({
    uniforms: { uLight: { value: sunDirection }, uPlanet: { value: saturnSystem.position }, uOpacity: { value: 0 } },
    vertexShader: /* glsl */ `
      varying float vRadius;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vRadius = length(position.xy);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vPosition = (modelMatrix * vec4(position, 1.)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uLight;
      uniform vec3 uPlanet;
      uniform float uOpacity;
      varying float vRadius;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        float radius = (vRadius - 4.8) / 3.;
        float band = .72 + .08 * sin(radius * 161.) + .035 * sin(radius * 431.);
        float division = smoothstep(.596, .606, radius) * (1. - smoothstep(.635, .65, radius));
        float edges = smoothstep(0., .028, radius) * (1. - smoothstep(.94, 1., radius));
        float density = band * edges * (1. - division * .94);
        density *= .58 + .42 * smoothstep(.09, .23, radius);
        vec3 color = mix(vec3(.43, .35, .26), vec3(.78, .72, .60), smoothstep(.08, .36, radius));
        color = mix(color, vec3(.52, .48, .40), smoothstep(.70, 1., radius));
        vec3 relative = vPosition - uPlanet;
        float distanceAlong = dot(relative, uLight);
        float discriminant = distanceAlong * distanceAlong - dot(relative, relative) + 3.45 * 3.45;
        float shadow = step(0., discriminant) * step(distanceAlong, 0.);
        float light = .22 + .8 * abs(dot(normalize(vNormal), uLight));
        light *= mix(1., .20, shadow);
        gl_FragColor = vec4(color * light, density * .86 * uOpacity);
        ${finishColor}
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  }));
  const rings = new THREE.Mesh(keep(new THREE.RingGeometry(4.8, 7.8, 128, 1)), ringMaterial);
  rings.rotation.x = Math.PI / 2;
  saturnSystem.add(rings);
  scene.add(saturnSystem);

  // Seeded positions keep the scene stable across texture loading and resizes.
  let randomSeed = 170108;
  const random = () => { randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0; return randomSeed / 4294967296; };
  const starCount = 2250;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  for (let index = 0; index < starCount; index++) {
    starPositions.set([(random() - .5) * 175, (random() - .5) * 110, random() * 280 - 160], index * 3);
    const warm = random();
    const luminance = .45 + random() * .7;
    starColors.set([luminance, luminance * (.85 + warm * .15), luminance * (.74 + (1. - warm) * .45)], index * 3);
    starSizes[index] = .5 + Math.pow(random(), 5) * 2.7;
  }
  const starGeometry = keep(new THREE.BufferGeometry());
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('aColor', new THREE.BufferAttribute(starColors, 3));
  starGeometry.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
  const starUniforms = { uPixelRatio: { value: 1 }, uTime: { value: 0 } };
  const stars = new THREE.Points(starGeometry, keep(new THREE.ShaderMaterial({
    uniforms: starUniforms,
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      uniform float uPixelRatio;
      uniform float uTime;
      varying vec3 vColor;
      void main() {
        vec3 wrapped = position;
        wrapped.z = mod(position.z - cameraPosition.z + 160., 280.) - 160. + cameraPosition.z;
        vec4 viewed = modelViewMatrix * vec4(wrapped, 1.);
        gl_Position = projectionMatrix * viewed;
        gl_PointSize = clamp(aSize * 74. / max(6., -viewed.z), .7, 3.1) * uPixelRatio;
        vColor = aColor * (.91 + .09 * sin(uTime * .65 + position.x * 2.));
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        float radius = length(gl_PointCoord - vec2(.5));
        float alpha = 1. - smoothstep(.12, .5, radius);
        gl_FragColor = vec4(vColor, alpha * .88);
        ${finishColor}
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })));
  scene.add(stars);
  stars.frustumCulled = false;

  const trailCount = 220;
  const trailPositions = new Float32Array(trailCount * 6);
  const trailEnds = new Float32Array(trailCount * 2);
  for (let index = 0; index < trailCount; index++) {
    const point = [(random() - .5) * 96, (random() - .5) * 58, random() * 150 - 145];
    trailPositions.set(point, index * 6);
    trailPositions.set(point, index * 6 + 3);
    trailEnds[index * 2 + 1] = 1;
  }
  const trailGeometry = keep(new THREE.BufferGeometry());
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  trailGeometry.setAttribute('aEnd', new THREE.BufferAttribute(trailEnds, 1));
  const trailUniforms = { uTime: { value: 0 }, uWarp: { value: 0 } };
  const trails = new THREE.LineSegments(trailGeometry, keep(new THREE.ShaderMaterial({
    uniforms: trailUniforms,
    vertexShader: /* glsl */ `
      attribute float aEnd;
      uniform float uTime;
      uniform float uWarp;
      varying float vEnd;
      void main() {
        vec3 moved = position;
        moved.z = mod(moved.z + uTime * 23. + 160., 170.) - 150. + cameraPosition.z;
        moved.z += aEnd * (2. + uWarp * 11.);
        vEnd = aEnd;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(moved, 1.);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uWarp;
      varying float vEnd;
      void main() {
        gl_FragColor = vec4(.63, .78, 1., uWarp * (.05 + vEnd * .5));
        ${finishColor}
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })));
  trails.frustumCulled = false;
  trails.visible = false;
  scene.add(trails);

  const nebulaUniforms = { uOpacity: { value: .12 } };
  const nebula = new THREE.Mesh(keep(new THREE.PlaneGeometry(175, 102)), keep(new THREE.ShaderMaterial({
    uniforms: nebulaUniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec2 vUv;
      float hash(vec2 p) {
        vec3 seed = fract(vec3(p.xyx) * .1031);
        seed += dot(seed, seed.yzx + 33.33);
        return fract((seed.x + seed.y) * seed.z);
      }
      float noise(vec2 p) {
        vec2 tile = floor(p), f = fract(p);
        f = f * f * (3. - 2. * f);
        return mix(mix(hash(tile), hash(tile + vec2(1., 0.)), f.x), mix(hash(tile + vec2(0., 1.)), hash(tile + vec2(1., 1.)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float sum = 0.; float strength = .5;
        mat2 rotate = mat2(.8, -.6, .6, .8);
        for (int index = 0; index < 4; index++) { sum += noise(p) * strength; p = rotate * p * 2.12 + 3.7; strength *= .5; }
        return sum;
      }
      void main() {
        vec2 p = (vUv - .5) * vec2(5., 3.);
        float mist = fbm(p * 2.4 + vec2(fbm(p + 2.1), fbm(p - 1.7)) * 2.);
        float filament = exp(-pow((p.y + sin(p.x * 1.7) * .38) * 2.2, 2.));
        float silhouette = exp(-dot(p * vec2(.48, .7), p * vec2(.48, .7)));
        float density = smoothstep(.30, .77, mist) * silhouette * (.20 + filament * .8);
        vec3 color = mix(vec3(.14, .20, .46), vec3(.48, .21, .36), smoothstep(-1.8, 1.7, p.x));
        float dust = smoothstep(.57, .8, mist) * filament;
        color = mix(color, vec3(.63, .44, .27), dust * .45);
        gl_FragColor = vec4(color, density * uOpacity);
        ${finishColor}
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })));
  nebula.position.set(4, 4, -142);
  nebula.rotation.z = -.13;
  nebula.renderOrder = -10;
  scene.add(nebula);

  const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(.0001, random()))) * Math.cos(random() * Math.PI * 2);
  const pointLimit = Math.min(160, Number(renderer.getContext().getParameter(renderer.getContext().ALIASED_POINT_SIZE_RANGE)[1]) || 64);
  const cloudCount = 320;
  const cloudPositions = new Float32Array(cloudCount * 3);
  const cloudColors = new Float32Array(cloudCount * 3);
  const cloudSizes = new Float32Array(cloudCount);
  const cloudSeeds = new Float32Array(cloudCount);
  for (let index = 0; index < cloudCount; index++) {
    const x = (random() - .5) * 29;
    const branch = index % 3;
    cloudPositions.set([x + gaussian() * 1.4, Math.sin(x * .22) * 4 + gaussian() * 2 + (branch === 2 ? 3 : 0), gaussian() * 6 + Math.cos(x * .17) * 3], index * 3);
    const warm = clamp((x + 12) / 24);
    const color = new THREE.Color(.11, .43, .77).lerp(new THREE.Color(.89, .19, .25), warm);
    if (branch === 2) color.lerp(new THREE.Color(.48, .24, .67), .55);
    cloudColors.set([color.r, color.g, color.b], index * 3);
    cloudSizes[index] = 4 + random() * 6;
    cloudSeeds[index] = random() * 100;
  }
  const volumeGeometry = keep(new THREE.BufferGeometry());
  volumeGeometry.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3));
  volumeGeometry.setAttribute('aColor', new THREE.BufferAttribute(cloudColors, 3));
  volumeGeometry.setAttribute('aSize', new THREE.BufferAttribute(cloudSizes, 1));
  volumeGeometry.setAttribute('aSeed', new THREE.BufferAttribute(cloudSeeds, 1));
  const volumeUniforms = { uOpacity: { value: 0 }, uPixelRatio: { value: 1 }, uPointLimit: { value: pointLimit }, uSignal: { value: 0 } };
  const nebulaVolume = new THREE.Group();
  nebulaVolume.position.set(8, 4, -166);
  nebulaVolume.rotation.z = -.20;
  const cloudVolume = new THREE.Points(volumeGeometry, keep(new THREE.ShaderMaterial({
    uniforms: volumeUniforms,
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aSeed;
      uniform float uOpacity;
      uniform float uPixelRatio;
      uniform float uPointLimit;
      uniform float uSignal;
      varying vec3 vColor;
      varying float vSeed;
      varying float vOpacity;
      void main() {
        vec4 viewed = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * viewed;
        gl_PointSize = min(uPointLimit, aSize * 440. / max(4., -viewed.z) * uPixelRatio);
        float illuminatedKnot = smoothstep(.15, .9, fract(aSeed * .37)) * exp(-dot(position.xy, position.xy) * .015);
        vColor = aColor * (1. + uSignal * illuminatedKnot * .55);
        vSeed = aSeed;
        vOpacity = uOpacity * smoothstep(3., 14., -viewed.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vSeed;
      varying float vOpacity;
      float hash(vec2 p) {
        vec3 seed = fract(vec3(p.xyx) * .1031);
        seed += dot(seed, seed.yzx + 33.33);
        return fract((seed.x + seed.y) * seed.z);
      }
      float noise(vec2 p) {
        vec2 cell = floor(p), f = fract(p);
        f = f * f * (3. - 2. * f);
        return mix(mix(hash(cell), hash(cell + vec2(1., 0.)), f.x), mix(hash(cell + vec2(0., 1.)), hash(cell + vec2(1., 1.)), f.x), f.y);
      }
      void main() {
        vec2 p = gl_PointCoord * 2. - 1.;
        float radius = dot(p, p);
        if (radius > 1.) discard;
        float gas = .60 + .26 * noise(p * 5. + vSeed) + .14 * noise(p * 16. - vSeed);
        float edge = exp(-radius * 3.2) * pow(1. - radius, 1.5);
        gl_FragColor = vec4(vColor * 1.25, edge * gas * vOpacity * .105);
        ${finishColor}
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })));
  nebulaVolume.add(cloudVolume);
  scene.add(nebulaVolume);

  type PhotonUniforms = { uOpacity: { value: number }; uPixelRatio: { value: number }; uTime: { value: number }; uSignal: { value: number }; uScale: { value: number } };
  const photonMaterial = (uniforms: PhotonUniforms) => keep(new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      uniform float uOpacity;
      uniform float uPixelRatio;
      uniform float uTime;
      uniform float uSignal;
      uniform float uScale;
      varying vec3 vColor;
      varying float vOpacity;
      void main() {
        float distanceFromCore = length(position);
        float wave = exp(-pow((distanceFromCore - (1. - uSignal) * 15.) * .75, 2.)) * uSignal;
        vec4 viewed = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * viewed;
        gl_PointSize = clamp(aSize * uScale / max(5., -viewed.z), .65, 10.) * uPixelRatio * (1. + wave * .65);
        vColor = aColor * (1. + wave * 2.2);
        vOpacity = uOpacity * (.93 + .07 * sin(uTime * .5 + position.y * 3.));
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vOpacity;
      void main() {
        vec2 p = gl_PointCoord - vec2(.5);
        float radius = length(p);
        float core = exp(-radius * radius * 56.);
        float halo = (1. - smoothstep(.05, .5, radius)) * .20;
        gl_FragColor = vec4(vColor, (core + halo) * vOpacity);
        ${finishColor}
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  const photonGeometry = (positions: Float32Array, colors: Float32Array, sizes: Float32Array) => {
    const geometry = keep(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return geometry;
  };
  const youngPositions = new Float32Array(130 * 3);
  const youngColors = new Float32Array(130 * 3);
  const youngSizes = new Float32Array(130);
  for (let index = 0; index < 130; index++) {
    const x = (random() - .5) * 26;
    youngPositions.set([x, Math.sin(x * .22) * 4 + gaussian() * 2.2, gaussian() * 5], index * 3);
    youngColors.set([.72, .87, 1.3], index * 3);
    youngSizes[index] = .5 + Math.pow(random(), 8) * 4;
  }
  const youngUniforms: PhotonUniforms = { uOpacity: { value: 0 }, uPixelRatio: { value: 1 }, uTime: { value: 0 }, uSignal: { value: 0 }, uScale: { value: 135 } };
  const youngStars = new THREE.Points(photonGeometry(youngPositions, youngColors, youngSizes), photonMaterial(youngUniforms));
  nebulaVolume.add(youngStars);

  const clusterCount = 1250;
  const clusterPositions = new Float32Array(clusterCount * 3);
  const clusterColors = new Float32Array(clusterCount * 3);
  const clusterSizes = new Float32Array(clusterCount);
  for (let index = 0; index < clusterCount; index++) {
    const radius = Math.pow(random(), 1.7) * 12;
    const theta = random() * Math.PI * 2;
    const cosine = random() * 2 - 1;
    const sine = Math.sqrt(1 - cosine * cosine);
    clusterPositions.set([radius * sine * Math.cos(theta), radius * cosine, radius * sine * Math.sin(theta)], index * 3);
    const warmth = random();
    clusterColors.set([1.1 - warmth * .25, .95 + warmth * .08, .68 + warmth * .60], index * 3);
    clusterSizes[index] = .45 + Math.pow(random(), 7) * 2.6;
  }
  const clusterUniforms: PhotonUniforms = { uOpacity: { value: 0 }, uPixelRatio: { value: 1 }, uTime: { value: 0 }, uSignal: { value: 0 }, uScale: { value: 125 } };
  const clusterGeometry = photonGeometry(clusterPositions, clusterColors, clusterSizes);
  const cluster = new THREE.Group();
  cluster.position.set(8, 3, -225);
  cluster.add(new THREE.Points(clusterGeometry, photonMaterial(clusterUniforms)));
  const coreUniforms = { uOpacity: { value: 0 }, uSignal: { value: 0 } };
  const coreGlow = new THREE.Mesh(keep(new THREE.PlaneGeometry(7, 7)), keep(new THREE.ShaderMaterial({
    uniforms: coreUniforms,
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      uniform float uSignal;
      varying vec2 vUv;
      void main() {
        vec2 p = (vUv - .5) * 2.;
        float radius = length(p);
        float halo = exp(-radius * radius * 10.) * .20;
        float core = exp(-radius * 65.) * 1.5;
        float rays = (exp(-abs(p.x) * 75.) * exp(-abs(p.y) * 6.) + exp(-abs(p.y) * 75.) * exp(-abs(p.x) * 6.)) * .06;
        gl_FragColor = vec4(1., .86, .64, (halo + core + rays) * uOpacity * (1. + uSignal));
        ${finishColor}
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })));
  coreGlow.position.z = .2;
  cluster.add(coreGlow);
  scene.add(cluster);

  const galaxyCount = 7600;
  const galaxyPositions = new Float32Array(galaxyCount * 3);
  const galaxyColors = new Float32Array(galaxyCount * 3);
  const galaxySizes = new Float32Array(galaxyCount);
  for (let index = 0; index < galaxyCount; index++) {
    const nucleus = random() < .19;
    const radius = nucleus ? Math.pow(random(), 1.4) * 6 : Math.pow(random(), .65) * 27;
    const branch = index % 4;
    const theta = nucleus ? random() * Math.PI * 2 : branch * Math.PI / 2 + Math.log(radius + 1) * 1.62 + gaussian() * (.10 + radius * .003);
    const spread = nucleus ? 0 : gaussian() * .45;
    galaxyPositions.set([Math.cos(theta) * (radius + spread), Math.sin(theta) * (radius + spread), gaussian() * (nucleus ? 1.3 : .40)], index * 3);
    const warmth = nucleus ? .85 + random() * .15 : .15 + random() * .60;
    galaxyColors.set([.58 + warmth * .52, .74 + warmth * .16, 1.22 - warmth * .66], index * 3);
    galaxySizes[index] = .32 + Math.pow(random(), 9) * 2.1;
  }
  const galaxyUniforms: PhotonUniforms = { uOpacity: { value: 0 }, uPixelRatio: { value: 1 }, uTime: { value: 0 }, uSignal: { value: 0 }, uScale: { value: 168 } };
  const galaxyGeometry = photonGeometry(galaxyPositions, galaxyColors, galaxySizes);
  const galaxy = new THREE.Group();
  galaxy.position.set(8, 3, -288);
  galaxy.rotation.set(.63, 0, -.30, 'YXZ');
  galaxy.add(new THREE.Points(galaxyGeometry, photonMaterial(galaxyUniforms)));
  const galaxyDust = new THREE.Mesh(keep(new THREE.PlaneGeometry(58, 58)), keep(new THREE.ShaderMaterial({
    uniforms: { uOpacity: galaxyUniforms.uOpacity },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec2 vUv;
      float hash(vec2 p) {
        vec3 seed = fract(vec3(p.xyx) * .1031);
        seed += dot(seed, seed.yzx + 33.33);
        return fract((seed.x + seed.y) * seed.z);
      }
      float noise(vec2 p) {
        vec2 cell = floor(p), f = fract(p);
        f = f * f * (3. - 2. * f);
        return mix(mix(hash(cell), hash(cell + vec2(1., 0.)), f.x), mix(hash(cell + vec2(0., 1.)), hash(cell + vec2(1., 1.)), f.x), f.y);
      }
      void main() {
        vec2 p = (vUv - .5) * 2.16;
        float radius = length(p);
        float angle = atan(p.y, p.x);
        float grain = noise(p * 22.) * .6 + noise(p * 53.) * .4;
        float phase = angle * 4. - log(radius * 27. + 1.) * 6.48;
        float ridge = pow(.5 + .5 * cos(phase + (grain - .5) * .45), 9.);
        float outer = 1. - smoothstep(.70, 1., radius);
        float core = exp(-radius * radius * 65.);
        float arms = ridge * outer * smoothstep(.06, .22, radius) * (.35 + grain * .65);
        float dustLane = pow(.5 + .5 * cos(phase + .55), 18.) * .45;
        vec3 color = mix(vec3(.23, .37, .67), vec3(1., .76, .43), clamp(core * 2., 0., 1.));
        color *= 1. - dustLane;
        float alpha = (core * .77 + arms * .36 + outer * exp(-radius * 4.) * .055) * uOpacity;
        gl_FragColor = vec4(color, alpha);
        ${finishColor}
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })));
  galaxyDust.position.z = -.2;
  galaxy.add(galaxyDust);
  scene.add(galaxy);

  const resize = (width: number, height: number, requestedPixelRatio: number) => {
    if (disposed) return;
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    compact = safeWidth / safeHeight < .95;
    pixelRatio = clamp(requestedPixelRatio, .85, compact ? 1.25 : 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(safeWidth, safeHeight, false);
    camera.aspect = safeWidth / safeHeight;
    camera.fov = compact ? 58 : 42;
    camera.updateProjectionMatrix();
    starUniforms.uPixelRatio.value = pixelRatio;
    volumeUniforms.uPixelRatio.value = pixelRatio;
    youngUniforms.uPixelRatio.value = pixelRatio;
    clusterUniforms.uPixelRatio.value = pixelRatio;
    galaxyUniforms.uPixelRatio.value = pixelRatio;
    starGeometry.setDrawRange(0, compact ? 1350 : starCount);
    trailGeometry.setDrawRange(0, compact ? 260 : trailCount * 2);
    volumeGeometry.setDrawRange(0, compact ? 230 : cloudCount);
    clusterGeometry.setDrawRange(0, compact ? 850 : clusterCount);
    galaxyGeometry.setDrawRange(0, compact ? 4900 : galaxyCount);
  };

  const update = (state: CosmicState) => {
    if (disposed) return;
    const progress = clamp(Number.isFinite(state.progress) ? state.progress : 0);
    const solarProgress = clamp(progress / .42);
    const time = Number.isFinite(state.time) ? state.time : 0;
    const delta = previousTime === undefined ? 1 / 60 : clamp(time - previousTime, 0, .1);
    previousTime = time;
    if (!state.reduced) motionTime += delta;
    nightAmount = state.reduced ? Number(state.night) : THREE.MathUtils.damp(nightAmount, Number(state.night), 2.6, delta);
    sunDirection.copy(daylight).lerp(nightlight, nightAmount).normalize();
    // The sun remains fixed for the outer planets when the Earth day/night control changes.
    ringMaterial.uniforms.uLight.value = daylight;
    sampleCamera(progress, compact ? 'mobile' : 'camera', camera.position);
    sampleCamera(progress, compact ? 'mobileTarget' : 'target', cameraTarget);
    const pointerX = state.reduced ? 0 : clamp(state.pointer.x, -1, 1);
    const pointerY = state.reduced ? 0 : clamp(state.pointer.y, -1, 1);
    camera.position.x += pointerX * (compact ? .12 : .38);
    camera.position.y += pointerY * (compact ? .08 : .22);
    cameraTarget.x += pointerX * .06;
    cameraTarget.y += pointerY * .04;
    const orbit = clamp(Number.isFinite(state.orbit) ? state.orbit : 0);
    const rotation = state.rotation;
    const earthRotation = Number.isFinite(rotation?.earth) ? rotation!.earth : 0;
    const moonRotation = Number.isFinite(rotation?.moon) ? rotation!.moon : 0;
    const saturnRotation = Number.isFinite(rotation?.saturn) ? rotation!.saturn : 0;
    const galaxyRotation = Number.isFinite(rotation?.galaxy) ? rotation!.galaxy : 0;
    const moonWeight = THREE.MathUtils.smoothstep(solarProgress, .27, .35) * (1 - THREE.MathUtils.smoothstep(solarProgress, .50, .57));
    const saturnWeight = THREE.MathUtils.smoothstep(solarProgress, .52, .64) * (1 - THREE.MathUtils.smoothstep(solarProgress, .78, .88));
    camera.position.x += Math.sin(orbit * .85) * 2.8 * moonWeight;
    camera.position.y += orbit * .4 * moonWeight;
    camera.position.x += Math.sin(orbit * .75) * 2.7 * saturnWeight;
    camera.position.y += Math.sin(orbit * .65) * .8 * saturnWeight;
    earthSystem.rotation.y = earthRotation;
    saturnSystem.rotation.y = orbit * .55 + saturnRotation;
    const galaxyWeight = THREE.MathUtils.smoothstep(progress, .76, .86);
    galaxy.rotation.x = .63 + orbit * .46 * galaxyWeight;
    galaxy.rotation.y = orbit * .38 * galaxyWeight + galaxyRotation;
    camera.lookAt(cameraTarget);
    // Reveal each destination only as the camera approaches its chapter.
    const moonOpacity = THREE.MathUtils.smoothstep(solarProgress, .24, .33) * (1 - THREE.MathUtils.smoothstep(solarProgress, .54, .64));
    const saturnOpacity = THREE.MathUtils.smoothstep(solarProgress, .51, .61) * (1 - THREE.MathUtils.smoothstep(solarProgress, .84, .93));
    moon.visible = moonOpacity > .001;
    moonMaterial.opacity = moonOpacity;
    saturnSystem.visible = saturnOpacity > .001;
    saturnMaterial.opacity = saturnOpacity;
    ringMaterial.uniforms.uOpacity.value = saturnOpacity;
    earth.rotation.y = -.85 + motionTime * .015;
    clouds.rotation.y = earth.rotation.y + motionTime * .008;
    moon.rotation.y = -.7 + motionTime * .006 + orbit * .35 + moonRotation;
    saturn.rotation.y = motionTime * .012;
    starUniforms.uTime.value = motionTime;
    const warp = state.reduced ? 0 : clamp(state.warp);
    trails.visible = warp > .005;
    trailUniforms.uWarp.value = warp;
    trailUniforms.uTime.value = motionTime;
    nebulaUniforms.uOpacity.value = (.18 + .52 * THREE.MathUtils.smoothstep(solarProgress, .63, .98)) * (1 - THREE.MathUtils.smoothstep(progress, .43, .53));
    nebula.visible = nebulaUniforms.uOpacity.value > .001;
    const nebulaVisibility = THREE.MathUtils.smoothstep(progress, .44, .515) * (1 - THREE.MathUtils.smoothstep(progress, .605, .675));
    const clusterVisibility = THREE.MathUtils.smoothstep(progress, .605, .665) * (1 - THREE.MathUtils.smoothstep(progress, .755, .815));
    const galaxyVisibility = THREE.MathUtils.smoothstep(progress, .755, .825);
    volumeUniforms.uOpacity.value = nebulaVisibility;
    youngUniforms.uOpacity.value = nebulaVisibility;
    clusterUniforms.uOpacity.value = clusterVisibility;
    galaxyUniforms.uOpacity.value = galaxyVisibility;
    nebulaVolume.visible = nebulaVisibility > .001;
    cluster.visible = clusterVisibility > .001;
    galaxy.visible = galaxyVisibility > .001;
    youngUniforms.uTime.value = motionTime;
    clusterUniforms.uTime.value = motionTime;
    galaxyUniforms.uTime.value = motionTime;
    const signal = clamp(Number.isFinite(state.signal) ? state.signal! : 0);
    youngUniforms.uSignal.value = signal;
    volumeUniforms.uSignal.value = signal;
    clusterUniforms.uSignal.value = signal;
    coreUniforms.uSignal.value = signal;
    coreUniforms.uOpacity.value = clusterVisibility * .82;
    coreGlow.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    resources.forEach(resource => resource.dispose());
    resources.clear();
    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
  };

  resize(canvas.clientWidth || 1280, canvas.clientHeight || 720, 1);
  update({ progress: 0, time: 0, pointer: { x: 0, y: 0 }, night: false, orbit: 0, warp: 0, reduced: true });
  const loader = new THREE.TextureLoader();
  const load = async (url: string) => {
    if (!url) return null;
    try {
      const texture = await loader.loadAsync(url);
      if (disposed) { texture.dispose(); return null; }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      return keep(texture);
    } catch { return null; }
  };
  const [earthTexture, nightTexture, cloudTexture, moonTexture, saturnTexture] = await Promise.all([
    load(urls.earth), load(urls.night), load(urls.clouds), load(urls.moon), load(urls.saturn),
  ]);
  if (earthTexture) { earthUniforms.uDay.value = earthTexture; earthUniforms.uHasDay.value = 1; }
  if (nightTexture) { earthUniforms.uNight.value = nightTexture; earthUniforms.uHasNight.value = 1; }
  if (cloudTexture) { cloudUniforms.uMap.value = cloudTexture; cloudUniforms.uReady.value = 1; }
  if (moonTexture) { moonMaterial.map = moonTexture; moonMaterial.bumpMap = moonTexture; moonMaterial.color.set(0xffffff); moonMaterial.needsUpdate = true; }
  if (saturnTexture) { saturnMaterial.map = saturnTexture; saturnMaterial.color.set(0xffffff); saturnMaterial.needsUpdate = true; }
  // Warm the later chapters as well, so entering a new region need not compile a shader.
  if (!disposed) {
    try { await renderer.compileAsync(scene, camera); } catch { /* Rendering can still use available programs. */ }
  }
  return { update, resize, dispose };
}
