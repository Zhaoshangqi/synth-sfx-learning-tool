import test from 'node:test';
import assert from 'node:assert/strict';
import { soundLabFamilies } from '../src/content.js';
import {
  SOUND_LAB_MACROS,
  buildSoundLabPatch,
  buildSoundLabViewModel,
  buildWorkbenchLibraryState,
  formatBatchExportName,
  getSoundLabFamily,
} from '../src/sound-lab-model.js';

test('advanced sound lab model exposes professional modules and editable routing state', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'metal-impact');
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS, {
    engineMode: 'hq',
    fxOrder: ['filter', 'drive', 'chorus', 'delay', 'reverb', 'limiter'],
    xyPad: { x: 72, y: 34 },
    macroMorph: 41,
    abSlot: 'b',
  });

  assert.deepEqual(
    model.advancedModules.map((module) => module.id),
    [
      'advanced',
      'mod-matrix',
      'envelope-editor',
      'fx-chain',
      'xy-pad',
      'macro-morph',
      'ab-compare',
      'favorites',
      'project-library',
      'cloud-sync',
      'midi-input',
      'batch-export',
    ],
  );
  assert.ok(model.modMatrix.routes.length >= 8);
  assert.ok(model.modMatrix.sources.some((source) => source.id === 'xy-x'));
  assert.ok(model.modMatrix.targets.some((target) => target.id === 'filter.cutoff'));
  assert.equal(model.xyPad.x, 72);
  assert.equal(model.xyPad.y, 34);
  assert.equal(model.macroMorph.amount, 41);
  assert.equal(model.abCompare.activeSlot, 'b');
  assert.deepEqual(model.fxChain.slots.map((slot) => slot.id), ['filter', 'drive', 'chorus', 'delay', 'reverb', 'limiter']);
});

test('patch builder applies mod matrix, editable envelope, and reordered FX chain to the playable patch', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'energy-charge');
  const patch = buildSoundLabPatch(family, {
    brightness: 60,
    motion: 48,
    material: 55,
    space: 32,
    variation: 26,
  }, {
    engineMode: 'hq',
    envelope: { attack: 0.018, decay: 0.42, sustain: 0.38, release: 0.74 },
    fxOrder: ['filter', 'drive', 'delay', 'reverb', 'chorus', 'limiter'],
    modMatrix: [
      { id: 'test-route', source: 'xy-x', target: 'filter.cutoff', amount: 64, enabled: true },
    ],
    xyPad: { x: 80, y: 25 },
  });

  assert.equal(patch.toneGraph.envelope.attack, 0.018);
  assert.equal(patch.toneGraph.envelope.decay, 0.42);
  assert.equal(patch.toneGraph.envelope.sustain, 0.38);
  assert.equal(patch.toneGraph.envelope.release, 0.74);
  assert.deepEqual(patch.fxRack.map((slot) => slot.id), ['filter', 'drive', 'delay', 'reverb', 'chorus', 'limiter']);
  assert.ok(patch.modMatrix.some((route) => route.id === 'test-route'));
  assert.ok(patch.dsp.filter.frequency > 1000, 'XY/mod route should keep the cutoff in a playable range');
});

test('workbench library state supports favorites, local projects, github sync, midi mappings, and export naming', () => {
  const family = getSoundLabFamily(soundLabFamilies, 'glass-ping');
  const patch = buildSoundLabPatch(family, SOUND_LAB_MACROS, { engineMode: 'worklet' });
  const variedPatch = buildSoundLabPatch(family, {
    ...SOUND_LAB_MACROS,
    variation: Math.min(100, SOUND_LAB_MACROS.variation + 24),
  }, { engineMode: 'worklet' });
  const library = buildWorkbenchLibraryState({
    patch: variedPatch,
    favoriteIds: [patch.libraryKey],
    projects: [{ id: 'proj-metal-ui', name: 'Metal UI Pack', patchIds: [patch.libraryKey], tags: ['ui', 'metal'] }],
    gitSync: { owner: 'Zhaoshangqi', repo: 'synth-sfx-learning-tool', branch: 'main', basePath: 'data/user-presets/zsq' },
    midiMappings: [{ controlId: 'brightness', messageType: 'cc', channel: 1, number: 74 }],
  });

  assert.equal(variedPatch.libraryKey, patch.libraryKey);
  assert.notEqual(variedPatch.id, patch.id);
  assert.equal(library.favorites[0].patchId, patch.libraryKey);
  assert.equal(library.favorites[0].active, true);
  assert.equal(library.projects[0].patchIds[0], patch.libraryKey);
  assert.equal(library.gitSync.apiPath, '/repos/Zhaoshangqi/synth-sfx-learning-tool/contents/data/user-presets/zsq/library.json');
  assert.equal(library.gitSync.patchPath, `data/user-presets/zsq/patches/${patch.libraryKey}.json`);
  assert.equal(library.midiMappings[0].controlId, 'brightness');

  const name = formatBatchExportName('{family}_{preset}_{date}_{version}_{variant}', {
    family: 'Glass Ping',
    preset: 'Phase Plant / Bell',
    date: '2026-06-13',
    version: 3,
    variant: 12,
  });
  assert.equal(name, 'Glass-Ping_Phase-Plant-Bell_2026-06-13_v003_012');
});
