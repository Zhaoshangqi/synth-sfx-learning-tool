const canvas = document.querySelector('#particle-canvas');
const ctx = canvas?.getContext('2d', { alpha: true });
const pointer = { x: 0, y: 0, tx: 0, ty: 0, screenX: 0, screenY: 0 };
let width = 0;
let height = 0;
let particles = [];
let signalParticles = [];
let transitionBursts = [];
let frameId = 0;
let spaceParallaxFrame = 0;

const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const random = (min, max) => min + Math.random() * (max - min);
const WAVE_ROWS = [0.28, 0.52, 0.76];

function resize() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(globalThis.devicePixelRatio || 1, 2);
  width = globalThis.innerWidth;
  height = globalThis.innerHeight;
  if (!pointer.screenX && !pointer.screenY) {
    pointer.screenX = width * 0.5;
    pointer.screenY = height * 0.48;
  }
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(120, Math.max(54, Math.floor((width * height) / 18000)));
  particles = Array.from({ length: count }, (_, index) => ({
    x: random(0, width),
    y: random(0, height),
    z: random(0.22, 1),
    r: random(0.55, 1.7),
    vx: random(-0.07, 0.07),
    vy: random(-0.045, 0.045),
    phase: random(0, Math.PI * 2),
    hue: index % 5 === 0 ? 'violet' : 'cyan',
  }));

  const signalCount = Math.min(46, Math.max(18, Math.floor(width / 34)));
  signalParticles = Array.from({ length: signalCount }, (_, index) => ({
    row: index % WAVE_ROWS.length,
    progress: random(0, 1),
    speed: random(0.000018, 0.000045),
    z: random(0.34, 1),
    r: random(0.8, 2.2),
    phase: random(0, Math.PI * 2),
    hue: index % 4 === 0 ? 'violet' : index % 5 === 0 ? 'green' : 'cyan',
  }));

  transitionBursts = [];
}

function waveY(x, rowIndex, time) {
  const row = WAVE_ROWS[rowIndex] ?? WAVE_ROWS[0];
  const amp = 16 + rowIndex * 9;
  const yBase = height * row + Math.sin(time * 0.00021 + rowIndex) * 18;
  return yBase + Math.sin(x * 0.012 + time * 0.00042 + rowIndex * 1.7) * amp;
}

function drawParticle(particle, time) {
  const parallaxX = pointer.x * particle.z * 14;
  const parallaxY = pointer.y * particle.z * 10;
  const pulse = 0.45 + Math.sin(time * 0.001 + particle.phase) * 0.28;
  const color = particle.hue === 'violet' ? '124, 140, 255' : '110, 231, 249';
  const baseX = particle.x + parallaxX;
  const baseY = particle.y + parallaxY;
  const pointerDistance = Math.hypot(baseX - pointer.screenX, baseY - pointer.screenY);
  const mouseInfluence = Math.max(0, 1 - pointerDistance / 180) * particle.z;
  const drawX = baseX + (pointer.screenX - baseX) * mouseInfluence * 0.025;
  const drawY = baseY + (pointer.screenY - baseY) * mouseInfluence * 0.025;

  ctx.beginPath();
  ctx.fillStyle = `rgba(${color}, ${0.08 + pulse * 0.12 + mouseInfluence * 0.09})`;
  ctx.arc(drawX, drawY, particle.r + mouseInfluence * 0.85, 0, Math.PI * 2);
  ctx.fill();
}

function drawConnections(time) {
  for (let i = 0; i < particles.length; i += 1) {
    const a = particles[i];
    for (let j = i + 1; j < particles.length; j += 9) {
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 108) continue;

      const ax = a.x + pointer.x * a.z * 12;
      const ay = a.y + pointer.y * a.z * 8;
      const bx = b.x + pointer.x * b.z * 12;
      const by = b.y + pointer.y * b.z * 8;
      const midpointDistance = Math.hypot((ax + bx) * 0.5 - pointer.screenX, (ay + by) * 0.5 - pointer.screenY);
      const mouseInfluence = Math.max(0, 1 - midpointDistance / 220);
      const shimmer = 0.012 + Math.sin(time * 0.0012 + i) * 0.006;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(110, 231, 249, ${0.03 * (1 - distance / 108) + mouseInfluence * 0.04 + shimmer})`;
      ctx.lineWidth = 0.7;
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
  }
}

function drawSignalWave(time) {
  WAVE_ROWS.forEach((row, rowIndex) => {
    ctx.beginPath();
    for (let x = -20; x <= width + 20; x += 14) {
      const y = waveY(x, rowIndex, time);
      if (x === -20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${rowIndex === 1 ? '167, 139, 250' : '110, 231, 249'}, ${0.032 + rowIndex * 0.01})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function drawSignalParticles(time) {
  signalParticles.forEach((particle) => {
    particle.progress = (particle.progress + particle.speed * (16 + particle.z * 10)) % 1;
    const x = particle.progress * (width + 80) - 40 + pointer.x * particle.z * 18;
    const y = waveY(x, particle.row, time) + pointer.y * particle.z * 12;
    const trailX = x - 28 * particle.z;
    const trailY = waveY(trailX, particle.row, time) + pointer.y * particle.z * 12;
    const pulse = 0.5 + Math.sin(time * 0.0014 + particle.phase) * 0.28;
    const color = particle.hue === 'violet' ? '167, 139, 250' : particle.hue === 'green' ? '94, 234, 212' : '110, 231, 249';

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${color}, ${0.035 + pulse * 0.07})`;
    ctx.lineWidth = 0.8;
    ctx.moveTo(trailX, trailY);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = `rgba(${color}, ${0.16 + pulse * 0.18})`;
    ctx.shadowColor = `rgba(${color}, 0.2)`;
    ctx.shadowBlur = 10;
    ctx.arc(x, y, particle.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function spawnTransitionBurst(detail = {}) {
  if (prefersReducedMotion || !width || !height) return;
  const seed = String(detail.to ?? 'view').length;
  const centerX = width * (0.34 + (seed % 5) * 0.08);
  const centerY = height * (0.34 + (seed % 4) * 0.1);
  const count = Math.min(48, Math.max(24, Math.floor(width / 36)));

  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + random(-0.18, 0.18);
    const speed = random(0.34, 1.4);
    transitionBursts.push({
      x: centerX + random(-18, 18),
      y: centerY + random(-18, 18),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.62,
      age: 0,
      ttl: random(0.72, 1.25),
      r: random(0.7, 2.1),
      hue: index % 3 === 0 ? 'green' : index % 2 === 0 ? 'violet' : 'cyan',
    });
  }
}

function drawTransitionParticles(time) {
  transitionBursts = transitionBursts.filter((particle) => particle.age < particle.ttl);
  transitionBursts.forEach((particle) => {
    particle.age += 0.016;
    particle.x += particle.vx;
    particle.y += particle.vy;
    const life = 1 - particle.age / particle.ttl;
    const color = particle.hue === 'violet' ? '167, 139, 250' : particle.hue === 'green' ? '94, 234, 212' : '110, 231, 249';
    const pulse = 0.7 + Math.sin(time * 0.003 + particle.age * 8) * 0.24;

    ctx.beginPath();
    ctx.fillStyle = `rgba(${color}, ${life * 0.22 * pulse})`;
    ctx.shadowColor = `rgba(${color}, ${life * 0.24})`;
    ctx.shadowBlur = 10;
    ctx.arc(particle.x + pointer.x * 12, particle.y + pointer.y * 8, particle.r + (1 - life) * 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawRippleField(time) {
  const centers = [
    [width * 0.18 + pointer.x * 18, height * 0.2 + pointer.y * 12],
    [width * 0.78 + pointer.x * -14, height * 0.68 + pointer.y * -10],
  ];

  centers.forEach(([cx, cy], centerIndex) => {
    for (let ring = 0; ring < 3; ring += 1) {
      const phase = ((time * 0.00008 + ring * 0.22 + centerIndex * 0.17) % 1);
      const radius = 48 + phase * 190;
      const alpha = (1 - phase) * 0.035;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${centerIndex === 0 ? '110, 231, 249' : '167, 139, 250'}, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function scheduleSpaceParallaxCommit() {
  if (spaceParallaxFrame || prefersReducedMotion) return;
  spaceParallaxFrame = globalThis.requestAnimationFrame(() => {
    spaceParallaxFrame = 0;
    if (globalThis.__synthDirectManipulating) return;
    document.documentElement.style.setProperty('--space-x', pointer.tx.toFixed(3));
    document.documentElement.style.setProperty('--space-y', pointer.ty.toFixed(3));
  });
}

function updatePointerFromEvent(event) {
  if (globalThis.__synthDirectManipulating) return;
  pointer.screenX = event.clientX;
  pointer.screenY = event.clientY;
  pointer.tx = (event.clientX / Math.max(1, width) - 0.5) * 2;
  pointer.ty = (event.clientY / Math.max(1, height) - 0.5) * 2;
  scheduleSpaceParallaxCommit();
}

function tick(time = 0) {
  if (!ctx || !canvas) return;

  pointer.x += (pointer.tx - pointer.x) * 0.055;
  pointer.y += (pointer.ty - pointer.y) * 0.055;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(8, 10, 18, 0.022)';
  ctx.fillRect(0, 0, width, height);

  drawRippleField(time);
  drawSignalWave(time);
  particles.forEach((particle) => {
    particle.x += particle.vx * particle.z;
    particle.y += particle.vy * particle.z;
    particle.phase += 0.002;
    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;
    drawParticle(particle, time);
  });
  drawSignalParticles(time);
  drawTransitionParticles(time);
  drawConnections(time);

  if (!prefersReducedMotion) frameId = globalThis.requestAnimationFrame(tick);
}

function init() {
  if (!canvas || !ctx) return;
  resize();
  globalThis.addEventListener('resize', resize);
  globalThis.addEventListener('pointermove', (event) => {
    updatePointerFromEvent(event);
  }, { passive: true });
  document.addEventListener('synth:view-transition', (event) => {
    spawnTransitionBurst(event.detail);
  });
  tick();
}

init();

globalThis.addEventListener('pagehide', () => {
  if (frameId) globalThis.cancelAnimationFrame(frameId);
  if (spaceParallaxFrame) globalThis.cancelAnimationFrame(spaceParallaxFrame);
});
