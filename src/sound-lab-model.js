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

export const SOUND_LAB_PARAMETER_COACH = {
  macros: {
    brightness: {
      titleZh: 'Brightness 明暗',
      targetZh: 'Filter cutoff / WT position / harmonic brightness',
      listenZh: '先听 3k-10k 的边缘：变亮会更容易识别金属和电流，但过高会刺耳、变薄。',
      synthZh: 'Serum/Vital 调 filter cutoff、wavetable position 或 noise bright；Phase Plant 调 filter 与 harmonic lane。',
      reaperZh: '导出两版只改 Brightness，频谱里检查 3k-10k 是否增加但峰值不过尖。',
    },
    motion: {
      titleZh: 'Motion 动态',
      targetZh: 'LFO rate / envelope movement / sweep depth',
      listenZh: '听声音是否有方向感：上扫、抖动和速度来自 motion；太高会像音色不稳定。',
      synthZh: 'Serum 用 LFO 推 WT/filter；Phase Plant 用 LFO/Random 调 generator；Vital 用 LFO 或 Random 推 filter/pan。',
      reaperZh: '连续触发三次，确认变化有生命感但仍像同一个 Patch。',
    },
    material: {
      titleZh: 'Material 材质',
      targetZh: 'FM depth / inharmonic partials / resonator density',
      listenZh: '听主体是不是更硬、更金属、更非谐波；材质高时要注意不要只剩尖锐 click。',
      synthZh: 'Serum/Vital 增加 FM/ring/warp 与短 resonant filter；Phase Plant 增加 FM lane 或 modal layer。',
      reaperZh: '用 dry 版先判断材质，再加空间；否则 reverb 会掩盖材质真假。',
    },
    space: {
      titleZh: 'Space 空间',
      targetZh: 'Reverb mix / delay send / stereo width',
      listenZh: '听尾巴长度、左右宽度和距离感；空间只服务交付，不应该盖住 transient。',
      synthZh: 'Serum/Vital 控 reverb mix/width；Phase Plant 放到 FX lane，优先做 send 感而不是全湿。',
      reaperZh: '导出 dry/full/tail-only 三版，确认 tail 不抢主体。',
    },
    variation: {
      titleZh: 'Variation 变体',
      targetZh: 'random seed / sample offset / micro pitch drift',
      listenZh: '听每次触发是不是有细微差异；变体太高会让同一按钮像多个音色。',
      synthZh: 'Serum/Vital 用 Chaos/Random 做小幅变化；Phase Plant 用 Random modulator 控 texture，不要同时大改音高。',
      reaperZh: '渲染 3-5 个 variant，保留最好的一版并写清楚改动。',
    },
  },
  performance: {
    velocity: {
      titleZh: 'Velocity 力度',
      targetZh: 'transient gain / drive / filter response',
      listenZh: '听轻触和重触的起音差异：力度应该让声音更有演奏感，而不是只变大声。',
      synthZh: '三款合成器都把 velocity 映射到 amp、filter 或 drive，深度先小后大。',
      reaperZh: '用两个 MIDI velocity 渲染 A/B，检查动态差异是否可听。',
    },
    glide: {
      titleZh: 'Glide 滑音',
      targetZh: 'portamento / parameter smoothing',
      listenZh: '听音高和参数是否连续移动；合成器感来自平滑过渡，不是硬切。',
      synthZh: 'Serum/Vital 打开 mono/porta；Phase Plant 用 glide 或 pitch envelope 做上扬。',
      reaperZh: '拖动时录屏或渲染长音，确认没有 zipper noise 和突兀台阶。',
    },
    octave: {
      titleZh: 'Octave 八度',
      targetZh: 'root pitch / body weight / spectral range',
      listenZh: '低八度更重更厚，高八度更轻更亮；先定音区再调材质。',
      synthZh: '先改 oscillator octave，再微调 filter 和 envelope，不要反过来补救。',
      reaperZh: '同一 MIDI item 渲染三档八度，选最贴近画面尺寸的一档。',
    },
  },
  layers: {
    transient: {
      titleZh: 'Transient 瞬态层',
      targetZh: 'click / snap / first 20ms',
      listenZh: '听第一下是否清楚但不扎耳；过多会像 UI click，过少会没有命中感。',
      synthZh: '用 noise burst、短 envelope 或 sample click 独立成层。',
      reaperZh: '放大波形前 50ms，检查 transient 是否和主体对齐。',
    },
    body: {
      titleZh: 'Body 主体层',
      targetZh: 'fundamental / modal body / weight',
      listenZh: '听声音是否有可识别的主体重量；body 不够会只剩噪声和尖峰。',
      synthZh: '用 sine/triangle/FM carrier 或 modal partial 做主体，不要让噪声承担全部重量。',
      reaperZh: '高通/低通各听一次，确认主体频段真实存在。',
    },
    texture: {
      titleZh: 'Texture 质感层',
      targetZh: 'noise / grain / edge detail',
      listenZh: '听空气、电流、刮擦或金属碎屑；texture 应该贴着主体，不应单独抢戏。',
      synthZh: '用 noise、sample grains、filter resonance 或 wavetable edge 做细节。',
      reaperZh: '导出 texture-only 辅助检查，确认它是细节不是另一个声音。',
    },
    tail: {
      titleZh: 'Tail 尾音层',
      targetZh: 'release / room / delay tail',
      listenZh: '听尾巴是否自然退场；过长会拖慢动作，过短会显得干瘪。',
      synthZh: '用 release、delay send、reverb send 控尾巴，保留 dry transient。',
      reaperZh: '导出 tail-only，检查结尾有没有噪声、爆音或多余低频。',
    },
  },
  envelope: {
    attack: {
      titleZh: 'Attack 起音',
      targetZh: 'amp envelope attack',
      listenZh: 'Attack 越短越硬，越长越软；做 UI/impact 通常先保持短。',
      synthZh: '三款合成器先调 Amp Env attack，再看是否需要 filter envelope。',
      reaperZh: '只改 attack 渲染 A/B，观察波形前沿是否变钝。',
    },
    decay: {
      titleZh: 'Decay 衰减',
      targetZh: 'amp/filter envelope decay',
      listenZh: 'Decay 决定主体持续多久；短是 pluck/click，长是 hit/body。',
      synthZh: '把 Amp Decay 和 Filter Decay 分开听，避免同时乱动。',
      reaperZh: '看波形从峰值掉到主体的速度，确认动作长度合适。',
    },
    sustain: {
      titleZh: 'Sustain 延音',
      targetZh: 'held body level',
      listenZh: 'Sustain 高会变成持续音，低会更像一次性音效。',
      synthZh: '音效里 sustain 通常很低，除非做能量充能、机械循环或氛围。',
      reaperZh: '用短 MIDI note 和长 MIDI note 各渲染一次，确认释放逻辑。',
    },
    release: {
      titleZh: 'Release 释放',
      targetZh: 'tail after note off',
      listenZh: 'Release 控尾巴退场；太短会被切断，太长会糊后续动作。',
      synthZh: '先调 Amp Release，再让 reverb/delay 接住空间。',
      reaperZh: '检查 item 结尾有没有截断，必要时导出 tail-only。',
    },
  },
  special: {
    xyPad: {
      titleZh: 'XY Pad 手势调制',
      targetZh: 'X = tone/material, Y = space/motion',
      listenZh: '听一个手势是否同时改变材质和空间；手势要有方向，不要只是变乱。',
      synthZh: 'Serum/Vital 用 Macro 或 XY 映射；Phase Plant 用 Macro controls 映射多个目标。',
      reaperZh: '录一段 automation，确认动作曲线和画面动作同步。',
    },
    macroMorph: {
      titleZh: 'Macro Morph A/B',
      targetZh: 'morph between two macro snapshots',
      listenZh: '听 A 到 B 是否是连续变化；如果中间塌陷，说明两个快照目标不一致。',
      synthZh: '把 A/B 差异限制在 2-3 个宏，避免所有参数一起漂。',
      reaperZh: '导出 A、中间、B 三版，检查中间态是否可用。',
    },
    modRoute: {
      titleZh: 'Mod Matrix 深度',
      targetZh: 'source -> target amount',
      listenZh: '听调制是否刚好可感知；太深会像参数失控，太浅会像没动。',
      synthZh: '先固定 source，再只改 amount；不要同时换 source 和 target。',
      reaperZh: 'A/B 一版关闭调制，一版打开调制，确认变化来自目标参数。',
    },
  },
};

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
  const bodyMix = clamp((layerData.layerMix?.body ?? SOUND_LAB_LAYER_MIX.body) / 100, 0, 1);
  const textureMix = clamp((layerData.layerMix?.texture ?? SOUND_LAB_LAYER_MIX.texture) / 100, 0, 1);
  const tailMix = clamp((layerData.layerMix?.tail ?? SOUND_LAB_LAYER_MIX.tail) / 100, 0, 1);
  const studioBonus = quality.id === 'studio' ? 0.13 : quality.id === 'balanced' ? 0.06 : 0;
  const comfortBus = {
    warmth: clamp(0.1 + (1 - brightness) * 0.12 + material * 0.08 + tailMix * 0.05 + studioBonus * 0.5, 0.06, 0.42),
    deHarsh: clamp(0.14 + brightness * 0.24 + textureMix * 0.18 + material * 0.08 + studioBonus * 0.52, 0.08, 0.62),
    headroom: clamp(0.045 + transientMix * 0.026 + material * 0.024 + (quality.id === 'studio' ? 0.038 : 0.018), 0.035, 0.15),
    airTame: clamp(0.08 + brightness * 0.16 + variation * 0.1 + textureMix * 0.08, 0.05, 0.46),
    loudnessMatch: clamp(0.99 - transientMix * 0.035 - material * 0.032 - tailMix * 0.018 + studioBonus * 0.04, 0.82, 1.03),
    monoAnchor: clamp(0.07 + material * 0.12 + transientMix * 0.12 + (1 - space) * 0.04 + studioBonus * 0.18, 0.04, 0.36),
    widthTrim: clamp(0.03 + space * 0.08 + tailMix * 0.05 + studioBonus * 0.12, 0.02, 0.24),
    tailDuck: clamp(0.05 + transientMix * 0.14 + tailMix * 0.08 + material * 0.04 + studioBonus * 0.12, 0.04, 0.3),
  };
  const temporalWetDuck = clamp(0.08 + transientMix * 0.18 + tailMix * 0.16 + space * 0.12 + studioBonus * 0.24, 0.05, 0.56);
  const temporalMasking = {
    attackHoldMs: Math.round(clamp(18 + transientMix * 28 + material * 12 + studioBonus * 48, 12, 74)),
    releaseMs: Math.round(clamp(80 + tailMix * 150 + space * 100 + motion * 34 + studioBonus * 120, 70, 360)),
    wetDuck: Number(temporalWetDuck.toFixed(3)),
    tailDuckDb: Number(clamp(temporalWetDuck * 13.5, 1, 9).toFixed(1)),
    transientProtect: Number(clamp(0.07 + transientMix * 0.18 + material * 0.08 + studioBonus * 0.16, 0.04, 0.42).toFixed(3)),
    sideDuck: Number(clamp(0.035 + tailMix * 0.12 + space * 0.1 + studioBonus * 0.08, 0.02, 0.28).toFixed(3)),
  };
  const motionBus = {
    microDynamics: clamp(0.032 + motion * 0.052 + variation * 0.035 + studioBonus * 0.16, 0.02, 0.17),
    transientShield: clamp(0.055 + transientMix * 0.18 + material * 0.055 + studioBonus * 0.22, 0.035, 0.34),
    tailBloom: clamp(0.035 + space * 0.11 + tailMix * 0.08 + motion * 0.035 + studioBonus * 0.16, 0.02, 0.32),
    wowFlutter: clamp(0.0015 + variation * 0.006 + motion * 0.0035 + studioBonus * 0.018, 0.001, 0.038),
  };
  const dynamicDetail = {
    transientAir: Number(clamp(0.045 + transientMix * 0.13 + brightness * 0.11 + textureMix * 0.055 + studioBonus * 0.45, 0.025, 0.36).toFixed(3)),
    bodyGlue: Number(clamp(0.055 + bodyMix * 0.14 + material * 0.1 + motion * 0.035 + studioBonus * 0.42, 0.025, 0.34).toFixed(3)),
    outputSilk: Number(clamp(0.06 + brightness * 0.07 + material * 0.08 + (comfortBus.deHarsh ?? 0) * 0.18 + studioBonus * 0.38, 0.035, 0.38).toFixed(3)),
    snapWindowMs: Math.round(clamp(10 + transientMix * 14 + material * 8 + studioBonus * 42, 8, 42)),
  };
  const transientGloss = {
    crestClamp: Number(clamp(0.052 + transientMix * 0.16 + material * 0.07 + studioBonus * 0.28, 0.035, 0.36).toFixed(3)),
    harmonicAir: Number(clamp(0.038 + brightness * 0.085 + textureMix * 0.07 + transientMix * 0.04 + studioBonus * 0.28, 0.022, 0.32).toFixed(3)),
    bodyFocus: Number(clamp(0.045 + bodyMix * 0.13 + material * 0.085 + (1 - space) * 0.035 + studioBonus * 0.22, 0.024, 0.34).toFixed(3)),
    aliasGuard: Number(clamp(0.052 + brightness * 0.12 + material * 0.05 + variation * 0.045 + studioBonus * 0.22, 0.03, 0.34).toFixed(3)),
    crestWindowMs: Math.round(clamp(6 + transientMix * 9 + material * 4 + studioBonus * 34, 5, 28)),
  };
  const spectralBalance = {
    lowBody: Number(clamp(0.035 + bodyMix * 0.1 + material * 0.06 + (1 - brightness) * 0.03 + studioBonus * 0.22, 0.02, 0.3).toFixed(3)),
    lowMidGlue: Number(clamp(0.032 + bodyMix * 0.08 + material * 0.05 + transientMix * 0.035 + studioBonus * 0.18, 0.018, 0.26).toFixed(3)),
    highTame: Number(clamp(0.06 + brightness * 0.2 + textureMix * 0.12 + material * 0.05 + studioBonus * 0.2, 0.04, 0.52).toFixed(3)),
    tiltCompensation: Number(clamp(0.038 + brightness * 0.12 + textureMix * 0.06 + studioBonus * 0.16, 0.02, 0.32).toFixed(3)),
    bodyShelfHz: Math.round(clamp(140 + material * 210 + bodyMix * 110 - space * 38, 120, 520)),
    airShelfHz: Math.round(clamp(6200 + brightness * 2600 + textureMix * 900 - material * 260, 5200, 12000)),
  };

  return {
    glue: clamp(0.12 + material * 0.22 + motion * 0.09 + studioBonus, 0.08, 0.62),
    lowTighten: clamp(0.1 + material * 0.16 + (1 - space) * 0.1 + dsp.waveshaper.drive * 0.08, 0.06, 0.45),
    airGuard: clamp(0.12 + brightness * 0.3 + textureMix * 0.1 + variation * 0.07, 0.08, 0.6),
    transientHold: clamp(0.16 + transientMix * 0.3 + material * 0.13, 0.12, 0.72),
    bodyGain: clamp(0.98 - studioBonus * 0.12 - material * 0.05, 0.86, 1),
    comfortBus,
    temporalMasking,
    motionBus,
    dynamicDetail,
    transientGloss,
    spectralBalance,
    analogGesture: layerData.analogGesture,
  };
}

function buildSpatialImage(values, dsp, quality, layerData = {}, acousticCues = {}, masterPolish = {}) {
  const space = normalize(values.space);
  const motion = normalize(values.motion);
  const material = normalize(values.material);
  const variation = normalize(values.variation);
  const transientMix = clamp((layerData.layerMix?.transient ?? SOUND_LAB_LAYER_MIX.transient) / 100, 0, 1);
  const bodyMix = clamp((layerData.layerMix?.body ?? SOUND_LAB_LAYER_MIX.body) / 100, 0, 1);
  const textureMix = clamp((layerData.layerMix?.texture ?? SOUND_LAB_LAYER_MIX.texture) / 100, 0, 1);
  const tailMix = clamp((layerData.layerMix?.tail ?? SOUND_LAB_LAYER_MIX.tail) / 100, 0, 1);
  const studioBonus = quality.id === 'studio' ? 0.13 : quality.id === 'balanced' ? 0.06 : 0;
  const comfortBus = masterPolish.comfortBus ?? {};
  const tailPreDelay = acousticCues.tailPreDelayMs ?? 0;

  return {
    earlyReflectionMs: Math.round(clamp(4 + space * 16 + tailMix * 12 + tailPreDelay * 0.12 + studioBonus * 30, 4, 48)),
    earlyReflectionGain: Number(clamp(0.034 + space * 0.08 + tailMix * 0.052 + textureMix * 0.025 + studioBonus * 0.12, 0.024, 0.23).toFixed(3)),
    distanceDamping: Number(clamp(0.048 + space * 0.13 + tailMix * 0.08 + (1 - material) * 0.04 + studioBonus * 0.08, 0.032, 0.44).toFixed(3)),
    bodyAnchor: Number(clamp(0.068 + bodyMix * 0.16 + transientMix * 0.11 + (comfortBus.monoAnchor ?? 0) * 0.5, 0.052, 0.4).toFixed(3)),
    frontBack: Number(clamp(0.12 + space * 0.24 + motion * 0.05 + tailMix * 0.17 + studioBonus * 0.12, 0.08, 0.66).toFixed(3)),
    widthFocus: Number(clamp(0.09 + space * 0.2 + variation * 0.12 + (comfortBus.widthTrim ?? 0) * 0.52, 0.06, 0.58).toFixed(3)),
    sourceFocus: Number(clamp(0.18 + transientMix * 0.24 + bodyMix * 0.2 - space * 0.06 + material * 0.05, 0.12, 0.7).toFixed(3)),
  };
}

function normalizeOutputMode(mode = 'comfort') {
  return ['raw', 'comfort', 'studio'].includes(mode) ? mode : 'comfort';
}

function applyOutputModeToMasterPolish(masterPolish, outputMode) {
  if (outputMode === 'raw') {
    return {
      ...masterPolish,
      enabled: false,
      mode: 'raw',
      glue: 0,
      lowTighten: 0,
      airGuard: 0,
      transientHold: 0,
      bodyGain: 0.96,
      comfortBus: {
        warmth: 0,
        deHarsh: 0,
        headroom: 0.035,
        airTame: 0,
        loudnessMatch: 1,
        monoAnchor: 0,
        widthTrim: 0,
        tailDuck: 0,
      },
      temporalMasking: {
        attackHoldMs: 0,
        releaseMs: 0,
        wetDuck: 0,
        tailDuckDb: 0,
        transientProtect: 0,
        sideDuck: 0,
      },
      motionBus: {
        microDynamics: 0,
        transientShield: 0,
        tailBloom: 0,
        wowFlutter: 0,
      },
      dynamicDetail: {
        transientAir: 0,
        bodyGlue: 0,
        outputSilk: 0,
        snapWindowMs: 0,
      },
      transientGloss: {
        crestClamp: 0,
        harmonicAir: 0,
        bodyFocus: 0,
        aliasGuard: 0,
        crestWindowMs: 0,
      },
      spectralBalance: {
        lowBody: 0,
        lowMidGlue: 0,
        highTame: 0,
        tiltCompensation: 0,
        bodyShelfHz: masterPolish.spectralBalance?.bodyShelfHz ?? 220,
        airShelfHz: masterPolish.spectralBalance?.airShelfHz ?? 7200,
      },
    };
  }

  return {
    ...masterPolish,
    enabled: true,
    mode: outputMode,
  };
}

const QUALITY_AUDITION_COPY = {
  'analog-gesture': {
    actionLabelZh: '听漂移',
    listenZh: '先听 Studio full，再旁路每次触发的 pitch/filter/FM 微漂移；差异应该是更活或更死板，而不是换成另一个声音。',
    bypass: ['analog-gesture'],
  },
  'temporal-mask': {
    actionLabelZh: '听尾避让',
    listenZh: '旁路尾音避让后，重点听 tail 是否盖住 transient；这对应 REAPER 里的 dry/full/tail-only A/B。',
    bypass: ['temporal-mask'],
  },
  'dynamic-detail': {
    actionLabelZh: '听动态',
    listenZh: '旁路动态细节后，听 snap、body glue 和 output silk 是否少了层次，避免把更大声误判成更好。',
    bypass: ['dynamic-detail'],
  },
  'transient-gloss': {
    actionLabelZh: '听光泽',
    listenZh: '旁路瞬态光泽后，听前 80ms 的 crest、air、body focus 是否更钝或更粗糙。',
    bypass: ['transient-gloss'],
  },
  'spectral-balance': {
    actionLabelZh: '听频谱',
    listenZh: '旁路频谱平衡后，听主体是否变薄、高频是否更刺，以及金属/冲击是否少了温度。',
    bypass: ['spectral-balance'],
  },
  'spatial-image': {
    actionLabelZh: '听空间',
    listenZh: '旁路早期反射和距离线索后，听声音是否从前后空间退回到扁平中心。',
    bypass: ['spatial-image'],
  },
  'motion-bus': {
    actionLabelZh: '听微动',
    listenZh: '旁路微动态后，连续触发应该更机械；如果差异过大，说明 motion 或 variation 太深。',
    bypass: ['motion-bus'],
  },
  comfort: {
    actionLabelZh: '听舒适',
    listenZh: '旁路 de-harsh、headroom 和宽度整理，检查声音是否刺、挤或被响度错觉欺骗。',
    bypass: ['comfort'],
  },
  polish: {
    actionLabelZh: '听抛光',
    listenZh: '旁路最终 glue、low tighten 和 air guard，听交付质感是否来自真实处理，而不是单纯更响。',
    bypass: ['polish'],
  },
};

function normalizeQualityBypass(bypass = []) {
  return [...new Set((Array.isArray(bypass) ? bypass : [bypass])
    .map((id) => String(id ?? '').trim())
    .filter((id) => id in QUALITY_AUDITION_COPY))];
}

function neutralAnalogGesture(analogGesture = {}, performanceFeel = {}) {
  const sourceOffsets = analogGesture.hitOffsets?.length
    ? analogGesture.hitOffsets
    : (performanceFeel.triggerPattern ?? [{ id: 'hit-1' }]);

  return {
    ...analogGesture,
    amount: 0,
    triggerDetuneCents: 0,
    filterJitter: 0,
    fmJitter: 0,
    phaseJitter: 0,
    stereoScatter: 0,
    hitOffsets: sourceOffsets.map((hit, index) => ({
      id: hit.id ?? `hit-${index + 1}`,
      detuneCents: 0,
      filterRatio: 1,
      fmRatioOffset: 0,
      phaseOffset: 0,
      panOffset: 0,
    })),
  };
}

function applyQualityBypassToMasterPolish(masterPolish, bypassIds = [], performanceFeel = {}) {
  const bypass = new Set(normalizeQualityBypass(bypassIds));
  if (!bypass.size) return masterPolish;

  const next = { ...masterPolish };
  if (bypass.has('polish')) {
    next.glue = 0;
    next.lowTighten = 0;
    next.airGuard = 0;
    next.transientHold = 0;
    next.bodyGain = 0.96;
  }
  if (bypass.has('comfort')) {
    next.comfortBus = {
      warmth: 0,
      deHarsh: 0,
      headroom: 0.035,
      airTame: 0,
      loudnessMatch: 1,
      monoAnchor: 0,
      widthTrim: 0,
      tailDuck: 0,
    };
  }
  if (bypass.has('temporal-mask')) {
    next.temporalMasking = {
      attackHoldMs: 0,
      releaseMs: 0,
      wetDuck: 0,
      tailDuckDb: 0,
      transientProtect: 0,
      sideDuck: 0,
    };
  }
  if (bypass.has('motion-bus')) {
    next.motionBus = {
      microDynamics: 0,
      transientShield: 0,
      tailBloom: 0,
      wowFlutter: 0,
    };
  }
  if (bypass.has('dynamic-detail')) {
    next.dynamicDetail = {
      transientAir: 0,
      bodyGlue: 0,
      outputSilk: 0,
      snapWindowMs: 0,
    };
  }
  if (bypass.has('transient-gloss')) {
    next.transientGloss = {
      crestClamp: 0,
      harmonicAir: 0,
      bodyFocus: 0,
      aliasGuard: 0,
      crestWindowMs: 0,
    };
  }
  if (bypass.has('spectral-balance')) {
    next.spectralBalance = {
      lowBody: 0,
      lowMidGlue: 0,
      highTame: 0,
      tiltCompensation: 0,
      bodyShelfHz: next.spectralBalance?.bodyShelfHz ?? 220,
      airShelfHz: next.spectralBalance?.airShelfHz ?? 7200,
    };
  }
  if (bypass.has('analog-gesture')) {
    next.analogGesture = neutralAnalogGesture(next.analogGesture, performanceFeel);
  }

  return next;
}

function applyQualityBypassToSpatialImage(spatialImage, bypassIds = []) {
  if (!normalizeQualityBypass(bypassIds).includes('spatial-image')) return spatialImage;
  return {
    ...spatialImage,
    earlyReflectionMs: 0,
    earlyReflectionGain: 0,
    distanceDamping: 0,
    bodyAnchor: 0,
    frontBack: 0,
    widthFocus: 0,
    sourceFocus: 0,
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
    { id: 'polish', type: 'polish', labelZh: 'Master Polish', amount: clamp(masterPolish.glue + masterPolish.airGuard * 0.34 + (masterPolish.comfortBus?.deHarsh ?? 0) * 0.16 + (masterPolish.motionBus?.microDynamics ?? 0) * 0.8 + (masterPolish.temporalMasking?.wetDuck ?? 0) * 0.18 + (masterPolish.dynamicDetail?.bodyGlue ?? 0) * 0.24 + (masterPolish.transientGloss?.crestClamp ?? 0) * 0.2 + (masterPolish.transientGloss?.harmonicAir ?? 0) * 0.18 + (masterPolish.spectralBalance?.highTame ?? 0) * 0.18 + (masterPolish.spectralBalance?.lowBody ?? 0) * 0.16 + (masterPolish.analogGesture?.amount ?? 0) * 0.16, 0, 1), glue: masterPolish.glue, lowTighten: masterPolish.lowTighten, airGuard: masterPolish.airGuard, comfortBus: masterPolish.comfortBus, temporalMasking: masterPolish.temporalMasking, motionBus: masterPolish.motionBus, dynamicDetail: masterPolish.dynamicDetail, transientGloss: masterPolish.transientGloss, spectralBalance: masterPolish.spectralBalance, analogGesture: masterPolish.analogGesture },
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

function buildControlSmoothing(performance, quality) {
  const glide = clamp(performance.glide ?? 12, 0, 100) / 100;
  const studioExtra = quality.id === 'studio' ? 12 : 0;
  return {
    enabled: true,
    parameterMs: Math.round(12 + glide * 118 + studioExtra),
    gainMs: Math.round(8 + glide * 72 + studioExtra * 0.5),
    spaceMs: Math.round(28 + glide * 180 + studioExtra),
    visualMs: Math.round(80 + glide * 170),
    noteGlide: Number(glide.toFixed(2)),
  };
}

function buildPerformanceFeel(family, values, performance, quality) {
  const velocityNorm = clamp(performance.velocity ?? 72, 0, 127) / 127;
  const glideNorm = clamp(performance.glide ?? 12, 0, 100) / 100;
  const motion = normalize(values.motion);
  const material = normalize(values.material);
  const space = normalize(values.space);
  const variation = normalize(values.variation);
  const studioBonus = quality.id === 'studio' ? 0.12 : quality.id === 'balanced' ? 0.05 : 0;
  const familyName = family?.titleZh ?? '当前音色';
  const microTimingMs = Number(clamp(0.6 + motion * 4.4 + variation * 7.2 + glideNorm * 3.2 + studioBonus * 3, 0.4, 14).toFixed(1));
  const pitchDriftCents = Number(clamp(0.8 + variation * 8.5 + glideNorm * 4.8 + motion * 2.2 + studioBonus * 4, 0.4, 16).toFixed(1));
  const transientPunch = Number(clamp(0.82 + velocityNorm * 0.5 + material * 0.14, 0.76, 1.42).toFixed(2));
  const bodyFollow = Number(clamp(0.88 + velocityNorm * 0.2 + material * 0.08, 0.8, 1.2).toFixed(2));
  const stereoGesture = Number(clamp(0.12 + space * 0.38 + variation * 0.22 + velocityNorm * 0.1, 0.08, 0.88).toFixed(2));
  const mode = velocityNorm > 0.74 || variation > 0.48 || glideNorm > 0.36 ? 'expressive' : 'tight';
  const baseVelocity = clamp(Math.round(performance.velocity ?? 72), 1, 127);
  const triggerPattern = [
    { id: 'hit-1', delayMs: 0, velocity: clamp(baseVelocity - 15, 1, 127), noteOffset: 0, labelZh: '轻触：先听 dry 起音' },
    { id: 'hit-2', delayMs: 520, velocity: clamp(baseVelocity, 1, 127), noteOffset: 0, labelZh: '常规：听主体跟随' },
    { id: 'hit-3', delayMs: 1080, velocity: clamp(baseVelocity + 18, 1, 127), noteOffset: glideNorm > 0.3 ? 1 : 0, labelZh: '重触：听瞬态和空间' },
  ];

  return {
    mode,
    titleZh: 'Performance Feel / 演奏手感',
    beginnerZh: `把 ${familyName} 连续触发三次：力度决定 transient，微漂移决定真实手感，空间响应决定声音是不是像真实合成器而不是静态按钮。`,
    synthZh: 'Serum / Phase Plant / Vital：把 velocity 映射到 amp/filter/drive，小幅 random 映射到 pitch 或 sample start，glide 只做轻微平滑。',
    reaperZh: 'REAPER：用三连 MIDI velocity 做 A/B，响度匹配后检查每次触发是否有可听差异，但仍像同一个 Patch。',
    transientPunch,
    bodyFollow,
    microTimingMs,
    pitchDriftCents,
    stereoGesture,
    triggerPattern,
    controls: [
      { id: 'punch', labelZh: '力度响应', value: Math.round(transientPunch * 72), unit: '%', noteZh: '重触时 transient 和 drive 稍微抬起。' },
      { id: 'microTiming', labelZh: '微时差', value: microTimingMs, unit: 'ms', noteZh: '分层不完全同时进来，避免死板。' },
      { id: 'pitchDrift', labelZh: '微音高漂移', value: pitchDriftCents, unit: 'ct', noteZh: '只做几 cents 的活感，不让音高跑掉。' },
      { id: 'spaceResponse', labelZh: '空间响应', value: Math.round(stereoGesture * 100), unit: '%', noteZh: '重触时宽度和尾音略微打开。' },
    ],
  };
}

function buildAnalogGesture(values, performanceFeel, quality) {
  const brightness = normalize(values.brightness);
  const motion = normalize(values.motion);
  const material = normalize(values.material);
  const variation = normalize(values.variation);
  const studioBonus = quality.id === 'studio' ? 0.12 : quality.id === 'balanced' ? 0.05 : 0.018;
  const triggerPattern = performanceFeel?.triggerPattern?.length
    ? performanceFeel.triggerPattern
    : [{ id: 'hit-1', delayMs: 0, velocity: 72, noteOffset: 0 }];
  const baseVelocity = clamp(triggerPattern[0]?.velocity ?? 72, 1, 127);
  const amount = Number(clamp(0.07 + variation * 0.22 + motion * 0.075 + material * 0.042 + studioBonus, 0.055, 0.48).toFixed(3));
  const triggerDetuneCents = Number(clamp(0.55 + variation * 4.9 + motion * 1.35 + studioBonus * 6.2, 0.35, 9).toFixed(2));
  const filterJitter = Number(clamp(0.012 + variation * 0.046 + motion * 0.028 + brightness * 0.012 + studioBonus * 0.06, 0.006, 0.12).toFixed(4));
  const fmJitter = Number(clamp(0.012 + material * 0.06 + variation * 0.044 + motion * 0.018 + studioBonus * 0.09, 0.006, 0.18).toFixed(4));
  const phaseJitter = Number(clamp(0.018 + variation * 0.18 + motion * 0.072 + studioBonus * 0.36, 0.01, 0.42).toFixed(4));
  const stereoScatter = Number(clamp(0.018 + variation * 0.05 + motion * 0.026 + studioBonus * 0.08, 0.008, 0.11).toFixed(4));
  const center = (triggerPattern.length - 1) / 2;

  return {
    amount,
    triggerDetuneCents,
    filterJitter,
    fmJitter,
    phaseJitter,
    stereoScatter,
    seedBase: Math.round((brightness * 31 + motion * 47 + material * 59 + variation * 83 + studioBonus * 997) * 1000),
    hitOffsets: triggerPattern.map((hit, index) => {
      const velocityNorm = clamp(hit.velocity ?? baseVelocity, 1, 127) / baseVelocity - 1;
      const bipolar = index - center;
      const shapeA = Math.sin((index + 1) * 1.618 + material * 2.1 + variation * 1.7);
      const shapeB = Math.cos((index + 1) * 2.414 + motion * 1.9 + brightness);
      return {
        id: hit.id ?? `hit-${index + 1}`,
        detuneCents: Number(clamp(bipolar * triggerDetuneCents * 0.34 + shapeA * triggerDetuneCents * 0.22 + (hit.noteOffset ?? 0) * 7, -12, 12).toFixed(3)),
        filterRatio: Number(clamp(1 + shapeA * filterJitter + velocityNorm * 0.026, 0.84, 1.16).toFixed(4)),
        fmRatioOffset: Number(clamp(shapeB * fmJitter + velocityNorm * 0.022, -0.18, 0.18).toFixed(4)),
        phaseOffset: Number(clamp(((index + 1) * 0.271 + shapeA * 0.08 + variation * 0.18) % 1, 0, 1).toFixed(4)),
        panOffset: Number(clamp(bipolar * stereoScatter * 0.5 + shapeB * stereoScatter * 0.32, -0.16, 0.16).toFixed(4)),
      };
    }),
    beginnerZh: '每次触发都微调一点点 pitch、filter、FM 和 phase，像合成器里的 Random/Velocity 调制；幅度很小，只增加真实感，不把 Patch 变成另一个声音。',
    synthZh: 'Serum / Vital 可用 Chaos/Random 映射到 fine pitch、filter cutoff、FM amount；Phase Plant 用 Random/Velocity 调 generator 与 FX lane，深度控制在小范围。',
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

function layerOnsetMs(role, index, motion, space, variation, quality) {
  const studioFocus = quality.id === 'studio' ? 1 : quality.id === 'balanced' ? 0.55 : 0.2;
  if (role === 'transient') return clamp(index * 0.35 + variation * 0.85, 0, 3);
  if (role === 'body') return clamp(2.2 + index * 0.85 + motion * 3.2 + variation * 4.8 + studioFocus * 1.2, 2, 18);
  if (role === 'texture') return clamp(6 + index * 1.35 + motion * 4.8 + variation * 10 + studioFocus * 2, 5, 34);
  return clamp(15 + index * 1.8 + space * 22 + variation * 16 + studioFocus * 4, 14, 80);
}

function buildAcousticCues(layers, values, quality) {
  const space = normalize(values.space);
  const motion = normalize(values.motion);
  const variation = normalize(values.variation);
  const onsetForRole = (role, fallback) => {
    const matches = layers.filter((layer) => layer.role === role).map((layer) => layer.onsetMs);
    return matches.length ? Math.min(...matches) : fallback;
  };
  return {
    transientSnapMs: Number(onsetForRole('transient', 0).toFixed(1)),
    bodyLagMs: Number(onsetForRole('body', 4).toFixed(1)),
    textureBloomMs: Number(onsetForRole('texture', 10).toFixed(1)),
    tailPreDelayMs: Number(onsetForRole('tail', 22).toFixed(1)),
    layerSpreadMs: Number((Math.max(...layers.map((layer) => layer.onsetMs), 0) - Math.min(...layers.map((layer) => layer.onsetMs), 0)).toFixed(1)),
    diffusion: Number(clamp(0.34 + space * 0.34 + variation * 0.16 + (quality.id === 'studio' ? 0.1 : 0), 0.28, 0.9).toFixed(2)),
    microTimingHumanize: Number(clamp(0.18 + motion * 0.24 + variation * 0.34, 0.12, 0.72).toFixed(2)),
  };
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

function buildLayerPerformanceFeel(role, index, performanceFeel, variation) {
  if (!performanceFeel) return undefined;
  const roleGainMap = {
    transient: performanceFeel.transientPunch,
    body: performanceFeel.bodyFollow,
    texture: 1 + variation * 0.08,
    tail: 1 + performanceFeel.stereoGesture * 0.06,
  };
  const roleOffsetMap = {
    transient: -0.18,
    body: 0.34,
    texture: 0.68,
    tail: 1,
  };
  const direction = index % 2 === 0 ? -1 : 1;
  return {
    velocityGain: Number(clamp(roleGainMap[role] ?? 1, 0.72, 1.46).toFixed(2)),
    microOffsetMs: Number(clamp((roleOffsetMap[role] ?? 0.4) * performanceFeel.microTimingMs + direction * variation * 1.6, -2, 22).toFixed(1)),
    pitchDriftCents: Number(clamp(performanceFeel.pitchDriftCents * (role === 'transient' ? 0.28 : role === 'tail' ? 0.42 : 0.72), 0, 16).toFixed(1)),
    stereoGesture: performanceFeel.stereoGesture,
  };
}

function buildMaterialBodyModel({ material, brightness, motion, space, variation, quality, role, index }) {
  const qualityLift = quality.id === 'studio' ? 1 : quality.id === 'balanced' ? 0.55 : 0.18;
  const roleLift = role === 'body' ? 1 : role === 'tail' ? 0.62 : 0.42;
  return {
    peakSpreadCents: Number(clamp(0.8 + material * 4.4 + variation * 6.8 + qualityLift * 2.2 + index * 0.18, 0.4, 16).toFixed(2)),
    dampingTilt: Number(clamp(0.12 + material * 0.38 + brightness * 0.18 + qualityLift * 0.16, 0.08, 0.92).toFixed(3)),
    stereoSmear: Number(clamp((0.07 + space * 0.24 + variation * 0.22 + qualityLift * 0.12) * roleLift, 0.04, 0.72).toFixed(3)),
    excitationBlend: Number(clamp((0.028 + material * 0.09 + brightness * 0.045 + motion * 0.022) * roleLift, 0.012, 0.22).toFixed(3)),
    strikeTightness: Number(clamp(42 + material * 52 + brightness * 18 + qualityLift * 20, 32, 142).toFixed(1)),
  };
}

function buildLayer(recipe, context, index) {
  const { base, dsp, durationSeconds, layerMix, quality, material, brightness, motion, space, variation, sampleMix, performanceFeel } = context;
  const role = recipe.role;
  const gain = roleGain(role, layerMix, quality, recipe.gain);
  const envelope = layerEnvelope(role, durationSeconds, material, space);
  const pan = clamp((index - 2) * 0.11 + (variation - 0.5) * 0.18, -0.55, 0.55);
  const sampleAsset = recipe.sampleAssetId ? getSampleAsset(recipe.sampleAssetId) : null;
  const unison = buildUnisonProfile(recipe.engine, quality, motion, variation, index);
  const layerFeel = buildLayerPerformanceFeel(role, index, performanceFeel, variation);
  const feelGain = layerFeel?.velocityGain ?? 1;
  const feelOffset = layerFeel?.microOffsetMs ?? 0;
  const feelStereo = layerFeel?.stereoGesture ?? 0;

  const common = {
    id: `${role}-${recipe.engine}-${index}`,
    role,
    engine: recipe.engine,
    gain: clamp((recipe.engine === 'sampleGrain' ? gain * sampleMix : gain) * feelGain, 0, 1.6),
    onsetMs: Number(clamp(layerOnsetMs(role, index, motion, space, variation, quality) + feelOffset, 0, 120).toFixed(1)),
    pan,
    stereoSpread: clamp(layerStereoSpread(role, recipe.engine, quality, space, variation, index) + feelStereo * (role === 'tail' ? 0.2 : role === 'texture' ? 0.14 : 0.08), 0.02, 0.96),
    envelope,
  };
  if (layerFeel) common.performanceFeel = layerFeel;
  if (unison) common.unison = unison;
  if (common.unison && layerFeel) {
    common.unison = {
      ...common.unison,
      detuneCents: clamp(common.unison.detuneCents + layerFeel.pitchDriftCents * 0.18, 0, 24),
      analogDrift: clamp(common.unison.analogDrift + layerFeel.pitchDriftCents * 0.00045, 0, 0.04),
    };
  }

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
    const materialBody = buildMaterialBodyModel({ material, brightness, motion, space, variation, quality, role, index });
    return {
      ...common,
      baseFrequency: base.baseFrequency,
      materialBody,
      resonators: dsp.resonators.map((resonator, resonatorIndex) => ({
        ratio: resonator.ratio + index * 0.018,
        gain: clamp(resonator.gain * (0.76 + brightness * 0.36), 0.04, 1),
        decay: clamp(resonator.decay * (role === 'tail' ? 1.32 + space : 0.8 + material * 0.44), 0.035, 2.8),
        q: clamp(8 + dsp.filter.q * 1.5 + resonatorIndex * 1.8, 2, 34),
        detuneCents: Number(clamp((resonatorIndex - 1.5) * materialBody.peakSpreadCents * 0.24 + (index - 2) * 0.42, -18, 18).toFixed(2)),
        pan: Number(clamp((resonatorIndex % 2 === 0 ? -1 : 1) * (0.035 + materialBody.stereoSmear * 0.28) + (index - 2) * 0.018, -0.54, 0.54).toFixed(3)),
        damping: Number(clamp(materialBody.dampingTilt * (0.5 + resonatorIndex * 0.22), 0.035, 1.4).toFixed(3)),
        phaseSkew: Number((resonatorIndex * 0.37 + index * 0.11 + variation * 0.32).toFixed(3)),
        excitation: Number(clamp(materialBody.excitationBlend * (1 - resonatorIndex * 0.11), 0.006, 0.28).toFixed(3)),
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

function buildLayers({ family, base, dsp, durationSeconds, values, options, presetDna, performanceFeel }) {
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

  const context = { family, base, dsp, durationSeconds, layerMix, quality, material, brightness, motion, space, variation, sampleMix, performanceFeel };
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
  const outputMode = normalizeOutputMode(options.outputMode);
  const outputOptions = outputMode === 'studio' ? { ...options, qualityMode: 'studio' } : options;
  const qualityBypass = normalizeQualityBypass(outputOptions.qualityBypass);
  const presetDna = getPresetDnaById(outputOptions.presetId, family?.id) ?? getPresetDnaForFamily(family?.id)[0] ?? presetDnaLibrary[0];
  const { seed, durationSeconds, dsp: baseDsp } = buildLegacyDsp(family, base, values);
  const engineMode = getEngineMode(outputOptions.engineMode);
  const performance = performanceValues(outputOptions.performance);
  const xyPad = xyPadValues(outputOptions.xyPad);
  const modMatrix = modMatrixValues(outputOptions.modMatrix, values, xyPad);
  const dsp = applyModMatrixToDsp(baseDsp, modMatrix, values, xyPad, performance);
  const quality = getQualityMode(outputOptions.qualityMode);
  const performanceFeel = buildPerformanceFeel(family, values, performance, quality);
  const layerData = buildLayers({ family, base, dsp, durationSeconds, values, options: outputOptions, presetDna, performanceFeel });
  const resolvedQuality = getQualityMode(layerData.qualityMode);
  const controlSmoothing = buildControlSmoothing(performance, resolvedQuality);
  const analogGesture = buildAnalogGesture(values, performanceFeel, resolvedQuality);
  const polishedMaster = applyQualityBypassToMasterPolish(
    buildMasterPolish(values, dsp, resolvedQuality, { ...layerData, analogGesture }),
    qualityBypass,
    performanceFeel,
  );
  const masterPolish = applyOutputModeToMasterPolish(polishedMaster, outputMode);
  const acousticCues = buildAcousticCues(layerData.layers, values, resolvedQuality);
  const spatialImage = applyQualityBypassToSpatialImage(
    buildSpatialImage(values, dsp, resolvedQuality, layerData, acousticCues, masterPolish),
    qualityBypass,
  );
  const toneGraph = buildToneGraph(family, values, dsp, resolvedQuality, performance, { ...outputOptions, masterPolish });
  const fxRack = orderFxRack(toneGraph.effects, outputOptions.fxOrder);
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
    outputMode,
    qualityAuditionBypass: qualityBypass,
    durationSeconds,
    macros: values,
    performance,
    performanceFeel,
    controlSmoothing,
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
        mix: clamp(dsp.space.mix * resolvedQuality.fxScale, 0, 0.48),
        decaySeconds: clamp(dsp.space.decaySeconds * resolvedQuality.fxScale, 0.1, 2.8),
        width: dsp.space.width,
        preDelayMs: clamp(acousticCues.tailPreDelayMs, 0, 120),
        diffusion: acousticCues.diffusion,
      },
      dynamics: {
        drive: clamp(dsp.waveshaper.drive * (0.86 + material * 0.44), 0, 1.1),
        tone: clamp(dsp.filter.frequency, 120, 16000),
      },
      softLimiter: {
        ceiling: layerData.qualityMode === 'studio' ? 0.94 : 0.92,
        releaseMs: layerData.qualityMode === 'draft' ? 55 : 90,
      },
      acousticCues,
      spatialImage,
      controlSmoothing,
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
      controlSmoothing: patch.controlSmoothing,
      engineMode: patch.engineMode,
      performance: patch.performance,
      performanceFeel: patch.performanceFeel,
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
  const motionBus = polish.motionBus ?? {};
  const temporalMasking = polish.temporalMasking ?? {};
  const dynamicDetail = polish.dynamicDetail ?? {};
  const transientGloss = polish.transientGloss ?? {};
  const spectralBalance = polish.spectralBalance ?? {};
  const analogGesture = polish.analogGesture ?? {};
  const spatialImage = patch.globalFx?.spatialImage ?? {};
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
  const motionScore = clamp(
    (motionBus.microDynamics ?? 0) * 360
      + (motionBus.transientShield ?? 0) * 116
      + (motionBus.tailBloom ?? 0) * 96
      + (motionBus.wowFlutter ?? 0) * 620,
    0,
    100,
  );
  const temporalScore = clamp(
    (temporalMasking.wetDuck ?? 0) * 120
      + (temporalMasking.transientProtect ?? 0) * 160
      + clamp((temporalMasking.attackHoldMs ?? 0) / 74, 0, 1) * 22
      + (temporalMasking.tailDuckDb ?? 0) * 7,
    0,
    100,
  );
  const dynamicDetailScore = clamp(
    (dynamicDetail.transientAir ?? 0) * 112
      + (dynamicDetail.bodyGlue ?? 0) * 132
      + (dynamicDetail.outputSilk ?? 0) * 118
      + clamp((dynamicDetail.snapWindowMs ?? 0) / 42, 0, 1) * 18,
    0,
    100,
  );
  const transientGlossScore = clamp(
    (transientGloss.crestClamp ?? 0) * 170
      + (transientGloss.harmonicAir ?? 0) * 130
      + (transientGloss.bodyFocus ?? 0) * 125
      + (transientGloss.aliasGuard ?? 0) * 118
      + clamp((transientGloss.crestWindowMs ?? 0) / 28, 0, 1) * 12,
    0,
    100,
  );
  const spectralBalanceScore = clamp(
    (spectralBalance.lowBody ?? 0) * 140
      + (spectralBalance.lowMidGlue ?? 0) * 126
      + (spectralBalance.highTame ?? 0) * 128
      + (spectralBalance.tiltCompensation ?? 0) * 104,
    0,
    100,
  );
  const spatialScore = clamp(
    (spatialImage.earlyReflectionGain ?? 0) * 240
      + (spatialImage.distanceDamping ?? 0) * 72
      + (spatialImage.bodyAnchor ?? 0) * 118
      + (spatialImage.frontBack ?? 0) * 92
      + (spatialImage.widthFocus ?? 0) * 72,
    0,
    100,
  );
  const analogGestureScore = clamp(
    (analogGesture.amount ?? 0) * 128
      + (analogGesture.triggerDetuneCents ?? 0) * 3.8
      + (analogGesture.filterJitter ?? 0) * 280
      + (analogGesture.fmJitter ?? 0) * 210
      + (analogGesture.phaseJitter ?? 0) * 70,
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
      id: 'spatial-image',
      labelZh: 'Spatial Image',
      value: spatialScore,
      statusZh: '早期反射 / 距离',
      noteZh: `early ${Math.round(spatialImage.earlyReflectionMs ?? 0)}ms / body ${formatQualityNumber((spatialImage.bodyAnchor ?? 0) * 100)}% / front-back ${formatQualityNumber((spatialImage.frontBack ?? 0) * 100)}%`,
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
      id: 'motion-bus',
      labelZh: 'Micro Motion',
      value: motionScore,
      statusZh: '微动态呼吸',
      noteZh: `transient shield ${formatQualityNumber((motionBus.transientShield ?? 0) * 100)}% / tail bloom ${formatQualityNumber((motionBus.tailBloom ?? 0) * 100)}% / wow ${formatQualityNumber((motionBus.wowFlutter ?? 0) * 100)}%`,
    },
    {
      id: 'analog-gesture',
      labelZh: 'Analog Gesture Drift',
      value: analogGestureScore,
      statusZh: '每次触发微漂移',
      noteZh: `random velocity maps phase/filter/FM: ${formatQualityNumber(analogGesture.triggerDetuneCents ?? 0)}ct / filter ${formatQualityNumber((analogGesture.filterJitter ?? 0) * 100)}% / FM ${formatQualityNumber((analogGesture.fmJitter ?? 0) * 100)}%`,
    },
    {
      id: 'temporal-mask',
      labelZh: 'Temporal Mask',
      value: temporalScore,
      statusZh: '尾巴避让',
      noteZh: `tail duck ${formatQualityNumber(temporalMasking.tailDuckDb ?? 0)}dB / hold ${Math.round(temporalMasking.attackHoldMs ?? 0)}ms / release ${Math.round(temporalMasking.releaseMs ?? 0)}ms`,
    },
    {
      id: 'dynamic-detail',
      labelZh: 'Dynamic Detail',
      value: dynamicDetailScore,
      statusZh: '动态细节',
      noteZh: `snap ${formatQualityNumber((dynamicDetail.transientAir ?? 0) * 100)}% / glue ${formatQualityNumber((dynamicDetail.bodyGlue ?? 0) * 100)}% / silk ${formatQualityNumber((dynamicDetail.outputSilk ?? 0) * 100)}%`,
    },
    {
      id: 'transient-gloss',
      labelZh: 'Transient Gloss',
      value: transientGlossScore,
      statusZh: '瞬态光泽',
      noteZh: `crest ${formatQualityNumber((transientGloss.crestClamp ?? 0) * 100)}% / air ${formatQualityNumber((transientGloss.harmonicAir ?? 0) * 100)}% / alias ${formatQualityNumber((transientGloss.aliasGuard ?? 0) * 100)}% / body ${formatQualityNumber((transientGloss.bodyFocus ?? 0) * 100)}%`,
    },
    {
      id: 'spectral-balance',
      labelZh: 'Spectral Balance',
      value: spectralBalanceScore,
      statusZh: '频谱平衡',
      noteZh: `body ${formatQualityNumber((spectralBalance.lowBody ?? 0) * 100)}% / air tame ${formatQualityNumber((spectralBalance.highTame ?? 0) * 100)}% / tilt ${formatQualityNumber((spectralBalance.tiltCompensation ?? 0) * 100)}%`,
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

function buildQualityAudition(patch, soundQuality = buildSoundQuality(patch)) {
  const baseOptions = {
    engineMode: patch.engineMode === 'hq' ? 'hq' : patch.engineMode,
    qualityMode: 'studio',
    outputMode: 'studio',
    performance: patch.performance,
    layerMix: patch.layerMix,
  };
  const items = soundQuality
    .filter((item) => item.id in QUALITY_AUDITION_COPY)
    .map((item) => {
      const copy = QUALITY_AUDITION_COPY[item.id];
      return {
        id: item.id,
        labelZh: item.labelZh,
        value: item.value,
        statusZh: item.statusZh,
        noteZh: item.noteZh,
        actionLabelZh: copy.actionLabelZh,
        listenZh: copy.listenZh,
        bypass: copy.bypass,
        playOptions: {
          ...baseOptions,
          qualityBypass: copy.bypass,
        },
      };
    });

  return {
    titleZh: 'Quality Module A/B / 音质模块旁路试听',
    practiceZh: '点击任一质量模块先听 Studio full，再临时 bypass 这一层；在 REAPER 里用同响度 A/B 记录差异，避免把“更大声”误判成“更高级”。',
    items,
  };
}

function buildPolishCalibration(patch) {
  const polish = patch.globalFx?.masterPolish ?? {};
  const comfortBus = polish.comfortBus ?? {};
  const temporalMasking = polish.temporalMasking ?? {};
  const spatialImage = patch.globalFx?.spatialImage ?? {};
  const percent = (value, scale = 1) => Math.round(clamp((value ?? 0) * scale, 0, 1) * 100);
  const loudness = clamp(comfortBus.loudnessMatch ?? 1, 0.72, 1.05);
  const headroom = clamp(comfortBus.headroom ?? 0, 0, 0.22);
  const deHarsh = clamp(comfortBus.deHarsh ?? 0, 0, 1);
  const transientHold = clamp(polish.transientHold ?? 0, 0, 1);
  const stereoSafety = clamp((comfortBus.monoAnchor ?? 0) * 0.62 + (comfortBus.widthTrim ?? 0) * 0.88, 0, 1);
  const spaceDepth = clamp(
    (spatialImage.earlyReflectionGain ?? 0) * 1.6
      + (spatialImage.frontBack ?? 0) * 0.64
      + (spatialImage.distanceDamping ?? 0) * 0.48
      + (spatialImage.bodyAnchor ?? 0) * 0.3,
    0,
    1,
  );
  const tailDuck = clamp(comfortBus.tailDuck ?? 0, 0, 1);
  const temporalDuck = clamp((temporalMasking.wetDuck ?? 0) * 1.8 + (temporalMasking.transientProtect ?? 0) * 0.9, 0, 1);

  return {
    mode: polish.mode ?? patch.outputMode ?? 'comfort',
    summaryZh: '把响度、刺耳边缘、瞬态、声像、空间距离和尾巴拆开检查，避免只因为更大声就误以为音质更好。',
    steps: [
      {
        id: 'level',
        labelZh: '响度匹配',
        value: Math.round(loudness * 100),
        listenZh: 'Raw / Comfort / Studio 切换时，主体大小应接近，只听质感差异。',
        actionZh: '在 REAPER 用 -14 LUFS 参考响度 A/B；先匹配音量，再判断 Comfort 或 Studio 是否真的更稳。',
      },
      {
        id: 'harsh',
        labelZh: '刺耳控制',
        value: percent(deHarsh, 1.6),
        listenZh: '重点听 3k-8k 是否扎耳，金属噪声是否只剩薄亮。',
        actionZh: '调低 brightness、air 或 de-harsh 相关宏；Serum / Vital 里优先检查 filter drive 与高频 noise。',
      },
      {
        id: 'transient',
        labelZh: '瞬态保留',
        value: percent(transientHold, 1.2),
        listenZh: '确认 click / hit 的第一下没有被空间和 limiter 吃掉。',
        actionZh: '先保留 dry transient，再加 body 和 tail；Phase Plant 可把 transient layer 单独进短包络。',
      },
      {
        id: 'stereo',
        labelZh: '声像锚定',
        value: percent(stereoSafety, 2.4),
        listenZh: '低频和主体应在中间，宽度主要来自 texture 与 tail。',
        actionZh: '用 mono 检查低频居中；需要宽时只扩高频、颗粒或 reverb return，不扩整个 body。',
      },
      {
        id: 'space-depth',
        labelZh: '空间距离',
        value: percent(spaceDepth, 1),
        listenZh: '主体应在前面，early reflection 和 tail 在后面；距离感来自微弱反射、亮度阻尼和 predelay，而不是把整段声音泡进大混响。',
        actionZh: '在 Serum / Phase Plant / Vital 先调 predelay 与 early reflection，再做 dry / full / tail-only A/B；如果距离太假，先收 width 或降低 tail 亮度。',
      },
      {
        id: 'tail',
        labelZh: '尾巴避让',
        value: Math.max(percent(tailDuck, 2.8), percent(temporalDuck, 1)),
        listenZh: '空间尾巴不应盖住起音；前 20-80ms 先听 dry transient，尾音应在瞬态之后自然浮出来。',
        actionZh: '用 Temporal Mask 给 wet tail 做 duck，再配合 predelay；导出 dry / full / tail-only 三版做对照。',
      },
    ],
    meters: [
      { id: 'headroom', labelZh: 'Headroom', value: percent(headroom, 7.2), detailZh: `${formatQualityNumber(headroom * 100)}% safety` },
      { id: 'match', labelZh: 'Match', value: Math.round(loudness * 100), detailZh: `${formatQualityNumber(loudness)}x` },
      { id: 'mono', labelZh: 'Mono', value: percent(comfortBus.monoAnchor ?? 0, 3.2), detailZh: 'body anchor' },
      { id: 'depth', labelZh: 'Depth', value: percent(spaceDepth, 1), detailZh: `${Math.round(spatialImage.earlyReflectionMs ?? 0)}ms early` },
      { id: 'mask', labelZh: 'Mask', value: percent(temporalMasking.wetDuck ?? 0, 1.8), detailZh: `${formatQualityNumber(temporalMasking.tailDuckDb ?? 0)}dB duck` },
    ],
  };
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
    drillSteps: [
      {
        id: 'anchor',
        labelZh: '01',
        titleZh: '听 pitch 锚点',
        listenZh: '先听完整 Patch：有没有稳定 pitch、钟感或 modal 主体。若能哼出中心音，sine/triangle/FM 主体通常在发挥作用。',
        proofZh: '证据：pitch 还在，说明不是纯噪声；REAPER 里先渲染 full 作为 A/B 参照。',
        synthZh: 'Serum / Phase Plant / Vital: 先 solo 主 oscillator 或 modal generator，不动 FX。',
        feedbackZh: '你先听了完整 Patch，用 pitch、钟感和 modal 主体判断 sine、triangle 或 FM 是否在当核心。',
        nextZh: 'solo body 层，确认主体不是 reverb、noise 或 transient 造成的听觉假象。',
        playAction: 'current',
      },
      {
        id: 'body-solo',
        labelZh: '02',
        titleZh: 'Solo body 层',
        listenZh: '只听 body：关掉 transient、texture 和 tail 后，如果主体仍成立，就把它当成基础波形/频率锚点来判断。',
        proofZh: '证据：solo body 还能听出 pitch 或金属主体；如果没有，主体可能被噪声或空间假象盖住。',
        synthZh: 'Phase Plant / Vital: mute noise lane 和 reverb lane；Serum: 先关 Noise/Sub 以外的修饰。',
        feedbackZh: '你把 transient、texture、tail 暂时拿掉，只听主体是否还能成立；这一步用来确认基础波形/频率锚点。',
        nextZh: '动 Brightness 或 filter cutoff，找出 saw、comb、FM 侧频和 noise 边缘。',
        layerAudition: 'body',
      },
      {
        id: 'edge-sweep',
        labelZh: '03',
        titleZh: '扫亮边',
        listenZh: '动 Brightness 或 filter cutoff：最先消失的亮边通常来自 saw、comb、FM 侧频或高频 noise。',
        proofZh: '证据：filter 扫低后仍有 pitch 是主体，消失的是 saw/noise/comb 边缘。',
        synthZh: 'Serum / Phase Plant / Vital: 用一个 low-pass sweep 或 Macro Brightness 反推谐波边缘。',
        feedbackZh: '你只改变亮度或滤波，正在验证哪些高频边缘先消失；消失快的通常是 saw、comb、FM 侧频或 noise。',
        nextZh: '回到 Comfort 输出做 A/B，把主体、边缘和噪声角色各记录一句。',
        action: 'focus-controls',
      },
      {
        id: 'ab-proof',
        labelZh: '04',
        titleZh: 'A/B 写结论',
        listenZh: '回到 Comfort 输出做 A/B：写下“主体像什么波形，边缘来自哪里，噪声承担什么角色”。',
        proofZh: 'REAPER note: A/B full/body/comfort；结论必须说明 pitch、saw/noise 边缘和 FM/modal 材质各自贡献。',
        synthZh: 'Serum / Phase Plant / Vital: 把结论翻译成 oscillator、noise、FM 或 filter lane。',
        feedbackZh: '你把听感结论翻译成 oscillator、noise、FM/filter lane，已经从“听起来像”推进到“能复刻”。',
        nextZh: '记录 REAPER A/B：主体波形、边缘来源、噪声角色各一句，再回到 Serum / Phase Plant / Vital 复刻。',
        outputMode: 'comfort',
      },
    ],
    listeningSteps: [
      '先听纯音锚点：有没有稳定 pitch 或钟感主体。',
      '再听亮边：滤波扫低后最先消失的通常是 saw、comb 或高频噪声。',
      '检查空心感：方波/脉冲会带来硬边和 hollow 质感。',
      '最后 solo 噪声/瞬态：click、air、grain 不属于四个基础周期波形，要单独判断。',
    ],
  };
}

function buildWaveformEarDecisionTree(fingerprint, patch, family) {
  const ingredientValue = Object.fromEntries((fingerprint?.ingredients ?? []).map((item) => [item.id, item.value ?? 0]));
  const layerMix = patch.layerMix ?? {};
  const macros = patch.macros ?? {};
  const engineGain = patch.layers.reduce((totals, layer) => {
    totals[layer.engine] = (totals[layer.engine] ?? 0) + clamp(layer.gain ?? 0, 0, 1.4);
    return totals;
  }, {});
  const material = macros.material ?? 50;
  const brightness = macros.brightness ?? 50;
  const motion = macros.motion ?? 50;
  const texture = layerMix.texture ?? 50;
  const transient = layerMix.transient ?? 50;
  const tail = layerMix.tail ?? 50;

  const clues = [
    {
      id: 'metallic-inharmonic',
      labelZh: '非谐波金属',
      score: material + (engineGain.modalResonator ?? 0) * 24 + (engineGain.fmBurst ?? 0) * 18,
      questionZh: '听起来像金属、玻璃或钟，但频率不是整齐的八度/五度关系吗？',
      likelySources: ['FM sidebands', 'Modal resonator', 'Comb filter', 'Sine partials'],
      listenTestZh: '先听 body-only，再扫 filter：如果主体留下很多不等距峰值，而不是单个纯音，就是 FM/modal/comb 在做材质。',
      wrongTrapZh: '不要把 reverb 尾巴的亮 shimmer 误判成金属主体；尾巴要单独 tail-only 检查。',
      verifyActionZh: '先点 Solo body，再点材质共振；只动 Material 或 FM depth，确认非谐波峰是否随参数移动。',
      waveformDrillStep: 'body-solo',
      layerAudition: 'body',
      workbenchAction: 'focus-material-resonance',
      synthMap: {
        serum: 'Serum: 用 sine carrier + FM from B 或 comb/filter resonance，先关 Noise 和 Reverb，只听 sidebands。',
        phasePlant: 'Phase Plant: 把 sine partials、FM lane 或 resonator lane 单独分组，mute tail lane 后听非谐波峰。',
        vital: 'Vital: 用 sine/triangle 做 carrier，调 FM amount 或 spectral warp；先关 effects 判断是不是主体。',
      },
      reaperNoteZh: 'REAPER A/B: 渲染 full / body-only / tail-only；如果 body-only 仍有不等距峰，记录 FM/modal/comb 是金属来源。',
    },
    {
      id: 'pitch-anchor',
      labelZh: '稳定音高锚点',
      score: (ingredientValue.sine ?? 0) + (ingredientValue.triangle ?? 0) + (engineGain.modalResonator ?? 0) * 12,
      questionZh: '你能哼出一个中心音、钟感 pitch 或柔和主体吗？',
      likelySources: ['Sine', 'Triangle', 'FM carrier', 'Modal resonator'],
      listenTestZh: '先听 full，再把 transient/noise/tail 关掉；如果中心音还在，基础来源多半是 sine/triangle/FM carrier。',
      wrongTrapZh: '不要把很短的 click 当成 pitch；click 只说明包络很短，不说明有稳定基础波形。',
      verifyActionZh: '点“听 pitch 锚点”，再 solo body；用 spectrum 看基频峰是否稳定。',
      waveformDrillStep: 'anchor',
      playAction: 'current',
      workbenchAction: 'focus-waveform',
      synthMap: {
        serum: 'Serum: solo Osc A/B，先用 Basic Shapes 的 sine/triangle 对照，确认 pitch 是否仍成立。',
        phasePlant: 'Phase Plant: solo generator lane，关掉 noise/sample lane，只听 pitch anchor。',
        vital: 'Vital: 关 Noise，Oscillator 先切 sine/triangle，再加 FM 或 warp 对照差异。',
      },
      reaperNoteZh: 'REAPER A/B: full vs body-only；如果 body-only 能哼出 pitch，写下基频和可能的 sine/triangle/FM carrier。',
    },
    {
      id: 'hollow-pulse',
      labelZh: '空心脉冲硬边',
      score: (ingredientValue.square ?? 0) + material * 0.24 + motion * 0.08,
      questionZh: '声音有没有 hollow、空心、像 8-bit/脉冲电子块的硬边？',
      likelySources: ['Square', 'Pulse width', 'Hard sync edge'],
      listenTestZh: '把 filter 稍微收暗：如果仍然有空心硬边，通常是 square/pulse；如果只剩柔和主体，可能不是方波。',
      wrongTrapZh: '失真或剪切也会变硬，但它通常不带稳定的空心脉冲周期。',
      verifyActionZh: '只动 pulse width 或 square/sine 对照，不要同时动 drive；听 hollow 是否跟着变。',
      waveformDrillStep: 'edge-sweep',
      workbenchAction: 'focus-controls',
      synthMap: {
        serum: 'Serum: Basic Shapes 切 square/pulse，调 PWM 或 warp，和 sine A/B。',
        phasePlant: 'Phase Plant: 用 square oscillator 进 filter，先不要加 distortion，听 hollow body。',
        vital: 'Vital: 选 square/pulse wavetable，轻扫 wavetable position 或 phase modulation。',
      },
      reaperNoteZh: 'REAPER A/B: full vs square/pulse trial；记录 hollow 是否来自 oscillator，而不是 drive 或 limiter。',
    },
    {
      id: 'bright-buzz',
      labelZh: '明亮锯齿毛边',
      score: (ingredientValue.saw ?? 0) + brightness * 0.56 + (engineGain.combDelay ?? 0) * 18,
      questionZh: '高频很亮、毛边密、扫低通时最先消失的是一片谐波边缘吗？',
      likelySources: ['Saw', 'Comb filter', 'FM sidebands', 'Resonant filter'],
      listenTestZh: '缓慢扫 low-pass：如果亮边像一层布被拿掉，主体还在，亮边多半是 saw/comb/FM sidebands。',
      wrongTrapZh: '不要把 noise hiss 误判成 saw；saw 有周期谐波，noise 更随机、更像空气和砂砾。',
      verifyActionZh: '点“扫亮边”，只动 Brightness/filter cutoff；看 waveform/spectrum 中高频边缘是否同步变化。',
      waveformDrillStep: 'edge-sweep',
      workbenchAction: 'focus-controls',
      synthMap: {
        serum: 'Serum: 用 saw 或 wavetable rich harmonics，扫 low-pass，确认谐波边缘随 cutoff 消退。',
        phasePlant: 'Phase Plant: saw lane 或 comb/filter lane 单独开关，观察 2k-12k 边缘变化。',
        vital: 'Vital: saw/wavetable + filter sweep；如果 spectral warp 产生侧频，和 saw 分开 A/B。',
      },
      reaperNoteZh: 'REAPER A/B: full / darker-filter / body-only；记录 bright edge 是 saw、comb 还是 FM sidebands。',
    },
    {
      id: 'noise-grain',
      labelZh: '噪声颗粒与空气',
      score: (ingredientValue.noise ?? 0) + texture * 0.64 + transient * 0.28,
      questionZh: '你听到的是砂砾、空气、click、爆裂颗粒，而不是明确音高吗？',
      likelySources: ['Noise', 'Sample grain', 'Transient click', 'Filtered noise'],
      listenTestZh: 'solo texture/transient：如果 pitch 消失但材质还在，就是 noise/grain/click 在承担边缘。',
      wrongTrapZh: '噪声不等于“脏”；短噪声可以是 transient，长噪声可以是 air，二者要分开听。',
      verifyActionZh: '点 texture 或 transient audition，再只调 Noise level / filter；确认空气和 click 的职责。',
      waveformDrillStep: 'body-solo',
      layerAudition: 'texture',
      workbenchAction: 'focus-practice-loop',
      synthMap: {
        serum: 'Serum: solo Noise oscillator，换 bright/metal/attack noise；用 envelope 决定 click 还是 air。',
        phasePlant: 'Phase Plant: noise/sample lane 分 transient 与 texture，两条 lane 分别 A/B。',
        vital: 'Vital: Noise sampler + filter envelope；短 decay 做 click，长 decay 做 air/grain。',
      },
      reaperNoteZh: 'REAPER A/B: full / texture-only / transient-only；记录 noise 是 click、air 还是 grain，不要笼统写“噪声”。',
    },
    {
      id: 'space-tail',
      labelZh: '空间尾巴假象',
      score: tail + (patch.globalFx?.reverb?.mix ?? 0) * 80 + (patch.globalFx?.delay?.mix ?? 0) * 60,
      questionZh: '声音的“材质”是不是主要出现在尾巴里，而 dry body 其实很简单？',
      likelySources: ['Reverb tail', 'Delay feedback', 'Shimmer filter', 'Not a base waveform'],
      listenTestZh: '切 tail-only：如果材质只在尾巴里出现，那不是基础波形本身，而是 FX 把频谱拉长了。',
      wrongTrapZh: '不要用尾巴决定 oscillator；先确认 dry transient/body，再判断 reverb/delay 的贡献。',
      verifyActionZh: '切 Comfort A/B，再导出 full/body/tail-only 三版；先分清声源和效果。',
      waveformDrillStep: 'ab-proof',
      outputMode: 'comfort',
      workbenchAction: 'focus-practice-loop',
      synthMap: {
        serum: 'Serum: 先关 FX rack 判断 oscillator，再开 reverb/delay 记录尾巴变化。',
        phasePlant: 'Phase Plant: FX lane 和 generator lane 分开，tail 只作为空间证据，不当基础波形。',
        vital: 'Vital: 关 reverb/delay 后听 dry patch，确认基础波形再恢复 FX。',
      },
      reaperNoteZh: 'REAPER A/B: full / body-only / tail-only；如果 tail-only 才有材质，记录为 FX tail，不写成 saw/FM 主体。',
    },
  ];

  const sortedClues = clues
    .sort((a, b) => b.score - a.score)
    .map(({ score, ...clue }) => clue);

  return {
    titleZh: 'Waveform Ear Decision Tree 波形听辨决策树',
    summaryZh: `听到什么，先反推基础波形或合成来源；当前 ${family?.titleZh ?? 'Patch'} 最值得先查「${sortedClues[0]?.labelZh ?? '主体来源'}」。`,
    principleZh: '依据不是猜名字，而是谐波结构、噪声性、非谐波峰值和包络时间：稳定 pitch 看 sine/triangle/FM，空心硬边看 square/pulse，明亮密集看 saw/comb/FM sidebands，砂砾空气看 noise，尾巴只算 FX 证据。',
    activeClueId: sortedClues[0]?.id ?? 'pitch-anchor',
    clues: sortedClues,
    reaperProofTemplate: 'REAPER proof: render full / body-only / texture-only / tail-only, then write A/B note: source=?, edge=?, noise=?, FX tail=?',
  };
}

function buildMaterialResonanceMap(family, patch) {
  const modalLayer = patch.layers.find((layer) => layer.engine === 'modalResonator') ?? {};
  const resonators = Array.isArray(modalLayer.resonators) && modalLayer.resonators.length
    ? modalLayer.resonators
    : patch.dsp.resonators;
  const baseFrequency = modalLayer.baseFrequency ?? patch.dsp.oscillator?.baseFrequency ?? 180;
  const materialBody = modalLayer.materialBody ?? {
    peakSpreadCents: 0,
    dampingTilt: 0,
    stereoSmear: 0,
    excitationBlend: 0,
    strikeTightness: 0,
  };
  const familyName = family?.titleZh?.split('：')[0] ?? family?.titleZh ?? '当前材质';
  const material = Math.round(patch.macros?.material ?? 50);
  const brightness = Math.round(patch.macros?.brightness ?? 50);
  const roleByIndex = ['基频锚点', '非谐波侧峰', '硬质边缘', '空气泛音', '尾音泛光'];
  const listenByIndex = [
    '决定声音有没有可识别的主体 pitch；过强会像纯音铃声。',
    '制造金属或玻璃的不等距侧频；太高会刺耳、太低会不像材质。',
    '让 hit 有硬边和小物体质感；衰减太长会拖成泛音尾巴。',
    '补高频 shimmer 与空气，只需要一点点，不要盖住主体。',
    '决定空间里还剩什么材质记忆，适合 tail-only 或 body-only 检查。',
  ];

  const peaks = resonators.slice(0, 5).map((resonator, index) => {
    const ratio = Number(resonator.ratio ?? 1);
    const frequencyHz = Math.round(clamp(baseFrequency * ratio, 40, 16000));
    const decayMs = Math.round(clamp((resonator.decay ?? 0.2) * 1000, 20, 3200));
    const q = Math.round(clamp(resonator.q ?? 8 + index * 2, 2, 40));
    const gainPercent = Math.round(clamp((resonator.gain ?? 0.3) * 100, 0, 100));

    return {
      id: `peak-${index + 1}`,
      index: index + 1,
      labelZh: roleByIndex[index] ?? `共振峰 ${index + 1}`,
      frequencyHz,
      ratio: Number(ratio.toFixed(2)),
      gainPercent,
      decayMs,
      q,
      listenZh: listenByIndex[index] ?? '听这个峰是否在 body-only 中形成材质身份。',
      synthZh: `把一个 band-pass / comb peak 放在 ${frequencyHz}Hz，Q≈${q}，decay≈${decayMs}ms。`,
    };
  });

  const bodyModel = {
    titleZh: 'Modal Body material body model',
    beginnerZh: `Modal body diffusion = detune spread ${formatQualityNumber(materialBody.peakSpreadCents ?? 0)} cents, damping tilt ${formatQualityNumber((materialBody.dampingTilt ?? 0) * 100)}%, stereo smear ${formatQualityNumber((materialBody.stereoSmear ?? 0) * 100)}%, strike excitation ${formatQualityNumber((materialBody.excitationBlend ?? 0) * 100)}%. 先听 body-only：如果它只有一个死板正弦，就不像真实材质；如果 detune、damping、stereo 和 strike 都很小，金属/玻璃会变薄。`,
    metrics: [
      {
        id: 'spread',
        labelZh: 'Detune Spread',
        value: Math.round(clamp((materialBody.peakSpreadCents ?? 0) * 6.4, 0, 100)),
        detailZh: `${formatQualityNumber(materialBody.peakSpreadCents ?? 0)} cents`,
      },
      {
        id: 'damping',
        labelZh: 'Damping Tilt',
        value: Math.round(clamp((materialBody.dampingTilt ?? 0) * 118, 0, 100)),
        detailZh: `${formatQualityNumber((materialBody.dampingTilt ?? 0) * 100)}%`,
      },
      {
        id: 'stereo',
        labelZh: 'Stereo Smear',
        value: Math.round(clamp((materialBody.stereoSmear ?? 0) * 150, 0, 100)),
        detailZh: `${formatQualityNumber((materialBody.stereoSmear ?? 0) * 100)}%`,
      },
      {
        id: 'excitation',
        labelZh: 'Strike Excitation',
        value: Math.round(clamp((materialBody.excitationBlend ?? 0) * 420, 0, 100)),
        detailZh: `${formatQualityNumber((materialBody.excitationBlend ?? 0) * 100)}%`,
      },
    ],
    synthZh: 'Serum: FM + comb/filter 做 detune spread；Phase Plant: Resonator lane 每个 peak 做不同 decay/damping；Vital: FM/spectral warp 加短 strike，再用两个高 Q peak 做 modal body。',
    reaperZh: 'REAPER: 导出 body-only 与 full A/B，看 spectrum 峰是否稳定、左右是否轻微扩散、strike 是否只出现在前 30ms。',
  };

  return {
    titleZh: 'Material Resonance 材质共振地图',
    familyNameZh: familyName,
    beginnerZh: `${familyName} 的金属/玻璃感不是来自一个波形，而是多个不等距共振峰一起衰减：Material ${material} 控制峰的硬度，Brightness ${brightness} 决定这些峰露出来多少。`,
    peaks,
    bodyModel,
    serumZh: 'Serum: 用 FM/Noise 进 comb 或高 Q filter，按上面 Hz 做 2-4 个峰；Macro Material 同时推 FM depth 和 filter resonance。',
    phasePlantZh: 'Phase Plant: 用 Resonator/Comb Filter lane 做 modal body；每个 peak 单独 envelope，body-only 听是否还有材质身份。',
    vitalZh: 'Vital: 用 spectral warp/FM 加短 decay，再用两个高 Q filter 峰模拟 modal；Macro 只控制峰值和 decay，不要同时加空间。',
    reaperZh: 'REAPER: 导出 body-only stem，看 spectrum 中这些峰是否稳定；用窄 EQ 轻推/轻削验证哪个峰决定金属感。',
    practiceZh: '先按 body-only 听共振，再回 full patch 判断 transient 与 texture 是否只是在服务这个主体。',
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

function buildPatchDoctor(family, patch, macroList = []) {
  const values = patch.macros ?? {};
  const layerMix = patch.layerMix ?? {};
  const polish = patch.globalFx?.masterPolish ?? {};
  const comfortBus = polish.comfortBus ?? {};
  const macroById = Object.fromEntries((macroList ?? []).map((macro) => [macro.id, macro]));
  const familyName = family?.titleZh?.split('：')[0] ?? '目标音效';
  const brightness = values.brightness ?? 50;
  const material = values.material ?? 50;
  const motion = values.motion ?? 50;
  const space = values.space ?? 50;
  const variation = values.variation ?? 50;
  const transientMix = layerMix.transient ?? 50;
  const bodyMix = layerMix.body ?? 50;
  const textureMix = layerMix.texture ?? 50;
  const tailMix = layerMix.tail ?? 50;
  const deHarsh = (comfortBus.deHarsh ?? 0) * 100;
  const tailDuck = (comfortBus.tailDuck ?? 0) * 100;
  const monoAnchor = (comfortBus.monoAnchor ?? 0) * 100;
  const transientIsForward = transientMix >= bodyMix;
  const motionDelta = motion < 48 ? 8 : -4;
  const variationDelta = variation > 52 ? -6 : 6;

  const macroLabel = (id, fallback) => macroById[id]?.labelZh ?? fallback;
  const candidates = [
    {
      id: 'harsh-edge',
      score: clamp(brightness * 0.48 + material * 0.28 + textureMix * 0.18 + deHarsh * 0.18, 0, 100),
      labelZh: '刺耳边缘',
      listenZh: `先听 ${familyName} 的 3k-8k 是否扎耳，亮度是否来自材质而不是单纯高频噪声。`,
      whyZh: `${macroLabel('brightness', 'Brightness')} ${Math.round(brightness)} / ${macroLabel('material', 'Material')} ${Math.round(material)}，容易把金属感推成薄亮。`,
      action: 'analyze-patch',
      actionLabelZh: '看频谱',
      applyAction: {
        id: 'harsh-edge',
        labelZh: '试调去刺耳',
        summaryZh: '小幅降低 Brightness / Material / Texture，再用 Raw 与 Comfort A/B 判断是否只是音量错觉。',
        feedbackZh: '已小幅降低 Brightness、Material 和 Texture。现在先听 A/B：如果金属感还在但不扎耳，就保留这次方向。',
        macroDelta: { brightness: -8, material: -4 },
        layerDelta: { texture: -6 },
        targetModule: 'macro',
        targetAdvancedModule: 'ab-compare',
        targetModuleMap: 'compare',
        targetWorkflowStep: 'compare',
        targetAtlasNode: 'material',
        targetSelector: '.practice-loop-panel',
      },
      synthTargets: {
        serum: 'Serum: 先看 Filter drive、Noise level 和 wavetable position，再少量 de-harsh。',
        phasePlant: 'Phase Plant: 把 noise / modal 分层进单独 EQ 或 filter lane，先关掉过亮层 A/B。',
        vital: 'Vital: 检查 spectral warp、filter resonance 和 noise oscillator 高通位置。',
      },
      reaperCheckZh: 'REAPER 中先匹配 -14 LUFS，再 A/B dry 与 full，确认刺耳不是响度错觉。',
    },
    {
      id: 'tail-mask',
      score: clamp(space * 0.36 + tailMix * 0.34 + transientMix * 0.12 + tailDuck * 0.42, 0, 100),
      labelZh: '尾巴遮挡',
      listenZh: '听第一下 hit/click 后，reverb 或 delay 是否立刻盖住主体，导致动作边缘变糊。',
      whyZh: `Space ${Math.round(space)} / Tail ${Math.round(tailMix)}，空间已经足够，下一步要验证 tail 是否服务动作。`,
      action: 'focus-practice-loop',
      actionLabelZh: '做 A/B',
      applyAction: {
        id: 'tail-mask',
        labelZh: '试调收尾巴',
        summaryZh: '小幅减少 Space / Tail，先保留主体，再判断尾音是否仍然服务动作。',
        feedbackZh: '已小幅减少 Space 和 Tail。现在听 dry/full/tail-only：尾巴应该退后，但动作边缘不能变小。',
        macroDelta: { space: -10 },
        layerDelta: { tail: -12 },
        targetModule: 'macro',
        targetAdvancedModule: 'ab-compare',
        targetModuleMap: 'compare',
        targetWorkflowStep: 'compare',
        targetAtlasNode: 'material',
        targetSelector: '.practice-loop-panel',
      },
      synthTargets: {
        serum: 'Serum: 用 FX rack 的 Reverb/Delay mix 和 predelay 做 dry/full/tail-only 对照。',
        phasePlant: 'Phase Plant: 把 tail 放到独立 lane，用 envelope 或 ducking 控制起音期音量。',
        vital: 'Vital: 调低 reverb mix，保留短 early reflection，再用 macro 控制尾巴长度。',
      },
      reaperCheckZh: 'REAPER 导出 dry / full / tail-only 三版，A/B 听 tail 是否遮挡 transient。',
    },
    {
      id: 'transient-body',
      score: clamp(Math.abs(transientMix - bodyMix) * 0.65 + material * 0.18 + monoAnchor * 0.32, 0, 100),
      labelZh: '瞬态/主体平衡',
      listenZh: '先听第一下和后面主体是不是同一种材质；如果 click 很硬但 body 很空，声音会像两段拼接。',
      whyZh: `Transient ${Math.round(transientMix)} / Body ${Math.round(bodyMix)}，层级比例需要用一个参数一轮验证。`,
      action: 'focus-controls',
      actionLabelZh: '调层级',
      applyAction: {
        id: 'transient-body',
        labelZh: '试调层级',
        summaryZh: transientIsForward
          ? '小幅降低 Transient、补一点 Body，让 click 和主体更像同一种材质。'
          : '小幅增加 Transient、补一点 Body，避免主体有了但起音不清楚。',
        feedbackZh: transientIsForward
          ? '已把 Transient 稍微后退，并补一点 Body。现在听第一下和主体是否更像同一个材质。'
          : '已把 Transient 稍微提前，并补一点 Body。现在听起音是否更清楚但不刺耳。',
        macroDelta: { material: material > 72 ? -3 : 4 },
        layerDelta: {
          transient: transientIsForward ? -8 : 6,
          body: transientIsForward ? 6 : 4,
        },
        targetModule: 'macro',
        targetAdvancedModule: 'ab-compare',
        targetModuleMap: 'compare',
        targetWorkflowStep: 'compare',
        targetAtlasNode: 'material',
        targetSelector: '.practice-loop-panel',
      },
      synthTargets: {
        serum: 'Serum: 用 Env1/Env2 分开控制 click 与 body，先固定音量再改 decay。',
        phasePlant: 'Phase Plant: transient generator 和 body generator 分组，分别映射 Macro。',
        vital: 'Vital: 用 Osc/Noise 独立 ADSR，先调 decay 再调 filter envelope amount。',
      },
      reaperCheckZh: 'REAPER 用同一 MIDI item 渲染两版，只改 transient 或 body 一个参数写进 item notes。',
    },
    {
      id: 'motion-life',
      score: clamp((100 - motion) * 0.26 + Math.abs(variation - 45) * 0.42 + textureMix * 0.12, 0, 100),
      labelZh: '运动生命感',
      listenZh: '听声音是否太静态，或者随机太多导致每次触发像不同音色。',
      whyZh: `Motion ${Math.round(motion)} / Variation ${Math.round(variation)}，需要把运动限制在可复现的范围里。`,
      action: 'focus-coach',
      actionLabelZh: '看调制',
      applyAction: {
        id: 'motion-life',
        labelZh: '试调运动',
        summaryZh: '小幅调整 Motion / Variation，让声音有运动但仍然可复现。',
        feedbackZh: '已小幅调整 Motion 和 Variation。现在连续触发 3 次，确认变化还像同一个 Patch。',
        macroDelta: { motion: motionDelta, variation: variationDelta },
        layerDelta: {},
        targetModule: 'modulation',
        targetAdvancedModule: 'mod-matrix',
        targetModuleMap: 'coach',
        targetWorkflowStep: 'shape',
        targetAtlasNode: 'modulation',
        targetSelector: '.workbench-coach-panel',
      },
      synthTargets: {
        serum: 'Serum: 用 LFO 或 Chaos 只调一个目标，例如 wavetable 或 filter cutoff。',
        phasePlant: 'Phase Plant: 用 random modulator 轻推 texture lane，不要同时调音高和音量。',
        vital: 'Vital: 用 random LFO 做小幅 pan/filter 变化，保持主频和主体包络稳定。',
      },
      reaperCheckZh: 'REAPER 连续渲染 3 次，A/B 判断 variation 是否还像同一个 Patch。',
    },
  ];

  const diagnostics = candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item, index) => ({
      ...item,
      priority: index + 1,
      score: Math.round(item.score),
    }));

  return {
    titleZh: 'Patch Doctor 下一步诊断',
    summaryZh: '先听分数最高的问题，只改一个参数，再回到 A/B 验证。这样初学者不会在所有旋钮之间迷路。',
    diagnostics,
  };
}

const EAR_TRIAGE_LAYER_PRESETS = {
  'harsh-edge': {
    layerAudition: 'texture',
    isolateLabelZh: 'Solo Texture',
    isolateZh: '只听 texture 质感层：如果关掉主体后仍然薄、亮、刮耳，问题多半来自噪声、warp、filter resonance 或过亮的侧频。',
  },
  'tail-mask': {
    layerAudition: 'tail',
    isolateLabelZh: 'Solo Tail',
    isolateZh: '只听 tail 尾音层：确认 reverb、delay 或 resonator decay 是否盖住 transient，而不是自然退场。',
  },
  'transient-body': {
    layerAudition: 'transient',
    isolateLabelZh: 'Solo Transient',
    isolateZh: '先 solo transient，再回到 full：判断第一下是否太硬，或者和 body 主体不像同一种材质。',
  },
  'motion-life': {
    layerAudition: 'full',
    isolateLabelZh: 'Loop Full',
    isolateZh: '连续触发 full patch 三次：听运动是否像同一个音色的细微变化，而不是每次都变成新音色。',
  },
};

function summarizeTriageMove(applyAction = {}, macroList = []) {
  const macroLabels = Object.fromEntries((macroList ?? []).map((macro) => [macro.id, macro.labelZh ?? macro.id]));
  const layerLabels = {
    transient: 'Transient 瞬态',
    body: 'Body 主体',
    texture: 'Texture 质感',
    tail: 'Tail 尾音',
  };
  const moves = [
    ...Object.entries(applyAction.macroDelta ?? {}).map(([id, delta]) => {
      const direction = delta > 0 ? '+' : '';
      return `${macroLabels[id] ?? id} ${direction}${delta}`;
    }),
    ...Object.entries(applyAction.layerDelta ?? {}).map(([id, delta]) => {
      const direction = delta > 0 ? '+' : '';
      return `${layerLabels[id] ?? id} ${direction}${delta}`;
    }),
  ];
  return moves.length ? moves.join(' / ') : '只改一个最相关参数';
}

function buildEarTriage(family, patch, patchDoctor, macroList = []) {
  const primary = patchDoctor?.diagnostics?.[0];
  const fallbackDiagnostic = {
    id: 'harsh-edge',
    labelZh: '刺耳边缘',
    listenZh: '先听 3k-8k 是否薄、亮或刮耳。',
    action: 'analyze-patch',
    actionLabelZh: '看频谱',
    reaperCheckZh: 'REAPER 中匹配响度后做 dry/full A/B。',
    applyAction: {
      id: 'harsh-edge',
      labelZh: '试调一次',
      summaryZh: '小幅降低 Brightness 或 Texture，再 A/B 判断是否更舒服。',
    },
    synthTargets: {},
  };
  const diagnostic = primary ?? fallbackDiagnostic;
  const preset = EAR_TRIAGE_LAYER_PRESETS[diagnostic.id] ?? EAR_TRIAGE_LAYER_PRESETS['harsh-edge'];
  const familyName = family?.titleZh?.split('：')[0] ?? family?.titleZh ?? '当前音效';
  const moveSummary = summarizeTriageMove(diagnostic.applyAction, macroList);
  const synthMap = {
    serum: diagnostic.synthTargets?.serum ?? 'Serum: 先锁定一个 oscillator/noise/filter 目标，只改一处再 A/B。',
    phasePlant: diagnostic.synthTargets?.phasePlant ?? 'Phase Plant: 把问题层放到独立 lane，solo 后只动一个 Macro。',
    vital: diagnostic.synthTargets?.vital ?? 'Vital: 先固定主包络，再检查 warp、filter 或 noise 的一个目标参数。',
  };

  return {
    id: 'ear-triage',
    problemId: diagnostic.id,
    titleZh: 'Ear Triage 听感分诊',
    subtitleZh: `当前先处理：${diagnostic.labelZh}`,
    summaryZh: `把 ${familyName} 的问题拆成“听症状 -> solo 一层 -> 只改一次 -> A/B 结论”，避免初学者一次乱动所有旋钮。`,
    decisionPromptZh: `REAPER 备注：A/B 后写“${diagnostic.labelZh}: ${moveSummary}，保留/撤回，因为……”。`,
    synthMap,
    steps: [
      {
        id: 'listen',
        labelZh: '01 先听症状',
        bodyZh: diagnostic.listenZh,
        action: diagnostic.action ?? 'analyze-patch',
        actionLabelZh: diagnostic.actionLabelZh ?? '看频谱',
      },
      {
        id: 'isolate',
        labelZh: '02 Solo 一层',
        bodyZh: preset.isolateZh,
        layerAudition: preset.layerAudition,
        actionLabelZh: preset.isolateLabelZh,
      },
      {
        id: 'adjust',
        labelZh: '03 只改一次',
        bodyZh: diagnostic.applyAction?.summaryZh ?? '只动 Patch Doctor 建议的一个参数，听变化方向是否符合预期。',
        applyDiagnosticId: diagnostic.id,
        actionLabelZh: diagnostic.applyAction?.labelZh ?? '试调一次',
      },
      {
        id: 'verify',
        labelZh: '04 A/B 结论',
        bodyZh: diagnostic.reaperCheckZh ?? '匹配响度后再比较，不把“更大声”误判成“更好”。',
        action: 'focus-practice-loop',
        actionLabelZh: '回到 A/B',
      },
    ],
  };
}

function buildSoundQualityCoach(patch, patchDoctor) {
  const values = patch.macros ?? {};
  const layerMix = patch.layerMix ?? {};
  const polish = patch.globalFx?.masterPolish ?? {};
  const comfortBus = polish.comfortBus ?? {};
  const brightness = values.brightness ?? 50;
  const material = values.material ?? 50;
  const space = values.space ?? 50;
  const transientMix = layerMix.transient ?? 50;
  const bodyMix = layerMix.body ?? 50;
  const textureMix = layerMix.texture ?? 50;
  const tailMix = layerMix.tail ?? 50;
  const headroom = clamp((comfortBus.headroom ?? 0) * 650, 0, 100);
  const deHarsh = clamp((comfortBus.deHarsh ?? 0) * 100, 0, 100);
  const monoAnchor = clamp((comfortBus.monoAnchor ?? 0) * 180, 0, 100);
  const tailDuck = clamp((comfortBus.tailDuck ?? 0) * 180, 0, 100);
  const transientBodyGap = Math.abs(transientMix - bodyMix);
  const primaryDiagnostic = patchDoctor?.diagnostics?.[0];

  const metrics = [
    {
      id: 'headroom',
      labelZh: '响度余量',
      value: Math.round(headroom),
      statusZh: headroom >= 60 ? '安全' : '偏紧',
      listenZh: '切 Raw / Comfort / Studio 时，主体大小应接近，不能因为更响就误判更好。',
      fixZh: headroom >= 60 ? '保持当前输出余量，下一步检查刺耳边缘。' : '先降一点输出或 drive，再匹配响度做 A/B。',
    },
    {
      id: 'harshness',
      labelZh: '刺耳风险',
      value: Math.round(clamp(brightness * 0.42 + material * 0.26 + textureMix * 0.2 - deHarsh * 0.18, 0, 100)),
      statusZh: brightness + material > 150 ? '重点听' : '可控',
      listenZh: '听 3k-8k 是否薄、扎、像噪声刮耳，尤其是金属和电流类声音。',
      fixZh: '优先少量降低 Brightness / Texture，确认金属感还在而不是只变暗。',
    },
    {
      id: 'body-anchor',
      labelZh: '主体锚点',
      value: Math.round(clamp(bodyMix * 0.5 + monoAnchor * 0.34 + (100 - transientBodyGap) * 0.16, 0, 100)),
      statusZh: bodyMix >= 62 ? '稳定' : '偏空',
      listenZh: '关掉空间后，声音仍应有能被识别的主体重量或音高锚点。',
      fixZh: '如果只剩 click 和噪声，补 Body 或降低高频纹理，让主体先成立。',
    },
    {
      id: 'tail-mask',
      labelZh: '尾巴遮挡',
      value: Math.round(clamp(space * 0.34 + tailMix * 0.38 - tailDuck * 0.18, 0, 100)),
      statusZh: space + tailMix > 145 ? '可能遮挡' : '可控',
      listenZh: '听第一下之后，reverb/delay 是否立刻盖住主体，让动作边缘变糊。',
      fixZh: '小幅收 Space / Tail，或让 tail duck 起音，保留 dry transient。',
    },
    {
      id: 'layer-balance',
      labelZh: '层级平衡',
      value: Math.round(clamp(100 - transientBodyGap * 0.72 - Math.abs(textureMix - bodyMix) * 0.18, 0, 100)),
      statusZh: transientBodyGap > 28 ? '需校准' : '均衡',
      listenZh: '起音、主体、质感和尾巴要像同一个声音，不要像几个样本拼接。',
      fixZh: '一次只改一个层级：Transient、Body、Texture 或 Tail，写进 REAPER item notes。',
    },
  ];

  return {
    titleZh: '音质听诊台',
    summaryZh: '把响度余量、刺耳风险、主体锚点、尾巴遮挡和层级平衡放在一张听感地图里；先听最高风险，再只改一个参数做 A/B 验证。',
    metrics,
    routine: [
      '先切 Raw / Comfort / Studio，确认响度接近，只听质感差异。',
      '看分数最高的一项，solo 或专注听那一段：起音、主体或尾巴。',
      '点一键试修，只做小幅参数变化，不要同时重做整个 Patch。',
      '回到 A/B，写下保留或撤回的原因。',
    ],
    primaryFix: {
      diagnosticId: primaryDiagnostic?.id ?? 'harsh-edge',
      labelZh: `一键试修优先项：${primaryDiagnostic?.labelZh ?? '刺耳边缘'}`,
      feedbackZh: '只改一个参数后，用 A/B 验证这次试修是否真的更舒服、更真实，而不是只变小声。',
    },
  };
}

function buildTranslationMonitor(patch, patchDoctor) {
  const values = patch.macros ?? {};
  const layerMix = patch.layerMix ?? {};
  const polish = patch.globalFx?.masterPolish ?? {};
  const comfortBus = polish.comfortBus ?? {};
  const spatial = patch.globalFx?.space ?? patch.spatialImage ?? {};
  const brightness = clamp(values.brightness ?? 50, 0, 100);
  const motion = clamp(values.motion ?? 50, 0, 100);
  const material = clamp(values.material ?? 50, 0, 100);
  const space = clamp(values.space ?? 50, 0, 100);
  const transientMix = clamp(layerMix.transient ?? 50, 0, 100);
  const bodyMix = clamp(layerMix.body ?? 50, 0, 100);
  const textureMix = clamp(layerMix.texture ?? 50, 0, 100);
  const tailMix = clamp(layerMix.tail ?? 50, 0, 100);
  const headroom = clamp((comfortBus.headroom ?? 0) * 650, 0, 100);
  const deHarsh = clamp((comfortBus.deHarsh ?? 0) * 100, 0, 100);
  const monoAnchor = clamp((comfortBus.monoAnchor ?? 0) * 180, 0, 100);
  const tailDuck = clamp((comfortBus.tailDuck ?? 0) * 180, 0, 100);
  const widthScore = clamp((spatial.width ?? 0.56) * 100, 0, 100);
  const primaryDiagnostic = patchDoctor?.diagnostics?.[0];

  const checks = [
    {
      id: 'mono-anchor',
      labelZh: 'Mono 主体锚点',
      value: Math.round(clamp(bodyMix * 0.46 + material * 0.18 + monoAnchor * 0.28 + (100 - Math.abs(transientMix - bodyMix)) * 0.08, 0, 100)),
      statusZh: bodyMix >= 60 && monoAnchor >= 42 ? '能折叠' : '需补主体',
      listenZh: '听 mono A/B：关掉空间后，触点和 body 仍要能说明这个声音是什么。',
      fixZh: bodyMix >= 60 ? '保持 body，只小幅修 transient/body 比例。' : '先提高 Body 或降低过亮 texture，不要只靠 reverb 撑大。',
      reaperZh: 'REAPER 用 mono/stereo A/B item 对照，响度匹配后写下主体是否消失。',
      action: 'focus-controls',
      actionLabelZh: '定位 Body',
    },
    {
      id: 'small-speaker',
      labelZh: '小音箱可读性',
      value: Math.round(clamp(bodyMix * 0.34 + transientMix * 0.24 + material * 0.16 + headroom * 0.12 + (100 - tailMix) * 0.14, 0, 100)),
      statusZh: transientMix + bodyMix > 122 ? '能读到' : '偏薄',
      listenZh: 'solo Body 再听 full：小音箱主要靠 transient/body，不靠低频和宽空间。',
      fixZh: '让 body 有短而稳定的中频锚点；tail 太多时先收尾巴再判断。',
      reaperZh: 'REAPER 放一个 small-speaker EQ 或窄频 A/B，导出 dry/full 两版比较。',
      layerAudition: 'body',
      actionLabelZh: 'Solo Body',
    },
    {
      id: 'headphone-width',
      labelZh: '耳机宽度舒适',
      value: Math.round(clamp(100 - Math.abs(widthScore - 58) * 0.9 - Math.max(0, tailMix - 76) * 0.18 + deHarsh * 0.12, 0, 100)),
      statusZh: widthScore > 82 ? '偏宽' : '舒适区',
      listenZh: '听 Comfort A/B：耳机里宽度应带来空间，不应让中心 body 变空。',
      fixZh: '如果宽度抢主体，先回到 Comfort 输出，再少量降低 Space 或 stereo width。',
      reaperZh: 'REAPER 用 headphones 与 mono fold-down 双检查，A/B dry、full、tail-only。',
      outputMode: 'comfort',
      actionLabelZh: '听 Comfort',
    },
    {
      id: 'tail-safety',
      labelZh: 'Tail 遮挡安全',
      value: Math.round(clamp(100 - Math.max(0, space + tailMix - 130) * 0.7 + tailDuck * 0.22 + (100 - motion) * 0.06, 0, 100)),
      statusZh: space + tailMix > 145 ? '尾巴偏重' : '不遮挡',
      listenZh: 'solo Tail 再听 full：尾巴要解释空间，不能把第一下动作吃掉。',
      fixZh: '先让 tail duck 起音，必要时降低 Space/Tail；不要用更大声掩盖糊。',
      reaperZh: 'REAPER 导出 tail-only，与 full A/B；在 item note 记录是否遮挡 transient。',
      layerAudition: 'tail',
      actionLabelZh: 'Solo Tail',
    },
  ];
  const primaryCheck = checks.reduce((lowest, check) => (check.value < lowest.value ? check : lowest), checks[0]);

  return {
    id: 'translation-monitor',
    titleZh: 'Translation Monitor 翻译检查',
    summaryZh: `用 mono、小音箱、耳机宽度和 tail-only 四种监听检查音效能不能从 Sound Lab 翻译到 REAPER 交付；当前优先听 ${primaryCheck.labelZh}。`,
    primaryCheckId: primaryCheck.id,
    checks,
    reaperChecklist: [
      '先导出 dry / full / tail-only 三版，并匹配响度。',
      '在 REAPER 里做 mono fold-down、小音箱 EQ、耳机宽度三轮 A/B。',
      `如果失败，优先回到 ${primaryDiagnostic?.labelZh ?? primaryCheck.labelZh}，一次只改一个参数。`,
    ],
  };
}

const TARGET_MATCH_PROFILES = {
  'metal-impact': {
    nameZh: '短金属撞击参考',
    soundTargetZh: '前 20ms 有清楚触点，主体有非谐波金属短响，尾巴短而不糊。',
    metricTargets: { transient: 76, body: 66, material: 84, space: 42 },
    macroTargets: { brightness: 72, motion: 38, material: 84, space: 38, variation: 20 },
    layerTargets: { transient: 76, body: 68, texture: 62, tail: 34 },
  },
  'glass-ping': {
    nameZh: '玻璃脆响参考',
    soundTargetZh: '起音较轻，主体明亮脆，modal 峰清楚，空间比金属更长。',
    metricTargets: { transient: 58, body: 54, material: 66, space: 64 },
    macroTargets: { brightness: 78, motion: 30, material: 66, space: 62, variation: 18 },
    layerTargets: { transient: 58, body: 56, texture: 52, tail: 66 },
  },
  'electric-crackle': {
    nameZh: '电流噼啪参考',
    soundTargetZh: '瞬态清楚、主体偏薄，材质来自随机颗粒和高频断续，不要糊成噪声墙。',
    metricTargets: { transient: 68, body: 42, material: 78, space: 38 },
    macroTargets: { brightness: 82, motion: 72, material: 78, space: 34, variation: 56 },
    layerTargets: { transient: 70, body: 42, texture: 82, tail: 30 },
  },
  'air-whoosh': {
    nameZh: '空气划过参考',
    soundTargetZh: '起音柔和，主体轻，运动和空间明显，材质不能过硬。',
    metricTargets: { transient: 34, body: 38, material: 46, space: 74 },
    macroTargets: { brightness: 62, motion: 78, material: 42, space: 76, variation: 34 },
    layerTargets: { transient: 34, body: 40, texture: 62, tail: 72 },
  },
  'servo-tick': {
    nameZh: '机械伺服点击参考',
    soundTargetZh: '起音硬、主体短，材质有机械边缘，空间很少。',
    metricTargets: { transient: 72, body: 58, material: 68, space: 30 },
    macroTargets: { brightness: 68, motion: 54, material: 68, space: 28, variation: 24 },
    layerTargets: { transient: 74, body: 60, texture: 54, tail: 24 },
  },
  'energy-charge': {
    nameZh: '能量充能参考',
    soundTargetZh: '主体和运动持续推进，材质有合成器能量感，尾巴支撑空间。',
    metricTargets: { transient: 48, body: 62, material: 64, space: 68 },
    macroTargets: { brightness: 74, motion: 82, material: 64, space: 68, variation: 38 },
    layerTargets: { transient: 46, body: 64, texture: 58, tail: 66 },
  },
};

function getTargetMatchProfile(family) {
  return TARGET_MATCH_PROFILES[family?.id] ?? {
    nameZh: '通用音效参考',
    soundTargetZh: '起音、主体、材质和空间都能被单独听出来。',
    metricTargets: { transient: 62, body: 60, material: 68, space: 54 },
    macroTargets: { brightness: 66, motion: 52, material: 68, space: 54, variation: 28 },
    layerTargets: { transient: 62, body: 60, texture: 58, tail: 52 },
  };
}

function stepTowardTarget(current, target, amount = 0.34) {
  const currentValue = clamp(current, 0, 100);
  const targetValue = clamp(target, 0, 100);
  const difference = targetValue - currentValue;
  if (Math.abs(difference) < 1) return Math.round(currentValue);
  const step = Math.sign(difference) * Math.max(2, Math.abs(difference) * amount);
  return Math.round(clamp(currentValue + step, 0, 100));
}

function buildReferenceMatch({ family, patch, profile, metrics, primaryDiagnostic, macroList }) {
  const values = patch.macros ?? {};
  const layerMix = patch.layerMix ?? {};
  const macroTargets = { ...SOUND_LAB_MACROS, ...profile.macroTargets };
  const layerTargets = { ...SOUND_LAB_LAYER_MIX, ...profile.layerTargets };
  const macroLabels = Object.fromEntries(macroList.map((macro) => [macro.id, macro.labelZh]));
  const layerLabels = {
    transient: 'Transient 瞬态层',
    body: 'Body 主体层',
    texture: 'Texture 质感层',
    tail: 'Tail 尾音层',
  };
  const nudgeMacros = Object.fromEntries(Object.entries(macroTargets).map(([id, target]) => [
    id,
    stepTowardTarget(values[id] ?? SOUND_LAB_MACROS[id] ?? 50, target),
  ]));
  const nudgeLayerMix = Object.fromEntries(Object.entries(layerTargets).map(([id, target]) => [
    id,
    stepTowardTarget(layerMix[id] ?? SOUND_LAB_LAYER_MIX[id] ?? 50, target),
  ]));
  const weakestMetric = [...metrics].sort((a, b) => a.score - b.score)[0] ?? metrics[0];
  const controls = [
    ...Object.entries(macroTargets).map(([id, target]) => ({
      scope: 'macro',
      id,
      labelZh: macroLabels[id] ?? id,
      current: Math.round(values[id] ?? 50),
      target: Math.round(target),
      nudge: nudgeMacros[id],
      delta: Math.round((values[id] ?? 50) - target),
    })),
    ...Object.entries(layerTargets).map(([id, target]) => ({
      scope: 'layer',
      id,
      labelZh: layerLabels[id] ?? id,
      current: Math.round(layerMix[id] ?? 50),
      target: Math.round(target),
      nudge: nudgeLayerMix[id],
      delta: Math.round((layerMix[id] ?? 50) - target),
    })),
  ].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return {
    titleZh: 'Reference Match 参考目标',
    profileNameZh: profile.nameZh,
    targetSoundZh: profile.soundTargetZh,
    weakestMetricId: weakestMetric?.id ?? 'material',
    weakestMetricLabelZh: weakestMetric?.labelZh ?? 'Material 材质',
    practiceZh: '先听 Current，再听 Target Reference，最后听 Nudge；如果 Nudge 更接近目标，只应用这一小步并写进 REAPER A/B note。',
    targets: {
      macros: macroTargets,
      layerMix: layerTargets,
    },
    nudge: {
      macros: nudgeMacros,
      layerMix: nudgeLayerMix,
      noteZh: `本次微调优先靠近「${weakestMetric?.labelZh ?? primaryDiagnostic?.labelZh ?? '材质'}」，不是重做整个音色。`,
    },
    playTargets: {
      current: {
        labelZh: 'Current 当前',
        macros: {},
        options: { outputMode: 'comfort', engineMode: patch.engineMode, qualityMode: patch.qualityMode },
        listenZh: '先记住当前声音，不要边听边改。',
      },
      target: {
        labelZh: 'Target 目标参考',
        macros: macroTargets,
        options: { layerMix: layerTargets, outputMode: 'studio', engineMode: 'hq', qualityMode: 'studio' },
        listenZh: '目标参考不是最终答案，而是给耳朵一个方向：听四段结构是否更清楚。',
      },
      nudge: {
        labelZh: 'Nudge 微调版',
        macros: nudgeMacros,
        options: { layerMix: nudgeLayerMix, outputMode: 'comfort', engineMode: patch.engineMode, qualityMode: patch.qualityMode },
        listenZh: '微调版只向目标靠近一小步，适合判断保留或撤回。',
      },
    },
    controls,
    synthMap: {
      serum: 'Serum: 把 Target 当成 Macro 快照；Material 对应 FM/warp/filter Q，Space 对应 FX mix，Layer 变化用 Noise/Sub/OSC level 复刻。',
      phasePlant: 'Phase Plant: 按 lane 管理 transient/body/texture/tail；只把当前最弱维度映射到一个 Macro，避免整条链一起乱动。',
      vital: 'Vital: 用 Macro 控 FM/spectral warp/noise level/reverb mix；先复制当前 preset，再把 Nudge 数值作为 B 版本。',
    },
    reaperNoteZh: `REAPER A/B: ${family?.titleZh ?? 'Sound Lab'} / ${profile.nameZh}; Current -> Nudge; 只改一个方向=${weakestMetric?.labelZh ?? 'target'}; 保留/撤回=____。`,
  };
}

function buildTargetMatchCoach(family, patch, patchDoctor, macroList = []) {
  const values = patch.macros ?? {};
  const layerMix = patch.layerMix ?? {};
  const profile = getTargetMatchProfile(family);
  const target = profile.metricTargets;
  const brightness = values.brightness ?? 50;
  const material = values.material ?? 50;
  const motion = values.motion ?? 50;
  const space = values.space ?? 50;
  const transientMix = layerMix.transient ?? 50;
  const bodyMix = layerMix.body ?? 50;
  const textureMix = layerMix.texture ?? 50;
  const tailMix = layerMix.tail ?? 50;
  const materialRead = clamp(material * 0.58 + textureMix * 0.28 + brightness * 0.14, 0, 100);
  const spaceRead = clamp(space * 0.58 + tailMix * 0.32 + motion * 0.1, 0, 100);
  const scoreFrom = (current, targetValue, penalty = 0) => Math.round(clamp(100 - Math.abs(current - targetValue) * 1.35 - penalty, 0, 100));
  const primaryDiagnostic = patchDoctor?.diagnostics?.[0] ?? {};
  const macroLabels = Object.fromEntries(macroList.map((macro) => [macro.id, macro.labelZh]));
  const layerLabels = {
    transient: 'Transient 瞬态层',
    body: 'Body 主体层',
    texture: 'Texture 质感层',
    tail: 'Tail 尾音层',
  };
  const macroDelta = Object.entries(primaryDiagnostic.applyAction?.macroDelta ?? {})
    .find(([, value]) => Number.isFinite(value) && value !== 0);
  const layerDelta = Object.entries(primaryDiagnostic.applyAction?.layerDelta ?? {})
    .find(([, value]) => Number.isFinite(value) && value !== 0);
  const [parameterId, delta, scope] = macroDelta
    ? [macroDelta[0], macroDelta[1], 'macro']
    : layerDelta
      ? [layerDelta[0], layerDelta[1], 'layer']
      : ['material', material > target.material ? -6 : 6, 'macro'];
  const currentValue = scope === 'layer'
    ? layerMix[parameterId] ?? 50
    : values[parameterId] ?? 50;
  const targetValue = Math.round(clamp(currentValue + delta, 0, 100));
  const parameterLabel = scope === 'layer'
    ? layerLabels[parameterId] ?? parameterId
    : macroLabels[parameterId] ?? SOUND_LAB_MACRO_DEFS.find((macro) => macro.id === parameterId)?.labelZh ?? parameterId;
  const expectedByParameter = {
    brightness: 'A/B 时重点听 3k-10k 边缘是否更清楚但不刺耳，变化不能只来自音量变小。',
    motion: 'A/B 时重点听声音是否更有运动方向，同时连续触发三次仍像同一个 Patch。',
    material: 'A/B 时重点听主体是否更硬、更金属、更非谐波，但不应只剩尖锐 click。',
    space: 'A/B 时重点听尾巴是否退到主体后面，dry transient 仍要清楚。',
    variation: 'A/B 时重点听每次触发是否有细微生命感，但不要像多个不同音色。',
    transient: 'A/B 时重点听前 20ms 是否更清楚，主体不能被 click 抢走。',
    body: 'A/B 时重点听关掉空间后是否仍有重量或音高锚点。',
    texture: 'A/B 时重点听噪声和颗粒是否贴住主体，而不是单独浮在前面。',
    tail: 'A/B 时重点听尾音是否自然退场，不能糊住下一次触发。',
  };

  const metrics = [
    {
      id: 'transient',
      labelZh: 'Transient 起音',
      targetZh: '目标：第一下清楚、有功能，但不扎耳。',
      currentZh: `当前瞬态 ${Math.round(transientMix)} / 目标 ${target.transient}`,
      listenZh: '只听前 20ms：click 是否说明动作发生，还是已经盖住主体。',
      score: scoreFrom(transientMix, target.transient, brightness > 90 ? 5 : 0),
      delta: Math.round(transientMix - target.transient),
      action: 'focus-controls',
      actionLabelZh: '调包络',
    },
    {
      id: 'body',
      labelZh: 'Body 主体',
      targetZh: '目标：关掉空间后仍有可识别的重量或音高锚点。',
      currentZh: `当前主体 ${Math.round(bodyMix)} / 目标 ${target.body}`,
      listenZh: '听 120Hz-1.2kHz：是否有主体，还是只剩高频纹理和噪声。',
      score: scoreFrom(bodyMix, target.body, Math.abs(transientMix - bodyMix) > 30 ? 6 : 0),
      delta: Math.round(bodyMix - target.body),
      action: 'focus-controls',
      actionLabelZh: '调层级',
    },
    {
      id: 'material',
      labelZh: 'Material 材质',
      targetZh: '目标：材质有非谐波、共振或颗粒证据，而不是单纯变亮。',
      currentZh: `当前材质 ${Math.round(materialRead)} / 目标 ${target.material}`,
      listenZh: '听金属、玻璃、电流或空气边缘：材质应该来自侧频和共振，不是音量错觉。',
      score: scoreFrom(materialRead, target.material, material > 90 && textureMix > 80 ? 7 : 0),
      delta: Math.round(materialRead - target.material),
      action: 'focus-coach',
      actionLabelZh: '看调制',
    },
    {
      id: 'space',
      labelZh: 'Space 空间',
      targetZh: '目标：空间服务交付，尾巴不遮挡起音和主体。',
      currentZh: `当前空间 ${Math.round(spaceRead)} / 目标 ${target.space}`,
      listenZh: '切 dry/full/tail-only：尾巴是否解释场景，还是把动作边缘糊掉。',
      score: scoreFrom(spaceRead, target.space, tailMix > 82 ? 6 : 0),
      delta: Math.round(spaceRead - target.space),
      action: 'focus-practice-loop',
      actionLabelZh: '做 A/B',
    },
  ];

  const overall = Math.round(metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length);
  return {
    titleZh: 'Target Match 目标匹配教练',
    summaryZh: '把当前 Patch 拆成起音、主体、材质和空间四个听感目标；分数低的维度优先做一次“只改一个参数”的 A/B 练习。',
    overall,
    targetNameZh: family?.titleZh ?? '目标音效',
    metrics,
    oneChangeChallenge: {
      titleZh: 'One Change Challenge：只改一个参数',
      diagnosticId: primaryDiagnostic.id ?? '',
      labelZh: `本轮只改 ${parameterLabel}`,
      parameterId,
      parameterScope: scope,
      from: Math.round(currentValue),
      to: targetValue,
      delta: Math.round(delta),
      action: primaryDiagnostic.action ?? 'focus-controls',
      actionLabelZh: primaryDiagnostic.actionLabelZh ?? '去改参数',
      applyActionId: primaryDiagnostic.id ?? '',
      expectedChangeZh: expectedByParameter[parameterId] ?? 'A/B 时只听这一个参数带来的变化，并记录保留或撤回理由。',
      synthPathZh: primaryDiagnostic.synthTargets?.serum ?? 'Serum / Phase Plant / Vital 中只选择一个等价目标参数，不要同时换 source 和 target。',
      reaperNoteZh: `REAPER note: A/B ${parameterLabel} ${Math.round(currentValue)} -> ${targetValue}; 只改一个参数; 听感变化=____; 保留/撤回=____。`,
      steps: [
        '播放 A：记住当前起音、主体、材质和尾巴。',
        `只把 ${parameterLabel} 从 ${Math.round(currentValue)} 调到 ${targetValue}。`,
        '播放 B：不要被音量欺骗，只听目标维度是否更接近。',
        '把保留/撤回理由写进 REAPER item notes。',
      ],
    },
    referenceMatch: buildReferenceMatch({
      family,
      patch,
      profile,
      metrics,
      primaryDiagnostic,
      macroList,
    }),
  };
}

function buildSynthTransferPlan(family, patch, patchDoctor, targetMatchCoach, macroList = []) {
  const diagnostic = patchDoctor?.diagnostics?.[0] ?? {};
  const challenge = targetMatchCoach?.oneChangeChallenge ?? {};
  const macro = macroList.find((item) => item.id === challenge.parameterId)
    ?? macroList.find((item) => item.id === Object.keys(diagnostic.applyAction?.macroDelta ?? {})[0])
    ?? macroList[0]
    ?? {};
  const parameterId = challenge.parameterId ?? macro.id ?? 'brightness';
  const parameterLabel = challenge.labelZh ?? macro.labelZh ?? parameterId;
  const from = Number.isFinite(challenge.from) ? challenge.from : Math.round(patch.macros?.[parameterId] ?? macro.value ?? 50);
  const to = Number.isFinite(challenge.to)
    ? challenge.to
    : clamp(from + (diagnostic.applyAction?.macroDelta?.[parameterId] ?? 0), 0, 100);
  const familyName = family?.titleZh?.split('：')[0] ?? family?.titleZh ?? '当前音效';
  const diagnosticLabel = diagnostic.labelZh ?? '最高优先听感问题';

  return {
    id: 'synth-transfer-plan',
    titleZh: 'Synth Transfer：三合成器迁移练习',
    summaryZh: `把 Patch Doctor 的「${diagnosticLabel}」翻译成 Serum、Phase Plant、Vital 和 REAPER 的同一条练习：只改 ${parameterLabel}，先听变化，再 A/B 证明。`,
    problemZh: diagnostic.listenZh ?? `先听 ${familyName} 中起音、主体、材质或尾巴哪一段最不像目标。`,
    oneChange: {
      diagnosticId: diagnostic.id ?? '',
      applyActionId: diagnostic.applyAction?.id ?? diagnostic.id ?? '',
      parameterId,
      labelZh: parameterLabel,
      from,
      to,
      expectedChangeZh: challenge.expectedChangeZh ?? diagnostic.applyAction?.feedbackZh ?? '只听这一个参数造成的变化，不同时改变层级、宏和效果。',
      actionLabelZh: diagnostic.applyAction?.labelZh ?? challenge.actionLabelZh ?? '试调一次',
    },
    synthSteps: [
      {
        id: 'serum',
        label: 'Serum',
        whereZh: 'Osc / Noise / Filter / FX 或 Matrix 里找到同一个听感来源。',
        doZh: diagnostic.synthTargets?.serum ?? 'Serum: 只把 Macro 绑到一个目标，例如 warp、FM amount、filter cutoff 或 noise level。',
        listenZh: `听 ${parameterLabel} ${from} -> ${to} 后，${diagnosticLabel} 是否更接近目标。`,
        proofZh: '先 bypass reverb/delay，再开 FX；确认不是空间变大造成的错觉。',
      },
      {
        id: 'phasePlant',
        label: 'Phase Plant',
        whereZh: 'Generator lane / Modulator / FX lane 中找到 transient、body、texture 或 tail 的对应层。',
        doZh: diagnostic.synthTargets?.phasePlant ?? 'Phase Plant: solo 问题 lane，只让一个 Macro 或 modulator 影响一个目标参数。',
        listenZh: '先听 lane solo，再回 full；判断主体、材质和尾巴是否仍像同一个声音。',
        proofZh: '保留 lane 名称和 Macro 名称，方便回到 REAPER 版本备注复盘。',
      },
      {
        id: 'vital',
        label: 'Vital',
        whereZh: 'Osc / Sample / Filter / Matrix / FX 中找到对应 warp、FM、noise 或 resonator 深度。',
        doZh: diagnostic.synthTargets?.vital ?? 'Vital: 用 Matrix 只连一个目标，先固定包络，再做小幅参数移动。',
        listenZh: '听 dry 主体是否变好，再打开空间；不要让 chorus/reverb 掩盖材质判断。',
        proofZh: '把改动写成“参数 from -> to”，不要只写“更亮/更暗”。',
      },
    ],
    reaperProof: {
      titleZh: 'REAPER 证明',
      noteZh: challenge.reaperNoteZh ?? diagnostic.reaperCheckZh ?? `REAPER: ${familyName} dry / full / tail-only A/B；只改一个参数 ${parameterLabel} ${from} -> ${to}；保留/撤回=____。`,
      checklist: [
        '渲染 dry、full、tail-only 三版，匹配响度后再判断。',
        'item note 写清楚只改一个参数、听感变化和保留/撤回理由。',
        '如果只变大声或只变亮，不算通过，回到 Patch Doctor 下一项。',
      ],
    },
    actions: [
      {
        type: 'doctor-apply',
        labelZh: diagnostic.applyAction?.labelZh ?? '试调这个变化',
        applyDiagnosticId: diagnostic.id ?? '',
      },
      { type: 'workbench', labelZh: '去改参数', workbenchAction: diagnostic.action ?? challenge.action ?? 'focus-controls' },
      { type: 'workbench', labelZh: '做 A/B', workbenchAction: 'focus-practice-loop' },
      { type: 'workbench', labelZh: '看导出', workbenchAction: 'focus-export' },
    ],
  };
}

function buildPerceptualSignature(family, patch, patchDoctor, macroList = []) {
  const values = patch.macros ?? {};
  const layerMix = patch.layerMix ?? {};
  const familyName = family?.titleZh?.split('：')[0] ?? family?.titleZh ?? '目标音效';
  const acousticCues = patch.globalFx?.acousticCues ?? {};
  const polish = patch.globalFx?.masterPolish ?? {};
  const comfortBus = polish.comfortBus ?? {};
  const spaceFx = patch.globalFx?.space ?? {};
  const totalGainByEngine = patch.layers.reduce((totals, layer) => {
    totals[layer.engine] = (totals[layer.engine] ?? 0) + clamp(layer.gain ?? 0, 0, 1.4);
    return totals;
  }, {});
  const modal = totalGainByEngine.modalResonator ?? 0;
  const fm = totalGainByEngine.fmBurst ?? 0;
  const comb = totalGainByEngine.combDelay ?? 0;
  const noise = (totalGainByEngine.sampleGrain ?? 0) + (totalGainByEngine.filteredNoise ?? 0);
  const transientValue = clamp(
    (layerMix.transient ?? 50) * 0.7
      + (patch.dsp?.transient?.click ?? 0) * 36
      + (acousticCues.bodyLagMs ?? 0) * 2,
    0,
    100,
  );
  const bodyValue = clamp(
    (layerMix.body ?? 50) * 0.5
      + modal * 18
      + fm * 12
      + (comfortBus.monoAnchor ?? 0) * 40,
    0,
    100,
  );
  const materialValue = clamp(
    (values.material ?? 50) * 0.48
      + modal * 16
      + fm * 14
      + comb * 12
      + noise * 6,
    0,
    100,
  );
  const spaceValue = clamp(
    100
      - Math.abs((layerMix.tail ?? 50) - 38) * 0.9
      + (acousticCues.tailPreDelayMs ?? 0) * 1.4
      - (spaceFx.mix ?? 0) * 22,
    0,
    100,
  );
  const comfortValue = clamp(
    (comfortBus.warmth ?? 0) * 26
      + (comfortBus.deHarsh ?? 0) * 52
      + (comfortBus.headroom ?? 0) * 360
      + (comfortBus.tailDuck ?? 0) * 38,
    0,
    100,
  );
  const proofPoints = [
    {
      role: 'transient',
      labelZh: 'Transient 起音可信度',
      value: Math.round(transientValue),
      listenZh: '第一下应该像真实触点，短、清楚、没有被尾巴糊住。',
      evidenceZh: `transient ${Math.round(layerMix.transient ?? 0)}% / body lag ${formatQualityNumber(acousticCues.bodyLagMs ?? 0)}ms`,
    },
    {
      role: 'body',
      labelZh: 'Body 主体锚点',
      value: Math.round(bodyValue),
      listenZh: '主体要能听出重量或基频，不应只剩亮噪声。',
      evidenceZh: `modal ${formatQualityNumber(modal)} / FM ${formatQualityNumber(fm)} / mono anchor ${formatQualityNumber((comfortBus.monoAnchor ?? 0) * 100)}%`,
    },
    {
      role: 'material',
      labelZh: 'Material 材质身份',
      value: Math.round(materialValue),
      listenZh: '金属、玻璃或电流感来自非谐波侧频、modal partial 和 comb 关系，不是单纯变亮。',
      evidenceZh: `FM/modal/comb = ${formatQualityNumber(fm)} / ${formatQualityNumber(modal)} / ${formatQualityNumber(comb)}`,
    },
    {
      role: 'space',
      labelZh: 'Space 空间可信度',
      value: Math.round(spaceValue),
      listenZh: '尾巴应在起音之后出现，帮助尺寸感但不遮挡主体。',
      evidenceZh: `tail ${Math.round(layerMix.tail ?? 0)}% / predelay ${formatQualityNumber(acousticCues.tailPreDelayMs ?? 0)}ms / wet ${formatQualityNumber((spaceFx.mix ?? 0) * 100)}%`,
    },
    {
      role: 'comfort',
      labelZh: 'Comfort 听感舒适度',
      value: Math.round(comfortValue),
      listenZh: '真实感还取决于不过刺、不过宽、响度匹配后仍有质感。',
      evidenceZh: `de-harsh ${formatQualityNumber((comfortBus.deHarsh ?? 0) * 100)}% / headroom ${formatQualityNumber((comfortBus.headroom ?? 0) * 100)}%`,
    },
  ];
  const primaryDiagnostic = patchDoctor?.diagnostics?.[0] ?? {};
  const macroDelta = Object.entries(primaryDiagnostic.applyAction?.macroDelta ?? {})
    .find(([, value]) => Number.isFinite(value) && value !== 0);
  const layerDelta = Object.entries(primaryDiagnostic.applyAction?.layerDelta ?? {})
    .find(([, value]) => Number.isFinite(value) && value !== 0);
  const [parameterId, rawDelta, scope] = macroDelta
    ? [macroDelta[0], macroDelta[1], 'macro']
    : layerDelta
      ? [layerDelta[0], layerDelta[1], 'layer']
      : ['material', (values.material ?? 50) > 74 ? -6 : 6, 'macro'];
  const layerLabels = {
    transient: 'Transient 瞬态层',
    body: 'Body 主体层',
    texture: 'Texture 质感层',
    tail: 'Tail 尾音层',
  };
  const macro = macroList.find((item) => item.id === parameterId);
  const current = scope === 'layer'
    ? Number(layerMix[parameterId] ?? 50)
    : Number(values[parameterId] ?? macro?.value ?? 50);
  const delta = Number.isFinite(rawDelta) ? rawDelta : 6;
  const target = Math.round(clamp(current + delta, 0, 100));
  const label = scope === 'layer'
    ? layerLabels[parameterId] ?? parameterId
    : macro?.labelZh ?? SOUND_LAB_MACRO_DEFS.find((item) => item.id === parameterId)?.labelZh ?? parameterId;

  return {
    titleZh: 'Perceptual Signature 听感指纹',
    identityZh: `${familyName} 的真实感来自 FM/modal 非谐波材质、短 transient、受控 tail 和 comfort bus；如果 A/B 后只剩更大声而不是更像材质，就撤回这次修改。`,
    realismScore: Math.round(proofPoints.reduce((sum, point) => sum + point.value, 0) / proofPoints.length),
    proofPoints,
    nextMove: {
      parameterId,
      labelZh: label,
      from: Math.round(current),
      to: target,
      action: primaryDiagnostic.action ?? 'focus-controls',
      reasonZh: primaryDiagnostic.listenZh ?? `只改 ${label}，听材质是否更像目标而不是单纯更亮。`,
    },
    synthTranslation: {
      serum: 'Serum: 用 FM from B / warp 做非谐波边缘，Noise 只补 transient/texture；Macro 只映射一个目标参数。',
      phasePlant: 'Phase Plant: 把 transient、FM body、modal/comb tail 分 lane；用 audio-rate mod 或 resonator lane 控制材质。',
      vital: 'Vital: 用 FM/phase/spectral warp 做侧频，Env 控制短 decay，Macro material 控制 resonator/warp 深度。',
    },
    reaperCheckZh: `REAPER: 导出 dry / full / tail-only，并记录 A/B ${label} ${Math.round(current)} -> ${target}; 响度匹配后只判断 transient、body、material、space 哪一项更接近目标。`,
  };
}

function buildMissionBrief(family, patch, patchDoctor, workflowStep = 'source') {
  const familyName = family?.titleZh?.split('：')[0] ?? family?.titleZh ?? '目标音效';
  const primaryDiagnostic = patchDoctor?.diagnostics?.[0];
  const activeIndexByStep = {
    source: 0,
    shape: 1,
    compare: 2,
    deliver: 3,
  };
  const steps = [
    {
      id: 'listen',
      labelZh: '听',
      titleZh: '先听目标声',
      goalZh: `先听 ${familyName} 的 dry 主体，判断起音、主体、质感和尾巴是否分清。`,
      proofZh: '能说出这声音像什么材质，以及哪一段最像目标。',
      action: 'focus-source',
      actionLabelZh: '回到声源',
    },
    {
      id: 'edit',
      labelZh: '改',
      titleZh: '只改一个听感问题',
      goalZh: `优先处理「${primaryDiagnostic?.labelZh ?? '最高风险'}」，不要同时乱动多个宏和效果。`,
      proofZh: '能写下改了哪个参数、为什么改，以及预期会听到什么变化。',
      action: 'focus-controls',
      actionLabelZh: '去改参数',
    },
    {
      id: 'verify',
      labelZh: '验',
      titleZh: 'A/B 验证方向',
      goalZh: '切 Raw / Comfort / Studio 或 dry / full，确认不是响度错觉。',
      proofZh: '能决定保留或撤回，并用一句话说明原因。',
      action: 'focus-practice-loop',
      actionLabelZh: '做 A/B',
    },
    {
      id: 'deliver',
      labelZh: '交付',
      titleZh: '记录并导出',
      goalZh: '把 Patch JSON、REAPER Notes、dry / full / tail-only 检查补齐。',
      proofZh: '能在 REAPER 里复现本轮变化，并交付可回看的版本记录。',
      action: 'focus-export',
      actionLabelZh: '看交付',
    },
  ];
  const activeStep = steps[activeIndexByStep[workflowStep] ?? 0] ?? steps[0];
  const nextStep = workflowStep === 'deliver'
    ? steps[0]
    : steps[Math.min(steps.indexOf(activeStep) + 1, steps.length - 1)];

  return {
    titleZh: 'Mission Brief：听 / 改 / 验 / 交付',
    summaryZh: `初学者只按这四步走：先听 ${familyName}，再只改一个参数，最后用 A/B 和 REAPER 记录验证。`,
    activeStepId: activeStep.id,
    steps,
    nextAction: {
      labelZh: `下一步：${nextStep.titleZh}`,
      action: nextStep.action,
    },
    passCriteriaZh: '过关标准：A/B 后能说明保留/撤回理由，并记录“只改一个参数”的 REAPER note。',
    primaryDiagnosticId: primaryDiagnostic?.id ?? '',
  };
}

function buildPracticeFocus(family, patch, patchDoctor, practiceLoop, earTriage, workflowStep = 'source') {
  const familyName = family?.titleZh?.split('：')[0] ?? family?.titleZh ?? '当前音效';
  const diagnostic = patchDoctor?.diagnostics?.[0] ?? {};
  const triageSteps = earTriage?.steps ?? [];
  const isolateStep = triageSteps.find((step) => step.id === 'isolate') ?? {};
  const adjustStep = triageSteps.find((step) => step.id === 'adjust') ?? {};
  const verifyOutputMode = patch.outputMode === 'raw' ? 'comfort' : patch.outputMode ?? 'comfort';
  const focusByWorkflow = {
    source: 'listen',
    shape: 'adjust',
    compare: 'verify',
    deliver: 'verify',
  };
  const steps = [
    {
      id: 'listen',
      labelZh: '01 先听',
      titleZh: '听当前 Patch',
      bodyZh: `先听 ${familyName} 的 dry/core，再听 full；只判断起音、主体、质感和尾巴哪一段最不对。`,
      action: 'focus-source',
      actionLabelZh: '看声源',
      playAction: 'current',
    },
    {
      id: 'isolate',
      labelZh: '02 Solo',
      titleZh: isolateStep.actionLabelZh ?? 'Solo 一层',
      bodyZh: isolateStep.bodyZh ?? 'Solo transient / body / texture / tail 其中一层，确认问题到底来自哪一层。',
      action: 'focus-practice-loop',
      actionLabelZh: isolateStep.actionLabelZh ?? '分层试听',
      layerAudition: isolateStep.layerAudition ?? 'full',
    },
    {
      id: 'adjust',
      labelZh: '03 只改一次',
      titleZh: adjustStep.actionLabelZh ?? diagnostic.applyAction?.labelZh ?? '试调一次',
      bodyZh: adjustStep.bodyZh ?? diagnostic.applyAction?.summaryZh ?? '只动 Patch Doctor 建议的一处参数，避免同时改宏、层级和效果。',
      action: diagnostic.action ?? 'focus-controls',
      actionLabelZh: diagnostic.applyAction?.labelZh ?? '试调一次',
      applyDiagnosticId: diagnostic.id ?? '',
    },
    {
      id: 'verify',
      labelZh: '04 验收',
      titleZh: 'A/B 写结论',
      bodyZh: `切 dry / full / ${verifyOutputMode}，响度匹配后决定保留或撤回：${practiceLoop?.expectedCueZh ?? '听感必须能用一句话说明。'}`,
      action: 'focus-practice-loop',
      actionLabelZh: 'A/B 验证',
      outputMode: verifyOutputMode,
    },
  ];

  return {
    id: 'practice-focus',
    titleZh: 'Practice Focus 练习焦点',
    summaryZh: `这一轮只处理「${diagnostic.labelZh ?? '最高优先听感'}」：先听、solo 一层、只改一个参数，再用 A/B 和 REAPER 记录验收。`,
    currentStepId: focusByWorkflow[workflowStep] ?? 'listen',
    problemId: diagnostic.id ?? '',
    problemZh: diagnostic.labelZh ?? '最高优先听感',
    steps,
    passCriteriaZh: '过关标准：dry / full / tail-only 或 Raw / Comfort / Studio A/B 后，能写下只改一个参数的保留/撤回理由。',
    reaperNoteTemplate: practiceLoop?.reaperNoteTemplate ?? `REAPER A/B ${familyName}: 只改一个参数；保留/撤回=____；理由=____。`,
  };
}

function buildBeginnerFocusCard(currentStep, nextStep, outputMode = 'comfort') {
  const step = currentStep ?? {};
  const routeAction = step.applyDiagnosticId
    ? { type: 'doctor', doctorId: step.applyDiagnosticId }
    : step.layerAudition
      ? { type: 'layer', layerAudition: step.layerAudition }
      : step.outputMode
        ? { type: 'output', outputMode: step.outputMode }
        : { type: 'workbench', workbenchAction: step.workbenchAction ?? 'focus-controls' };
  const verifyAction = step.outputMode
    ? { type: 'output', outputMode: step.outputMode }
    : { type: 'workbench', workbenchAction: 'focus-practice-loop' };

  return {
    id: 'beginner-current-focus',
    stepId: step.id ?? 'target',
    nextStepId: nextStep?.id ?? '',
    titleZh: `现在：${step.titleZh ?? '听当前步骤'}`,
    listenQuestionZh: step.id === 'envelope'
      ? '先听 Attack 是否太硬或太钝，再听 Decay / Release 是否让主体和尾巴贴住动作。'
      : step.listenZh ?? '先听当前 patch 的 dry 与 full，只判断这一段是否更接近目标。',
    oneChangeRuleZh: step.id === 'envelope'
      ? '只改一个参数：Attack、Decay、Sustain、Release 里先选最明显的一项；不要同时改宏、材质和空间。'
      : `只改一个参数：${step.actionLabelZh ?? '当前动作'}。如果听不出它改变了哪一段，就撤回。`,
    proofQuestionZh: 'A/B 响度匹配后写 REAPER 结论：这次变化保留还是撤回，理由必须能对应到 transient / body / texture / tail。',
    guardrails: [
      'One-change：每次只改一个参数或一层，避免“听起来变了但不知道为什么”。',
      'Loudness-match：A/B 前先匹配响度，避免把更大声误判成更好听。',
      'Dry first：先听 dry/core，再加空间和抛光，防止 reverb 掩盖真实问题。',
    ],
    actions: [
      { id: 'listen', type: 'play', labelZh: '试听当前', noteZh: '听完整 patch' },
      { id: 'locate', labelZh: step.actionLabelZh ?? '定位模块', noteZh: '跳到该调制区', ...routeAction },
      { id: 'verify', labelZh: 'A/B 验收', noteZh: `切到 ${step.outputMode ?? outputMode} 或练习闭环`, ...verifyAction },
    ],
  };
}

function buildBeginnerSynthesisPath(family, patch, patchDoctor, workflowStep = 'source') {
  const familyName = family?.titleZh?.split('：')[0] ?? family?.titleZh ?? '目标音效';
  const diagnostic = patchDoctor?.diagnostics?.[0] ?? {};
  const outputMode = patch.outputMode === 'raw' ? 'comfort' : patch.outputMode ?? 'comfort';
  const macroLabel = diagnostic.applyAction?.labelZh ?? '试调一次';
  const steps = [
    {
      id: 'target',
      labelZh: '01',
      titleZh: '定目标与材质',
      whyZh: '先知道要做的是什么材质和动作长度，否则后面所有参数都会变成盲调。',
      listenZh: `先听 ${familyName} 的完整 patch：判断它更像 hit、ping、crackle、whoosh 还是 charge。`,
      actionLabelZh: '选目标',
      workbenchAction: 'focus-source',
      synthActions: {
        serum: 'Serum: 先选 Basic Shapes 或相近 wavetable，不开复杂 FX。',
        phasePlant: 'Phase Plant: 先建 transient / body / texture / tail 四个 lane。',
        vital: 'Vital: 先用 Osc + Noise 搭出干声主体，暂时关大混响。',
      },
      reaperProofZh: 'REAPER: 新建 dry 参考 item，命名 family_target_dry_v001。',
    },
    {
      id: 'waveform',
      labelZh: '02',
      titleZh: '判断基础波形',
      whyZh: '基础波形不是死背名字，而是用 pitch、亮边、空心感和噪声判断声源角色。',
      listenZh: '先听 body-only：能哼出中心音就找 sine/triangle/FM；亮边密就找 saw/comb；空气颗粒就找 noise。',
      actionLabelZh: 'Solo body',
      workbenchAction: 'focus-waveform',
      layerAudition: 'body',
      synthActions: {
        serum: 'Serum: Solo Osc A/B 与 Noise，先确认主体是不是 oscillator。',
        phasePlant: 'Phase Plant: Mute noise/tail lane，只听 generator 或 modal body。',
        vital: 'Vital: 关 Noise 和 FX，只听 Osc/warp/FM 是否仍像目标。',
      },
      reaperProofZh: 'REAPER: 导出 body-only，对照 full 写一句“主体来自什么波形或调制”。',
    },
    {
      id: 'envelope',
      labelZh: '03',
      titleZh: '塑造时间形状',
      whyZh: 'Attack、Decay、Sustain、Release 决定它是 click、pluck、hit、tail 还是持续声。',
      listenZh: '只改 Attack 或 Decay 一项：前沿变钝、主体变短或尾巴变长时，先听动作是否更贴画面。',
      actionLabelZh: '调 ADSR',
      workbenchAction: 'focus-controls',
      synthActions: {
        serum: 'Serum: Amp Env 先定 attack/decay，再少量给 filter env。',
        phasePlant: 'Phase Plant: 每个 lane 单独 envelope，transient 短，tail 长。',
        vital: 'Vital: Env 1 控 amp，Env 2 小幅控 filter/FM amount。',
      },
      reaperProofZh: 'REAPER: A/B attack 或 decay 两版，记录哪一版更贴动作长度。',
    },
    {
      id: 'material',
      labelZh: '04',
      titleZh: '增加材质与共振',
      whyZh: '金属、玻璃、机械感通常来自非整数 FM、modal peak、comb 或短共振，而不是单纯变亮。',
      listenZh: diagnostic.listenZh ?? '只改一个材质参数，听它是否更像目标材质，而不是更刺耳。',
      actionLabelZh: macroLabel,
      workbenchAction: diagnostic.action ?? 'focus-material-resonance',
      applyDiagnosticId: diagnostic.id ?? '',
      synthActions: {
        serum: 'Serum: 用 FM from B、warp、comb/filter resonance 做非谐波边缘。',
        phasePlant: 'Phase Plant: 加 FM lane、resonator lane 或 comb filter，先低 mix。',
        vital: 'Vital: 用 FM/phase/spectral warp 产生 sidebands，再用 filter 收住尖峰。',
      },
      reaperProofZh: diagnostic.reaperCheckZh ?? 'REAPER: full vs material-change A/B，响度匹配后判断保留或撤回。',
    },
    {
      id: 'motion',
      labelZh: '05',
      titleZh: '加入可控运动',
      whyZh: '好的合成器音效不是静态截图，LFO、Envelope、Velocity 和 Macro 要让材质有方向。',
      listenZh: '听变化是否像同一个物体在动；如果每次都像不同音色，说明 variation 或调制深度过大。',
      actionLabelZh: '看调制',
      workbenchAction: 'focus-coach',
      synthActions: {
        serum: 'Serum: LFO 小幅推 wavetable/filter/FM；Chaos 只做微变化。',
        phasePlant: 'Phase Plant: Random/LFO 控 lane gain、filter 或 resonator amount。',
        vital: 'Vital: LFO/Random 推 filter、spectral warp 或 pan，深度先小后大。',
      },
      reaperProofZh: 'REAPER: 连续渲染 3 次，确认变体有生命感但仍是同一 patch。',
    },
    {
      id: 'space',
      labelZh: '06',
      titleZh: '空间与音质抛光',
      whyZh: '空间负责距离和退场，不能盖住 transient；音质判断必须先响度匹配。',
      listenZh: `切 Raw / Comfort / ${outputMode}，听 de-harsh、headroom、tail duck 是否让声音更稳而不是更大。`,
      actionLabelZh: '听 Comfort',
      outputMode,
      synthActions: {
        serum: 'Serum: reverb/delay mix 先低，保留 dry transient。',
        phasePlant: 'Phase Plant: FX lane 后段做 room/tail，不要让全声道进大湿混响。',
        vital: 'Vital: 控 reverb width/predelay，用 release 接尾巴，不让空间抢主体。',
      },
      reaperProofZh: 'REAPER: 导出 dry / full / tail-only，响度匹配后判断空间是否服务动作。',
    },
    {
      id: 'export',
      labelZh: '07',
      titleZh: '交付与复盘',
      whyZh: '能复现、能命名、能 A/B 解释，才算真正学会，而不是偶然捏出一次。',
      listenZh: '最后再听 full：确认起音、主体、材质、运动和尾巴都各司其职。',
      actionLabelZh: '导出检查',
      workbenchAction: 'focus-export',
      synthActions: {
        serum: 'Serum: 保存 preset，并在宏名里写明 tone/motion/material/space。',
        phasePlant: 'Phase Plant: 保存 patch，保留 lane 命名和 macro route。',
        vital: 'Vital: 保存 preset，并导出一份带备注的版本。',
      },
      reaperProofZh: 'REAPER: 写清 patch、macro、A/B 结果，导出 dry / full / tail-only 三版。',
    },
  ];
  const currentByWorkflow = {
    source: 'target',
    shape: 'envelope',
    compare: 'space',
    deliver: 'export',
  };
  const currentStepId = currentByWorkflow[workflowStep] ?? 'target';
  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === currentStepId));
  const currentStep = steps[currentIndex] ?? steps[0];
  const nextStep = steps[Math.min(steps.length - 1, currentIndex + 1)] ?? steps[0];

  return {
    id: 'beginner-synthesis-path',
    titleZh: 'Synthesis Path：从零到交付路线',
    summaryZh: `按这条线把 ${familyName} 从听感目标推进到 Serum / Phase Plant / Vital 可复刻的 patch，最后用 REAPER A/B 证明。`,
    currentStepId,
    currentStep,
    nextStep,
    steps,
    focusCard: buildBeginnerFocusCard(currentStep, nextStep, outputMode),
    reaperTemplateZh: `REAPER A/B ${familyName}: dry / full / tail-only; 只改一个参数=____; 听感变化=____; 保留/撤回=____。`,
  };
}

function buildEarTrainingChain(
  family,
  patch,
  waveformFingerprint,
  listeningCompass,
  earTriage,
  patchDoctor,
  practiceLoop,
  workflowStep = 'source',
) {
  const familyName = family?.titleZh?.split('：')[0] ?? family?.titleZh ?? '当前音效';
  const diagnostic = patchDoctor?.diagnostics?.[0] ?? {};
  const primaryIngredients = (waveformFingerprint?.ingredients ?? [])
    .slice()
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .slice(0, 3)
    .map((item) => item.label)
    .join(' / ');
  const soloStep = (earTriage?.steps ?? []).find((step) => step.id === 'isolate') ?? {};
  const timeSplit = (listeningCompass?.stages ?? [])
    .map((stage) => stage.labelZh?.replace(/^\d+\s*/, '') ?? stage.id)
    .filter(Boolean)
    .join(' / ');
  const activeByWorkflow = {
    source: 'waveform-map',
    shape: 'one-change',
    compare: 'ab-proof',
    deliver: 'ab-proof',
  };
  const outputMode = patch.outputMode === 'raw' ? 'comfort' : patch.outputMode ?? 'comfort';

  const steps = [
    {
      id: 'waveform-map',
      labelZh: '01 波形地图',
      titleZh: '先判断基础波形角色',
      listenZh: `先听 ${familyName} 的主体像 Sine、Square、Saw、Triangle 还是 Noise 的组合；当前最像 ${primaryIngredients || 'Sine / Noise'}。`,
      proofZh: '证据：能说明 pitch 锚点、亮边和噪声分别来自哪里，而不是只说“像金属”。',
      action: 'focus-waveform',
      actionLabelZh: '打开波形侦探',
      waveformDrillStep: 'anchor',
    },
    {
      id: 'time-split',
      labelZh: '02 三段听法',
      titleZh: '把声音切成起音 / 主体 / 尾巴',
      listenZh: `按 ${timeSplit || '起音 / 主体 / 尾巴'} 的顺序听：先判断第一下，再判断材质身份，最后判断空间尾巴是否遮挡主体。`,
      proofZh: '证据：能说出问题发生在 transient、body 还是 tail，而不是直接乱调所有宏。',
      action: 'focus-practice-loop',
      actionLabelZh: '看听辨导航',
      playAction: 'current',
    },
    {
      id: 'layer-solo',
      labelZh: '03 Solo 层',
      titleZh: '只听 body 层确认主体',
      listenZh: soloStep.bodyZh ?? 'Solo body 层：关掉 transient、texture 和 tail 后，如果主体仍成立，就说明基础波形/共振锚点判断可靠。',
      proofZh: '证据：body-only 仍能听出 pitch、重量或 modal 金属主体；如果听不出，问题可能来自噪声或空间假象。',
      action: 'focus-practice-loop',
      actionLabelZh: soloStep.actionLabelZh ?? 'Solo body',
      layerAudition: 'body',
    },
    {
      id: 'one-change',
      labelZh: '04 只改一次',
      titleZh: diagnostic.applyAction?.labelZh ?? '按 Patch Doctor 只改一个问题',
      listenZh: diagnostic.listenZh ?? '只动最高优先级问题的一处参数，听它是否真的修正当前问题。',
      proofZh: diagnostic.reaperCheckZh ?? '证据：A/B 后能写下保留或撤回原因，并说明不是响度错觉。',
      action: diagnostic.action ?? 'focus-controls',
      actionLabelZh: diagnostic.applyAction?.labelZh ?? '试调一次',
      applyDiagnosticId: diagnostic.id ?? '',
    },
    {
      id: 'ab-proof',
      labelZh: '05 A/B 证明',
      titleZh: '写 REAPER 交付证据',
      listenZh: `切 dry / full / tail-only，再切 Raw / Comfort / ${outputMode}，响度匹配后判断变化是否更接近目标。`,
      proofZh: '证据：REAPER note 里有 A/B 结论、只改一个参数、保留/撤回理由和下一轮要修哪里。',
      action: 'focus-practice-loop',
      actionLabelZh: '写 A/B 结论',
      outputMode,
    },
  ];

  return {
    id: 'beginner-ear-chain',
    titleZh: 'Beginner Ear Chain：听音诊断链',
    summaryZh: `从零开始按一条线走：先看波形，再听起音、主体、尾巴，solo 问题层，只改一个参数，最后用 A/B 和 REAPER 证明。`,
    activeStepId: activeByWorkflow[workflowStep] ?? 'waveform-map',
    steps,
    synthMap: {
      serum: 'Serum: 用 Osc A/B、Noise、Filter 和 FX bypass 复刻每一步；先关空间再判断主体。',
      phasePlant: 'Phase Plant: 把 transient、body、texture、tail 分成 lane，用 mute/solo 和 macro 做同一步 A/B。',
      vital: 'Vital: 用 Osc、Sample/Noise、Filter、Warp/FM 和 FX 开关对应波形、材质与尾巴。',
    },
    reaperNoteTemplate: practiceLoop?.reaperNoteTemplate
      ?? `REAPER A/B ${familyName}: dry / full / tail-only; 只改一个参数; 保留/撤回=____; 下一轮=____。`,
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

function buildParameterCoach(patch, macroList) {
  const macroFocus = [...macroList]
    .sort((a, b) => Math.abs((b.value ?? 50) - 50) - Math.abs((a.value ?? 50) - 50))[0] ?? macroList[0];
  const macroCopy = SOUND_LAB_PARAMETER_COACH.macros[macroFocus?.id] ?? SOUND_LAB_PARAMETER_COACH.macros.material;
  return {
    titleZh: '实时参数导师',
    summaryZh: '拖动任意宏、包络、层级或 XY 时，这里会立刻说明：听哪里、改了什么、怎样在 Serum / Phase Plant / Vital 里复刻。',
    focus: {
      id: macroFocus?.id ?? 'material',
      value: macroFocus?.value ?? 50,
      categoryZh: 'Macro',
      ...macroCopy,
    },
    checklist: [
      '先听 dry 主体，不急着加空间。',
      '一次只改一个参数，并用 A/B 复听。',
      '把听感变化翻译成插件里的一个目标参数。',
    ],
  };
}

function buildAnalyzerCoach(patch, macroList = []) {
  const macros = patch.macros ?? {};
  const layerMix = patch.layerMix ?? {};
  const macroById = new Map(macroList.map((macro) => [macro.id, macro]));
  const macroValue = (id, fallback = 50) => clamp(macroById.get(id)?.value ?? macros[id] ?? fallback, 0, 100);
  const layerValue = (id, fallback = 50) => clamp(layerMix[id] ?? fallback, 0, 100);
  const envelope = patch.envelope ?? {};
  const attackMs = Math.round((envelope.attack ?? 0.006) * 1000);
  const releaseMs = Math.round((envelope.release ?? 0.32) * 1000);
  const resonatorCount = patch.dsp?.resonators?.length ?? 0;

  const bands = [
    {
      id: 'transient',
      labelZh: 'Transient 起音',
      rangeZh: '0-80ms / 2k-12k',
      parameterId: 'transient',
      value: Math.round((layerValue('transient', 70) + Math.max(0, 90 - attackMs)) / 2),
      listenZh: '波形最前面越陡，click 越硬；如果第一下刺耳，先减 transient 或拉长 Attack。',
      synthZh: 'Serum / Phase Plant / Vital: 缩短 noise burst 或 Amp Env，必要时降低 click/noise gain。',
      reaperZh: 'REAPER 放大前 50ms，对比 dry 和 full；A/B 时确认变化不是整体音量变小。',
      action: 'focus-waveform',
      actionLabelZh: '看前沿',
    },
    {
      id: 'body',
      labelZh: 'Body 主体',
      rangeZh: '120Hz-1.2k',
      parameterId: 'material',
      value: Math.round((layerValue('body', 70) + macroValue('material', 58)) / 2),
      listenZh: '频谱中段决定重量和材质身份；主体不够时声音会只剩噪声、亮边或空间尾巴。',
      synthZh: 'Serum / Vital 用 sine、triangle、FM carrier 或 resonant filter；Phase Plant 用独立 body lane。',
      reaperZh: 'REAPER 用低通/高通各听一遍，检查 body-only 是否仍然像目标音效。',
      action: 'focus-controls',
      actionLabelZh: '调材质',
    },
    {
      id: 'air',
      labelZh: 'Air / Edge 高频边缘',
      rangeZh: '4k-16k',
      parameterId: 'brightness',
      value: Math.round((macroValue('brightness', 66) + layerValue('texture', 48)) / 2),
      listenZh: '高频让金属、玻璃、电流更容易被识别；过多会薄、尖、像普通点击。',
      synthZh: 'Serum / Vital 调 filter cutoff、warp、noise bright；Phase Plant 调 filter lane 或 harmonic lane。',
      reaperZh: 'REAPER 看 spectrum 里 4k-10k 是否尖峰过高，响度匹配后再决定保留。',
      action: 'focus-controls',
      actionLabelZh: '调明暗',
    },
    {
      id: 'tail',
      labelZh: 'Tail 空间尾巴',
      rangeZh: `${releaseMs}ms+ / reverb send`,
      parameterId: 'space',
      value: Math.round((macroValue('space', 32) + layerValue('tail', 36)) / 2),
      listenZh: '尾巴负责距离感和退场；如果尾巴盖住主体，先减 wet/send，再补短 room。',
      synthZh: 'Serum / Vital 用 reverb/delay mix 和 release；Phase Plant 把 room/reverb 放到 FX lane 后段。',
      reaperZh: 'REAPER 导出 dry / full / tail-only 三版，A/B 确认 tail 没有遮挡 transient。',
      action: 'focus-practice-loop',
      actionLabelZh: '听尾巴',
    },
    {
      id: 'motion',
      labelZh: 'Motion 调制运动',
      rangeZh: `${resonatorCount || 3} resonators / LFO`,
      parameterId: 'motion',
      value: macroValue('motion', 48),
      listenZh: '频谱峰值左右移动说明参数正在调制；运动要能听见，但不能让目标材质失焦。',
      synthZh: 'Serum / Vital 用 LFO/Random 小幅推 WT、filter 或 FM；Phase Plant 用 mod source 控 lane 参数。',
      reaperZh: 'REAPER 连续触发三次，确认每次变化像同一套音色，而不是随机乱跳。',
      action: 'focus-controls',
      actionLabelZh: '调运动',
    },
  ];

  const nextMove = [...bands]
    .sort((a, b) => Math.abs((b.value ?? 50) - 55) - Math.abs((a.value ?? 50) - 55))[0] ?? bands[1];

  return {
    titleZh: '频谱 / 波形读图教练',
    beginnerRuleZh: '先看时间：前 80ms 是起音；再看频段：中低频是主体，高频是边缘；最后 A/B：只改一个参数并在 REAPER 记录结论。',
    nextMove: {
      parameterId: nextMove.parameterId,
      labelZh: nextMove.labelZh,
      value: nextMove.value,
      action: nextMove.action ?? 'focus-controls',
      reaperNoteZh: `REAPER A/B: 只改 ${nextMove.labelZh} 相关参数，先看 waveform/spectrum，再写下保留或撤回理由。`,
    },
    bands,
  };
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

function buildOutputCompare(patch) {
  return {
    activeMode: patch.outputMode ?? 'comfort',
    practiceZh: '先听 Raw 的尖锐边缘，再听 Comfort 的 de-harsh 和 headroom，最后听 Studio 的完整抛光。',
    modes: [
      {
        id: 'raw',
        label: 'Raw',
        titleZh: '未处理输出',
        noteZh: '无 polish / 无 de-harsh，用来听刺耳边缘和动态拥挤。',
      },
      {
        id: 'comfort',
        label: 'Comfort',
        titleZh: '舒适输出',
        noteZh: 'de-harsh + 余量，听声音是否更稳、更不扎耳。',
      },
      {
        id: 'studio',
        label: 'Studio',
        titleZh: '交付输出',
        noteZh: 'Studio quality + polish，听完整合成器质感和交付响度。',
      },
    ],
  };
}

function soloLayerMix(role, baseMix = {}) {
  const roles = ['transient', 'body', 'texture', 'tail'];
  return Object.fromEntries(roles.map((item) => [item, item === role ? 100 : 0]));
}

function buildProceduralSourceMap(patch) {
  const roleLabels = {
    transient: 'Transient 瞬态',
    body: 'Body 主体',
    texture: 'Texture 质感',
    tail: 'Tail 尾音',
  };
  const generatorHints = {
    'impulse-noise': {
      labelZh: '硬点击 / Impulse',
      shape: ['短白噪声', '高频针尖', '快速衰减'],
      listenZh: '听第一下是否清楚但不扎耳；它负责动作边界，不负责主体重量。',
      synthZh: 'Serum/Vital 用 Noise one-shot + very short amp envelope；Phase Plant 用 Noise lane + transient envelope。',
      reaperZh: 'REAPER 放大前 30ms，确认 click 对齐 body，A/B 时不要只因为更大声就保留。',
    },
    'banded-burst': {
      labelZh: '金属尖峰 / Banded Burst',
      shape: ['带通噪声', '双峰金属环', '短 ring gate'],
      listenZh: '听 3k-8k 是否有金属边缘；如果只剩刺耳高频，就降低 brightness 或 texture。',
      synthZh: 'Serum/Vital 用 band-pass noise + FM/warp 小峰；Phase Plant 用 Noise + Resonator/Filter lane。',
      reaperZh: 'REAPER 看 spectrum 是否出现窄峰；导出 transient-only 与 full 做响度匹配 A/B。',
    },
    'gated-noise': {
      labelZh: '电流颗粒 / Gated Noise',
      shape: ['随机门控', '亮噪声火花', '轻软削波'],
      listenZh: '听颗粒是不是像电流在跳，而不是连续嘶声；节奏太密会糊成白噪。',
      synthZh: 'Serum/Vital 用 random LFO 控 noise level/filter；Phase Plant 用 Random modulator 控 texture lane。',
      reaperZh: 'REAPER 导出 texture-only，检查颗粒密度是否服务画面速度，而不是铺满全程。',
    },
    'filtered-noise': {
      labelZh: '空气床 / Filtered Noise',
      shape: ['低通噪声', '缓慢扫频', '柔尾包络'],
      listenZh: '听空气是否只补运动和距离，不应该盖住 transient/body。',
      synthZh: 'Serum/Vital 用 Noise + low-pass sweep；Phase Plant 用 Noise lane 加 envelope follower 或 LFO sweep。',
      reaperZh: 'REAPER 做 high-pass/low-pass 各听一次，确认空气层没有无用低频。',
    },
    'shimmer-tail': {
      labelZh: '微尾音 / Shimmer Tail',
      shape: ['弱音调尾巴', '高频尘粒', '慢衰减'],
      listenZh: '听尾音是否自然退场；它应该让声音有空间余韵，而不是生成第二个主声音。',
      synthZh: 'Serum/Vital 用短 reverb/delay send + filtered noise tail；Phase Plant 放到 FX lane 或单独 tail lane。',
      reaperZh: 'REAPER 导出 tail-only，与 full 对比 tail 是否遮挡 transient。',
    },
  };
  const baseOptions = {
    engineMode: patch.engineMode,
    qualityMode: patch.qualityMode,
    outputMode: patch.outputMode,
  };
  const seen = new Set();
  const items = patch.layers
    .filter((layer) => layer.engine === 'sampleGrain' && layer.sampleAssetId)
    .map((layer) => {
      const generatorType = layer.generator?.type ?? 'spark-grains';
      const key = `${layer.role}:${layer.sampleAssetId}:${generatorType}`;
      if (seen.has(key)) return null;
      seen.add(key);
      const asset = SOUND_LAB_SAMPLE_ASSETS.find((item) => item.id === layer.sampleAssetId);
      const hint = generatorHints[generatorType] ?? {
        labelZh: '颗粒声源 / Spark Grains',
        shape: ['颗粒门控', '粉噪细节', '短包络'],
        listenZh: '听颗粒是否贴着主体，不要让 texture 单独抢戏。',
        synthZh: '三款合成器都可以用 Noise + short envelope + filter resonance 复刻。',
        reaperZh: 'REAPER solo texture 后再回 full，确认它只是细节层。',
      };
      const role = layer.role ?? 'texture';
      return {
        id: `${role}-${generatorType}-${layer.sampleAssetId}`,
        sampleAssetId: layer.sampleAssetId,
        labelZh: asset?.labelZh ?? hint.labelZh,
        role,
        roleZh: roleLabels[role] ?? role,
        generatorType,
        generatorLabelZh: hint.labelZh,
        generatorShape: hint.shape,
        listenZh: hint.listenZh,
        synthZh: hint.synthZh,
        reaperZh: hint.reaperZh,
        layerAudition: ['transient', 'body', 'texture', 'tail'].includes(role) ? role : 'texture',
        playOptions: {
          ...baseOptions,
          outputMode: role === 'transient' ? 'raw' : role === 'tail' ? 'studio' : patch.outputMode,
          layerMix: soloLayerMix(role, patch.layerMix ?? {}),
        },
      };
    })
    .filter(Boolean);

  return {
    titleZh: 'Procedural Source Map / 程序化声源地图',
    beginnerZh: '把当前 patch 里的 transient、texture、tail 程序化声源拆开听：先听每一层像什么，再回到 full 判断是否真实。',
    reaperProofZh: 'REAPER: 导出 transient-only / texture-only / tail-only stem，再和 full 响度匹配 A/B，记录哪一层改变了材质。',
    items,
  };
}

function buildLayerAuditionModes(patch, activeMode = 'full') {
  const baseMix = patch.layerMix ?? {};
  const baseOptions = {
    engineMode: patch.engineMode,
    qualityMode: patch.qualityMode,
    outputMode: patch.outputMode,
  };
  const modes = [
    {
      id: 'full',
      label: 'Full',
      titleZh: '完整 Patch',
      roleZh: 'all',
      layerMix: { ...baseMix },
      playOptions: { ...baseOptions, layerMix: { ...baseMix } },
      listenZh: '听完整音效是否已经有起音、主体、材质和尾巴的顺序。',
    },
    {
      id: 'transient',
      label: 'Transient',
      titleZh: '瞬态层',
      roleZh: 'click',
      layerMix: soloLayerMix('transient', baseMix),
      playOptions: { ...baseOptions, outputMode: 'raw', qualityMode: 'draft', layerMix: soloLayerMix('transient', baseMix) },
      listenZh: '只听前 20-80ms：动作是否清楚，是否扎耳或像普通 UI click。',
    },
    {
      id: 'body',
      label: 'Body',
      titleZh: '主体层',
      roleZh: 'weight',
      layerMix: soloLayerMix('body', baseMix),
      playOptions: { ...baseOptions, outputMode: 'comfort', layerMix: soloLayerMix('body', baseMix) },
      listenZh: '只听主体：有没有重量、基频或 modal 锚点，关掉细节后是否仍成立。',
    },
    {
      id: 'texture',
      label: 'Texture',
      titleZh: '质感层',
      roleZh: 'edge',
      layerMix: soloLayerMix('texture', baseMix),
      playOptions: { ...baseOptions, outputMode: 'comfort', layerMix: soloLayerMix('texture', baseMix) },
      listenZh: '只听颗粒、刮擦、空气或电流边缘；它应该补身份，不应变成另一个主声音。',
    },
    {
      id: 'tail',
      label: 'Tail',
      titleZh: '尾音层',
      roleZh: 'space',
      layerMix: soloLayerMix('tail', baseMix),
      playOptions: { ...baseOptions, outputMode: 'studio', qualityMode: 'studio', layerMix: soloLayerMix('tail', baseMix) },
      listenZh: '只听尾巴：空间是否自然退场，tail-only 不应有多余低频或遮挡瞬态。',
    },
  ];

  return {
    titleZh: 'Layer Audition 分层试听',
    activeMode: modes.some((mode) => mode.id === activeMode) ? activeMode : 'full',
    practiceZh: '像做专业音效 stem 一样 solo transient / body / texture / tail，先听每层角色，再回到 full 判断是否真实。',
    reaperZh: 'REAPER: 导出 dry / full / transient-only / body-only / texture-only / tail-only stem，响度匹配后记录哪一层导致问题。',
    modes,
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
  const patchDoctor = buildPatchDoctor(family, patch, macroList);
  const missionBrief = buildMissionBrief(family, patch, patchDoctor, options.workflowStep ?? options.activeWorkflowStep ?? 'source');
  const practiceLoop = buildPracticeLoop(family, patch, macroList);
  const earTriage = buildEarTriage(family, patch, patchDoctor, macroList);
  const workflowStep = options.workflowStep ?? options.activeWorkflowStep ?? 'source';
  const waveformFingerprint = buildWaveformFingerprint(patch);
  const waveformEarDecisionTree = buildWaveformEarDecisionTree(waveformFingerprint, patch, family);
  const listeningCompass = buildListeningCompass(family, patch, macroList, workflowStep);
  const targetMatchCoach = buildTargetMatchCoach(family, patch, patchDoctor, macroList);
  const practiceFocus = buildPracticeFocus(
    family,
    patch,
    patchDoctor,
    practiceLoop,
    earTriage,
    workflowStep,
  );
  const earTrainingChain = buildEarTrainingChain(
    family,
    patch,
    waveformFingerprint,
    listeningCompass,
    earTriage,
    patchDoctor,
    practiceLoop,
    workflowStep,
  );
  const presetDnaOptions = getPresetDnaForFamily(family?.id);
  const patchJson = JSON.stringify({
    familyId: patch.familyId,
    engineMode: patch.engineMode,
    qualityMode: patch.qualityMode,
    presetDnaId: patch.presetDna.id,
    performance: patch.performance,
    performanceFeel: patch.performanceFeel,
    controlSmoothing: patch.controlSmoothing,
    outputMode: patch.outputMode,
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
  const soundQuality = buildSoundQuality(patch);
  const qualityAudition = buildQualityAudition(patch, soundQuality);

  return {
    patch,
    macros: macroList,
    meters: buildMeters(patch),
    soundQuality,
    qualityAudition,
    polishCalibration: buildPolishCalibration(patch),
    waveformFingerprint,
    waveformEarDecisionTree,
    materialResonanceMap: buildMaterialResonanceMap(family, patch),
    practiceLoop,
    listeningCompass,
    patchDoctor,
    earTriage,
    missionBrief,
    practiceFocus,
    beginnerSynthesisPath: buildBeginnerSynthesisPath(family, patch, patchDoctor, workflowStep),
    earTrainingChain,
    targetMatchCoach,
    synthTransferPlan: buildSynthTransferPlan(family, patch, patchDoctor, targetMatchCoach, macroList),
    perceptualSignature: buildPerceptualSignature(family, patch, patchDoctor, macroList),
    soundQualityCoach: buildSoundQualityCoach(patch, patchDoctor),
    translationMonitor: buildTranslationMonitor(patch, patchDoctor),
    parameterCoach: buildParameterCoach(patch, macroList),
    analyzerCoach: buildAnalyzerCoach(patch, macroList),
    performanceFeel: patch.performanceFeel,
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
    outputCompare: buildOutputCompare(patch),
    layerAudition: buildLayerAuditionModes(patch, options.auditionMode ?? options.activeLayerAudition ?? 'full'),
    proceduralSourceMap: buildProceduralSourceMap(patch),
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
