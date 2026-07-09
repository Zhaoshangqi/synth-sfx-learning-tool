const root = document.documentElement;
const body = document.body;
const splash = document.querySelector('.visual-splash');
const menuButton = document.querySelector('.visual-burger-btn');
const sidebar = document.querySelector('#site-menu');
const app = document.querySelector('#app');

const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function setMenuOpen(isOpen) {
  body.classList.toggle('shell-menu-open', isOpen);
  menuButton?.classList.toggle('is-open', isOpen);
  menuButton?.setAttribute('aria-expanded', String(isOpen));
  menuButton?.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
}

function settleSplash() {
  splash?.classList.add('is-done');
}

function shouldSkipSplash() {
  const hash = globalThis.location.hash.replace(/^#/, '').trim();
  return Boolean(hash && hash !== 'dashboard');
}

function getInitialRouteId() {
  const hash = globalThis.location.hash.replace(/^#/, '').trim().toLowerCase();
  const aliases = new Map([
    ['sound-lab', 'soundlab'],
    ['sound_lab', 'soundlab'],
    ['lab', 'soundlab'],
  ]);
  return aliases.get(hash) ?? hash;
}

function markRouteMode() {
  const route = getInitialRouteId();
  body.classList.toggle('is-direct-workstation-route', ['soundlab', 'interactive', 'challenges', 'deep', 'community'].includes(route));
}

function initSplash() {
  if (!splash) return;
  if (prefersReducedMotion || shouldSkipSplash()) {
    settleSplash();
    return;
  }

  splash.addEventListener('animationend', (event) => {
    if (event.animationName === 'studio-splash-hide') settleSplash();
  });

  globalThis.setTimeout(settleSplash, 1800);
}

function initMenu() {
  if (!menuButton || !sidebar) return;

  menuButton.addEventListener('click', () => {
    setMenuOpen(!body.classList.contains('shell-menu-open'));
  });

  sidebar.querySelectorAll('.tab, button[data-view]').forEach((button) => {
    button.addEventListener('click', () => setMenuOpen(false));
  });

  globalThis.addEventListener('pointerdown', (event) => {
    if (!body.classList.contains('shell-menu-open')) return;
    const target = event.target;
    if (target instanceof Node && (sidebar.contains(target) || menuButton.contains(target))) return;
    setMenuOpen(false);
  }, { passive: true });

  globalThis.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
}

function initSpotlight() {
  if (prefersReducedMotion) return;
  let frame = 0;
  const pointer = { x: globalThis.innerWidth * 0.62, y: globalThis.innerHeight * 0.34 };
  const smooth = { ...pointer };

  function tickSpotlight() {
    frame = 0;
    smooth.x += (pointer.x - smooth.x) * 0.12;
    smooth.y += (pointer.y - smooth.y) * 0.12;
    root.style.setProperty('--spot-x', `${smooth.x.toFixed(1)}px`);
    root.style.setProperty('--spot-y', `${smooth.y.toFixed(1)}px`);

    if (Math.abs(pointer.x - smooth.x) > 0.35 || Math.abs(pointer.y - smooth.y) > 0.35) {
      frame = globalThis.requestAnimationFrame(tickSpotlight);
    }
  }

  globalThis.addEventListener('pointermove', (event) => {
    if (globalThis.__synthDirectManipulating || body.classList.contains('is-direct-manipulating')) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    if (!frame) frame = globalThis.requestAnimationFrame(tickSpotlight);
  }, { passive: true });

  tickSpotlight();
}

function segmentHeadlineText(text) {
  if (/\s/.test(text)) return text.split(/\s+/).filter(Boolean);
  const phraseSegments = text.match(/“[^”]+”|[^“”]+/gu)?.map((part) => part.trim()).filter(Boolean);
  if (phraseSegments?.length > 1) return phraseSegments;
  if (globalThis.Intl?.Segmenter) {
    const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (part) => part.segment).filter(Boolean);
  }
  return Array.from(text).filter(Boolean);
}

function revealHeadlineWords() {
  const headline = document.querySelector('.dashboard-hero .hero-copy h3');
  if (!headline || headline.dataset.wordRevealReady === 'true') return;
  const text = headline.textContent?.trim();
  if (!text) return;
  headline.dataset.wordRevealReady = 'true';
  headline.textContent = '';
  const usesWordSpacing = /\s/.test(text);
  const segments = segmentHeadlineText(text);
  segments.forEach((word, index) => {
    const span = document.createElement('span');
    span.className = 'word-reveal';
    span.textContent = word;
    span.style.animationDelay = `${0.14 + index * 0.026}s`;
    headline.append(span);
    if (usesWordSpacing && index < segments.length - 1) headline.append(document.createTextNode(' '));
  });
}

function markShellReady() {
  body.classList.add('visual-shell-ready');
}

function observeRenderedViews() {
  if (!app || prefersReducedMotion) return;
  const observer = new MutationObserver(() => revealHeadlineWords());
  observer.observe(app, { childList: true, subtree: true });
}

initSplash();
initMenu();
markRouteMode();
initSpotlight();
revealHeadlineWords();
observeRenderedViews();

globalThis.addEventListener('hashchange', markRouteMode, { passive: true });
markShellReady();
