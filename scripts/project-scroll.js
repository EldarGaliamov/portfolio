(() => {
  const { gsap, ScrollTrigger } = window;
  const stage = document.querySelector('.home-hero-stage');
  const hero = stage?.querySelector('.home-hero');
  const details = hero?.querySelector('.home-hero__details');
  const items = [...(stage?.querySelectorAll('.home-projects__item') ?? [])];
  if (!gsap || !ScrollTrigger || !details || !items.length) return;

  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add({
    motion: '(prefers-reduced-motion: no-preference)',
    wide: '(min-width: 761px)',
  }, ({ conditions: { motion, wide } }) => {
    if (!motion) return;

    stage.dataset.projectMotion = '';
    const transition = gsap.timeline({
      scrollTrigger: {
        trigger: items[0],
        start: wide ? 'clamp(top 94%)' : 'clamp(top 66%)',
        end: () => `+=${gsap.utils.clamp(260, 390, innerHeight * 0.48)}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

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
