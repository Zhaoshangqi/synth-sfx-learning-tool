import test from 'node:test';
import assert from 'node:assert/strict';
import { sources, soundLabFamilies } from '../src/content.js';
import {
  SOUND_LAB_MACROS,
  buildSoundLabPatch,
  buildSoundLabViewModel,
  buildWorkletMessage,
  getSoundLabFamily,
} from '../src/sound-lab-model.js';

test('sound lab content exposes high-quality diverse sound families', () => {
  assert.ok(soundLabFamilies.length >= 6, 'expected metal, glass, electric, air, servo, energy style families');
  const sourceIds = new Set(sources.map((source) => source.id));

  for (const family of soundLabFamilies) {
    assert.match(family.id, /^[a-z0-9-]+$/);
    assert.ok(family.titleZh);
    assert.ok(family.materialAxis.length >= 4);
    assert.ok(family.presets.length >= 3, `${family.id} needs at least three presets`);
    assert.ok(family.practiceSteps.length >= 4, `${family.id} needs beginner-to-delivery steps`);
    assert.ok(family.reaperExport.length >= 3, `${family.id} needs REAPER export guidance`);
    assert.ok(family.sourceIds.every((sourceId) => sourceIds.has(sourceId)), `${family.id} has unknown source`);
  }
});

test('buildSoundLabPatch maps macros to AudioWorklet-ready DSP parameters', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 82,
    motion: 36,
    material: 74,
    space: 28,
    variation: 41,
  });

  assert.equal(patch.familyId, 'metal-impact');
  assert.ok(patch.workletName);
  assert.ok(patch.durationSeconds > 0.2);
  assert.ok(patch.dsp.resonators.length >= 2);
  assert.ok(patch.dsp.transient.clickGain > 0);
  assert.ok(patch.dsp.filter.frequency > 1000);
  assert.ok(patch.dsp.space.mix > 0);
  assert.ok(patch.dsp.safety.outputGain <= 0.9);
});

test('buildWorkletMessage produces a stable message contract for the browser audio engine', () => {
  const patch = buildSoundLabPatch(soundLabFamilies[0], SOUND_LAB_MACROS);
  const message = buildWorkletMessage(patch);

  assert.deepEqual(Object.keys(message).sort(), ['familyId', 'id', 'payload', 'type'].sort());
  assert.equal(message.type, 'sound-lab:play');
  assert.equal(message.payload.sampleRateHint, 48000);
  assert.ok(Array.isArray(message.payload.resonators));
  assert.equal(typeof message.payload.seed, 'number');
});

test('buildSoundLabViewModel exposes meters, macro labels, evidence, and export text', () => {
  const model = buildSoundLabViewModel(soundLabFamilies[0], SOUND_LAB_MACROS);

  assert.equal(model.macros.length, 5);
  assert.ok(model.macros.every((macro) => macro.percent >= 0 && macro.percent <= 100));
  assert.ok(model.meters.length >= 4);
  assert.ok(model.evidence.length >= 1);
  assert.match(model.patchJson, /"familyId"/);
  assert.match(model.reaperNotes, /REAPER/);
});

test('buildSoundLabPatch can use preset DNA, quality mode, and layer mixer controls', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const patch = buildSoundLabPatch(family, {
    brightness: 82,
    motion: 44,
    material: 88,
    space: 38,
    variation: 57,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    sampleMix: 0.64,
    layerMix: {
      transient: 86,
      body: 78,
      texture: 52,
      tail: 34,
    },
  });

  assert.equal(patch.presetDna.id, 'vital-metal-modal-hit');
  assert.equal(patch.qualityMode, 'studio');
  assert.equal(patch.sampleMix, 0.64);
  assert.ok(patch.layers.length >= 5);
  assert.ok(patch.layers.some((layer) => layer.role === 'transient' && layer.engine === 'sampleGrain'));
  assert.ok(patch.layers.some((layer) => layer.engine === 'modalResonator'));
  assert.ok(patch.layers.some((layer) => layer.engine === 'combDelay'));
  assert.ok(patch.layers.every((layer) => layer.envelope && Number.isFinite(layer.gain)));
  assert.ok(patch.globalFx.softLimiter.ceiling <= 0.96);
  assert.ok(patch.globalFx.space.decaySeconds > 0.1);
  assert.match(patch.licenseNotice, /PresetShare|public domain|procedural/i);
});

test('buildWorkletMessage sends layered DSP data without dropping the legacy contract', () => {
  const patch = buildSoundLabPatch(soundLabFamilies[0], SOUND_LAB_MACROS, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    layerMix: { transient: 70, body: 70, texture: 40, tail: 30 },
  });
  const message = buildWorkletMessage(patch);

  assert.ok(Array.isArray(message.payload.resonators));
  assert.ok(Array.isArray(message.payload.layers));
  assert.ok(message.payload.layers.length >= 5);
  assert.equal(message.payload.qualityMode, 'studio');
  assert.ok(message.payload.globalFx.softLimiter);
  assert.ok(message.payload.layers.some((layer) => layer.engine === 'sampleGrain'));
  assert.ok(message.payload.layers.some((layer) => layer.engine === 'modalResonator'));
});

test('buildSoundLabPatch exposes HQ synth engine graph and playable performance controls', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'energy-charge');
  const patch = buildSoundLabPatch(family, {
    brightness: 84,
    motion: 78,
    material: 62,
    space: 54,
    variation: 46,
  }, {
    engineMode: 'hq',
    presetId: 'vital-energy-charge-rise',
    qualityMode: 'studio',
    performance: { note: 'G3', velocity: 82, glide: 28, hold: true, octave: 0 },
  });

  assert.equal(patch.engineMode, 'hq');
  assert.equal(patch.toneGraph.engine, 'Tone.js');
  assert.match(patch.toneGraph.instrument, /Synth|Noise|Metal|FM|AM/);
  assert.ok(patch.toneGraph.nodes.length >= 4, 'HQ graph should describe instrument, filter, movement, and output stages');
  assert.ok(patch.toneGraph.effects.some((effect) => effect.type === 'reverb'));
  assert.ok(patch.toneGraph.effects.some((effect) => effect.type === 'drive'));
  assert.equal(patch.performance.note, 'G3');
  assert.equal(patch.performance.hold, true);
  assert.ok(patch.macroModulation.some((route) => route.source === 'motion' && route.target.includes('filter')));
  assert.equal(patch.fallbackChain.join(' > '), 'tone > worklet > webaudio');
});

test('buildSoundLabViewModel exposes HQ engine modes, FX rack, and performance UI data', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'air-whoosh');
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS, { engineMode: 'hq' });

  assert.ok(model.engineModes.some((mode) => mode.id === 'hq' && mode.labelZh.includes('HQ')));
  assert.equal(model.activeEngineMode, 'hq');
  assert.ok(model.performanceControls.some((control) => control.id === 'velocity'));
  assert.ok(model.performanceControls.some((control) => control.id === 'glide'));
  assert.ok(model.keyboardNotes.length >= 12);
  assert.ok(model.fxRack.some((effect) => effect.id === 'reverb'));
  assert.match(model.patchJson, /"toneGraph"/);
});
