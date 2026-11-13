(() => {
  if (typeof window.Lenis !== 'function') return;

  const smoothScroll = window.matchMedia('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)');
  let lenis;

  function syncLightbox() {
    if (document.body.classList.contains('is-lightbox-open')) lenis?.stop();
    else lenis?.start();
  }

  function syncScrollPreference() {
    if (!smoothScroll.matches) {
      lenis?.destroy();
      lenis = undefined;
      return;
    }

    lenis ??= new window.Lenis({
      autoRaf: true,
      lerp: document.querySelector('.portfolio-home') ? 0.2 : 0.12,
      syncTouch: false,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    syncLightbox();
  }

  syncScrollPreference();
  smoothScroll.addEventListener('change', syncScrollPreference);
  if (document.querySelector('.image-lightbox')) {
    new MutationObserver(syncLightbox).observe(document.body, { attributeFilter: ['class'] });
  }
})();
