import { buildLabAudioPatch } from './audio-model.js';
import { buildWorkletMessage } from './sound-lab-model.js?v=20260709-dynamic-detail';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const performanceGestureHits = (patch = {}) => {
  const pattern = Array.isArray(patch.performanceFeel?.triggerPattern) && patch.performanceFeel.triggerPattern.length
    ? patch.performanceFeel.triggerPattern
    : [{ id: 'hit-1', delayMs: 0, velocity: patch.performance?.velocity ?? 72, noteOffset: 0 }];
  return pattern.slice(0, 4).map((hit, index) => ({
    id: hit.id ?? `hit-${index + 1}`,
    delayMs: clamp(hit.delayMs ?? index * 28, 0, 1400),
    velocity: clamp(hit.velocity ?? patch.performance?.velocity ?? 72, 1, 127),
    noteOffset: clamp(hit.noteOffset ?? 0, -12, 12),
  }));
};

const performanceGestureTailMs = (patch = {}) => {
  const latestHitMs = Math.max(0, ...performanceGestureHits(patch).map((hit) => hit.delayMs));
  const releaseMs = clamp((patch.envelope?.release ?? patch.toneGraph?.envelope?.release ?? 0.32) * 1000, 60, 1800);
  return clamp(latestHitMs + releaseMs + 260, 520, 2600);
};

const NOTE_OFFSETS = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const transposeNote = (note = 'C3', semitones = 0) => {
  const match = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(String(note).trim());
  if (!match) return note;
  const key = `${match[1].toUpperCase()}${match[2]}`;
  const baseOffset = NOTE_OFFSETS[key];
  if (!Number.isFinite(baseOffset)) return note;
  const midi = (Number(match[3]) + 1) * 12 + baseOffset + Math.round(semitones);
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
};

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

const connectDynamicDetailStage = (context, input, output, globalFx = {}, nodes = []) => {
  const dynamicDetail = globalFx.masterPolish?.dynamicDetail ?? {};
  const transientAir = clamp(dynamicDetail.transientAir ?? 0, 0, 1);
  const bodyGlue = clamp(dynamicDetail.bodyGlue ?? 0, 0, 1);
  const outputSilk = clamp(dynamicDetail.outputSilk ?? 0, 0, 1);
  if (transientAir <= 0 && bodyGlue <= 0 && outputSilk <= 0) {
    input.connect(output);
    return;
  }

  const detailShelf = context.createBiquadFilter();
  const glueCompressor = context.createDynamicsCompressor();
  detailShelf.type = 'highshelf';
  detailShelf.frequency.value = clamp(6200 + transientAir * 2200, 4800, 11000);
  detailShelf.gain.value = clamp(transientAir * 2.8 - outputSilk * 2.2, -3.2, 3.4);
  glueCompressor.threshold.value = -24 + bodyGlue * 7;
  glueCompressor.knee.value = 10 + outputSilk * 18;
  glueCompressor.ratio.value = 1.35 + bodyGlue * 2.6;
  glueCompressor.attack.value = clamp((dynamicDetail.snapWindowMs ?? 18) / 1000, 0.006, 0.05);
  glueCompressor.release.value = clamp(0.09 + outputSilk * 0.18, 0.06, 0.32);
  input.connect(detailShelf);
  detailShelf.connect(glueCompressor);
  glueCompressor.connect(output);
  nodes.push(detailShelf, glueCompressor);
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
    this.meterTimer = null;
    this.activeNodes = new Set();
    this.current = null;
    this.onLevel = null;
    this.onAnalyserFrame = null;
    this.playing = false;
    this.workletReady = false;
    this.workletLoadAttempted = false;
    this.toneReady = false;
    this.toneLoadAttempted = false;
    this.toneNodes = [];
    this.activeSoundLabNode = null;
    this.currentSoundLabPatch = null;
  }

  async ensureContext() {
    if (!this.context) {
      const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContextClass) throw new Error('This browser does not support WebAudio.');

      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.compressor = this.context.createDynamicsCompressor();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.72;
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

    if (this.context.state === 'suspended') {
      await Promise.race([
        this.context.resume().catch(() => undefined),
        new Promise((resolve) => globalThis.setTimeout(resolve, 220)),
      ]);
    }
  }

  async start(lab, state, waveform, { onLevel, onAnalyserFrame } = {}) {
    await this.ensureContext();
    this.current = { lab, state, waveform };
    this.onLevel = onLevel;
    this.onAnalyserFrame = onAnalyserFrame;
    this.playing = true;
    this.scheduleNote();
    this.timer = globalThis.setInterval(() => this.scheduleNote(), this.getIntervalMs());
    this.startMeter();
  }

  async playPatch(patch, { onLevel, onAnalyserFrame } = {}) {
    await this.ensureContext();
    this.stop();
    this.playing = true;
    this.current = null;
    this.onLevel = onLevel;
    this.onAnalyserFrame = onAnalyserFrame;
    this.schedulePatch(patch);
    this.startMeter();
    this.oneShotTimer = globalThis.setTimeout(() => this.stop(), clamp(patch.durationSeconds * 1000 + 420, 420, 3600));
  }

  async ensureSoundLabWorklet() {
    await this.ensureContext();
    if (this.workletReady) return true;
    if (this.workletLoadAttempted) return false;
    this.workletLoadAttempted = true;

    if (!this.context?.audioWorklet || !globalThis.AudioWorkletNode) return false;

    try {
      await this.context.audioWorklet.addModule('./src/sound-lab-processor.js?v=20260709-dynamic-detail');
      this.workletReady = true;
      return true;
    } catch {
      this.workletReady = false;
      return false;
    }
  }

  async loadToneRuntime() {
    await this.ensureContext();
    if (this.toneReady && globalThis.Tone) return globalThis.Tone;
    this.toneLoadAttempted = true;

    let Tone = globalThis.Tone;
    if (!Tone && globalThis.document) {
      try {
        await new Promise((resolve, reject) => {
          const existing = globalThis.document.querySelector('#tone-runtime-script');
          if (existing) {
            existing.remove();
          }
          const script = globalThis.document.createElement('script');
          script.id = 'tone-runtime-script';
          script.src = './vendor/tone/Tone.js';
          script.async = true;
          script.addEventListener('load', resolve, { once: true });
          script.addEventListener('error', reject, { once: true });
          globalThis.document.head.append(script);
        });
        Tone = globalThis.Tone;
      } catch {
        Tone = null;
      }
    }

    if (!Tone) return null;

    try {
      if (Tone.setContext && Tone.Context && this.context) {
        try {
          Tone.setContext(new Tone.Context(this.context));
        } catch {
          // Tone can keep its own context if the shared context bridge is not available.
        }
      }
      await Tone.start?.();
      this.toneReady = true;
      return Tone;
    } catch {
      this.toneReady = false;
      return null;
    }
  }

  disposeToneNodes() {
    for (const node of this.toneNodes) {
      try {
        if (typeof node.triggerRelease === 'function') node.triggerRelease();
      } catch {
        // Tone node may already be released.
      }
      try {
        node.dispose?.();
      } catch {
        // Tone node may already be disposed.
      }
    }
    this.toneNodes = [];
  }

  connectToneFxRack(Tone, source, patch) {
    const fxRack = patch.fxRack ?? patch.toneGraph?.effects ?? [];
    const nodes = [];
    let current = source;

    const addNode = (node) => {
      if (!node) return;
      current.connect(node);
      current = node;
      nodes.push(node);
    };

    for (const effect of fxRack) {
      if (effect.type === 'drive' && Tone.Distortion) {
        addNode(new Tone.Distortion(clamp(effect.amount ?? 0.12, 0, 0.9)));
      }
      if (effect.type === 'filter' && Tone.Filter) {
        addNode(new Tone.Filter(clamp(effect.targetHz ?? patch.dsp?.filter?.frequency ?? 2200, 80, 16000), patch.dsp?.filter?.type ?? 'lowpass'));
      }
      if (effect.type === 'chorus' && Tone.Chorus && (effect.amount ?? 0) > 0.04) {
        const chorus = new Tone.Chorus(1.4 + effect.amount * 3.2, 1.8 + effect.amount * 2.8, clamp(effect.amount, 0, 0.7));
        chorus.start?.();
        addNode(chorus);
      }
      if (effect.type === 'delay' && Tone.FeedbackDelay && (effect.amount ?? 0) > 0.04) {
        addNode(new Tone.FeedbackDelay('8n', clamp(effect.amount, 0, 0.46)));
      }
      if (effect.type === 'reverb' && Tone.Reverb && (effect.amount ?? 0) > 0.03) {
        addNode(new Tone.Reverb({ decay: clamp(effect.decaySeconds ?? 0.8, 0.1, 4), wet: clamp(effect.amount, 0, 0.62) }));
      }
      if (effect.type === 'polish') {
        const dynamicDetail = effect.dynamicDetail ?? patch.globalFx?.masterPolish?.dynamicDetail ?? {};
        const transientAir = clamp(dynamicDetail.transientAir ?? 0, 0, 1);
        const bodyGlue = clamp(dynamicDetail.bodyGlue ?? 0, 0, 1);
        const outputSilk = clamp(dynamicDetail.outputSilk ?? 0, 0, 1);
        if (Tone.Filter && (transientAir > 0 || outputSilk > 0)) {
          const detailShelf = new Tone.Filter(clamp(6200 + transientAir * 2200, 4800, 11000), 'highshelf');
          if (detailShelf.gain) detailShelf.gain.value = clamp(transientAir * 2.8 - outputSilk * 2.2, -3.2, 3.4);
          addNode(detailShelf);
        }
        if (Tone.Compressor && (bodyGlue > 0 || outputSilk > 0)) {
          addNode(new Tone.Compressor({
            threshold: -24 + bodyGlue * 7,
            knee: 10 + outputSilk * 18,
            ratio: 1.35 + bodyGlue * 2.6,
            attack: clamp((dynamicDetail.snapWindowMs ?? 18) / 1000, 0.006, 0.05),
            release: clamp(0.09 + outputSilk * 0.18, 0.06, 0.32),
          }));
        }
      }
    }

    try {
      current.connect(this.master);
    } catch {
      current.toDestination();
    }
    this.toneNodes.push(...nodes);
  }

  createToneInstrument(Tone, patch) {
    const graph = patch.toneGraph ?? {};
    const macros = patch.macros ?? {};
    const envelope = graph.envelope ?? {};
    const familyId = patch.familyId;
    const velocity = clamp(patch.performance?.velocity ?? 72, 0, 127) / 127;
    const base = {
      volume: -10 + velocity * 5,
      envelope: {
        attack: clamp(envelope.attack ?? 0.006, 0.001, 0.4),
        decay: clamp(envelope.decay ?? 0.24, 0.02, 1.8),
        sustain: clamp(envelope.sustain ?? 0.08, 0, 0.9),
        release: clamp(envelope.release ?? 0.32, 0.02, 2.2),
      },
    };

    if ((familyId === 'air-whoosh' || familyId === 'electric-crackle') && Tone.NoiseSynth) {
      return new Tone.NoiseSynth({
        volume: base.volume - 4,
        noise: { type: familyId === 'air-whoosh' ? 'brown' : 'white' },
        envelope: {
          attack: familyId === 'air-whoosh' ? 0.18 : 0.004,
          decay: base.envelope.decay,
          sustain: familyId === 'air-whoosh' ? 0.32 : 0.04,
          release: base.envelope.release,
        },
      });
    }

    if (familyId === 'metal-impact' && Tone.MetalSynth) {
      return new Tone.MetalSynth({
        volume: base.volume - 8,
        frequency: 180,
        envelope: base.envelope,
        harmonicity: 4.1,
        modulationIndex: clamp(8 + macros.material * 0.16, 2, 24),
        resonance: clamp(1600 + macros.brightness * 70, 400, 9000),
        octaves: 1.8,
      });
    }

    if (Tone.FMSynth) {
      return new Tone.FMSynth({
        ...base,
        harmonicity: clamp(0.75 + (macros.material ?? 60) / 26, 0.25, 5.8),
        modulationIndex: clamp(3 + (macros.material ?? 60) / 5.2, 1, 28),
        oscillator: { type: familyId === 'energy-charge' ? 'sawtooth' : 'sine' },
        modulation: { type: familyId === 'servo-tick' ? 'square' : 'sine' },
        modulationEnvelope: {
          attack: 0.002,
          decay: clamp(0.08 + (macros.motion ?? 50) / 160, 0.04, 0.8),
          sustain: 0.12,
          release: base.envelope.release,
        },
      });
    }

    return new Tone.Synth(base);
  }

  async playToneSoundLabPatch(patch) {
    if (patch?.engineMode !== 'hq') return false;
    const Tone = await this.loadToneRuntime();
    if (!Tone) return false;

    const instrument = this.createToneInstrument(Tone, patch);
    this.toneNodes.push(instrument);
    this.connectToneFxRack(Tone, instrument, patch);

    const note = patch.performance?.note ?? patch.toneGraph?.note ?? 'C3';
    const duration = clamp(patch.toneGraph?.durationSeconds ?? patch.durationSeconds ?? 0.8, 0.08, 4.2);
    const velocity = clamp(patch.performance?.velocity ?? 72, 0, 127) / 127;
    const now = Tone.now?.() ?? 0;

    for (const hit of performanceGestureHits(patch)) {
      const hitTime = now + hit.delayMs / 1000;
      const hitDuration = clamp(duration * (0.58 + hit.velocity / 127 * 0.22), 0.05, duration);
      const hitVelocity = clamp(hit.velocity / 127, 0.08, 1);
      if (patch.familyId === 'air-whoosh' || patch.familyId === 'electric-crackle') {
        instrument.triggerAttackRelease(hitDuration, hitTime, hitVelocity);
      } else {
        const hitNote = transposeNote(note, hit.noteOffset);
        instrument.triggerAttackRelease(hitNote, hitDuration, hitTime, hitVelocity);
      }
    }

    return true;
  }

  async playSoundLabPatch(patch, { onLevel, onAnalyserFrame } = {}) {
    await this.ensureContext();
    this.stop();
    this.playing = true;
    this.current = null;
    this.onLevel = onLevel;
    this.onAnalyserFrame = onAnalyserFrame;
    this.currentSoundLabPatch = patch;

    const fallbackChain = patch?.fallbackChain ?? ['worklet', 'webaudio'];
    let engineUsed = 'webaudio';
    let canUseWorklet = false;
    let usedTone = false;

    if (fallbackChain.includes('tone')) {
      usedTone = await this.playToneSoundLabPatch(patch);
      if (usedTone) engineUsed = 'tone';
    }

    if (!usedTone && fallbackChain.includes('worklet')) {
      canUseWorklet = await this.ensureSoundLabWorklet();
    }

    if (!usedTone && canUseWorklet) {
      const node = new AudioWorkletNode(this.context, 'sound-lab-processor', {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });
      node.connect(this.master);
      node.port.postMessage(buildWorkletMessage(patch));
      this.activeNodes.add(node);
      this.activeSoundLabNode = node;
      engineUsed = 'worklet';
    } else if (!usedTone) {
      this.scheduleSoundLabFallback(patch);
    }

    this.startMeter();
    const stopAfterMs = patch.durationSeconds * 1000 + performanceGestureTailMs(patch);
    this.oneShotTimer = globalThis.setTimeout(() => this.stop(), clamp(stopAfterMs, 620, 6200));
    return { workletReady: canUseWorklet, toneReady: this.toneReady, engineUsed, fallbackChain };
  }

  updateSoundLabPatch(patch) {
    this.currentSoundLabPatch = patch;
    if (!this.playing || !this.activeSoundLabNode) return false;
    try {
      const message = buildWorkletMessage(patch);
      this.activeSoundLabNode.port.postMessage({ ...message, type: 'sound-lab:update' });
      return true;
    } catch {
      return false;
    }
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


  rampLayerGain(gainParam, now, layer, durationSeconds) {
    const envelope = layer.envelope ?? {};
    const attack = Math.max(0.001, (envelope.attackMs ?? 2) / 1000);
    const decay = Math.max(0.012, (envelope.decayMs ?? durationSeconds * 420) / 1000);
    const sustain = clamp(envelope.sustain ?? 0.04, 0.0001, 1);
    const release = Math.max(0.018, (envelope.releaseMs ?? 80) / 1000);
    const peak = clamp(layer.gain ?? 0.3, 0, 1.2);
    const releaseStart = Math.max(now + attack + decay, now + durationSeconds - release);
    const stopAt = releaseStart + release;
    gainParam.cancelScheduledValues(now);
    gainParam.setValueAtTime(0.0001, now);
    gainParam.linearRampToValueAtTime(Math.max(0.0001, peak), now + attack);
    gainParam.exponentialRampToValueAtTime(Math.max(0.0001, peak * sustain), now + attack + decay);
    gainParam.setValueAtTime(Math.max(0.0001, peak * sustain), releaseStart);
    gainParam.exponentialRampToValueAtTime(0.0001, stopAt);
    return stopAt;
  }

  scheduleLayeredSoundLabFallback(patch) {
    if (!this.context || !this.master || !patch?.layers?.length || !this.playing) return;

    const now = this.context.currentTime + 0.01;
    const stopAt = now + patch.durationSeconds;
    const nodes = [];
    const bus = this.context.createGain();
    const shaper = this.context.createWaveShaper();
    const outputGain = this.context.createGain();
    const globalFx = patch.globalFx ?? {};
    bus.gain.value = 0.72;
    shaper.curve = createDistortionCurve(globalFx.dynamics?.drive ?? patch.dsp?.waveshaper?.drive ?? 0.28);
    shaper.oversample = '2x';
    outputGain.gain.value = clamp(globalFx.softLimiter?.ceiling ?? 0.9, 0.4, 0.98);
    bus.connect(shaper);
    connectDynamicDetailStage(this.context, shaper, outputGain, globalFx, nodes);
    outputGain.connect(this.master);
    nodes.push(bus, shaper, outputGain);

    for (const layer of patch.layers) {
      const layerStartTime = now + clamp((layer.onsetMs ?? 0) / 1000, 0, 0.12);
      const layerDuration = Math.max(0.05, patch.durationSeconds - (layerStartTime - now));
      const layerStopAt = layerStartTime + layerDuration;

      if (layer.engine === 'modalResonator') {
        for (const resonator of layer.resonators ?? []) {
          const oscillator = this.context.createOscillator();
          const amp = this.context.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(clamp((layer.baseFrequency ?? 180) * resonator.ratio, 30, 16000), layerStartTime);
          this.rampLayerGain(amp.gain, layerStartTime, { ...layer, gain: layer.gain * resonator.gain }, layerDuration);
          oscillator.connect(amp);
          amp.connect(bus);
          oscillator.start(layerStartTime);
          oscillator.stop(layerStopAt + 0.08);
          nodes.push(oscillator, amp);
        }
        continue;
      }

      if (layer.engine === 'fmBurst') {
        const carrier = this.context.createOscillator();
        const modulator = this.context.createOscillator();
        const modGain = this.context.createGain();
        const amp = this.context.createGain();
        const osc = layer.oscillator ?? {};
        const frequency = clamp(osc.frequency ?? 220, 30, 6000);
        carrier.type = osc.shape === 'square' || osc.shape === 'sawtooth' ? osc.shape : 'sine';
        carrier.frequency.setValueAtTime(frequency, layerStartTime);
        carrier.frequency.linearRampToValueAtTime(clamp(frequency * (1 + Math.abs(osc.sweep ?? 0) * 0.24), 30, 8000), layerStartTime + layerDuration * 0.7);
        modulator.frequency.value = frequency * clamp(osc.fmRatio ?? 1.7, 0.25, 10);
        modGain.gain.value = clamp(osc.fmDepth ?? 0, 0, 1200);
        this.rampLayerGain(amp.gain, layerStartTime, layer, layerDuration);
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(amp);
        amp.connect(bus);
        modulator.start(layerStartTime);
        carrier.start(layerStartTime);
        modulator.stop(layerStopAt + 0.08);
        carrier.stop(layerStopAt + 0.08);
        nodes.push(carrier, modulator, modGain, amp);
        continue;
      }

      if (layer.engine === 'combDelay') {
        const source = this.context.createOscillator();
        const delay = this.context.createDelay(0.08);
        const feedback = this.context.createGain();
        const amp = this.context.createGain();
        source.type = 'sawtooth';
        source.frequency.value = clamp(layer.sourceFrequency ?? 900, 40, 6000);
        delay.delayTime.value = clamp((layer.delayMs ?? 8) / 1000, 0.001, 0.06);
        feedback.gain.value = clamp(layer.feedback ?? 0.35, 0, 0.82);
        this.rampLayerGain(amp.gain, layerStartTime, layer, layerDuration);
        source.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(amp);
        source.connect(amp);
        amp.connect(bus);
        source.start(layerStartTime);
        source.stop(layerStopAt + 0.08);
        nodes.push(source, delay, feedback, amp);
        continue;
      }

      const noise = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const amp = this.context.createGain();
      const filterData = layer.filter ?? {};
      noise.buffer = createNoiseBuffer(this.context, layerDuration + 0.12);
      filter.type = filterData.type === 'lowpass' ? 'lowpass' : filterData.type === 'highpass' ? 'highpass' : 'bandpass';
      filter.frequency.setValueAtTime(clamp(layer.bandHz ?? filterData.frequency ?? 3200, 120, 16000), layerStartTime);
      filter.Q.value = clamp(filterData.q ?? 1.2, 0.2, 16);
      if (filterData.sweep) {
        filter.frequency.linearRampToValueAtTime(clamp((filterData.frequency ?? 3200) * (1 + filterData.sweep), 120, 16000), layerStartTime + layerDuration * 0.75);
      }
      this.rampLayerGain(amp.gain, layerStartTime, layer, layerDuration);
      noise.connect(filter);
      filter.connect(amp);
      amp.connect(bus);
      noise.start(layerStartTime);
      noise.stop(layerStopAt + 0.08);
      nodes.push(noise, filter, amp);
    }

    if (globalFx.space?.mix > 0) {
      const spacePreDelay = this.context.createDelay(0.18);
      const convolver = this.context.createConvolver();
      const wet = this.context.createGain();
      convolver.buffer = createSpaceBuffer(this.context, globalFx.space.decaySeconds);
      wet.gain.value = clamp(globalFx.space.mix, 0, 0.46);
      spacePreDelay.delayTime.value = clamp((globalFx.space.preDelayMs ?? 0) / 1000, 0, 0.16);
      bus.connect(spacePreDelay);
      spacePreDelay.connect(convolver);
      convolver.connect(wet);
      wet.connect(this.master);
      nodes.push(spacePreDelay, convolver, wet);
    }

    for (const node of nodes) this.activeNodes.add(node);
    globalThis.setTimeout(() => {
      for (const node of nodes) {
        this.activeNodes.delete(node);
        try {
          node.disconnect();
        } catch {
          // Node may already be disconnected by stop().
        }
      }
    }, Math.max(120, patch.durationSeconds * 1000 + 180));
  }

  scheduleSoundLabFallback(patch) {
    if (patch?.layers?.length) {
      this.scheduleLayeredSoundLabFallback(patch);
      return;
    }

    if (!this.context || !this.master || !patch || !this.playing) return;

    const now = this.context.currentTime + 0.01;
    const stopAt = now + patch.durationSeconds;
    const nodes = [];
    const sourceGain = this.context.createGain();
    const bodyGain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    const shaper = this.context.createWaveShaper();
    const patchDsp = patch.dsp;

    sourceGain.gain.setValueAtTime(0.0001, now);
    sourceGain.gain.linearRampToValueAtTime(patchDsp.safety.outputGain * 0.42, now + patchDsp.transient.attackMs / 1000);
    sourceGain.gain.exponentialRampToValueAtTime(0.0001, stopAt);
    bodyGain.gain.value = 0.78;
    filter.type = patchDsp.filter.type === 'highpass' ? 'highpass' : patchDsp.filter.type === 'lowpass' ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(clamp(patchDsp.filter.frequency, 120, 16000), now);
    filter.Q.setValueAtTime(clamp(patchDsp.filter.q, 0.4, 12), now);
    if (patchDsp.filter.sweep) {
      filter.frequency.linearRampToValueAtTime(
        clamp(patchDsp.filter.frequency * (1 + patchDsp.filter.sweep), 120, 16000),
        now + patch.durationSeconds * 0.72,
      );
    }
    shaper.curve = createDistortionCurve(patchDsp.waveshaper.drive);
    shaper.oversample = '2x';

    const oscillator = this.context.createOscillator();
    oscillator.type = patchDsp.oscillator.shape;
    oscillator.frequency.setValueAtTime(patchDsp.oscillator.baseFrequency, now);
    oscillator.frequency.linearRampToValueAtTime(
      patchDsp.oscillator.baseFrequency * (1 + Math.abs(patchDsp.filter.sweep || 0) * 0.6),
      now + patch.durationSeconds * 0.48,
    );
    oscillator.connect(sourceGain);
    oscillator.start(now);
    oscillator.stop(stopAt + 0.04);
    nodes.push(oscillator);

    if (patchDsp.noise.gain > 0) {
      const noise = this.context.createBufferSource();
      const noiseAmp = this.context.createGain();
      noise.buffer = createNoiseBuffer(this.context, patch.durationSeconds + 0.08);
      noiseAmp.gain.setValueAtTime(clamp(patchDsp.noise.gain * 0.12, 0, 0.12), now);
      noiseAmp.gain.exponentialRampToValueAtTime(0.0001, stopAt);
      noise.connect(noiseAmp);
      noiseAmp.connect(sourceGain);
      noise.start(now);
      noise.stop(stopAt + 0.04);
      nodes.push(noise, noiseAmp);
    }

    sourceGain.connect(filter);
    filter.connect(shaper);
    shaper.connect(bodyGain);
    bodyGain.connect(this.master);
    nodes.push(sourceGain, bodyGain, filter, shaper);

    patchDsp.resonators.forEach((resonator) => {
      const resonatorFilter = this.context.createBiquadFilter();
      const resonatorGain = this.context.createGain();
      resonatorFilter.type = 'bandpass';
      resonatorFilter.frequency.value = clamp(patchDsp.oscillator.baseFrequency * resonator.ratio, 80, 14000);
      resonatorFilter.Q.value = clamp(8 + patchDsp.filter.q * 2, 2, 28);
      resonatorGain.gain.setValueAtTime(clamp(resonator.gain * 0.18, 0.01, 0.24), now);
      resonatorGain.gain.exponentialRampToValueAtTime(0.0001, now + resonator.decay);
      sourceGain.connect(resonatorFilter);
      resonatorFilter.connect(resonatorGain);
      resonatorGain.connect(this.master);
      nodes.push(resonatorFilter, resonatorGain);
    });

    scheduleTransientClick(this.context, this.master, {
      transient: {
        clickGain: patchDsp.transient.clickGain,
        brightness: patch.macros.brightness / 100,
        bandHz: patchDsp.filter.frequency,
      },
    }, now, stopAt, nodes);

    if (patchDsp.space.mix > 0) {
      const convolver = this.context.createConvolver();
      const wet = this.context.createGain();
      convolver.buffer = createSpaceBuffer(this.context, patchDsp.space.decaySeconds);
      wet.gain.value = patchDsp.space.mix;
      bodyGain.connect(convolver);
      convolver.connect(wet);
      wet.connect(this.master);
      nodes.push(convolver, wet);
    }

    for (const node of nodes) this.activeNodes.add(node);
    oscillator.addEventListener('ended', () => {
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

    const timeData = new Uint8Array(this.analyser.fftSize);
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    const tick = () => {
      if (!this.playing || !this.analyser) {
        this.raf = null;
        this.meterTimer = null;
        return;
      }

      this.analyser.getByteTimeDomainData(timeData);
      this.analyser.getByteFrequencyData(frequencyData);
      let sum = 0;
      for (const value of timeData) {
        const centered = (value - 128) / 128;
        sum += centered * centered;
      }
      const rms = Math.sqrt(sum / timeData.length);
      const level = clamp(rms * 3.2, 0, 1);
      globalThis.__soundLabMeterFrames = (globalThis.__soundLabMeterFrames ?? 0) + 1;
      globalThis.__soundLabLastLevel = level;
      try {
        this.onLevel?.(level);
        this.onAnalyserFrame?.({ timeDomain: timeData, frequency: frequencyData, level });
      } catch {
        // Meter callbacks are visual-only and should never interrupt audio scheduling.
      }
      if (globalThis.requestAnimationFrame) {
        this.raf = globalThis.requestAnimationFrame(tick);
      } else {
        this.meterTimer = globalThis.setTimeout(tick, 33);
      }
    };

    tick();
  }

  stop() {
    this.playing = false;
    globalThis.clearInterval(this.timer);
    globalThis.clearTimeout(this.oneShotTimer);
    this.timer = null;
    this.oneShotTimer = null;
    if (this.raf) globalThis.cancelAnimationFrame(this.raf);
    this.raf = null;
    globalThis.clearTimeout(this.meterTimer);
    this.meterTimer = null;
    this.onLevel?.(0);
    this.onAnalyserFrame?.({ timeDomain: null, frequency: null, level: 0 });
    this.disposeToneNodes();
    this.activeSoundLabNode = null;
    this.currentSoundLabPatch = null;

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
