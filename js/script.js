(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let current = 0;

  const dotsWrap = document.getElementById('progressDots');
  const countEl = document.getElementById('progressCount');
  const titleChip = document.getElementById('slideTitleChip');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  slides.forEach((s, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Đi tới slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function render() {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    countEl.innerHTML = '<b>' + String(current + 1).padStart(2, '0') + '</b> / ' + String(total).padStart(2, '0');
    titleChip.textContent = slides[current].dataset.title || '';
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  function goTo(i) {
    current = Math.max(0, Math.min(total - 1, i));
    render();
  }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    if (e.key === 'Home') goTo(0);
    if (e.key === 'End') goTo(total - 1);
  });

  document.querySelector('.deck').addEventListener('click', (e) => {
    if (e.target.closest('button, a, .chrome-btn, .progress-wrap')) return;
    const x = e.clientX;
    const w = window.innerWidth;
    if (x < w * 0.22) prev();
    else if (x > w * 0.78) next();
  });

  let touchStartX = null;
  document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    touchStartX = null;
  }, { passive: true });

  /* ---------- autofit: guarantees every slide fits the viewport, never scrolls ---------- */
  function fitSlide(slide) {
    const inner = slide.querySelector('.slide-inner');
    inner.style.transform = 'none';
    const cs = getComputedStyle(slide);
    const padTop = parseFloat(cs.paddingTop) || 0;
    const padBottom = parseFloat(cs.paddingBottom) || 0;
    const padLeft = parseFloat(cs.paddingLeft) || 0;
    const padRight = parseFloat(cs.paddingRight) || 0;
    const availH = slide.clientHeight - padTop - padBottom;
    const availW = slide.clientWidth - padLeft - padRight;
    const naturalH = inner.scrollHeight;
    const naturalW = inner.scrollWidth;
    const scale = Math.min(1, (availH - 2) / naturalH, (availW - 2) / naturalW);
    inner.style.transform = scale < 0.999 ? 'scale(' + scale.toFixed(4) + ')' : 'none';
  }

  function fitAll() { slides.forEach(fitSlide); }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitAll, 80);
  });

  function initialFit() {
    fitAll();
    // fonts loading async can change natural sizes — refit once ready
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitAll);
    }
    setTimeout(fitAll, 250);
    setTimeout(fitAll, 700);
  }

  render();
  initialFit();
})();
