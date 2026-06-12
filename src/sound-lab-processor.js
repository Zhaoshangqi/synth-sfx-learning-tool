const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));

class SoundLabProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.patch = null;
    this.frame = 0;
    this.seed = 1;
    this.layerStates = [];
    this.port.onmessage = (event) => {
      if (event.data?.type !== 'sound-lab:play') return;
      this.patch = event.data.payload;
      this.frame = 0;
      this.seed = Math.max(1, Math.floor(this.patch.seed || 1));
      this.layerStates = (this.patch.layers || []).map((layer) => this.createLayerState(layer));
    };
  }

  createLayerState(layer) {
    const delayMs = clamp(layer.delayMs || 12, 1, 60);
    return {
      phase: 0,
      modPhase: 0,
      filter: 0,
      filter2: 0,
      combIndex: 0,
      combBuffer: new Float32Array(Math.max(8, Math.floor(sampleRate * delayMs / 1000))),
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

  renderSampleGrain(layer, state, t, duration) {
    const env = this.envelopeFor(layer, t, duration);
    const bandHz = clamp(layer.bandHz || layer.generator?.bandHz || 4800, 120, 15000);
    const density = clamp(layer.density || 18, 1, 120);
    const gate = Math.sin(t * Math.PI * 2 * density + (this.seed % 13)) > (0.18 + clamp(layer.jitter || 0.2, 0, 1) * 0.52) ? 1 : 0;
    const noise = (this.random() * 2 - 1) * gate;
    const tone = Math.sin(t * Math.PI * 2 * bandHz) * 0.35 + Math.sin(t * Math.PI * 2 * bandHz * 1.91) * 0.18;
    return (noise * 0.72 + tone) * env * layer.gain;
  }

  renderFmBurst(layer, state, t, duration) {
    const env = this.envelopeFor(layer, t, duration);
    const osc = layer.oscillator || {};
    const frequency = clamp(osc.frequency || 220, 20, 6000) * (1 + clamp(osc.sweep || 0, -2, 2) * t / Math.max(0.05, duration) * 0.18);
    const fmRatio = clamp(osc.fmRatio || 1.7, 0.25, 12);
    const fmDepth = clamp(osc.fmDepth || 0, 0, 2000) / 900;
    const mod = Math.sin(t * Math.PI * 2 * frequency * fmRatio) * fmDepth;
    const carrier = Math.sin(t * Math.PI * 2 * frequency + mod);
    return carrier * env * layer.gain;
  }

  renderModalResonator(layer, state, t, duration) {
    const env = this.envelopeFor(layer, t, duration);
    const baseFrequency = clamp(layer.baseFrequency || 180, 20, 2000);
    let sum = 0;
    const resonators = layer.resonators || [];
    for (let index = 0; index < resonators.length; index += 1) {
      const resonator = resonators[index];
      const frequency = clamp(baseFrequency * resonator.ratio, 30, 16000);
      const decay = Math.exp(-t / clamp(resonator.decay, 0.025, 4));
      const phaseSkew = index * 0.37;
      sum += Math.sin(t * Math.PI * 2 * frequency + phaseSkew) * resonator.gain * decay;
    }
    return sum * env * layer.gain;
  }

  renderFilteredNoise(layer, state, t, duration) {
    const env = this.envelopeFor(layer, t, duration);
    const noise = (this.random() * 2 - 1) * clamp(layer.noise?.gain || 0.5, 0, 1);
    const gateRate = clamp(layer.noise?.gateRate || 8, 0.5, 120);
    const gate = this.random() > gateRate / 150 ? 1 : 0.42;
    const cutoff = clamp((layer.filter?.frequency || 2600) * (1 + (layer.filter?.sweep || 0) * t / Math.max(0.05, duration)), 80, 16000);
    const coeff = clamp(cutoff / sampleRate, 0.002, 0.48);
    state.filter += (noise - state.filter) * coeff;
    state.filter2 += (state.filter - state.filter2) * coeff;
    const band = state.filter - state.filter2;
    const type = layer.filter?.type || 'bandpass';
    const filtered = type === 'lowpass' ? state.filter2 : type === 'highpass' ? noise - state.filter2 : band * 3.2;
    return filtered * gate * env * layer.gain;
  }

  renderCombDelay(layer, state, t, duration) {
    const env = this.envelopeFor(layer, t, duration);
    const frequency = clamp(layer.sourceFrequency || 800, 30, 8000);
    const excite = (Math.sin(t * Math.PI * 2 * frequency) * 0.55 + (this.random() * 2 - 1) * 0.25) * env;
    const delayed = state.combBuffer[state.combIndex] || 0;
    const feedback = clamp(layer.feedback || 0.35, 0, 0.9);
    const damping = clamp(layer.damping || 0.6, 0.05, 0.96);
    const next = (excite + delayed * feedback) * damping;
    state.combBuffer[state.combIndex] = next;
    state.combIndex = (state.combIndex + 1) % state.combBuffer.length;
    return (delayed + excite * 0.38) * layer.gain;
  }

  renderLayer(layer, state, t, duration) {
    if (layer.engine === 'sampleGrain') return this.renderSampleGrain(layer, state, t, duration);
    if (layer.engine === 'fmBurst') return this.renderFmBurst(layer, state, t, duration);
    if (layer.engine === 'modalResonator') return this.renderModalResonator(layer, state, t, duration);
    if (layer.engine === 'combDelay') return this.renderCombDelay(layer, state, t, duration);
    return this.renderFilteredNoise(layer, state, t, duration);
  }

  softLimiter(sample) {
    const globalFx = this.patch?.globalFx || {};
    const drive = clamp(globalFx.dynamics?.drive ?? this.patch?.waveshaper?.drive ?? 0.4, 0, 1.4);
    const ceiling = clamp(globalFx.softLimiter?.ceiling ?? this.patch?.safety?.limiter ?? 0.92, 0.5, 0.98);
    const amount = 1.2 + drive * 4.2;
    return Math.tanh(sample * amount) / Math.tanh(amount) * ceiling;
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
    const width = clamp(this.patch.globalFx?.space?.width ?? this.patch.space?.width ?? 0.28, 0, 1);

    for (let index = 0; index < left.length; index += 1) {
      const absoluteFrame = this.frame + index;
      const t = absoluteFrame / sampleRate;
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
          const value = this.renderLayer(layer, this.layerStates[layerIndex], t, duration);
          const pan = clamp(layer.pan || 0, -1, 1);
          mixedLeft += value * clamp(1 - pan * 0.58, 0.35, 1.35);
          mixedRight += value * clamp(1 + pan * 0.58, 0.35, 1.35);
        }
      } else {
        const value = this.renderLegacy(t, duration);
        const side = Math.sin(t * Math.PI * 2 * (0.18 + width)) * width * 0.18;
        mixedLeft = value * (1 - side);
        mixedRight = value * (1 + side);
      }

      const tailMotion = Math.sin(t * Math.PI * 2 * (0.13 + width * 0.24)) * width * 0.05;
      left[index] = this.softLimiter(mixedLeft * (1 - tailMotion));
      right[index] = this.softLimiter(mixedRight * (1 + tailMotion));
    }

    this.frame += left.length;
    return true;
  }
}

registerProcessor('sound-lab-processor', SoundLabProcessor);
