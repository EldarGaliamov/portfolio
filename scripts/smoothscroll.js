(function () {
  "use strict";

  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let lenis = null;

  const destroy = () => {
    lenis?.destroy();
    lenis = null;
  };
  const syncLock = () => {
    if (!lenis) return;
    if (document.body.classList.contains("is-lightbox-open")) lenis.stop();
    else lenis.start();
  };
  const sync = () => {
    // Preserve native touch/keyboard behavior and the OS motion preference.
    if (preference.matches || !pointer.matches || typeof window.Lenis !== "function") {
      destroy();
      return;
    }
    if (lenis) return;

    lenis = new window.Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      lerp: 0.075,
      anchors: true,
      stopInertiaOnNavigate: true,
      prevent: (node) => node.matches?.(
        ".image-lightbox, .image-lightbox__viewport, .scenario-table, .office-stage-row",
      ),
    });
    syncLock();
  };

  // Do not carry wheel momentum into keyboard navigation or focus changes.
  document.addEventListener("keydown", (event) => {
    if (!lenis || !["Tab", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) return;
    lenis.scrollTo(window.scrollY, { immediate: true });
  });

  const lockObserver = new MutationObserver(syncLock);
  lockObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  preference.addEventListener("change", sync);
  pointer.addEventListener("change", sync);
  window.addEventListener("pagehide", destroy);
  window.addEventListener("pageshow", sync);
  sync();
})();
