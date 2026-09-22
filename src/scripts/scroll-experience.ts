import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const root = document.querySelector<HTMLElement>('[data-scroll-experience]');
const toggle = root?.querySelector<HTMLButtonElement>('[data-motion-toggle]');

if (root && toggle) {
  const preferenceKey = 'mzh-reduce-motion';
  const systemPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userReduced = false;
  try { userReduced = localStorage.getItem(preferenceKey) === 'true'; } catch { /* Storage is optional. */ }
  let media: ReturnType<typeof gsap.matchMedia> | undefined;
  const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-practice-link]')];
  const markers = [...root.querySelectorAll<HTMLElement>('[data-stack-marker]')];
  const setActive = (id: string | undefined) => links.forEach(link => {
    if (link.dataset.practiceLink === id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  // Natural-flow anchors keep chapter tracking correct while sticky cards overlap.
  let chapterFrame = 0;
  const updateChapter = () => {
    chapterFrame = 0;
    let current = markers[0]?.dataset.stackMarker;
    for (const marker of markers) {
      if (marker.getBoundingClientRect().top <= window.innerHeight * .45) current = marker.dataset.stackMarker;
    }
    setActive(current);
  };
  const queueChapter = () => { if (!chapterFrame) chapterFrame = requestAnimationFrame(updateChapter); };
  window.addEventListener('scroll', queueChapter, { passive: true });
  window.addEventListener('resize', queueChapter, { passive: true });

  function updateMotion() {
    media?.revert();
    const reduced = systemPreference.matches || userReduced;
    root!.dataset.motion = reduced ? 'reduced' : 'full';
    toggle!.hidden = false;
    toggle!.disabled = systemPreference.matches;
    toggle!.setAttribute('aria-pressed', String(reduced));
    toggle!.textContent = systemPreference.matches ? '已遵循系统减少动态设置' : reduced ? '开启动态效果' : '减少动态效果';
    if (reduced) return;

    media = gsap.matchMedia();
    media.add({ desktop: '(min-width: 1000px) and (min-height: 720px) and (hover: hover) and (pointer: fine)', compact: '(max-width: 999px), (max-height: 719px), (hover: none), (pointer: coarse)' }, context => {
      const desktop = !!context.conditions?.desktop;
      if (desktop) {
        // Animate inner elements on entry so entry and scroll never compete for a transform.
        if (window.scrollY < 80) {
          gsap.from('.motion-hero-copy > *', { y: 18, duration: .75, stagger: .06, ease: 'power3.out' });
          gsap.from('.motion-portrait', { y: 24, rotation: -1.2, duration: 1, ease: 'power3.out' });
        }
        const hero = gsap.timeline({ scrollTrigger: { trigger: '.motion-hero', start: 'top top', end: 'bottom top', scrub: .25 } });
        hero.to('[data-hero-copy]', { y: -90, ease: 'none' }, 0)
          .to('[data-hero-portrait]', { y: 65, rotation: 1.5, ease: 'none' }, 0);
        gsap.fromTo('[data-cinema-stage]', { scale: .94 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-cinema-track]', start: 'top 90%', end: 'top 22%', scrub: .25 } });
        const story = gsap.timeline({ scrollTrigger: { trigger: '[data-cinema-track]', start: 'top 65%', end: 'top 100px', scrub: .25 } });
        story.from('.cinema-copy h3, .cinema-subtitle', { y: 44, duration: .4, ease: 'none' }, 0)
          .from('.cinema-description, .cinema-tech', { y: 32, duration: .4, ease: 'none' }, .15)
          .from('.cinema-actions', { y: 20, duration: .3, ease: 'none' }, .35);
      }
      gsap.fromTo('[data-cinema-image]', { scale: desktop ? 1.16 : 1.025 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-cinema-track]', start: 'top 90%', end: desktop ? 'bottom bottom' : 'bottom top', scrub: .25 } });
      gsap.fromTo('[data-cinema-progress]', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '[data-cinema-track]', start: 'top 65%', end: 'bottom bottom', scrub: true } });
      if (desktop) {
        const cards = [...root!.querySelectorAll<HTMLElement>('[data-stack-card]')];
        cards.slice(0, -1).forEach((card, index) => {
          gsap.to(card, { scale: .95, ease: 'none', scrollTrigger: { trigger: markers[index + 1], start: 'top 75%', end: 'top 170px', scrub: .25 } });
        });
      }
      root!.querySelectorAll<HTMLElement>('[data-motion-reveal]').forEach(section => {
        gsap.from(section, { y: desktop ? 20 : 8, duration: .55, ease: 'power2.out', scrollTrigger: { trigger: section, start: 'top 94%', once: true } });
      });
    }, root!);
    ScrollTrigger.refresh();
  }
  toggle.addEventListener('click', () => {
    userReduced = !userReduced;
    try { localStorage.setItem(preferenceKey, String(userReduced)); } catch { /* Keep the in-memory preference. */ }
    updateMotion();
  });
  systemPreference.addEventListener('change', updateMotion);
  updateMotion();
  updateChapter();
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  window.addEventListener('pagehide', () => { media?.revert(); cancelAnimationFrame(chapterFrame); chapterFrame = 0; });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { updateChapter(); updateMotion(); }
  });
}
