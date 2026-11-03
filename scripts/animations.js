(() => {
  const gsap = window.gsap;
  if (!gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(window.ScrollTrigger);
  const motionButton = document.querySelector('.motion-toggle');
  const dialog = document.querySelector('.detail-dialog');
  if (!motionButton || !dialog) return;

  const media = gsap.matchMedia();
  // Revert inline styles and stop animations when the system requests less motion.
  media.add('(prefers-reduced-motion: no-preference)', () => {
    let context;
    let first = true;
    let mobile;
    let dialogObserver;
    function stop() {
      dialogObserver?.disconnect();
      mobile?.revert();
      context?.revert();
      context = undefined;
    }
    function sync() {
      if (motionButton.getAttribute('aria-pressed') !== 'true') { stop(); return; }
      if (context) return;
      context = gsap.context(self => {
        if (first) {
          const entrance = gsap.timeline({ defaults: { ease: 'power2.out' } })
            .from('.site-header', { opacity: 0, duration: .45 })
            .from('.intro > *', { opacity: 0, y: 14, stagger: .09, duration: .65 }, '-=.2')
            .from('.portrait', { opacity: 0, duration: .8 }, '-=.5');
          if (matchMedia('(min-width: 901px)').matches) {
            entrance.from('.scene-panel', { opacity: 0, stagger: .1, duration: .6 }, '-=.55');
          }
          entrance.from('.nameplate, .scene-footer', { opacity: 0, duration: .5 }, '-=.25');
          first = false;
        }
        mobile = gsap.matchMedia();
        mobile.add('(max-width: 900px)', () => {
          gsap.utils.toArray('.scene-panel').forEach(panel => {
            gsap.from(panel, {
              opacity: .25, duration: .6, ease: 'power2.out', immediateRender: false,
              scrollTrigger: { trigger: panel, start: 'top 95%', once: true }
            });
          });
        });
        self.add('openPanel', () => {
          if (!dialog.open) return;
          gsap.fromTo(dialog.querySelectorAll('.dialog-content > *'),
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: .35, stagger: .04, clearProps: 'opacity,transform', overwrite: true });
        });
        dialogObserver = new MutationObserver(() => self.openPanel());
        dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
      });
    }
    // experiment.js updates aria-pressed for both the button and system changes.
    const stateObserver = new MutationObserver(sync);
    stateObserver.observe(motionButton, { attributes: true, attributeFilter: ['aria-pressed'] });
    sync();
    return () => { stateObserver.disconnect(); stop(); };
  });
})();
