document.querySelectorAll('[data-work-stack]').forEach(stack => {
  const stage = stack.querySelector('.work-stack__stage');
  const cards = Array.from(stage.querySelectorAll('.work-stack__card'));
  const title = stack.querySelector('[data-stack-title]');
  const next = stack.querySelector('[data-stack-next]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let drag = null;
  let throwing = false;

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  function resetDrag(card) {
    card.classList.remove('is-grabbed');
    card.style.removeProperty('--drag-x');
    card.style.removeProperty('--drag-y');
    card.style.removeProperty('--drag-angle');
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

  async function advance(direction = 1, verticalOffset = 0) {
    if (throwing || drag) return;

    const front = cards.shift();
    cards.push(front);

    if (reducedMotion.matches || typeof front.animate !== 'function') {
      resetDrag(front);
      cards.forEach(showCard);
      return;
    }

    throwing = true;
    front.classList.add('is-throwing');
    front.setAttribute('aria-hidden', 'true');
    const flight = front.animate([
      { transform: getComputedStyle(front).transform, opacity: 1 },
      {
        transform: `translate(calc(-50% + ${direction * stage.clientWidth * 0.88}px), calc(-50% + ${verticalOffset}px)) rotate(${direction * 24}deg) scale(.96)`,
        opacity: 0,
      },
    ], { duration: 300, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' });

    cards.slice(0, -1).forEach(showCard);
    try {
      await flight.finished;
    } finally {
      resetDrag(front);
      showCard(front, cards.length - 1);
      flight.cancel();
      front.classList.remove('is-throwing');
      throwing = false;
    }
  }

  stage.addEventListener('pointerdown', event => {
    if (throwing || drag || !event.isPrimary || event.button !== 0) return;
    if (event.target.closest('.work-stack__card') !== cards[0]) return;

    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp };
    cards[0].classList.add('is-grabbed');
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;

    const x = event.clientX - drag.x;
    const y = event.clientY - drag.y;
    const card = cards[0];
    card.style.setProperty('--drag-x', `${clamp(x, -stage.clientWidth / 2, stage.clientWidth / 2)}px`);
    card.style.setProperty('--drag-y', `${clamp(y * 0.6, -60, 60)}px`);
    card.style.setProperty('--drag-angle', `${reducedMotion.matches ? 0 : clamp(x / 11, -20, 20)}deg`);
  });

  function endDrag(event) {
    if (drag?.id !== event.pointerId) return;

    const x = event.clientX - drag.x;
    const y = event.clientY - drag.y;
    const distance = Math.abs(x);
    const flick = distance > 28 && event.timeStamp - drag.time < 160;
    const draggedFar = distance > clamp(stage.clientWidth * 0.18, 48, 90);
    const tap = Math.hypot(x, y) < 8;
    drag = null;

    if (event.type === 'pointerup' && (tap || flick || draggedFar)) {
      advance(tap ? 1 : Math.sign(x), clamp(y * 0.6, -60, 60));
    } else {
      resetDrag(cards[0]);
    }
  }

  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);
  next.addEventListener('click', () => advance());
  next.hidden = false;
  stack.querySelector('[data-stack-hint]').hidden = false;
  stack.setAttribute('data-ready', '');
});
