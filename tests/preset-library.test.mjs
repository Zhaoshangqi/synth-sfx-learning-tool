import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPresetDnaForFamily,
  presetDnaLibrary,
  validatePresetDnaLibrary,
} from '../src/preset-library.js';
import { SOUND_LAB_SAMPLE_ASSETS } from '../src/sample-assets.js';

const REQUIRED_SYNTHS = ['Serum', 'Phase Plant', 'Vital'];
const REQUIRED_FAMILIES = ['metal-impact', 'glass-ping', 'electric-crackle', 'air-whoosh', 'servo-tick', 'energy-charge'];

test('preset DNA library covers target synths and sound families with traceable public sources', () => {
  assert.ok(presetDnaLibrary.length >= 12, 'expected at least two DNA entries per sound family');

  const synths = new Set(presetDnaLibrary.flatMap((entry) => entry.synths));
  for (const synth of REQUIRED_SYNTHS) assert.ok(synths.has(synth), `missing ${synth} DNA`);

  for (const familyId of REQUIRED_FAMILIES) {
    assert.ok(getPresetDnaForFamily(familyId).length >= 2, `${familyId} needs at least two preset DNA references`);
  }

  for (const entry of presetDnaLibrary) {
    assert.match(entry.id, /^[a-z0-9-]+$/);
    assert.ok(REQUIRED_FAMILIES.includes(entry.familyId), `${entry.id} uses an unknown family`);
    assert.ok(entry.titleZh && entry.titleEn);
    assert.ok(entry.source?.url?.startsWith('https://'), `${entry.id} needs a source URL`);
    assert.ok(['public-domain', 'official-doc', 'permissive-code', 'observed-tutorial'].includes(entry.source.license.kind));
    assert.ok(entry.source.extractionZh, `${entry.id} needs Chinese extraction notes`);
    assert.ok(entry.parameters.oscillators.length >= 1, `${entry.id} needs oscillator settings`);
    assert.ok(entry.layerRecipe.length >= 3, `${entry.id} needs transient/body/texture/tail recipe layers`);
    assert.ok(entry.mappings.serum.length >= 2, `${entry.id} needs Serum mapping`);
    assert.ok(entry.mappings.phasePlant.length >= 2, `${entry.id} needs Phase Plant mapping`);
    assert.ok(entry.mappings.vital.length >= 2, `${entry.id} needs Vital mapping`);
  }

  assert.deepEqual(validatePresetDnaLibrary(presetDnaLibrary), { valid: true, errors: [] });
});

test('preset DNA translates free preset observations into layer roles usable by the web synth', () => {
  const metal = getPresetDnaForFamily('metal-impact').find((entry) => entry.id.includes('metal'));
  const electric = getPresetDnaForFamily('electric-crackle').find((entry) => entry.id.includes('crackle'));
  const whoosh = getPresetDnaForFamily('air-whoosh').find((entry) => entry.id.includes('whoosh'));

  assert.ok(metal.layerRecipe.some((layer) => layer.engine === 'modalResonator'));
  assert.ok(metal.layerRecipe.some((layer) => layer.engine === 'combDelay'));
  assert.ok(electric.layerRecipe.some((layer) => layer.engine === 'sampleGrain'));
  assert.ok(electric.parameters.modulation.some((mod) => mod.target.includes('gate') || mod.target.includes('rate')));
  assert.ok(whoosh.layerRecipe.some((layer) => layer.engine === 'filteredNoise'));
  assert.ok(whoosh.parameters.modulation.some((mod) => mod.target.includes('filter')));
});

test('sample sweetener metadata is safe to ship and supports higher-quality transient and texture layers', () => {
  assert.ok(SOUND_LAB_SAMPLE_ASSETS.length >= 6);

  for (const asset of SOUND_LAB_SAMPLE_ASSETS) {
    assert.match(asset.id, /^[a-z0-9-]+$/);
    assert.ok(['transient', 'texture', 'tail', 'noise-bed'].includes(asset.role));
    assert.ok(['generated-procedural', 'cc0', 'public-domain'].includes(asset.license.kind));
    assert.ok(asset.license.attributionZh);
    assert.ok(asset.generator?.type, `${asset.id} needs procedural generator data`);
    assert.ok(asset.generator.durationMs > 8 && asset.generator.durationMs < 2200);
  }
});
