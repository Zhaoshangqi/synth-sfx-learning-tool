const tactileSelector = [
  'button',
  '.source-link',
  '.source-pill',
].join(',');

const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function isContinuousControl(event, target) {
  const source = event?.target;
  return Boolean(
    source?.closest?.('input[type="range"], [data-xy-pad], .xy-pad-panel, .vertical-slider')
      || target?.matches?.('.range-shell')
      || target?.closest?.('[data-xy-pad], .xy-pad-panel'),
  );
}

function findTactileTarget(event) {
  const target = event.target?.closest?.(tactileSelector);
  if (!target || target.matches?.(':disabled')) return null;
  if (!document.documentElement.contains(target)) return null;
  return target;
}

function addPressState(target) {
  target.classList.add('is-pressing');
  globalThis.setTimeout(() => target.classList.remove('is-pressing'), prefersReducedMotion ? 80 : 240);
}

function pulseAt(target) {
  addPressState(target);
}

document.addEventListener('pointerdown', (event) => {
  const target = findTactileTarget(event);
  if (!target) return;
  if (isContinuousControl(event, target)) return;
  pulseAt(target);
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (!['Enter', ' '].includes(event.key)) return;
  const target = event.target?.closest?.(tactileSelector);
  if (!target) return;
  if (isContinuousControl(event, target)) return;
  pulseAt(target);
});
