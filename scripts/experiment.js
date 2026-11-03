(() => {
  const root = document.documentElement;
  const dialog = document.querySelector('.detail-dialog');
  const content = dialog.querySelector('.dialog-content');
  const motionButton = document.querySelector('.motion-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = window.matchMedia('(min-width: 901px)');
  let motionEnabled = !reducedMotion.matches;
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let frame = 0;
  let opener;

  const canMove = () => motionEnabled && !reducedMotion.matches && pointer.matches && desktop.matches && !dialog.open;
  function animate() {
    currentX += (targetX - currentX) * .065;
    currentY += (targetY - currentY) * .065;
    root.style.setProperty('--mx', currentX.toFixed(4));
    root.style.setProperty('--my', currentY.toFixed(4));
    if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .001) {
      frame = requestAnimationFrame(animate);
    } else frame = 0;
  }
  function move(x = 0, y = 0) {
    targetX = x;
    targetY = y;
    if (!frame) frame = requestAnimationFrame(animate);
  }
  function syncMotion() {
    const active = canMove();
    root.classList.toggle('motion-paused', !active);
    motionButton.setAttribute('aria-pressed', String(motionEnabled && !reducedMotion.matches));
    motionButton.innerHTML = `${motionEnabled && !reducedMotion.matches ? 'Движение вкл.' : 'Движение выкл.'} <span aria-hidden="true">◉</span>`;
    if (!active) move();
  }
  document.addEventListener('pointermove', event => {
    if (canMove()) move(event.clientX / window.innerWidth * 2 - 1, event.clientY / window.innerHeight * 2 - 1);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => move());
  window.addEventListener('blur', () => move());
  motionButton.addEventListener('click', () => {
    motionEnabled = !motionEnabled;
    syncMotion();
  });
  reducedMotion.addEventListener('change', () => {
    motionEnabled = !reducedMotion.matches;
    syncMotion();
  });
  desktop.addEventListener('change', syncMotion);
  pointer.addEventListener('change', syncMotion);

  document.querySelectorAll('[data-panel]').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (!canMove()) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--px', ((event.clientX - rect.left) / rect.width * 2 - 1).toFixed(3));
      button.style.setProperty('--py', ((event.clientY - rect.top) / rect.height * 2 - 1).toFixed(3));
    }, { passive: true });
    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--px', '0');
      button.style.setProperty('--py', '0');
    });
    button.addEventListener('click', () => {
      const template = document.getElementById(`content-${button.dataset.panel}`);
      if (!template) return;
      opener = button;
      content.replaceChildren(template.content.cloneNode(true));
      dialog.showModal();
      dialog.scrollTop = 0;
      document.body.classList.add('dialog-open');
      syncMotion();
      move();
      dialog.querySelector('.dialog-close').focus();
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    syncMotion();
    opener?.focus({ preventScroll: true });
  });
  syncMotion();
})();
