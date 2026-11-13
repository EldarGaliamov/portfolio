(() => {
  if (typeof window.Lenis !== 'function') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lenis;

  function syncLightbox() {
    if (document.body.classList.contains('is-lightbox-open')) lenis?.stop();
    else lenis?.start();
  }

  function syncScrollPreference() {
    if (reducedMotion.matches) {
      lenis?.destroy();
      lenis = undefined;
      return;
    }

    lenis ??= new window.Lenis({
      autoRaf: true,
      lerp: 0.12,
      syncTouch: false,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    syncLightbox();
  }

  syncScrollPreference();
  reducedMotion.addEventListener('change', syncScrollPreference);
  if (document.querySelector('.image-lightbox')) {
    new MutationObserver(syncLightbox).observe(document.body, { attributeFilter: ['class'] });
  }
})();
