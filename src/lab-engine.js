const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalize = (value, min, max) => {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
};

const controlById = (lab, controlId) => lab.controls.find((control) => control.id === controlId);

const denormalize = (normalized, min, max) => min + clamp(normalized, 0, 1) * (max - min);

const quantizeToStep = (value, step = 1) => Math.round(value / step) * step;

export const buildDefaultLabState = (lab) =>
  Object.fromEntries(lab.controls.map((control) => [control.id, control.defaultValue]));

export const updateLabControl = (lab, state, controlId, value) => {
  const control = controlById(lab, controlId);
  if (!control) return { ...state };

  const numericValue = Number(value);
  const nextValue = Number.isFinite(numericValue) ? numericValue : control.defaultValue;

  return {
    ...state,
    [controlId]: clamp(nextValue, control.min, control.max),
  };
};

export const applyLabPreset = (lab, presetId) => {
  const preset = lab.presets.find((item) => item.id === presetId);
  const baseState = buildDefaultLabState(lab);

  if (!preset) return baseState;

  return lab.controls.reduce((nextState, control) => {
    if (!Object.hasOwn(preset.values, control.id)) return nextState;
    return updateLabControl(lab, nextState, control.id, preset.values[control.id]);
  }, baseState);
};

const valueAtRatio = (control, ratio) =>
  quantizeToStep(denormalize(ratio, control.min, control.max), control.step);

const macroProfiles = {
  adsr: {
    tone: { attack: 0.01, decay: 0.14, sustain: 0.0, release: 0.1 },
    motion: { attack: 0.06, decay: 0.42, sustain: 0.16, release: 0.35 },
    space: { decay: 0.34, sustain: 0.18, release: 0.72 },
  },
  filter: {
    tone: { cutoff: 0.76, resonance: 0.42 },
    motion: { motion: 0.82, cutoff: 0.55 },
    space: { cutoff: 0.48, resonance: 0.28, motion: 0.62 },
  },
  fm: {
    tone: { ratio: 0.62, depth: 0.76 },
    motion: { decay: 0.34, depth: 0.55 },
    space: { decay: 0.72, depth: 0.42 },
  },
  layers: {
    tone: { transient: 0.72, texture: 0.68, body: 0.56 },
    motion: { transient: 0.86, texture: 0.52, tail: 0.36 },
    space: { tail: 0.78, texture: 0.42, body: 0.5 },
  },
  recipe: {
    tone: { brightness: 0.78, randomness: 0.28 },
    motion: { motion: 0.82, randomness: 0.52 },
    space: { space: 0.82, motion: 0.48 },
  },
};

export const applyLabMacro = (lab, state, macroId) => {
  const profile = macroProfiles[lab.visualType]?.[macroId];
  if (!profile) return { ...state };

  return Object.entries(profile).reduce((nextState, [controlId, ratio]) => {
    const control = controlById(lab, controlId);
    if (!control) return nextState;
    return updateLabControl(lab, nextState, controlId, valueAtRatio(control, ratio));
  }, { ...state });
};

const buildCommonModel = (lab, state) => {
  const normalizedControls = lab.controls.map((control) => {
    const value = state[control.id] ?? control.defaultValue;
    const normalized = normalize(value, control.min, control.max);

    return {
      ...control,
      value,
      normalized,
      explanationZh: normalized <= 0.5 ? control.explainLowZh : control.explainHighZh,
    };
  });

  return {
    type: lab.visualType,
    normalizedControls,
    activeExplanations: normalizedControls.map((control) => ({
      controlId: control.id,
      labelZh: control.labelZh,
      value: control.value,
      unit: control.unit,
      explanationZh: control.explanationZh,
    })),
  };
};

const buildAdsrModel = (lab, state) => {
  const common = buildCommonModel(lab, state);
  const attack = normalize(state.attack, 0, 800);
  const decay = normalize(state.decay, 20, 1200);
  const sustain = normalize(state.sustain, 0, 100);
  const release = normalize(state.release, 0, 1600);
  const attackX = 32 + attack * 108;
  const decayX = attackX + 46 + decay * 74;
  const sustainX = decayX + 58;
  const releaseX = sustainX + 42 + release * 84;
  const sustainY = 220 - sustain * 135;

  return {
    ...common,
    pathPoints: [
      [24, 220],
      [attackX, 42],
      [decayX, sustainY],
      [sustainX, sustainY],
      [releaseX, 220],
      [388, 220],
    ],
    labels: [
      { x: attackX / 2, y: 236, text: 'Attack' },
      { x: (attackX + decayX) / 2, y: 236, text: 'Decay' },
      { x: (decayX + sustainX) / 2, y: sustainY - 12, text: 'Sustain' },
      { x: (sustainX + releaseX) / 2, y: 236, text: 'Release' },
    ],
    handles: [
      { id: 'attack', x: attackX, y: 42, labelZh: 'Attack' },
      { id: 'decay-sustain', x: decayX, y: sustainY, labelZh: 'Decay / Sustain' },
      { id: 'release', x: releaseX, y: 220, labelZh: 'Release' },
    ],
  };
};

export const updateAdsrStateFromDrag = (lab, state, handleId, x, y) => {
  if (lab.visualType !== 'adsr') return { ...state };
  const nextState = { ...state };
  const attackControl = controlById(lab, 'attack');
  const decayControl = controlById(lab, 'decay');
  const sustainControl = controlById(lab, 'sustain');
  const releaseControl = controlById(lab, 'release');

  const attackNorm = normalize(state.attack, attackControl.min, attackControl.max);
  const attackX = 32 + attackNorm * 108;
  const decayNorm = normalize(state.decay, decayControl.min, decayControl.max);
  const decayX = attackX + 46 + decayNorm * 74;
  const sustainX = decayX + 58;

  if (handleId === 'attack') {
    const nextNorm = normalize(x, 32, 140);
    return updateLabControl(lab, nextState, 'attack', quantizeToStep(denormalize(nextNorm, attackControl.min, attackControl.max), attackControl.step));
  }

  if (handleId === 'decay-sustain') {
    const nextDecayNorm = normalize(x, attackX + 46, attackX + 120);
    const nextSustainNorm = 1 - normalize(y, 42, 220);
    const withDecay = updateLabControl(
      lab,
      nextState,
      'decay',
      quantizeToStep(denormalize(nextDecayNorm, decayControl.min, decayControl.max), decayControl.step),
    );
    return updateLabControl(
      lab,
      withDecay,
      'sustain',
      quantizeToStep(denormalize(nextSustainNorm, sustainControl.min, sustainControl.max), sustainControl.step),
    );
  }

  if (handleId === 'release') {
    const nextNorm = normalize(x, sustainX + 42, sustainX + 126);
    return updateLabControl(lab, nextState, 'release', quantizeToStep(denormalize(nextNorm, releaseControl.min, releaseControl.max), releaseControl.step));
  }

  return nextState;
};

const buildFilterModel = (lab, state) => {
  const common = buildCommonModel(lab, state);
  const cutoff = normalize(state.cutoff, 80, 12000);
  const resonance = normalize(state.resonance, 0, 100);
  const motion = normalize(state.motion, -100, 100);
  const cutoffX = 42 + cutoff * 316;
  const peakHeight = 18 + resonance * 78;
  const baselineY = 212;
  const peakY = baselineY - peakHeight;

  return {
    ...common,
    cutoffX,
    peakY,
    resonancePeak: peakHeight,
    motionDirection: state.motion < 0 ? 'down' : 'up',
    curvePoints: [
      [24, baselineY - 110],
      [Math.max(44, cutoffX - 96), baselineY - 96],
      [Math.max(52, cutoffX - 28), peakY],
      [cutoffX, baselineY - 36],
      [Math.min(378, cutoffX + 58), baselineY - 14],
      [388, baselineY],
    ],
    sweepStartX: 52 + Math.min(cutoff, motion) * 292,
    sweepEndX: 52 + Math.max(cutoff, motion) * 292,
  };
};

const buildFmModel = (lab, state) => {
  const common = buildCommonModel(lab, state);
  const ratio = state.ratio ?? 1;
  const depth = normalize(state.depth, 0, 100);
  const decay = normalize(state.decay, 20, 2200);
  const centerX = 206;
  const sidebandCount = 7;
  const sidebands = Array.from({ length: sidebandCount }, (_, index) => {
    const offset = index - Math.floor(sidebandCount / 2);
    const distance = Math.abs(offset);
    const inharmonicOffset = (ratio % 1) * 13;
    const x = centerX + offset * (24 + ratio * 2.8) + (offset === 0 ? 0 : inharmonicOffset);
    const height = offset === 0 ? 138 : Math.max(18, depth * 126 - distance * 18 + decay * 16);

    return {
      index,
      x,
      height,
      y: 216 - height,
      width: offset === 0 ? 10 : 7,
      opacity: Math.max(0.26, 1 - distance * 0.13),
      isCarrier: offset === 0,
    };
  });

  return {
    ...common,
    ratio,
    sidebands,
    decayArc: 48 + decay * 214,
    inharmonicity: Math.abs(ratio - Math.round(ratio)),
  };
};

const buildLayersModel = (lab, state) => {
  const common = buildCommonModel(lab, state);
  const layers = common.normalizedControls.map((control, index) => ({
    id: control.id,
    labelZh: control.labelZh,
    value: control.value,
    width: 62 + control.normalized * 252,
    y: 52 + index * 42,
    opacity: 0.42 + control.normalized * 0.58,
  }));

  return {
    ...common,
    layers,
  };
};

const buildRecipeModel = (lab, state) => {
  const common = buildCommonModel(lab, state);
  const axes = common.normalizedControls.map((control, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / common.normalizedControls.length);
    const radius = 34 + control.normalized * 104;

    return {
      id: control.id,
      labelZh: control.labelZh,
      value: control.value,
      x: 206 + Math.cos(angle) * radius,
      y: 138 + Math.sin(angle) * radius,
      endX: 206 + Math.cos(angle) * 138,
      endY: 138 + Math.sin(angle) * 138,
    };
  });

  return {
    ...common,
    axes,
    polygonPoints: axes.map((axis) => [axis.x, axis.y]),
  };
};

export const buildLabVisualModel = (lab, state = buildDefaultLabState(lab)) => {
  if (lab.visualType === 'adsr') return buildAdsrModel(lab, state);
  if (lab.visualType === 'filter') return buildFilterModel(lab, state);
  if (lab.visualType === 'fm') return buildFmModel(lab, state);
  if (lab.visualType === 'layers') return buildLayersModel(lab, state);
  if (lab.visualType === 'recipe') return buildRecipeModel(lab, state);
  return buildCommonModel(lab, state);
};
