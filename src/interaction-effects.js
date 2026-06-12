const tactileSelector = [
  'button',
  '.source-link',
  '.source-pill',
  '.range-shell',
].join(',');

const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function findTactileTarget(event) {
  const target = event.target?.closest?.(tactileSelector);
  if (!target || target.matches?.(':disabled')) return null;
  if (!document.documentElement.contains(target)) return null;
  return target;
}

function addPressState(target) {
  target.classList.add('has-tactile', 'is-pressing');
  globalThis.setTimeout(() => target.classList.remove('is-pressing'), prefersReducedMotion ? 80 : 240);
}

function addSpark(x, y) {
  if (prefersReducedMotion) return;

  const spark = document.createElement('span');
  spark.className = 'tap-spark';
  spark.setAttribute('aria-hidden', 'true');
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  document.body.append(spark);

  const cleanup = () => spark.remove();
  spark.addEventListener('animationend', cleanup, { once: true });
  globalThis.setTimeout(cleanup, 720);
}

function pulseAt(target, clientX, clientY) {
  const rect = target.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
  const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

  target.style.setProperty('--tap-x', `${x}px`);
  target.style.setProperty('--tap-y', `${y}px`);
  addPressState(target);
  addSpark(clientX, clientY);
}

document.addEventListener('pointerdown', (event) => {
  const target = findTactileTarget(event);
  if (!target) return;
  pulseAt(target, event.clientX, event.clientY);
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (!['Enter', ' '].includes(event.key)) return;
  const target = event.target?.closest?.(tactileSelector);
  if (!target) return;

  const rect = target.getBoundingClientRect();
  pulseAt(target, rect.left + rect.width / 2, rect.top + rect.height / 2);
});
