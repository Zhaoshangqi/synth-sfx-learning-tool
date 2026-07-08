const canvas = document.querySelector('#particle-canvas');
const ctx = canvas?.getContext('2d', { alpha: true });
const pointer = { x: 0, y: 0, tx: 0, ty: 0, screenX: 0, screenY: 0, force: 0, targetForce: 0 };
let width = 0;
let height = 0;
let particles = [];
let signalParticles = [];
let aetherStreams = [];
let aetherCurrentPackets = [];
let aetherFlowNodes = [];
let aetherMagneticLinks = [];
let aetherOrbitalFields = [];
let aetherConstellationParticles = [];
let aetherHeroFlowParticles = [];
let aetherFlowFilaments = [];
let aetherFlowRivers = [];
let aetherViscousCurrents = [];
let aetherAdaptiveMeshParticles = [];
let aetherComponentFlowParticles = [];
let aetherComponentFlowTargets = [];
let aetherSurfaceThreads = [];
let cursorWakeParticles = [];
let transitionBursts = [];
let aetherPressurePulses = [];
let aetherAudioRipples = [];
let frameId = 0;
let spaceParallaxFrame = 0;
let lastAetherAudioRippleTime = 0;
let aetherAdaptiveMeshEnergy = 0;
let aetherComponentFlowEnergy = 0;
let aetherSurfaceThreadEnergy = 0;
let aetherViscousCurrentEnergy = 0;

const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const random = (min, max) => min + Math.random() * (max - min);
const WAVE_ROWS = [0.28, 0.52, 0.76];
const AETHER_MOUSE_RADIUS = 210;
const AETHER_POINTER_EASE = 0.075;
const AETHER_POINTER_DECAY = 0.925;
const AETHER_CONNECTION_RADIUS = 136;
const AETHER_WEB_STRIDE = 6;
const AETHER_STREAM_COUNT = 5;
const AETHER_STREAM_SEGMENTS = 72;
const AETHER_CURRENT_PACKET_COUNT = 28;
const AETHER_FLOW_NODE_COUNT = 34;
const AETHER_NODE_CONNECTION_RADIUS = 176;
const AETHER_MAGNETIC_LINK_COUNT = 11;
const AETHER_MAGNETIC_SEGMENTS = 32;
const AETHER_ORBITAL_FIELD_COUNT = 5;
const AETHER_ORBITAL_SEGMENTS = 92;
const AETHER_CONSTELLATION_COUNT = 78;
const AETHER_CONSTELLATION_RADIUS = 164;
const AETHER_CONSTELLATION_STRIDE = 3;
const AETHER_HERO_FLOW_COUNT = 54;
const AETHER_HERO_FLOW_RADIUS = 220;
const AETHER_HERO_FLOW_CONNECTION_RADIUS = 154;
const AETHER_HERO_FLOW_STRIDE = 2;
const AETHER_FLOW_FILAMENT_COUNT = 9;
const AETHER_FLOW_FILAMENT_SEGMENTS = 86;
const AETHER_FLOW_RIVER_COUNT = 4;
const AETHER_FLOW_RIVER_SEGMENTS = 96;
const AETHER_VISCOUS_CURRENT_COUNT = 7;
const AETHER_VISCOUS_CURRENT_SEGMENTS = 74;
const AETHER_VISCOUS_CURRENT_TAIL = 0.09;
const AETHER_ADAPTIVE_MESH_COUNT = 74;
const AETHER_ADAPTIVE_MESH_RADIUS = 168;
const AETHER_ADAPTIVE_MOUSE_RADIUS = 232;
const AETHER_ADAPTIVE_MESH_STRIDE = 2;
const AETHER_COMPONENT_FLOW_COUNT = 64;
const AETHER_COMPONENT_FLOW_RADIUS = 184;
const AETHER_COMPONENT_FLOW_STRIDE = 2;
const AETHER_SURFACE_THREAD_MAX = 12;
const AETHER_SURFACE_THREAD_SEGMENTS = 44;
const AETHER_SURFACE_THREAD_PACKET_TAIL = 0.075;
const AETHER_WAKE_MAX_PARTICLES = 54;
const AETHER_WAKE_MIN_DISTANCE = 18;
const AETHER_WAKE_MIN_MS = 24;
const AETHER_PRESSURE_RADIUS = 178;
const AETHER_PRESSURE_MAX_PULSES = 12;
const AETHER_AUDIO_RIPPLE_MAX = 14;
const AETHER_AUDIO_RIPPLE_MIN_MS = 105;
const AETHER_FLOW_SURFACE_SELECTOR = [
  '.visual-burger-btn',
  '.signal-node',
  '.dashboard-hero.aether-flow-stage',
  '.hero-capsule-cta',
  '.hero-sound-visual.aether-flow-stage',
  '.module-directory-card',
  '.daily-video-card',
  '.source-card',
  '.workbench-panel',
  '.workbench-topbar',
  '.dashboard-actions',
  '.hero-status-strip',
  '.waveform-drill-step',
  '.waveform-ear-tree',
  '.translation-monitor-panel',
  '.target-match-coach-panel',
  '.synth-transfer-panel',
  '[data-flow-surface]',
].join(',');
const AETHER_COMPONENT_FLOW_SELECTOR = [
  '.dashboard-hero.aether-flow-stage',
  '.hero-sound-visual.aether-flow-stage',
  '.dashboard-actions',
  '.hero-status-strip',
  '.learning-flow',
  '.dashboard-module-directory',
  '.module-directory-card',
  '.daily-video-card',
  '.source-card',
  '.workbench-panel',
  '.workbench-topbar',
  '.advanced-module-pill',
  '.polish-calibration-panel',
  '.sound-quality-coach-panel',
  '.translation-monitor-panel',
  '.waveform-ear-tree',
  '.target-match-coach-panel',
  '.synth-transfer-panel',
  '.mission-brief-panel',
  '[data-flow-surface]',
].join(',');
const cursorWakeAnchor = { x: 0, y: 0, time: 0 };

function isAetherFlowPaused() {
  return Boolean(globalThis.__synthDirectManipulating || document.body?.classList.contains('is-direct-manipulating'));
}

function aetherRepel(x, y, z = 1) {
  if (isAetherFlowPaused()) return { x, y, force: 0 };
  const dx = x - pointer.screenX;
  const dy = y - pointer.screenY;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const force = Math.max(0, 1 - distance / AETHER_MOUSE_RADIUS) * z * pointer.force;
  const lift = force * (10 + z * 14);

  return {
    x: x + (dx / distance) * lift,
    y: y + (dy / distance) * lift * 0.78,
    force,
  };
}

function createAetherStream(index) {
  const span = AETHER_STREAM_COUNT + 1;
  return {
    baseY: height * ((index + 1) / span) + random(-28, 28),
    amplitude: random(18, 52),
    frequency: random(3.6, 6.8),
    phase: random(0, Math.PI * 2),
    speed: random(0.00018, 0.00034),
    z: random(0.28, 0.9),
    parallaxX: random(10, 28),
    parallaxY: random(7, 18),
    width: random(0.8, 1.8),
    color: index % 3 === 0 ? '117, 197, 222' : index % 3 === 1 ? '167, 139, 250' : '94, 234, 212',
  };
}

function createAetherCurrentPacket(index) {
  return {
    streamIndex: index % Math.max(1, aetherStreams.length || AETHER_STREAM_COUNT),
    progress: random(0, 1),
    speed: random(0.000038, 0.000085),
    trail: random(0.032, 0.075),
    z: random(0.42, 1),
    phase: random(0, Math.PI * 2),
    color: index % 3 === 0 ? '117, 197, 222' : index % 3 === 1 ? '167, 139, 250' : '94, 234, 212',
  };
}

function createAetherFlowNode(index) {
  return {
    x: random(0, width),
    y: random(height * 0.08, height * 0.92),
    vx: random(-0.075, 0.075),
    vy: random(-0.052, 0.052),
    z: random(0.38, 1),
    r: random(0.72, 1.9),
    phase: random(0, Math.PI * 2),
    color: index % 4 === 0 ? '167, 139, 250' : index % 5 === 0 ? '94, 234, 212' : '117, 197, 222',
  };
}

function createAetherMagneticLink(index) {
  return {
    lane: random(0.14, 0.88),
    amplitude: random(24, 74),
    frequency: random(1.5, 3.8),
    phase: random(0, Math.PI * 2),
    speed: random(0.00016, 0.00031),
    drift: random(-0.000035, 0.000052),
    z: random(0.34, 0.96),
    width: random(0.42, 1.1),
    color: index % 3 === 0 ? '117, 197, 222' : index % 3 === 1 ? '167, 139, 250' : '94, 234, 212',
  };
}

function createAetherOrbitalField(index) {
  const anchors = [
    [0.18, 0.22],
    [0.74, 0.24],
    [0.5, 0.52],
    [0.24, 0.76],
    [0.78, 0.72],
  ];
  const [anchorX, anchorY] = anchors[index % anchors.length];

  return {
    anchorX,
    anchorY,
    radiusX: random(width * 0.08, width * 0.18),
    radiusY: random(height * 0.035, height * 0.105),
    speed: random(0.00012, 0.00028) * (index % 2 === 0 ? 1 : -1),
    phase: random(0, Math.PI * 2),
    tilt: random(-0.34, 0.34),
    z: random(0.36, 0.9),
    parallaxX: random(14, 36),
    parallaxY: random(8, 24),
    color: index % 3 === 0 ? '117, 197, 222' : index % 3 === 1 ? '167, 139, 250' : '94, 234, 212',
  };
}

function createAetherConstellationParticle(index) {
  return {
    x: random(0, width),
    y: random(0, height),
    vx: random(-0.038, 0.038),
    vy: random(-0.028, 0.028),
    z: random(0.28, 0.96),
    r: random(0.55, 1.45),
    phase: random(0, Math.PI * 2),
    color: index % 5 === 0 ? '167, 139, 250' : index % 4 === 0 ? '94, 234, 212' : '117, 197, 222',
  };
}

function createAetherAdaptiveMeshParticle(index, seed = 0) {
  const angle = random(0, Math.PI * 2) + seed * 0.03;
  const speed = random(0.065, 0.18);
  return {
    x: random(width * 0.03, width * 0.97),
    y: random(height * 0.04, height * 0.96),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed * 0.72,
    z: random(0.3, 1),
    r: random(0.72, 1.85),
    phase: random(0, Math.PI * 2) + seed * 0.1,
    channel: index % 3,
    color: index % 3 === 0 ? '117, 197, 222' : index % 3 === 1 ? '167, 139, 250' : '94, 234, 212',
  };
}

function collectAetherComponentFlowTargets() {
  if (!width || !height || typeof document === 'undefined') return [];

  const seen = new Set();
  const targets = Array.from(document.querySelectorAll(AETHER_COMPONENT_FLOW_SELECTOR))
    .map((node, index) => {
      if (!node || seen.has(node)) return null;
      seen.add(node);

      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      if (rect.bottom < -80 || rect.top > height + 80 || rect.right < -80 || rect.left > width + 80) return null;

      const style = globalThis.getComputedStyle?.(node);
      if (style?.display === 'none' || style?.visibility === 'hidden' || Number(style?.opacity ?? 1) < 0.04) return null;

      const weight = node.matches('.dashboard-hero, .hero-sound-visual, .sound-lab-workbench, .workbench-panel')
        ? 1.22
        : node.matches('button, .advanced-module-pill, .module-directory-card')
          ? 1.04
          : 0.86;

      return {
        key: `${node.className || node.tagName}-${index}`,
        x: rect.left + rect.width * (0.42 + (index % 3) * 0.08),
        y: rect.top + rect.height * (0.42 + (index % 2) * 0.12),
        width: rect.width,
        height: rect.height,
        weight,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.weight - a.weight);

  if (targets.length) return targets.slice(0, width < 760 ? 9 : 18);

  return [
    { key: 'fallback-hero', x: width * 0.22, y: height * 0.28, width: 280, height: 180, weight: 1.08 },
    { key: 'fallback-core', x: width * 0.58, y: height * 0.46, width: 340, height: 220, weight: 1.2 },
    { key: 'fallback-rail', x: width * 0.78, y: height * 0.72, width: 240, height: 160, weight: 0.92 },
  ];
}

function createAetherComponentFlowParticle(index, seed = 0, targets = aetherComponentFlowTargets) {
  const anchors = targets.length ? targets : collectAetherComponentFlowTargets();
  const target = anchors[index % Math.max(1, anchors.length)] ?? {
    x: width * 0.5,
    y: height * 0.48,
    width: width * 0.25,
    height: height * 0.2,
    weight: 1,
  };
  const angle = random(0, Math.PI * 2) + seed * 0.07 + index * 0.015;
  const radius = random(16, Math.max(34, Math.min(target.width, target.height) * 0.26));

  return {
    x: target.x + Math.cos(angle) * radius + random(-18, 18),
    y: target.y + Math.sin(angle) * radius * 0.72 + random(-12, 12),
    homeX: target.x + Math.cos(angle + 0.7) * radius * 0.56,
    homeY: target.y + Math.sin(angle + 0.7) * radius * 0.42,
    targetIndex: index % Math.max(1, anchors.length),
    vx: random(-0.052, 0.052),
    vy: random(-0.038, 0.038),
    z: random(0.34, 1),
    r: random(0.62, 1.8),
    phase: random(0, Math.PI * 2) + seed * 0.12,
    color: index % 5 === 0 ? '167, 139, 250' : index % 4 === 0 ? '94, 234, 212' : '117, 197, 222',
  };
}

function createAetherHeroFlowParticle(index, seed = 0) {
  const lane = (index % 7) / 6;
  const edgeBias = index % 3 === 0 ? 0.18 : index % 3 === 1 ? 0.5 : 0.82;
  return {
    x: random(width * 0.05, width * 0.95),
    y: random(height * 0.08, height * 0.9),
    homeX: width * (0.18 + edgeBias * 0.64) + Math.sin(seed + index * 1.7) * width * 0.045,
    homeY: height * (0.18 + lane * 0.64) + Math.cos(seed * 0.7 + index * 1.2) * height * 0.045,
    vx: random(-0.055, 0.055),
    vy: random(-0.04, 0.04),
    z: random(0.36, 1),
    r: random(0.72, 1.75),
    phase: random(0, Math.PI * 2) + seed * 0.11,
    color: index % 5 === 0 ? '167, 139, 250' : index % 4 === 0 ? '94, 234, 212' : '117, 197, 222',
  };
}

function createAetherFlowFilament(index) {
  const lane = (index + 0.7) / (AETHER_FLOW_FILAMENT_COUNT + 1.4);
  return {
    lane,
    offset: random(-0.055, 0.055),
    amplitude: random(18, 54),
    secondaryAmplitude: random(8, 24),
    frequency: random(1.8, 4.4),
    speed: random(0.00009, 0.00018) * (index % 2 === 0 ? 1 : -1),
    phase: random(0, Math.PI * 2),
    drift: random(-0.000018, 0.000024),
    z: random(0.34, 0.96),
    width: random(0.28, 0.8),
    packet: random(0, 1),
    packetSpeed: random(0.000032, 0.000068),
    color: index % 4 === 0 ? '167, 139, 250' : index % 3 === 0 ? '94, 234, 212' : '117, 197, 222',
  };
}

function createAetherFlowRiver(index, seed = 0) {
  const span = AETHER_FLOW_RIVER_COUNT + 1;
  return {
    lane: (index + 1) / span + random(-0.035, 0.035),
    amplitude: random(36, 86),
    secondaryAmplitude: random(12, 34),
    frequency: random(1.05, 2.55),
    phase: random(0, Math.PI * 2) + seed * 0.09,
    speed: random(0.000045, 0.00011) * (index % 2 === 0 ? 1 : -1),
    drift: random(-0.000012, 0.000018),
    z: random(0.32, 0.92),
    width: random(2.8, 7.2),
    packet: random(0, 1),
    packetSpeed: random(0.000022, 0.00005),
    color: index % 3 === 0 ? '117, 197, 222' : index % 3 === 1 ? '167, 139, 250' : '94, 234, 212',
  };
}

function createAetherViscousCurrent(index, seed = 0) {
  const lane = (index + 0.55) / (AETHER_VISCOUS_CURRENT_COUNT + 0.1);
  const direction = index % 2 === 0 ? 1 : -1;
  return {
    lane: Math.max(0.08, Math.min(0.92, lane + Math.sin(seed + index) * 0.035)),
    amplitude: random(22, 68),
    secondaryAmplitude: random(10, 30),
    frequency: random(1.25, 2.9),
    phase: random(0, Math.PI * 2) + seed * 0.13,
    speed: random(0.000034, 0.000078) * direction,
    drift: random(-0.000014, 0.000018),
    z: random(0.28, 0.94),
    width: random(0.58, 1.55),
    packet: random(0, 1),
    packetSpeed: random(0.000032, 0.000072) * direction,
    viscosity: random(0.42, 0.86),
    color: index % 5 === 0 ? '167, 139, 250' : index % 4 === 0 ? '94, 234, 212' : '117, 197, 222',
  };
}

function resetAetherHeroFlowNetwork(detail = {}) {
  if (!width || !height) return;
  const seed = String(detail?.to ?? detail?.from ?? 'aether').length;
  const count = Math.min(AETHER_HERO_FLOW_COUNT, Math.max(width < 760 ? 20 : 34, Math.floor((width * height) / 26000)));
  aetherHeroFlowParticles = Array.from({ length: count }, (_, index) => createAetherHeroFlowParticle(index, seed));
}

function resetAetherAdaptiveMesh(detail = {}) {
  if (!width || !height) return;
  const seed = String(detail?.to ?? detail?.from ?? detail?.source ?? 'mesh').length;
  const count = Math.min(AETHER_ADAPTIVE_MESH_COUNT, Math.max(width < 760 ? 24 : 42, Math.floor((width * height) / 24000)));
  aetherAdaptiveMeshParticles = Array.from({ length: count }, (_, index) => createAetherAdaptiveMeshParticle(index, seed));
}

function resetAetherComponentFlowNetwork(detail = {}) {
  if (!width || !height) return;
  const seed = String(detail?.to ?? detail?.from ?? detail?.source ?? 'component-flow').length;
  aetherComponentFlowTargets = collectAetherComponentFlowTargets();
  const count = Math.min(
    AETHER_COMPONENT_FLOW_COUNT,
    Math.max(width < 760 ? 20 : 36, Math.floor((width * height) / 25000)),
  );
  aetherComponentFlowParticles = Array.from(
    { length: count },
    (_, index) => createAetherComponentFlowParticle(index, seed, aetherComponentFlowTargets),
  );
  aetherComponentFlowEnergy = Math.min(1, aetherComponentFlowEnergy + 0.22);
}

function resetAetherFlowRivers(detail = {}) {
  if (!width || !height) return;
  const seed = String(detail?.to ?? detail?.from ?? detail?.source ?? 'river').length;
  const count = width < 760 ? 2 : AETHER_FLOW_RIVER_COUNT;
  aetherFlowRivers = Array.from({ length: count }, (_, index) => createAetherFlowRiver(index, seed));
}

function rethreadAetherFlowRivers(detail = {}) {
  if (!width || !height) return;
  if (!aetherFlowRivers.length) {
    resetAetherFlowRivers(detail);
    return;
  }

  const seed = String(detail?.to ?? detail?.from ?? detail?.source ?? 'route').length;
  aetherFlowRivers.forEach((river, index) => {
    river.phase += 0.46 + seed * 0.018 + index * 0.09;
    river.lane = Math.max(0.08, Math.min(0.92, river.lane + Math.sin(seed + index) * 0.018));
    river.packet = (river.packet + 0.16 + index * 0.035) % 1;
    if (index % 2 === seed % 2) river.speed *= -1;
  });
}

function resetAetherViscousCurrents(detail = {}) {
  if (!width || !height) return;
  const seed = String(detail?.to ?? detail?.from ?? detail?.source ?? 'viscous').length;
  const count = Math.min(AETHER_VISCOUS_CURRENT_COUNT, Math.max(width < 760 ? 3 : 5, Math.floor((width * height) / 180000)));
  aetherViscousCurrents = Array.from({ length: count }, (_, index) => createAetherViscousCurrent(index, seed));
  aetherViscousCurrentEnergy = Math.min(1, aetherViscousCurrentEnergy + 0.18);
}

function energizeAetherViscousCurrents(detail = {}) {
  if (prefersReducedMotion || isAetherFlowPaused() || !width || !height) return;
  if (!aetherViscousCurrents.length) resetAetherViscousCurrents(detail);

  const level = Math.max(0, Math.min(1, Number(detail.level ?? detail.energy ?? 0.44)));
  if (level < 0.035) return;
  const seed = String(detail.selector ?? detail.source ?? 'audio').length;
  aetherViscousCurrentEnergy = Math.min(1, aetherViscousCurrentEnergy + level * 0.32);
  aetherViscousCurrents.forEach((current, index) => {
    current.phase += 0.08 + level * 0.14 + index * 0.015;
    current.packet = (current.packet + 0.05 + level * 0.08 + seed * 0.003) % 1;
    current.lane = Math.max(0.07, Math.min(0.93, current.lane + Math.sin(seed + index * 1.7) * level * 0.008));
  });
}

function rethreadAetherAdaptiveMesh(detail = {}) {
  if (!width || !height) return;
  if (!aetherAdaptiveMeshParticles.length) {
    resetAetherAdaptiveMesh(detail);
    return;
  }

  const seed = String(detail?.to ?? detail?.from ?? detail?.source ?? 'route').length;
  aetherAdaptiveMeshParticles.forEach((particle, index) => {
    const angle = seed * 0.31 + index * 0.77;
    particle.vx += Math.cos(angle) * 0.045;
    particle.vy += Math.sin(angle) * 0.032;
    particle.phase += 0.28 + (index % 5) * 0.04;
  });
  aetherAdaptiveMeshEnergy = Math.min(1, aetherAdaptiveMeshEnergy + 0.28);
}

function energizeAetherAdaptiveMesh(detail = {}) {
  if (prefersReducedMotion || isAetherFlowPaused() || !width || !height) return;
  const level = Math.max(0, Math.min(1, Number(detail.level ?? detail.energy ?? 0.42)));
  if (level < 0.04) return;
  aetherAdaptiveMeshEnergy = Math.min(1, aetherAdaptiveMeshEnergy + level * 0.34);
}

function energizeAetherComponentFlow(detail = {}) {
  if (prefersReducedMotion || isAetherFlowPaused() || !width || !height) return;
  if (!aetherComponentFlowParticles.length) resetAetherComponentFlowNetwork(detail);

  const level = Math.max(0, Math.min(1, Number(detail.level ?? detail.energy ?? 0.42)));
  if (level < 0.035) return;
  aetherComponentFlowEnergy = Math.min(1, aetherComponentFlowEnergy + level * 0.32);

  if (detail.source === 'surface-hover' || detail.to || detail.selector) {
    aetherComponentFlowTargets = collectAetherComponentFlowTargets();
  }

  aetherComponentFlowParticles.forEach((particle, index) => {
    const target = aetherComponentFlowTargets[(particle.targetIndex + index) % Math.max(1, aetherComponentFlowTargets.length)];
    if (target && index % 5 === 0) {
      particle.homeX = target.x + Math.sin(particle.phase + index) * Math.min(80, target.width * 0.2);
      particle.homeY = target.y + Math.cos(particle.phase + index) * Math.min(56, target.height * 0.22);
    }
    particle.phase += 0.11 + level * 0.18;
  });
}

function collectAetherFlowSurfaces() {
  if (!width || !height || typeof document === 'undefined') return [];

  const seen = new Set();
  return Array.from(document.querySelectorAll(AETHER_FLOW_SURFACE_SELECTOR))
    .map((node, index) => {
      if (!node || seen.has(node)) return null;
      seen.add(node);

      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      if (rect.bottom < -60 || rect.top > height + 60 || rect.right < -60 || rect.left > width + 60) return null;

      const style = globalThis.getComputedStyle?.(node);
      if (style?.display === 'none' || style?.visibility === 'hidden' || Number(style?.opacity ?? 1) < 0.04) return null;

      const priority = node.matches('.dashboard-hero, .hero-sound-visual, .sound-lab-workbench, .workbench-panel')
        ? 1.25
        : node.matches('button, .hero-capsule-cta, .signal-node')
          ? 1.05
          : 0.86;

      return {
        key: `${node.className || node.tagName}-${index}`,
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.5,
        width: rect.width,
        height: rect.height,
        priority,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority);
}

function createAetherSurfaceThread(from, to, index = 0, seed = 0) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.max(80, Math.hypot(dx, dy));
  const direction = index % 2 === 0 ? 1 : -1;

  return {
    from: { ...from },
    to: { ...to },
    phase: random(0, Math.PI * 2) + seed * 0.12,
    packet: random(0, 1),
    speed: random(0.000026, 0.000058) * direction,
    curve: random(-0.18, 0.18) * distance + Math.sin(seed + index) * 18,
    wobble: random(5, 18),
    z: random(0.34, 0.94),
    width: random(0.42, 1.15),
    color: index % 3 === 0 ? '117, 197, 222' : index % 3 === 1 ? '167, 139, 250' : '94, 234, 212',
  };
}

function refreshAetherSurfaceThreads(detail = {}) {
  if (!width || !height) return;

  const seed = String(detail?.to ?? detail?.from ?? detail?.source ?? 'thread').length;
  const surfaces = collectAetherFlowSurfaces();
  const anchors = surfaces.length >= 2 ? surfaces : [
    { key: 'fallback-left', x: width * 0.18, y: height * 0.28, width: 180, height: 120, priority: 0.8 },
    { key: 'fallback-core', x: width * 0.58, y: height * 0.46, width: 260, height: 180, priority: 1 },
    { key: 'fallback-right', x: width * 0.82, y: height * 0.68, width: 180, height: 120, priority: 0.8 },
  ];
  const targetCount = Math.min(
    AETHER_SURFACE_THREAD_MAX,
    Math.max(width < 760 ? 4 : 7, Math.floor(anchors.length * 1.25)),
  );

  aetherSurfaceThreads = Array.from({ length: targetCount }, (_, index) => {
    const from = anchors[(index + seed) % anchors.length];
    let to = anchors[(index * 2 + seed + 3) % anchors.length];
    if (to === from) to = anchors[(index + seed + 1) % anchors.length];
    return createAetherSurfaceThread(from, to, index, seed);
  });
  aetherSurfaceThreadEnergy = Math.min(1, aetherSurfaceThreadEnergy + 0.2);
}

function energizeAetherSurfaceThreads(detail = {}) {
  if (prefersReducedMotion || isAetherFlowPaused() || !width || !height) return;
  if (!aetherSurfaceThreads.length) refreshAetherSurfaceThreads(detail);

  const level = Math.max(0, Math.min(1, Number(detail.level ?? detail.energy ?? 0.45)));
  aetherSurfaceThreadEnergy = Math.min(1, aetherSurfaceThreadEnergy + 0.18 + level * 0.3);
  const point = detail.selector ? getAetherPulsePoint(detail) : null;

  aetherSurfaceThreads.forEach((thread, index) => {
    thread.phase += 0.14 + level * 0.18 + index * 0.018;
    thread.packet = (thread.packet + 0.08 + level * 0.11 + index * 0.01) % 1;
    if (point && index % 3 === 0) {
      thread.to = { key: 'audio-focus', x: point.x, y: point.y, width: 120, height: 80, priority: 1.15 };
    }
  });
}

function getAetherSurfaceThreadPoint(thread, progress, time, phaseOffset = 0) {
  const eased = progress * progress * (3 - progress * 2);
  const inv = 1 - eased;
  const midX = (thread.from.x + thread.to.x) * 0.5;
  const midY = (thread.from.y + thread.to.y) * 0.5;
  const dx = thread.to.x - thread.from.x;
  const dy = thread.to.y - thread.from.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const breath = Math.sin(time * 0.00046 + thread.phase + phaseOffset) * thread.wobble;
  const controlX = midX + normalX * (thread.curve + breath) + pointer.x * thread.z * 20;
  const controlY = midY + normalY * (thread.curve * 0.56 + breath * 0.8) + pointer.y * thread.z * 14;
  const x = inv * inv * thread.from.x + 2 * inv * eased * controlX + eased * eased * thread.to.x;
  const y = inv * inv * thread.from.y + 2 * inv * eased * controlY + eased * eased * thread.to.y;
  return aetherRepel(x, y, thread.z);
}

function getAetherFilamentPoint(filament, progress, time) {
  const easedProgress = progress * progress * (3 - progress * 2);
  const direction = filament.speed >= 0 ? 1 : -1;
  const x = direction > 0
    ? -100 + easedProgress * (width + 200)
    : width + 100 - easedProgress * (width + 200);
  const phase = filament.phase + time * filament.speed + progress * filament.frequency * Math.PI * 2;
  const laneY = height * Math.max(0.08, Math.min(0.92, filament.lane + filament.offset));
  const y = laneY
    + Math.sin(phase) * filament.amplitude
    + Math.sin(phase * 0.47 + filament.phase) * filament.secondaryAmplitude
    + pointer.y * filament.z * 16;
  return aetherRepel(x + pointer.x * filament.z * 24, y, filament.z);
}

function spawnCursorWake(x, y, time = performance.now()) {
  if (prefersReducedMotion || isAetherFlowPaused() || !width || !height) return;
  const dx = x - cursorWakeAnchor.x;
  const dy = y - cursorWakeAnchor.y;
  const distance = Math.hypot(dx, dy);
  if (cursorWakeAnchor.time && (distance < AETHER_WAKE_MIN_DISTANCE || time - cursorWakeAnchor.time < AETHER_WAKE_MIN_MS)) return;

  const speedX = cursorWakeAnchor.time ? dx * 0.012 : 0;
  const speedY = cursorWakeAnchor.time ? dy * 0.012 : 0;
  const count = width < 760 ? 1 : 2;

  for (let index = 0; index < count; index += 1) {
    const angle = Math.atan2(dy || random(-1, 1), dx || random(-1, 1)) + random(-0.86, 0.86);
    const lift = random(0.18, 0.72);
    cursorWakeParticles.push({
      x: x + random(-6, 6),
      y: y + random(-6, 6),
      vx: -speedX * random(0.16, 0.42) + Math.cos(angle + Math.PI) * lift,
      vy: -speedY * random(0.16, 0.42) + Math.sin(angle + Math.PI) * lift,
      age: 0,
      ttl: random(0.58, 1.05),
      r: random(0.9, 2.35),
      phase: random(0, Math.PI * 2),
      color: index % 2 === 0 ? '117, 197, 222' : '167, 139, 250',
    });
  }

  if (cursorWakeParticles.length > AETHER_WAKE_MAX_PARTICLES) {
    cursorWakeParticles.splice(0, cursorWakeParticles.length - AETHER_WAKE_MAX_PARTICLES);
  }

  cursorWakeAnchor.x = x;
  cursorWakeAnchor.y = y;
  cursorWakeAnchor.time = time;
}

function spawnAetherPressurePulse(x = pointer.screenX, y = pointer.screenY, detail = {}) {
  if (prefersReducedMotion || isAetherFlowPaused() || !width || !height) return;
  aetherPressurePulses.push({
    x,
    y,
    age: 0,
    ttl: detail.ttl ?? random(0.95, 1.45),
    radius: detail.radius ?? random(AETHER_PRESSURE_RADIUS * 0.55, AETHER_PRESSURE_RADIUS),
    strength: detail.strength ?? random(0.45, 0.86),
    phase: random(0, Math.PI * 2),
    hue: detail.hue ?? (aetherPressurePulses.length % 3 === 0 ? 'violet' : aetherPressurePulses.length % 2 === 0 ? 'green' : 'cyan'),
  });

  if (aetherPressurePulses.length > AETHER_PRESSURE_MAX_PULSES) {
    aetherPressurePulses.splice(0, aetherPressurePulses.length - AETHER_PRESSURE_MAX_PULSES);
  }
}

function getAetherPulsePoint(detail = {}) {
  const selector = detail.selector;
  const surface = selector ? document.querySelector(selector) : null;
  if (surface) {
    const rect = surface.getBoundingClientRect();
    if (rect.width && rect.height) {
      return {
        x: rect.left + rect.width * 0.54,
        y: rect.top + rect.height * 0.5,
      };
    }
  }

  const seed = String(detail.to ?? detail.from ?? detail.source ?? 'audio').length;
  return {
    x: width * (0.34 + (seed % 5) * 0.075),
    y: height * (0.32 + (seed % 4) * 0.105),
  };
}

function spawnAetherAudioRipple(detail = {}) {
  if (prefersReducedMotion || isAetherFlowPaused() || !width || !height) return;

  const now = globalThis.performance?.now?.() ?? Date.now();
  const level = Math.max(0, Math.min(1, Number(detail.level ?? detail.energy ?? 0.56)));
  if (level < 0.055) return;
  if (now - lastAetherAudioRippleTime < AETHER_AUDIO_RIPPLE_MIN_MS && level < 0.78) return;

  lastAetherAudioRippleTime = now;
  const point = getAetherPulsePoint(detail);
  const seed = String(detail.to ?? detail.from ?? detail.source ?? 'audio').length;
  const hue = detail.hue ?? (seed % 3 === 0 ? 'violet' : seed % 2 === 0 ? 'green' : 'cyan');

  aetherAudioRipples.push({
    x: point.x + random(-10, 10),
    y: point.y + random(-8, 8),
    vx: random(-0.18, 0.18),
    vy: random(-0.13, 0.13),
    age: 0,
    ttl: random(0.82, 1.35) + level * 0.42,
    level,
    radius: random(82, 156) + level * 118,
    phase: random(0, Math.PI * 2),
    hue,
  });

  if (aetherAudioRipples.length > AETHER_AUDIO_RIPPLE_MAX) {
    aetherAudioRipples.splice(0, aetherAudioRipples.length - AETHER_AUDIO_RIPPLE_MAX);
  }
}

function getAetherStreamPoint(stream, progress, time, phaseOffset = 0) {
  const x = -90 + progress * (width + 180);
  const phase = stream.phase + time * stream.speed + progress * stream.frequency + pointer.x * 0.45 + phaseOffset;
  const y = stream.baseY
    + Math.sin(phase) * stream.amplitude
    + Math.sin(phase * 0.43 + phaseOffset) * stream.amplitude * 0.38
    + pointer.y * stream.parallaxY;
  return aetherRepel(x + pointer.x * stream.parallaxX, y, stream.z);
}

function getAetherFlowRiverPoint(river, progress, time, phaseOffset = 0) {
  const easedProgress = progress * progress * (3 - progress * 2);
  const direction = river.speed >= 0 ? 1 : -1;
  const x = direction > 0
    ? -140 + easedProgress * (width + 280)
    : width + 140 - easedProgress * (width + 280);
  const laneY = height * Math.max(0.06, Math.min(0.94, river.lane));
  const phase = river.phase + time * river.speed + progress * river.frequency * Math.PI * 2 + phaseOffset;
  const y = laneY
    + Math.sin(phase) * river.amplitude
    + Math.sin(phase * 0.41 + phaseOffset) * river.secondaryAmplitude
    + pointer.y * river.z * 20;
  return aetherRepel(x + pointer.x * river.z * 30, y, river.z);
}

function getAetherViscousCurrentPoint(current, progress, time, phaseOffset = 0) {
  const easedProgress = progress * progress * (3 - progress * 2);
  const direction = current.speed >= 0 ? 1 : -1;
  const x = direction > 0
    ? -110 + easedProgress * (width + 220)
    : width + 110 - easedProgress * (width + 220);
  const laneY = height * Math.max(0.06, Math.min(0.94, current.lane));
  const phase = current.phase + time * current.speed + progress * current.frequency * Math.PI * 2 + phaseOffset;
  const drag = Math.sin(phase * 0.33 + current.viscosity) * current.amplitude * 0.42;
  const y = laneY
    + Math.sin(phase) * current.amplitude
    + Math.sin(phase * 0.56 + phaseOffset) * current.secondaryAmplitude
    + drag
    + pointer.y * current.z * (18 + current.viscosity * 12);
  return aetherRepel(x + pointer.x * current.z * (24 + current.viscosity * 18), y, current.z);
}

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

  const streamCount = width < 760 ? 3 : AETHER_STREAM_COUNT;
  aetherStreams = Array.from({ length: streamCount }, (_, index) => createAetherStream(index));
  const filamentCount = width < 760 ? 4 : AETHER_FLOW_FILAMENT_COUNT;
  aetherFlowFilaments = Array.from({ length: filamentCount }, (_, index) => createAetherFlowFilament(index));
  resetAetherFlowRivers();
  resetAetherViscousCurrents();
  refreshAetherSurfaceThreads();
  const packetCount = width < 760 ? 14 : AETHER_CURRENT_PACKET_COUNT;
  aetherCurrentPackets = Array.from({ length: packetCount }, (_, index) => createAetherCurrentPacket(index));
  const nodeCount = width < 760 ? 18 : AETHER_FLOW_NODE_COUNT;
  aetherFlowNodes = Array.from({ length: nodeCount }, (_, index) => createAetherFlowNode(index));
  const magneticLinkCount = width < 760 ? 6 : AETHER_MAGNETIC_LINK_COUNT;
  aetherMagneticLinks = Array.from({ length: magneticLinkCount }, (_, index) => createAetherMagneticLink(index));
  const orbitalFieldCount = width < 760 ? 3 : AETHER_ORBITAL_FIELD_COUNT;
  aetherOrbitalFields = Array.from({ length: orbitalFieldCount }, (_, index) => createAetherOrbitalField(index));
  const constellationCount = Math.min(AETHER_CONSTELLATION_COUNT, Math.max(width < 760 ? 24 : 44, Math.floor((width * height) / 23000)));
  aetherConstellationParticles = Array.from({ length: constellationCount }, (_, index) => createAetherConstellationParticle(index));
  resetAetherHeroFlowNetwork();
  resetAetherAdaptiveMesh();
  resetAetherComponentFlowNetwork();
  cursorWakeParticles = [];
  cursorWakeAnchor.x = pointer.screenX;
  cursorWakeAnchor.y = pointer.screenY;
  cursorWakeAnchor.time = 0;
  transitionBursts = [];
  aetherPressurePulses = [];
  aetherAudioRipples = [];
  lastAetherAudioRippleTime = 0;
  aetherAdaptiveMeshEnergy = 0;
  aetherComponentFlowEnergy = 0;
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
  const flow = aetherRepel(baseX, baseY, particle.z);
  const mouseInfluence = flow.force;

  ctx.beginPath();
  ctx.fillStyle = `rgba(${color}, ${0.08 + pulse * 0.12 + mouseInfluence * 0.09})`;
  ctx.arc(flow.x, flow.y, particle.r + mouseInfluence * 0.85, 0, Math.PI * 2);
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
      if (distance > AETHER_CONNECTION_RADIUS) continue;

      const aFlow = aetherRepel(a.x + pointer.x * a.z * 12, a.y + pointer.y * a.z * 8, a.z);
      const bFlow = aetherRepel(b.x + pointer.x * b.z * 12, b.y + pointer.y * b.z * 8, b.z);
      const midpointDistance = Math.hypot((aFlow.x + bFlow.x) * 0.5 - pointer.screenX, (aFlow.y + bFlow.y) * 0.5 - pointer.screenY);
      const mouseInfluence = Math.max(aFlow.force, bFlow.force, Math.max(0, 1 - midpointDistance / AETHER_MOUSE_RADIUS));
      const shimmer = 0.012 + Math.sin(time * 0.0012 + i) * 0.006;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(110, 231, 249, ${0.026 * (1 - distance / AETHER_CONNECTION_RADIUS) + mouseInfluence * 0.048 + shimmer})`;
      ctx.lineWidth = 0.7;
      ctx.moveTo(aFlow.x, aFlow.y);
      ctx.lineTo(bFlow.x, bFlow.y);
      ctx.stroke();
    }
  }
}

function drawAetherFlowWeb(time) {
  if (isAetherFlowPaused()) return;
  const stride = width < 760 ? AETHER_WEB_STRIDE + 4 : AETHER_WEB_STRIDE;
  const radius = width < 760 ? AETHER_CONNECTION_RADIUS * 0.82 : AETHER_CONNECTION_RADIUS;

  for (let i = 0; i < particles.length; i += stride) {
    const a = particles[i];
    if (!a) continue;
    const aFlow = aetherRepel(a.x + pointer.x * a.z * 20, a.y + pointer.y * a.z * 14, a.z);

    for (let j = i + stride; j < particles.length; j += stride * 2) {
      const b = particles[j];
      if (!b) continue;
      const bFlow = aetherRepel(b.x + pointer.x * b.z * 20, b.y + pointer.y * b.z * 14, b.z);
      const distance = Math.hypot(aFlow.x - bFlow.x, aFlow.y - bFlow.y);
      if (distance > radius) continue;

      const influence = Math.max(aFlow.force, bFlow.force);
      const alpha = Math.min(0.12, 0.018 * (1 - distance / radius) + influence * 0.082);
      if (alpha < 0.006) continue;

      const curve = Math.sin(time * 0.0007 + i * 0.31 + j * 0.07) * 14 * (0.5 + influence);
      const midX = (aFlow.x + bFlow.x) * 0.5 + pointer.x * curve;
      const midY = (aFlow.y + bFlow.y) * 0.5 + pointer.y * curve * 0.72;
      const hue = influence > 0.18 ? '167, 139, 250' : '117, 197, 222';

      ctx.beginPath();
      ctx.strokeStyle = `rgba(${hue}, ${alpha})`;
      ctx.lineWidth = 0.55 + influence * 0.58;
      ctx.moveTo(aFlow.x, aFlow.y);
      ctx.quadraticCurveTo(midX, midY, bFlow.x, bFlow.y);
      ctx.stroke();
    }
  }
}

function drawAetherStreamRibbons(time) {
  if (prefersReducedMotion || isAetherFlowPaused()) return;

  aetherStreams.forEach((stream, streamIndex) => {
    const gradient = ctx.createLinearGradient(0, stream.baseY, width, stream.baseY + stream.amplitude);
    const pulse = 0.55 + Math.sin(time * 0.00065 + stream.phase) * 0.28;
    gradient.addColorStop(0, `rgba(${stream.color}, 0)`);
    gradient.addColorStop(0.28, `rgba(${stream.color}, ${0.018 + pulse * 0.018})`);
    gradient.addColorStop(0.56, `rgba(255, 255, 255, ${0.012 + stream.z * 0.014})`);
    gradient.addColorStop(0.82, `rgba(${stream.color}, ${0.016 + pulse * 0.014})`);
    gradient.addColorStop(1, `rgba(${stream.color}, 0)`);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    for (let segment = 0; segment <= AETHER_STREAM_SEGMENTS; segment += 1) {
      const progress = segment / AETHER_STREAM_SEGMENTS;
      const flow = getAetherStreamPoint(stream, progress, time, streamIndex);
      if (segment === 0) ctx.moveTo(flow.x, flow.y);
      else ctx.lineTo(flow.x, flow.y);
    }
    ctx.strokeStyle = gradient;
    ctx.lineWidth = stream.width;
    ctx.shadowColor = `rgba(${stream.color}, 0.08)`;
    ctx.shadowBlur = 12 * stream.z;
    ctx.stroke();
    ctx.restore();
  });
}

function drawAetherCurrentPackets(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherStreams.length) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  aetherCurrentPackets.forEach((packet) => {
    const stream = aetherStreams[packet.streamIndex % aetherStreams.length];
    if (!stream) return;
    packet.progress = (packet.progress + packet.speed * (15 + packet.z * 12)) % 1;
    const head = getAetherStreamPoint(stream, packet.progress, time, packet.phase * 0.08);
    const tailProgress = Math.max(0, packet.progress - packet.trail);
    const tail = getAetherStreamPoint(stream, tailProgress, time, packet.phase * 0.08);
    const mousePulse = Math.max(head.force, tail.force);
    const pulse = 0.55 + Math.sin(time * 0.002 + packet.phase) * 0.22 + mousePulse * 0.3;
    const gradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
    gradient.addColorStop(0, `rgba(${packet.color}, 0)`);
    gradient.addColorStop(0.62, `rgba(${packet.color}, ${0.05 + pulse * 0.08})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${0.09 + mousePulse * 0.14})`);

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 0.65 + packet.z * 1.15 + mousePulse * 0.8;
    ctx.shadowColor = `rgba(${packet.color}, ${0.12 + mousePulse * 0.16})`;
    ctx.shadowBlur = 10 + packet.z * 8;
    ctx.moveTo(tail.x, tail.y);
    ctx.quadraticCurveTo(
      (tail.x + head.x) * 0.5 + pointer.x * 18 * packet.z,
      (tail.y + head.y) * 0.5 + pointer.y * 12 * packet.z,
      head.x,
      head.y,
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = `rgba(${packet.color}, ${0.12 + pulse * 0.14})`;
    ctx.arc(head.x, head.y, 1.2 + packet.z * 1.3 + mousePulse * 0.9, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawCursorFlowWake(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !cursorWakeParticles.length) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  cursorWakeParticles = cursorWakeParticles.filter((particle) => particle.age < particle.ttl);
  cursorWakeParticles.forEach((particle) => {
    particle.age += 0.016;
    particle.x += particle.vx + pointer.x * 0.04;
    particle.y += particle.vy + pointer.y * 0.035;
    particle.vx *= 0.986;
    particle.vy *= 0.986;
    const life = Math.max(0, 1 - particle.age / particle.ttl);
    const pulse = 0.62 + Math.sin(time * 0.004 + particle.phase) * 0.22;
    const tailX = particle.x - particle.vx * (18 + life * 16);
    const tailY = particle.y - particle.vy * (18 + life * 16);
    const gradient = ctx.createLinearGradient(tailX, tailY, particle.x, particle.y);
    gradient.addColorStop(0, `rgba(${particle.color}, 0)`);
    gradient.addColorStop(0.58, `rgba(${particle.color}, ${life * 0.09})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${life * 0.13})`);

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 0.7 + particle.r * 0.36;
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(particle.x, particle.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = `rgba(${particle.color}, ${life * (0.12 + pulse * 0.12)})`;
    ctx.arc(particle.x, particle.y, particle.r * (0.62 + life * 0.52), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function aetherNodeConnections(flowNodes, time) {
  for (let i = 0; i < flowNodes.length; i += 1) {
    const a = flowNodes[i];
    for (let j = i + 1; j < flowNodes.length; j += 1) {
      const b = flowNodes[j];
      const distance = Math.hypot(a.viewX - b.viewX, a.viewY - b.viewY);
      if (distance > AETHER_NODE_CONNECTION_RADIUS) continue;

      const midpointDistance = Math.hypot(
        (a.viewX + b.viewX) * 0.5 - pointer.screenX,
        (a.viewY + b.viewY) * 0.5 - pointer.screenY,
      );
      const pointerBoost = Math.max(0, 1 - midpointDistance / (AETHER_MOUSE_RADIUS * 1.08));
      const phase = 0.55 + Math.sin(time * 0.0011 + a.phase + b.phase) * 0.22;
      const alpha = Math.min(0.16, (1 - distance / AETHER_NODE_CONNECTION_RADIUS) * 0.045 + pointerBoost * 0.095 + phase * 0.012);
      if (alpha < 0.01) continue;

      const gradient = ctx.createLinearGradient(a.viewX, a.viewY, b.viewX, b.viewY);
      gradient.addColorStop(0, `rgba(${a.color}, 0)`);
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.78})`);
      gradient.addColorStop(1, `rgba(${b.color}, ${alpha})`);

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.42 + pointerBoost * 0.62;
      ctx.moveTo(a.viewX, a.viewY);
      ctx.quadraticCurveTo(
        (a.viewX + b.viewX) * 0.5 + pointer.x * 22,
        (a.viewY + b.viewY) * 0.5 + pointer.y * 14,
        b.viewX,
        b.viewY,
      );
      ctx.stroke();
    }
  }
}

function drawAetherNodeCurrents(time) {
  if (prefersReducedMotion || isAetherFlowPaused()) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const flowNodes = aetherFlowNodes.map((node) => {
    node.x += node.vx * (0.64 + node.z);
    node.y += node.vy * (0.54 + node.z);
    node.phase += 0.0024;
    if (node.x < -24) node.x = width + 24;
    if (node.x > width + 24) node.x = -24;
    if (node.y < -24) node.y = height + 24;
    if (node.y > height + 24) node.y = -24;

    const driftX = Math.sin(time * 0.00021 + node.phase) * 18 * node.z;
    const driftY = Math.cos(time * 0.00017 + node.phase * 0.8) * 13 * node.z;
    const flow = aetherRepel(
      node.x + driftX + pointer.x * node.z * 20,
      node.y + driftY + pointer.y * node.z * 15,
      node.z,
    );
    node.viewX = flow.x;
    node.viewY = flow.y;
    node.force = flow.force;
    return node;
  });

  aetherNodeConnections(flowNodes, time);

  flowNodes.forEach((node) => {
    const pulse = 0.56 + Math.sin(time * 0.0018 + node.phase) * 0.24 + node.force * 0.3;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${node.color}, ${0.1 + pulse * 0.14})`;
    ctx.shadowColor = `rgba(${node.color}, ${0.12 + node.force * 0.18})`;
    ctx.shadowBlur = 8 + node.z * 9;
    ctx.arc(node.viewX, node.viewY, node.r + node.force * 1.2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawAetherMagneticLinks(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherMagneticLinks.length) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  aetherMagneticLinks.forEach((link, linkIndex) => {
    link.lane += link.drift * (0.72 + link.z * 0.32);
    if (link.lane < 0.08) link.lane = 0.92;
    if (link.lane > 0.94) link.lane = 0.1;

    const pulse = 0.52 + Math.sin(time * 0.0012 + link.phase) * 0.24;
    const gradient = ctx.createLinearGradient(0, height * link.lane, width, height * link.lane);
    gradient.addColorStop(0, `rgba(${link.color}, 0)`);
    gradient.addColorStop(0.28, `rgba(${link.color}, ${0.026 + pulse * 0.018})`);
    gradient.addColorStop(0.55, `rgba(255, 255, 255, ${0.018 + link.z * 0.02})`);
    gradient.addColorStop(0.82, `rgba(${link.color}, ${0.026 + pulse * 0.016})`);
    gradient.addColorStop(1, `rgba(${link.color}, 0)`);

    ctx.beginPath();
    for (let segment = 0; segment <= AETHER_MAGNETIC_SEGMENTS; segment += 1) {
      const progress = segment / AETHER_MAGNETIC_SEGMENTS;
      const x = -80 + progress * (width + 160);
      const phase = link.phase + time * link.speed + progress * link.frequency * Math.PI * 2 + linkIndex * 0.3;
      const y = height * link.lane
        + Math.sin(phase) * link.amplitude
        + Math.sin(phase * 0.37 + linkIndex) * link.amplitude * 0.22
        + pointer.y * link.z * 18;
      const flow = aetherRepel(x + pointer.x * link.z * 26, y, link.z);
      if (segment === 0) ctx.moveTo(flow.x, flow.y);
      else ctx.lineTo(flow.x, flow.y);
    }

    ctx.strokeStyle = gradient;
    ctx.lineWidth = link.width + pulse * 0.36;
    ctx.shadowColor = `rgba(${link.color}, ${0.08 + pulse * 0.05})`;
    ctx.shadowBlur = 8 + link.z * 8;
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawAetherOrbitalCurrents(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherOrbitalFields.length) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  aetherOrbitalFields.forEach((field, fieldIndex) => {
    const centerX = width * field.anchorX + pointer.x * field.parallaxX;
    const centerY = height * field.anchorY + pointer.y * field.parallaxY;
    const phase = field.phase + time * field.speed;
    const lift = 0.6 + Math.sin(time * 0.0007 + field.phase) * 0.18;

    ctx.beginPath();
    for (let segment = 0; segment <= AETHER_ORBITAL_SEGMENTS; segment += 1) {
      const progress = segment / AETHER_ORBITAL_SEGMENTS;
      const angle = progress * Math.PI * 2 + phase;
      const warp = 1 + Math.sin(angle * 2.2 + time * 0.00036 + fieldIndex) * 0.055;
      const orbitalX = Math.cos(angle) * field.radiusX * warp;
      const orbitalY = Math.sin(angle) * field.radiusY * warp;
      const x = centerX + orbitalX * Math.cos(field.tilt) - orbitalY * Math.sin(field.tilt);
      const y = centerY + orbitalX * Math.sin(field.tilt) + orbitalY * Math.cos(field.tilt);
      const flow = aetherRepel(x, y, field.z);
      if (segment === 0) ctx.moveTo(flow.x, flow.y);
      else ctx.lineTo(flow.x, flow.y);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(${field.color}, ${0.018 + field.z * 0.018})`;
    ctx.lineWidth = 0.48 + field.z * 0.72;
    ctx.shadowColor = `rgba(${field.color}, 0.08)`;
    ctx.shadowBlur = 10 + field.z * 10;
    ctx.stroke();

    const packetProgress = ((time * Math.abs(field.speed) * 0.42 + field.phase) % (Math.PI * 2)) / (Math.PI * 2);
    const tail = 0.12 + field.z * 0.045;
    ctx.beginPath();
    for (let segment = 0; segment <= 18; segment += 1) {
      const localProgress = packetProgress - tail + (segment / 18) * tail;
      const angle = localProgress * Math.PI * 2 + phase;
      const warp = 1 + Math.sin(angle * 2.2 + time * 0.00036 + fieldIndex) * 0.055;
      const orbitalX = Math.cos(angle) * field.radiusX * warp;
      const orbitalY = Math.sin(angle) * field.radiusY * warp;
      const x = centerX + orbitalX * Math.cos(field.tilt) - orbitalY * Math.sin(field.tilt);
      const y = centerY + orbitalX * Math.sin(field.tilt) + orbitalY * Math.cos(field.tilt);
      const flow = aetherRepel(x, y, field.z);
      if (segment === 0) ctx.moveTo(flow.x, flow.y);
      else ctx.lineTo(flow.x, flow.y);
    }
    ctx.strokeStyle = `rgba(${field.color}, ${0.09 + lift * 0.11})`;
    ctx.lineWidth = 1.1 + field.z * 1.15;
    ctx.shadowColor = `rgba(${field.color}, ${0.16 + lift * 0.12})`;
    ctx.shadowBlur = 14 + field.z * 14;
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawAetherConstellationMesh(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherConstellationParticles.length) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const driftScale = 0.62 + Math.sin(time * 0.00018) * 0.08;
  const flowNodes = aetherConstellationParticles.map((particle) => {
    particle.x += particle.vx * (0.42 + particle.z) * driftScale;
    particle.y += particle.vy * (0.36 + particle.z) * driftScale;
    particle.phase += 0.0018;

    if (particle.x < -26) particle.x = width + 26;
    if (particle.x > width + 26) particle.x = -26;
    if (particle.y < -26) particle.y = height + 26;
    if (particle.y > height + 26) particle.y = -26;

    const currentX = Math.sin(time * 0.00016 + particle.phase) * 16 * particle.z;
    const currentY = Math.cos(time * 0.00013 + particle.phase * 0.74) * 11 * particle.z;
    const flow = aetherRepel(
      particle.x + currentX + pointer.x * particle.z * 18,
      particle.y + currentY + pointer.y * particle.z * 12,
      particle.z,
    );

    particle.viewX = flow.x;
    particle.viewY = flow.y;
    particle.force = flow.force;
    return particle;
  });

  const radius = width < 760 ? AETHER_CONSTELLATION_RADIUS * 0.72 : AETHER_CONSTELLATION_RADIUS;
  for (let i = 0; i < flowNodes.length; i += AETHER_CONSTELLATION_STRIDE) {
    const a = flowNodes[i];
    for (let j = i + AETHER_CONSTELLATION_STRIDE; j < flowNodes.length; j += AETHER_CONSTELLATION_STRIDE) {
      const b = flowNodes[j];
      const distance = Math.hypot(a.viewX - b.viewX, a.viewY - b.viewY);
      if (distance > radius) continue;

      const midpointDistance = Math.hypot(
        (a.viewX + b.viewX) * 0.5 - pointer.screenX,
        (a.viewY + b.viewY) * 0.5 - pointer.screenY,
      );
      const pointerBoost = Math.max(0, 1 - midpointDistance / (AETHER_MOUSE_RADIUS * 1.18)) * pointer.force;
      const shimmer = 0.54 + Math.sin(time * 0.001 + a.phase + b.phase) * 0.2;
      const alpha = Math.min(0.15, 0.018 * (1 - distance / radius) + pointerBoost * 0.1 + shimmer * 0.012);
      if (alpha < 0.01) continue;

      const gradient = ctx.createLinearGradient(a.viewX, a.viewY, b.viewX, b.viewY);
      gradient.addColorStop(0, `rgba(${a.color}, 0)`);
      gradient.addColorStop(0.48, `rgba(255, 255, 255, ${alpha * 0.55})`);
      gradient.addColorStop(1, `rgba(${b.color}, ${alpha})`);

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.34 + pointerBoost * 0.72;
      ctx.moveTo(a.viewX, a.viewY);
      ctx.quadraticCurveTo(
        (a.viewX + b.viewX) * 0.5 + pointer.x * 18,
        (a.viewY + b.viewY) * 0.5 + pointer.y * 12,
        b.viewX,
        b.viewY,
      );
      ctx.stroke();
    }
  }

  flowNodes.forEach((particle) => {
    const pulse = 0.5 + Math.sin(time * 0.0016 + particle.phase) * 0.22 + particle.force * 0.3;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${particle.color}, ${0.075 + pulse * 0.1})`;
    ctx.shadowColor = `rgba(${particle.color}, ${0.08 + particle.force * 0.14})`;
    ctx.shadowBlur = 5 + particle.z * 7;
    ctx.arc(particle.viewX, particle.viewY, particle.r + particle.force * 0.9, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawAetherAdaptiveMesh(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherAdaptiveMeshParticles.length) return;

  aetherAdaptiveMeshEnergy *= 0.94;
  if (aetherAdaptiveMeshEnergy < 0.004) aetherAdaptiveMeshEnergy = 0;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const flowParticles = aetherAdaptiveMeshParticles.map((particle) => {
    const breathing = 0.68 + Math.sin(time * 0.00026 + particle.phase) * 0.08;
    particle.x += particle.vx * (0.62 + particle.z * 0.52) * breathing + pointer.x * particle.z * 0.012;
    particle.y += particle.vy * (0.58 + particle.z * 0.44) * breathing + pointer.y * particle.z * 0.01;
    particle.phase += 0.0012 + aetherAdaptiveMeshEnergy * 0.0018;

    if (particle.x > width || particle.x < 0) particle.vx = -particle.vx;
    if (particle.y > height || particle.y < 0) particle.vy = -particle.vy;
    particle.x = Math.max(0, Math.min(width, particle.x));
    particle.y = Math.max(0, Math.min(height, particle.y));

    const driftX = Math.sin(time * 0.00018 + particle.phase) * 12 * particle.z;
    const driftY = Math.cos(time * 0.00016 + particle.phase * 0.64) * 8 * particle.z;
    const baseX = particle.x + driftX + pointer.x * particle.z * 16;
    const baseY = particle.y + driftY + pointer.y * particle.z * 11;
    const pointerDistance = Math.max(1, Math.hypot(baseX - pointer.screenX, baseY - pointer.screenY));
    const mouseRepel = Math.max(0, 1 - pointerDistance / AETHER_ADAPTIVE_MOUSE_RADIUS) * pointer.force;
    const repelX = ((baseX - pointer.screenX) / pointerDistance) * mouseRepel * (14 + particle.z * 16);
    const repelY = ((baseY - pointer.screenY) / pointerDistance) * mouseRepel * (10 + particle.z * 12);

    particle.viewX = baseX + repelX;
    particle.viewY = baseY + repelY;
    particle.mouseRepel = mouseRepel;
    return particle;
  });

  const radius = width < 760 ? AETHER_ADAPTIVE_MESH_RADIUS * 0.74 : AETHER_ADAPTIVE_MESH_RADIUS;
  for (let i = 0; i < flowParticles.length; i += AETHER_ADAPTIVE_MESH_STRIDE) {
    const a = flowParticles[i];
    for (let j = i + AETHER_ADAPTIVE_MESH_STRIDE; j < flowParticles.length; j += AETHER_ADAPTIVE_MESH_STRIDE) {
      const b = flowParticles[j];
      const distance = Math.hypot(a.viewX - b.viewX, a.viewY - b.viewY);
      if (distance > radius) continue;

      const linkStrength = Math.max(0, 1 - distance / radius);
      const mouseLift = Math.max(a.mouseRepel, b.mouseRepel);
      const pulse = 0.48 + Math.sin(time * 0.0012 + a.phase + b.phase) * 0.2;
      const alpha = Math.min(0.2, linkStrength * 0.034 + mouseLift * 0.12 + aetherAdaptiveMeshEnergy * 0.06 + pulse * 0.008);
      if (alpha < 0.009) continue;

      const midX = (a.viewX + b.viewX) * 0.5 + pointer.x * (14 + mouseLift * 18);
      const midY = (a.viewY + b.viewY) * 0.5 + pointer.y * (10 + mouseLift * 14);
      const gradient = ctx.createLinearGradient(a.viewX, a.viewY, b.viewX, b.viewY);
      gradient.addColorStop(0, `rgba(${a.color}, 0)`);
      gradient.addColorStop(0.48, `rgba(255, 255, 255, ${alpha * (0.42 + mouseLift * 0.28)})`);
      gradient.addColorStop(1, `rgba(${b.color}, ${alpha})`);

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.34 + mouseLift * 0.82 + aetherAdaptiveMeshEnergy * 0.18;
      ctx.moveTo(a.viewX, a.viewY);
      ctx.quadraticCurveTo(midX, midY, b.viewX, b.viewY);
      ctx.stroke();
    }
  }

  flowParticles.forEach((particle) => {
    const pulse = 0.52 + Math.sin(time * 0.0016 + particle.phase) * 0.2 + particle.mouseRepel * 0.34 + aetherAdaptiveMeshEnergy * 0.22;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${particle.color}, ${0.065 + pulse * 0.11})`;
    ctx.shadowColor = `rgba(${particle.color}, ${0.08 + particle.mouseRepel * 0.16 + aetherAdaptiveMeshEnergy * 0.1})`;
    ctx.shadowBlur = 5 + particle.z * 7 + particle.mouseRepel * 9;
    ctx.arc(particle.viewX, particle.viewY, particle.r + particle.mouseRepel * 1.12 + aetherAdaptiveMeshEnergy * 0.36, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
  ctx.restore();
}

function componentFlowPointerPressure(x, y, z = 1) {
  if (isAetherFlowPaused()) return { x, y, force: 0 };
  const dx = x - pointer.screenX;
  const dy = y - pointer.screenY;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const force = Math.max(0, 1 - distance / (AETHER_COMPONENT_FLOW_RADIUS * 1.18)) * pointer.force * z;
  const pressure = force * (8 + z * 18 + aetherComponentFlowEnergy * 12);

  return {
    x: x + (dx / distance) * pressure,
    y: y + (dy / distance) * pressure * 0.72,
    force,
  };
}

function drawAetherComponentFlowNetwork(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherComponentFlowParticles.length) return;

  aetherComponentFlowEnergy *= 0.935;
  if (aetherComponentFlowEnergy < 0.004) aetherComponentFlowEnergy = 0;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  const flowParticles = aetherComponentFlowParticles.map((particle, index) => {
    const target = aetherComponentFlowTargets[particle.targetIndex % Math.max(1, aetherComponentFlowTargets.length)];
    if (target && index % 3 === 0) {
      particle.homeX += (target.x - particle.homeX) * 0.0018;
      particle.homeY += (target.y - particle.homeY) * 0.0018;
    }

    const pullX = (particle.homeX - particle.x) * (0.0014 + particle.z * 0.0007);
    const pullY = (particle.homeY - particle.y) * (0.0012 + particle.z * 0.0006);
    particle.vx = (particle.vx + pullX) * 0.994;
    particle.vy = (particle.vy + pullY) * 0.994;
    particle.x += particle.vx * (0.54 + particle.z * 0.7) + Math.sin(time * 0.00018 + particle.phase) * 0.1;
    particle.y += particle.vy * (0.5 + particle.z * 0.62) + Math.cos(time * 0.00016 + particle.phase) * 0.08;
    particle.phase += 0.0014 + aetherComponentFlowEnergy * 0.0014;

    if (particle.x < -34) particle.x = width + 34;
    if (particle.x > width + 34) particle.x = -34;
    if (particle.y < -34) particle.y = height + 34;
    if (particle.y > height + 34) particle.y = -34;

    const driftX = Math.sin(time * 0.00022 + particle.phase * 0.73) * 16 * particle.z;
    const driftY = Math.cos(time * 0.00019 + particle.phase * 0.57) * 12 * particle.z;
    const pressure = componentFlowPointerPressure(
      particle.x + driftX + pointer.x * particle.z * 18,
      particle.y + driftY + pointer.y * particle.z * 13,
      particle.z,
    );

    particle.viewX = pressure.x;
    particle.viewY = pressure.y;
    particle.pointerPressure = pressure.force;
    return particle;
  });

  const radius = width < 760 ? AETHER_COMPONENT_FLOW_RADIUS * 0.72 : AETHER_COMPONENT_FLOW_RADIUS;
  for (let i = 0; i < flowParticles.length; i += AETHER_COMPONENT_FLOW_STRIDE) {
    const a = flowParticles[i];
    for (let j = i + AETHER_COMPONENT_FLOW_STRIDE; j < flowParticles.length; j += AETHER_COMPONENT_FLOW_STRIDE) {
      const b = flowParticles[j];
      const distance = Math.hypot(a.viewX - b.viewX, a.viewY - b.viewY);
      const activeRadius = radius + Math.max(a.pointerPressure, b.pointerPressure) * 72;
      if (distance > activeRadius) continue;

      const strength = Math.max(0, 1 - distance / activeRadius);
      const pressure = Math.max(a.pointerPressure, b.pointerPressure);
      const shimmer = 0.5 + Math.sin(time * 0.001 + a.phase + b.phase) * 0.22;
      const alpha = Math.min(0.18, strength * 0.035 + pressure * 0.1 + aetherComponentFlowEnergy * 0.055 + shimmer * 0.008);
      if (alpha < 0.008) continue;

      const gradient = ctx.createLinearGradient(a.viewX, a.viewY, b.viewX, b.viewY);
      gradient.addColorStop(0, `rgba(${a.color}, 0)`);
      gradient.addColorStop(0.48, `rgba(255, 255, 255, ${alpha * (0.48 + pressure * 0.28)})`);
      gradient.addColorStop(1, `rgba(${b.color}, ${alpha})`);

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.32 + pressure * 0.78 + aetherComponentFlowEnergy * 0.24;
      ctx.moveTo(a.viewX, a.viewY);
      ctx.quadraticCurveTo(
        (a.viewX + b.viewX) * 0.5 + pointer.x * (20 + pressure * 18),
        (a.viewY + b.viewY) * 0.5 + pointer.y * (14 + pressure * 14),
        b.viewX,
        b.viewY,
      );
      ctx.stroke();
    }
  }

  flowParticles.forEach((particle) => {
    const pulse = 0.5
      + Math.sin(time * 0.0015 + particle.phase) * 0.2
      + particle.pointerPressure * 0.3
      + aetherComponentFlowEnergy * 0.22;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${particle.color}, ${0.065 + pulse * 0.105})`;
    ctx.shadowColor = `rgba(${particle.color}, ${0.07 + particle.pointerPressure * 0.16 + aetherComponentFlowEnergy * 0.08})`;
    ctx.shadowBlur = 5 + particle.z * 8 + particle.pointerPressure * 8;
    ctx.arc(
      particle.viewX,
      particle.viewY,
      particle.r + particle.pointerPressure * 1.06 + aetherComponentFlowEnergy * 0.34,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  });

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawAetherHeroFlowNetwork(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherHeroFlowParticles.length) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const flowParticles = aetherHeroFlowParticles.map((particle) => {
    const homePullX = (particle.homeX - particle.x) * 0.0009;
    const homePullY = (particle.homeY - particle.y) * 0.0009;
    particle.vx = (particle.vx + homePullX) * 0.997;
    particle.vy = (particle.vy + homePullY) * 0.997;
    particle.x += particle.vx * (0.56 + particle.z) + Math.sin(time * 0.00018 + particle.phase) * 0.12;
    particle.y += particle.vy * (0.48 + particle.z) + Math.cos(time * 0.00015 + particle.phase) * 0.09;
    particle.phase += 0.0014;

    if (particle.x < -30) particle.x = width + 30;
    if (particle.x > width + 30) particle.x = -30;
    if (particle.y < -30) particle.y = height + 30;
    if (particle.y > height + 30) particle.y = -30;

    const orbitX = Math.sin(time * 0.00022 + particle.phase * 0.7) * 18 * particle.z;
    const orbitY = Math.cos(time * 0.00019 + particle.phase * 0.56) * 13 * particle.z;
    const rawX = particle.x + orbitX + pointer.x * particle.z * 18;
    const rawY = particle.y + orbitY + pointer.y * particle.z * 13;
    const pointerDistance = Math.hypot(rawX - pointer.screenX, rawY - pointer.screenY);
    const pointerBoost = Math.max(0, 1 - pointerDistance / AETHER_HERO_FLOW_RADIUS) * pointer.force;
    const flow = aetherRepel(rawX, rawY, particle.z);

    particle.viewX = flow.x;
    particle.viewY = flow.y;
    particle.pointerBoost = pointerBoost;
    return particle;
  });

  for (let i = 0; i < flowParticles.length; i += AETHER_HERO_FLOW_STRIDE) {
    const a = flowParticles[i];
    for (let j = i + AETHER_HERO_FLOW_STRIDE; j < flowParticles.length; j += AETHER_HERO_FLOW_STRIDE) {
      const b = flowParticles[j];
      const distance = Math.hypot(a.viewX - b.viewX, a.viewY - b.viewY);
      const activeRadius = AETHER_HERO_FLOW_CONNECTION_RADIUS + Math.max(a.pointerBoost, b.pointerBoost) * 68;
      if (distance > activeRadius) continue;

      const linkStrength = Math.max(0, 1 - distance / activeRadius);
      const glow = Math.max(a.pointerBoost, b.pointerBoost);
      const shimmer = 0.5 + Math.sin(time * 0.001 + a.phase + b.phase) * 0.22;
      const alpha = Math.min(0.18, linkStrength * 0.038 + glow * 0.11 + shimmer * 0.008);
      if (alpha < 0.01) continue;

      const gradient = ctx.createLinearGradient(a.viewX, a.viewY, b.viewX, b.viewY);
      gradient.addColorStop(0, `rgba(${a.color}, 0)`);
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.68})`);
      gradient.addColorStop(1, `rgba(${b.color}, ${alpha})`);

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.36 + glow * 0.82;
      ctx.moveTo(a.viewX, a.viewY);
      ctx.quadraticCurveTo(
        (a.viewX + b.viewX) * 0.5 + pointer.x * 24,
        (a.viewY + b.viewY) * 0.5 + pointer.y * 16,
        b.viewX,
        b.viewY,
      );
      ctx.stroke();
    }
  }

  flowParticles.forEach((particle) => {
    const pulse = 0.48 + Math.sin(time * 0.0015 + particle.phase) * 0.2 + particle.pointerBoost * 0.32;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${particle.color}, ${0.075 + pulse * 0.11})`;
    ctx.shadowColor = `rgba(${particle.color}, ${0.08 + particle.pointerBoost * 0.16})`;
    ctx.shadowBlur = 5 + particle.z * 7 + particle.pointerBoost * 9;
    ctx.arc(particle.viewX, particle.viewY, particle.r + particle.pointerBoost * 1.1, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawAetherLiquidFilaments(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherFlowFilaments.length) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  aetherFlowFilaments.forEach((filament, filamentIndex) => {
    filament.phase += filament.drift;
    filament.packet = (filament.packet + filament.packetSpeed * (18 + filament.z * 12)) % 1;

    let firstPoint = null;
    let previousPoint = null;
    ctx.beginPath();
    for (let segment = 0; segment <= AETHER_FLOW_FILAMENT_SEGMENTS; segment += 1) {
      const progress = segment / AETHER_FLOW_FILAMENT_SEGMENTS;
      const point = getAetherFilamentPoint(filament, progress, time + filamentIndex * 40);
      if (!firstPoint) firstPoint = point;
      previousPoint = point;
      if (segment === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }

    if (!firstPoint || !previousPoint) return;
    const gradient = ctx.createLinearGradient(firstPoint.x, firstPoint.y, previousPoint.x, previousPoint.y);
    const shimmer = 0.52 + Math.sin(time * 0.0007 + filament.phase) * 0.22;
    gradient.addColorStop(0, `rgba(${filament.color}, 0)`);
    gradient.addColorStop(0.42, `rgba(${filament.color}, ${0.035 + shimmer * 0.034})`);
    gradient.addColorStop(0.56, `rgba(255, 255, 255, ${0.018 + shimmer * 0.026})`);
    gradient.addColorStop(1, `rgba(${filament.color}, 0)`);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = filament.width + filament.z * 0.48;
    ctx.shadowColor = `rgba(${filament.color}, ${0.05 + shimmer * 0.04})`;
    ctx.shadowBlur = 5 + filament.z * 8;
    ctx.stroke();

    const head = getAetherFilamentPoint(filament, filament.packet, time + filamentIndex * 53);
    const tail = getAetherFilamentPoint(filament, Math.max(0, filament.packet - 0.038), time + filamentIndex * 53);
    const packetGradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
    packetGradient.addColorStop(0, `rgba(${filament.color}, 0)`);
    packetGradient.addColorStop(0.72, `rgba(${filament.color}, ${0.15 + shimmer * 0.12})`);
    packetGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
    ctx.beginPath();
    ctx.strokeStyle = packetGradient;
    ctx.lineWidth = 0.8 + filament.z * 0.78;
    ctx.moveTo(tail.x, tail.y);
    ctx.lineTo(head.x, head.y);
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawAetherFlowRivers(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherFlowRivers.length) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  aetherFlowRivers.forEach((river, riverIndex) => {
    river.phase += river.drift;
    river.packet = (river.packet + river.packetSpeed * (16 + river.z * 10)) % 1;

    let startPoint = null;
    let endPoint = null;
    ctx.beginPath();
    for (let segment = 0; segment <= AETHER_FLOW_RIVER_SEGMENTS; segment += 1) {
      const progress = segment / AETHER_FLOW_RIVER_SEGMENTS;
      const point = getAetherFlowRiverPoint(river, progress, time, riverIndex * 0.34);
      if (!startPoint) startPoint = point;
      endPoint = point;
      if (segment === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }

    if (!startPoint || !endPoint) return;
    const riverPulse = 0.54 + Math.sin(time * 0.00052 + river.phase) * 0.2;
    const gradient = ctx.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    gradient.addColorStop(0, `rgba(${river.color}, 0)`);
    gradient.addColorStop(0.22, `rgba(${river.color}, ${0.018 + riverPulse * 0.026})`);
    gradient.addColorStop(0.52, `rgba(255, 255, 255, ${0.012 + riverPulse * 0.018})`);
    gradient.addColorStop(0.78, `rgba(${river.color}, ${0.018 + riverPulse * 0.022})`);
    gradient.addColorStop(1, `rgba(${river.color}, 0)`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = river.width;
    ctx.shadowColor = `rgba(${river.color}, ${0.05 + riverPulse * 0.052})`;
    ctx.shadowBlur = 12 + river.z * 18;
    ctx.stroke();

    const head = getAetherFlowRiverPoint(river, river.packet, time, riverIndex * 0.34);
    const tail = getAetherFlowRiverPoint(river, Math.max(0, river.packet - 0.07), time, riverIndex * 0.34);
    const packetGradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
    packetGradient.addColorStop(0, `rgba(${river.color}, 0)`);
    packetGradient.addColorStop(0.62, `rgba(${river.color}, ${0.09 + riverPulse * 0.12})`);
    packetGradient.addColorStop(1, `rgba(255, 255, 255, ${0.12 + riverPulse * 0.12})`);

    ctx.beginPath();
    ctx.strokeStyle = packetGradient;
    ctx.lineWidth = Math.max(1.1, river.width * 0.28);
    ctx.moveTo(tail.x, tail.y);
    ctx.quadraticCurveTo(
      (tail.x + head.x) * 0.5 + pointer.x * 18 * river.z,
      (tail.y + head.y) * 0.5 + pointer.y * 12 * river.z,
      head.x,
      head.y,
    );
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawAetherViscousCurrents(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherViscousCurrents.length) return;

  aetherViscousCurrentEnergy *= 0.94;
  if (aetherViscousCurrentEnergy < 0.004) aetherViscousCurrentEnergy = 0;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  aetherViscousCurrents.forEach((current, currentIndex) => {
    current.phase += current.drift;
    current.packet = (current.packet + current.packetSpeed * (14 + current.z * 10)) % 1;
    const packet = current.packet < 0 ? current.packet + 1 : current.packet;
    const pulse = 0.48
      + Math.sin(time * 0.00048 + current.phase) * 0.2
      + aetherViscousCurrentEnergy * 0.22;

    let startPoint = null;
    let endPoint = null;
    ctx.beginPath();
    for (let segment = 0; segment <= AETHER_VISCOUS_CURRENT_SEGMENTS; segment += 1) {
      const progress = segment / AETHER_VISCOUS_CURRENT_SEGMENTS;
      const point = getAetherViscousCurrentPoint(current, progress, time, currentIndex * 0.27);
      if (!startPoint) startPoint = point;
      endPoint = point;
      if (segment === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }

    if (!startPoint || !endPoint) return;
    const gradient = ctx.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    gradient.addColorStop(0, `rgba(${current.color}, 0)`);
    gradient.addColorStop(0.28, `rgba(${current.color}, ${0.026 + pulse * 0.03})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.012 + pulse * 0.018})`);
    gradient.addColorStop(0.74, `rgba(${current.color}, ${0.024 + pulse * 0.026})`);
    gradient.addColorStop(1, `rgba(${current.color}, 0)`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = current.width + current.viscosity * 0.7 + aetherViscousCurrentEnergy * 0.5;
    ctx.shadowColor = `rgba(${current.color}, ${0.045 + pulse * 0.052 + aetherViscousCurrentEnergy * 0.05})`;
    ctx.shadowBlur = 8 + current.z * 14 + current.viscosity * 10;
    ctx.stroke();

    const head = getAetherViscousCurrentPoint(current, packet, time, currentIndex * 0.27);
    const tail = getAetherViscousCurrentPoint(current, Math.max(0, packet - AETHER_VISCOUS_CURRENT_TAIL), time, currentIndex * 0.27);
    const packetGradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
    packetGradient.addColorStop(0, `rgba(${current.color}, 0)`);
    packetGradient.addColorStop(0.58, `rgba(${current.color}, ${0.1 + pulse * 0.12 + aetherViscousCurrentEnergy * 0.08})`);
    packetGradient.addColorStop(1, `rgba(255, 255, 255, ${0.1 + pulse * 0.12})`);

    ctx.beginPath();
    ctx.strokeStyle = packetGradient;
    ctx.lineWidth = 0.92 + current.z * 0.74 + current.viscosity * 0.58;
    ctx.moveTo(tail.x, tail.y);
    ctx.quadraticCurveTo(
      (tail.x + head.x) * 0.5 + pointer.x * current.z * 20,
      (tail.y + head.y) * 0.5 + pointer.y * current.z * 14,
      head.x,
      head.y,
    );
    ctx.stroke();
  });
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawAetherSurfaceThreads(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherSurfaceThreads.length) return;

  aetherSurfaceThreadEnergy *= 0.93;
  if (aetherSurfaceThreadEnergy < 0.004) aetherSurfaceThreadEnergy = 0;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  aetherSurfaceThreads.forEach((thread, threadIndex) => {
    thread.packet = (thread.packet + thread.speed * (16 + thread.z * 12)) % 1;
    const packet = thread.packet < 0 ? thread.packet + 1 : thread.packet;
    const pulse = 0.54 + Math.sin(time * 0.00072 + thread.phase) * 0.22 + aetherSurfaceThreadEnergy * 0.24;

    let startPoint = null;
    let endPoint = null;
    ctx.beginPath();
    for (let segment = 0; segment <= AETHER_SURFACE_THREAD_SEGMENTS; segment += 1) {
      const progress = segment / AETHER_SURFACE_THREAD_SEGMENTS;
      const point = getAetherSurfaceThreadPoint(thread, progress, time, threadIndex * 0.18);
      if (!startPoint) startPoint = point;
      endPoint = point;
      if (segment === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }

    if (!startPoint || !endPoint) return;
    const gradient = ctx.createLinearGradient(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    gradient.addColorStop(0, `rgba(${thread.color}, 0)`);
    gradient.addColorStop(0.36, `rgba(${thread.color}, ${0.026 + pulse * 0.022})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.018 + pulse * 0.018 + aetherSurfaceThreadEnergy * 0.025})`);
    gradient.addColorStop(0.72, `rgba(${thread.color}, ${0.022 + pulse * 0.02})`);
    gradient.addColorStop(1, `rgba(${thread.color}, 0)`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = thread.width + aetherSurfaceThreadEnergy * 0.36;
    ctx.shadowColor = `rgba(${thread.color}, ${0.05 + aetherSurfaceThreadEnergy * 0.1})`;
    ctx.shadowBlur = 8 + thread.z * 10 + aetherSurfaceThreadEnergy * 12;
    ctx.stroke();

    const head = getAetherSurfaceThreadPoint(thread, packet, time, threadIndex * 0.18);
    const tail = getAetherSurfaceThreadPoint(thread, Math.max(0, packet - AETHER_SURFACE_THREAD_PACKET_TAIL), time, threadIndex * 0.18);
    const packetGradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
    packetGradient.addColorStop(0, `rgba(${thread.color}, 0)`);
    packetGradient.addColorStop(0.68, `rgba(${thread.color}, ${0.11 + pulse * 0.12})`);
    packetGradient.addColorStop(1, `rgba(255, 255, 255, ${0.12 + pulse * 0.14 + aetherSurfaceThreadEnergy * 0.12})`);

    ctx.beginPath();
    ctx.strokeStyle = packetGradient;
    ctx.lineWidth = 0.78 + thread.z * 0.72 + aetherSurfaceThreadEnergy * 0.38;
    ctx.moveTo(tail.x, tail.y);
    ctx.quadraticCurveTo(
      (tail.x + head.x) * 0.5 + pointer.x * 16 * thread.z,
      (tail.y + head.y) * 0.5 + pointer.y * 10 * thread.z,
      head.x,
      head.y,
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = `rgba(${thread.color}, ${0.12 + pulse * 0.16 + aetherSurfaceThreadEnergy * 0.12})`;
    ctx.arc(head.x, head.y, 1.05 + thread.z * 1.15 + aetherSurfaceThreadEnergy * 0.78, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.restore();
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

function drawAetherPressureField(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherPressurePulses.length) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  aetherPressurePulses = aetherPressurePulses.filter((pulse) => pulse.age < pulse.ttl);
  aetherPressurePulses.forEach((pulse) => {
    pulse.age += 0.016;
    const life = Math.max(0, 1 - pulse.age / pulse.ttl);
    const color = pulse.hue === 'violet' ? '167, 139, 250' : pulse.hue === 'green' ? '94, 234, 212' : '117, 197, 222';
    const radius = pulse.radius * (0.42 + (1 - life) * 0.72);
    const shimmer = 0.65 + Math.sin(time * 0.003 + pulse.phase) * 0.22;
    const gradient = ctx.createRadialGradient(pulse.x, pulse.y, Math.max(1, radius * 0.08), pulse.x, pulse.y, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${life * 0.035 * pulse.strength})`);
    gradient.addColorStop(0.34, `rgba(${color}, ${life * 0.06 * pulse.strength})`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pulse.x + pointer.x * 10, pulse.y + pointer.y * 7, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${color}, ${life * 0.11 * shimmer})`;
    ctx.lineWidth = 0.6;
    ctx.arc(pulse.x + pointer.x * 12, pulse.y + pointer.y * 8, radius * 0.72, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawAetherAudioRipples(time) {
  if (prefersReducedMotion || isAetherFlowPaused() || !aetherAudioRipples.length) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  aetherAudioRipples = aetherAudioRipples.filter((ripple) => ripple.age < ripple.ttl);
  aetherAudioRipples.forEach((ripple) => {
    ripple.age += 0.016;
    ripple.x += ripple.vx + pointer.x * 0.035;
    ripple.y += ripple.vy + pointer.y * 0.028;
    ripple.vx *= 0.992;
    ripple.vy *= 0.992;

    const life = Math.max(0, 1 - ripple.age / ripple.ttl);
    const color = ripple.hue === 'violet' ? '167, 139, 250' : ripple.hue === 'green' ? '94, 234, 212' : '117, 197, 222';
    const shimmer = 0.6 + Math.sin(time * 0.004 + ripple.phase) * 0.24;
    const radius = ripple.radius * (0.24 + (1 - life) * 0.86);
    const x = ripple.x + pointer.x * 12;
    const y = ripple.y + pointer.y * 8;

    const gradient = ctx.createRadialGradient(x, y, Math.max(1, radius * 0.06), x, y, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${life * ripple.level * 0.035})`);
    gradient.addColorStop(0.38, `rgba(${color}, ${life * ripple.level * 0.075})`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    for (let ring = 0; ring < 2; ring += 1) {
      const ringRadius = radius * (0.62 + ring * 0.28);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${color}, ${life * ripple.level * (0.075 - ring * 0.026) * shimmer})`;
      ctx.lineWidth = 0.44 + ripple.level * 0.76;
      ctx.arc(
        x + Math.sin(ripple.phase + ring) * 5,
        y + Math.cos(ripple.phase + ring) * 4,
        ringRadius,
        -Math.PI * 0.16,
        Math.PI * (1.26 + ring * 0.18),
      );
      ctx.stroke();
    }
  });
  ctx.restore();
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
  if (globalThis.__synthDirectManipulating) {
    pointer.targetForce = 0;
    return;
  }
  pointer.screenX = event.clientX;
  pointer.screenY = event.clientY;
  pointer.tx = (event.clientX / Math.max(1, width) - 0.5) * 2;
  pointer.ty = (event.clientY / Math.max(1, height) - 0.5) * 2;
  pointer.targetForce = 1;
  spawnCursorWake(event.clientX, event.clientY, event.timeStamp || performance.now());
  scheduleSpaceParallaxCommit();
}

function releaseAetherPointer() {
  pointer.targetForce = 0;
  cursorWakeAnchor.time = 0;
}

function handleAetherSurfaceHover(event) {
  const target = event.target?.closest?.(AETHER_FLOW_SURFACE_SELECTOR);
  if (!target || !document.body?.contains(target)) return;
  const rect = target.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  spawnAetherPressurePulse(
    rect.left + rect.width * 0.5,
    rect.top + rect.height * 0.5,
    { radius: Math.min(AETHER_PRESSURE_RADIUS, Math.max(84, rect.width * 0.42)), strength: 0.42, ttl: 1.05 },
  );
  energizeAetherComponentFlow({ level: 0.38, source: 'surface-hover' });
  energizeAetherSurfaceThreads({ level: 0.42, source: 'surface-hover' });
}

function tick(time = 0) {
  if (!ctx || !canvas) return;

  pointer.x += (pointer.tx - pointer.x) * 0.055;
  pointer.y += (pointer.ty - pointer.y) * 0.055;
  if (pointer.targetForce > pointer.force) {
    pointer.force += (pointer.targetForce - pointer.force) * AETHER_POINTER_EASE;
  } else {
    pointer.force *= AETHER_POINTER_DECAY;
    if (pointer.force < 0.006) pointer.force = 0;
  }
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(8, 10, 18, 0.022)';
  ctx.fillRect(0, 0, width, height);

  drawRippleField(time);
  drawAetherPressureField(time);
  if (!isAetherFlowPaused()) drawAetherAudioRipples(time);
  if (!isAetherFlowPaused()) drawAetherOrbitalCurrents(time);
  drawSignalWave(time);
  if (!isAetherFlowPaused()) drawAetherStreamRibbons(time);
  if (!isAetherFlowPaused()) drawAetherLiquidFilaments(time);
  if (!isAetherFlowPaused()) drawAetherFlowRivers(time);
  if (!isAetherFlowPaused()) drawAetherViscousCurrents(time);
  if (!isAetherFlowPaused()) drawAetherSurfaceThreads(time);
  if (!isAetherFlowPaused()) drawAetherCurrentPackets(time);
  if (!isAetherFlowPaused()) drawCursorFlowWake(time);
  if (!isAetherFlowPaused()) drawAetherConstellationMesh(time);
  if (!isAetherFlowPaused()) drawAetherAdaptiveMesh(time);
  if (!isAetherFlowPaused()) drawAetherHeroFlowNetwork(time);
  if (!isAetherFlowPaused()) drawAetherComponentFlowNetwork(time);
  if (!isAetherFlowPaused()) drawAetherNodeCurrents(time);
  if (!isAetherFlowPaused()) drawAetherMagneticLinks(time);
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
  drawConnections(time);
  drawAetherFlowWeb(time);
  if (!isAetherFlowPaused()) drawTransitionParticles(time);

  if (!prefersReducedMotion) frameId = globalThis.requestAnimationFrame(tick);
}

function init() {
  if (!canvas || !ctx) return;
  resize();
  globalThis.requestAnimationFrame?.(() => refreshAetherSurfaceThreads({ source: 'initial-layout' }));
  globalThis.addEventListener('resize', resize);
  globalThis.addEventListener('pointermove', (event) => {
    updatePointerFromEvent(event);
  }, { passive: true });
  globalThis.addEventListener('pointerleave', releaseAetherPointer, { passive: true });
  globalThis.addEventListener('blur', releaseAetherPointer);
  document.addEventListener('pointerover', handleAetherSurfaceHover, { passive: true });
  document.addEventListener('synth:view-transition', (event) => {
    spawnTransitionBurst(event.detail);
    resetAetherHeroFlowNetwork(event.detail);
    resetAetherComponentFlowNetwork(event.detail);
    rethreadAetherFlowRivers(event.detail);
    resetAetherViscousCurrents(event.detail);
    rethreadAetherAdaptiveMesh(event.detail);
    refreshAetherSurfaceThreads(event.detail);
    spawnAetherPressurePulse(width * 0.52, height * 0.46, { radius: 220, strength: 0.62, ttl: 1.3, hue: 'cyan' });
    aetherMagneticLinks.forEach((link, index) => {
      link.phase += 0.42 + index * 0.026;
      link.drift *= -1;
    });
    aetherOrbitalFields.forEach((field, index) => {
      field.phase += 0.34 + index * 0.08;
      field.speed *= -1;
    });
  });
  document.addEventListener('synth:flow-pulse', (event) => {
    const seed = String(event.detail?.to ?? 'pulse').length;
    spawnAetherPressurePulse(
      width * (0.36 + (seed % 5) * 0.07),
      height * (0.32 + (seed % 4) * 0.11),
      { radius: 190, strength: 0.58, ttl: 1.2, hue: seed % 2 === 0 ? 'green' : 'violet' },
    );
  });
  document.addEventListener('synth:audio-pulse', (event) => {
    spawnAetherAudioRipple(event.detail);
    energizeAetherViscousCurrents(event.detail);
    energizeAetherAdaptiveMesh(event.detail);
    energizeAetherComponentFlow(event.detail);
    energizeAetherSurfaceThreads(event.detail);
  });
  tick();
}

init();

globalThis.addEventListener('pagehide', () => {
  if (frameId) globalThis.cancelAnimationFrame(frameId);
  if (spaceParallaxFrame) globalThis.cancelAnimationFrame(spaceParallaxFrame);
});
