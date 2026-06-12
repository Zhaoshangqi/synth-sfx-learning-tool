const PRESETSHARE_TERMS_URL = 'https://presetshare.com/terms-of-use';
const PRESETSHARE_VITAL_URL = 'https://presetshare.com/presets?instrument=2';
const PRESETSHARE_SERUM_URL = 'https://presetshare.com/presets?instrument=1';
const PRESETSHARE_PHASE_PLANT_URL = 'https://presetshare.com/presets?instrument=31';
const VITAL_DOC_URL = 'https://vital.audio/';
const PHASE_PLANT_DOC_URL = 'https://kilohearts.com/docs/phase_plant';

const requiredFamilies = new Set(['metal-impact', 'glass-ping', 'electric-crackle', 'air-whoosh', 'servo-tick', 'energy-charge']);
const requiredSynths = ['Serum', 'Phase Plant', 'Vital'];

function source(kind, label, url, extractionZh) {
  return {
    name: label,
    url,
    license: {
      kind,
      label: kind === 'public-domain' ? 'PresetShare public domain terms' : kind,
      noteZh: kind === 'public-domain'
        ? 'PresetShare 条款说明上传作品视为 public domain；网页只记录参数观察，不复制预设文件。'
        : '用于参数结构和合成方法参考，不打包第三方文件。',
    },
    extractionZh,
  };
}

function mapping(focus) {
  return {
    serum: [
      `OSC A/B 设为 ${focus.osc}，先用包络控制音量，不直接堆响度。`,
      `Filter/FX 只保留能解释 ${focus.role} 的部分，A/B 干湿声确认贡献。`,
    ],
    phasePlant: [
      `用 Generator 分层：Transient / Body / Texture / Tail，每层单独包络。`,
      `用 Modulator 控制 ${focus.mod}，最后进轻限制器防止网页/REAPER 过载。`,
    ],
    vital: [
      `参考 Vital 预设结构中的 osc_1/env_1/filter/effects 字段，把 ${focus.osc} 映射到网页层。`,
      `Macro 只控制亮度、运动、材质、空间和变体，便于和 Serum/Phase Plant 对照。`,
    ],
  };
}

function layer(role, engine, gain, extra = {}) {
  return { role, engine, gain, ...extra };
}

function makeEntry(config) {
  const synths = config.synths ?? requiredSynths;
  const focus = config.focus ?? { osc: 'sine/saw/noise', role: config.familyId, mod: 'filter or FM depth' };
  return {
    synths,
    mappings: mapping(focus),
    parameters: {
      oscillators: config.oscillators,
      filters: config.filters ?? [{ type: 'bandpass', targetHz: 2400, q: 2.4 }],
      envelopes: config.envelopes ?? [{ target: 'amp', attackMs: 2, decayMs: 420, sustain: 0, releaseMs: 120 }],
      modulation: config.modulation ?? [{ source: 'macro motion', target: focus.mod, amount: 0.45 }],
      effects: config.effects ?? [{ type: 'soft-clip', amount: 0.22 }, { type: 'short-space', mix: 0.16 }],
    },
    ...config,
  };
}

export const presetDnaLibrary = [
  makeEntry({
    id: 'vital-metal-modal-hit',
    familyId: 'metal-impact',
    titleZh: 'Vital 金属 Modal Hit DNA',
    titleEn: 'Vital Metal Modal Hit DNA',
    source: source('public-domain', 'PresetShare Vital public preset pool', PRESETSHARE_TERMS_URL, '从 PresetShare 的 public-domain 条款和 Vital 预设结构抽取 osc/env/filter/effects 的可教学模式。'),
    focus: { osc: 'sine + FM sidebands', role: '非谐波金属共振', mod: 'FM depth and resonator decay' },
    oscillators: [{ shape: 'sine', transpose: 0, fmRatio: 1.73, unison: 1 }, { shape: 'noise', level: 0.18 }],
    filters: [{ type: 'bandpass', targetHz: 5200, q: 7.2 }],
    modulation: [{ source: 'env 2', target: 'fm depth', amount: 0.72 }, { source: 'macro material', target: 'resonator q', amount: 0.62 }],
    layerRecipe: [layer('transient', 'sampleGrain', 0.54, { sampleAssetId: 'pd-metal-snap' }), layer('body', 'fmBurst', 0.44), layer('body', 'modalResonator', 0.7), layer('texture', 'combDelay', 0.28), layer('tail', 'modalResonator', 0.22)],
    macroHints: { brightness: 80, material: 88, motion: 34, space: 28, variation: 42 },
  }),
  makeEntry({
    id: 'serum-plucky-blade-metal',
    familyId: 'metal-impact',
    titleZh: 'Serum Plucky Blade 金属短击 DNA',
    titleEn: 'Serum Plucky Blade Metal DNA',
    source: source('observed-tutorial', 'PresetShare Serum public preset listing', PRESETSHARE_SERUM_URL, '从 Serum 免费预设分类和金属/pluck 命名观察出短包络、亮滤波、轻失真、窄空间的参数族。'),
    focus: { osc: 'bright saw/sine hybrid', role: '短刀片式金属点', mod: 'amp envelope and comb feedback' },
    oscillators: [{ shape: 'sawtooth', transpose: 12, fmRatio: 2.01, unison: 2 }, { shape: 'sine', level: 0.35 }],
    filters: [{ type: 'highpass', targetHz: 1800, q: 2.8 }],
    modulation: [{ source: 'env 1', target: 'amp and filter', amount: 0.85 }, { source: 'macro variation', target: 'comb delay time', amount: 0.3 }],
    layerRecipe: [layer('transient', 'sampleGrain', 0.48, { sampleAssetId: 'pd-click-pin' }), layer('body', 'fmBurst', 0.5), layer('texture', 'combDelay', 0.35), layer('tail', 'filteredNoise', 0.12)],
    macroHints: { brightness: 88, material: 76, motion: 22, space: 16, variation: 24 },
  }),
  makeEntry({
    id: 'vital-crystal-sparkle',
    familyId: 'glass-ping',
    titleZh: 'Vital Crystal Sparkle DNA',
    titleEn: 'Vital Crystal Sparkle DNA',
    source: source('official-doc', 'Vital spectral warping and modulation overview', VITAL_DOC_URL, 'Vital 官方页面强调 spectral warping、audio-rate modulation 和可视化调制；这里转成玻璃 partial 与微空间。'),
    focus: { osc: 'sine partial stack', role: '玻璃稀疏 partial', mod: 'spectral spread and high shelf' },
    oscillators: [{ shape: 'sine', transpose: 24, fmRatio: 2.91, unison: 1 }],
    filters: [{ type: 'highpass', targetHz: 3600, q: 4.6 }],
    modulation: [{ source: 'macro variation', target: 'partial detune', amount: 0.26 }, { source: 'env 2', target: 'reverb send', amount: 0.35 }],
    layerRecipe: [layer('transient', 'sampleGrain', 0.32, { sampleAssetId: 'pd-click-pin' }), layer('body', 'modalResonator', 0.66), layer('texture', 'sampleGrain', 0.18, { sampleAssetId: 'pd-glass-dust' }), layer('tail', 'modalResonator', 0.34)],
    macroHints: { brightness: 88, material: 54, motion: 24, space: 56, variation: 32 },
  }),
  makeEntry({
    id: 'phaseplant-glass-partial-bell',
    familyId: 'glass-ping',
    titleZh: 'Phase Plant 玻璃 Bell Partial DNA',
    titleEn: 'Phase Plant Glass Partial Bell DNA',
    source: source('official-doc', 'Kilohearts Phase Plant documentation', PHASE_PLANT_DOC_URL, 'Phase Plant 的 generator/modulator/effects 架构适合把玻璃声拆成 transient、modal body 和 tail 三层。'),
    focus: { osc: 'sine generator stack', role: '清亮玻璃尾音', mod: 'generator pitch and reverb send' },
    oscillators: [{ shape: 'sine', transpose: 19, fmRatio: 2.04, unison: 1 }, { shape: 'sine', transpose: 31, level: 0.35 }],
    filters: [{ type: 'bandpass', targetHz: 7400, q: 5.8 }],
    modulation: [{ source: 'env transient', target: 'body gain', amount: 0.8 }, { source: 'lfo slow', target: 'tail shimmer', amount: 0.18 }],
    layerRecipe: [layer('transient', 'sampleGrain', 0.28, { sampleAssetId: 'pd-glass-dust' }), layer('body', 'modalResonator', 0.72), layer('texture', 'filteredNoise', 0.1), layer('tail', 'modalResonator', 0.42)],
    macroHints: { brightness: 82, material: 46, motion: 18, space: 68, variation: 28 },
  }),
  makeEntry({
    id: 'vital-electric-crackle-grid',
    familyId: 'electric-crackle',
    titleZh: 'Vital Electric Crackle Grid DNA',
    titleEn: 'Vital Electric Crackle Grid DNA',
    source: source('public-domain', 'PresetShare Vital public preset pool', PRESETSHARE_VITAL_URL, '参考 Vital 免费预设中常见的 random/gate/noise/effects 字段组合，转译成随机电流颗粒。'),
    focus: { osc: 'noise + sine spark', role: '离散电流颗粒', mod: 'random gate rate' },
    oscillators: [{ shape: 'noise', level: 0.72 }, { shape: 'sine', transpose: 19, fmRatio: 3.37 }],
    filters: [{ type: 'bandpass', targetHz: 4800, q: 8.4 }],
    modulation: [{ source: 'sample and hold', target: 'gate rate', amount: 0.92 }, { source: 'macro motion', target: 'filter cutoff', amount: 0.58 }],
    layerRecipe: [layer('transient', 'sampleGrain', 0.42, { sampleAssetId: 'pd-electric-grain' }), layer('body', 'filteredNoise', 0.46), layer('texture', 'sampleGrain', 0.5, { sampleAssetId: 'pd-electric-grain' }), layer('tail', 'combDelay', 0.18)],
    macroHints: { brightness: 82, material: 64, motion: 86, space: 20, variation: 88 },
  }),
  makeEntry({
    id: 'serum-digital-spark-noise',
    familyId: 'electric-crackle',
    titleZh: 'Serum Digital Spark Noise DNA',
    titleEn: 'Serum Digital Spark Noise DNA',
    source: source('observed-tutorial', 'Serum free dubstep bass and lead preset pool', PRESETSHARE_SERUM_URL, '从 Serum 免费库里 dubstep/bass/lead 类声音的噪声、滤波、失真和短 gate 倾向抽取电流参数族。'),
    focus: { osc: 'noise into bandpass', role: '数字毛刺火花', mod: 'noise gate and drive' },
    oscillators: [{ shape: 'square', transpose: 0, fmRatio: 4.0 }, { shape: 'noise', level: 0.62 }],
    filters: [{ type: 'bandpass', targetHz: 6100, q: 5.2 }],
    modulation: [{ source: 'lfo random', target: 'gate rate', amount: 0.76 }, { source: 'env', target: 'drive', amount: 0.38 }],
    layerRecipe: [layer('transient', 'sampleGrain', 0.38, { sampleAssetId: 'pd-click-pin' }), layer('body', 'fmBurst', 0.18), layer('texture', 'sampleGrain', 0.56, { sampleAssetId: 'pd-electric-grain' }), layer('tail', 'filteredNoise', 0.12)],
    macroHints: { brightness: 76, material: 58, motion: 74, space: 18, variation: 82 },
  }),
  makeEntry({
    id: 'phaseplant-air-whoosh-sweep',
    familyId: 'air-whoosh',
    titleZh: 'Phase Plant Air Sweep Whoosh DNA',
    titleEn: 'Phase Plant Air Sweep Whoosh DNA',
    source: source('official-doc', 'Kilohearts Phase Plant documentation', PHASE_PLANT_DOC_URL, 'Phase Plant 的多 generator 和 modulator 结构适合做噪声层、滤波移动层和尾音层分离。'),
    focus: { osc: 'filtered noise', role: '方向性空气扫频', mod: 'filter cutoff sweep' },
    oscillators: [{ shape: 'noise', level: 0.9 }],
    filters: [{ type: 'lowpass', targetHz: 2600, q: 1.1 }],
    envelopes: [{ target: 'amp', attackMs: 80, decayMs: 860, sustain: 0.12, releaseMs: 280 }],
    modulation: [{ source: 'curve envelope', target: 'filter cutoff', amount: 0.9 }, { source: 'macro motion', target: 'stereo pan', amount: 0.34 }],
    layerRecipe: [layer('transient', 'filteredNoise', 0.18), layer('body', 'filteredNoise', 0.72, { sampleAssetId: 'pd-air-bed' }), layer('texture', 'sampleGrain', 0.16, { sampleAssetId: 'pd-air-bed' }), layer('tail', 'filteredNoise', 0.22)],
    macroHints: { brightness: 58, material: 24, motion: 78, space: 36, variation: 30 },
  }),
  makeEntry({
    id: 'vital-reverse-inhale-noise',
    familyId: 'air-whoosh',
    titleZh: 'Vital Reverse Inhale Noise DNA',
    titleEn: 'Vital Reverse Inhale Noise DNA',
    source: source('official-doc', 'Vital modulation and spectral overview', VITAL_DOC_URL, 'Vital 官方调制能力映射为反向包络、噪声扫频和尾音控制，用来教学吸入/释放类 whoosh。'),
    focus: { osc: 'noise oscillator', role: '反向吸入空气', mod: 'filter down/up curve' },
    oscillators: [{ shape: 'noise', level: 0.86 }],
    filters: [{ type: 'bandpass', targetHz: 1400, q: 0.9 }],
    envelopes: [{ target: 'amp', attackMs: 280, decayMs: 720, sustain: 0.35, releaseMs: 220 }],
    modulation: [{ source: 'env', target: 'filter cutoff', amount: -0.72 }, { source: 'macro space', target: 'tail width', amount: 0.42 }],
    layerRecipe: [layer('transient', 'filteredNoise', 0.08), layer('body', 'filteredNoise', 0.7, { sampleAssetId: 'pd-air-bed' }), layer('texture', 'combDelay', 0.1), layer('tail', 'filteredNoise', 0.32)],
    macroHints: { brightness: 46, material: 16, motion: 84, space: 42, variation: 34 },
  }),
  makeEntry({
    id: 'phaseplant-servo-stepper',
    familyId: 'servo-tick',
    titleZh: 'Phase Plant Servo Stepper DNA',
    titleEn: 'Phase Plant Servo Stepper DNA',
    source: source('official-doc', 'Kilohearts Phase Plant documentation', PHASE_PLANT_DOC_URL, '用 Phase Plant 的 generator 分组和调制器思路，把机械 servo 拆成 pulse、pitch step 和短反射。'),
    focus: { osc: 'square pulse', role: '阶梯式伺服运动', mod: 'pitch step and bit depth' },
    oscillators: [{ shape: 'square', transpose: 0, fmRatio: 1.62 }, { shape: 'sine', transpose: -12, level: 0.24 }],
    filters: [{ type: 'bandpass', targetHz: 2100, q: 3.4 }],
    modulation: [{ source: 'step lfo', target: 'pitch step', amount: 0.52 }, { source: 'macro material', target: 'bitcrush', amount: 0.24 }],
    layerRecipe: [layer('transient', 'sampleGrain', 0.4, { sampleAssetId: 'pd-click-pin' }), layer('body', 'fmBurst', 0.48), layer('texture', 'combDelay', 0.22), layer('tail', 'filteredNoise', 0.1)],
    macroHints: { brightness: 62, material: 62, motion: 58, space: 14, variation: 24 },
  }),
  makeEntry({
    id: 'serum-ui-mech-click',
    familyId: 'servo-tick',
    titleZh: 'Serum UI Mech Click DNA',
    titleEn: 'Serum UI Mech Click DNA',
    source: source('observed-tutorial', 'PresetShare Serum public preset listing', PRESETSHARE_SERUM_URL, 'Serum 免费库里 pluck/lead 类短包络参数可转成 UI 机械点击：短 amp env、亮波形、少量失真。'),
    focus: { osc: 'short square/saw click', role: 'UI 机械反馈', mod: 'amp decay and filter snap' },
    oscillators: [{ shape: 'square', transpose: 12, fmRatio: 2.18 }, { shape: 'sawtooth', level: 0.22 }],
    filters: [{ type: 'highpass', targetHz: 1200, q: 1.8 }],
    modulation: [{ source: 'env 1', target: 'amp decay', amount: 0.88 }, { source: 'velocity', target: 'click brightness', amount: 0.22 }],
    layerRecipe: [layer('transient', 'sampleGrain', 0.52, { sampleAssetId: 'pd-click-pin' }), layer('body', 'fmBurst', 0.28), layer('texture', 'combDelay', 0.16), layer('tail', 'filteredNoise', 0.06)],
    macroHints: { brightness: 78, material: 44, motion: 36, space: 10, variation: 18 },
  }),
  makeEntry({
    id: 'vital-energy-charge-rise',
    familyId: 'energy-charge',
    titleZh: 'Vital Energy Charge Rise DNA',
    titleEn: 'Vital Energy Charge Rise DNA',
    source: source('official-doc', 'Vital audio-rate modulation and randomization overview', VITAL_DOC_URL, 'Vital 官方特性中的 audio-rate modulation、randomization 和 stereo modulation 映射为充能的亮度上升、闪烁和宽度。'),
    focus: { osc: 'saw + sine harmonic stack', role: '科技能量蓄力', mod: 'filter rise and FM depth' },
    oscillators: [{ shape: 'sawtooth', transpose: 0, unison: 3 }, { shape: 'sine', transpose: 12, fmRatio: 2 }],
    filters: [{ type: 'lowpass', targetHz: 3200, q: 1.6 }],
    envelopes: [{ target: 'amp', attackMs: 120, decayMs: 1200, sustain: 0.72, releaseMs: 360 }],
    modulation: [{ source: 'ramp envelope', target: 'filter cutoff', amount: 0.88 }, { source: 'macro variation', target: 'sparkle rate', amount: 0.44 }],
    layerRecipe: [layer('transient', 'fmBurst', 0.12), layer('body', 'fmBurst', 0.58), layer('texture', 'sampleGrain', 0.28, { sampleAssetId: 'pd-tail-shimmer' }), layer('tail', 'filteredNoise', 0.36)],
    macroHints: { brightness: 76, material: 58, motion: 76, space: 46, variation: 50 },
  }),
  makeEntry({
    id: 'phaseplant-magic-charge-stack',
    familyId: 'energy-charge',
    titleZh: 'Phase Plant Magic Charge Stack DNA',
    titleEn: 'Phase Plant Magic Charge Stack DNA',
    source: source('official-doc', 'Kilohearts Phase Plant documentation', PHASE_PLANT_DOC_URL, '用 Phase Plant 的自由路由思想解释 start/loop/release 三段充能和多层 generator 的关系。'),
    focus: { osc: 'sine/saw layered generators', role: '魔法充能堆叠', mod: 'layer gain and shimmer tail' },
    oscillators: [{ shape: 'sine', transpose: 0, fmRatio: 3.02 }, { shape: 'sawtooth', transpose: 7, unison: 2 }],
    filters: [{ type: 'lowpass', targetHz: 4200, q: 2.2 }],
    envelopes: [{ target: 'amp', attackMs: 160, decayMs: 1400, sustain: 0.66, releaseMs: 520 }],
    modulation: [{ source: 'macro motion', target: 'layer gain crossfade', amount: 0.7 }, { source: 'lfo slow', target: 'stereo shimmer', amount: 0.26 }],
    layerRecipe: [layer('transient', 'fmBurst', 0.1), layer('body', 'modalResonator', 0.44), layer('texture', 'sampleGrain', 0.34, { sampleAssetId: 'pd-tail-shimmer' }), layer('tail', 'filteredNoise', 0.42)],
    macroHints: { brightness: 70, material: 52, motion: 68, space: 64, variation: 58 },
  }),
];

export function getPresetDnaForFamily(familyId) {
  return presetDnaLibrary.filter((entry) => entry.familyId === familyId);
}

export function getPresetDnaById(presetId, familyId) {
  const scoped = presetDnaLibrary.find((entry) => entry.id === presetId && (!familyId || entry.familyId === familyId));
  if (scoped) return scoped;
  return getPresetDnaForFamily(familyId)[0] ?? presetDnaLibrary[0];
}

export function validatePresetDnaLibrary(entries = presetDnaLibrary) {
  const errors = [];
  const ids = new Set();

  for (const entry of entries) {
    if (!entry.id || ids.has(entry.id)) errors.push(`duplicate or missing id: ${entry.id}`);
    ids.add(entry.id);
    if (!requiredFamilies.has(entry.familyId)) errors.push(`${entry.id} unknown family`);
    for (const synth of requiredSynths) {
      if (!entry.mappings?.[synth === 'Phase Plant' ? 'phasePlant' : synth.toLowerCase()]?.length) {
        errors.push(`${entry.id} missing ${synth} mapping`);
      }
    }
    if (!entry.parameters?.oscillators?.length) errors.push(`${entry.id} missing oscillators`);
    if (!entry.layerRecipe?.length || entry.layerRecipe.length < 3) errors.push(`${entry.id} needs layer recipe`);
    if (!entry.source?.url || !entry.source?.license?.kind) errors.push(`${entry.id} missing source/license`);
  }

  return { valid: errors.length === 0, errors };
}

export const presetDnaSourceSummary = {
  titleZh: 'Preset DNA 来源策略',
  summaryZh: '优先使用 PresetShare public-domain 条款、官方文档和可公开查看的参数结构。网页保存的是教学映射和可复现层配方，不复制商业预设或 YouTube 音频。',
  urls: [PRESETSHARE_TERMS_URL, PRESETSHARE_VITAL_URL, PRESETSHARE_SERUM_URL, VITAL_DOC_URL, PHASE_PLANT_DOC_URL],
};
