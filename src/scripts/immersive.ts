import type { CosmicState } from './cosmic-scene';
import { chapterAtProgress, cosmicChapters, journeyProgressAtScroll } from '../data/cosmic-journey';
import { advanceRotation, dragAxis, dragRadians, dragVelocity, rotationTargetAtProgress, rotationTargets, type DragAxis, type RotationTarget } from './cosmic-rotation';
type SceneHandle = { update: (state: CosmicState) => void; resize: (width: number, height: number, ratio: number) => void; dispose: () => void };
type Ambience = { context: AudioContext; master: GainNode; tones: OscillatorNode[]; noise: AudioBufferSourceNode; filter: BiquadFilterNode };

function initializeCosmicJourney() {
  const root = document.querySelector<HTMLElement>('[data-cosmic]');
  const canvas = root?.querySelector<HTMLCanvasElement>('[data-cosmic-canvas]');
  const story = root?.querySelector<HTMLElement>('[data-cosmic-story]');
  if (!root || !canvas || !story || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const steps = [...root.querySelectorAll<HTMLElement>('[data-flight-step]')];
  const chapterLinks = [...root.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]')];
  const chapterNav = root.querySelector<HTMLElement>('.cosmic-chapter-nav');
  const rotationSurface = root.querySelector<HTMLElement>('[data-cosmic-rotation-surface]');
  const rotationControls = root.querySelector<HTMLElement>('[data-cosmic-rotation-controls]');
  const rotationReset = root.querySelector<HTMLButtonElement>('[data-cosmic-reset-rotation]');
  const actions = [...root.querySelectorAll<HTMLButtonElement>('[data-cosmic-action]')];
  const soundButton = root.querySelector<HTMLButtonElement>('[data-cosmic-sound]');
  const motionButton = root.querySelector<HTMLButtonElement>('[data-cosmic-motion]');
  const creditsOpen = root.querySelector<HTMLButtonElement>('[data-cosmic-credits-open]');
  const creditsClose = root.querySelector<HTMLButtonElement>('[data-cosmic-credits-close]');
  const credits = root.querySelector<HTMLDialogElement>('[data-cosmic-credits]');
  const status = root.querySelector<HTMLElement>('[data-cosmic-status]');
  const loading = root.querySelector<HTMLElement>('[data-cosmic-loading]');
  const bar = root.querySelector<HTMLElement>('[data-cosmic-progress]');
  const progressLabel = root.querySelector<HTMLElement>('[data-cosmic-progress-label]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 700px)');
  const names = cosmicChapters.map(chapter => chapter.name);
  const stillPositions = cosmicChapters.map(chapter => chapter.progress);
  let scene: SceneHandle | undefined;
  let frame = 0;
  let disposed = false;
  let active = false;
  let optedOut = false;
  try { optedOut = sessionStorage.getItem('mzh-cosmic-motion') === 'off'; } catch {}
  let landmarks = cosmicChapters.map((_, index) => index);
  let targetProgress = 0, progress = 0;
  let lastTime = 0, elapsed = 0;
  let currentChapter = -1, previousPercent = -1;
  let night = false, orbitTarget = 0, orbit = 0;
  let signalTarget = 0, signal = 0;
  let warpStarted = -1, warpButton: HTMLButtonElement | undefined;
  let enterGalaxyAfterWarp = false;
  let soundOn = false;
  let ambience: Ambience | undefined;
  const pointer = { x: 0, y: 0 }, targetPointer = { x: 0, y: 0 };
  let pixelRatio = Math.min(devicePixelRatio || 1, mobile.matches ? 1.25 : 1.5);
  let slowFrames = 0;
  let statusTimer: ReturnType<typeof setTimeout> | undefined;
  let observer: ResizeObserver | undefined;
  let headingObserver: IntersectionObserver | undefined;
  const yawTargets = { earth: 0, moon: 0, saturn: 0, galaxy: 0 };
  const yaw = { ...yawTargets };
  let rotationTarget: RotationTarget | undefined;
  let inertia: { target: RotationTarget; velocity: number } | undefined;
  let drag: { id: number; target: RotationTarget; axis: DragAxis; startX: number; startY: number; startYaw: number; lastX: number; lastAt: number; velocity: number } | undefined;
  const touchPointers = new Set<number>();
  const announce = (message: string) => {
    if (status) status.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { if (status) status.textContent = '滚动探索 · 点击按钮互动'; }, 4500);
  };
  const updateInterface = () => {
    const index = chapterAtProgress(targetProgress);
    const percent = Math.round(targetProgress * 100);
    if (bar) bar.style.transform = `scaleX(${targetProgress.toFixed(4)})`;
    const chapterChanged = currentChapter !== index;
    if (chapterChanged) {
      currentChapter = index;
      root.dataset.chapter = steps[index]?.id || 'earth';
      chapterLinks.forEach((link, position) => {
        link.dataset.active = String(position === index);
        if (position === index) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
      const link = chapterLinks[index];
      if (chapterNav && link && chapterNav.scrollWidth > chapterNav.clientWidth + 1) {
        const navBounds = chapterNav.getBoundingClientRect();
        const linkBounds = link.getBoundingClientRect();
        const nextLeft = chapterNav.scrollLeft + linkBounds.left - navBounds.left - (navBounds.width - linkBounds.width) / 2;
        chapterNav.scrollTo({ left: nextLeft, behavior: 'auto' });
      }
    }
    if (progressLabel && (percent !== previousPercent || chapterChanged)) {
      progressLabel.textContent = `${names[index]} / ${percent}%`;
      previousPercent = percent;
    }
    refreshRotationInterface();
  };
  const readProgress = () => {
    targetProgress = journeyProgressAtScroll(scrollY, landmarks);
    updateInterface();
  };
  const measure = () => {
    landmarks = steps.map(step => Math.max(0, step.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(step).scrollMarginTop) || 0)));
    readProgress();
    scene?.resize(innerWidth, innerHeight, pixelRatio);
  };
  const draw = (time: number) => {
    frame = 0;
    if (disposed || document.hidden) return;
    const frameInterval = lastTime ? time - lastTime : 16.7;
    const delta = Math.min(frameInterval / 1000, .05);
    lastTime = time;
    if (active) elapsed += delta;
    const ease = 1 - Math.exp(-delta * 11);
    if (active && inertia && !drag) {
      const next = advanceRotation(inertia.velocity, delta);
      yawTargets[inertia.target] += next.angle;
      inertia.velocity = next.velocity;
      if (!next.velocity) inertia = undefined;
    }
    rotationTargets.forEach(target => { yaw[target] = !active || drag?.target === target ? yawTargets[target] : yaw[target] + (yawTargets[target] - yaw[target]) * ease; });
    if (rotationSurface && rotationTarget) {
      const value = yaw[rotationTarget].toFixed(5);
      if (rotationSurface.dataset.yaw !== value) rotationSurface.dataset.yaw = value;
    }
    progress = active ? progress + (targetProgress - progress) * ease : stillPositions[Math.max(0, currentChapter)];
    refreshRotationInterface();
    orbit = active ? orbit + (orbitTarget - orbit) * ease : orbitTarget;
    signal = active ? signal + (signalTarget - signal) * ease : signalTarget;
    pointer.x += (targetPointer.x - pointer.x) * ease;
    pointer.y += (targetPointer.y - pointer.y) * ease;
    const warpAge = warpStarted < 0 ? 2 : (time - warpStarted) / 1500;
    const warp = active && warpAge < 1 ? Math.sin(Math.PI * warpAge) ** 2 : 0;
    if (warpAge >= 1 && warpButton) {
      warpButton.disabled = !active || !scene;
      warpButton.removeAttribute('aria-busy');
      warpButton = undefined;
      warpStarted = -1;
      if (enterGalaxyAfterWarp && currentChapter === 3) {
        steps[4]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        announce('已抵达星云。继续滚动，穿越恒星群与银河旋臂。');
      } else announce('穿越完成。继续向银河深处探索。');
      enterGalaxyAfterWarp = false;
    }
    const started = performance.now();
    scene?.update({ progress, time: elapsed, pointer: active ? pointer : { x: 0, y: 0 }, night, orbit, warp, signal, rotation: yaw, reduced: !active });
    const duration = performance.now() - started;
    // Reduce render resolution only when sustained frame cost indicates it is needed.
    slowFrames = duration > 20 || frameInterval > 28 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
    if (slowFrames > 50 && pixelRatio > .85) {
      pixelRatio = Math.max(.85, pixelRatio - .2);
      scene?.resize(innerWidth, innerHeight, pixelRatio);
      slowFrames = 0;
    }
    if (ambience && soundOn) ambience.filter.frequency.setTargetAtTime(260 + targetProgress * 180 + warp * 180, ambience.context.currentTime, .3);
    if (active && scene) frame = requestAnimationFrame(draw);
  };
  const schedule = () => { if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(draw); };
  const onScroll = () => { readProgress(); schedule(); };
  const refresh = () => { cancelRotation(); measure(); schedule(); };
  const setMotion = () => {
    active = !reduced.matches && !optedOut;
    cancelRotation();
    if (!active && warpButton) {
      warpStarted = -1;
      warpButton.removeAttribute('aria-busy');
      warpButton = undefined;
      enterGalaxyAfterWarp = false;
    }
    root.dataset.motion = reduced.matches ? 'system' : active ? 'on' : 'off';
    if (motionButton) {
      motionButton.disabled = reduced.matches;
      motionButton.textContent = reduced.matches ? '系统静态模式' : '静态模式';
      motionButton.setAttribute('aria-pressed', String(!active));
    }
    actions.filter(button => button.dataset.cosmicAction === 'warp').forEach(button => { button.disabled = !active || !scene; });
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    progress = active ? targetProgress : stillPositions[Math.max(0, currentChapter)];
    schedule();
  };
  const toggleMotion = () => {
    optedOut = !optedOut;
    try { sessionStorage.setItem('mzh-cosmic-motion', optedOut ? 'off' : 'on'); } catch {}
    setMotion();
    announce(active ? '已恢复镜头旅程。' : '已切换静态观测，章节和按钮仍可使用。');
  };
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    if (drag) return;
    targetPointer.x = (event.clientX / innerWidth - .5) * 2;
    targetPointer.y = (.5 - event.clientY / innerHeight) * 2;
    schedule();
  };
  const resetPointer = () => { targetPointer.x = targetPointer.y = 0; schedule(); };
  const cancelWarpTravel = () => { enterGalaxyAfterWarp = false; };
  const releaseCapture = (id: number) => {
    try { if (rotationSurface?.hasPointerCapture(id)) rotationSurface.releasePointerCapture(id); } catch {}
  };
  const cancelRotation = () => {
    const previous = drag;
    drag = undefined;
    inertia = undefined;
    root.dataset.dragging = 'false';
    if (previous) releaseCapture(previous.id);
  };
  const refreshRotationInterface = () => {
    const next = scene ? rotationTargetAtProgress(progress) : undefined;
    if (next === rotationTarget) return;
    if (next !== rotationTarget) { cancelRotation(); rotationTarget = next; }
    root.dataset.rotationTarget = rotationTarget || '';
    if (rotationSurface) {
      rotationSurface.hidden = !rotationTarget;
      rotationSurface.tabIndex = rotationTarget ? 0 : -1;
      const modelName = rotationTarget ? { earth: '地球', moon: '月球', saturn: '土星', galaxy: '银河' }[rotationTarget] : '宇宙';
      rotationSurface.setAttribute('aria-label', `${modelName}三维模型，左右拖动可完整旋转`);
    }
    if (rotationControls) rotationControls.hidden = !rotationTarget;
  };
  const onRotationStart = (event: PointerEvent) => {
    if (!rotationTarget || !scene || !event.isPrimary || touchPointers.size > 1 || event.pointerType === 'mouse' && event.button !== 0) return;
    cancelRotation();
    cancelWarpTravel();
    targetPointer.x = targetPointer.y = 0;
    drag = { id: event.pointerId, target: rotationTarget, axis: 'pending', startX: event.clientX, startY: event.clientY, startYaw: yawTargets[rotationTarget], lastX: event.clientX, lastAt: event.timeStamp, velocity: 0 };
  };
  const onRotationMove = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    drag.axis = dragAxis(dx, dy, drag.axis);
    if (drag.axis !== 'horizontal') return;
    try { if (rotationSurface && !rotationSurface.hasPointerCapture(event.pointerId)) rotationSurface.setPointerCapture(event.pointerId); } catch {}
    if (event.cancelable) event.preventDefault();
    root.dataset.dragging = 'true';
    const width = rotationSurface?.clientWidth || innerWidth;
    yawTargets[drag.target] = drag.startYaw + dragRadians(dx, width);
    drag.velocity = drag.velocity * .35 + dragVelocity(event.clientX - drag.lastX, event.timeStamp - drag.lastAt, width) * .65;
    drag.lastX = event.clientX; drag.lastAt = event.timeStamp;
    schedule();
  };
  const onRotationEnd = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    const previous = drag;
    drag = undefined;
    root.dataset.dragging = 'false';
    if (event.type === 'pointerup' && active && previous.axis === 'horizontal' && event.timeStamp - previous.lastAt < 140) inertia = { target: previous.target, velocity: previous.velocity };
    else inertia = undefined;
    releaseCapture(previous.id);
    schedule();
  };
  const onTouchStart = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') return;
    touchPointers.add(event.pointerId);
    if (touchPointers.size > 1) cancelRotation();
  };
  const onTouchEnd = (event: PointerEvent) => { touchPointers.delete(event.pointerId); };
  const onWindowBlur = () => { cancelRotation(); touchPointers.clear(); };
  const resetRotation = () => {
    if (!rotationTarget) return;
    cancelRotation();
    yawTargets[rotationTarget] = 0;
    orbitTarget = 0;
    actions.filter(item => ['angle', 'orbit', 'galaxy'].includes(item.dataset.cosmicAction || '')).forEach(item => item.setAttribute('aria-pressed', 'false'));
    announce('已恢复当前模型的初始视角。');
    schedule();
  };
  const onRotationKey = (event: KeyboardEvent) => {
    if (!rotationTarget) return;
    if (event.key === 'Home') { event.preventDefault(); resetRotation(); return; }
    if (event.key === 'Escape') { cancelRotation(); return; }
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); cancelRotation(); cancelWarpTravel();
    yawTargets[rotationTarget] += (event.key === 'ArrowLeft' ? -1 : 1) * Math.PI / (event.shiftKey ? 2 : 9);
    schedule();
  };
  const onScrollKey = (event: KeyboardEvent) => {
    const target = event.target as Element | null;
    if (target?.closest('input, textarea, select, [contenteditable]')) return;
    if (event.key === ' ' && target?.closest('button')) return;
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancelWarpTravel();
  };
  const onAnchorNavigation = (event: MouseEvent) => {
    if ((event.target as Element | null)?.closest('a[href^="#"]')) cancelWarpTravel();
  };
  const interact = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement;
    switch (button.dataset.cosmicAction) {
      case 'daynight':
        night = !night;
        root.dataset.night = String(night);
        button.setAttribute('aria-pressed', String(night));
        announce(night ? '夜幕降临，城市的微光正在亮起。' : '恢复日照，重新看见蔚蓝地球。');
        break;
      case 'angle':
      case 'orbit':
      case 'galaxy':
        orbitTarget = orbitTarget ? 0 : 1;
        actions.filter(item => ['angle', 'orbit', 'galaxy'].includes(item.dataset.cosmicAction || '')).forEach(item => item.setAttribute('aria-pressed', String(orbitTarget > 0)));
        announce(orbitTarget ? '正在换一个角度观察。' : '正在回到初始观测角度。');
        break;
      case 'signal':
        signalTarget = signalTarget ? 0 : 1;
        actions.filter(item => item.dataset.cosmicAction === 'signal').forEach(item => item.setAttribute('aria-pressed', String(signalTarget > 0)));
        announce(signalTarget ? '星光亮起。继续滚动，让光从身旁掠过。' : '星光恢复原来的亮度。');
        break;
      case 'warp':
        if (!active) return;
        warpStarted = performance.now();
        warpButton = button;
        enterGalaxyAfterWarp = button.closest('[data-flight-step]')?.id === 'deep';
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        announce('加速，正在穿过星海…');
        break;
    }
    schedule();
  };
  const makeAmbience = () => {
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    const tones = [55, 82.4, 110].map((frequency, index) => {
      const tone = context.createOscillator();
      const gain = context.createGain();
      tone.type = 'sine'; tone.frequency.value = frequency;
      gain.gain.value = index === 2 ? .025 : .05;
      tone.connect(gain); gain.connect(master); tone.start();
      return tone;
    });
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < data.length; index++) { previous = previous * .96 + (Math.random() * 2 - 1) * .04; data[index] = previous; }
    const noise = context.createBufferSource(); noise.buffer = buffer; noise.loop = true;
    const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 280;
    const noiseGain = context.createGain(); noiseGain.gain.value = .3;
    noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(master); noise.start();
    return { context, master, tones, noise, filter };
  };
  const toggleSound = async () => {
    try {
      ambience ||= makeAmbience();
      await ambience.context.resume();
      if (disposed) return;
      soundOn = !soundOn;
      ambience.master.gain.setTargetAtTime(soundOn ? .22 : 0, ambience.context.currentTime, .3);
      root.dataset.sound = soundOn ? 'on' : 'off';
      if (soundButton) {
        soundButton.textContent = soundOn ? '♫ 声音开' : '♫ 声音关';
        soundButton.setAttribute('aria-label', soundOn ? '关闭环境音' : '开启环境音');
        soundButton.setAttribute('aria-pressed', String(soundOn));
      }
      announce(soundOn ? '环境音已开启，可随时关闭。' : '环境音已关闭。');
    } catch { announce('声音暂不可用，画面与互动可继续体验。'); }
  };
  const openCredits = () => credits?.showModal();
  const closeCredits = () => { credits?.close(); creditsOpen?.focus(); };
  const onBackdrop = (event: MouseEvent) => { if (credits && event.target === credits) { const rect = credits.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeCredits(); } };
  const visibility = () => {
    if (document.hidden) {
      cancelRotation(); touchPointers.clear();
      if (frame) cancelAnimationFrame(frame);
      frame = 0; lastTime = 0;
      if (ambience) ambience.master.gain.setTargetAtTime(0, ambience.context.currentTime, .15);
    } else {
      if (ambience && soundOn) ambience.master.gain.setTargetAtTime(.22, ambience.context.currentTime, .3);
      refresh();
    }
  };
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    cancelRotation(); touchPointers.clear();
    if (frame) cancelAnimationFrame(frame);
    clearTimeout(statusTimer);
    observer?.disconnect();
    headingObserver?.disconnect();
    scene?.dispose();
    ambience?.tones.forEach(tone => tone.stop());
    ambience?.noise.stop();
    void ambience?.context.close();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', refresh);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('pointerleave', resetPointer);
    window.removeEventListener('wheel', cancelWarpTravel);
    window.removeEventListener('touchmove', cancelWarpTravel);
    window.removeEventListener('keydown', onScrollKey);
    document.removeEventListener('click', onAnchorNavigation);
    window.removeEventListener('pointerdown', onTouchStart, true);
    window.removeEventListener('pointerup', onTouchEnd, true);
    window.removeEventListener('pointercancel', onTouchEnd, true);
    window.removeEventListener('pointermove', onRotationMove);
    window.removeEventListener('pointerup', onRotationEnd);
    window.removeEventListener('pointercancel', onRotationEnd);
    window.removeEventListener('blur', onWindowBlur);
    rotationSurface?.removeEventListener('pointerdown', onRotationStart);
    rotationSurface?.removeEventListener('lostpointercapture', onRotationEnd);
    rotationSurface?.removeEventListener('keydown', onRotationKey);
    rotationReset?.removeEventListener('click', resetRotation);
    document.removeEventListener('visibilitychange', visibility);
    reduced.removeEventListener('change', setMotion);
    motionButton?.removeEventListener('click', toggleMotion);
    soundButton?.removeEventListener('click', toggleSound);
    creditsOpen?.removeEventListener('click', openCredits);
    creditsClose?.removeEventListener('click', closeCredits);
    credits?.removeEventListener('click', onBackdrop);
    actions.forEach(button => button.removeEventListener('click', interact));
  };
  root.dataset.sound = 'off';
  motionButton?.addEventListener('click', toggleMotion);
  soundButton?.addEventListener('click', toggleSound);
  creditsOpen?.addEventListener('click', openCredits);
  creditsClose?.addEventListener('click', closeCredits);
  credits?.addEventListener('click', onBackdrop);
  actions.forEach(button => button.addEventListener('click', interact));
  [soundButton, creditsOpen].forEach(button => { if (button) button.disabled = false; });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerleave', resetPointer);
  window.addEventListener('wheel', cancelWarpTravel, { passive: true });
  window.addEventListener('touchmove', cancelWarpTravel, { passive: true });
  window.addEventListener('keydown', onScrollKey);
  document.addEventListener('click', onAnchorNavigation);
  window.addEventListener('pointerdown', onTouchStart, true);
  window.addEventListener('pointerup', onTouchEnd, true);
  window.addEventListener('pointercancel', onTouchEnd, true);
  window.addEventListener('pointermove', onRotationMove, { passive: false });
  window.addEventListener('pointerup', onRotationEnd);
  window.addEventListener('pointercancel', onRotationEnd);
  window.addEventListener('blur', onWindowBlur);
  rotationSurface?.addEventListener('pointerdown', onRotationStart);
  rotationSurface?.addEventListener('lostpointercapture', onRotationEnd);
  rotationSurface?.addEventListener('keydown', onRotationKey);
  rotationReset?.addEventListener('click', resetRotation);
  document.addEventListener('visibilitychange', visibility);
  reduced.addEventListener('change', setMotion);
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  window.addEventListener('pagehide', event => { if (!event.persisted) cleanup(); });
  measure(); setMotion();
  observer = new ResizeObserver(refresh); observer.observe(story);
  if ('IntersectionObserver' in window) {
    headingObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          headingObserver?.unobserve(entry.target);
        }
      });
    }, { threshold: .18, rootMargin: '0px 0px -12% 0px' });
    root.dataset.typography = 'ready';
    steps.forEach(step => headingObserver?.observe(step));
  }
  void (async () => {
    try {
      const { createCosmicScene } = await import('./cosmic-scene');
      const result = await createCosmicScene(canvas, JSON.parse(root.dataset.assets || '{}'));
      if (disposed) { result.dispose(); return; }
      scene = result;
      scene.resize(innerWidth, innerHeight, pixelRatio);
      scene.update({ progress: targetProgress, time: 0, pointer, night, orbit: 0, warp: 0, signal: signalTarget, rotation: yaw, reduced: !active });
      root.dataset.renderer = 'webgl';
      refreshRotationInterface();
      actions.forEach(button => { button.disabled = button.dataset.cosmicAction === 'warp' && !active; });
      if (loading) loading.hidden = true;
      schedule();
    } catch {
      if (disposed) return;
      root.dataset.renderer = 'fallback';
      if (loading) { loading.textContent = '当前为静态观测，仍可切换章节。'; setTimeout(() => { loading.hidden = true; }, 4500); }
    }
  })();
}

initializeCosmicJourney();
document.addEventListener('astro:page-load', initializeCosmicJourney);
export {};
