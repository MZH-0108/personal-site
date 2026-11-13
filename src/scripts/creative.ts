import type { CreativeFrame } from './creative-scene';
import { dragAxis, type DragAxis } from './cosmic-rotation';
import { chapterProgress } from './creative-particles';

type CreativeScene = { update(frame: CreativeFrame): void; resize(width: number, height: number, dpr: number): void; dispose(): void };

function initializeCreativeSpace() {
  const root = document.querySelector<HTMLElement>('[data-creative]');
  const canvas = root?.querySelector<HTMLCanvasElement>('[data-creative-canvas]');
  const surface = root?.querySelector<HTMLElement>('[data-creative-surface]');
  if (!root || !canvas || !surface || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const release = root.querySelector<HTMLButtonElement>('[data-creative-release]');
  const gather = root.querySelector<HTMLButtonElement>('[data-creative-gather]');
  const motion = root.querySelector<HTMLButtonElement>('[data-creative-motion]');
  const loading = root.querySelector<HTMLElement>('[data-creative-loading]');
  const status = root.querySelector<HTMLElement>('[data-creative-status]');
  const hint = root.querySelector<HTMLElement>('#creative-instructions');
  const chapters = [...root.querySelectorAll<HTMLElement>('[data-creative-chapter]')];
  const counter = root.querySelector<HTMLElement>('[data-creative-counter]');
  const meter = root.querySelector<HTMLElement>('[data-creative-meter]');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let scene: CreativeScene | undefined;
  let disposed = false, active = false, released = false;
  let stopped = false;
  try { stopped = sessionStorage.getItem('mzh-creative-motion') === 'off'; } catch {}
  let frame = 0, previous = 0, elapsed = 0, pulse = 0, progress = 0;
  let revealer: IntersectionObserver | undefined;
  let ratio = Math.min(devicePixelRatio || 1, innerWidth < 800 ? 1.25 : 1.5), slowFrames = 0;
  let announcement: ReturnType<typeof setTimeout> | undefined;
  let observer: ResizeObserver | undefined;
  let drag: { id: number; startX: number; startY: number; axis: DragAxis; moved: boolean } | undefined;
  const touches = new Set<number>();
  const pointer = { x: .35, y: 0, active: false };
  const setStatus = (text: string) => {
    if (status) status.textContent = text;
    clearTimeout(announcement);
    announcement = setTimeout(() => { if (status) status.textContent = ''; }, 4000);
  };
  const draw = (now: number) => {
    frame = 0;
    if (disposed || document.hidden) return;
    const interval = previous ? now - previous : 16.7;
    const delta = Math.min(interval / 1000, .05);
    previous = now;
    if (active) elapsed += delta;
    scene?.update({ time: elapsed, delta, pointer, released, pulse, reduced: !active, progress });
    slowFrames = interval > 29 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
    if (slowFrames > 55 && ratio > .85) { ratio = Math.max(.85, ratio - .2); resize(); slowFrames = 0; }
    // Adaptive resizing can already queue a frame; keep a single animation chain.
    if (active && scene && !frame) frame = requestAnimationFrame(draw);
  };
  const schedule = () => { if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(draw); };
  const cancelGesture = () => {
    const previousDrag = drag;
    drag = undefined;
    root.dataset.dragging = 'false';
    pointer.active = false;
    if (previousDrag) { try { if (surface.hasPointerCapture(previousDrag.id)) surface.releasePointerCapture(previousDrag.id); } catch {} }
    schedule();
  };
  // Chapters are measured against the sticky stage: a chapter is "current" when its top reaches the stage's top.
  const measure = () => {
    const top = root.getBoundingClientRect().top;
    const stageTop = canvas.getBoundingClientRect().top;
    const tops = chapters.map(chapter => chapter.getBoundingClientRect().top - top);
    progress = chapterProgress(tops, stageTop - top);
    const current = Math.min(chapters.length - 1, Math.max(0, Math.round(progress)));
    if (root.dataset.chapter !== String(current)) {
      root.dataset.chapter = String(current);
      root.dataset.dim = String(chapters[current]?.hasAttribute('data-creative-dim') ?? false);
      if (counter) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`;
    }
    if (meter && chapters.length > 1) meter.style.transform = `scaleX(${(progress / (chapters.length - 1)).toFixed(4)})`;
  };
  const onScroll = () => { measure(); schedule(); };
  const resize = () => {
    cancelGesture();
    const bounds = canvas.getBoundingClientRect();
    scene?.resize(bounds.width, bounds.height, ratio);
    measure();
    schedule();
  };
  const positionPointer = (event: Pick<PointerEvent, 'clientX' | 'clientY'>) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = Math.min(1, Math.max(-1, (event.clientX - bounds.left) / Math.max(1, bounds.width) * 2 - 1));
    pointer.y = Math.min(1, Math.max(-1, 1 - (event.clientY - bounds.top) / Math.max(1, bounds.height) * 2));
    pointer.active = true;
  };
  const onDown = (event: PointerEvent) => {
    if (!scene || !event.isPrimary || touches.size > 1 || event.pointerType === 'mouse' && event.button !== 0) return;
    cancelGesture();
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, axis: 'pending', moved: false };
    positionPointer(event);
    if (event.pointerType === 'touch') pointer.active = false;
    schedule();
  };
  const onMove = (event: PointerEvent) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    drag.axis = dragAxis(dx, dy, drag.axis);
    if (Math.max(Math.abs(dx), Math.abs(dy)) >= 8) drag.moved = true;
    if (drag.axis !== 'horizontal') { if (drag.axis === 'vertical') pointer.active = false; return; }
    if (event.cancelable) event.preventDefault();
    try { if (!surface.hasPointerCapture(event.pointerId)) surface.setPointerCapture(event.pointerId); } catch {}
    root.dataset.dragging = 'true'; positionPointer(event); schedule();
  };
  const onHover = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || drag) return;
    positionPointer(event); schedule();
  };
  const onLeave = () => { if (!drag) { pointer.active = false; schedule(); } };
  const onEnd = (event: PointerEvent) => {
    if (drag?.id !== event.pointerId) return;
    if (event.type === 'pointerup' && !drag.moved && touches.size < 2) { pulse++; setStatus('涟漪散开，粒子正在回到字形。'); }
    cancelGesture();
  };
  const recordTouch = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') return;
    touches.add(event.pointerId);
    if (touches.size > 1) cancelGesture();
  };
  const forgetTouch = (event: PointerEvent) => touches.delete(event.pointerId);
  const setReleased = (next: boolean) => {
    cancelGesture(); released = next; root.dataset.released = String(next);
    release?.setAttribute('aria-pressed', String(next));
    if (release) release.textContent = next ? '收回粒子' : '释放粒子';
    setStatus(next ? '粒子已释放。点击重新聚合，让 MZH 再次成形。' : '粒子重新聚合，回到 MZH。'); schedule();
  };
  const toggleRelease = () => setReleased(!released);
  const regroup = () => setReleased(false);
  const setMotion = () => {
    cancelGesture(); active = !preference.matches && !stopped;
    root.dataset.motion = preference.matches ? 'system' : active ? 'on' : 'off';
    if (motion) { motion.disabled = !scene || preference.matches; motion.textContent = preference.matches ? '系统静态模式' : '静态模式'; motion.setAttribute('aria-pressed', String(!active)); }
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previous = 0; schedule();
  };
  const toggleMotion = () => {
    stopped = !stopped;
    try { sessionStorage.setItem('mzh-creative-motion', stopped ? 'off' : 'on'); } catch {}
    setMotion(); setStatus(active ? '动态已开启。' : '静态模式：仍可手动拨动、释放或聚合。');
  };
  const onKey = (event: KeyboardEvent) => {
    if (!scene) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' ', 'Escape'].includes(event.key)) event.preventDefault();
    if (event.repeat && ['Enter', ' ', 'Escape'].includes(event.key)) return;
    if (event.key === 'Enter') { pulse++; pointer.active = true; setStatus('涟漪散开。'); }
    if (event.key === ' ') toggleRelease();
    if (event.key === 'Escape') regroup();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { pointer.x = Math.max(-.9, Math.min(.9, pointer.x + (event.key === 'ArrowRight' ? .12 : -.12))); pointer.active = true; }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { pointer.y = Math.max(-.8, Math.min(.8, pointer.y + (event.key === 'ArrowUp' ? .12 : -.12))); pointer.active = true; }
    schedule();
  };
  const blur = () => { cancelGesture(); touches.clear(); };
  const visibility = () => {
    if (document.hidden) { blur(); if (frame) cancelAnimationFrame(frame); frame = 0; previous = 0; }
    else schedule();
  };
  const cleanup = () => {
    if (disposed) return;
    disposed = true; cancelGesture(); touches.clear(); clearTimeout(announcement);
    if (frame) cancelAnimationFrame(frame);
    observer?.disconnect(); revealer?.disconnect(); scene?.dispose();
    window.removeEventListener('scroll', onScroll);
    release?.removeEventListener('click', toggleRelease); gather?.removeEventListener('click', regroup); motion?.removeEventListener('click', toggleMotion);
    surface.removeEventListener('pointerdown', onDown); root.removeEventListener('pointermove', onHover); root.removeEventListener('pointerleave', onLeave); surface.removeEventListener('lostpointercapture', onEnd); surface.removeEventListener('keydown', onKey); surface.removeEventListener('blur', onLeave);
    window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onEnd); window.removeEventListener('pointercancel', onEnd);
    window.removeEventListener('pointerdown', recordTouch, true); window.removeEventListener('pointerup', forgetTouch, true); window.removeEventListener('pointercancel', forgetTouch, true);
    window.removeEventListener('resize', resize); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', visibility); preference.removeEventListener('change', setMotion);
  };
  release?.addEventListener('click', toggleRelease); gather?.addEventListener('click', regroup); motion?.addEventListener('click', toggleMotion);
  surface.addEventListener('pointerdown', onDown); root.addEventListener('pointermove', onHover); root.addEventListener('pointerleave', onLeave); surface.addEventListener('lostpointercapture', onEnd); surface.addEventListener('keydown', onKey); surface.addEventListener('blur', onLeave);
  window.addEventListener('pointermove', onMove, { passive: false }); window.addEventListener('pointerup', onEnd); window.addEventListener('pointercancel', onEnd);
  window.addEventListener('pointerdown', recordTouch, true); window.addEventListener('pointerup', forgetTouch, true); window.addEventListener('pointercancel', forgetTouch, true);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize, { passive: true }); window.addEventListener('blur', blur); document.addEventListener('visibilitychange', visibility); preference.addEventListener('change', setMotion);
  document.addEventListener('astro:before-swap', cleanup, { once: true }); window.addEventListener('pagehide', event => { if (!event.persisted) cleanup(); });
  observer = new ResizeObserver(resize); observer.observe(root);
  // Chapter copy rises into place the first time each chapter comes into view.
  if ('IntersectionObserver' in window) {
    revealer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible'); revealer?.unobserve(entry.target);
    }), { threshold: .12 });
    chapters.forEach(chapter => revealer?.observe(chapter));
    root.dataset.reveal = 'ready';
  }
  measure();
  setMotion();
  void (async () => {
    try {
      const { createCreativeScene } = await import('./creative-scene');
      const result = await createCreativeScene(canvas);
      if (disposed) { result.dispose(); return; }
      scene = result; resize(); scene.update({ time: 0, delta: 1 / 60, pointer, released, pulse, reduced: !active, progress });
      root.dataset.renderer = 'webgl'; surface.hidden = false; surface.tabIndex = 0;
      [release, gather].forEach(button => { if (button) button.disabled = false; });
      if (loading) loading.hidden = true;
      setMotion();
    } catch {
      if (disposed) return;
      root.dataset.renderer = 'fallback'; surface.hidden = true;
      if (loading) loading.hidden = true;
      if (hint) hint.textContent = '当前为静态展示';
      const cue = root.querySelector<HTMLElement>('.creative-scroll-cue');
      if (cue) cue.firstChild!.textContent = '向下滚动，继续浏览 ';
      setStatus('这台设备暂不支持三维渲染，已保留静态画面。');
    }
  })();
}

initializeCreativeSpace();
document.addEventListener('astro:page-load', initializeCreativeSpace);
