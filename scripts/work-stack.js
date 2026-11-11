document.querySelectorAll('[data-work-stack]').forEach(stack => {
  const stage = stack.querySelector('.work-stack__stage');
  const cards = Array.from(stage.querySelectorAll('.work-stack__card'));
  const title = stack.querySelector('[data-stack-title]');
  const next = stack.querySelector('[data-stack-next]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let drag = null;

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  function resist(offset, limit, referenceLimit) {
    const softLimit = Math.min(referenceLimit, limit * 0.87);
    const distance = Math.abs(offset);
    return Math.sign(offset) * Math.min(
      limit,
      distance <= softLimit ? distance : softLimit + (distance - softLimit) * 0.18
    );
  }

  function resetDrag(card) {
    card.classList.remove('is-grabbed');
    card.style.removeProperty('--drag-x');
    card.style.removeProperty('--drag-y');
  }

  function showCard(card, position) {
    card.dataset.position = position;
    if (position === 0) {
      card.removeAttribute('aria-hidden');
      title.textContent = card.dataset.title;
    } else {
      card.setAttribute('aria-hidden', 'true');
    }
  }

  function advance() {
    if (drag) return;
    cards.push(cards.shift());
    cards.forEach(showCard);
  }

  stage.addEventListener('pointerdown', event => {
    if (drag || !event.isPrimary || event.button !== 0) return;
    const card = cards[0];
    if (event.target.closest('.work-stack__card') !== card) return;
    const maxX = Math.max(0, (stage.clientWidth - card.offsetWidth * 1.04) / 2 - 8);
    const maxY = Math.max(0, (stage.clientHeight - card.offsetHeight * 1.04) / 2 - 8);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, card, maxX, maxY };
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId || reducedMotion.matches) return;

    const x = event.clientX - drag.x;
    const y = event.clientY - drag.y;
    if (Math.hypot(x, y) < 4 && !drag.card.classList.contains('is-grabbed')) return;
    drag.card.classList.add('is-grabbed');
    drag.card.style.setProperty('--drag-x', `${resist(x, drag.maxX, 170)}px`);
    drag.card.style.setProperty('--drag-y', `${resist(y, drag.maxY, 150)}px`);
  });

  function endDrag(event) {
    if (drag?.id !== event.pointerId) return;

    const { card, x, y, maxX } = drag;
    const distance = Math.hypot(event.clientX - x, event.clientY - y);
    const threshold = clamp(maxX * 0.85, 30, 110);
    drag = null;

    if (card.classList.contains('is-grabbed')) {
      // Commit the held position so even a quick release springs from the pointer.
      getComputedStyle(card).transform;
    }
    resetDrag(card);
    if (event.type === 'pointerup' && (distance < 6 || distance >= threshold)) {
      advance();
    }
  }

  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);
  next.addEventListener('click', advance);
  next.hidden = false;
  stack.querySelector('[data-stack-hint]').hidden = false;
  stack.setAttribute('data-ready', '');
});
