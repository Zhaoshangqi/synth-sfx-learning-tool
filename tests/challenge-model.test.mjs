import test from 'node:test';
import assert from 'node:assert/strict';
import { interactiveLabs, materialLabs, soundChallenges } from '../src/content.js';
import {
  buildChallengeAudioPatch,
  buildDefaultMaterialState,
  buildMaterialAudioPatch,
  buildMaterialVisualModel,
  scoreChallengeAnswer,
  updateMaterialControl,
} from '../src/challenge-model.js';

test('scoreChallengeAnswer returns correctness and Chinese explanation', () => {
  const challenge = soundChallenges[0];
  const correct = scoreChallengeAnswer(challenge, challenge.answerId);
  const wrong = scoreChallengeAnswer(challenge, 'definitely-wrong');

  assert.equal(correct.correct, true);
  assert.equal(wrong.correct, false);
  assert.ok(correct.explanationZh.length > 12);
});

test('buildChallengeAudioPatch turns A/B challenge slots into playable synth patches', () => {
  const challenge = soundChallenges.find((item) => item.type === 'ear-ab');
  const patchA = buildChallengeAudioPatch(challenge, 'a', interactiveLabs);
  const patchB = buildChallengeAudioPatch(challenge, 'b', interactiveLabs);

  assert.ok(patchA.durationSeconds > 0.1);
  assert.ok(patchB.durationSeconds > 0.1);
  assert.notEqual(patchA.envelope.attackMs, patchB.envelope.attackMs);
  assert.ok(patchA.transient.clickGain > 0);
  assert.ok(patchB.macroTone >= 0 && patchB.macroTone <= 1);
});

test('material lab controls clamp and produce audible material patches', () => {
  const metal = materialLabs.find((item) => item.id === 'metal');
  const base = buildDefaultMaterialState(metal);
  const brighter = updateMaterialControl(metal, base, 'brightness', 1000);
  const patch = buildMaterialAudioPatch(metal, brighter);

  assert.equal(brighter.brightness, 100);
  assert.equal(patch.fm.enabled, true);
  assert.ok(patch.fm.depthHz > 80);
  assert.ok(patch.filter.frequency > 2000);
  assert.ok(patch.durationSeconds > 0.2);
});

test('buildMaterialVisualModel exposes normalized controls and radar polygon points', () => {
  const material = materialLabs[0];
  const state = buildDefaultMaterialState(material);
  const model = buildMaterialVisualModel(material, state);

  assert.equal(model.type, 'material');
  assert.equal(model.normalizedControls.length, material.controls.length);
  assert.equal(model.polygonPoints.length, material.controls.length);
  assert.ok(model.activeExplanations[0].explanationZh);
});
