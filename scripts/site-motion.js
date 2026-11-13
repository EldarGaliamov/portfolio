const page = document.querySelector('[data-scroll-surface]');
if (page && 'IntersectionObserver' in window) setupScrollEffects(page);

function setupScrollEffects(page) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopInput = window.matchMedia('(hover: hover) and (pointer: fine)');
  const paintInterval = 1000 / 30;
  const isHome = page.matches('.portfolio-home');
  const textSelector = 'h1, h2, h3, .home-case-card__title, .home-competition-card__title, .home-footer__contact > p, .home-footer__copyright > p';
  const selector = isHome
    ? '.home-hero, .home-collaboration, .home-competitions > h2, .home-case-card, .home-competition-card, .home-footer'
    : 'h1, h2, h3, .site-footer__copyright > p, .footer-contact__main > p';
  const surfaces = new Map();
  const visible = new Set();
  const homeLens = isHome ? createHomeLens(page) : null;
  let svgLens;
  let frame = 0;
  let bend = 0;
  let lens = 0;
  let lastScroll = window.scrollY;
  let lastFrame = 0;
  let lastPaint = -Infinity;

  for (const element of page.querySelectorAll(selector)) {
    surfaces.set(element, {
      titles: element.matches(textSelector) ? [element] : element.querySelectorAll(textSelector),
      image: element.querySelector('.home-case-card__object'),
      painted: 0,
    });
  }

  function clearSurface(surface) {
    if (surface.painted === 0) return;
    for (const title of surface.titles) title.style.removeProperty('text-shadow');
    surface.image?.style.removeProperty('filter');
    surface.painted = 0;
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const surface = surfaces.get(entry.target);
      if (entry.isIntersecting) {
        visible.add(surface);
      } else {
        visible.delete(surface);
        clearSurface(surface);
      }
    }
  }, { rootMargin: '80px 0px' });

  for (const element of surfaces.keys()) observer.observe(element);

  function paint(amount) {
    const value = Math.round(amount * 20) / 20;
    const opacity = Math.abs(value) * 0.65;
    const red = `0 ${(value * 4.8).toFixed(2)}px rgb(224 38 77 / ${opacity})`;
    const blue = `0 ${(value * -4.2).toFixed(2)}px rgb(0 136 233 / ${opacity})`;

    for (const surface of visible) {
      if (surface.painted === value) continue;
      if (value === 0) {
        clearSurface(surface);
        continue;
      }

      for (const title of surface.titles) title.style.textShadow = `${red}, ${blue}`;
      if (surface.image && desktopInput.matches) {
        // The image's own alpha keeps the fringe within its visible shape.
        surface.image.style.filter = `drop-shadow(${red}) drop-shadow(${blue})`;
      }
      surface.painted = value;
    }
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = lastFrame = bend = lens = 0;
    lastPaint = -Infinity;
    lastScroll = window.scrollY;
    svgLens?.clear();
    homeLens?.clear();
    for (const surface of visible) clearSurface(surface);
  }

  function update(now) {
    const scroll = window.scrollY;
    const elapsed = lastFrame ? Math.min(now - lastFrame, 64) : 16.7;
    const speed = (scroll - lastScroll) / elapsed;
    lastScroll = scroll;
    lastFrame = now;

    const target = Math.max(-1, Math.min(1, speed / 1.65));
    const smoothing = 1 - Math.exp(-elapsed / (target === 0 ? 95 : 45));
    bend += (target - bend) * smoothing;

    if (desktopInput.matches) lens += (Math.abs(target) - lens) * smoothing;

    if (target === 0 && Math.abs(bend) < 0.025 && lens < 0.02) {
      reset();
      return;
    }

    // Shadows repaint their content. Sample them separately from the scroll animation.
    const paintFringe = now - lastPaint >= paintInterval - 1;
    if (paintFringe) {
      paint(bend);
      lastPaint = now;
    }

    if (desktopInput.matches) {
      if (homeLens) {
        homeLens.paint(bend, lens, scroll);
      } else if (paintFringe) {
        svgLens ??= createScrollLens(page);
        svgLens?.paint(lens, scroll);
      }
    }
    frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', () => {
    if (motionPreference.matches || document.hidden || frame) return;
    frame = requestAnimationFrame(update);
  }, { passive: true });

  motionPreference.addEventListener('change', reset);
  desktopInput.addEventListener('change', reset);
  window.addEventListener('pagehide', reset);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset();
  });
}

function createHomeLens(page) {
  let top;
  let lastTransform = '';
  window.addEventListener('resize', () => { top = undefined; }, { passive: true });

  return {
    clear() {
      if (lastTransform) page.style.removeProperty('transform');
      lastTransform = '';
      top = undefined;
    },
    paint(direction, strength, scroll) {
      top ??= page.getBoundingClientRect().top + scroll;
      const skew = Math.round(direction * 210) / 10000;
      const squeeze = 1 - Math.round(strength * 145) / 10000;
      // Center the shear in the viewport without changing the page's scroll height.
      const shift = Math.round(-skew * (scroll - top + innerHeight / 2) * 100) / 100;
      const transform = `matrix(${squeeze}, 0, ${skew}, 1, ${shift}, 0) translateZ(0)`;
      if (transform === lastTransform) return;
      page.style.transform = lastTransform = transform;
    },
  };
}

function createScrollLens(page) {
  const map = document.createElement('canvas');
  map.width = map.height = 96;
  const context = map.getContext('2d');
  if (!context) return;

  const pixels = context.createImageData(map.width, map.height);
  const curvature = 0.92;
  const maxArc = 1 - Math.sqrt(1 - curvature ** 2);
  const arc = position => (1 - Math.sqrt(1 - (curvature * position) ** 2)) / maxArc;
  for (let row = 0; row < map.height; row++) {
    const y = 2 * row / (map.height - 1) - 1;
    const screenArc = arc(Math.abs(y) * 0.98);
    for (let column = 0; column < map.width; column++) {
      const x = 2 * column / (map.width - 1) - 1;
      const pixel = (row * map.width + column) * 4;
      // Sample outward near corners to draw them inward and leave the middle of each edge bowed out.
      pixels.data[pixel] = 255 * (0.5 + 0.46 * x ** 3 * (0.12 + 0.88 * screenArc));
      pixels.data[pixel + 1] = 255 * (0.5 + 0.16 * y ** 3 * arc(x));
      pixels.data[pixel + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);

  function svgElement(name, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
    return element;
  }

  const svg = svgElement('svg', { width: 0, height: 0, 'aria-hidden': 'true' });
  svg.style.position = 'absolute';
  const filter = svgElement('filter', {
    id: 'site-scroll-lens', x: 0, y: 0,
    filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB'
  });
  const field = svgElement('feImage', {
    href: map.toDataURL(), preserveAspectRatio: 'none', result: 'lens'
  });
  const displacement = svgElement('feDisplacementMap', {
    in: 'SourceGraphic', in2: 'lens', scale: 0, xChannelSelector: 'R', yChannelSelector: 'G'
  });
  filter.append(field, displacement);
  svg.append(filter);
  document.body.append(svg);

  let padding;
  let pageTop;
  let maxScale;
  let regionTop;
  let currentScale = 0;

  function resize() {
    const width = page.clientWidth;
    const height = window.innerHeight;
    padding = 32;
    pageTop = page.getBoundingClientRect().top + window.scrollY;
    maxScale = Math.min(115, width * 0.21);
    filter.setAttribute('width', width);
    filter.setAttribute('height', height + 2 * padding);
  }

  function clear() {
    if (!currentScale) return;
    currentScale = 0;
    page.style.removeProperty('filter');
    displacement.setAttribute('scale', 0);
  }

  function paint(amount, scroll) {
    const scale = Math.round(amount * maxScale / 2) * 2;
    if (!scale) {
      clear();
      return;
    }

    // Keep the filter's raster region around the viewport as the document scrolls.
    const top = Math.round((scroll - pageTop) / 16) * 16 - padding;
    if (regionTop !== top) {
      regionTop = top;
      filter.setAttribute('y', top);
    }
    if (!currentScale) page.style.filter = 'url("#site-scroll-lens")';
    if (scale !== currentScale) {
      currentScale = scale;
      displacement.setAttribute('scale', scale);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { paint, clear };
}
