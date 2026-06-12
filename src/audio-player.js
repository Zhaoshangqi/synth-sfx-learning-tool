import { buildLabAudioPatch } from './audio-model.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const rampGain = (gainParam, now, patch) => {
  const attack = Math.max(0.002, patch.envelope.attackMs / 1000);
  const decay = Math.max(0.012, patch.envelope.decayMs / 1000);
  const release = Math.max(0.018, patch.envelope.releaseMs / 1000);
  const peak = patch.gain;
  const sustain = Math.max(0.0001, peak * patch.envelope.sustain);
  const releaseStart = Math.max(now + attack + decay + 0.04, now + patch.durationSeconds - release);
  const stopAt = releaseStart + release;

  gainParam.cancelScheduledValues(now);
  gainParam.setValueAtTime(0.0001, now);
  gainParam.linearRampToValueAtTime(peak, now + attack);
  gainParam.linearRampToValueAtTime(sustain, now + attack + decay);
  gainParam.setValueAtTime(sustain, releaseStart);
  gainParam.exponentialRampToValueAtTime(0.0001, stopAt);

  return stopAt;
};

const rampFilter = (filter, now, patch) => {
  const base = clamp(patch.filter.frequency, 40, 18000);
  filter.type = patch.filter.type;
  filter.frequency.setValueAtTime(base, now);
  filter.Q.setValueAtTime(patch.filter.q, now);

  if (!patch.motionHz) return;

  const start = clamp(base * (patch.motionHz > 0 ? 0.35 : 1.45), 40, 18000);
  const end = clamp(base * (patch.motionHz > 0 ? 1.65 : 0.45), 40, 18000);
  filter.frequency.setValueAtTime(start, now);
  filter.frequency.linearRampToValueAtTime(end, now + patch.durationSeconds * 0.72);
};

const createNoiseBuffer = (context, durationSeconds) => {
  const length = Math.max(1, Math.floor(context.sampleRate * durationSeconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  return buffer;
};

const createDistortionCurve = (drive = 0) => {
  const amount = Math.max(0, drive) * 120;
  const samples = 512;
  const curve = new Float32Array(samples);
  for (let index = 0; index < samples; index += 1) {
    const x = (index * 2) / samples - 1;
    curve[index] = ((3 + amount) * x * 20 * Math.PI / 180) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
};

const createSpaceBuffer = (context, decaySeconds = 0.3) => {
  const length = Math.max(1, Math.floor(context.sampleRate * clamp(decaySeconds, 0.05, 3.2)));
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      const t = index / length;
      data[index] = (Math.random() * 2 - 1) * ((1 - t) ** 2.2) * (channel === 0 ? 1 : 0.92);
    }
  }
  return buffer;
};

const connectPatchEffects = (context, input, master, patch, nodes) => {
  const fx = patch.fx ?? {};
  const dry = context.createGain();
  dry.gain.value = 1;
  input.connect(dry);
  dry.connect(master);
  nodes.push(dry);

  let effectInput = input;
  if (fx.distortion?.drive > 0 && fx.distortion.mix > 0) {
    const shaper = context.createWaveShaper();
    const driveGain = context.createGain();
    const wet = context.createGain();
    shaper.curve = createDistortionCurve(fx.distortion.drive);
    shaper.oversample = '2x';
    driveGain.gain.value = 1 + fx.distortion.drive * 2.4;
    wet.gain.value = clamp(fx.distortion.mix, 0, 0.8);
    effectInput.connect(driveGain);
    driveGain.connect(shaper);
    shaper.connect(wet);
    wet.connect(master);
    nodes.push(shaper, driveGain, wet);
    effectInput = shaper;
  }

  if (fx.bitcrush?.enabled && fx.bitcrush.amount > 0) {
    const crusher = context.createWaveShaper();
    const wet = context.createGain();
    const steps = Math.max(4, Math.floor(42 - clamp(fx.bitcrush.amount, 0, 1) * 34));
    const curve = new Float32Array(512);
    for (let index = 0; index < curve.length; index += 1) {
      const x = (index * 2) / curve.length - 1;
      curve[index] = Math.round(x * steps) / steps;
    }
    crusher.curve = curve;
    wet.gain.value = clamp(fx.bitcrush.amount, 0, 0.45);
    effectInput.connect(crusher);
    crusher.connect(wet);
    wet.connect(master);
    nodes.push(crusher, wet);
    effectInput = crusher;
  }

  if (fx.delay?.mix > 0) {
    const delay = context.createDelay(1.2);
    const feedback = context.createGain();
    const wet = context.createGain();
    delay.delayTime.value = clamp(fx.delay.timeMs / 1000, 0.02, 0.9);
    feedback.gain.value = clamp(fx.delay.feedback, 0, 0.72);
    wet.gain.value = clamp(fx.delay.mix, 0, 0.55);
    effectInput.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(master);
    nodes.push(delay, feedback, wet);
  }

  if (fx.space?.mix > 0) {
    const convolver = context.createConvolver();
    const wet = context.createGain();
    convolver.buffer = createSpaceBuffer(context, fx.space.decaySeconds);
    wet.gain.value = clamp(fx.space.mix, 0, 0.52);
    effectInput.connect(convolver);
    convolver.connect(wet);
    wet.connect(master);
    nodes.push(convolver, wet);
  }
};

const scheduleTransientClick = (context, master, patch, now, stopAt, nodes) => {
  if (!patch.transient?.clickGain) return;

  const brightness = clamp(patch.transient.brightness ?? 0.5, 0, 1);
  const duration = clamp(0.018 + brightness * 0.034, 0.016, 0.065);
  const clickSource = context.createBufferSource();
  const clickFilter = context.createBiquadFilter();
  const clickAmp = context.createGain();
  clickSource.buffer = createNoiseBuffer(context, duration);
  clickFilter.type = 'bandpass';
  clickFilter.frequency.setValueAtTime(clamp(patch.transient.bandHz ?? 2200, 400, 12000), now);
  clickFilter.Q.setValueAtTime(0.9 + brightness * 2.4, now);
  clickAmp.gain.cancelScheduledValues(now);
  clickAmp.gain.setValueAtTime(0.0001, now);
  clickAmp.gain.linearRampToValueAtTime(clamp(patch.transient.clickGain, 0, 0.09), now + 0.003);
  clickAmp.gain.exponentialRampToValueAtTime(0.0001, Math.min(stopAt, now + duration));
  clickSource.connect(clickFilter);
  clickFilter.connect(clickAmp);
  clickAmp.connect(master);
  clickSource.start(now);
  clickSource.stop(now + duration + 0.018);
  nodes.push(clickSource, clickFilter, clickAmp);
};

export class LabAudioPlayer {
  constructor() {
    this.context = null;
    this.master = null;
    this.compressor = null;
    this.analyser = null;
    this.timer = null;
    this.oneShotTimer = null;
    this.raf = null;
    this.activeNodes = new Set();
    this.current = null;
    this.onLevel = null;
    this.playing = false;
  }

  async ensureContext() {
    if (!this.context) {
      const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContextClass) throw new Error('This browser does not support WebAudio.');

      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.compressor = this.context.createDynamicsCompressor();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256;
      this.master.gain.value = 0.72;
      this.compressor.threshold.value = -18;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 2.6;
      this.compressor.attack.value = 0.004;
      this.compressor.release.value = 0.12;
      this.master.connect(this.compressor);
      this.compressor.connect(this.analyser);
      this.analyser.connect(this.context.destination);
    }

    if (this.context.state === 'suspended') await this.context.resume();
  }

  async start(lab, state, waveform, { onLevel } = {}) {
    await this.ensureContext();
    this.current = { lab, state, waveform };
    this.onLevel = onLevel;
    this.playing = true;
    this.scheduleNote();
    this.timer = globalThis.setInterval(() => this.scheduleNote(), this.getIntervalMs());
    this.startMeter();
  }

  async playPatch(patch, { onLevel } = {}) {
    await this.ensureContext();
    this.stop();
    this.playing = true;
    this.current = null;
    this.onLevel = onLevel;
    this.schedulePatch(patch);
    this.startMeter();
    this.oneShotTimer = globalThis.setTimeout(() => this.stop(), clamp(patch.durationSeconds * 1000 + 420, 420, 3600));
  }

  update(lab, state, waveform) {
    this.current = { lab, state, waveform };
    if (!this.playing) return;

    globalThis.clearInterval(this.timer);
    this.scheduleNote();
    this.timer = globalThis.setInterval(() => this.scheduleNote(), this.getIntervalMs());
  }

  getIntervalMs() {
    if (!this.current) return 700;
    const patch = buildLabAudioPatch(this.current.lab, this.current.state, this.current.waveform);
    return clamp(patch.durationSeconds * 780, 360, 1500);
  }

  scheduleNote() {
    if (!this.context || !this.master || !this.current || !this.playing) return;

    const patch = buildLabAudioPatch(this.current.lab, this.current.state, this.current.waveform);
    this.schedulePatch(patch);
  }

  schedulePatch(patch) {
    if (!this.context || !this.master || !patch || !this.playing) return;

    const now = this.context.currentTime + 0.01;
    const carrier = this.context.createOscillator();
    const amp = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    const nodes = [carrier, amp, filter];

    carrier.type = patch.waveform;
    carrier.frequency.setValueAtTime(patch.frequency, now);
    rampFilter(filter, now, patch);
    const stopAt = rampGain(amp.gain, now, patch);

    carrier.connect(filter);
    filter.connect(amp);
    connectPatchEffects(this.context, amp, this.master, patch, nodes);

    if (patch.fm.enabled) {
      const modulator = this.context.createOscillator();
      const modGain = this.context.createGain();
      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(patch.frequency * patch.fm.ratio, now);
      modGain.gain.setValueAtTime(patch.fm.depthHz, now);
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      modulator.start(now);
      modulator.stop(stopAt + 0.04);
      nodes.push(modulator, modGain);
    }

    if (patch.noise?.enabled && patch.noise.gain > 0) {
      const noiseSource = this.context.createBufferSource();
      const noiseFilter = this.context.createBiquadFilter();
      const noiseAmp = this.context.createGain();
      noiseSource.buffer = createNoiseBuffer(this.context, patch.durationSeconds + 0.08);
      noiseFilter.type = patch.noise.type === 'bright' ? 'highpass' : 'bandpass';
      noiseFilter.frequency.setValueAtTime(patch.noise.type === 'bright' ? 1800 : Math.max(220, patch.filter.frequency * 0.5), now);
      noiseFilter.Q.setValueAtTime(patch.noise.type === 'bright' ? 0.8 : 1.4, now);
      noiseAmp.gain.cancelScheduledValues(now);
      noiseAmp.gain.setValueAtTime(0.0001, now);
      noiseAmp.gain.linearRampToValueAtTime(patch.noise.gain, now + Math.max(0.002, patch.envelope.attackMs / 1000));
      noiseAmp.gain.exponentialRampToValueAtTime(0.0001, stopAt);
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseAmp);
      noiseAmp.connect(this.master);
      noiseSource.start(now);
      noiseSource.stop(stopAt + 0.04);
      nodes.push(noiseSource, noiseFilter, noiseAmp);
    }

    scheduleTransientClick(this.context, this.master, patch, now, stopAt, nodes);

    for (const node of nodes) this.activeNodes.add(node);
    carrier.start(now);
    carrier.stop(stopAt + 0.04);
    carrier.addEventListener('ended', () => {
      for (const node of nodes) {
        this.activeNodes.delete(node);
        try {
          node.disconnect();
        } catch {
          // Node may already be disconnected by stop().
        }
      }
    });
  }

  startMeter() {
    if (!this.analyser || this.raf) return;

    const data = new Uint8Array(this.analyser.fftSize);
    const tick = () => {
      if (!this.playing || !this.analyser) {
        this.raf = null;
        return;
      }

      this.analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const value of data) {
        const centered = (value - 128) / 128;
        sum += centered * centered;
      }
      const rms = Math.sqrt(sum / data.length);
      this.onLevel?.(clamp(rms * 3.2, 0, 1));
      this.raf = globalThis.requestAnimationFrame(tick);
    };

    this.raf = globalThis.requestAnimationFrame(tick);
  }

  stop() {
    this.playing = false;
    globalThis.clearInterval(this.timer);
    globalThis.clearTimeout(this.oneShotTimer);
    this.timer = null;
    this.oneShotTimer = null;
    if (this.raf) globalThis.cancelAnimationFrame(this.raf);
    this.raf = null;
    this.onLevel?.(0);

    for (const node of this.activeNodes) {
      try {
        if (typeof node.stop === 'function') node.stop();
      } catch {
        // Already stopped.
      }
      try {
        node.disconnect();
      } catch {
        // Already disconnected.
      }
    }
    this.activeNodes.clear();
  }
}

export const createLabAudioPlayer = () => new LabAudioPlayer();
