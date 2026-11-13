import { waapi } from './vendor/anime-waapi.min.js';

const page = document.querySelector('[data-scroll-surface]');
if (page) setupScrollBend(page, window.matchMedia('(prefers-reduced-motion: reduce)'));

function setupScrollBend(page, motionPreference) {
  const surfaces = new Map();
  const visible = new Set();
  let screenLens;
  const fringeOpacity = 0.65;
  const supportsWAAPI = typeof page.animate === 'function';
  const ease = getComputedStyle(page).getPropertyValue('--motion-smooth').trim();
  let frame = 0;
  let lensFrame = 0;
  let bend = 0;
  let lens = 0;
  let release;
  let lastScroll = window.scrollY;
  let lastFrame = 0;
  let lastMotion = 0;

  const elements = page.querySelectorAll(page.matches('.portfolio-home')
    ? '.home-hero, .home-collaboration, .home-projects > h2, .home-competitions > h2, .home-case-card, .home-competition-card, .home-footer'
    : 'h1, h2, h3, .site-footer__copyright > p, .footer-contact__main > p');

  for (const element of elements) {
    surfaces.set(element, { element, layers: null, painted: null });
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const surface = surfaces.get(entry.target);
      if (entry.isIntersecting) {
        visible.add(surface);
        if (!motionPreference.matches) {
          surface.layers ??= createScrollFringes(surface.element);
        }
      } else {
        visible.delete(surface);
        clearSurface(surface);
      }
    }
  }, { rootMargin: '80px 0px' });

  for (const element of elements) observer.observe(element);

  function fringeTransform(amount, color) {
    const distance = color === 'red' ? 4.8 : -4.2;
    return `translate3d(0, ${amount * distance}px, 0)`;
  }

  function clearSurface(surface) {
    if (!surface.layers) return;
    for (const layer of [...surface.layers.red, ...surface.layers.blue]) {
      layer.style.removeProperty('transform');
      layer.style.removeProperty('opacity');
    }
    surface.painted = null;
  }

  function paint(amount) {
    const value = Math.round(amount * 500) / 500;
    const opacity = Math.abs(value) * fringeOpacity;
    const redOffset = fringeTransform(value, 'red');
    const blueOffset = fringeTransform(value, 'blue');

    for (const surface of visible) {
      if (surface.painted === value) continue;
      surface.layers ??= createScrollFringes(surface.element);
      for (const layer of surface.layers.red) {
        layer.style.transform = redOffset;
        layer.style.opacity = opacity;
      }
      for (const layer of surface.layers.blue) {
        layer.style.transform = blueOffset;
        layer.style.opacity = opacity;
      }
      surface.painted = value;
    }
  }

  function cancelRelease() {
    cancelAnimationFrame(lensFrame);
    lensFrame = 0;
    if (!release) return;
    const { animations } = release;
    release = undefined;
    for (const animation of animations) animation.cancel();
  }

  function reset() {
    cancelAnimationFrame(frame);
    cancelRelease();
    frame = lastFrame = lastMotion = bend = lens = 0;
    lastScroll = window.scrollY;
    screenLens?.clear();
    for (const surface of surfaces.values()) clearSurface(surface);
  }

  function settle() {
    paint(bend);
    const onscreen = Array.from(visible);
    const red = onscreen.flatMap(surface => surface.layers.red);
    const blue = onscreen.flatMap(surface => surface.layers.blue);
    const from = onscreen[0]?.painted ?? 0;
    const options = { duration: 340, ease };
    const settling = { animations: [], from };
    release = settling;
    frame = lastFrame = 0;

    if (lens > 0.02 || !red.length) {
      const fromLens = lens;
      const start = performance.now();
      const fadeLens = now => {
        const remaining = Math.max(0, 1 - (now - start) / options.duration);
        lens = fromLens * remaining ** 3;
        screenLens?.paint(lens, window.scrollY);
        if (lens > 0.02) lensFrame = requestAnimationFrame(fadeLens);
        else if (release === settling && !settling.animations.length) reset();
      };
      lensFrame = requestAnimationFrame(fadeLens);
    }

    for (const [color, layers] of [['red', red], ['blue', blue]]) {
      if (!layers.length) continue;
      settling.animations.push(waapi.animate(layers, {
        ...options,
        transform: [fringeTransform(from, color), fringeTransform(0, color)],
        opacity: [Math.abs(from) * fringeOpacity, 0],
        onComplete: () => {
          if (color === 'red' && release === settling) reset();
        }
      }));
    }
  }

  function update(now) {
    const scroll = window.scrollY;
    const elapsed = lastFrame ? Math.min(now - lastFrame, 64) : 16.7;
    const speed = (scroll - lastScroll) / elapsed;
    lastScroll = scroll;
    lastFrame = now;

    const target = Math.max(-1, Math.min(1, speed / 1.65));
    if (target !== 0) lastMotion = now;
    if (target === 0 && now - lastMotion >= 76) {
      if (Math.abs(bend) < 0.005 && lens < 0.02) {
        reset();
        return;
      }
      if (supportsWAAPI) {
        settle();
        return;
      }
    }

    const smoothing = 1 - Math.exp(-elapsed / (target === 0 ? 95 : 45));
    bend += (target - bend) * smoothing;
    lens += (Math.abs(target) - lens) * smoothing;
    paint(bend);
    screenLens?.paint(lens, scroll);
    frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', () => {
    if (motionPreference.matches || frame) return;

    screenLens ??= createScrollLens(page);

    if (release) {
      const progress = release.animations[0]?.animations[0]?.effect?.getComputedTiming().progress ?? 0;
      bend = release.from * (1 - progress);
      cancelRelease();
      for (const surface of visible) surface.painted = NaN;
    }

    frame = requestAnimationFrame(update);
  }, { passive: true });

  motionPreference.addEventListener('change', reset);
  window.addEventListener('pagehide', reset);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset();
  });
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
    const top = Math.round((scroll - pageTop) / 4) * 4 - padding;
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

function createScrollFringes(surface) {
  const layers = { red: [], blue: [] };
  const titles = surface.matches('h1, h2, h3, p')
    ? [surface]
    : surface.querySelectorAll('h1, h2, .home-case-card__title, .home-competition-card__title, .home-footer__contact > p, .home-footer__copyright > p');

  function addLayers(host, kind, content) {
    for (const color of ['red', 'blue']) {
      const layer = document.createElement('span');
      layer.className = `scroll-fringe-layer scroll-fringe-layer--${kind} scroll-fringe-layer--${color}`;
      layer.setAttribute('aria-hidden', 'true');
      layer.inert = true;
      content(layer);
      host.append(layer);
      layers[color].push(layer);
    }
  }

  for (const title of titles) {
    const original = document.createElement('span');
    original.className = 'scroll-fringe-original';
    original.append(...title.childNodes);
    title.append(original);
    title.classList.add('scroll-fringe-host');
    addLayers(title, 'text', layer => {
      for (const child of original.childNodes) layer.append(child.cloneNode(true));
    });
  }

  for (const preview of surface.querySelectorAll('.home-case-card__visual')) {
    const source = preview.querySelector('img')?.getAttribute('src');
    if (!source) continue;
    addLayers(preview, 'image', layer => {
      layer.style.maskImage = `url(${JSON.stringify(source)})`;
    });
  }

  return layers;
}
