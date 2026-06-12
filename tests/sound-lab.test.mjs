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
