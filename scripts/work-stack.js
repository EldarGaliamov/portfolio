document.querySelectorAll('[data-work-stack]').forEach(stack => {
  const stage = stack.querySelector('.work-stack__stage');
  const title = stack.querySelector('[data-stack-title]');
  const next = stack.querySelector('[data-stack-next]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = Array.from(stage.querySelectorAll('.work-stack__card'), (element, depth) => ({
    element, x: 0, y: depth * 12, frames: {},
  }));
  let drag = null;

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  function bounds(card) {
    const room = (available, size) => Math.max(0, (available - size * 1.04) / 2 - 8);
    const x = room(stage.clientWidth, card.element.offsetWidth);
    const y = room(stage.clientHeight, card.element.offsetHeight);
    return { x, y, leftRight: Math.min(170, x * 0.92), upDown: Math.min(150, y * 0.92) };
  }

  function resist(value, limit, room) {
    const distance = Math.abs(value);
    return Math.sign(value) * Math.min(room, distance <= limit ? distance : limit + (distance - limit) * 0.18);
  }

  function place(card, axis, value) {
    card[axis] = value;
    card.element.style.setProperty('--card-' + axis, value + 'px');
  }

  function stop(card, axis) {
    cancelAnimationFrame(card.frames[axis]);
    delete card.frames[axis];
  }

  function animate(card, axis, target, duration, sample) {
    stop(card, axis);
    const from = card[axis];
    if (reducedMotion.matches || Math.abs(from - target) < 0.2) {
      place(card, axis, target);
      return;
    }
    const start = performance.now();
    function frame(now) {
      const elapsed = now - start;
      if (elapsed >= duration || reducedMotion.matches) {
        delete card.frames[axis];
        place(card, axis, target);
      } else {
        place(card, axis, sample(elapsed));
        card.frames[axis] = requestAnimationFrame(frame);
      }
    }
    card.frames[axis] = requestAnimationFrame(frame);
  }

  function springTo(card, axis, target) {
    const from = card[axis];
    const frequency = Math.sqrt(280 - 12 ** 2);
    animate(card, axis, target, 490, elapsed => {
      const t = elapsed / 1000;
      const decay = Math.exp(-12 * t) * (Math.cos(frequency * t) + 12 / frequency * Math.sin(frequency * t));
      return target + (from - target) * decay;
    });
  }

  function coast(card, axis, velocity, limit) {
    const from = card[axis];
    const amplitude = 0.8 * velocity;
    const target = clamp(from + amplitude, -limit, limit);
    if (Math.abs(from) > limit) {
      springTo(card, axis, clamp(from, -limit, limit));
      return;
    }
    if (Math.abs(amplitude) < 1) return;

    const fraction = (target - from) / amplitude;
    const duration = fraction < 1
      ? -750 * Math.log(1 - fraction)
      : Math.min(2600, 750 * Math.log(Math.abs(amplitude)));
    animate(card, axis, target, duration, elapsed => from + amplitude * (1 - Math.exp(-elapsed / 750)));
  }

  function advance() {
    if (drag) return;
    cards.push(cards.shift());
    cards.forEach((card, depth) => {
      const { element } = card;
      element.dataset.position = depth;
      springTo(card, 'y', depth * 12);
      if (depth === 0) {
        element.removeAttribute('aria-hidden');
        title.textContent = element.dataset.title;
      } else {
        element.setAttribute('aria-hidden', 'true');
      }
    });
  }

  stage.addEventListener('pointerdown', event => {
    if (drag || reducedMotion.matches || !event.isPrimary || event.button !== 0) return;
    const card = cards[0];
    if (event.target.closest('.work-stack__card') !== card.element) return;
    stop(card, 'x');
    stop(card, 'y');
    drag = {
      id: event.pointerId, card, startX: event.clientX, startY: event.clientY,
      originX: card.x, originY: card.y, limits: bounds(card), samples: [], moved: false,
    };
    stage.setPointerCapture(event.pointerId);
  });

  function sample(event) {
    const points = drag.samples;
    points.push({ x: event.clientX, y: event.clientY, time: event.timeStamp });
    while (points.length > 1 && event.timeStamp - points[0].time > 100) points.shift();
  }

  function move(event) {
    const { card, limits, originX, originY, startX, startY } = drag;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!drag.moved && Math.hypot(dx, dy) < 3) return;
    if (!drag.moved) {
      drag.moved = true;
      card.element.classList.add('is-grabbed');
    }
    place(card, 'x', resist(originX + dx, limits.leftRight, limits.x));
    place(card, 'y', resist(originY + dy, limits.upDown, limits.y));
  }

  stage.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId || reducedMotion.matches) return;
    sample(event);
    move(event);
  });

  function endDrag(event) {
    if (drag?.id !== event.pointerId) return;

    const released = event.type === 'pointerup' && !reducedMotion.matches;
    if (released) {
      sample(event);
      move(event);
    }
    const { card, startX, startY, originX, originY, limits, samples, moved } = drag;
    drag = null;
    card.element.classList.remove('is-grabbed');
    if (!moved) return;
    if (!released) {
      springTo(card, 'x', originX);
      springTo(card, 'y', originY);
      return;
    }

    const first = samples[0];
    const seconds = (event.timeStamp - first.time) / 1000;
    const vx = seconds >= 0.012 ? (event.clientX - first.x) / seconds : 0;
    const vy = seconds >= 0.012 ? (event.clientY - first.y) / seconds : 0;
    const threshold = clamp(Math.min(limits.leftRight, limits.upDown) * 0.85, 26, 90);
    const reorder = Math.hypot(event.clientX - startX, event.clientY - startY) >= threshold;

    // The reference keeps horizontal momentum through a reorder. Its vertical
    // position springs to the new depth only when the order actually changes.
    coast(card, 'x', vx, limits.leftRight);
    if (reorder) advance();
    else coast(card, 'y', vy, limits.upDown);
  }

  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);
  next.addEventListener('click', advance);
  next.hidden = false;
  stack.querySelector('[data-stack-hint]').hidden = false;
  stack.setAttribute('data-ready', '');

  new ResizeObserver(() => {
    if (drag) return;
    for (const card of cards) {
      const limits = bounds(card);
      for (const [axis, limit] of [['x', limits.leftRight], ['y', Math.max(24, limits.upDown)]]) {
        if (Math.abs(card[axis]) <= limit) continue;
        stop(card, axis);
        place(card, axis, clamp(card[axis], -limit, limit));
      }
    }
  }).observe(stage);
});
