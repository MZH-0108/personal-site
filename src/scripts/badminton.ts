import { comboCall, popStyle } from './badminton-combo';
import { createShuttle, followPointer, stepShuttle, type Racket } from './badminton-physics';
import type { BadmintonLayout, createBadmintonScene } from './badminton-scene';

type Scene = Awaited<ReturnType<typeof createBadmintonScene>>;
const BEST_KEY = 'mzh-badminton-best';
const MOTION_KEY = 'mzh-badminton-motion';

function initializeBadminton() {
  const root = document.querySelector<HTMLElement>('[data-badminton]');
  const canvas = root?.querySelector<HTMLCanvasElement>('[data-badminton-canvas]');
  const surface = root?.querySelector<HTMLElement>('[data-badminton-surface]');
  if (!root || !canvas || !surface || root.dataset.initialized) return;
  root.dataset.initialized = 'true';
  const countOutput = root.querySelector<HTMLElement>('[data-badminton-count]');
  const bestOutput = root.querySelector<HTMLElement>('[data-badminton-best]');
  const start = root.querySelector<HTMLButtonElement>('[data-badminton-start]');
  const motion = root.querySelector<HTMLButtonElement>('[data-badminton-motion]');
  const loading = root.querySelector<HTMLElement>('[data-badminton-loading]');
  const status = root.querySelector<HTMLElement>('[data-badminton-status]');
  const hint = root.querySelector<HTMLElement>('[data-badminton-hint]');
  const effects = root.querySelector<HTMLElement>('[data-badminton-effects]');
  const clock = root.querySelector<HTMLElement>('[data-badminton-clock]');
  const params = new URLSearchParams(location.search);
  // Development only: ?preview=17 (a number pop) or ?preview=30 (a cheer) freezes that moment for screenshots.
  const previewStreak = import.meta.env.DEV ? Number.parseInt(params.get('preview') ?? '', 10) : Number.NaN;

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');

  let scene: Scene | undefined;
  let layout: BadmintonLayout | undefined;
  let disposed = false, active = false, playing = false, stopped = false;
  try { stopped = sessionStorage.getItem(MOTION_KEY) === 'off'; } catch {}
  // A preview holds the scene still (static mode) while the call-out animations still play.
  if (Number.isFinite(previewStreak) && previewStreak > 0) stopped = true;
  let frame = 0, previous = 0, elapsed = 0, swing = 0, streak = 0, best = 0, rallyTime = 0;
  /** Set by the development preview so a frozen frame is not re-posed or cleaned up. */
  let previewing = false;
  try { best = Math.max(0, Number.parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10) || 0); } catch {}
  let ratio = Math.min(devicePixelRatio || 1, innerWidth < 800 ? 1.25 : 1.5), slowFrames = 0;
  let observer: ResizeObserver | undefined;
  let announcement: ReturnType<typeof setTimeout> | undefined;
  let flickUntil = 0;
  const shuttle = createShuttle(0, 4);
  const racket: Racket = { x: 0, y: -1.6, vx: 0, vy: 0 };
  const target = { x: 0, y: -1.6 };

  const setStatus = (text: string) => {
    if (status) status.textContent = text;
    clearTimeout(announcement);
    announcement = setTimeout(() => { if (status) status.textContent = ''; }, 4000);
  };
  const renderScore = () => {
    if (countOutput) countOutput.textContent = String(streak);
    if (bestOutput) bestOutput.textContent = String(best);
  };
  const bump = () => {
    if (!countOutput) return;
    countOutput.classList.remove('is-bumped');
    void countOutput.offsetWidth;
    countOutput.classList.add('is-bumped');
  };
  /** Place an effect at a play-plane point, as percentages of the stage, kept inside a margin. */
  const place = (element: HTMLElement, x: number, y: number, margin: { x: [number, number]; y: [number, number] }) => {
    if (!scene) return;
    const point = scene.toScreen(x, y);
    element.style.left = `${(Math.min(margin.x[1], Math.max(margin.x[0], point.x)) * 100).toFixed(2)}%`;
    element.style.top = `${(Math.min(margin.y[1], Math.max(margin.y[0], point.y)) * 100).toFixed(2)}%`;
  };
  const spawn = (element: HTMLElement, life: number) => {
    if (!effects) return;
    // Keep the layer light: the oldest effects make way if strokes come very fast.
    while (effects.childElementCount > 6) effects.firstElementChild?.remove();
    effects.append(element);
    if (!previewing) setTimeout(() => element.remove(), life);
  };
  /**
   * Celebrate a stroke: a tilted number beside the shuttle, an English cheer on every tenth stroke,
   * or a quiet note when a long rally ends. `heading` is the shuttle's sideways speed after the stroke.
   */
  const celebrate = (count: number, ended: boolean, x: number, y: number, heading: number) => {
    const call = comboCall(count, ended);
    if (!effects || !scene || !call) return;
    if (call.kind === 'pop' || call.kind === 'end') {
      const style = popStyle(count, heading);
      const pop = document.createElement('span');
      pop.className = call.kind === 'end' ? 'bm-pop bm-pop-end' : 'bm-pop';
      pop.textContent = call.text;
      if (call.kind === 'pop') pop.dataset.text = call.text;
      pop.style.setProperty('--rot', `${style.rotate}deg`);
      pop.style.setProperty('--scale', String(style.scale));
      pop.style.setProperty('--drift', `${style.drift}px`);
      place(pop, x + style.side * .7, y + .25, { x: [.06, .94], y: [.1, .9] });
      spawn(pop, call.kind === 'end' ? 1800 : 1100);
      return;
    }
    const cheer = document.createElement('div');
    cheer.className = 'bm-cheer';
    cheer.dataset.level = String(call.level);
    const rays = document.createElement('span'); rays.className = 'bm-cheer-rays';
    // Two stacked copies: a thick dark outline underneath, the glossy gradient fill on top.
    const word = document.createElement('strong'); word.className = 'bm-cheer-word';
    const edge = document.createElement('span'); edge.className = 'bm-cheer-edge'; edge.textContent = call.text;
    const fill = document.createElement('span'); fill.className = 'bm-cheer-fill'; fill.textContent = call.text; fill.dataset.text = call.text;
    word.append(edge, fill);
    const sub = document.createElement('span'); sub.className = 'bm-cheer-sub'; sub.textContent = `${call.count} HITS`;
    cheer.append(rays);
    for (let index = 0; index < 6; index++) {
      const sparkle = document.createElement('span'); sparkle.className = 'bm-sparkle';
      sparkle.style.setProperty('--x', `${Math.round(Math.cos(index * 1.05 + .4) * (150 + (index % 2) * 60))}px`);
      sparkle.style.setProperty('--y', `${Math.round(Math.sin(index * 1.05 + .4) * (70 + (index % 3) * 22))}px`);
      sparkle.style.setProperty('--delay', `${120 + index * 70}ms`);
      cheer.append(sparkle);
    }
    for (let index = 0; index < 10 + call.level * 4; index++) {
      const bit = document.createElement('i');
      bit.style.setProperty('--a', `${Math.round(index * (360 / (10 + call.level * 4)) + Math.random() * 14)}deg`);
      bit.style.setProperty('--d', `${Math.round(130 + Math.random() * 120 + call.level * 18)}px`);
      bit.style.setProperty('--spin', `${Math.round(Math.random() * 720 - 360)}deg`);
      cheer.append(bit);
    }
    cheer.append(word, sub);
    // Cheers sit beside the action but stay well inside the stage so the whole word is readable.
    // Wide screens keep it over the court on the right, clear of the copy and scoreboard; phones centre it.
    const compact = layout?.compact ?? false;
    place(cheer, x + (heading >= 0 ? -1.1 : 1.1), y + 1.1, { x: compact ? [.5, .5] : [.56, .72], y: [.28, .58] });
    spawn(cheer, 2200);
    root.classList.remove('is-shaking'); void root.offsetWidth; root.classList.add('is-shaking');
  };
  const clampTarget = () => {
    if (!layout) return;
    const area = layout.racketArea;
    target.x = Math.min(area.right, Math.max(area.left, target.x));
    target.y = Math.min(area.top, Math.max(area.bottom, target.y));
  };
  /** A still composition for reduced motion and the static mode. */
  const pose = () => {
    if (!layout) return;
    const { bounds, racketArea } = layout;
    const centre = (bounds.left + bounds.right) / 2;
    racket.x = target.x = centre - .2; racket.y = target.y = racketArea.bottom + .9; racket.vx = racket.vy = 0;
    Object.assign(shuttle, { x: centre + .35, y: racket.y + 2.3, vx: 0, vy: 0, angle: -Math.PI / 2 - .5, angular: 0, spin: .8, mode: 'flying', timer: 0, cooldown: 0 });
    swing = 0;
  };

  const draw = (now: number) => {
    frame = 0;
    if (disposed || document.hidden || !scene || !layout) return;
    const interval = previous ? now - previous : 16.7;
    const delta = Math.min(interval / 1000, .05);
    previous = now;
    if (active) {
      elapsed += delta;
      // Keyboard strokes lift the target briefly, then let it fall back, which reads as a flick.
      const lift = now < flickUntil ? 1.05 : 0;
      followPointer(racket, target.x, target.y + lift, delta);
      const event = stepShuttle(shuttle, racket, layout.bounds, delta);
      if (event === 'hit') {
        streak += 1; swing = 1; bump();
        celebrate(streak, false, shuttle.x, shuttle.y, shuttle.vx);
        if (streak > best) { best = streak; try { localStorage.setItem(BEST_KEY, String(best)); } catch {} }
        renderScore();
      } else if (event === 'drop') {
        celebrate(streak, true, shuttle.x, layout.bounds.floor + .9, 0);
        if (streak > 0) setStatus(streak >= best && streak > 1 ? `新纪录：连续 ${streak} 次！` : `这一轮连续 ${streak} 次。`);
        streak = 0; rallyTime = 0; renderScore();
      }
      swing = Math.max(0, swing - delta * 4.5);
      // The clock times the current rally, like a broadcast's rally timer.
      if (streak > 0) rallyTime += delta;
      if (clock) clock.textContent = `${String(Math.floor(rallyTime / 60)).padStart(2, '0')}:${String(Math.floor(rallyTime % 60)).padStart(2, '0')}`;
    }
    scene.update({ delta, time: elapsed, shuttle, racket, swing, reduced: !active });
    slowFrames = interval > 29 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
    if (slowFrames > 55 && ratio > .85) { ratio = Math.max(.85, ratio - .2); resize(); slowFrames = 0; }
    if (active && !frame) frame = requestAnimationFrame(draw);
  };
  const schedule = () => { if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(draw); };

  const resize = () => {
    if (!scene) return;
    const bounds = canvas.getBoundingClientRect();
    layout = scene.resize(bounds.width, bounds.height, ratio);
    if (!active && !previewing) pose(); else clampTarget();
    schedule();
  };

  const setPlaying = (next: boolean) => {
    // On touch screens the stage only captures gestures while playing, so the page can still scroll.
    playing = next && active;
    root.dataset.playing = String(playing);
    if (start) { start.textContent = playing ? '结束颠球' : '开始颠球'; start.setAttribute('aria-pressed', String(playing)); }
  };
  const setMotion = () => {
    active = !preference.matches && !stopped && Boolean(scene);
    root.dataset.motion = preference.matches ? 'system' : active ? 'on' : 'off';
    if (motion) { motion.disabled = !scene || preference.matches; motion.textContent = preference.matches ? '系统静态模式' : active ? '静态模式' : '恢复动画'; motion.setAttribute('aria-pressed', String(!active)); }
    if (start) start.disabled = !active;
    if (hint) hint.textContent = !scene ? '当前为静态展示' : preference.matches ? '系统已开启减少动态效果，当前为静态展示' : !active ? '静态模式：动画已暂停' : coarse.matches ? '点「开始颠球」，拖动球拍向上挥' : '移动鼠标控制球拍 · 向上挥拍击球';
    previous = 0;
    if (!active) { setPlaying(false); pose(); }
    else if (shuttle.mode !== 'flying' || shuttle.y < -1) { shuttle.mode = 'dropped'; shuttle.timer = .2; }
    if (!coarse.matches && active) setPlaying(true);
    schedule();
  };

  const toTarget = (event: PointerEvent) => {
    if (!scene) return;
    const rect = canvas.getBoundingClientRect();
    const point = scene.toPlane(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1));
    if (!point) return;
    target.x = point.x; target.y = point.y; clampTarget();
  };
  const onMove = (event: PointerEvent) => {
    if (!active || (event.pointerType === 'touch' && !playing)) return;
    toTarget(event); schedule();
  };
  const onDown = (event: PointerEvent) => {
    if (!active || !playing) return;
    toTarget(event);
    if (event.pointerType === 'touch') { try { surface.setPointerCapture(event.pointerId); } catch {} }
  };
  const onKey = (event: KeyboardEvent) => {
    if (!active) return;
    const step = .45;
    if (event.key === 'ArrowLeft') target.x -= step;
    else if (event.key === 'ArrowRight') target.x += step;
    else if (event.key === 'ArrowDown') target.y -= step;
    else if (event.key === 'ArrowUp' || event.key === ' ' || event.key === 'Enter') flickUntil = performance.now() + 110;
    else return;
    event.preventDefault(); clampTarget(); schedule();
  };
  const visibility = () => { previous = 0; if (!document.hidden) schedule(); };

  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    if (frame) cancelAnimationFrame(frame);
    clearTimeout(announcement);
    observer?.disconnect(); scene?.dispose();
    root.removeEventListener('pointermove', onMove);
    surface.removeEventListener('pointerdown', onDown); surface.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility);
    preference.removeEventListener('change', setMotion); coarse.removeEventListener('change', setMotion);
    delete root.dataset.initialized;
  };

  root.addEventListener('pointermove', onMove, { passive: true });
  surface.addEventListener('pointerdown', onDown); surface.addEventListener('keydown', onKey);
  window.addEventListener('resize', resize, { passive: true }); document.addEventListener('visibilitychange', visibility);
  preference.addEventListener('change', setMotion); coarse.addEventListener('change', setMotion);
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  window.addEventListener('pagehide', event => { if (!event.persisted) cleanup(); });
  start?.addEventListener('click', () => { setPlaying(!playing); if (playing) surface.focus({ preventScroll: true }); });
  motion?.addEventListener('click', () => {
    stopped = !stopped;
    try { sessionStorage.setItem(MOTION_KEY, stopped ? 'off' : 'on'); } catch {}
    setMotion();
    setStatus(stopped ? '已切换到静态模式。' : '动画已恢复。');
  });
  renderScore();

  void (async () => {
    try {
      const { createBadmintonScene } = await import('./badminton-scene');
      if (disposed) return;
      scene = await createBadmintonScene(canvas);
      if (disposed) { scene.dispose(); return; }
      root.dataset.renderer = 'webgl'; surface.hidden = false; surface.tabIndex = 0;
      if (loading) loading.hidden = true;
      observer = new ResizeObserver(resize); observer.observe(canvas);
      const rect = canvas.getBoundingClientRect();
      layout = scene.resize(rect.width, rect.height, ratio);
      const centre = (layout.bounds.left + layout.bounds.right) / 2;
      racket.x = target.x = centre; racket.y = target.y = layout.racketArea.bottom + .8;
      shuttle.x = centre; shuttle.y = layout.bounds.top;
      setMotion();
      // Development preview: freeze one celebration part-way so it can be screenshotted.
      const preview = previewStreak;
      if (import.meta.env.DEV && Number.isFinite(preview) && preview > 0) {
        if (hint) hint.textContent = coarse.matches ? '点「开始颠球」，拖动球拍向上挥' : '移动鼠标控制球拍 · 向上挥拍击球';
        if (motion) motion.textContent = '静态模式';
        previewing = true;
        streak = preview; best = Math.max(best, preview + 8); renderScore();
        if (clock) clock.textContent = '01:42';
        Object.assign(shuttle, { x: racket.x + .3, y: racket.y + .55, angle: Math.PI / 2 + .35 });
        scene.update({ delta: 0, time: 0, shuttle, racket, swing: .7, reduced: true });
        celebrate(preview, false, shuttle.x, shuttle.y, 1.6);
        const at = Number.parseFloat(params.get('at') ?? '.3');
        requestAnimationFrame(() => root.getAnimations({ subtree: true }).forEach(animation => {
          animation.pause();
          const timing = animation.effect?.getTiming();
          animation.currentTime = Number(timing?.delay ?? 0) + Number(timing?.duration ?? 0) * at;
        }));
        root.dataset.preview = 'ready';
      }
    } catch {
      if (disposed) return;
      root.dataset.renderer = 'fallback'; surface.hidden = true;
      if (loading) loading.hidden = true;
      if (hint) hint.textContent = '当前为静态展示';
      if (start) start.hidden = true;
      if (motion) motion.hidden = true;
      setStatus('这台设备暂不支持三维渲染，已保留静态画面。');
    }
  })();
}

initializeBadminton();
document.addEventListener('astro:page-load', initializeBadminton);
