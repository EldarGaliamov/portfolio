(function () {
  "use strict";

  // Enhance below-the-fold content only. Without JS, content stays visible.
  function reveal(scope, selectors) {
    if (!scope || !("IntersectionObserver" in window)) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lowEndDevice =
      (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2) ||
      (navigator.deviceMemory === undefined && navigator.hardwareConcurrency <= 4);
    if (preference.matches || lowEndDevice) return;

    const candidates = Array.from(scope.querySelectorAll(selectors));
    const candidateSet = new Set(candidates);
    const items = candidates.filter((item) => {
      for (let parent = item.parentElement; parent && parent !== scope; parent = parent.parentElement) {
        if (candidateSet.has(parent)) return false;
      }
      return item.getBoundingClientRect().top >= window.innerHeight;
    });
    if (!items.length) return;

    const pending = new Set(items);
    const cleanup = () => {
      if (pending.size) return;
      observer.disconnect();
      scope.removeEventListener("focusin", onFocus);
      preference.removeEventListener("change", onPreferenceChange);
    };
    const show = (item, delay = 0) => {
      if (!pending.delete(item)) return;
      item.style.setProperty("--reveal-delay", `${delay}ms`);
      item.classList.add("is-visible");
      observer.unobserve(item);
    };
    const onFocus = (event) => {
      pending.forEach((item) => {
        if (item.contains(event.target)) show(item);
      });
      cleanup();
    };
    const onPreferenceChange = () => {
      if (!preference.matches) return;
      pending.forEach((item) => show(item));
      cleanup();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        // Only siblings entering together share a stagger; document position is irrelevant.
        const groups = new Map();
        entries.filter((entry) => entry.isIntersecting).sort((a, b) =>
          a.boundingClientRect.top - b.boundingClientRect.top ||
          a.boundingClientRect.left - b.boundingClientRect.left,
        ).forEach((entry) => {
          const parent = entry.target.parentElement;
          const index = groups.get(parent) || 0;
          show(entry.target, Math.min(index, 2) * 45);
          groups.set(parent, index + 1);
        });
        cleanup();
      },
      { rootMargin: "0px 0px -24px 0px", threshold: 0 },
    );

    scope.addEventListener("focusin", onFocus);
    preference.addEventListener("change", onPreferenceChange);
    items.forEach((item) => {
      item.classList.add("motion-reveal");
      observer.observe(item);
    });
  }

  window.PortfolioMotion = { reveal };
})();
