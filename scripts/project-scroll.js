import { waapi } from './vendor/anime-waapi.min.js';

const stage = document.querySelector('.home-hero-stage');
const projects = document.querySelector('.home-projects');

if (stage && projects && typeof stage.animate === 'function' && 'ResizeObserver' in window) {
  setupParallax(stage, projects);
}

function setupParallax(stage, projects) {
  const main = stage.closest('.home-main');
  const hero = stage.querySelector('.home-hero');
  const cards = [...projects.querySelectorAll('.home-case-card')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = matchMedia('(max-height: 680px), (max-width: 360px)');
  const playback = { autoplay: false, persist: true, duration: 1000, ease: 'linear' };
  const observer = new ResizeObserver(() => schedule(true));
  let layers = [];
  let frame = 0;
  let needsMeasure = false;

  function createLayer(element, start, distance, transform, opacity) {
    return { start, distance, animation: waapi.animate(element, { ...playback, transform, opacity }) };
  }

  function measure() {
    for (const layer of layers) layer.animation.revert();
    const height = document.documentElement.clientHeight;
    const scroll = window.scrollY;
    const stageTop = stage.getBoundingClientRect().top + scroll;
    const compact = shortScreen.matches;
    const heroStart = stageTop + (compact ? 70 : -96);
    const heroDistance = Math.max(280, Math.min(470, height * 0.52));
    const heroDrift = Math.round(heroDistance * (compact ? 0.22 : 0.57));
    const cardDrift = Math.round(Math.min(156, height * 0.17));
    const cardTops = cards.map(card => card.getBoundingClientRect().top + scroll);

    // The bio loses less screen distance than the page, while each entering card gains distance.
    const bioLayer = createLayer(hero, heroStart, heroDistance,
      ['translateY(0px) scale(1)', `translateY(${heroDrift}px) scale(0.76)`], [1, 0.22]);
    const cardLayers = cards.map((card, index) => createLayer(card, cardTops[index] - height,
      height * 0.46, [`translateY(${cardDrift}px)`, 'translateY(0px)'], [0.35, 1]));
    layers = [bioLayer, ...cardLayers];
  }

  function render() {
    frame = 0;
    if (needsMeasure) {
      needsMeasure = false;
      measure();
    }
    const scroll = window.scrollY;
    for (const layer of layers) {
      const progress = Math.max(0, Math.min(1, (scroll - layer.start) / layer.distance));
      if (progress === layer.progress) continue;
      layer.progress = progress;
      layer.animation.progress = progress;
    }
  }

  function schedule(remeasure = false) {
    if (reducedMotion.matches || document.hidden) return;
    needsMeasure ||= remeasure;
    if (!frame) frame = requestAnimationFrame(render);
  }

  const onScroll = () => schedule();
  const onResize = () => schedule(true);

  function syncPreference() {
    if (reducedMotion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      for (const layer of layers) layer.animation.revert();
      layers = [];
      main.removeAttribute('data-parallax');
      return;
    }
    main.setAttribute('data-parallax', '');
    observer.observe(stage);
    observer.observe(projects);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    onResize();
  }

  reducedMotion.addEventListener('change', syncPreference);
  document.addEventListener('visibilitychange', onResize);
  window.addEventListener('pageshow', onResize);
  syncPreference();
}
