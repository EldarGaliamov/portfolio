(function () {
  const mobilePlaceQuery = window.matchMedia("(max-width: 760px)");
  const cards = Array.from(document.querySelectorAll(".home-competition-card"));

  if (!cards.length) return;

  const closeCard = (card) => {
    card.classList.remove("is-place-open");
    const place = card.querySelector(".home-competition-card__place");
    if (place) place.setAttribute("aria-expanded", "false");
  };

  const toggleCard = (card) => {
    const isOpen = card.classList.toggle("is-place-open");
    const place = card.querySelector(".home-competition-card__place");
    if (place) place.setAttribute("aria-expanded", String(isOpen));
  };

  cards.forEach((card) => {
    const place = card.querySelector(".home-competition-card__place");
    if (!place) return;

    place.addEventListener("click", (event) => {
      if (!mobilePlaceQuery.matches) return;
      if (event.target.closest("a")) return;

      toggleCard(card);
    });

    place.addEventListener("keydown", (event) => {
      if (!mobilePlaceQuery.matches) return;
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      toggleCard(card);
    });
  });

  const syncCards = () => {
    if (mobilePlaceQuery.matches) return;
    cards.forEach(closeCard);
  };

  if (typeof mobilePlaceQuery.addEventListener === "function") {
    mobilePlaceQuery.addEventListener("change", syncCards);
  } else if (typeof mobilePlaceQuery.addListener === "function") {
    mobilePlaceQuery.addListener(syncCards);
  }
})();
