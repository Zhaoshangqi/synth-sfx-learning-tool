const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));

class SoundLabProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.patch = null;
    this.frame = 0;
    this.seed = 1;
    this.layerStates = [];
    this.spaceState = this.createSpaceState();
    this.polishLeft = this.createPolishState();
    this.polishRight = this.createPolishState();
    this.outputStageLeft = this.createOutputStageState();
    this.outputStageRight = this.createOutputStageState();
    this.outputDcLeft = { x: 0, y: 0 };
    this.outputDcRight = { x: 0, y: 0 };
    this.globalSmooth = this.createGlobalSmoothState();
    this.port.onmessage = (event) => {
      if (event.data?.type === 'sound-lab:play') {
        this.loadPatch(event.data.payload, true);
      }
      if (event.data?.type === 'sound-lab:update') {
        this.loadPatch(event.data.payload, false);
      }
    };
  }

  loadPatch(payload, reset) {
    const previousLayers = this.patch?.layers || [];
    const previousVoiceSignature = previousLayers.map((layer) => layer.unison?.voices ?? 1).join('|');
    this.patch = payload;
    this.seed = Math.max(1, Math.floor(this.patch.seed || 1));

    if (reset) {
      this.frame = 0;
      this.layerStates = (this.patch.layers || []).map((layer) => this.createLayerState(layer));
      this.spaceState = this.createSpaceState();
      this.polishLeft = this.createPolishState();
      this.polishRight = this.createPolishState();
      this.outputStageLeft = this.createOutputStageState();
      this.outputStageRight = this.createOutputStageState();
      this.outputDcLeft = { x: 0, y: 0 };
      this.outputDcRight = { x: 0, y: 0 };
      this.globalSmooth = this.createGlobalSmoothState();
      return;
    }

    const layers = this.patch.layers || [];
    const nextVoiceSignature = layers.map((layer) => layer.unison?.voices ?? 1).join('|');
    if (layers.length !== previousLayers.length || nextVoiceSignature !== previousVoiceSignature) {
      this.layerStates = layers.map((layer) => this.createLayerState(layer));
    }
  }

  createSpaceState() {
    const length = Math.max(32, Math.floor(sampleRate * 0.037));
    return {
      left: new Float32Array(length),
      right: new Float32Array(Math.max(32, Math.floor(sampleRate * 0.043))),
      indexLeft: 0,
      indexRight: 0,
    };
  }

  createPolishState() {
    return {
      low: 0,
      warm: 0,
      harsh: 0,
      edge: 0,
      prev: 0,
    };
  }

  createOutputStageState() {
    return {
      pre: 0,
      de: 0,
      slew: 0,
    };
  }

  createGlobalSmoothState() {
    return {};
  }

  createLayerSmoothState(layer) {
    const osc = layer.oscillator || {};
    const filter = layer.filter || {};
    const noise = layer.noise || {};
    return {
      gain: clamp(layer.gain ?? 0, 0, 2),
      pan: clamp(layer.pan || 0, -1, 1),
      bandHz: clamp(layer.bandHz || layer.generator?.bandHz || 4800, 120, 15000),
      density: clamp(layer.density || 18, 1, 120),
      oscillatorFrequency: clamp(osc.frequency || 220, 20, 6000),
      fmRatio: clamp(osc.fmRatio || 1.7, 0.25, 12),
      fmDepth: clamp(osc.fmDepth || 0, 0, 2000),
      baseFrequency: clamp(layer.baseFrequency || 180, 20, 2000),
      filterFrequency: clamp(filter.frequency || 2600, 80, 16000),
      noiseGain: clamp(noise.gain || 0.5, 0, 1),
      sourceFrequency: clamp(layer.sourceFrequency || 800, 30, 8000),
      feedback: clamp(layer.feedback || 0.35, 0, 0.9),
      damping: clamp(layer.damping || 0.6, 0.05, 0.96),
    };
  }

  smoothingMs(kind = 'parameter') {
    const smoothing = this.patch?.controlSmoothing || this.patch?.globalFx?.controlSmoothing || {};
    const fallback = kind === 'space' ? 80 : kind === 'gain' ? 24 : 32;
    const value = kind === 'space' ? smoothing.spaceMs : kind === 'gain' ? smoothing.gainMs : smoothing.parameterMs;
    return clamp(value ?? fallback, 2, 600);
  }

  smoothingCoeff(kind = 'parameter') {
    const samples = Math.max(1, sampleRate * this.smoothingMs(kind) / 1000);
    return 1 - Math.exp(-1 / samples);
  }

  smoothValue(scope, key, target, kind = 'parameter') {
    const numericTarget = Number.isFinite(Number(target)) ? Number(target) : 0;
    if (!scope) return numericTarget;
    if (!Number.isFinite(scope[key])) {
      scope[key] = numericTarget;
      return numericTarget;
    }
    scope[key] += (numericTarget - scope[key]) * this.smoothingCoeff(kind);
    return scope[key];
  }

  smoothLayerValue(state, key, target, kind = 'parameter') {
    state.smooth = state.smooth || {};
    return this.smoothValue(state.smooth, key, target, kind);
  }

  smoothGlobalValue(key, target, kind = 'parameter') {
    this.globalSmooth = this.globalSmooth || this.createGlobalSmoothState();
    return this.smoothValue(this.globalSmooth, key, target, kind);
  }

  createLayerState(layer) {
    const delayMs = clamp(layer.delayMs || 12, 1, 60);
    const voiceCount = Math.round(clamp(layer.unison?.voices ?? 1, 1, 7));
    const phaseSpread = clamp(layer.unison?.phaseSpread ?? 0.24, 0.02, 0.92);
    return {
      phase: 0,
      modPhase: 0,
      filter: 0,
      filter2: 0,
      filter3: 0,
      pink: 0,
      brown: 0,
      dc: { x: 0, y: 0 },
      sideDc: { x: 0, y: 0 },
      voicePhases: Array.from({ length: voiceCount }, (_, index) => ((index + 1) / (voiceCount + 1) + phaseSpread * index) % 1),
      voiceTri: Array.from({ length: voiceCount }, () => 0),
      combIndex: 0,
      combBuffer: new Float32Array(Math.max(8, Math.floor(sampleRate * delayMs / 1000))),
      smooth: this.createLayerSmoothState(layer),
    };
  }

  random() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967295;
  }

  envelopeFor(layer, t, duration) {
    const envelope = layer.envelope || {};
    const attack = clamp((envelope.attackMs ?? 2) / 1000, 0.0005, 0.5);
    const decay = clamp((envelope.decayMs ?? duration * 500) / 1000, 0.006, duration + 1.5);
    const sustain = clamp(envelope.sustain ?? 0.04, 0, 1);
    const release = clamp((envelope.releaseMs ?? 80) / 1000, 0.01, 1.5);
    const releaseStart = Math.max(attack + decay, duration - release);

    if (t < attack) return t / attack;
    if (t < attack + decay) {
      const progress = (t - attack) / decay;
      return sustain + (1 - sustain) * Math.exp(-progress * 5.2);
    }
    if (t < releaseStart) return sustain;
    return Math.max(0, sustain * (1 - (t - releaseStart) / release)) ** 1.4;
  }

  legacyEnvelope(t, duration) {
    const attack = clamp((this.patch?.transient?.attackMs ?? 4) / 1000, 0.001, 0.08);
    const releaseStart = duration * 0.68;
    if (t < attack) return t / attack;
    if (t > releaseStart) {
      const release = Math.max(0.02, duration - releaseStart);
      return Math.max(0, 1 - (t - releaseStart) / release) ** 1.8;
    }
    return Math.exp(-t * 1.2);
  }

  shapeSample(phase, shape) {
    if (shape === 'square') return phase < 0.5 ? 1 : -1;
    if (shape === 'sawtooth') return 1 - phase * 2;
    if (shape === 'triangle') return 1 - Math.abs(phase * 4 - 2);
    return Math.sin(phase * Math.PI * 2);
  }

  polyBlep(phase, phaseInc) {
    if (phase < phaseInc) {
      const t = phase / phaseInc;
      return t + t - t * t - 1;
    }
    if (phase > 1 - phaseInc) {
      const t = (phase - 1) / phaseInc;
      return t * t + t + t + 1;
    }
    return 0;
  }

  onePole(current, input, coeff) {
    return current + (input - current) * clamp(coeff, 0.0005, 0.98);
  }

  colorNoise(state, color = 'white') {
    const white = this.random() * 2 - 1;
    state.pink = this.onePole(state.pink, white, 0.08);
    state.brown = clamp(this.onePole(state.brown, white * 0.18, 0.018), -1, 1);
    if (color === 'brown') return state.brown * 1.8;
    if (color === 'pink') return state.pink * 2.4;
    if (color === 'bright') return white - state.pink * 0.72;
    return white;
  }

  dcBlock(state, sample) {
    const output = sample - state.x + state.y * 0.995;
    state.x = sample;
    state.y = output;
    return output;
  }

  renderOscillatorShape(state, phase, phaseInc, shape = 'sine', voiceIndex = -1) {
    if (shape === 'sawtooth') return 1 - phase * 2 - this.polyBlep(phase, phaseInc);
    if (shape === 'square') {
      const pulse = phase < 0.5 ? 1 : -1;
      return pulse + this.polyBlep(phase, phaseInc) - this.polyBlep((phase + 0.5) % 1, phaseInc);
    }
    if (shape === 'triangle') {
      const square = phase < 0.5 ? 1 : -1;
      if (voiceIndex >= 0 && state.voiceTri) {
        state.voiceTri[voiceIndex] = this.onePole(state.voiceTri[voiceIndex] ?? 0, square, phaseInc * 4);
        return clamp(state.voiceTri[voiceIndex] * 2.4, -1, 1);
      }
      state.filter3 = this.onePole(state.filter3, square, phaseInc * 4);
      return clamp(state.filter3 * 2.4, -1, 1);
    }
    return Math.sin(phase * Math.PI * 2);
  }

  renderVirtualAnalogOscillator(layer, state, frequency, shape = 'sine') {
    const phaseInc = clamp(frequency / sampleRate, 0.00001, 0.45);
    state.phase = (state.phase + phaseInc) % 1;
    return this.renderOscillatorShape(state, state.phase, phaseInc, shape);
  }

  renderUnisonOscillator(layer, state, frequency, shape = 'sine', t = 0) {
    const unison = layer.unison || {};
    const voices = Math.round(clamp(unison.voices ?? 1, 1, 7));
    if (!state.voicePhases || state.voicePhases.length !== voices) {
      const phaseSpread = clamp(unison.phaseSpread ?? 0.24, 0.02, 0.92);
      state.voicePhases = Array.from({ length: voices }, (_, index) => ((index + 1) / (voices + 1) + phaseSpread * index) % 1);
      state.voiceTri = Array.from({ length: voices }, () => 0);
    }

    if (voices <= 1) {
      return {
        mono: this.renderVirtualAnalogOscillator(layer, state, frequency, shape),
        side: 0,
      };
    }

    const detuneCents = clamp(unison.detuneCents ?? 0, 0, 36);
    const driftDepth = clamp(unison.analogDrift ?? 0, 0, 0.08) * 100;
    const stereoSpread = clamp(layer.stereoSpread ?? 0, 0, 1);
    let mono = 0;
    let side = 0;

    for (let voice = 0; voice < voices; voice += 1) {
      const centered = voices === 1 ? 0 : (voice / (voices - 1)) * 2 - 1;
      const drift = Math.sin(t * Math.PI * 2 * (0.13 + voice * 0.047) + (voice + 1) * 1.73) * driftDepth;
      const detunedFrequency = frequency * Math.pow(2, (centered * detuneCents + drift) / 1200);
      const phaseInc = clamp(detunedFrequency / sampleRate, 0.00001, 0.45);
      state.voicePhases[voice] = (state.voicePhases[voice] + phaseInc) % 1;
      const sample = this.renderOscillatorShape(state, state.voicePhases[voice], phaseInc, shape, voice);
      mono += sample;
      side += sample * centered;
    }

    return {
      mono: mono / voices,
      side: (side / Math.max(1, voices - 1)) * stereoSpread,
    };
  }

  renderAllpassSpace(input, channel = 'left') {
    const state = this.spaceState;
    const buffer = channel === 'left' ? state.left : state.right;
    const indexKey = channel === 'left' ? 'indexLeft' : 'indexRight';
    const index = state[indexKey];
    const delayed = buffer[index] || 0;
    const feedback = channel === 'left' ? 0.42 : 0.37;
    const output = -feedback * input + delayed;
    buffer[index] = input + delayed * feedback;
    state[indexKey] = (index + 1) % buffer.length;
    return output;
  }

  renderSampleGrain(layer, state, t, duration) {
    const env = this.envelopeFor(layer, t, duration);
    const bandHz = clamp(this.smoothLayerValue(state, 'bandHz', layer.bandHz || layer.generator?.bandHz || 4800), 120, 15000);
    const density = clamp(this.smoothLayerValue(state, 'density', layer.density || 18), 1, 120);
    const gain = clamp(this.smoothLayerValue(state, 'gain', layer.gain ?? 0, 'gain'), 0, 2);
    const generatorType = layer.generator?.type || 'spark-grains';
    const gate = Math.sin(t * Math.PI * 2 * density + (this.seed % 13)) > (0.18 + clamp(layer.jitter || 0.2, 0, 1) * 0.52) ? 1 : 0;
    const color = generatorType.includes('air') ? 'brown' : generatorType.includes('metal') || generatorType.includes('electric') ? 'bright' : 'pink';
    const noise = this.colorNoise(state, color) * gate;
    const tone = Math.sin(t * Math.PI * 2 * bandHz) * 0.35 + Math.sin(t * Math.PI * 2 * bandHz * 1.91) * 0.18;
    const shaped = generatorType.includes('shimmer') ? tone * 0.72 + noise * 0.22 : noise * 0.72 + tone;
    return this.dcBlock(state.dc, shaped * env * gain);
  }

  renderFmBurst(layer, state, t, duration) {
    const env = this.envelopeFor(layer, t, duration);
    const osc = layer.oscillator || {};
    const baseFrequency = clamp(this.smoothLayerValue(state, 'oscillatorFrequency', osc.frequency || 220), 20, 6000);
    const frequency = baseFrequency * (1 + clamp(osc.sweep || 0, -2, 2) * t / Math.max(0.05, duration) * 0.18);
    const fmRatio = clamp(this.smoothLayerValue(state, 'fmRatio', osc.fmRatio || 1.7), 0.25, 12);
    const fmDepth = clamp(this.smoothLayerValue(state, 'fmDepth', osc.fmDepth || 0), 0, 2000) / 900;
    const gain = clamp(this.smoothLayerValue(state, 'gain', layer.gain ?? 0, 'gain'), 0, 2);
    state.modPhase = (state.modPhase + clamp((frequency * fmRatio) / sampleRate, 0.00001, 0.45)) % 1;
    const mod = Math.sin(state.modPhase * Math.PI * 2) * fmDepth;
    const carrier = this.renderUnisonOscillator(layer, state, frequency * (1 + mod * 0.018), osc.shape, t);
    return {
      mono: this.dcBlock(state.dc, carrier.mono * env * gain),
      side: this.dcBlock(state.sideDc, carrier.side * env * gain),
    };
  }

  renderModalResonator(layer, state, t, duration) {
    const env = this.envelopeFor(layer, t, duration);
    const baseFrequency = clamp(this.smoothLayerValue(state, 'baseFrequency', layer.baseFrequency || 180), 20, 2000);
    const gain = clamp(this.smoothLayerValue(state, 'gain', layer.gain ?? 0, 'gain'), 0, 2);
    let sum = 0;
    const resonators = layer.resonators || [];
    for (let index = 0; index < resonators.length; index += 1) {
      const resonator = resonators[index];
      const frequency = clamp(baseFrequency * resonator.ratio, 30, 16000);
      const decay = Math.exp(-t / clamp(resonator.decay, 0.025, 4));
      const phaseSkew = index * 0.37;
      sum += Math.sin(t * Math.PI * 2 * frequency + phaseSkew) * resonator.gain * decay;
    }
    return sum * env * gain;
  }

  renderFilteredNoise(layer, state, t, duration) {
    const env = this.envelopeFor(layer, t, duration);
    const noiseColor = layer.filter?.type === 'lowpass' ? 'brown' : layer.filter?.type === 'highpass' ? 'bright' : 'pink';
    const noiseGain = clamp(this.smoothLayerValue(state, 'noiseGain', layer.noise?.gain || 0.5), 0, 1);
    const gain = clamp(this.smoothLayerValue(state, 'gain', layer.gain ?? 0, 'gain'), 0, 2);
    const noise = this.colorNoise(state, noiseColor) * noiseGain;
    const gateRate = clamp(layer.noise?.gateRate || 8, 0.5, 120);
    const gate = this.random() > gateRate / 150 ? 1 : 0.42;
    const filterFrequency = clamp(this.smoothLayerValue(state, 'filterFrequency', layer.filter?.frequency || 2600), 80, 16000);
    const cutoff = clamp(filterFrequency * (1 + (layer.filter?.sweep || 0) * t / Math.max(0.05, duration)), 80, 16000);
    const coeff = clamp(cutoff / sampleRate, 0.002, 0.48);
    state.filter = this.onePole(state.filter, noise, coeff);
    state.filter2 = this.onePole(state.filter2, state.filter, coeff);
    const band = state.filter - state.filter2;
    const type = layer.filter?.type || 'bandpass';
    const filtered = type === 'lowpass' ? state.filter2 : type === 'highpass' ? noise - state.filter2 : band * 3.2;
    return this.dcBlock(state.dc, filtered * gate * env * gain);
  }

  renderCombDelay(layer, state, t, duration) {
    const env = this.envelopeFor(layer, t, duration);
    const frequency = clamp(this.smoothLayerValue(state, 'sourceFrequency', layer.sourceFrequency || 800), 30, 8000);
    const gain = clamp(this.smoothLayerValue(state, 'gain', layer.gain ?? 0, 'gain'), 0, 2);
    const oscillator = this.renderUnisonOscillator(layer, state, frequency, 'sawtooth', t);
    const excite = (oscillator.mono * 0.45 + this.colorNoise(state, 'pink') * 0.18) * env;
    const exciteSide = oscillator.side * 0.45 * env;
    const delayed = state.combBuffer[state.combIndex] || 0;
    const feedback = clamp(this.smoothLayerValue(state, 'feedback', layer.feedback || 0.35), 0, 0.9);
    const damping = clamp(this.smoothLayerValue(state, 'damping', layer.damping || 0.6), 0.05, 0.96);
    const next = (excite + delayed * feedback) * damping;
    state.combBuffer[state.combIndex] = next;
    state.combIndex = (state.combIndex + 1) % state.combBuffer.length;
    return {
      mono: this.dcBlock(state.dc, (delayed + excite * 0.38) * gain),
      side: this.dcBlock(state.sideDc, (exciteSide + delayed * clamp(layer.stereoSpread ?? 0, 0, 1) * 0.08) * gain),
    };
  }

  renderLayer(layer, state, t, duration) {
    if (layer.engine === 'sampleGrain') return this.renderSampleGrain(layer, state, t, duration);
    if (layer.engine === 'fmBurst') return this.renderFmBurst(layer, state, t, duration);
    if (layer.engine === 'modalResonator') return this.renderModalResonator(layer, state, t, duration);
    if (layer.engine === 'combDelay') return this.renderCombDelay(layer, state, t, duration);
    return this.renderFilteredNoise(layer, state, t, duration);
  }

  layerOnsetSeconds(layer) {
    return clamp((layer?.onsetMs ?? 0) / 1000, 0, 0.12);
  }

  renderTimedLayer(layer, state, t, duration) {
    const onset = this.layerOnsetSeconds(layer);
    if (t < onset) return { mono: 0, side: 0 };
    const localT = t - onset;
    const localDuration = Math.max(0.05, duration - onset);
    return this.renderLayer(layer, state, localT, localDuration);
  }

  applyAnalogOutputSaturation(sample, drive, state) {
    if (!state) return sample;
    const preCoeff = 0.18 + drive * 0.06;
    state.pre = this.onePole(state.pre, sample, preCoeff);
    const preEmphasis = sample + (sample - state.pre) * clamp(0.1 + drive * 0.11, 0.08, 0.28);

    const firstAmount = 1.05 + drive * 2.45;
    const firstStage = Math.tanh(preEmphasis * firstAmount) / Math.tanh(firstAmount);
    const maxStep = clamp(0.24 - drive * 0.045, 0.14, 0.26);
    const slewDelta = clamp(firstStage - state.slew, -maxStep, maxStep);
    state.slew += slewDelta;

    state.de = this.onePole(state.de, state.slew, 0.055 + drive * 0.028);
    const deEmphasis = state.slew - (state.slew - state.de) * clamp(0.08 + drive * 0.08, 0.06, 0.2);
    const secondAmount = 1.02 + drive * 1.35;
    return Math.tanh(deEmphasis * secondAmount) / Math.tanh(secondAmount);
  }

  softLimiter(sample, state = null) {
    const globalFx = this.patch?.globalFx || {};
    const drive = clamp(globalFx.dynamics?.drive ?? this.patch?.waveshaper?.drive ?? 0.4, 0, 1.4);
    const ceiling = clamp(globalFx.softLimiter?.ceiling ?? this.patch?.safety?.limiter ?? 0.92, 0.5, 0.98);
    const amount = 1.2 + drive * 4.2;
    const rounded = this.applyAnalogOutputSaturation(sample, drive, state);
    return Math.tanh(rounded * amount) / Math.tanh(amount) * ceiling;
  }

  applyMasterPolish(sample, state) {
    const polish = this.patch?.globalFx?.masterPolish || {};
    if (polish.enabled === false) return clamp(sample * clamp(polish.bodyGain ?? 0.96, 0.72, 1.04), -1.2, 1.2);
    const glue = clamp(polish.glue ?? 0, 0, 1);
    const lowTighten = clamp(polish.lowTighten ?? 0, 0, 1);
    const airGuard = clamp(polish.airGuard ?? 0, 0, 1);
    const transientHold = clamp(polish.transientHold ?? 0.28, 0, 1);
    const bodyGain = clamp(polish.bodyGain ?? 0.94, 0.72, 1.04);
    const comfortBus = polish.comfortBus || {};
    const warmth = clamp(comfortBus.warmth ?? 0, 0, 1);
    const deHarsh = clamp(comfortBus.deHarsh ?? 0, 0, 1);
    const headroom = clamp(comfortBus.headroom ?? 0.055, 0, 0.22);
    const airTame = clamp(comfortBus.airTame ?? 0, 0, 1);

    state.low = this.onePole(state.low, sample, 0.018);
    const tightened = sample - state.low * lowTighten * 0.24;
    const edge = tightened - state.prev;
    state.edge = this.onePole(state.edge, edge, 0.22);
    state.prev = tightened;

    const guardAmount = clamp(Math.abs(state.edge) * airGuard * 2.8, 0, 0.22);
    const guarded = tightened - state.edge * guardAmount;
    state.warm = this.onePole(state.warm, guarded, 0.006 + warmth * 0.018);
    const warmed = guarded + state.warm * warmth * 0.16;
    const previousHarsh = state.harsh;
    state.harsh = this.onePole(state.harsh, warmed, 0.06 + airTame * 0.05);
    const harshBand = warmed - state.harsh;
    const harshMotion = harshBand - previousHarsh * 0.18;
    const deHarshAmount = clamp(Math.abs(harshMotion) * deHarsh * 2.4 + airTame * 0.035, 0, 0.2);
    const comforted = warmed - harshBand * deHarshAmount;
    const drive = 1 + glue * 1.7;
    const glued = Math.tanh(comforted * drive) / Math.tanh(drive);
    const transientRestore = edge * transientHold * 0.045;
    const outputGain = bodyGain * (1 - headroom * 0.34);
    return clamp((glued + transientRestore) * outputGain, -1.2 + headroom, 1.2 - headroom);
  }

  applyStereoComfortBus(leftSample, rightSample, t, duration) {
    const polish = this.patch?.globalFx?.masterPolish || {};
    if (polish.enabled === false) {
      this.stereoBusLeft = leftSample;
      this.stereoBusRight = rightSample;
      return;
    }

    const comfortBus = polish.comfortBus || {};
    const loudnessMatch = clamp(comfortBus.loudnessMatch ?? 1, 0.72, 1.08);
    const monoAnchor = clamp(comfortBus.monoAnchor ?? 0, 0, 1);
    const widthTrim = clamp(comfortBus.widthTrim ?? 0, 0, 1);
    const tailDuck = clamp(comfortBus.tailDuck ?? 0, 0, 1);
    const motionBus = polish.motionBus || {};
    const microDynamics = clamp(motionBus.microDynamics ?? 0, 0, 0.24);
    const transientShield = clamp(motionBus.transientShield ?? 0, 0, 0.45);
    const tailBloom = clamp(motionBus.tailBloom ?? 0, 0, 0.42);
    const wowFlutter = clamp(motionBus.wowFlutter ?? 0, 0, 0.05);
    const mid = (leftSample + rightSample) * 0.5;
    const side = (leftSample - rightSample) * 0.5;
    const transientWindow = Math.exp(-t * 18);
    const tailWindow = clamp(t / Math.max(0.12, duration * 0.7), 0, 1);
    const motionRate = 0.17 + wowFlutter * 9 + tailBloom * 0.18;
    const breath = 1 + Math.sin(t * Math.PI * 2 * motionRate + this.seed * 0.013) * microDynamics * 0.035;
    const midFocus = 1 + transientShield * transientWindow * 0.035 - tailBloom * tailWindow * 0.018;
    const sideScale = clamp(
      1
        - monoAnchor * (0.2 + transientWindow * 0.28)
        - widthTrim * 0.16
        - tailDuck * transientWindow * 0.12
        - transientShield * transientWindow * 0.18
        + tailWindow * (0.04 + tailBloom * 0.22),
      0.42,
      1.16,
    );
    const duck = 1 - tailDuck * transientWindow * 0.08;

    this.stereoBusLeft = (mid * midFocus + side * sideScale) * loudnessMatch * duck * breath;
    this.stereoBusRight = (mid * midFocus - side * sideScale) * loudnessMatch * duck * breath;
  }

  renderLegacy(t, duration) {
    const osc = this.patch.oscillator;
    const resonators = this.patch.resonators || [];
    const baseFrequency = clamp(osc.baseFrequency || 220, 30, 2000);
    const motionRate = clamp(osc.motionRate || 1, 0.1, 14);
    const noiseGain = clamp(this.patch.noise?.gain || 0, 0, 0.9);
    const drive = clamp(this.patch.waveshaper?.drive || 0, 0, 1);
    const env = this.legacyEnvelope(t, duration);
    const motion = 1 + Math.sin(t * Math.PI * 2 * motionRate) * clamp(this.patch.filter?.sweep || 0, -1.8, 1.8) * 0.12;
    const phase = (t * baseFrequency * motion) % 1;
    let sample = this.shapeSample(phase, osc.shape);

    if (osc.fmDepth > 0) {
      const mod = Math.sin(t * Math.PI * 2 * baseFrequency * 1.73);
      sample = Math.sin((phase * Math.PI * 2) + mod * (osc.fmDepth / 720));
    }

    let resonance = 0;
    for (let index = 0; index < resonators.length; index += 1) {
      const resonator = resonators[index];
      const frequency = clamp(baseFrequency * resonator.ratio, 40, 16000);
      const decay = Math.exp(-t / clamp(resonator.decay, 0.04, 2.2));
      resonance += Math.sin(t * Math.PI * 2 * frequency) * resonator.gain * decay;
    }

    const gate = this.random() > clamp(this.patch.noise?.gateRate || 1, 1, 46) / 58 ? 0.35 : 1;
    const noise = (this.random() * 2 - 1) * noiseGain * gate;
    let mixed = (sample * 0.28 + resonance * 0.62 + noise * 0.36) * env;
    mixed = Math.tanh(mixed * (1 + drive * 4.6));
    return mixed * clamp(this.patch.safety?.outputGain || 0.6, 0.1, 0.95);
  }

  process(_, outputs) {
    const output = outputs[0];
    const left = output[0];
    const right = output[1] || output[0];
    if (!this.patch) {
      left.fill(0);
      if (right !== left) right.fill(0);
      return true;
    }

    const duration = clamp(this.patch.durationSeconds || 1, 0.1, 4);
    const layers = this.patch.layers || [];
    const widthTarget = clamp(this.patch.globalFx?.space?.width ?? this.patch.space?.width ?? 0.28, 0, 1);
    const spaceMixTarget = clamp(this.patch.globalFx?.space?.mix ?? this.patch.space?.mix ?? 0, 0, 0.62);
    const spacePreDelay = clamp((this.patch.globalFx?.space?.preDelayMs ?? 0) / 1000, 0, 0.18);
    const diffusionTarget = clamp(this.patch.globalFx?.space?.diffusion ?? 0.5, 0.2, 0.95);

    for (let index = 0; index < left.length; index += 1) {
      const absoluteFrame = this.frame + index;
      const t = absoluteFrame / sampleRate;
      const width = clamp(this.smoothGlobalValue('width', widthTarget, 'space'), 0, 1);
      const spaceMix = clamp(this.smoothGlobalValue('spaceMix', spaceMixTarget, 'space'), 0, 0.62);
      const diffusion = clamp(this.smoothGlobalValue('diffusion', diffusionTarget, 'space'), 0.2, 0.95);
      if (t > duration) {
        left[index] = 0;
        right[index] = 0;
        continue;
      }

      let mixedLeft = 0;
      let mixedRight = 0;
      if (layers.length) {
        for (let layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
          const layer = layers[layerIndex];
          const rendered = this.renderTimedLayer(layer, this.layerStates[layerIndex], t, duration);
          const value = typeof rendered === 'number' ? rendered : rendered.mono;
          const side = typeof rendered === 'number' ? 0 : rendered.side;
          const pan = clamp(this.smoothLayerValue(this.layerStates[layerIndex], 'pan', layer.pan || 0), -1, 1);
          mixedLeft += (value - side) * clamp(1 - pan * 0.58, 0.35, 1.35);
          mixedRight += (value + side) * clamp(1 + pan * 0.58, 0.35, 1.35);
        }
      } else {
        const value = this.renderLegacy(t, duration);
        const side = Math.sin(t * Math.PI * 2 * (0.18 + width)) * width * 0.18;
        mixedLeft = value * (1 - side);
        mixedRight = value * (1 + side);
      }

      const tailMotion = Math.sin(t * Math.PI * 2 * (0.13 + width * 0.24)) * width * 0.05;
      const spaceFade = t < spacePreDelay ? 0 : clamp((t - spacePreDelay) * 24, 0, 1);
      const spacedLeft = this.renderAllpassSpace(mixedLeft * diffusion, 'left');
      const spacedRight = this.renderAllpassSpace(mixedRight * diffusion, 'right');
      const finalLeft = mixedLeft * (1 - spaceMix * 0.32) + spacedLeft * spaceMix * width * spaceFade;
      const finalRight = mixedRight * (1 - spaceMix * 0.32) + spacedRight * spaceMix * width * spaceFade;
      this.applyStereoComfortBus(finalLeft * (1 - tailMotion), finalRight * (1 + tailMotion), t, duration);
      left[index] = this.softLimiter(this.applyMasterPolish(this.dcBlock(this.outputDcLeft, this.stereoBusLeft), this.polishLeft), this.outputStageLeft);
      right[index] = this.softLimiter(this.applyMasterPolish(this.dcBlock(this.outputDcRight, this.stereoBusRight), this.polishRight), this.outputStageRight);
    }

    this.frame += left.length;
    return true;
  }
}

registerProcessor('sound-lab-processor', SoundLabProcessor);
