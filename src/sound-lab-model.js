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

  return {
    glue: clamp(0.12 + material * 0.22 + motion * 0.09 + studioBonus, 0.08, 0.62),
    lowTighten: clamp(0.1 + material * 0.16 + (1 - space) * 0.1 + dsp.waveshaper.drive * 0.08, 0.06, 0.45),
    airGuard: clamp(0.12 + brightness * 0.3 + textureMix * 0.1 + variation * 0.07, 0.08, 0.6),
    transientHold: clamp(0.16 + transientMix * 0.3 + material * 0.13, 0.12, 0.72),
    bodyGain: clamp(0.98 - studioBonus * 0.12 - material * 0.05, 0.86, 1),
    comfortBus,
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
    };
  }

  return {
    ...masterPolish,
    enabled: true,
    mode: outputMode,
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
    onsetMs: Number(layerOnsetMs(role, index, motion, space, variation, quality).toFixed(1)),
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
  const outputMode = normalizeOutputMode(options.outputMode);
  const outputOptions = outputMode === 'studio' ? { ...options, qualityMode: 'studio' } : options;
  const presetDna = getPresetDnaById(outputOptions.presetId, family?.id) ?? getPresetDnaForFamily(family?.id)[0] ?? presetDnaLibrary[0];
  const { seed, durationSeconds, dsp: baseDsp } = buildLegacyDsp(family, base, values);
  const engineMode = getEngineMode(outputOptions.engineMode);
  const performance = performanceValues(outputOptions.performance);
  const xyPad = xyPadValues(outputOptions.xyPad);
  const modMatrix = modMatrixValues(outputOptions.modMatrix, values, xyPad);
  const dsp = applyModMatrixToDsp(baseDsp, modMatrix, values, xyPad, performance);
  const layerData = buildLayers({ family, base, dsp, durationSeconds, values, options: outputOptions, presetDna });
  const quality = getQualityMode(layerData.qualityMode);
  const controlSmoothing = buildControlSmoothing(performance, quality);
  const masterPolish = applyOutputModeToMasterPolish(buildMasterPolish(values, dsp, quality, layerData), outputMode);
  const acousticCues = buildAcousticCues(layerData.layers, values, quality);
  const toneGraph = buildToneGraph(family, values, dsp, quality, performance, { ...outputOptions, masterPolish });
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
    durationSeconds,
    macros: values,
    performance,
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
        mix: clamp(dsp.space.mix * quality.fxScale, 0, 0.48),
        decaySeconds: clamp(dsp.space.decaySeconds * quality.fxScale, 0.1, 2.8),
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

function buildPolishCalibration(patch) {
  const polish = patch.globalFx?.masterPolish ?? {};
  const comfortBus = polish.comfortBus ?? {};
  const percent = (value, scale = 1) => Math.round(clamp((value ?? 0) * scale, 0, 1) * 100);
  const loudness = clamp(comfortBus.loudnessMatch ?? 1, 0.72, 1.05);
  const headroom = clamp(comfortBus.headroom ?? 0, 0, 0.22);
  const deHarsh = clamp(comfortBus.deHarsh ?? 0, 0, 1);
  const transientHold = clamp(polish.transientHold ?? 0, 0, 1);
  const stereoSafety = clamp((comfortBus.monoAnchor ?? 0) * 0.62 + (comfortBus.widthTrim ?? 0) * 0.88, 0, 1);
  const tailDuck = clamp(comfortBus.tailDuck ?? 0, 0, 1);

  return {
    mode: polish.mode ?? patch.outputMode ?? 'comfort',
    summaryZh: '把响度、刺耳边缘、瞬态、声像和尾巴拆开检查，避免只因为更大声就误以为音质更好。',
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
        id: 'tail',
        labelZh: '尾巴避让',
        value: percent(tailDuck, 2.8),
        listenZh: '空间尾巴不应盖住起音，尾音应在瞬态之后自然浮出来。',
        actionZh: '给 reverb/delay 做 predelay 或 duck；导出 dry / full / tail-only 三版做对照。',
      },
    ],
    meters: [
      { id: 'headroom', labelZh: 'Headroom', value: percent(headroom, 7.2), detailZh: `${formatQualityNumber(headroom * 100)}% safety` },
      { id: 'match', labelZh: 'Match', value: Math.round(loudness * 100), detailZh: `${formatQualityNumber(loudness)}x` },
      { id: 'mono', labelZh: 'Mono', value: percent(comfortBus.monoAnchor ?? 0, 3.2), detailZh: 'body anchor' },
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
    listeningSteps: [
      '先听纯音锚点：有没有稳定 pitch 或钟感主体。',
      '再听亮边：滤波扫低后最先消失的通常是 saw、comb 或高频噪声。',
      '检查空心感：方波/脉冲会带来硬边和 hollow 质感。',
      '最后 solo 噪声/瞬态：click、air、grain 不属于四个基础周期波形，要单独判断。',
    ],
  };
}

function buildMaterialResonanceMap(family, patch) {
  const modalLayer = patch.layers.find((layer) => layer.engine === 'modalResonator') ?? {};
  const resonators = Array.isArray(modalLayer.resonators) && modalLayer.resonators.length
    ? modalLayer.resonators
    : patch.dsp.resonators;
  const baseFrequency = modalLayer.baseFrequency ?? patch.dsp.oscillator?.baseFrequency ?? 180;
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

  return {
    titleZh: 'Material Resonance 材质共振地图',
    familyNameZh: familyName,
    beginnerZh: `${familyName} 的金属/玻璃感不是来自一个波形，而是多个不等距共振峰一起衰减：Material ${material} 控制峰的硬度，Brightness ${brightness} 决定这些峰露出来多少。`,
    peaks,
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
  const presetDnaOptions = getPresetDnaForFamily(family?.id);
  const patchJson = JSON.stringify({
    familyId: patch.familyId,
    engineMode: patch.engineMode,
    qualityMode: patch.qualityMode,
    presetDnaId: patch.presetDna.id,
    performance: patch.performance,
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

  return {
    patch,
    macros: macroList,
    meters: buildMeters(patch),
    soundQuality: buildSoundQuality(patch),
    polishCalibration: buildPolishCalibration(patch),
    waveformFingerprint: buildWaveformFingerprint(patch),
    materialResonanceMap: buildMaterialResonanceMap(family, patch),
    practiceLoop: buildPracticeLoop(family, patch, macroList),
    listeningCompass: buildListeningCompass(family, patch, macroList, options.workflowStep ?? options.activeWorkflowStep ?? 'source'),
    patchDoctor,
    missionBrief,
    targetMatchCoach: buildTargetMatchCoach(family, patch, patchDoctor, macroList),
    perceptualSignature: buildPerceptualSignature(family, patch, patchDoctor, macroList),
    soundQualityCoach: buildSoundQualityCoach(patch, patchDoctor),
    parameterCoach: buildParameterCoach(patch, macroList),
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
