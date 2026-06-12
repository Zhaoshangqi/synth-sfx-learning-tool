import test from 'node:test';
import assert from 'node:assert/strict';
import { interactiveLabs, materialLabs } from '../src/content.js';
import { buildDefaultMaterialState, buildMaterialAudioPatch } from '../src/challenge-model.js';
import { buildDefaultLabState } from '../src/lab-engine.js';
import {
  BASIC_WAVEFORMS,
  buildLabAudioPatch,
  buildWaveformPreview,
} from '../src/audio-model.js';

test('BASIC_WAVEFORMS exposes the four foundational oscillator shapes', () => {
  assert.deepEqual(BASIC_WAVEFORMS.map((waveform) => waveform.id), [
    'sine',
    'square',
    'sawtooth',
    'triangle',
  ]);

  for (const waveform of BASIC_WAVEFORMS) {
    assert.ok(waveform.labelZh);
    assert.ok(waveform.soundZh);
  }
});

test('buildWaveformPreview generates stable drawable point strings', () => {
  const sine = buildWaveformPreview('sine');
  const square = buildWaveformPreview('square');
  const saw = buildWaveformPreview('sawtooth');

  assert.ok(sine.points.split(' ').length >= 24);
  assert.ok(square.points.includes(',8') || square.points.includes(',32'));
  assert.ok(saw.points.split(' ').length >= 24);
});

test('buildLabAudioPatch maps filter controls to audible filter parameters', () => {
  const lab = interactiveLabs.find((item) => item.id === 'filter-lab');
  const patch = buildLabAudioPatch(lab, { cutoff: 4200, resonance: 58, motion: 20 }, 'sawtooth');

  assert.equal(patch.waveform, 'sawtooth');
  assert.equal(patch.filter.type, 'lowpass');
  assert.equal(patch.filter.frequency, 4200);
  assert.ok(patch.filter.q > 1);
  assert.ok(patch.motionHz > 0);
});

test('buildLabAudioPatch maps FM metal controls to carrier and modulator settings', () => {
  const lab = interactiveLabs.find((item) => item.id === 'fm-metal-lab');
  const patch = buildLabAudioPatch(lab, buildDefaultLabState(lab), 'triangle');

  assert.equal(patch.waveform, 'triangle');
  assert.equal(patch.fm.enabled, true);
  assert.equal(patch.fm.ratio, 2.7);
  assert.ok(patch.fm.depthHz > 0);
  assert.ok(patch.envelope.decayMs >= 100);
});

test('lab patches expose quality macros, transient click, and tasteful FX intent', () => {
  const fmLab = interactiveLabs.find((item) => item.id === 'fm-metal-lab');
  const layerLab = interactiveLabs.find((item) => item.id === 'layer-stack-lab');
  const fmPatch = buildLabAudioPatch(fmLab, buildDefaultLabState(fmLab), 'triangle');
  const layerPatch = buildLabAudioPatch(layerLab, buildDefaultLabState(layerLab), 'sawtooth');

  for (const patch of [fmPatch, layerPatch]) {
    assert.ok(patch.transient.clickGain > 0, 'sound-design patches need an audible transient layer');
    assert.ok(patch.macroTone >= 0 && patch.macroTone <= 1);
    assert.ok(patch.macroMotion >= 0 && patch.macroMotion <= 1);
    assert.ok(patch.macroSpace >= 0 && patch.macroSpace <= 1);
  }

  assert.ok(fmPatch.fx.distortion.mix > 0, 'FM metal should have controlled saturation');
  assert.ok(fmPatch.fx.space.mix > 0, 'FM metal should have a short resonance space');
  assert.ok(layerPatch.noise.enabled, 'layer lab should include noise as texture material');
});

test('material audio patches include audible FX chain settings', () => {
  const metal = materialLabs.find((item) => item.id === 'metal');
  const magic = materialLabs.find((item) => item.id === 'magic');
  const electric = materialLabs.find((item) => item.id === 'electric');

  const metalPatch = buildMaterialAudioPatch(metal, buildDefaultMaterialState(metal));
  const magicPatch = buildMaterialAudioPatch(magic, buildDefaultMaterialState(magic));
  const electricPatch = buildMaterialAudioPatch(electric, buildDefaultMaterialState(electric));

  assert.ok(metalPatch.fx.distortion.drive > 0, 'metal needs controlled distortion');
  assert.ok(metalPatch.fx.space.mix > 0, 'metal needs short space to hear resonance');
  assert.ok(magicPatch.fx.delay.mix > 0, 'magic needs delay/shimmer motion');
  assert.ok(magicPatch.fx.space.decaySeconds > metalPatch.fx.space.decaySeconds, 'magic tail should be longer than metal');
  assert.ok(electricPatch.fx.bitcrush.enabled, 'electric needs digital crackle edge');
});

test('material audio patches expose transient and macro controls for a more controllable sound surface', () => {
  const metal = materialLabs.find((item) => item.id === 'metal');
  const glass = materialLabs.find((item) => item.id === 'glass');
  const metalPatch = buildMaterialAudioPatch(metal, buildDefaultMaterialState(metal));
  const glassPatch = buildMaterialAudioPatch(glass, buildDefaultMaterialState(glass));

  assert.ok(metalPatch.transient.clickGain > 0);
  assert.ok(glassPatch.transient.clickGain > 0);
  assert.ok(metalPatch.macroTone >= 0 && metalPatch.macroTone <= 1);
  assert.ok(metalPatch.macroMotion >= 0 && metalPatch.macroMotion <= 1);
  assert.ok(metalPatch.macroSpace >= 0 && metalPatch.macroSpace <= 1);
  assert.ok(glassPatch.fx.space.mix > 0, 'glass should use space to expose its brittle tail');
});
