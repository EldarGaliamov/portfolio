(() => {
  if (typeof window.Lenis !== 'function') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lenis;

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
  }

  syncScrollPreference();
  reducedMotion.addEventListener('change', syncScrollPreference);
})();
