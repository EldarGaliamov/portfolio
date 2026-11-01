(function () {
  const cards = Array.from(document.querySelectorAll(".home-competition-card"));
  const closeCard = (card) => {
    card.classList.remove("is-place-open");
    card.querySelector(".home-competition-card__place")?.setAttribute("aria-expanded", "false");
  };
  const toggleCard = (card) => {
    const shouldOpen = !card.classList.contains("is-place-open");
    cards.forEach(closeCard);
    if (shouldOpen) {
      card.classList.add("is-place-open");
      card.querySelector(".home-competition-card__place")?.setAttribute("aria-expanded", "true");
    }
  };
  cards.forEach((card) => {
    const place = card.querySelector(".home-competition-card__place");
    if (!place) return;
    place.addEventListener("click", (event) => {
      if (!event.target.closest("a")) toggleCard(card);
    });
    place.addEventListener("keydown", (event) => {
      if (event.target.closest("a")) return;
      if (event.key === "Escape") closeCard(card);
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleCard(card);
    });
  });
})();
