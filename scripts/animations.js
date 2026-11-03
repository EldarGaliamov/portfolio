(() => {
  const gsap = window.gsap;
  if (!gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(window.ScrollTrigger);
  const media = gsap.matchMedia();
  // Keep the original site's entrance and hover animations. Add only a footer fade.
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray('.home-footer__mark').forEach(element => {
      gsap.fromTo(element, { opacity: .35 }, {
        opacity: 1, duration: .7, ease: 'power2.out', clearProps: 'opacity',
        scrollTrigger: { trigger: element, start: 'top 95%', once: true }
      });
    });
  });
})();
