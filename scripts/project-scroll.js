(() => {
  const { gsap, ScrollTrigger } = window;
  const stage = document.querySelector('.home-hero-stage');
  const hero = stage?.querySelector('.home-hero');
  const details = hero?.querySelector('.home-hero__details');
  const items = [...(stage?.querySelectorAll('.home-projects__item') ?? [])];
  if (!details || !items.length) return;

  const motionQuery = '(prefers-reduced-motion: no-preference)';
  const touchQuery = '(hover: none) and (pointer: coarse)';
  const nativeTimeline = CSS.supports('(animation-timeline: --project-entry) and (timeline-scope: --project-entry) and (animation-range: entry-crossing 0px 260px) and (view-timeline-inset: 0 34svh)');
  const nativeMotion = window.matchMedia(`${motionQuery} and ${touchQuery}`);
  const syncNativeMotion = () => {
    stage.toggleAttribute('data-native-project-motion', nativeTimeline && nativeMotion.matches);
  };
  syncNativeMotion();
  nativeMotion.addEventListener('change', syncNativeMotion);
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add({
    motion: motionQuery,
    wide: '(min-width: 761px)',
    touch: touchQuery,
  }, ({ conditions: { motion, wide, touch } }) => {
    if (!motion || (touch && nativeTimeline)) return;

    stage.dataset.projectMotion = '';
    const transition = gsap.timeline({
      scrollTrigger: {
        trigger: items[0],
        start: wide && !touch ? 'clamp(top 94%)' : 'clamp(top 66%)',
        end: () => `+=${gsap.utils.clamp(260, 390, innerHeight * 0.48)}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    if (touch) {
      // Older touch browsers still get a reversible transition with one scrubbed element.
      transition.to(hero, { y: 80, ease: 'sine.out', duration: 1 }, 0)
        .to(hero, { opacity: 0, ease: 'none', duration: 0.76 }, 0.24)
        .set(hero, { pointerEvents: 'none' }, 1);
      return () => { delete stage.dataset.projectMotion; };
    }

    // The first card passes in front while the bio continues to scroll at a slower rate.
    transition
      .to(hero, {
        y: () => Math.min(wide ? 160 : 92, innerHeight * (wide ? 0.21 : 0.12)),
        scale: wide ? 0.94 : 0.98,
        ease: 'sine.out',
        duration: 1,
      }, 0)
      .to(details, { opacity: 0, ease: 'sine.inOut', duration: 0.57 }, 0.14)
      .to(hero, { opacity: 0, ease: 'sine.inOut', duration: 0.52 }, 0.48)
      .set(hero, { pointerEvents: 'none' }, 0.92);

    items.forEach((item, index) => {
      const card = item.querySelector('.home-case-card');
      const side = index % 2 === 0 ? -1 : 1;
      gsap.fromTo(card, {
        x: wide ? side * 24 : 0,
        y: wide ? 76 : 42,
        scale: wide ? 0.965 : 0.985,
        // On narrow screens, native scrolling must always leave project links visible.
        ...(wide && { opacity: 0, pointerEvents: 'none' }),
      }, {
        x: 0,
        y: 0,
        scale: 1,
        ...(wide && { opacity: 1, pointerEvents: 'auto' }),
        ease: 'sine.out',
        scrollTrigger: {
          trigger: item,
          start: 'clamp(top bottom+=52)',
          end: () => `+=${gsap.utils.clamp(180, 300, innerHeight * 0.42)}`,
          scrub: true,
        },
      });
    });

    return () => { delete stage.dataset.projectMotion; };
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
