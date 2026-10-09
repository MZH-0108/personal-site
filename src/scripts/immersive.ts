type MotionScene = { element: HTMLElement; top: number; height: number; stage: HTMLElement | null; stageHeight: number; visible: boolean; };
type MotionLayer = { element: HTMLElement; scene: MotionScene; distance: number; mobileDistance: number; scale: number; };

function initializeImmersive() {
  const page = document.querySelector<HTMLElement>('[data-immersive]');
  if (!page || page.dataset.initialized) return;
  page.dataset.initialized = 'true';
  const control = page.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 700px)');
  const cinematic = window.matchMedia('(min-width: 701px) and (min-height: 561px)');
  const scenes: MotionScene[] = [...page.querySelectorAll<HTMLElement>('[data-motion-scene]')].map(element => ({ element, top: 0, height: 1, stage: element.querySelector<HTMLElement>('.im-feature-sticky'), stageHeight: 1, visible: true }));
  const layers: MotionLayer[] = [...page.querySelectorAll<HTMLElement>('[data-parallax]')].flatMap(element => {
    const scene = scenes.find(item => item.element === element.closest('[data-motion-scene]'));
    return scene ? [{ element, scene, distance: Number(element.dataset.parallaxDistance) || 0, mobileDistance: Number(element.dataset.parallaxMobile) || 0, scale: Number(element.dataset.parallaxScale) || 1 }] : [];
  });
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  let optedOut = false;
  try { optedOut = sessionStorage.getItem('mzh-immersive-motion') === 'off'; } catch {}
  let active = false;
  let frame = 0;
  let targetScroll = window.scrollY;
  let renderedScroll = targetScroll;
  let lastTime = 0;
  let viewportHeight = window.innerHeight;

  const measure = () => {
    viewportHeight = window.innerHeight;
    // Read geometry together; scrolling only updates transforms after this pass.
    const geometry = scenes.map(scene => ({ top: scene.element.getBoundingClientRect().top + window.scrollY, height: scene.element.offsetHeight, stageHeight: scene.stage?.offsetHeight || 1 }));
    scenes.forEach((scene, index) => Object.assign(scene, geometry[index]));
  };
  const progressFor = (scene: MotionScene) => scene.stage && cinematic.matches
    ? clamp((renderedScroll - scene.top + 110) / Math.max(1, scene.height - scene.stageHeight))
    : clamp((renderedScroll + viewportHeight - scene.top) / (viewportHeight + scene.height));

  const render = (time: number) => {
    frame = 0;
    if (!active || document.hidden) return;
    const delta = lastTime ? Math.min(64, time - lastTime) : 16;
    lastTime = time;
    renderedScroll += (targetScroll - renderedScroll) * (1 - Math.exp(-delta / 70));
    if (Math.abs(targetScroll - renderedScroll) < 0.1) renderedScroll = targetScroll;
    const progress = new Map<MotionScene, number>();
    for (const scene of scenes) {
      if (!scene.visible) continue;
      const value = progressFor(scene);
      progress.set(scene, value);
      scene.element.style.setProperty('--im-progress', value.toFixed(4));
    }
    for (const layer of layers) {
      const value = progress.get(layer.scene);
      if (value === undefined) continue;
      const distance = mobile.matches ? layer.mobileDistance : layer.distance;
      const maximumScale = mobile.matches ? Math.min(layer.scale, 1.04) : layer.scale;
      layer.element.style.setProperty('--im-y', `${((value - 0.5) * distance).toFixed(2)}px`);
      layer.element.style.setProperty('--im-scale', (maximumScale - (maximumScale - 1) * value).toFixed(4));
    }
    if (renderedScroll !== targetScroll) frame = requestAnimationFrame(render);
    else lastTime = 0;
  };
  const schedule = () => {
    targetScroll = window.scrollY;
    if (active && !frame && !document.hidden) frame = requestAnimationFrame(render);
  };
  const refresh = () => { measure(); schedule(); };
  const setMotion = (preservePosition = false) => {
    const anchor = preservePosition ? scenes.find(scene => { const rect = scene.element.getBoundingClientRect(); return rect.top <= 120 && rect.bottom > 120; }) : undefined;
    const previousTop = anchor?.element.getBoundingClientRect().top;
    active = !reducedMotion.matches && !optedOut;
    page.dataset.motion = reducedMotion.matches ? 'system' : active ? 'on' : 'off';
    if (control) {
      control.disabled = reducedMotion.matches;
      control.textContent = reducedMotion.matches ? '已跟随系统减少动效' : '减少动效';
      control.setAttribute('aria-pressed', String(!active));
    }
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (!active) layers.forEach(layer => { layer.element.style.removeProperty('--im-y'); layer.element.style.removeProperty('--im-scale'); });
    measure();
    if (anchor && previousTop !== undefined) window.scrollBy({ top: anchor.element.getBoundingClientRect().top - previousTop, behavior: 'instant' });
    targetScroll = renderedScroll = window.scrollY;
    schedule();
  };
  const toggleMotion = () => {
    optedOut = !optedOut;
    try { sessionStorage.setItem('mzh-immersive-motion', optedOut ? 'off' : 'on'); } catch {}
    setMotion(true);
  };
  const systemChange = () => setMotion(true);
  const visibilityChange = () => {
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    } else { renderedScroll = window.scrollY; refresh(); }
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const scene = scenes.find(item => item.element === entry.target);
      if (scene) { scene.visible = entry.isIntersecting; scene.element.dataset.inView = String(entry.isIntersecting); }
    }
    schedule();
  }, { rootMargin: '120px 0px' });
  scenes.forEach(scene => observer.observe(scene.element));
  const resizeObserver = new ResizeObserver(refresh);
  resizeObserver.observe(page);
  control?.addEventListener('click', toggleMotion);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('load', refresh);
  reducedMotion.addEventListener('change', systemChange);
  mobile.addEventListener('change', refresh);
  cinematic.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', visibilityChange);
  setMotion();
  // Native hash navigation stays accurate when enhancement changes section heights.
  if (window.location.hash) requestAnimationFrame(() => {
    try { document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch {}
  });
  document.addEventListener('astro:before-swap', () => {
    active = false;
    if (frame) cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    control?.removeEventListener('click', toggleMotion);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', refresh);
    window.removeEventListener('load', refresh);
    reducedMotion.removeEventListener('change', systemChange);
    mobile.removeEventListener('change', refresh);
    cinematic.removeEventListener('change', refresh);
    document.removeEventListener('visibilitychange', visibilityChange);
  }, { once: true });
}

initializeImmersive();
document.addEventListener('astro:page-load', initializeImmersive);
export {};
