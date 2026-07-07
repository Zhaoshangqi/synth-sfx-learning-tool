import { getPresetDnaById, getPresetDnaForFamily, presetDnaLibrary } from './preset-library.js';
import { SOUND_LAB_SAMPLE_ASSETS, getSampleAsset } from './sample-assets.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));
const normalize = (value) => clamp(value, 0, 100) / 100;

export const SOUND_LAB_MACROS = {
  brightness: 66,
  motion: 48,
  material: 58,
  space: 32,
  variation: 24,
};

export const SOUND_LAB_MACRO_DEFS = [
  { id: 'brightness', labelZh: 'Brightness 明暗', lowZh: '暗、钝、少高频', highZh: '亮、硬、识别度高' },
  { id: 'motion', labelZh: 'Motion 动态', lowZh: '稳定、少运动', highZh: '上扫、跳变、速度感' },
  { id: 'material', labelZh: 'Material 材质', lowZh: '软、平滑、谐波少', highZh: '硬、非谐波、共振强' },
  { id: 'space', labelZh: 'Space 空间', lowZh: '干、近、短尾', highZh: '远、宽、长尾' },
  { id: 'variation', labelZh: 'Variation 变体', lowZh: '可重复、稳定', highZh: '随机、活、可导多版' },
];

export const SOUND_LAB_QUALITY_MODES = [
  { id: 'draft', labelZh: 'Draft', noteZh: '低 CPU，适合快速找方向。', layerScale: 0.82, fxScale: 0.72 },
  { id: 'balanced', labelZh: 'Balanced', noteZh: '默认练习模式，层次和性能平衡。', layerScale: 1, fxScale: 1 },
  { id: 'studio', labelZh: 'Studio', noteZh: '更多细节层和更柔和限制器，音质优先。', layerScale: 1.14, fxScale: 1.18 },
];

export const SOUND_LAB_ENGINE_MODES = [
  { id: 'hq', labelZh: 'HQ Tone.js', noteZh: '成熟合成模块、调度和 FX，优先用于真实试听。' },
  { id: 'worklet', labelZh: 'Native Worklet', noteZh: '自研 AudioWorklet DSP，离线稳定、响应快。' },
  { id: 'webaudio', labelZh: 'WebAudio Safe', noteZh: '浏览器基础节点回退，保证可播放。' },
];

export const SOUND_LAB_PERFORMANCE_DEFAULTS = {
  note: 'C3',
  velocity: 72,
  glide: 12,
  hold: false,
  octave: 0,
};

export const SOUND_LAB_LAYER_MIX = {
  transient: 74,
  body: 72,
  texture: 48,
  tail: 36,
};

export const SOUND_LAB_ADVANCED_MODULES = [
  { id: 'advanced', labelZh: 'Advanced Panel', noteZh: '核心振荡器、引擎、质量和安全输出。' },
  { id: 'mod-matrix', labelZh: 'Mod Matrix', noteZh: '把 LFO、Envelope、XY、Velocity、Macro 映射到任意目标。' },
  { id: 'envelope-editor', labelZh: 'Envelope Editor', noteZh: '可编辑 Amp / Filter / Pitch 包络。' },
  { id: 'fx-chain', labelZh: 'FX Chain Reorder', noteZh: '拖拽重排 Drive、Filter、Chorus、Delay、Reverb、Limiter。' },
  { id: 'xy-pad', labelZh: 'XY Pad', noteZh: '双轴实时调制，用于材质和空间的手势控制。' },
  { id: 'macro-morph', labelZh: 'Macro Morph', noteZh: '在 A/B 宏快照之间平滑插值。' },
  { id: 'ab-compare', labelZh: 'A/B Compare', noteZh: '对比干声、完整链路或两个完整 Patch。' },
  { id: 'favorites', labelZh: 'Favorites', noteZh: '收藏常用音色和技巧。' },
  { id: 'project-library', labelZh: 'Project Library', noteZh: '按项目、标签和用途管理音色。' },
  { id: 'cloud-sync', labelZh: 'Git Sync', noteZh: '通过 GitHub 仓库同步预设 JSON。' },
  { id: 'midi-input', labelZh: 'MIDI Input', noteZh: 'Web MIDI 设备、Learn 和 CC 映射。' },
  { id: 'batch-export', labelZh: 'Batch Export', noteZh: '批量导出命名规则和 REAPER 备注。' },
];

export const SOUND_LAB_FX_ORDER = ['drive', 'filter', 'chorus', 'delay', 'reverb', 'polish', 'limiter'];

export const SOUND_LAB_MOD_SOURCES = [
  { id: 'lfo-1', labelZh: 'LFO 1' },
  { id: 'lfo-2', labelZh: 'LFO 2' },
  { id: 'env-1', labelZh: 'Envelope 1' },
  { id: 'env-2', labelZh: 'Envelope 2' },
  { id: 'velocity', labelZh: 'Velocity' },
  { id: 'note', labelZh: 'Note' },
  { id: 'xy-x', labelZh: 'XY X' },
  { id: 'xy-y', labelZh: 'XY Y' },
  ...SOUND_LAB_MACRO_DEFS.map((macro) => ({ id: `macro-${macro.id}`, labelZh: `Macro ${macro.labelZh.split(' ')[0]}` })),
];

export const SOUND_LAB_MOD_TARGETS = [
  { id: 'filter.cutoff', labelZh: 'Filter Cutoff', unit: 'Hz' },
  { id: 'filter.q', labelZh: 'Filter Q', unit: '' },
  { id: 'fm.depth', labelZh: 'FM Depth', unit: 'Hz' },
  { id: 'fm.ratio', labelZh: 'FM Ratio', unit: '' },
  { id: 'osc.pitch', labelZh: 'Osc Pitch', unit: 'st' },
  { id: 'fx.drive', labelZh: 'Drive Mix', unit: '%' },
  { id: 'fx.delay', labelZh: 'Delay Wet', unit: '%' },
  { id: 'fx.reverb', labelZh: 'Reverb Wet', unit: '%' },
  { id: 'layer.texture', labelZh: 'Texture Gain', unit: '%' },
  { id: 'output.gain', labelZh: 'Output Gain', unit: 'dB' },
];

const DEFAULT_XY_PAD = { x: 50, y: 50 };

const FAMILY_BASES = {
  'metal-impact': {
    duration: 0.72,
    baseFrequency: 170,
    resonators: [1, 1.47, 2.31, 3.76],
    filter: 'bandpass',
    noise: 0.22,
    drive: 0.28,
  },
  'glass-ping': {
    duration: 1.28,
    baseFrequency: 520,
    resonators: [1, 2.04, 2.91, 4.72],
    filter: 'highpass',
    noise: 0.08,
    drive: 0.08,
  },
  'electric-crackle': {
    duration: 1.05,
    baseFrequency: 300,
    resonators: [1, 1.91, 3.37],
    filter: 'bandpass',
    noise: 0.52,
    drive: 0.34,
  },
  'air-whoosh': {
    duration: 1.42,
    baseFrequency: 180,
    resonators: [0.5, 1.2],
    filter: 'lowpass',
    noise: 0.72,
    drive: 0.06,
  },
  'servo-tick': {
    duration: 0.58,
    baseFrequency: 240,
    resonators: [1, 1.62, 2.18],
    filter: 'bandpass',
    noise: 0.18,
    drive: 0.22,
  },
  'energy-charge': {
    duration: 1.9,
    baseFrequency: 130,
    resonators: [1, 2, 3.02, 4.11],
    filter: 'lowpass',
    noise: 0.24,
    drive: 0.18,
  },
};

function macroValues(macros = {}) {
  return Object.fromEntries(
    SOUND_LAB_MACRO_DEFS.map((macro) => [macro.id, clamp(macros[macro.id] ?? SOUND_LAB_MACROS[macro.id], 0, 100)]),
  );
}

function layerMixValues(layerMix = {}) {
  return Object.fromEntries(
    Object.entries(SOUND_LAB_LAYER_MIX).map(([role, defaultValue]) => [role, clamp(layerMix[role] ?? defaultValue, 0, 100)]),
  );
}

function getQualityMode(modeId = 'balanced') {
  return SOUND_LAB_QUALITY_MODES.find((mode) => mode.id === modeId) ?? SOUND_LAB_QUALITY_MODES[1];
}

function getEngineMode(modeId = 'worklet') {
  return SOUND_LAB_ENGINE_MODES.some((mode) => mode.id === modeId) ? modeId : 'worklet';
}

function performanceValues(performance = {}) {
  return {
    note: String(performance.note ?? SOUND_LAB_PERFORMANCE_DEFAULTS.note),
    velocity: clamp(performance.velocity ?? SOUND_LAB_PERFORMANCE_DEFAULTS.velocity, 0, 127),
    glide: clamp(performance.glide ?? SOUND_LAB_PERFORMANCE_DEFAULTS.glide, 0, 100),
    hold: Boolean(performance.hold ?? SOUND_LAB_PERFORMANCE_DEFAULTS.hold),
    octave: clamp(performance.octave ?? SOUND_LAB_PERFORMANCE_DEFAULTS.octave, -2, 2),
  };
}

export function getSoundLabFamily(families, familyId) {
  return families.find((family) => family.id === familyId) ?? families[0];
}

function xyPadValues(xyPad = {}) {
  return {
    x: clamp(xyPad.x ?? DEFAULT_XY_PAD.x, 0, 100),
    y: clamp(xyPad.y ?? DEFAULT_XY_PAD.y, 0, 100),
    xTarget: xyPad.xTarget ?? 'filter.cutoff',
    yTarget: xyPad.yTarget ?? 'fx.reverb',
  };
}

function envelopeValues(envelope = {}, fallback = {}) {
  return {
    attack: clamp(envelope.attack ?? fallback.attack ?? 0.004, 0.001, 1.5),
    decay: clamp(envelope.decay ?? fallback.decay ?? 0.18, 0.01, 3.2),
    sustain: clamp(envelope.sustain ?? fallback.sustain ?? 0.08, 0, 1),
    release: clamp(envelope.release ?? fallback.release ?? 0.32, 0.01, 4.2),
  };
}

function buildDefaultModRoutes(values, xyPad) {
  return [
    { id: 'route-lfo-filter', source: 'lfo-1', target: 'filter.cutoff', amount: 28, curve: 'sine', enabled: true },
    { id: 'route-env-fm', source: 'env-1', target: 'fm.depth', amount: 46, curve: 'exp', enabled: true },
    { id: 'route-vel-drive', source: 'velocity', target: 'fx.drive', amount: 34, curve: 'linear', enabled: true },
    { id: 'route-note-bright', source: 'note', target: 'filter.cutoff', amount: 18, curve: 'linear', enabled: true },
    { id: 'route-xy-filter', source: 'xy-x', target: xyPad.xTarget, amount: 52, curve: 'linear', enabled: true },
    { id: 'route-xy-space', source: 'xy-y', target: xyPad.yTarget, amount: 44, curve: 'linear', enabled: true },
    { id: 'route-macro-material', source: 'macro-material', target: 'fm.ratio', amount: clamp(values.material - 50, -80, 80), curve: 'linear', enabled: true },
    { id: 'route-macro-space', source: 'macro-space', target: 'fx.reverb', amount: clamp(values.space - 35, -70, 80), curve: 'linear', enabled: true },
  ];
}

function modMatrixValues(routes = [], values = SOUND_LAB_MACROS, xyPad = DEFAULT_XY_PAD) {
  const sourceIds = new Set(SOUND_LAB_MOD_SOURCES.map((source) => source.id));
  const targetIds = new Set(SOUND_LAB_MOD_TARGETS.map((target) => target.id));
  const defaults = buildDefaultModRoutes(values, xyPad);
  const inputRoutes = routes.length ? routes : defaults;

  return inputRoutes
    .map((route, index) => ({
      id: route.id ?? `route-${index + 1}`,
      source: sourceIds.has(route.source) ? route.source : defaults[index % defaults.length].source,
      target: targetIds.has(route.target) ? route.target : defaults[index % defaults.length].target,
      amount: clamp(route.amount ?? 0, -100, 100),
      curve: route.curve ?? 'linear',
      enabled: route.enabled !== false,
    }))
    .filter((route) => route.enabled);
}

function sourceValue(source, values, xyPad, performance) {
  if (source === 'xy-x') return xyPad.x / 100;
  if (source === 'xy-y') return xyPad.y / 100;
  if (source === 'velocity') return clamp(performance.velocity, 0, 127) / 127;
  if (source === 'note') return 0.5 + clamp(performance.octave, -2, 2) * 0.12;
  if (source.startsWith('macro-')) return normalize(values[source.replace('macro-', '')] ?? 50);
  if (source.startsWith('env-')) return 0.66;
  if (source.startsWith('lfo-')) return 0.58;
  return 0.5;
}

function applyModMatrixToDsp(dsp, routes, values, xyPad, performance) {
  const next = {
    ...dsp,
    oscillator: { ...dsp.oscillator },
    filter: { ...dsp.filter },
    space: { ...dsp.space },
    waveshaper: { ...dsp.waveshaper },
    safety: { ...dsp.safety },
  };

  for (const route of routes) {
    const bipolar = (sourceValue(route.source, values, xyPad, performance) - 0.5) * 2;
    const depth = route.amount / 100;
    if (route.target === 'filter.cutoff') {
      next.filter.frequency = clamp(next.filter.frequency * (1 + bipolar * depth * 0.55), 80, 18000);
    }
    if (route.target === 'filter.q') {
      next.filter.q = clamp(next.filter.q + bipolar * depth * 5, 0.2, 18);
    }
    if (route.target === 'fm.depth') {
      next.oscillator.fmDepth = clamp(next.oscillator.fmDepth * (1 + bipolar * depth * 0.72), 0, 1800);
    }
    if (route.target === 'fm.ratio') {
      next.oscillator.motionRate = clamp(next.oscillator.motionRate * (1 + bipolar * depth * 0.28), 0.05, 18);
    }
    if (route.target === 'fx.drive') {
      next.waveshaper.drive = clamp(next.waveshaper.drive + bipolar * depth * 0.35, 0, 1.4);
    }
    if (route.target === 'fx.reverb') {
      next.space.mix = clamp(next.space.mix + bipolar * depth * 0.22, 0, 0.72);
    }
    if (route.target === 'fx.delay') {
      next.space.decaySeconds = clamp(next.space.decaySeconds * (1 + bipolar * depth * 0.36), 0.08, 4.2);
    }
    if (route.target === 'output.gain') {
      next.safety.outputGain = clamp(next.safety.outputGain + bipolar * depth * 0.18, 0.18, 0.98);
    }
  }

  return next;
}

function orderFxRack(fxRack, requestedOrder = SOUND_LAB_FX_ORDER) {
  const byId = new Map(fxRack.map((slot) => [slot.id, slot]));
  const ordered = [];
  for (const slotId of requestedOrder) {
    if (byId.has(slotId)) {
      ordered.push(byId.get(slotId));
      byId.delete(slotId);
    }
  }
  const nextOrder = [...ordered, ...byId.values()];
  const polishIndex = nextOrder.findIndex((slot) => slot.id === 'polish');
  const limiterIndex = nextOrder.findIndex((slot) => slot.id === 'limiter');
  if (polishIndex > -1 && limiterIndex > -1 && polishIndex > limiterIndex) {
    const [polish] = nextOrder.splice(polishIndex, 1);
    nextOrder.splice(limiterIndex, 0, polish);
  }
  return nextOrder.map((slot, index) => ({ ...slot, order: index }));
}

function buildMasterPolish(values, dsp, quality, layerData = {}) {
  const brightness = normalize(values.brightness);
  const motion = normalize(values.motion);
  const material = normalize(values.material);
  const space = normalize(values.space);
  const variation = normalize(values.variation);
  const transientMix = clamp((layerData.layerMix?.transient ?? SOUND_LAB_LAYER_MIX.transient) / 100, 0, 1);
  const textureMix = clamp((layerData.layerMix?.texture ?? SOUND_LAB_LAYER_MIX.texture) / 100, 0, 1);
  const tailMix = clamp((layerData.layerMix?.tail ?? SOUND_LAB_LAYER_MIX.tail) / 100, 0, 1);
  const studioBonus = quality.id === 'studio' ? 0.13 : quality.id === 'balanced' ? 0.06 : 0;
  const comfortBus = {
    warmth: clamp(0.1 + (1 - brightness) * 0.12 + material * 0.08 + tailMix * 0.05 + studioBonus * 0.5, 0.06, 0.42),
    deHarsh: clamp(0.14 + brightness * 0.24 + textureMix * 0.18 + material * 0.08 + studioBonus * 0.52, 0.08, 0.62),
    headroom: clamp(0.045 + transientMix * 0.026 + material * 0.024 + (quality.id === 'studio' ? 0.038 : 0.018), 0.035, 0.15),
    airTame: clamp(0.08 + brightness * 0.16 + variation * 0.1 + textureMix * 0.08, 0.05, 0.46),
  };

  return {
    glue: clamp(0.12 + material * 0.22 + motion * 0.09 + studioBonus, 0.08, 0.62),
    lowTighten: clamp(0.1 + material * 0.16 + (1 - space) * 0.1 + dsp.waveshaper.drive * 0.08, 0.06, 0.45),
    airGuard: clamp(0.12 + brightness * 0.3 + textureMix * 0.1 + variation * 0.07, 0.08, 0.6),
    transientHold: clamp(0.16 + transientMix * 0.3 + material * 0.13, 0.12, 0.72),
    bodyGain: clamp(0.98 - studioBonus * 0.12 - material * 0.05, 0.86, 1),
    comfortBus,
  };
}

function buildFxRack(values, dsp, quality, masterPolish = buildMasterPolish(values, dsp, quality)) {
  const brightness = normalize(values.brightness);
  const motion = normalize(values.motion);
  const material = normalize(values.material);
  const space = normalize(values.space);
  const variation = normalize(values.variation);
  return [
    { id: 'drive', type: 'drive', labelZh: 'Drive / Saturation', amount: clamp(dsp.waveshaper.drive * quality.fxScale + material * 0.28, 0, 1) },
    { id: 'filter', type: 'filter', labelZh: 'Filter Movement', amount: clamp(brightness * 0.62 + motion * 0.38, 0, 1), targetHz: dsp.filter.frequency },
    { id: 'chorus', type: 'chorus', labelZh: 'Micro Width', amount: clamp(space * 0.35 + variation * 0.2, 0, 0.72) },
    { id: 'delay', type: 'delay', labelZh: 'Tempo Echo', amount: clamp(motion * 0.2 + space * 0.24, 0, 0.5) },
    { id: 'reverb', type: 'reverb', labelZh: 'Room / Tail', amount: clamp(dsp.space.mix * quality.fxScale + space * 0.16, 0, 0.62), decaySeconds: clamp(dsp.space.decaySeconds * quality.fxScale, 0.12, 3.2) },
    { id: 'polish', type: 'polish', labelZh: 'Master Polish', amount: clamp(masterPolish.glue + masterPolish.airGuard * 0.34 + (masterPolish.comfortBus?.deHarsh ?? 0) * 0.16, 0, 1), glue: masterPolish.glue, lowTighten: masterPolish.lowTighten, airGuard: masterPolish.airGuard, comfortBus: masterPolish.comfortBus },
    { id: 'limiter', type: 'limiter', labelZh: 'Soft Limiter', amount: quality.id === 'studio' ? 0.94 : 0.9, ceiling: quality.id === 'studio' ? 0.94 : 0.9 },
  ];
}

function buildToneGraph(family, values, dsp, quality, performance, options = {}) {
  const familyId = family?.id ?? 'metal-impact';
  const instrumentByFamily = {
    'metal-impact': 'MetalSynth + FMSynth',
    'glass-ping': 'FMSynth + Synth partial stack',
    'electric-crackle': 'NoiseSynth + FMSynth sparks',
    'air-whoosh': 'NoiseSynth + AutoFilter',
    'servo-tick': 'Synth pulse + PitchShift',
    'energy-charge': 'FMSynth + AMSynth + PolySynth',
  };
  const fxRack = orderFxRack(buildFxRack(values, dsp, quality, options.masterPolish), options.fxOrder);
  const brightness = normalize(values.brightness);
  const motion = normalize(values.motion);
  const material = normalize(values.material);
  const space = normalize(values.space);

  return {
    engine: 'Tone.js',
    version: '15.1.22',
    instrument: instrumentByFamily[familyId] ?? 'FMSynth',
    note: performance.note,
    velocity: performance.velocity / 127,
    durationSeconds: performance.hold ? clamp(dsp.space.decaySeconds + 1.4, 1.2, 4.2) : clamp(dsp.space.decaySeconds + 0.24, 0.18, 3.4),
    nodes: [
      { type: 'instrument', name: instrumentByFamily[familyId] ?? 'FMSynth', harmonicity: clamp(0.75 + material * 5.5, 0.25, 8) },
      { type: 'filter', frequency: clamp(dsp.filter.frequency * (0.72 + brightness * 0.46), 120, 17000), q: clamp(dsp.filter.q * 0.85, 0.4, 9.5) },
      { type: 'modulation', target: 'filter.frequency / modulationIndex / width', depth: clamp(0.18 + motion * 0.72, 0.1, 0.96) },
      { type: 'output', limiter: quality.id === 'studio' ? 0.94 : 0.91 },
    ],
    effects: fxRack,
    envelope: envelopeValues(options.envelope, {
      attack: clamp(dsp.transient.attackMs / 1000, 0.001, 0.18),
      decay: clamp((familyId === 'air-whoosh' ? 0.65 : 0.12) + space * 0.65, 0.04, 1.4),
      sustain: performance.hold ? clamp(0.24 + space * 0.34, 0.08, 0.78) : clamp(0.02 + space * 0.14, 0, 0.28),
      release: clamp(0.08 + space * 1.1, 0.04, 1.6),
    }),
  };
}

function buildMacroModulation(values) {
  return [
    { source: 'brightness', target: 'filter.frequency + oscillator partial brightness', amount: normalize(values.brightness) },
    { source: 'motion', target: 'filter.frequency sweep + pan movement + trigger timing', amount: normalize(values.motion) },
    { source: 'material', target: 'modulationIndex + drive + resonator Q', amount: normalize(values.material) },
    { source: 'space', target: 'reverb wet + delay feedback + stereo width', amount: normalize(values.space) },
    { source: 'variation', target: 'detune drift + random trigger seed + grain jitter', amount: normalize(values.variation) },
  ];
}

function roleGain(role, mix, quality, recipeGain = 1) {
  return clamp((mix[role] ?? 60) / 100 * recipeGain * quality.layerScale, 0, 1.4);
}

function layerEnvelope(role, durationSeconds, material, space) {
  if (role === 'transient') return { attackMs: 0.7, decayMs: clamp(28 + material * 42, 16, 96), sustain: 0, releaseMs: 28 };
  if (role === 'body') return { attackMs: clamp(1.5 + (1 - material) * 18, 1, 24), decayMs: durationSeconds * 440, sustain: 0.08, releaseMs: clamp(80 + space * 180, 50, 320) };
  if (role === 'texture') return { attackMs: 6, decayMs: durationSeconds * 620, sustain: 0.18, releaseMs: clamp(90 + space * 260, 60, 420) };
  return { attackMs: 12, decayMs: durationSeconds * 840, sustain: 0.12, releaseMs: clamp(180 + space * 520, 120, 780) };
}

function layerStereoSpread(role, engine, quality, space, variation, index) {
  const tonalBonus = ['fmBurst', 'combDelay'].includes(engine) ? 0.18 : 0.04;
  const roleBonus = role === 'body' ? 0.1 : role === 'texture' ? 0.16 : role === 'tail' ? 0.2 : 0.03;
  const qualityBonus = quality.id === 'studio' ? 0.14 : quality.id === 'balanced' ? 0.06 : 0;
  return clamp(0.04 + tonalBonus + roleBonus + space * 0.34 + variation * 0.22 + index * 0.018 + qualityBonus, 0.02, 0.92);
}

function buildUnisonProfile(engine, quality, motion, variation, index) {
  if (!['fmBurst', 'combDelay'].includes(engine)) return undefined;
  const baseVoices = quality.id === 'studio' ? 3 : quality.id === 'balanced' ? 2 : 1;
  const extraVoice = quality.id === 'studio' && engine === 'fmBurst' && variation > 0.52 ? 2 : 0;
  const voices = clamp(baseVoices + extraVoice, 1, 5);
  return {
    voices,
    detuneCents: clamp((voices > 1 ? 3.8 : 0) + variation * 9 + motion * 3 + index * 0.6, 0, 22),
    analogDrift: clamp((voices > 1 ? 0.002 : 0) + variation * 0.018 + motion * 0.006, 0, 0.032),
    phaseSpread: clamp(0.16 + variation * 0.28 + index * 0.04, 0.08, 0.74),
  };
}

function buildLayer(recipe, context, index) {
  const { base, dsp, durationSeconds, layerMix, quality, material, brightness, motion, space, variation, sampleMix } = context;
  const role = recipe.role;
  const gain = roleGain(role, layerMix, quality, recipe.gain);
  const envelope = layerEnvelope(role, durationSeconds, material, space);
  const pan = clamp((index - 2) * 0.11 + (variation - 0.5) * 0.18, -0.55, 0.55);
  const sampleAsset = recipe.sampleAssetId ? getSampleAsset(recipe.sampleAssetId) : null;
  const unison = buildUnisonProfile(recipe.engine, quality, motion, variation, index);

  const common = {
    id: `${role}-${recipe.engine}-${index}`,
    role,
    engine: recipe.engine,
    gain: recipe.engine === 'sampleGrain' ? gain * sampleMix : gain,
    pan,
    stereoSpread: layerStereoSpread(role, recipe.engine, quality, space, variation, index),
    envelope,
  };
  if (unison) common.unison = unison;

  if (recipe.engine === 'sampleGrain') {
    return {
      ...common,
      sampleAssetId: sampleAsset?.id ?? SOUND_LAB_SAMPLE_ASSETS[0].id,
      generator: sampleAsset?.generator ?? SOUND_LAB_SAMPLE_ASSETS[0].generator,
      bandHz: clamp((sampleAsset?.generator?.bandHz ?? dsp.filter.frequency) * (0.7 + brightness * 0.55), 320, 14000),
      density: clamp(3 + motion * 32 + variation * 36, 2, 72),
      jitter: clamp(variation * 0.82, 0, 0.92),
    };
  }

  if (recipe.engine === 'fmBurst') {
    return {
      ...common,
      oscillator: {
        shape: dsp.oscillator.shape,
        frequency: clamp(base.baseFrequency * (1 + index * 0.19), 40, 1800),
        fmRatio: clamp(1.35 + material * 3.4 + index * 0.21, 0.5, 8),
        fmDepth: clamp(dsp.oscillator.fmDepth * (0.45 + recipe.gain), 0, 1200),
        sweep: clamp(dsp.filter.sweep + motion * 0.38, -1.8, 1.8),
      },
    };
  }

  if (recipe.engine === 'modalResonator') {
    return {
      ...common,
      baseFrequency: base.baseFrequency,
      resonators: dsp.resonators.map((resonator, resonatorIndex) => ({
        ratio: resonator.ratio + index * 0.018,
        gain: clamp(resonator.gain * (0.76 + brightness * 0.36), 0.04, 1),
        decay: clamp(resonator.decay * (role === 'tail' ? 1.32 + space : 0.8 + material * 0.44), 0.035, 2.8),
        q: clamp(8 + dsp.filter.q * 1.5 + resonatorIndex * 1.8, 2, 34),
      })),
    };
  }

  if (recipe.engine === 'combDelay') {
    return {
      ...common,
      sourceFrequency: clamp(base.baseFrequency * (2.2 + material * 3.2), 90, 3200),
      delayMs: clamp(3.2 + material * 10 + variation * 8, 2, 24),
      feedback: clamp(0.22 + material * 0.42 + space * 0.18, 0.08, 0.82),
      damping: clamp(0.28 + brightness * 0.5, 0.12, 0.92),
    };
  }

  return {
    ...common,
    filter: {
      type: dsp.filter.type,
      frequency: clamp(dsp.filter.frequency * (0.42 + brightness * 0.82), 160, 16000),
      q: clamp(dsp.filter.q * (0.55 + material * 0.42), 0.4, 12),
      sweep: clamp(dsp.filter.sweep + (motion - 0.5) * 1.1, -2.2, 2.2),
    },
    noise: {
      gain: clamp(dsp.noise.gain * (0.9 + recipe.gain), 0.02, 0.96),
      gateRate: clamp(dsp.noise.gateRate * (0.62 + motion), 0.5, 82),
    },
  };
}

function buildLayers({ family, base, dsp, durationSeconds, values, options, presetDna }) {
  const brightness = normalize(values.brightness);
  const motion = normalize(values.motion);
  const material = normalize(values.material);
  const space = normalize(values.space);
  const variation = normalize(values.variation);
  const quality = getQualityMode(options.qualityMode);
  const layerMix = layerMixValues(options.layerMix);
  const sampleMix = clamp(options.sampleMix ?? 0.58, 0, 1);
  const recipe = presetDna?.layerRecipe?.length ? presetDna.layerRecipe : [
    { role: 'transient', engine: 'sampleGrain', gain: 0.42, sampleAssetId: 'pd-click-pin' },
    { role: 'body', engine: 'fmBurst', gain: 0.4 },
    { role: 'body', engine: 'modalResonator', gain: 0.62 },
    { role: 'texture', engine: 'filteredNoise', gain: 0.32 },
    { role: 'tail', engine: 'filteredNoise', gain: 0.18 },
  ];

  const context = { family, base, dsp, durationSeconds, layerMix, quality, material, brightness, motion, space, variation, sampleMix };
  const layers = recipe.map((recipeLayer, index) => buildLayer(recipeLayer, context, index));

  if (quality.id === 'studio' && !layers.some((layer) => layer.role === 'tail' && layer.engine === 'sampleGrain')) {
    layers.push(buildLayer({ role: 'tail', engine: 'sampleGrain', gain: 0.18, sampleAssetId: 'pd-tail-shimmer' }, context, layers.length));
  }

  return { layers, layerMix, sampleMix, qualityMode: quality.id };
}

function buildLegacyDsp(family, base, values) {
  const brightness = normalize(values.brightness);
  const motion = normalize(values.motion);
  const material = normalize(values.material);
  const space = normalize(values.space);
  const variation = normalize(values.variation);
  const seed = Math.floor((family?.id ?? 'sound').split('').reduce((total, char) => total + char.charCodeAt(0), 0) + variation * 997);
  const durationSeconds = clamp(base.duration + space * 0.82 + motion * 0.28, 0.28, 3.2);
  const filterFrequency = clamp(base.baseFrequency * (6 + brightness * 42 + material * 16), 220, 15000);
  const resonanceBase = 0.36 + material * 0.5;

  return {
    seed,
    durationSeconds,
    dsp: {
      seed,
      oscillator: {
        baseFrequency: base.baseFrequency,
        shape: family?.id === 'servo-tick' ? 'square' : family?.id === 'energy-charge' ? 'sawtooth' : 'sine',
        fmDepth: clamp(material * 520 + motion * 110, 0, 700),
        motionRate: clamp(0.3 + motion * 8.2, 0.1, 11),
      },
      resonators: base.resonators.map((ratio, index) => ({
        ratio: ratio + variation * (index + 1) * 0.018,
        gain: clamp(resonanceBase - index * 0.07 + brightness * 0.12, 0.08, 0.82),
        decay: clamp(0.08 + space * 1.15 + material * 0.28 - index * 0.04, 0.04, 1.6),
      })),
      filter: {
        type: base.filter,
        frequency: filterFrequency,
        q: clamp(0.7 + material * 7.8, 0.7, 9.4),
        sweep: (motion - 0.5) * (family?.id === 'air-whoosh' ? 1.6 : 0.72),
      },
      noise: {
        gain: clamp(base.noise * (0.35 + brightness * 0.45 + variation * 0.35), 0, 0.86),
        gateRate: clamp(1 + motion * 28 + variation * 18, 1, 46),
      },
      transient: {
        clickGain: clamp(0.014 + material * 0.055 + brightness * 0.025, 0.006, 0.09),
        attackMs: clamp(1.5 + (1 - material) * 18, 1, 26),
      },
      waveshaper: {
        drive: clamp(base.drive + material * 0.32 + brightness * 0.12, 0, 0.8),
        fold: clamp(variation * 0.28 + material * 0.12, 0, 0.42),
      },
      space: {
        mix: clamp(0.03 + space * 0.32, 0, 0.38),
        decaySeconds: clamp(0.16 + space * 1.65, 0.12, 2.1),
        width: clamp(0.16 + space * 0.72, 0.1, 0.92),
      },
      safety: {
        outputGain: clamp(0.54 + (1 - material) * 0.08 - base.noise * 0.08, 0.38, 0.9),
        limiter: 0.92,
      },
    },
  };
}

export function buildSoundLabPatch(family, macros = SOUND_LAB_MACROS, options = {}) {
  const values = macroValues(macros);
  const familyId = family?.id ?? 'metal-impact';
  const base = FAMILY_BASES[familyId] ?? FAMILY_BASES['metal-impact'];
  const presetDna = getPresetDnaById(options.presetId, family?.id) ?? getPresetDnaForFamily(family?.id)[0] ?? presetDnaLibrary[0];
  const { seed, durationSeconds, dsp: baseDsp } = buildLegacyDsp(family, base, values);
  const engineMode = getEngineMode(options.engineMode);
  const performance = performanceValues(options.performance);
  const xyPad = xyPadValues(options.xyPad);
  const modMatrix = modMatrixValues(options.modMatrix, values, xyPad);
  const dsp = applyModMatrixToDsp(baseDsp, modMatrix, values, xyPad, performance);
  const layerData = buildLayers({ family, base, dsp, durationSeconds, values, options, presetDna });
  const quality = getQualityMode(layerData.qualityMode);
  const masterPolish = buildMasterPolish(values, dsp, quality, layerData);
  const toneGraph = buildToneGraph(family, values, dsp, quality, performance, { ...options, masterPolish });
  const fxRack = orderFxRack(toneGraph.effects, options.fxOrder);
  toneGraph.effects = fxRack;
  const macroModulation = buildMacroModulation(values);
  const space = normalize(values.space);
  const material = normalize(values.material);

  return {
    id: `${familyId}-${presetDna.id}-${seed}`,
    libraryKey: `${familyId}-${presetDna.id}`,
    familyId,
    workletName: family?.workletName ?? 'modal-metal',
    engineMode,
    durationSeconds,
    macros: values,
    performance,
    presetDna,
    qualityMode: layerData.qualityMode,
    sampleMix: layerData.sampleMix,
    layerMix: layerData.layerMix,
    layers: layerData.layers,
    xyPad,
    modMatrix,
    envelope: toneGraph.envelope,
    fxOrder: fxRack.map((slot) => slot.id),
    globalFx: {
      space: {
        mix: clamp(dsp.space.mix * quality.fxScale, 0, 0.48),
        decaySeconds: clamp(dsp.space.decaySeconds * quality.fxScale, 0.1, 2.8),
        width: dsp.space.width,
      },
      dynamics: {
        drive: clamp(dsp.waveshaper.drive * (0.86 + material * 0.44), 0, 1.1),
        tone: clamp(dsp.filter.frequency, 120, 16000),
      },
      softLimiter: {
        ceiling: layerData.qualityMode === 'studio' ? 0.94 : 0.92,
        releaseMs: layerData.qualityMode === 'draft' ? 55 : 90,
      },
      masterPolish,
    },
    toneGraph,
    fxRack,
    macroModulation,
    fallbackChain: engineMode === 'hq' ? ['tone', 'worklet', 'webaudio'] : engineMode === 'worklet' ? ['worklet', 'webaudio'] : ['webaudio'],
    licenseNotice: `${presetDna.source.name}: ${presetDna.source.license.label}; sample sweeteners are procedural/generated in app. PresetShare public domain terms are used only for source qualification, not raw file bundling.`,
    sampleAssets: SOUND_LAB_SAMPLE_ASSETS,
    dsp,
  };
}

export function buildWorkletMessage(patch) {
  return {
    type: 'sound-lab:play',
    id: patch.id,
    familyId: patch.familyId,
    payload: {
      sampleRateHint: 48000,
      durationSeconds: patch.durationSeconds,
      seed: patch.dsp.seed,
      oscillator: patch.dsp.oscillator,
      resonators: patch.dsp.resonators,
      filter: patch.dsp.filter,
      noise: patch.dsp.noise,
      transient: patch.dsp.transient,
      waveshaper: patch.dsp.waveshaper,
      space: patch.dsp.space,
      safety: patch.dsp.safety,
      qualityMode: patch.qualityMode,
      presetDnaId: patch.presetDna?.id,
      layerMix: patch.layerMix,
      sampleMix: patch.sampleMix,
      layers: patch.layers,
      envelope: patch.envelope,
      xyPad: patch.xyPad,
      modMatrix: patch.modMatrix,
      fxOrder: patch.fxOrder,
      globalFx: patch.globalFx,
      engineMode: patch.engineMode,
      performance: patch.performance,
      toneGraph: patch.toneGraph,
      fxRack: patch.fxRack,
      macroModulation: patch.macroModulation,
      fallbackChain: patch.fallbackChain,
    },
  };
}

function buildMeters(patch) {
  const values = patch.macros;
  return [
    { id: 'spectrum', labelZh: '频谱密度', value: clamp(values.brightness * 0.62 + values.material * 0.38, 0, 100) },
    { id: 'transient', labelZh: '瞬态硬度', value: clamp(values.material * 0.74 + values.brightness * 0.26, 0, 100) },
    { id: 'motion', labelZh: '运动量', value: values.motion },
    { id: 'tail', labelZh: '尾巴长度', value: values.space },
    { id: 'variation', labelZh: '变体随机', value: values.variation },
  ];
}

function buildSoundQuality(patch) {
  const tonalLayers = patch.layers.filter((layer) => layer.unison);
  const unisonLayers = tonalLayers.length ? tonalLayers : patch.layers;
  const voiceCounts = unisonLayers.map((layer) => layer.unison?.voices ?? 1);
  const maxVoices = Math.max(1, ...voiceCounts);
  const avgDetune = tonalLayers.length
    ? tonalLayers.reduce((total, layer) => total + (layer.unison?.detuneCents ?? 0), 0) / tonalLayers.length
    : 0;
  const avgDrift = tonalLayers.length
    ? tonalLayers.reduce((total, layer) => total + (layer.unison?.analogDrift ?? 0), 0) / tonalLayers.length
    : 0;
  const maxSpread = Math.max(
    patch.globalFx?.space?.width ?? 0,
    ...patch.layers.map((layer) => layer.stereoSpread ?? 0),
  );
  const tailSafety = clamp((patch.globalFx?.space?.mix ?? 0) * 92 + (patch.globalFx?.softLimiter?.ceiling ?? 0.9) * 18, 0, 100);
  const polish = patch.globalFx?.masterPolish ?? {};
  const comfortBus = polish.comfortBus ?? {};
  const polishScore = clamp(
    (polish.glue ?? 0) * 42
      + (polish.lowTighten ?? 0) * 28
      + (polish.airGuard ?? 0) * 42
      + (polish.transientHold ?? 0) * 24,
    0,
    100,
  );
  const comfortScore = clamp(
    (comfortBus.warmth ?? 0) * 28
      + (comfortBus.deHarsh ?? 0) * 54
      + (comfortBus.headroom ?? 0) * 360
      + (comfortBus.airTame ?? 0) * 28,
    0,
    100,
  );

  return [
    {
      id: 'unison',
      labelZh: 'Unison',
      value: clamp(maxVoices / 5 * 100, 0, 100),
      statusZh: `${maxVoices} voices`,
      noteZh: `${formatQualityNumber(avgDetune)} cents detune`,
    },
    {
      id: 'drift',
      labelZh: 'Drift',
      value: clamp(avgDrift * 3200, 0, 100),
      statusZh: 'slow pitch',
      noteZh: `${formatQualityNumber(avgDrift * 100)} cents motion`,
    },
    {
      id: 'stereo',
      labelZh: 'Stereo',
      value: clamp(maxSpread * 100, 0, 100),
      statusZh: 'wide layers',
      noteZh: `${formatQualityNumber(maxSpread * 100)}% spread`,
    },
    {
      id: 'tail',
      labelZh: 'Tail',
      value: tailSafety,
      statusZh: patch.qualityMode,
      noteZh: 'space + limiter',
    },
    {
      id: 'comfort',
      labelZh: 'Comfort',
      value: comfortScore,
      statusZh: '舒适余量',
      noteZh: 'de-harsh + headroom',
    },
    {
      id: 'polish',
      labelZh: 'Polish',
      value: polishScore,
      statusZh: '后级抛光',
      noteZh: 'glue + guard',
    },
  ];
}

function formatQualityNumber(value) {
  return Number.isFinite(value) ? String(Math.round(value * 10) / 10) : '0';
}

function buildWaveformFingerprint(patch) {
  const values = patch.macros;
  const totalGainByEngine = patch.layers.reduce((totals, layer) => {
    totals[layer.engine] = (totals[layer.engine] ?? 0) + clamp(layer.gain ?? 0, 0, 1.4);
    return totals;
  }, {});
  const modal = totalGainByEngine.modalResonator ?? 0;
  const fm = totalGainByEngine.fmBurst ?? 0;
  const comb = totalGainByEngine.combDelay ?? 0;
  const filteredNoise = totalGainByEngine.filteredNoise ?? 0;
  const sampleGrain = totalGainByEngine.sampleGrain ?? 0;
  const brightness = normalize(values.brightness);
  const material = normalize(values.material);
  const variation = normalize(values.variation);

  const ingredientValues = {
    sine: clamp(18 + modal * 26 + fm * 14 + (1 - material) * 12, 4, 96),
    square: clamp(8 + (patch.dsp.oscillator.shape === 'square' ? 38 : 0) + material * 14 + variation * 8, 3, 72),
    saw: clamp(10 + comb * 34 + brightness * 26 + fm * 12, 6, 94),
    triangle: clamp(8 + (1 - brightness) * 24 + modal * 10, 4, 68),
    noise: clamp(12 + filteredNoise * 30 + sampleGrain * 34 + patch.sampleMix * 18, 8, 98),
  };
  const labelById = {
    sine: 'Sine',
    square: 'Square',
    saw: 'Saw',
    triangle: 'Triangle',
    noise: 'Noise',
  };
  const listenById = {
    sine: '纯音锚点、钟感、可听到的基频。',
    square: '空心、硬边、像脉冲或电子方块感。',
    saw: '明亮、毛边、谐波密集，容易穿透。',
    triangle: '比 sine 更厚但仍柔和，适合支撑主体。',
    noise: '嘶声、砂砾、瞬态、空气和颗粒。',
  };
  const synthCheckById = {
    sine: 'solo modal/FM 主体，确认是否有稳定 pitch。',
    square: '听 pulse 边缘，过强会变硬、变扁。',
    saw: '扫低通，亮边消失得最快的部分通常是 saw/comb 贡献。',
    triangle: '降低亮度后还留下的柔和主体通常来自 triangle/sine 区域。',
    noise: 'solo transient/texture，确认 click、air、grain 是否来自噪声层。',
  };
  const ingredients = Object.entries(ingredientValues).map(([id, value]) => ({
    id,
    label: labelById[id],
    value: Math.round(value),
    listenZh: listenById[id],
    synthCheckZh: synthCheckById[id],
  }));
  const primary = ingredients.slice().sort((a, b) => b.value - a.value).slice(0, 2).map((item) => item.label).join(' + ');

  return {
    beginnerSummaryZh: `基础波形不是精确答案，而是听感地图：当前 Patch 主要像 ${primary}，再叠加噪声、调制和效果形成完整音效。`,
    ingredients,
    listeningSteps: [
      '先听纯音锚点：有没有稳定 pitch 或钟感主体。',
      '再听亮边：滤波扫低后最先消失的通常是 saw、comb 或高频噪声。',
      '检查空心感：方波/脉冲会带来硬边和 hollow 质感。',
      '最后 solo 噪声/瞬态：click、air、grain 不属于四个基础周期波形，要单独判断。',
    ],
  };
}

function buildPracticeLoop(family, patch, macroList) {
  const familyName = family?.titleZh?.split('：')[0] ?? '目标音效';
  const sortedMacros = macroList
    .slice()
    .sort((a, b) => Math.abs((b.value ?? 50) - 50) - Math.abs((a.value ?? 50) - 50));
  const focusMacro = sortedMacros[0] ?? macroList[0] ?? { id: 'brightness', labelZh: 'Brightness', value: 50 };
  const focusMacroId = focusMacro.id ?? 'brightness';
  const focusMacroLabelZh = focusMacro.labelZh ?? focusMacro.label ?? focusMacroId;
  const beforeValue = Math.round(Number(focusMacro.value ?? patch.macros?.[focusMacroId] ?? 50));
  const afterValue = Math.max(0, Math.min(100, beforeValue + (beforeValue >= 70 ? -18 : 18)));
  const expectedByMacro = {
    brightness: '注意亮度、齿边和穿透力是否增加；如果只是刺耳，先退回一半。',
    motion: '注意声音是否有移动感、速度感或机械感；如果主体不稳，降低变化幅度。',
    material: '注意硬度、金属感和非谐波侧频；如果失去目标身份，先减小材质宏。',
    space: '注意距离、尾巴和前后景；如果 transient 被冲淡，先保留 dry 主体。',
    variation: '注意随机性和生命感；如果每次都不像同一个音效，减少 variation。',
  };

  return {
    titleZh: '听辨闭环 A/B',
    goalZh: `把「${familyName}」从 Patch 变成可验证的目标音效，而不是只记住旋钮位置。`,
    focusMacroId,
    focusMacroLabelZh,
    beforeValue,
    afterValue,
    contrastZh: `${focusMacroLabelZh} ${beforeValue} -> ${afterValue}`,
    expectedCueZh: expectedByMacro[focusMacroId] ?? '听感方向应明确变化，但主体身份不能丢。',
    steps: [
      '先按 A 听 dry/core，再按 B 听 full patch，匹配响度后再判断。',
      `只改一个参数：把 ${focusMacroLabelZh} 从 ${beforeValue} 推到 ${afterValue}，不要同时动其它宏。`,
      '回到频谱和波形，确认变化来自频谱、包络、空间或调制，而不是音量变大。',
      '写一句结论：为什么改变了、有没有破坏主体、下一轮要修哪里。',
    ],
    checkpoints: [
      'A/B 音量差不要超过主观 1 dB。',
      '目标听感变化能用一个词说明。',
      '如果更刺耳但不更清楚，先撤回一半。',
    ],
    reaperNoteTemplate: `A/B ${familyName}: ${focusMacroLabelZh} ${beforeValue} -> ${afterValue}; 听感变化=____; 保留/撤回=____。`,
  };
}

function buildListeningCompass(family, patch, macroList, workflowStep = 'source') {
  const familyName = family?.titleZh?.split('：')[0] ?? '目标音效';
  const macros = patch.macros ?? {};
  const layerMix = patch.layerMix ?? {};
  const macroById = Object.fromEntries((macroList ?? []).map((macro) => [macro.id, macro]));
  const brightness = Math.round(macros.brightness ?? 50);
  const material = Math.round(macros.material ?? 50);
  const motion = Math.round(macros.motion ?? 50);
  const space = Math.round(macros.space ?? 50);
  const transientMix = Math.round(layerMix.transient ?? 0);
  const bodyMix = Math.round(layerMix.body ?? 0);
  const tailMix = Math.round(layerMix.tail ?? 0);
  const materialMacro = macroById.material?.labelZh ?? 'Material';
  const brightnessMacro = macroById.brightness?.labelZh ?? 'Brightness';
  const spaceMacro = macroById.space?.labelZh ?? 'Space';

  const stages = [
    {
      id: 'transient',
      labelZh: '1 起音',
      listenForZh: transientMix >= 62
        ? '先听第一下是否够快、够硬；如果 click 抢主体，降低 transient 或 attack 相关层。'
        : '先听起音是不是太软；如果目标是 hit / UI click，把 attack 和瞬态层推清楚。',
      checkZh: `Transient ${transientMix}% / ${brightnessMacro} ${brightness}`,
      action: 'focus-controls',
      actionLabelZh: '调起音',
      meter: clamp(transientMix, 0, 100),
    },
    {
      id: 'body',
      labelZh: '2 主体',
      listenForZh: `再听主体是不是像「${familyName}」：金属、玻璃、空气或机械材质应该来自频谱关系，而不是单纯变响。`,
      checkZh: `${materialMacro} ${material} / Body ${bodyMix}% / Motion ${motion}`,
      action: 'focus-waveform',
      actionLabelZh: '拆主体',
      meter: clamp((bodyMix + material) * 0.5, 0, 100),
    },
    {
      id: 'tail',
      labelZh: '3 尾巴',
      listenForZh: space >= 60
        ? '最后听尾巴是否服务动作；空间够大时要确认 transient 没被冲淡。'
        : '最后听尾巴是否太短；如果声音结束太干，少量加空间或 tail 层再做 A/B。',
      checkZh: `${spaceMacro} ${space} / Tail ${tailMix}%`,
      action: 'focus-practice-loop',
      actionLabelZh: '验尾巴',
      meter: clamp((tailMix + space) * 0.5, 0, 100),
    },
  ];

  const actionByWorkflow = {
    source: {
      action: 'focus-waveform',
      labelZh: '下一步：拆基础波形',
      noteZh: '先判断主体像 sine、saw、noise 还是它们的组合，再动材质参数。',
    },
    shape: {
      action: 'focus-practice-loop',
      labelZh: '下一步 A/B 验证',
      noteZh: '只改一个参数，先听一个听感问题，再决定保留还是撤回。',
    },
    compare: {
      action: 'compare-view',
      labelZh: '下一步：打开 A/B',
      noteZh: '匹配响度后判断 dry/core 与 full patch 的差异，不要被音量骗。',
    },
    deliver: {
      action: 'focus-export',
      labelZh: '下一步：写交付记录',
      noteZh: '把 dry、full、tail-only 三版导出，并写清楚本轮只改一个参数。',
    },
  };

  return {
    titleZh: '听辨导航',
    summaryZh: '把声音拆成起音、主体和尾巴三段听：先判断形状，再动参数，最后用 A/B 证明变化。',
    currentFocus: workflowStep,
    stages,
    nextAction: actionByWorkflow[workflowStep] ?? actionByWorkflow.source,
  };
}

function buildLayerMixer(patch) {
  const labels = {
    transient: 'Transient 瞬态',
    body: 'Body 主体',
    texture: 'Texture 质感',
    tail: 'Tail 尾音',
  };
  return Object.entries(patch.layerMix).map(([role, value]) => ({
    id: role,
    labelZh: labels[role] ?? role,
    value,
    percent: clamp(value, 0, 100),
    activeEngines: [...new Set(patch.layers.filter((layer) => layer.role === role).map((layer) => layer.engine))],
  }));
}

function buildPerformanceControls(patch) {
  return [
    { id: 'velocity', labelZh: 'Velocity 力度', value: patch.performance.velocity, min: 0, max: 127, step: 1, unit: '', lowZh: '轻触，瞬态和驱动更少。', highZh: '重触，瞬态、亮度和饱和更强。' },
    { id: 'glide', labelZh: 'Glide 滑音', value: patch.performance.glide, min: 0, max: 100, step: 1, unit: '%', lowZh: '立即到音高。', highZh: '更像可演奏合成器的滑音/上扬。' },
    { id: 'octave', labelZh: 'Octave 八度', value: patch.performance.octave, min: -2, max: 2, step: 1, unit: '', lowZh: '更低、更重。', highZh: '更亮、更轻。' },
  ];
}

function buildKeyboardNotes(baseOctave = 3) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return names.map((name, index) => ({
    id: `${name}${baseOctave}`,
    label: name,
    note: `${name}${baseOctave}`,
    isBlack: name.includes('#'),
    index,
  }));
}

function buildEnvelopeEditor(patch) {
  const envelope = patch.envelope ?? patch.toneGraph?.envelope ?? {};
  const attackMs = Math.round(envelope.attack * 1000);
  const decayMs = Math.round(envelope.decay * 1000);
  const releaseMs = Math.round(envelope.release * 1000);
  const sustain = Math.round(envelope.sustain * 100);
  return {
    target: 'amp',
    envelope,
    controls: [
      { id: 'attack', labelZh: 'Attack', value: attackMs, min: 1, max: 1500, unit: 'ms' },
      { id: 'decay', labelZh: 'Decay', value: decayMs, min: 10, max: 3200, unit: 'ms' },
      { id: 'sustain', labelZh: 'Sustain', value: sustain, min: 0, max: 100, unit: '%' },
      { id: 'release', labelZh: 'Release', value: releaseMs, min: 10, max: 4200, unit: 'ms' },
    ],
    points: [
      { id: 'start', x: 0, y: 100 },
      { id: 'attack', x: clamp(attackMs / 15, 4, 34), y: 0 },
      { id: 'decay', x: clamp(34 + decayMs / 28, 38, 74), y: 100 - sustain },
      { id: 'release', x: 100, y: 100 },
    ],
  };
}

function buildMacroMorph(values, amount = 0) {
  const a = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, clamp(value - 18, 0, 100)]));
  const b = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, clamp(value + 18, 0, 100)]));
  const mix = clamp(amount, 0, 100) / 100;
  const morphed = Object.fromEntries(Object.keys(values).map((key) => [key, Math.round(a[key] + (b[key] - a[key]) * mix)]));
  return { amount: clamp(amount, 0, 100), a, b, morphed };
}

function buildAbCompare(patch, activeSlot = 'a') {
  const slot = activeSlot === 'b' ? 'b' : 'a';
  return {
    activeSlot: slot,
    a: {
      label: 'A Dry/Core',
      macros: { ...patch.macros, space: 0, variation: 0 },
      engineMode: 'webaudio',
    },
    b: {
      label: 'B Full Patch',
      macros: patch.macros,
      engineMode: patch.engineMode,
    },
    diff: SOUND_LAB_MACRO_DEFS.map((macro) => ({
      id: macro.id,
      labelZh: macro.labelZh,
      delta: patch.macros[macro.id] - (macro.id === 'space' || macro.id === 'variation' ? 0 : patch.macros[macro.id]),
    })),
  };
}

export function formatBatchExportName(pattern = '{family}_{preset}_{date}_{version}_{variant}', values = {}) {
  const sanitize = (value) => String(value ?? '')
    .trim()
    .replace(/[/\\:*?"<>|]+/g, ' ')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5._ -]+/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  const tokens = {
    family: sanitize(values.family ?? 'sound-family'),
    preset: sanitize(values.preset ?? 'preset'),
    date: sanitize(values.date ?? new Date().toISOString().slice(0, 10)),
    bpm: sanitize(values.bpm ?? ''),
    key: sanitize(values.key ?? ''),
    macro: sanitize(values.macro ?? ''),
    version: `v${String(Math.max(0, Number(values.version ?? 1))).padStart(3, '0')}`,
    variant: String(Math.max(0, Number(values.variant ?? 1))).padStart(3, '0'),
  };
  return pattern.replace(/\{([a-zA-Z0-9_-]+)\}/g, (_, token) => tokens[token] ?? sanitize(values[token] ?? token));
}

export function buildWorkbenchLibraryState({
  patch,
  favoriteIds = [],
  projects = [],
  gitSync = {},
  midiMappings = [],
} = {}) {
  const safePatchId = patch?.id ?? 'unsaved-patch';
  const safePatchKey = patch?.libraryKey ?? safePatchId;
  const owner = gitSync.owner ?? 'Zhaoshangqi';
  const repo = gitSync.repo ?? 'synth-sfx-learning-tool';
  const branch = gitSync.branch ?? 'main';
  const basePath = (gitSync.basePath ?? 'data/user-presets/default').replace(/^\/+|\/+$/g, '');
  return {
    favorites: favoriteIds.map((patchId) => ({
      patchId,
      active: patchId === safePatchKey || patchId === safePatchId,
    })),
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      tags: project.tags ?? [],
      patchIds: project.patchIds ?? [],
    })),
    gitSync: {
      owner,
      repo,
      branch,
      basePath,
      apiPath: `/repos/${owner}/${repo}/contents/${basePath}/library.json`,
      patchPath: `${basePath}/patches/${safePatchKey}.json`,
      enabled: Boolean(owner && repo),
    },
    midiMappings: midiMappings.map((mapping) => ({
      controlId: mapping.controlId,
      messageType: mapping.messageType ?? 'cc',
      channel: clamp(mapping.channel ?? 1, 1, 16),
      number: clamp(mapping.number ?? 1, 0, 127),
    })),
    exportRules: {
      pattern: '{family}_{preset}_{date}_{version}_{variant}',
      preview: formatBatchExportName('{family}_{preset}_{date}_{version}_{variant}', {
        family: patch?.familyId ?? 'sound',
        preset: patch?.presetDna?.titleZh ?? 'preset',
        version: 1,
        variant: 1,
      }),
    },
  };
}

export function buildSoundLabViewModel(family, macros = SOUND_LAB_MACROS, options = {}) {
  const patch = buildSoundLabPatch(family, macros, options);
  const macroList = SOUND_LAB_MACRO_DEFS.map((macro) => {
    const value = patch.macros[macro.id];
    return {
      ...macro,
      value,
      percent: clamp(value, 0, 100),
    };
  });
  const presetDnaOptions = getPresetDnaForFamily(family?.id);
  const patchJson = JSON.stringify({
    familyId: patch.familyId,
    engineMode: patch.engineMode,
    qualityMode: patch.qualityMode,
    presetDnaId: patch.presetDna.id,
    performance: patch.performance,
    macros: patch.macros,
    layerMix: patch.layerMix,
    envelope: patch.envelope,
    xyPad: patch.xyPad,
    modMatrix: patch.modMatrix,
    fxOrder: patch.fxOrder,
    layers: patch.layers.map((layer) => ({
      id: layer.id,
      role: layer.role,
      engine: layer.engine,
      gain: layer.gain,
      stereoSpread: layer.stereoSpread,
      unison: layer.unison,
    })),
    globalFx: patch.globalFx,
    toneGraph: patch.toneGraph,
    fxRack: patch.fxRack,
    macroModulation: patch.macroModulation,
    fallbackChain: patch.fallbackChain,
    dsp: patch.dsp,
  }, null, 2);
  const reaperNotes = [
    `REAPER Sound Lab: ${family.titleZh}`,
    `Patch: ${patch.id}`,
    `Preset DNA: ${patch.presetDna.titleZh} (${patch.presetDna.source.name})`,
    `Quality: ${patch.qualityMode}`,
    `Macros: ${macroList.map((macro) => `${macro.id}=${macro.value}`).join(', ')}`,
    `Layers: ${Object.entries(patch.layerMix).map(([role, value]) => `${role}=${value}`).join(', ')}`,
    `Export: ${family.reaperExport.join(' / ')}`,
  ].join('\n');

  return {
    patch,
    macros: macroList,
    meters: buildMeters(patch),
    soundQuality: buildSoundQuality(patch),
    waveformFingerprint: buildWaveformFingerprint(patch),
    practiceLoop: buildPracticeLoop(family, patch, macroList),
    listeningCompass: buildListeningCompass(family, patch, macroList, options.workflowStep ?? options.activeWorkflowStep ?? 'source'),
    evidence: family.sourceIds,
    patchJson,
    reaperNotes,
    presetDnaOptions,
    qualityModes: SOUND_LAB_QUALITY_MODES,
    engineModes: SOUND_LAB_ENGINE_MODES,
    advancedModules: SOUND_LAB_ADVANCED_MODULES,
    activeEngineMode: patch.engineMode,
    performanceControls: buildPerformanceControls(patch),
    keyboardNotes: buildKeyboardNotes(3 + patch.performance.octave),
    fxRack: patch.fxRack,
    fxChain: { slots: patch.fxRack },
    modMatrix: {
      sources: SOUND_LAB_MOD_SOURCES,
      targets: SOUND_LAB_MOD_TARGETS,
      routes: patch.modMatrix,
    },
    envelopeEditor: buildEnvelopeEditor(patch),
    xyPad: patch.xyPad,
    macroMorph: buildMacroMorph(patch.macros, options.macroMorph ?? 0),
    abCompare: buildAbCompare(patch, options.abSlot ?? 'a'),
    library: buildWorkbenchLibraryState({
      patch,
      favoriteIds: options.favoriteIds ?? [],
      projects: options.projects ?? [],
      gitSync: options.gitSync ?? {},
      midiMappings: options.midiMappings ?? [],
    }),
    layerMixer: buildLayerMixer(patch),
    sampleAssets: SOUND_LAB_SAMPLE_ASSETS,
    sourceDrawer: {
      titleZh: patch.presetDna.titleZh,
      sourceName: patch.presetDna.source.name,
      sourceUrl: patch.presetDna.source.url,
      extractionZh: patch.presetDna.source.extractionZh,
      licenseLabel: patch.presetDna.source.license.label,
      licenseNotice: patch.licenseNotice,
    },
    spectrumBars: Array.from({ length: 18 }, (_, index) => {
      const resonator = patch.dsp.resonators[index % patch.dsp.resonators.length];
      const layerBoost = patch.layers[index % patch.layers.length]?.gain ?? 0.3;
      return clamp(14 + resonator.gain * 56 + layerBoost * 30 + Math.sin(index * 0.85 + patch.dsp.seed) * 7, 8, 96);
    }),
  };
}
