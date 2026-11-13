(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const portrait = document.querySelector('.home-portrait');

  let portraitStarted = false;

  async function startPortrait() {
    if (portraitStarted || motionPreference.matches) return;
    const photo = portrait.querySelector('img');

    try {
      await photo.decode();
    } catch {
      return;
    }

    if (portraitStarted || motionPreference.matches) return;
    portraitStarted = true;
    setupPortraitParticles(portrait, photo, motionPreference);
  }

  startPortrait();
  motionPreference.addEventListener('change', startPortrait);
})();

function setupPortraitParticles(portrait, photo, motionPreference) {
  const canvas = portrait.querySelector('canvas');
  const context = canvas.getContext('2d');
  const sampler = document.createElement('canvas');
  const source = sampler.getContext('2d');
  if (!context || !source) return;

  const grid = 72;
  sampler.width = sampler.height = grid;
  source.drawImage(photo, 0, 0, grid, grid);
  const pixels = source.getImageData(0, 0, grid, grid).data;
  const particles = [];

  for (let row = 0; row < grid; row++) {
    for (let column = 0; column < grid; column++) {
      const pixel = (row * grid + column) * 4;
      const alpha = pixels[pixel + 3] / 255;
      if (alpha < 0.15) continue;
      const grain = ((column * 83 + row * 173) % 101) / 100;
      particles.push({
        x: (column + 0.25 + grain * 0.5) / grid,
        y: (row + 0.75 - grain * 0.5) / grid,
        color: `rgb(${pixels[pixel]}, ${pixels[pixel + 1]}, ${pixels[pixel + 2]})`,
        alpha, grain, offsetX: 0, offsetY: 0, velocityX: 0, velocityY: 0
      });
    }
  }

  const moving = new Set();
  const marks = [];
  const markDuration = 560;
  let size = 0;
  let bleed = 0;
  let sample;
  let lastFrame = 0;
  let frame = 0;

  function clear() {
    cancelAnimationFrame(frame);
    frame = lastFrame = 0;
    for (const point of moving) {
      point.offsetX = point.offsetY = point.velocityX = point.velocityY = 0;
    }
    moving.clear();
    marks.length = 0;
    sample = undefined;
    portrait.removeAttribute('data-rendering');
  }

  function resize() {
    size = portrait.clientWidth;
    const width = canvas.clientWidth;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    bleed = (width - size) / 2;
    canvas.width = canvas.height = Math.round(width * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function paint(now) {
    const firstFrame = lastFrame === 0;
    const dt = firstFrame ? 1 / 60 : Math.min((now - lastFrame) / 1000, 0.025);
    lastFrame = now;
    while (marks.length && now - marks[0].time >= markDuration) marks.shift();

    const canvasSize = size + bleed * 2;
    context.clearRect(0, 0, canvasSize, canvasSize);
    context.drawImage(photo, bleed, bleed, size, size);
    context.globalCompositeOperation = 'destination-out';

    for (const mark of marks) {
      const age = Math.max(0, now - mark.time);
      const amount = Math.min(1, age / 32) * (1 - age / markDuration) ** 1.3;
      const x = mark.x * size + bleed;
      const y = mark.y * size + bleed;
      const fade = context.createRadialGradient(x, y, 0, x, y, mark.radius);
      fade.addColorStop(0, `rgb(0 0 0 / ${0.92 * amount})`);
      fade.addColorStop(0.48, `rgb(0 0 0 / ${0.62 * amount})`);
      fade.addColorStop(1, 'transparent');
      context.fillStyle = fade;
      context.fillRect(x - mark.radius, y - mark.radius, mark.radius * 2, mark.radius * 2);
    }

    context.globalCompositeOperation = 'source-over';
    for (const point of moving) {
      point.velocityX += (-155 * point.offsetX - 17 * point.velocityX) * dt;
      point.velocityY += (-155 * point.offsetY - 17 * point.velocityY) * dt;
      point.offsetX += point.velocityX * dt;
      point.offsetY += point.velocityY * dt;

      const displacement = Math.hypot(point.offsetX, point.offsetY);
      const speed = Math.hypot(point.velocityX, point.velocityY);
      if (displacement < 0.09 && speed < 1) {
        moving.delete(point);
        point.offsetX = point.offsetY = point.velocityX = point.velocityY = 0;
        continue;
      }

      const dotSize = 1.05 + point.grain * 1.05;
      context.globalAlpha = point.alpha * Math.min(0.95, displacement / 7 + speed / 165);
      context.fillStyle = point.color;
      context.fillRect(point.x * size + bleed + point.offsetX - dotSize / 2,
        point.y * size + bleed + point.offsetY - dotSize / 2, dotSize, dotSize);
    }
    context.globalAlpha = 1;

    if (marks.length || moving.size) {
      if (firstFrame) portrait.setAttribute('data-rendering', '');
      frame = requestAnimationFrame(paint);
    } else {
      clear();
    }
  }

  function push(x, y, dx, dy, speed, now) {
    const radius = Math.min(34, size * 0.17);
    const impulse = Math.min(195, 60 + speed * 0.12);
    let affected = false;

    for (const point of particles) {
      const distance = Math.hypot((point.x - x) * size, (point.y - y) * size);
      if (distance >= radius) continue;
      const force = impulse * (1 - (distance / radius) ** 2) ** 2;
      const scatter = (point.grain - 0.5) * 1.4;
      point.velocityX = Math.max(-275, Math.min(275, point.velocityX + (dx - dy * scatter) * force));
      point.velocityY = Math.max(-275, Math.min(275, point.velocityY + (dy + dx * scatter) * force));
      moving.add(point);
      affected = true;
    }

    if (!affected) return;
    marks.push({ x, y, radius, time: now });
    if (marks.length > 18) marks.shift();
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function disturb(event) {
    if (motionPreference.matches || !size) return;
    const rect = portrait.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const now = performance.now();

    if (event.pointerType === 'touch') {
      push(x, y, 0, -1, 400, now);
      return;
    }

    if (!sample || now - sample.time > 120) {
      sample = { x, y, time: now };
      return;
    }

    const elapsed = now - sample.time;
    const dx = (x - sample.x) * size;
    const dy = (y - sample.y) * size;
    const distance = Math.hypot(dx, dy);
    if (elapsed < 16 || distance < 2.5) return;

    const speed = distance / elapsed * 1000;
    const steps = Math.min(4, Math.ceil(distance / 18));
    for (let step = 1; step <= steps; step++) {
      const progress = step / steps;
      push(sample.x + (x - sample.x) * progress, sample.y + (y - sample.y) * progress,
        dx / distance, dy / distance, speed, now);
    }
    sample = { x, y, time: now };
  }

  portrait.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch') disturb(event);
  }, { passive: true });
  portrait.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') disturb(event);
  }, { passive: true });
  portrait.addEventListener('pointerleave', () => { sample = undefined; });
  portrait.addEventListener('pointercancel', () => { sample = undefined; });
  motionPreference.addEventListener('change', clear);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clear();
  });
  resize();
  new ResizeObserver(resize).observe(portrait);
}
