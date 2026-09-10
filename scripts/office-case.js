(function () {
  const root = document.querySelector(".case-page--office");
  if (!root) return;

  enhanceOfficeResults(root);
  initOfficeMotion(root);
  initOfficeLightbox(root);

  function enhanceOfficeResults(scope) {
    const resultsSection = scope.querySelector(".office-results");
    const summaryGrid = resultsSection?.querySelector(".reflection-grid");
    if (!resultsSection || !summaryGrid || resultsSection.querySelector(".office-results__details")) return;

    const resultText = resultsSection.querySelector(".office-result-card p");
    if (resultText) {
      resultText.textContent =
        "Пользователь больше не проходит длинный справочник вручную: нужные офисы можно найти напрямую, выбрать по одному или массово и проверить итог перед сохранением.";
    }

    const details = document.createElement("div");
    details.className = "two-columns office-context-grid office-results__details";
    details.innerHTML = `
      <article class="info-card">
        <h3>Для пользователя</h3>
        <p>Сценарий стал соответствовать реальной задаче: вместо последовательного прохождения справочника пользователь сразу ищет нужный город или отделение, может массово выбрать офисы и контролирует итоговый набор перед сохранением.</p>
      </article>
      <article class="info-card">
        <h3>Для продукта</h3>
        <p>Новую сущность — сегменты — удалось встроить в существующий сценарий закрепления без отдельной ветки процесса. Пользователь настраивает сегменты в контексте конкретного офиса и не теряет связь между отделением и зоной ответственности менеджера.</p>
      </article>
      <article class="info-card">
        <h3>Для команды</h3>
        <p>Вместо набора разрозненных экранов получился единый конфигуратор с описанными состояниями поиска, массового выбора, сегментов, проверки и сохранения. Это делает логику сценария прозрачнее для дальнейшей реализации и развития.</p>
      </article>
      <article class="info-card">
        <h3>Как оценивать эффект</h3>
        <p>Количественных продуктовых метрик по задаче пока нет. После запуска я бы оценивал время выполнения сценария, количество действий до сохранения, число исправлений выбранных офисов и долю пользователей, которые используют массовый выбор.</p>
      </article>
    `;

    summaryGrid.insertAdjacentElement("afterend", details);
  }

  function initOfficeMotion(scope) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowEndDevice =
      typeof navigator !== "undefined" &&
      ((navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2) ||
        (navigator.deviceMemory === undefined && navigator.hardwareConcurrency <= 4));
    const shouldAnimate = !reduceMotion && !lowEndDevice;

    const revealSelectors = [
      ".project-hero__copy",
      ".hero-visual",
      ".section-block",
      ".solution-block",
      ".info-card",
      ".gradient-card",
      ".office-small-card",
      ".office-callout-card",
      ".office-problem-visuals",
      ".office-image-panel",
      ".office-copy-card",
      ".office-embed-panel",
      ".stage-row span",
      ".chip",
      ".tool-chip",
    ];
    const revealItems = [...new Set(revealSelectors.flatMap((selector) => [...scope.querySelectorAll(selector)]))];

    revealItems.forEach((item, index) => {
      item.classList.add("motion-reveal");
      item.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 45, 225)}ms`);
      if (
        item.matches(
          ".hero-visual, .office-problem-visuals, .office-image-panel, .office-embed-panel",
        )
      ) {
        item.classList.add("motion-reveal--image");
      }
      if (item.matches(".chip, .tool-chip, .stage-row span")) {
        item.classList.add("motion-reveal--pop");
      }
    });

    if (!shouldAnimate || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function initOfficeLightbox(scope) {
    const images = [...scope.querySelectorAll('img[alt]:not([alt=""])')].filter(
      (image) =>
        !image.classList.contains("home-header__avatar-img") &&
        !image.classList.contains("tool-chip__image") &&
        !image.closest(".office-hero-visual"),
    );

    if (!images.length) return;

    const modal = document.createElement("div");
    modal.className = "image-lightbox";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Просмотр изображения");
    modal.innerHTML = `
      <button class="image-lightbox__close" type="button" aria-label="Закрыть">×</button>
      <button class="image-lightbox__nav image-lightbox__nav--prev" type="button" aria-label="Предыдущее изображение">‹</button>
      <figure class="image-lightbox__figure">
        <div class="image-lightbox__viewport">
          <img class="image-lightbox__image" alt="" />
        </div>
        <figcaption class="image-lightbox__caption"></figcaption>
      </figure>
      <button class="image-lightbox__zoom" type="button" aria-label="Увеличить изображение">+</button>
      <button class="image-lightbox__nav image-lightbox__nav--next" type="button" aria-label="Следующее изображение">›</button>
    `;
    document.body.appendChild(modal);

    const modalImage = modal.querySelector(".image-lightbox__image");
    const caption = modal.querySelector(".image-lightbox__caption");
    const closeButton = modal.querySelector(".image-lightbox__close");
    const prevButton = modal.querySelector(".image-lightbox__nav--prev");
    const nextButton = modal.querySelector(".image-lightbox__nav--next");
    const zoomButton = modal.querySelector(".image-lightbox__zoom");
    let activeIndex = 0;
    let previousFocus = null;

    const setZoom = (isZoomed) => {
      modal.classList.toggle("is-zoomed", isZoomed);
      zoomButton.textContent = isZoomed ? "−" : "+";
      zoomButton.setAttribute("aria-label", isZoomed ? "Вписать изображение" : "Увеличить изображение");
    };

    const showImage = (index) => {
      activeIndex = (index + images.length) % images.length;
      const image = images[activeIndex];
      modalImage.src = image.currentSrc || image.src;
      modalImage.alt = image.alt;
      caption.textContent = image.alt;
      setZoom(false);
    };

    const openModal = (index, trigger) => {
      previousFocus = trigger;
      showImage(index);
      modal.hidden = false;
      document.body.classList.add("is-lightbox-open");
      closeButton.focus();
    };

    const closeModal = () => {
      modal.hidden = true;
      document.body.classList.remove("is-lightbox-open");
      setZoom(false);
      if (previousFocus) previousFocus.focus();
    };

    images.forEach((image, index) => {
      image.classList.add("zoomable-image");
      image.setAttribute("role", "button");
      image.setAttribute("tabindex", "0");
      image.setAttribute("aria-label", `${image.alt}. Открыть крупнее`);
      image.addEventListener("click", () => openModal(index, image));
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openModal(index, image);
        }
      });
    });

    closeButton.addEventListener("click", closeModal);
    prevButton.addEventListener("click", () => showImage(activeIndex - 1));
    nextButton.addEventListener("click", () => showImage(activeIndex + 1));
    zoomButton.addEventListener("click", () => setZoom(!modal.classList.contains("is-zoomed")));
    modalImage.addEventListener("click", () => setZoom(!modal.classList.contains("is-zoomed")));
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (modal.hidden) return;
      if (event.key === "Escape") closeModal();
      if (event.key === "ArrowLeft") showImage(activeIndex - 1);
      if (event.key === "ArrowRight") showImage(activeIndex + 1);
    });
  }
})();