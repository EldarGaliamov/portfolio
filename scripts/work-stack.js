document.querySelectorAll('[data-work-stack]').forEach(stack => {
  const stage = stack.querySelector('.work-stack__stage');
  const cards = Array.from(stage.querySelectorAll('.work-stack__card'));
  const title = stack.querySelector('[data-stack-title]');
  const next = stack.querySelector('[data-stack-next]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const slideFraction = 0.13;
  let drag = null;
  let reordering = false;

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  function resetDrag(card) {
    card.classList.remove('is-grabbed');
    card.style.removeProperty('--drag-x');
    card.style.removeProperty('--drag-y');
    card.style.removeProperty('--drag-angle');
    card.style.removeProperty('--drag-scale');
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
    if (reordering || drag) return;

    const front = cards.shift();
    cards.push(front);

    if (reducedMotion.matches || typeof front.animate !== 'function') {
      resetDrag(front);
      cards.forEach(showCard);
      return;
    }

    reordering = true;
    front.classList.add('is-reordering');
    const slideX = direction * stage.clientWidth * slideFraction;
    const slideY = stage.clientWidth * 0.045 + verticalOffset * 0.25;
    const sidePosition = `translate(calc(-50% + ${slideX}px), calc(-50% + ${slideY}px)) rotate(${direction * 7}deg) scale(.92)`;
    const easing = 'cubic-bezier(.22, 1, .36, 1)';
    let movement;

    try {
      movement = front.animate([
        { transform: getComputedStyle(front).transform },
        { transform: sidePosition },
      ], { duration: 155, easing, fill: 'forwards' });
      await movement.finished;

      // Swap layers at the outer edge so the card slides behind the new top.
      resetDrag(front);
      cards.forEach(showCard);
      movement.cancel();
      movement = front.animate([
        { transform: sidePosition },
        { transform: getComputedStyle(front).transform },
      ], { duration: 285, easing });
      await movement.finished;
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      movement?.cancel();
      resetDrag(front);
      if (front.dataset.position !== String(cards.length - 1)) cards.forEach(showCard);
      front.classList.remove('is-reordering');
      reordering = false;
    }
  }

  stage.addEventListener('pointerdown', event => {
    if (reordering || drag || !event.isPrimary || event.button !== 0) return;
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
    const slideLimit = Math.max(1, stage.clientWidth * slideFraction);
    const offset = clamp(x, -slideLimit, slideLimit);
    const turn = offset / slideLimit;
    const lift = reducedMotion.matches ? 0 : Math.abs(turn) * 0.08;
    const verticalLimit = stage.clientHeight * 0.10;
    card.style.setProperty('--drag-x', `${offset}px`);
    card.style.setProperty('--drag-y', `${clamp(y * 0.6, -verticalLimit, verticalLimit)}px`);
    card.style.setProperty('--drag-angle', `${reducedMotion.matches ? 0 : turn * 7}deg`);
    card.style.setProperty('--drag-scale', 1 - lift);
  });

  function endDrag(event) {
    if (drag?.id !== event.pointerId) return;

    const x = event.clientX - drag.x;
    const y = event.clientY - drag.y;
    const distance = Math.abs(x);
    const flick = distance > 28 && event.timeStamp - drag.time < 160;
    const draggedFar = distance > clamp(stage.clientWidth * 0.115, 32, 74);
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
