import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('document shell includes premium audio-space background layers', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /class="audio-space"/);
  assert.match(html, /id="particle-canvas"/);
  assert.match(html, /class="signal-field"/);
  assert.match(html, /src="\.\/src\/visual-space\.js"/);
  assert.match(html, /src="\.\/src\/interaction-effects\.js"/);
});

test('styles include premium button feel and custom range rails', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /:active/);
  assert.match(css, /\.range-shell/);
  assert.match(css, /--range-value/);
  assert.match(css, /::-webkit-slider-thumb/);
  assert.match(css, /::-moz-range-thumb/);
  assert.match(css, /linear-gradient\(90deg/);
  assert.match(css, /\.tap-spark/);
  assert.match(css, /\.is-pressing/);
  assert.match(css, /@keyframes tap-spark/);
  assert.match(css, /\.deep-dive-card/);
  assert.match(css, /\.deep-module-button/);
  assert.match(css, /\.deep-signal-flow/);
});

test('audio-space script includes layered signal particles and pointer-reactive rings', () => {
  const js = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');

  assert.match(js, /signalParticles/);
  assert.match(js, /transitionBursts/);
  assert.match(js, /drawSignalParticles/);
  assert.match(js, /drawTransitionParticles/);
  assert.match(js, /synth:view-transition/);
  assert.match(js, /drawRippleField/);
  assert.match(js, /pointer\.screenX/);
  assert.match(js, /mouseInfluence/);
});

test('range controls use smooth drag state and animation-frame chrome updates', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(appJs, /scheduleRangeChromeUpdate/);
  assert.match(appJs, /requestAnimationFrame/);
  assert.match(appJs, /bindSmoothRangeInput/);
  assert.match(appJs, /is-dragging/);
  assert.match(css, /@property --range-value/);
  assert.match(css, /\.range-shell\.is-dragging/);
  assert.match(css, /cursor:\s*grabbing/);
});

test('visual shell uses a brighter premium glass tone and view transition motion', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /--bg:\s*#172735/);
  assert.doesNotMatch(css, /--bg:\s*#050910/);
  assert.match(css, /\.content\.is-view-switching/);
  assert.match(css, /@keyframes view-soft-swap/);
  assert.match(appJs, /synth:view-transition/);
  assert.match(appJs, /is-view-switching/);
});

test('v2 shell exposes the Sound Lab workbench and AudioWorklet path', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const audioPlayerJs = readFileSync(new URL('../src/audio-player.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(html, /data-view="soundlab"/);
  assert.match(appJs, /renderSoundLabView/);
  assert.match(appJs, /data-sound-lab-play/);
  assert.match(appJs, /data-sound-lab-control/);
  assert.match(audioPlayerJs, /AudioWorklet/);
  assert.match(audioPlayerJs, /sound-lab-processor\.js/);
  assert.match(css, /\.sound-lab-workbench/);
  assert.match(css, /\.macro-knob/);
  assert.match(css, /\.spectrum-stage/);
});

test('mobile navigation uses a compact horizontal rail instead of a full-height wall', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.tabs[\s\S]*grid-auto-flow:\s*column/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*overflow-x:\s*auto/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*scroll-snap-type:\s*x/);
});

test('integration view exposes browser-native sound quality and control hooks', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /renderIntegrationsView/);
  assert.match(appJs, /data-integration-action="midi"/);
  assert.match(appJs, /requestMIDIAccess/);
  assert.match(appJs, /data-integration-action="copy-patch"/);
  assert.match(appJs, /data-integration-action="copy-reaper"/);
});

test('audio player includes transient and master dynamics stages for better web sound quality', () => {
  const audioPlayerJs = readFileSync(new URL('../src/audio-player.js', import.meta.url), 'utf8');

  assert.match(audioPlayerJs, /createDynamicsCompressor/);
  assert.match(audioPlayerJs, /scheduleTransientClick/);
  assert.match(audioPlayerJs, /patch\.transient/);
});

test('dashboard has product-design control console and learning flow shell', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(appJs, /dashboard-hero/);
  assert.match(appJs, /今日练习控制台/);
  assert.match(appJs, /learning-flow/);
  assert.match(appJs, /质量守门/);
  assert.match(appJs, /data-dashboard-view/);
  assert.match(css, /\.dashboard-hero/);
  assert.match(css, /\.learning-flow/);
  assert.match(css, /\.signal-node/);
  assert.match(css, /\.quality-panel/);
});

test('navigation includes compact numbered labels for dense product UI', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(html, /class="nav-index"/);
  assert.match(html, /class="nav-label"/);
  assert.match(css, /\.nav-index/);
  assert.match(css, /\.nav-label/);
});

test('interaction effects add pointer and keyboard tactile feedback hooks', () => {
  const js = readFileSync(new URL('../src/interaction-effects.js', import.meta.url), 'utf8');

  assert.match(js, /pointerdown/);
  assert.match(js, /keydown/);
  assert.match(js, /tap-spark/);
  assert.match(js, /prefers-reduced-motion/);
});


test('sound lab app wires preset DNA, quality mode, and layer mixer interactions', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /activeSoundPresetDnaId/);
  assert.match(appJs, /soundLabQualityMode/);
  assert.match(appJs, /soundLabLayerMix/);
  assert.match(appJs, /data-sound-lab-dna/);
  assert.match(appJs, /data-sound-lab-quality/);
  assert.match(appJs, /data-sound-lab-layer/);
  assert.match(appJs, /presetDna.macroHints/);
});

test('app wires community creator technique labs into navigation and Sound Lab loading', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(appJs, /communityTechniqueLabs/);
  assert.match(appJs, /activeCommunityTechniqueId/);
  assert.match(appJs, /data-community-technique/);
  assert.match(appJs, /data-community-control/);
  assert.match(appJs, /data-community-load-soundlab/);
  assert.match(appJs, /soundLabRecipe/);
  assert.match(indexHtml, /data-view="community"/);
});

test('styles include community technique interactive controls', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.community-lab-shell/);
  assert.match(css, /\.community-technique-card/);
  assert.match(css, /\.community-control-panel/);
  assert.match(css, /\.creator-source-pill/);
});

test('sound lab processor renders layered engines with global soft limiter', () => {
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');

  assert.match(processorJs, /renderLayer/);
  assert.match(processorJs, /sampleGrain/);
  assert.match(processorJs, /modalResonator/);
  assert.match(processorJs, /combDelay/);
  assert.match(processorJs, /globalFx/);
  assert.match(processorJs, /softLimiter/);
});

test('audio player fallback schedules layered sound lab patches when AudioWorklet is unavailable', () => {
  const audioPlayerJs = readFileSync(new URL('../src/audio-player.js', import.meta.url), 'utf8');

  assert.match(audioPlayerJs, /scheduleLayeredSoundLabFallback/);
  assert.match(audioPlayerJs, /patch.layers/);
  assert.match(audioPlayerJs, /layer.engine/);
  assert.match(audioPlayerJs, /modalResonator/);
  assert.match(audioPlayerJs, /combDelay/);
});

test('styles include preset DNA cards, quality buttons, and layer mixer feedback', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /.sound-lab-dna-panel/);
  assert.match(css, /.dna-card/);
  assert.match(css, /.quality-mode-button/);
  assert.match(css, /.layer-mixer-panel/);
  assert.match(css, /.sound-lab-source-drawer/);
});

test('sound lab app wires HQ Tone engine controls with native fallback telemetry', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const audioPlayerJs = readFileSync(new URL('../src/audio-player.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /vendor\/tone\/Tone\.js/);
  assert.match(audioPlayerJs, /loadToneRuntime/);
  assert.match(audioPlayerJs, /playToneSoundLabPatch/);
  assert.match(audioPlayerJs, /engineUsed/);
  assert.match(audioPlayerJs, /fallbackChain/);
  assert.match(appJs, /soundLabEngineMode/);
  assert.match(appJs, /soundLabPerformance/);
  assert.match(appJs, /data-sound-lab-engine/);
  assert.match(appJs, /data-performance-control/);
  assert.match(appJs, /data-sound-lab-key/);
});

test('native sound lab processor includes virtual analog oscillators, stereo FX, and safer limiting', () => {
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');

  assert.match(processorJs, /polyBlep/);
  assert.match(processorJs, /renderVirtualAnalogOscillator/);
  assert.match(processorJs, /renderAllpassSpace/);
  assert.match(processorJs, /colorNoise/);
  assert.match(processorJs, /dcBlock/);
  assert.match(processorJs, /onePole/);
});
