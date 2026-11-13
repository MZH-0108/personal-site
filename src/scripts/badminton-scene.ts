import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { Bounds, Racket, Shuttle } from './badminton-physics';

export type BadmintonFrame = {
  delta: number;
  time: number;
  shuttle: Shuttle;
  racket: Racket;
  /** 0–1, decays after each counted stroke to drive the racket's follow-through. */
  swing: number;
  reduced: boolean;
};
export type BadmintonLayout = {
  bounds: Bounds;
  /** Where the racket head may travel. */
  racketArea: { left: number; right: number; bottom: number; top: number };
  compact: boolean;
};

const BACKGROUND = 0x0f2a21;
const BLUE = 0x1b4dff;
const FOV = 34;

/** Feather skirt texture: sixteen vanes with scalloped tips and a darker rachis down each. */
function featherTextures() {
  const width = 1024, height = 256, vanes = 16;
  const color = document.createElement('canvas'); color.width = width; color.height = height;
  const alpha = document.createElement('canvas'); alpha.width = width; alpha.height = height;
  const c = color.getContext('2d'), a = alpha.getContext('2d');
  if (!c || !a) throw new Error('Feather texture could not be drawn.');
  c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, width, height);
  a.fillStyle = '#000'; a.fillRect(0, 0, width, height);
  const column = width / vanes;
  for (let index = 0; index < vanes; index++) {
    const left = index * column, mid = left + column / 2;
    // Canvas y=0 is the top of the texture, which maps to the wide open end of the skirt.
    a.fillStyle = '#fff';
    a.beginPath();
    a.moveTo(mid - column * .16, height);
    a.lineTo(left + column * .02, height * .3);
    a.quadraticCurveTo(left + column * .04, height * .02, mid, height * .015);
    a.quadraticCurveTo(left + column * .96, height * .02, left + column * .98, height * .3);
    a.lineTo(mid + column * .16, height);
    a.closePath(); a.fill();
    // Fine barbs read as a soft sheen rather than a flat sheet.
    c.strokeStyle = 'rgba(160, 150, 130, .16)'; c.lineWidth = 1;
    for (let barb = 0; barb < 18; barb++) {
      const y = height * (.08 + barb * .05);
      c.beginPath(); c.moveTo(mid, y + 10); c.lineTo(left + column * .08, y); c.moveTo(mid, y + 10); c.lineTo(left + column * .92, y); c.stroke();
    }
    c.strokeStyle = '#b9b2a3'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(mid, height); c.lineTo(mid, height * .04); c.stroke();
  }
  const map = new THREE.CanvasTexture(color); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
  const alphaMap = new THREE.CanvasTexture(alpha);
  return { map, alphaMap };
}

/** Racket string bed: a cross-hatched grid clipped to the head's ellipse. */
function stringTexture() {
  const size = 512;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('String texture could not be drawn.');
  c.save();
  c.beginPath(); c.ellipse(size / 2, size / 2, size / 2 - 2, size / 2 - 2, 0, 0, Math.PI * 2); c.clip();
  c.fillStyle = 'rgba(255, 255, 255, .06)'; c.fillRect(0, 0, size, size);
  c.strokeStyle = '#ffffff'; c.lineWidth = 2.4;
  for (let line = 1; line < 22; line++) {
    const p = (line / 22) * size;
    c.beginPath(); c.moveTo(p, 0); c.lineTo(p, size); c.stroke();
    c.beginPath(); c.moveTo(0, p); c.lineTo(size, p); c.stroke();
  }
  c.restore();
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  return texture;
}

/** Grip wrap: diagonal overlapping bands. */
function gripTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 512;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Grip texture could not be drawn.');
  c.fillStyle = '#1b4dff'; c.fillRect(0, 0, 128, 512);
  c.strokeStyle = '#0f2f9e'; c.lineWidth = 6;
  for (let y = -128; y < 640; y += 34) { c.beginPath(); c.moveTo(0, y); c.lineTo(128, y + 60); c.stroke(); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(1, 1);
  return texture;
}

/** Court lines for a doubles court, drawn to scale (13.4 m × 6.1 m) on a transparent sheet. */
function courtTexture() {
  const scale = 80, width = Math.round(6.1 * scale), length = Math.round(13.4 * scale), pad = 8;
  const canvas = document.createElement('canvas'); canvas.width = width + pad * 2; canvas.height = length + pad * 2;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Court texture could not be drawn.');
  c.strokeStyle = 'rgba(240, 246, 240, .82)'; c.lineWidth = .04 * scale;
  const x = (metres: number) => pad + metres * scale, z = (metres: number) => pad + metres * scale;
  c.strokeRect(x(0), z(0), width, length);
  const singles = .46;
  c.beginPath(); c.moveTo(x(singles), z(0)); c.lineTo(x(singles), z(13.4)); c.moveTo(x(6.1 - singles), z(0)); c.lineTo(x(6.1 - singles), z(13.4)); c.stroke();
  for (const line of [.76, 13.4 - .76, 6.7 - 1.98, 6.7 + 1.98]) { c.beginPath(); c.moveTo(x(0), z(line)); c.lineTo(x(6.1), z(line)); c.stroke(); }
  c.beginPath(); c.moveTo(x(3.05), z(0)); c.lineTo(x(3.05), z(6.7 - 1.98)); c.moveTo(x(3.05), z(6.7 + 1.98)); c.lineTo(x(3.05), z(13.4)); c.stroke();
  // The net's shadow line across the middle of the court.
  c.strokeStyle = 'rgba(240, 246, 240, .35)'; c.setLineDash([10, 10]);
  c.beginPath(); c.moveTo(x(0), z(6.7)); c.lineTo(x(6.1), z(6.7)); c.stroke();
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8;
  return { texture, width: (width + pad * 2) / scale, length: (length + pad * 2) / scale };
}

export async function createBadmintonScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND);
  scene.fog = new THREE.Fog(BACKGROUND, 13, 34);
  const camera = new THREE.PerspectiveCamera(FOV, 1, .1, 80);
  const resources = new Set<{ dispose(): void }>();
  const keep = <T extends { dispose(): void }>(resource: T): T => { resources.add(resource); return resource; };
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    resources.forEach(resource => resource.dispose()); resources.clear();
    scene.clear(); renderer.dispose(); renderer.forceContextLoss();
  };

  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = keep(pmrem.fromScene(room, .04));
    scene.environment = environment.texture;
    scene.environmentIntensity = .55;
    room.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); (object.material as THREE.Material).dispose(); } });
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x163a2b, .7));
    const key = new THREE.DirectionalLight(0xfff6ea, 2.4);
    key.position.set(-4, 10, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -9; key.shadow.camera.right = 9; key.shadow.camera.top = 9; key.shadow.camera.bottom = -9;
    key.shadow.camera.near = 1; key.shadow.camera.far = 30;
    key.shadow.radius = 5; key.shadow.bias = -.0006;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6f8dff, 1.6);
    rim.position.set(6, 3, -6); scene.add(rim);

    // ---- Shuttlecock: cork base with a tape band, a feather skirt, and two thread rings.
    const corkGeometry = keep(new THREE.LatheGeometry([
      new THREE.Vector2(0, -.13), new THREE.Vector2(.045, -.122), new THREE.Vector2(.077, -.098), new THREE.Vector2(.095, -.062),
      new THREE.Vector2(.1, -.025), new THREE.Vector2(.1, .05), new THREE.Vector2(.088, .066), new THREE.Vector2(0, .066),
    ], 40));
    const corkMaterial = keep(new THREE.MeshPhysicalMaterial({ color: 0xf6f2e9, roughness: .55, sheen: .6, sheenColor: new THREE.Color(0xffffff) }));
    const bandGeometry = keep(new THREE.CylinderGeometry(.1015, .1015, .032, 40, 1, true));
    const bandMaterial = keep(new THREE.MeshPhysicalMaterial({ color: BLUE, roughness: .35, clearcoat: .8 }));
    const { map: featherMap, alphaMap: featherAlpha } = featherTextures(); keep(featherMap); keep(featherAlpha);
    const skirtGeometry = keep(new THREE.CylinderGeometry(.31, .086, .38, 64, 1, true));
    const skirtMaterial = keep(new THREE.MeshStandardMaterial({ map: featherMap, alphaMap: featherAlpha, alphaTest: .45, side: THREE.DoubleSide, roughness: .78 }));
    const threadGeometry = keep(new THREE.TorusGeometry(1, .012, 6, 64));
    const threadMaterial = keep(new THREE.MeshStandardMaterial({ color: 0xcfc6b2, roughness: .9 }));

    /** Built nose-down along local −Y; `spinner` rotates about the shuttle's own axis. */
    const buildShuttle = () => {
      const group = new THREE.Group();
      const spinner = new THREE.Group(); group.add(spinner);
      // The lathe profile already runs from the cork tip (y = −0.13) up to its flat top (y = 0.066).
      spinner.add(new THREE.Mesh(corkGeometry, corkMaterial));
      const band = new THREE.Mesh(bandGeometry, bandMaterial); band.position.y = .012; spinner.add(band);
      const skirt = new THREE.Mesh(skirtGeometry, skirtMaterial); skirt.position.y = .066 + .19; spinner.add(skirt);
      for (const height of [.11, .22]) {
        const radius = .086 + (.31 - .086) * (height / .38);
        const thread = new THREE.Mesh(threadGeometry, threadMaterial);
        thread.scale.set(radius, radius, 1); thread.rotation.x = Math.PI / 2; thread.position.y = .066 + height; spinner.add(thread);
      }
      group.traverse(object => { if (object instanceof THREE.Mesh) { object.castShadow = true; } });
      return { group, spinner };
    };
    const hero = buildShuttle();
    hero.group.scale.setScalar(1.25);
    scene.add(hero.group);

    // Slow background shuttles drifting through the fog give the stage depth.
    const drifters = Array.from({ length: 7 }, (_, index) => {
      const item = buildShuttle();
      item.group.traverse(object => { object.castShadow = false; });
      const seed = index * 1.618;
      // `lane` is a 0–1 position across the drift band; the band itself follows the layout (right side on wide screens).
      const state = { lane: (Math.sin(seed * 3.1) + 1) / 2, x: 0, y: 6 - ((index * 2.3) % 12), z: -4 - (index % 4) * 2.2, fall: .35 + (index % 3) * .12, turn: .25 + (index % 4) * .08, phase: seed };
      scene.add(item.group);
      return { ...item, state };
    });

    // ---- Racket: elliptical frame tube, string bed, throat, shaft and a wrapped grip.
    const racket = new THREE.Group();
    const tilt = new THREE.Group(); racket.add(tilt);
    const headCurve = new THREE.CatmullRomCurve3(new THREE.EllipseCurve(0, 0, .52, .66).getPoints(120).map(point => new THREE.Vector3(point.x, point.y, 0)), true);
    const frameMaterial = keep(new THREE.MeshPhysicalMaterial({ color: 0x1c2230, metalness: .55, roughness: .32, clearcoat: 1, clearcoatRoughness: .2 }));
    const accentMaterial = keep(new THREE.MeshPhysicalMaterial({ color: BLUE, metalness: .2, roughness: .3, clearcoat: 1 }));
    const frame = new THREE.Mesh(keep(new THREE.TubeGeometry(headCurve, 220, .036, 12, true)), frameMaterial); tilt.add(frame);
    const strings = keep(stringTexture());
    const bed = new THREE.Mesh(keep(new THREE.PlaneGeometry(1.04, 1.32)), keep(new THREE.MeshStandardMaterial({ map: strings, transparent: true, alphaTest: .05, side: THREE.DoubleSide, roughness: .4, depthWrite: false })));
    tilt.add(bed);
    const throat = new THREE.Mesh(keep(new THREE.CylinderGeometry(.03, .045, .32, 16)), accentMaterial); throat.position.y = -.8; tilt.add(throat);
    const shaft = new THREE.Mesh(keep(new THREE.CylinderGeometry(.017, .02, 1.12, 12)), frameMaterial); shaft.position.y = -1.52; tilt.add(shaft);
    const grip = new THREE.Mesh(keep(new THREE.CylinderGeometry(.058, .052, .72, 24)), keep(new THREE.MeshStandardMaterial({ map: keep(gripTexture()), roughness: .85 }))); grip.position.y = -2.44; tilt.add(grip);
    const cap = new THREE.Mesh(keep(new THREE.CylinderGeometry(.062, .062, .05, 24)), frameMaterial); cap.position.y = -2.82; tilt.add(cap);
    racket.traverse(object => { if (object instanceof THREE.Mesh) object.castShadow = true; });
    bed.castShadow = false;
    scene.add(racket);
    // Face tipped up toward the camera, handle angled down and to the side so the whole racket reads.
    const baseTilt = new THREE.Euler(-1.08, .0, .42, 'YXZ');

    // ---- Floor and court.
    const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(60, 50)), keep(new THREE.MeshStandardMaterial({ color: 0x1d5a40, roughness: .92 })));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const court = courtTexture(); keep(court.texture);
    const courtMesh = new THREE.Mesh(keep(new THREE.PlaneGeometry(court.width, court.length)), keep(new THREE.MeshStandardMaterial({ map: court.texture, transparent: true, roughness: .9, depthWrite: false })));
    courtMesh.rotation.x = -Math.PI / 2; courtMesh.receiveShadow = true; scene.add(courtMesh);

    let layout: BadmintonLayout = { bounds: { left: -4, right: 4, floor: -3, top: 4 }, racketArea: { left: -4, right: 4, bottom: -2.5, top: .5 }, compact: false };
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3(), ndc = new THREE.Vector2();
    const quaternion = new THREE.Quaternion(), roll = new THREE.Quaternion(), axisZ = new THREE.Vector3(0, 0, 1), axisX = new THREE.Vector3(1, 0, 0);

    let driftLeft = -7, driftRight = 7;
    const resize = (width: number, height: number, dpr: number) => {
      if (disposed) return layout;
      const w = Math.max(1, Math.floor(width)), h = Math.max(1, Math.floor(height));
      const aspect = w / h, compact = w < 760;
      renderer.setPixelRatio(Math.max(.8, Math.min(Number.isFinite(dpr) ? dpr : 1, compact ? 1.25 : 1.5)));
      renderer.setSize(w, h, false);
      // Keep at least ~5 units of width on portrait phones by pulling the camera back.
      const halfH = Math.max(3.8, 2.55 / aspect), halfW = halfH * aspect;
      const distance = halfH / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      camera.aspect = aspect; camera.position.set(0, .55, distance); camera.lookAt(0, .2, 0); camera.updateProjectionMatrix();
      // Wide screens leave the left side to the copy; the rally plays out on the right.
      const centre = compact ? 0 : halfW * .3;
      const span = compact ? halfW * .86 : Math.min(halfW * .58, 5.2);
      const floorY = -halfH * .8;
      layout = {
        compact,
        bounds: { left: centre - span, right: centre + span, floor: floorY + .14, top: halfH * 1.08 },
        racketArea: { left: centre - span, right: centre + span, bottom: floorY + .7, top: compact ? halfH * .1 : halfH * .3 },
      };
      // Keep the drifting shuttles clear of the copy column on wide screens.
      driftLeft = compact ? -halfW * 1.2 : centre - span * .55; driftRight = compact ? halfW * 1.2 : halfW * 1.25;
      // Narrow screens keep only a few drifters so they do not crowd the headline.
      drifters.forEach((drifter, index) => { drifter.group.visible = !compact || index % 2 === 1; });
      floor.position.set(0, floorY, -12);
      courtMesh.position.set(centre * .4, floorY + .002, -court.length / 2 + 3.2);
      key.target.position.set(centre, floorY, 0); key.target.updateMatrixWorld();
      return layout;
    };

    /** Map a pointer in normalised device coordinates onto the play plane. */
    const screenPoint = new THREE.Vector3();
    /** Project a point on the play plane to fractions of the canvas (0,0 top-left; 1,1 bottom-right). */
    const toScreen = (x: number, y: number) => {
      screenPoint.set(x, y, 0).project(camera);
      return { x: (screenPoint.x + 1) / 2, y: (1 - screenPoint.y) / 2 };
    };

    const toPlane = (x: number, y: number) => {
      ndc.set(x, y);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.ray.intersectPlane(plane, hit) ? { x: hit.x, y: hit.y } : undefined;
    };

    const update = (frame: BadmintonFrame) => {
      if (disposed) return;
      const { shuttle, racket: head } = frame;
      // Cork direction angle θ maps to a rotation of the nose-down model by θ + π/2 about Z.
      hero.group.position.set(shuttle.x, shuttle.y, 0);
      hero.group.rotation.set(0, 0, shuttle.angle + Math.PI / 2);
      hero.spinner.rotation.y = shuttle.spin;

      racket.position.set(head.x, head.y, 0);
      const lean = frame.reduced ? 0 : THREE.MathUtils.clamp(-head.vx * .045, -.42, .42);
      quaternion.setFromEuler(baseTilt);
      roll.setFromAxisAngle(axisZ, lean); quaternion.premultiply(roll);
      roll.setFromAxisAngle(axisX, frame.swing * .5); quaternion.premultiply(roll);
      tilt.quaternion.copy(quaternion);

      for (const drifter of drifters) {
        const s = drifter.state;
        if (!frame.reduced) {
          s.y -= s.fall * frame.delta;
          if (s.y < -7) { s.y = 7.5; s.lane = (Math.sin(s.phase + frame.time) + 1) / 2; }
        }
        s.x = driftLeft + s.lane * (driftRight - driftLeft) * (1 - s.z / 14);
        drifter.group.position.set(s.x + Math.sin(frame.time * .3 + s.phase) * .4, s.y, s.z);
        drifter.group.rotation.set(Math.sin(frame.time * s.turn + s.phase) * .5, 0, Math.PI * .15 + Math.cos(frame.time * s.turn * .8 + s.phase) * .6);
        drifter.spinner.rotation.y = frame.time * .6 + s.phase;
      }
      renderer.render(scene, camera);
    };

    canvas.dataset.ready = 'true';
    return { update, resize, toPlane, toScreen, dispose, layout: () => layout };
  } catch (error) { dispose(); throw error; }
}
