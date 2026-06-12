import test from 'node:test';
import assert from 'node:assert/strict';
import { interactiveLabs } from '../src/content.js';
import {
  applyLabMacro,
  applyLabPreset,
  buildDefaultLabState,
  buildLabVisualModel,
  updateLabControl,
  updateAdsrStateFromDrag,
} from '../src/lab-engine.js';

test('buildDefaultLabState uses every control default', () => {
  const lab = interactiveLabs[0];
  const state = buildDefaultLabState(lab);
  assert.equal(state.attack, 10);
  assert.equal(state.decay, 180);
  assert.equal(state.sustain, 0);
  assert.equal(state.release, 120);
});

test('updateLabControl clamps values to the control range', () => {
  const lab = interactiveLabs[0];
  const low = updateLabControl(lab, buildDefaultLabState(lab), 'attack', -200);
  const high = updateLabControl(lab, buildDefaultLabState(lab), 'release', 9999);
  assert.equal(low.attack, 0);
  assert.equal(high.release, 1600);
});

test('applyLabPreset merges preset values over defaults', () => {
  const lab = interactiveLabs.find((item) => item.id === 'fm-metal-lab');
  const state = applyLabPreset(lab, 'bell-ring');
  assert.equal(state.ratio, 3.72);
  assert.equal(state.depth, 38);
  assert.equal(state.decay, 1200);
});

test('applyLabMacro maps tone, motion, and space macros to real controls', () => {
  const lab = interactiveLabs.find((item) => item.id === 'recipe-playground');
  const base = buildDefaultLabState(lab);
  const tone = applyLabMacro(lab, base, 'tone');
  const motion = applyLabMacro(lab, base, 'motion');
  const space = applyLabMacro(lab, base, 'space');

  assert.notDeepEqual(tone, base);
  assert.notDeepEqual(motion, base);
  assert.notDeepEqual(space, base);
  assert.ok(tone.brightness > base.brightness, 'tone macro should raise brightness');
  assert.ok(motion.motion > base.motion, 'motion macro should raise motion');
  assert.ok(space.space > base.space, 'space macro should raise space');
});

test('buildLabVisualModel returns type-specific model and active explanation', () => {
  const adsr = interactiveLabs.find((item) => item.id === 'adsr-lab');
  const adsrModel = buildLabVisualModel(adsr, buildDefaultLabState(adsr));
  assert.equal(adsrModel.type, 'adsr');
  assert.ok(adsrModel.pathPoints.length >= 5);
  assert.ok(adsrModel.activeExplanations.length >= 3);

  const fm = interactiveLabs.find((item) => item.id === 'fm-metal-lab');
  const fmModel = buildLabVisualModel(fm, buildDefaultLabState(fm));
  assert.equal(fmModel.type, 'fm');
  assert.ok(fmModel.sidebands.length >= 5);
});

test('updateAdsrStateFromDrag maps draggable visual handles back to ADSR controls', () => {
  const lab = interactiveLabs.find((item) => item.id === 'adsr-lab');
  const base = buildDefaultLabState(lab);

  const slowAttack = updateAdsrStateFromDrag(lab, base, 'attack', 140, 42);
  assert.equal(slowAttack.attack, 800);

  const shortAttack = updateAdsrStateFromDrag(lab, base, 'attack', -80, 42);
  assert.equal(shortAttack.attack, 0);

  const longHighBody = updateAdsrStateFromDrag(lab, base, 'decay-sustain', 260, 42);
  assert.equal(longHighBody.decay, 1200);
  assert.equal(longHighBody.sustain, 100);

  const longRelease = updateAdsrStateFromDrag(lab, base, 'release', 420, 220);
  assert.equal(longRelease.release, 1600);
});
