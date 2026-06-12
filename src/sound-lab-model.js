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

export function getSoundLabFamily(families, familyId) {
  return families.find((family) => family.id === familyId) ?? families[0];
}

export function buildSoundLabPatch(family, macros = SOUND_LAB_MACROS) {
  const values = macroValues(macros);
  const base = FAMILY_BASES[family?.id] ?? FAMILY_BASES['metal-impact'];
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
    id: `${family?.id ?? 'sound'}-${seed}`,
    familyId: family?.id ?? 'metal-impact',
    workletName: family?.workletName ?? 'modal-metal',
    durationSeconds,
    macros: values,
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

export function buildSoundLabViewModel(family, macros = SOUND_LAB_MACROS) {
  const patch = buildSoundLabPatch(family, macros);
  const macroList = SOUND_LAB_MACRO_DEFS.map((macro) => {
    const value = patch.macros[macro.id];
    return {
      ...macro,
      value,
      percent: clamp(value, 0, 100),
    };
  });
  const patchJson = JSON.stringify({
    familyId: patch.familyId,
    macros: patch.macros,
    dsp: patch.dsp,
  }, null, 2);
  const reaperNotes = [
    `REAPER Sound Lab: ${family.titleZh}`,
    `Patch: ${patch.id}`,
    `Macros: ${macroList.map((macro) => `${macro.id}=${macro.value}`).join(', ')}`,
    `Export: ${family.reaperExport.join(' / ')}`,
  ].join('\n');

  return {
    patch,
    macros: macroList,
    meters: buildMeters(patch),
    evidence: family.sourceIds,
    patchJson,
    reaperNotes,
    spectrumBars: Array.from({ length: 18 }, (_, index) => {
      const resonator = patch.dsp.resonators[index % patch.dsp.resonators.length];
      return clamp(14 + resonator.gain * 68 + Math.sin(index * 0.85 + patch.dsp.seed) * 9, 8, 92);
    }),
  };
}
