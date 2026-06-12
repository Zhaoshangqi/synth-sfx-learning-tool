const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const numberOr = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const ms = (value, fallback) => Math.max(0.001, numberOr(value, fallback) / 1000);

export const BASIC_WAVEFORMS = [
  {
    id: 'sine',
    labelZh: 'Sine 正弦',
    soundZh: '最干净的单一基频，适合练 FM、sub、bell 的起点。',
  },
  {
    id: 'square',
    labelZh: 'Square 方波',
    soundZh: '奇次谐波明显，适合 8-bit、UI beep、粗硬机械感。',
  },
  {
    id: 'sawtooth',
    labelZh: 'Saw 锯齿',
    soundZh: '谐波最满，适合 whoosh、laser、energy charge 和滤波练习。',
  },
  {
    id: 'triangle',
    labelZh: 'Triangle 三角',
    soundZh: '比 sine 多一点柔和谐波，适合 pluck、soft click 和温和层。',
  },
];

const sampleWaveform = (waveform, phase) => {
  if (waveform === 'square') return phase < 0.5 ? 1 : -1;
  if (waveform === 'sawtooth') return 1 - phase * 2;
  if (waveform === 'triangle') return 1 - Math.abs(phase * 4 - 2);
  return Math.sin(phase * Math.PI * 2);
};

const formatPoint = (value) => Number.parseFloat(value).toFixed(2).replace(/\.?0+$/, '');

export const buildWaveformPreview = (waveform, { width = 132, height = 40, samples = 48, cycles = 2 } = {}) => {
  const safeWaveform = BASIC_WAVEFORMS.some((item) => item.id === waveform) ? waveform : 'sine';
  const points = Array.from({ length: samples }, (_, index) => {
    const x = (index / (samples - 1)) * width;
    const phase = (index / (samples - 1) * cycles) % 1;
    const y = height / 2 - sampleWaveform(safeWaveform, phase) * (height * 0.3);
    return `${formatPoint(x)},${formatPoint(y)}`;
  }).join(' ');

  return {
    waveform: safeWaveform,
    width,
    height,
    points,
  };
};

const buildEnvelope = (state = {}) => ({
  attackMs: numberOr(state.attack, 12),
  decayMs: numberOr(state.decay, 220),
  sustain: clamp(numberOr(state.sustain, 20) / 100, 0, 1),
  releaseMs: numberOr(state.release, 180),
});

export const buildDefaultFx = () => ({
  distortion: {
    drive: 0,
    mix: 0,
  },
  delay: {
    timeMs: 120,
    feedback: 0,
    mix: 0,
  },
  space: {
    decaySeconds: 0.18,
    mix: 0,
  },
  bitcrush: {
    enabled: false,
    amount: 0,
  },
  compressor: {
    thresholdDb: -18,
    ratio: 2.6,
    attackMs: 4,
    releaseMs: 120,
  },
});

export const buildLabAudioPatch = (lab, state = {}, waveform = 'sine') => {
  const safeWaveform = BASIC_WAVEFORMS.some((item) => item.id === waveform) ? waveform : 'sine';
  const basePatch = {
    labId: lab?.id ?? 'unknown-lab',
    visualType: lab?.visualType ?? 'adsr',
    waveform: safeWaveform,
    frequency: 220,
    gain: 0.18,
    durationSeconds: 1.4,
    motionHz: 0,
    macroTone: 0.42,
    macroMotion: 0.24,
    macroSpace: 0.08,
    envelope: buildEnvelope(state),
    filter: {
      type: 'lowpass',
      frequency: 9000,
      q: 0.8,
    },
    fm: {
      enabled: false,
      ratio: 1,
      depthHz: 0,
    },
    noise: {
      enabled: false,
      gain: 0,
      type: 'soft',
    },
    transient: {
      clickGain: 0.012,
      brightness: 0.45,
      bandHz: 1800,
    },
    fx: buildDefaultFx(),
  };

  if (lab?.visualType === 'adsr') {
    return {
      ...basePatch,
      frequency: safeWaveform === 'sine' ? 330 : 220,
      durationSeconds: Math.min(2.8, 0.35 + ms(state.attack, 10) + ms(state.decay, 180) + ms(state.release, 120)),
      macroTone: clamp(1 - numberOr(state.attack, 10) / 800, 0, 1),
      macroMotion: clamp((numberOr(state.decay, 180) + numberOr(state.release, 120)) / 2800, 0, 1),
      macroSpace: clamp(numberOr(state.release, 120) / 1600, 0, 1),
      envelope: {
        attackMs: numberOr(state.attack, 10),
        decayMs: numberOr(state.decay, 180),
        sustain: clamp(numberOr(state.sustain, 0) / 100, 0, 1),
        releaseMs: numberOr(state.release, 120),
      },
      transient: {
        clickGain: clamp(0.032 - numberOr(state.attack, 10) / 32000, 0.004, 0.032),
        brightness: clamp(1 - numberOr(state.attack, 10) / 1000, 0.18, 0.95),
        bandHz: 1600 + clamp(1 - numberOr(state.attack, 10) / 900, 0, 1) * 4200,
      },
    };
  }

  if (lab?.visualType === 'filter') {
    return {
      ...basePatch,
      frequency: 150,
      waveform: safeWaveform === 'sine' ? 'sawtooth' : safeWaveform,
      durationSeconds: 1.8,
      motionHz: clamp(numberOr(state.motion, 0) / 100, -1, 1),
      macroTone: clamp(numberOr(state.cutoff, 2400) / 12000, 0, 1),
      macroMotion: clamp((numberOr(state.motion, 0) + 100) / 200, 0, 1),
      macroSpace: 0.16,
      envelope: {
        attackMs: 12,
        decayMs: 850,
        sustain: 0.18,
        releaseMs: 260,
      },
      filter: {
        type: 'lowpass',
        frequency: clamp(numberOr(state.cutoff, 2400), 80, 12000),
        q: 0.6 + clamp(numberOr(state.resonance, 18), 0, 100) / 14,
      },
      fx: {
        ...buildDefaultFx(),
        distortion: { drive: 0.04 + clamp(numberOr(state.resonance, 18), 0, 100) / 620, mix: 0.05 },
        delay: { timeMs: 88, feedback: 0.08, mix: 0.04 + Math.abs(numberOr(state.motion, 0)) / 1800 },
        space: { decaySeconds: 0.22, mix: 0.045 },
      },
    };
  }

  if (lab?.visualType === 'fm') {
    const ratio = numberOr(state.ratio, 2.7);
    const depth = clamp(numberOr(state.depth, 42), 0, 100);
    const decayMs = numberOr(state.decay, 180);
    return {
      ...basePatch,
      frequency: 180,
      durationSeconds: Math.min(2.4, 0.28 + decayMs / 1000),
      macroTone: clamp((ratio / 6 + depth / 100) * 0.5, 0, 1),
      macroMotion: clamp(decayMs / 2200, 0, 1),
      macroSpace: clamp(decayMs / 2600, 0.08, 0.62),
      envelope: {
        attackMs: 2,
        decayMs,
        sustain: 0,
        releaseMs: Math.max(40, decayMs * 0.28),
      },
      filter: {
        type: 'lowpass',
        frequency: 10500,
        q: 1.1,
      },
      fm: {
        enabled: true,
        ratio,
        depthHz: 10 + depth * 6.4,
      },
      transient: {
        clickGain: 0.026 + depth / 4200,
        brightness: 0.68,
        bandHz: 2600 + depth * 44,
      },
      fx: {
        ...buildDefaultFx(),
        distortion: { drive: 0.12 + depth / 360, mix: 0.12 + depth / 700 },
        space: { decaySeconds: 0.16 + decayMs / 2600, mix: 0.07 + depth / 1600 },
      },
    };
  }

  if (lab?.visualType === 'layers') {
    return {
      ...basePatch,
      frequency: 180 + numberOr(state.body, 50) * 1.6,
      gain: 0.12 + numberOr(state.transient, 50) / 1000,
      durationSeconds: 1.5 + numberOr(state.tail, 25) / 100,
      macroTone: clamp((numberOr(state.texture, 25) + numberOr(state.transient, 50)) / 200, 0, 1),
      macroMotion: clamp(numberOr(state.transient, 50) / 100, 0, 1),
      macroSpace: clamp(numberOr(state.tail, 25) / 100, 0, 1),
      envelope: {
        attackMs: Math.max(1, 32 - numberOr(state.transient, 50) * 0.25),
        decayMs: 260 + numberOr(state.body, 50) * 4,
        sustain: clamp(numberOr(state.texture, 25) / 240, 0.05, 0.48),
        releaseMs: 120 + numberOr(state.tail, 25) * 9,
      },
      filter: {
        type: 'lowpass',
        frequency: 1800 + numberOr(state.texture, 35) * 72,
        q: 0.8,
      },
      noise: {
        enabled: true,
        gain: 0.015 + numberOr(state.texture, 35) / 760,
        type: numberOr(state.texture, 35) > 55 ? 'bright' : 'soft',
      },
      transient: {
        clickGain: 0.015 + numberOr(state.transient, 50) / 2200,
        brightness: clamp(numberOr(state.texture, 35) / 100, 0.18, 0.92),
        bandHz: 1300 + numberOr(state.texture, 35) * 58,
      },
      fx: {
        ...buildDefaultFx(),
        distortion: { drive: 0.05 + numberOr(state.transient, 50) / 700, mix: 0.06 },
        space: { decaySeconds: 0.2 + numberOr(state.tail, 25) / 75, mix: 0.04 + numberOr(state.tail, 25) / 900 },
      },
    };
  }

  if (lab?.visualType === 'recipe') {
    return {
      ...basePatch,
      frequency: 120 + numberOr(state.brightness, 55) * 5.2,
      durationSeconds: 1.2 + numberOr(state.space, 32) / 90,
      motionHz: numberOr(state.motion, 48) / 100,
      macroTone: clamp(numberOr(state.brightness, 55) / 100, 0, 1),
      macroMotion: clamp(numberOr(state.motion, 48) / 100, 0, 1),
      macroSpace: clamp(numberOr(state.space, 32) / 100, 0, 1),
      envelope: {
        attackMs: 8 + Math.max(0, 60 - numberOr(state.motion, 48)) * 2,
        decayMs: 420 + numberOr(state.space, 32) * 8,
        sustain: clamp(numberOr(state.randomness, 24) / 260, 0.05, 0.42),
        releaseMs: 180 + numberOr(state.space, 32) * 8,
      },
      filter: {
        type: 'lowpass',
        frequency: 800 + numberOr(state.brightness, 55) * 95,
        q: 0.7 + numberOr(state.randomness, 24) / 65,
      },
      noise: {
        enabled: numberOr(state.randomness, 24) > 12,
        gain: 0.01 + numberOr(state.randomness, 24) / 1000,
        type: numberOr(state.brightness, 55) > 56 ? 'bright' : 'soft',
      },
      transient: {
        clickGain: 0.012 + numberOr(state.motion, 48) / 2600,
        brightness: clamp(numberOr(state.brightness, 55) / 100, 0.22, 0.95),
        bandHz: 1400 + numberOr(state.brightness, 55) * 68,
      },
      fx: {
        ...buildDefaultFx(),
        distortion: { drive: 0.04 + numberOr(state.brightness, 55) / 900, mix: 0.04 + numberOr(state.randomness, 24) / 1400 },
        delay: { timeMs: 84 + numberOr(state.motion, 48), feedback: 0.08 + numberOr(state.space, 32) / 620, mix: 0.04 + numberOr(state.space, 32) / 900 },
        space: { decaySeconds: 0.24 + numberOr(state.space, 32) / 70, mix: 0.05 + numberOr(state.space, 32) / 760 },
      },
    };
  }

  return basePatch;
};
