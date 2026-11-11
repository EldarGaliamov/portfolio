document.querySelectorAll('.bio-detail').forEach(button => {
  button.addEventListener('click', async () => {
    if (button.classList.contains('is-playing')) return;

    button.classList.add('is-playing');
    const animations = button.getAnimations({ subtree: true });
    await Promise.allSettled(animations.map(animation => animation.finished));
    button.classList.remove('is-playing');
  });

  button.hidden = false;
});
