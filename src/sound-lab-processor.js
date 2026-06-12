const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

class SoundLabProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.patch = null;
    this.frame = 0;
    this.seed = 1;
    this.port.onmessage = (event) => {
      if (event.data?.type !== 'sound-lab:play') return;
      this.patch = event.data.payload;
      this.frame = 0;
      this.seed = Math.max(1, Math.floor(this.patch.seed || 1));
    };
  }

  random() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967295;
  }

  envelope(t, duration) {
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
    return Math.sin(phase * Math.PI * 2);
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
    const osc = this.patch.oscillator;
    const safety = this.patch.safety;
    const space = this.patch.space;
    const resonators = this.patch.resonators || [];
    const baseFrequency = clamp(osc.baseFrequency || 220, 30, 2000);
    const motionRate = clamp(osc.motionRate || 1, 0.1, 14);
    const noiseGain = clamp(this.patch.noise?.gain || 0, 0, 0.9);
    const drive = clamp(this.patch.waveshaper?.drive || 0, 0, 1);

    for (let index = 0; index < left.length; index += 1) {
      const absoluteFrame = this.frame + index;
      const t = absoluteFrame / sampleRate;
      if (t > duration) {
        left[index] = 0;
        right[index] = 0;
        continue;
      }

      const env = this.envelope(t, duration);
      const motion = 1 + Math.sin(t * Math.PI * 2 * motionRate) * clamp(this.patch.filter?.sweep || 0, -1.8, 1.8) * 0.12;
      const phase = (t * baseFrequency * motion) % 1;
      let sample = this.shapeSample(phase, osc.shape);

      if (osc.fmDepth > 0) {
        const mod = Math.sin(t * Math.PI * 2 * baseFrequency * 1.73);
        sample = Math.sin((phase * Math.PI * 2) + mod * (osc.fmDepth / 720));
      }

      let resonance = 0;
      for (let r = 0; r < resonators.length; r += 1) {
        const resonator = resonators[r];
        const freq = clamp(baseFrequency * resonator.ratio, 40, 16000);
        const decay = Math.exp(-t / clamp(resonator.decay, 0.04, 2.2));
        resonance += Math.sin(t * Math.PI * 2 * freq) * resonator.gain * decay;
      }

      const gate = this.random() > clamp(this.patch.noise?.gateRate || 1, 1, 46) / 58 ? 0.35 : 1;
      const noise = (this.random() * 2 - 1) * noiseGain * gate;
      let mixed = (sample * 0.28 + resonance * 0.62 + noise * 0.36) * env;
      mixed = Math.tanh(mixed * (1 + drive * 4.6));
      mixed *= clamp(safety?.outputGain || 0.6, 0.1, 0.95);

      const width = clamp(space?.width || 0.2, 0, 1);
      const side = Math.sin(t * Math.PI * 2 * (0.18 + width)) * width * 0.18;
      left[index] = mixed * (1 - side);
      right[index] = mixed * (1 + side);
    }

    this.frame += left.length;
    return true;
  }
}

registerProcessor('sound-lab-processor', SoundLabProcessor);
