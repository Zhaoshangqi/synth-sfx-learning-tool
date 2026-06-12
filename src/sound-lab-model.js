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

function buildFxRack(values, dsp, quality) {
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
  ];
}

function buildToneGraph(family, values, dsp, quality, performance) {
  const familyId = family?.id ?? 'metal-impact';
  const instrumentByFamily = {
    'metal-impact': 'MetalSynth + FMSynth',
    'glass-ping': 'FMSynth + Synth partial stack',
    'electric-crackle': 'NoiseSynth + FMSynth sparks',
    'air-whoosh': 'NoiseSynth + AutoFilter',
    'servo-tick': 'Synth pulse + PitchShift',
    'energy-charge': 'FMSynth + AMSynth + PolySynth',
  };
  const fxRack = buildFxRack(values, dsp, quality);
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
    envelope: {
      attack: clamp(dsp.transient.attackMs / 1000, 0.001, 0.18),
      decay: clamp((familyId === 'air-whoosh' ? 0.65 : 0.12) + space * 0.65, 0.04, 1.4),
      sustain: performance.hold ? clamp(0.24 + space * 0.34, 0.08, 0.78) : clamp(0.02 + space * 0.14, 0, 0.28),
      release: clamp(0.08 + space * 1.1, 0.04, 1.6),
    },
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

function buildLayer(recipe, context, index) {
  const { base, dsp, durationSeconds, layerMix, quality, material, brightness, motion, space, variation, sampleMix } = context;
  const role = recipe.role;
  const gain = roleGain(role, layerMix, quality, recipe.gain);
  const envelope = layerEnvelope(role, durationSeconds, material, space);
  const pan = clamp((index - 2) * 0.11 + (variation - 0.5) * 0.18, -0.55, 0.55);
  const sampleAsset = recipe.sampleAssetId ? getSampleAsset(recipe.sampleAssetId) : null;

  const common = {
    id: `${role}-${recipe.engine}-${index}`,
    role,
    engine: recipe.engine,
    gain: recipe.engine === 'sampleGrain' ? gain * sampleMix : gain,
    pan,
    envelope,
  };

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
  const base = FAMILY_BASES[family?.id] ?? FAMILY_BASES['metal-impact'];
  const presetDna = getPresetDnaById(options.presetId, family?.id) ?? getPresetDnaForFamily(family?.id)[0] ?? presetDnaLibrary[0];
  const { seed, durationSeconds, dsp } = buildLegacyDsp(family, base, values);
  const layerData = buildLayers({ family, base, dsp, durationSeconds, values, options, presetDna });
  const quality = getQualityMode(layerData.qualityMode);
  const engineMode = getEngineMode(options.engineMode);
  const performance = performanceValues(options.performance);
  const toneGraph = buildToneGraph(family, values, dsp, quality, performance);
  const macroModulation = buildMacroModulation(values);
  const space = normalize(values.space);
  const material = normalize(values.material);

  return {
    id: `${family?.id ?? 'sound'}-${presetDna.id}-${seed}`,
    familyId: family?.id ?? 'metal-impact',
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
    },
    toneGraph,
    fxRack: toneGraph.effects,
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
    layers: patch.layers.map((layer) => ({ id: layer.id, role: layer.role, engine: layer.engine, gain: layer.gain })),
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
    evidence: family.sourceIds,
    patchJson,
    reaperNotes,
    presetDnaOptions,
    qualityModes: SOUND_LAB_QUALITY_MODES,
    engineModes: SOUND_LAB_ENGINE_MODES,
    activeEngineMode: patch.engineMode,
    performanceControls: buildPerformanceControls(patch),
    keyboardNotes: buildKeyboardNotes(3 + patch.performance.octave),
    fxRack: patch.fxRack,
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
