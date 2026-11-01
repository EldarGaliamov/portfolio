(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cards = [...document.querySelectorAll(".home-case-card")];
  if (!reduce.matches && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -24px 0px" });
    cards.forEach(card => { card.classList.add("emil-reveal"); observer.observe(card); });
    reduce.addEventListener("change", () => {
      if (!reduce.matches) return;
      cards.forEach(card => card.classList.add("is-visible"));
      observer.disconnect();
    });
  }
})();
