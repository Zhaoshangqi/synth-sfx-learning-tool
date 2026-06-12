import { buildDefaultFx, buildLabAudioPatch } from './audio-model.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalize = (value, min, max) => {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
};

const numberOr = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const controlById = (material, controlId) => material.controls.find((control) => control.id === controlId);

const valueFrom = (state, id, fallback) => clamp(numberOr(state[id], fallback), 0, 100);

export const buildDefaultMaterialState = (material) =>
  Object.fromEntries(material.controls.map((control) => [control.id, control.defaultValue]));

export function updateMaterialControl(material, state, controlId, value) {
  const control = controlById(material, controlId);
  if (!control) return { ...state };
  const numeric = Number(value);
  const nextValue = Number.isFinite(numeric) ? numeric : control.defaultValue;

  return {
    ...state,
    [controlId]: clamp(nextValue, control.min, control.max),
  };
}

export function applyMaterialPreset(material, presetId) {
  const preset = material.presets.find((item) => item.id === presetId);
  const baseState = buildDefaultMaterialState(material);
  if (!preset) return baseState;

  return material.controls.reduce((nextState, control) => {
    if (!Object.hasOwn(preset.values, control.id)) return nextState;
    return updateMaterialControl(material, nextState, control.id, preset.values[control.id]);
  }, baseState);
}

export function scoreChallengeAnswer(challenge, answerId) {
  const selectedOption = challenge.options.find((option) => option.id === answerId);
  return {
    correct: challenge.answerId === answerId,
    selectedAnswerId: answerId,
    selectedLabelZh: selectedOption?.labelZh ?? '未知答案',
    explanationZh: challenge.explanationZh,
  };
}

export function buildChallengeAudioPatch(challenge, slotId, labs) {
  const slot = challenge.audioSlots.find((item) => item.id === slotId) ?? challenge.audioSlots[0];
  const lab = labs.find((item) => item.id === slot.labId);
  const patch = buildLabAudioPatch(lab, slot.state ?? {}, slot.waveform ?? 'sine');

  return {
    ...patch,
    challengeId: challenge.id,
    slotId: slot.id,
  };
}

function baseMaterialPatch(material, state) {
  const brightness = valueFrom(state, 'brightness', 55);
  const inharmonicity = valueFrom(state, 'inharmonicity', 42);
  const transient = valueFrom(state, 'transient', 64);
  const noise = valueFrom(state, 'noise', 28);
  const tail = valueFrom(state, 'tail', 35);
  const motion = valueFrom(state, 'motion', 38);
  const decayMs = 80 + tail * 12;
  const attackMs = Math.max(1, 34 - transient * 0.32);

  return {
    labId: `material-${material.id}`,
    visualType: 'material',
    waveform: 'sine',
    frequency: 130 + brightness * 4.2,
    gain: 0.12 + transient / 1300,
    durationSeconds: clamp(0.32 + tail / 70, 0.26, 2.6),
    motionHz: motion / 140,
    macroTone: clamp(brightness / 100, 0, 1),
    macroMotion: clamp(motion / 100, 0, 1),
    macroSpace: clamp(tail / 100, 0, 1),
    envelope: {
      attackMs,
      decayMs,
      sustain: clamp((100 - transient) / 360, 0.02, 0.36),
      releaseMs: 70 + tail * 10,
    },
    filter: {
      type: 'lowpass',
      frequency: clamp(520 + brightness * 118, 180, 18000),
      q: 0.6 + inharmonicity / 42,
    },
    fm: {
      enabled: inharmonicity > 10,
      ratio: 1 + inharmonicity / 23,
      depthHz: 12 + inharmonicity * 4.3,
    },
    noise: {
      enabled: noise > 4,
      gain: noise / 600,
      type: brightness > 55 ? 'bright' : 'soft',
    },
    transient: {
      clickGain: 0.012 + transient / 2200,
      brightness: clamp(brightness / 100, 0.12, 0.95),
      bandHz: 1100 + brightness * 72,
    },
    fx: buildDefaultFx(),
  };
}

export function buildMaterialAudioPatch(material, state = {}) {
  const patch = baseMaterialPatch(material, state);
  const brightness = valueFrom(state, 'brightness', 55);
  const inharmonicity = valueFrom(state, 'inharmonicity', 42);
  const transient = valueFrom(state, 'transient', 64);
  const noise = valueFrom(state, 'noise', 28);
  const tail = valueFrom(state, 'tail', 35);
  const motion = valueFrom(state, 'motion', 38);

  if (material.id === 'metal') {
    return {
      ...patch,
      waveform: 'sine',
      frequency: 170 + brightness * 2.4,
      durationSeconds: clamp(0.22 + tail / 70, 0.22, 1.7),
      fm: { enabled: true, ratio: 1.35 + inharmonicity / 18, depthHz: 40 + inharmonicity * 5.2 },
      filter: { type: 'lowpass', frequency: clamp(900 + brightness * 130, 400, 16000), q: 1 + inharmonicity / 30 },
      fx: {
        ...buildDefaultFx(),
        distortion: { drive: 0.18 + transient / 340, mix: 0.18 + inharmonicity / 420 },
        space: { decaySeconds: 0.18 + tail / 120, mix: 0.08 + tail / 620 },
      },
    };
  }

  if (material.id === 'glass') {
    return {
      ...patch,
      waveform: 'triangle',
      frequency: 460 + brightness * 5.2,
      gain: 0.1 + transient / 1800,
      durationSeconds: clamp(0.55 + tail / 55, 0.4, 2.4),
      fm: { enabled: true, ratio: 2.1 + inharmonicity / 25, depthHz: 18 + inharmonicity * 3.2 },
      filter: { type: 'highpass', frequency: clamp(700 + brightness * 46, 500, 9000), q: 0.8 + inharmonicity / 60 },
      fx: {
        ...buildDefaultFx(),
        delay: { timeMs: 72, feedback: 0.18 + tail / 500, mix: 0.08 + tail / 520 },
        space: { decaySeconds: 0.45 + tail / 55, mix: 0.12 + tail / 520 },
      },
    };
  }

  if (material.id === 'electric') {
    return {
      ...patch,
      waveform: 'square',
      frequency: 220 + motion * 6,
      gain: 0.11 + transient / 1500,
      durationSeconds: clamp(0.22 + tail / 120, 0.2, 1.25),
      motionHz: 0.35 + motion / 55,
      fm: { enabled: true, ratio: 1.6 + inharmonicity / 34, depthHz: 20 + brightness * 2.2 },
      filter: { type: 'bandpass', frequency: clamp(1500 + brightness * 112, 900, 14500), q: 1.8 + motion / 30 },
      noise: { enabled: true, gain: 0.05 + noise / 360, type: 'bright' },
      fx: {
        ...buildDefaultFx(),
        distortion: { drive: 0.28 + brightness / 260, mix: 0.22 + noise / 380 },
        delay: { timeMs: 38 + motion * 0.7, feedback: 0.12 + motion / 420, mix: 0.08 + noise / 520 },
        bitcrush: { enabled: true, amount: 0.18 + noise / 210 },
      },
    };
  }

  if (material.id === 'mechanical') {
    return {
      ...patch,
      waveform: 'square',
      frequency: 90 + brightness * 2.8,
      durationSeconds: clamp(0.28 + tail / 90, 0.24, 1.6),
      motionHz: 0.18 + motion / 75,
      fm: { enabled: true, ratio: 1.2 + inharmonicity / 30, depthHz: 16 + inharmonicity * 3.8 },
      filter: { type: 'lowpass', frequency: clamp(700 + brightness * 80, 320, 12000), q: 0.9 + transient / 55 },
      fx: {
        ...buildDefaultFx(),
        distortion: { drive: 0.12 + transient / 430, mix: 0.12 + inharmonicity / 520 },
        delay: { timeMs: 48 + motion * 0.55, feedback: 0.08 + motion / 520, mix: 0.04 + motion / 760 },
      },
    };
  }

  if (material.id === 'energy' || material.id === 'magic') {
    return {
      ...patch,
      waveform: material.id === 'magic' ? 'triangle' : 'sawtooth',
      frequency: 180 + brightness * 5.6,
      durationSeconds: clamp(0.75 + tail / 65, 0.5, 2.5),
      motionHz: 0.2 + motion / 70,
      fm: { enabled: inharmonicity > 22, ratio: 1.1 + inharmonicity / 42, depthHz: 10 + inharmonicity * 2.5 },
      filter: { type: 'lowpass', frequency: clamp(900 + brightness * 145, 500, 18000), q: 0.8 + motion / 70 },
      noise: { enabled: noise > 8, gain: 0.02 + noise / 520, type: 'bright' },
      fx: {
        ...buildDefaultFx(),
        distortion: { drive: material.id === 'energy' ? 0.08 + motion / 320 : 0.04, mix: material.id === 'energy' ? 0.12 + motion / 520 : 0.04 },
        delay: { timeMs: material.id === 'magic' ? 170 : 94, feedback: 0.18 + tail / 500, mix: material.id === 'magic' ? 0.18 + tail / 420 : 0.08 + motion / 520 },
        space: { decaySeconds: material.id === 'magic' ? 0.9 + tail / 42 : 0.45 + tail / 65, mix: material.id === 'magic' ? 0.2 + tail / 420 : 0.1 + tail / 620 },
      },
    };
  }

  if (material.id === 'air-whoosh') {
    return {
      ...patch,
      waveform: 'sawtooth',
      frequency: 130 + motion * 4,
      durationSeconds: clamp(0.45 + tail / 62, 0.38, 2.2),
      motionHz: 0.35 + motion / 60,
      fm: { enabled: false, ratio: 1, depthHz: 0 },
      filter: { type: 'bandpass', frequency: clamp(500 + brightness * 105, 300, 12500), q: 0.7 + inharmonicity / 80 },
      noise: { enabled: true, gain: 0.04 + noise / 330, type: 'soft' },
      fx: {
        ...buildDefaultFx(),
        delay: { timeMs: 76 + motion * 0.8, feedback: 0.08 + tail / 620, mix: 0.06 + tail / 660 },
        space: { decaySeconds: 0.25 + tail / 95, mix: 0.08 + tail / 720 },
      },
    };
  }

  if (material.id === 'machine-hum') {
    return {
      ...patch,
      waveform: 'triangle',
      frequency: 48 + brightness * 1.2,
      durationSeconds: clamp(0.9 + tail / 42, 0.8, 2.8),
      motionHz: motion / 180,
      envelope: {
        attackMs: 70,
        decayMs: 600 + tail * 9,
        sustain: 0.36,
        releaseMs: 220 + tail * 8,
      },
      fm: { enabled: inharmonicity > 20, ratio: 1.01 + inharmonicity / 100, depthHz: 4 + inharmonicity * 0.8 },
      filter: { type: 'lowpass', frequency: clamp(420 + brightness * 52, 180, 7600), q: 0.8 + motion / 100 },
      noise: { enabled: noise > 12, gain: 0.01 + noise / 760, type: 'soft' },
      fx: {
        ...buildDefaultFx(),
        distortion: { drive: 0.04 + motion / 720, mix: 0.05 + inharmonicity / 900 },
        space: { decaySeconds: 0.55 + tail / 70, mix: 0.08 + tail / 720 },
      },
    };
  }

  return patch;
}

export function buildMaterialVisualModel(material, state = {}) {
  const normalizedControls = material.controls.map((control) => {
    const value = state[control.id] ?? control.defaultValue;
    const normalized = normalize(value, control.min, control.max);
    return {
      ...control,
      value,
      normalized,
      explanationZh: normalized <= 0.5 ? control.explainLowZh : control.explainHighZh,
    };
  });

  const axes = normalizedControls.map((control, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / normalizedControls.length);
    const radius = 44 + control.normalized * 96;
    return {
      id: control.id,
      labelZh: control.labelZh,
      value: control.value,
      x: 206 + Math.cos(angle) * radius,
      y: 140 + Math.sin(angle) * radius,
      endX: 206 + Math.cos(angle) * 140,
      endY: 140 + Math.sin(angle) * 140,
    };
  });

  return {
    type: 'material',
    materialId: material.id,
    normalizedControls,
    axes,
    polygonPoints: axes.map((axis) => [axis.x, axis.y]),
    activeExplanations: normalizedControls.map((control) => ({
      controlId: control.id,
      labelZh: control.labelZh,
      value: control.value,
      unit: control.unit,
      explanationZh: control.explanationZh,
    })),
  };
}
