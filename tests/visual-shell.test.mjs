import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('document shell includes premium audio-space background layers', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /class="audio-space"/);
  assert.match(html, /id="particle-canvas"/);
  assert.match(html, /class="signal-field"/);
  assert.doesNotMatch(html, /rel="preload"\s+href="\.\/vendor\/tone\/Tone\.js"/);
  assert.match(html, /rel="prefetch"\s+href="\.\/vendor\/tone\/Tone\.js"/);
  assert.match(html, /rel="icon"/);
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

test('continuous Sound Lab controls avoid whole-page rerender flashes', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const interactionJs = readFileSync(new URL('../src/interaction-effects.js', import.meta.url), 'utf8');

  const finishRangeBlock = appJs.match(/function finishSmoothRangeInput[\s\S]*?\r?\n}\r?\n\r?\nfunction bindSmoothRangeInput/)?.[0] ?? '';
  const bindRangeBlock = appJs.match(/function bindSmoothRangeInput[\s\S]*?\r?\n}\r?\n\r?\nfunction getActiveLab/)?.[0] ?? '';

  assert.ok(finishRangeBlock, 'finishSmoothRangeInput should remain an explicit range commit boundary');
  assert.ok(bindRangeBlock, 'bindSmoothRangeInput should remain the shared range binding');
  assert.doesNotMatch(finishRangeBlock, /render\(/, 'range commit must not rebuild the whole app');
  assert.doesNotMatch(bindRangeBlock, /scheduleRangeCommitRender/, 'input updates should stay local while dragging or typing');
  assert.doesNotMatch(css, /\.content > \*\s*\{[\s\S]*animation:\s*v3-panel-in/, 'default content children should not animate on every rerender');
  assert.match(css, /\.content\.is-view-switching > \*\s*\{[\s\S]*animation:\s*v3-panel-in/, 'view transitions should keep a scoped soft entrance');
  assert.match(interactionJs, /isContinuousControl/, 'tactile effects should skip continuous controls such as range sliders and XY pads');
});

test('tactile effects stay element-scoped and cannot flash the whole viewport', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const interactionJs = readFileSync(new URL('../src/interaction-effects.js', import.meta.url), 'utf8');
  const tapSparkBlock = css.match(/\.tap-spark\s*\{[^}]*\}/)?.[0] ?? '';

  assert.doesNotMatch(interactionJs, /document\.body\.append\(spark\)/, 'click feedback must not create fixed body-level flashes');
  assert.match(interactionJs, /target\.append\(spark\)/, 'click feedback should render inside the pressed element');
  assert.match(interactionJs, /if\s*\(isContinuousControl\(event,\s*target\)\)\s*return/, 'continuous controls should not run global tactile feedback');
  assert.match(tapSparkBlock, /position:\s*absolute/, 'tap spark should be clipped by its host element');
  assert.doesNotMatch(tapSparkBlock, /position:\s*fixed/, 'tap spark must not sit on the viewport layer');
});

test('sound lab professional controls stay contained and use premium dark surfaces', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.mod-matrix-row[\s\S]*grid-template-columns:\s*minmax\(0,\s*0\.82fr\)\s+16px\s+minmax\(0,\s*1fr\)/);
  assert.match(css, /\.mod-matrix-row[\s\S]*min-width:\s*0/);
  assert.match(css, /\.mod-matrix-row\s*>\s*span[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(css, /\.professional-module-panel,[\s\S]*\.panel-heading-row\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.78\)/);
  assert.match(css, /\.professional-module-panel strong,[\s\S]*\.panel-heading-row h4\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /\.mini-quality-knob[\s\S]*grid-template-columns:\s*52px\s+minmax\(0,\s*1fr\)/);
});

test('sound lab controls expose larger touch targets and immediate tactile feedback hooks', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(appJs, /applyImmediateControlFeedback/);
  assert.match(appJs, /data-live-value/);
  assert.match(appJs, /syncSoundLabPatchSoon/);
  assert.match(css, /\.fx-chain-slot button[\s\S]*min-width:\s*34px/);
  assert.match(css, /\.library-sync-grid button[\s\S]*min-height:\s*38px/);
  assert.match(css, /\.sound-lab-key[\s\S]*min-width:\s*34px/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.sound-lab-keyboard\s*\{[\s\S]*overflow-x:\s*auto/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.sound-lab-key\s*\{[\s\S]*min-width:\s*42px/);
  assert.match(css, /\.xy-handle[\s\S]*width:\s*34px/);
  assert.match(css, /touch-action:\s*none/);
});

test('visual shell uses a premium dark glass tone and view transition motion', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /--bg:\s*#080A12/);
  assert.match(css, /--surface:\s*#10131F/);
  assert.doesNotMatch(css, /--bg:\s*#050910/);
  assert.match(css, /\.content\.is-view-switching/);
  assert.match(css, /@keyframes view-soft-swap/);
  assert.match(appJs, /synth:view-transition/);
  assert.match(appJs, /is-view-switching/);
});

test('v3 premium dark visual system defines high-contrast audio tech tokens', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /Premium dark visual system v3/);
  assert.match(css, /--v3-bg:\s*#080A12/);
  assert.match(css, /--v3-bg-2:\s*#0B0F1A/);
  assert.match(css, /--v3-text:\s*#F4F7FB/);
  assert.match(css, /--v3-body:\s*#AEB7C6/);
  assert.match(css, /--v3-dim:\s*#6F7A8C/);
  assert.match(css, /--v3-cyan:\s*#6EE7F9/);
  assert.match(css, /--v3-blue:\s*#7C8CFF/);
  assert.match(css, /--v3-violet:\s*#A78BFA/);
  assert.match(css, /--v3-mint:\s*#5EEAD4/);
  assert.match(css, /body\s*\{[\s\S]*linear-gradient\(145deg,\s*#080A12/);
  assert.match(css, /\.audio-space\s*\{[\s\S]*rgba\(174,\s*183,\s*198,\s*0\.055\)/);
});

test('v3 dark cards and dense learning modules avoid gray-on-gray text', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.card,[\s\S]*\.synth-workbench-layout\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.82\)/);
  assert.match(css, /\.card p,[\s\S]*\.daily-video-url,[\s\S]*\.field span\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.technique-chain li,[\s\S]*\.technique-validation-grid > div,[\s\S]*\.deep-analysis-grid > div,[\s\S]*\.deep-practice-stage,[\s\S]*\.sound-lab-meter-grid > div[\s\S]*background:[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.76\)/);
  assert.match(css, /\.signal-node strong,[\s\S]*\.technique-validation-grid h5,[\s\S]*\.deep-analysis-grid h4[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /\.signal-node p,[\s\S]*\.technique-validation-grid li,[\s\S]*\.notice\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.dashboard-launchpad\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.78\)/);
  assert.match(css, /\.dashboard-action-label small,[\s\S]*\.quality-panel \.metric-row p,[\s\S]*\.metric-row span\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
});

test('v3 contrast pass removes light Sound Lab remnants and clarifies deep analysis text', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /Premium dark visual system v3\.1 contrast pass/);
  assert.match(css, /\.deep-dive-card,[\s\S]*\.deep-practice-stage\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.84\)/);
  assert.match(css, /\.deep-dive-heading p,[\s\S]*\.deep-diagnostic-list li\s*\{[\s\S]*color:\s*#B8C3D2/);
  assert.match(css, /\.sound-family-rail \.material-select-button,[\s\S]*\.compare-tab,[\s\S]*\.workbench-feedback\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.82\)/);
  assert.match(css, /\.compare-tab\s*\{[\s\S]*font-weight:\s*850/);
  assert.match(css, /\.workbench-command-actions button small,[\s\S]*\.workbench-state-strip span\s*\{[\s\S]*color:\s*#AEB7C6/);
  assert.match(css, /\.workflow-step span,[\s\S]*\.workbench-feedback span\s*\{[\s\S]*rgba\(110,\s*231,\s*249,\s*0\.12\)/);
  assert.match(css, /\.workbench-command-actions \.command-play-button,[\s\S]*\.sound-lab-play-button\s*\{[\s\S]*rgba\(94,\s*234,\s*212,\s*0\.94\)/);
});

test('v3 background particles use restrained cyan violet and mint colors', () => {
  const js = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');

  assert.match(js, /110,\s*231,\s*249/);
  assert.match(js, /167,\s*139,\s*250/);
  assert.match(js, /94,\s*234,\s*212/);
  assert.doesNotMatch(js, /201,\s*231,\s*139/);
});

test('view routing supports direct hash links for module QA and sharing', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /const VIEW_IDS = new Set\(\[/);
  assert.match(appJs, /function getViewFromHash\(\)/);
  assert.match(appJs, /view:\s*getViewFromHash\(\)/);
  assert.match(appJs, /globalThis\.addEventListener\('hashchange'/);
  assert.match(appJs, /history\.replaceState\(null,\s*'',\s*`\$\{globalThis\.location\.pathname\}\$\{globalThis\.location\.search\}\$\{nextHash\}`\)/);
  assert.match(appJs, /VIEW_IDS\.has\(nextView\)/);
});

test('view switching keeps content below the sticky toolbar', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /scrollTo\(\{\s*top:\s*0,\s*behavior:\s*'auto'\s*\}\)/);
  assert.doesNotMatch(appJs, /getBoundingClientRect\(\)\.top \+ globalThis\.scrollY/);
});

test('styles include the premium dark synth workstation layout from the reference image', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /color-scheme:\s*dark/);
  assert.match(css, /--v3-bg:\s*#080A12/);
  assert.match(css, /--surface:\s*#10131F/);
  assert.match(css, /--accent:\s*#6EE7F9/);
  assert.match(css, /\.synth-workbench-layout/);
  assert.match(css, /\.workbench-main-grid/);
  assert.match(css, /\.workbench-right-rail/);
  assert.match(css, /\.workbench-module-tabs/);
  assert.match(css, /\.output-meter-strip/);
  assert.match(css, /\.source-inspector-panel/);
  assert.match(css, /\.route-progress-panel/);
  assert.match(css, /\.quick-entry-panel/);
  assert.match(css, /\.sidebar-progress-card/);
  assert.match(css, /\.daily-suggestion-card/);
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

test('mobile navigation exposes all page buttons without a horizontal scroll trap', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.sidebar \.tabs\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.sidebar \.tabs\s*\{[\s\S]*grid-auto-flow:\s*row/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.sidebar \.tabs\s*\{[\s\S]*overflow-x:\s*visible/);
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
  assert.match(appJs, /data-dashboard-primary-view="soundlab"/);
  assert.match(appJs, /data-dashboard-flow-view="\$\{escapeHtml\(node\.view\)\}"/);
  assert.match(appJs, /dashboardPrimaryView/);
  assert.match(appJs, /dashboardFlowView/);
  assert.doesNotMatch(appJs, /data-dashboard-view=/);
  assert.match(css, /\.dashboard-hero/);
  assert.match(css, /\.learning-flow/);
  assert.match(css, /\.signal-node/);
  assert.match(css, /\.quality-panel/);
  assert.match(css, /\.dashboard-action-label/);
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

test('sound lab app preserves workstation module tab state across rerenders', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');

  assert.match(appJs, /activeWorkbenchModule/);
  assert.match(appJs, /data-module-tab/);
  assert.match(renderJs, /activeWorkbenchModule/);
});

test('app wires community creator technique labs into navigation and Sound Lab loading', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(appJs, /communityTechniqueLabs/);
  assert.match(appJs, /activeCommunityTechniqueId/);
  assert.match(appJs, /data-community-technique/);
  assert.match(appJs, /data-community-control/);
  assert.match(appJs, /data-community-focus-preset/);
  assert.match(appJs, /getCommunityFocusPresets/);
  assert.match(appJs, /data-community-load-soundlab/);
  assert.match(appJs, /soundLabRecipe/);
  assert.match(appJs, /'interval'/);
  assert.match(appJs, /'cleanup'/);
  assert.match(renderJs, /renderCommunityBlueprint/);
  assert.match(renderJs, /data-community-focus-preset/);
  assert.match(indexHtml, /data-view="community"/);
});

test('styles include community technique interactive controls', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.community-lab-shell/);
  assert.match(css, /\.community-technique-card/);
  assert.match(css, /\.community-control-panel/);
  assert.match(css, /\.community-blueprint-panel/);
  assert.match(css, /\.community-focus-presets/);
  assert.match(css, /\.creator-source-pill/);
});

test('community technique blueprint stays readable on narrow screens', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.community-blueprint-row\s*\{[\s\S]*grid-template-columns:\s*28px\s+minmax\(0,\s*1fr\)/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.community-blueprint-row strong,[\s\S]*\.community-blueprint-row b,[\s\S]*\.community-blueprint-row small\s*\{[\s\S]*white-space:\s*normal/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*\.community-focus-presets\s*\{[\s\S]*grid-template-columns:\s*1fr/);
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

test('native sound lab processor renders unison voices with analog drift and stereo spread', () => {
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');

  assert.match(processorJs, /renderUnisonOscillator/);
  assert.match(processorJs, /voicePhases/);
  assert.match(processorJs, /voiceTri/);
  assert.match(processorJs, /analogDrift/);
  assert.match(processorJs, /stereoSpread/);
  assert.match(processorJs, /layer\.unison/);
});

test('sound lab app wires advanced controls and live analyzer drawing', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const audioPlayerJs = readFileSync(new URL('../src/audio-player.js', import.meta.url), 'utf8');

  assert.match(appJs, /data-mod-route-amount/);
  assert.match(appJs, /data-fx-move/);
  assert.match(appJs, /data-xy-pad/);
  assert.match(appJs, /data-macro-morph/);
  assert.match(appJs, /data-git-sync-action/);
  assert.match(appJs, /drawSoundLabAnalyserFrame/);
  assert.match(audioPlayerJs, /onAnalyserFrame/);
  assert.match(audioPlayerJs, /getByteFrequencyData/);
  assert.match(audioPlayerJs, /getByteTimeDomainData/);
});

test('sound lab envelope sliders stay inside their panel and keep real pointer targets', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.envelope-panel\s*\{[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.vertical-slider-stack\s*\{[\s\S]*grid-template-columns:\s*repeat\(4,\s*minmax\(56px,\s*1fr\)\)/);
  assert.match(css, /\.vertical-slider\s*\{[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.vertical-slider input\s*\{[\s\S]*writing-mode:\s*vertical-lr/);
  assert.match(css, /\.vertical-slider input\s*\{[\s\S]*touch-action:\s*none/);
  assert.doesNotMatch(css, /\.vertical-slider input\s*\{[\s\S]*transform:\s*rotate\(-90deg\)/);
});

test('dashboard overview uses readable premium dark workstation panels', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.dashboard-hero\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.88\)/);
  assert.match(css, /\.view-header p\s*\{[\s\S]*color:\s*#C3CDDB/);
  assert.match(css, /\.quality-panel,[\s\S]*\.learning-flow,[\s\S]*\.daily-video-card,[\s\S]*\.synth-workbench-layout\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.82\)/);
  assert.match(css, /\.metric-row strong,[\s\S]*\.daily-sync-stats strong\s*\{[\s\S]*color:\s*var\(--v3-cyan\)/);
  assert.match(css, /\.signal-node,[\s\S]*\.sound-lab-meter-grid\s*>\s*div,[\s\S]*\.integration-status-grid\s*>\s*div\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.76\)/);
  assert.match(css, /\.signal-node p,[\s\S]*\.notice\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
});

test('interactive course controls keep dark readable surfaces and explicit click hit areas', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.lab-select-button,[\s\S]*\.preset-button,[\s\S]*\.sound-preset-card\s*\{[\s\S]*background:\s*rgba\(18,\s*24,\s*38,\s*0\.58\)/);
  assert.match(css, /\.lab-select-button,[\s\S]*\.preset-button\s*\{[\s\S]*pointer-events:\s*auto/);
  assert.match(css, /\.lab-select-button\.is-active,[\s\S]*\.dna-card\.is-active\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /\.interactive-lab-card,[\s\S]*\.daily-video-card,[\s\S]*\.synth-workbench-layout\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.82\)/);
  assert.match(css, /\.macro-button,[\s\S]*\.lab-control,[\s\S]*\.panel-heading-row\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.audition-button\s*\{[\s\S]*pointer-events:\s*auto/);
});

test('app maps vertical envelope pointer movement to real Sound Lab parameter updates', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /function updateVerticalRangeFromPointer/);
  assert.match(appJs, /closest\('\.vertical-slider'\)/);
  assert.match(appJs, /rect\.bottom - event\.clientY/);
  assert.match(appJs, /setPointerCapture/);
  assert.match(appJs, /querySelector\('output, strong'\)/);
});

test('dashboard CTA buttons use clear high-contrast clickable states', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /进入可试听工作台/);
  assert.match(appJs, /先练波形 \/ ADSR \/ FM/);
  assert.match(appJs, /主入口/);
  assert.match(css, /\.primary-button,[\s\S]*\.dashboard-actions \.primary-button,[\s\S]*\.launchpad-button\.is-primary\s*\{[\s\S]*rgba\(110,\s*231,\s*249,\s*0\.96\)/);
  assert.match(css, /\.primary-button,[\s\S]*\.dashboard-actions \.primary-button,[\s\S]*\.launchpad-button\.is-primary\s*\{[\s\S]*color:\s*#061018/);
  assert.match(css, /\.secondary-button,[\s\S]*\.dashboard-actions \.secondary-button,[\s\S]*\.sound-preset-card\s*\{[\s\S]*background:\s*rgba\(18,\s*24,\s*38,\s*0\.58\)/);
  assert.match(css, /\.secondary-button,[\s\S]*\.dashboard-actions \.secondary-button,[\s\S]*\.sound-preset-card\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.dashboard-actions button\s*\{[\s\S]*pointer-events:\s*auto/);
  assert.match(css, /\.dashboard-actions button\s*\{[\s\S]*min-height:\s*58px/);
  assert.match(css, /\.dashboard-actions button em\s*\{/);
});

test('daily tutorial feed is wired into navigation, app routing, and styles', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(html, /data-view="daily"/);
  assert.match(html, /每日新教程/);
  assert.match(appJs, /dailyVideoFeed/);
  assert.match(appJs, /renderDailyVideosView/);
  assert.match(appJs, /daily:\s*renderDailyVideosView/);
  assert.match(appJs, /data-daily-filter/);
  assert.match(appJs, /data-daily-video-action/);
  assert.match(renderJs, /renderDailyVideoCard/);
  assert.match(renderJs, /daily-video-card/);
  assert.match(css, /\.daily-video-shell/);
  assert.match(css, /\.daily-video-grid/);
  assert.match(css, /\.daily-video-card/);
  assert.match(css, /\.daily-sync-panel/);
});

test('daily tutorial sync workflow can refresh data and publish the gh-pages branch', () => {
  const workflow = readFileSync(new URL('../.github/workflows/daily-video-sync.yml', import.meta.url), 'utf8');
  const script = readFileSync(new URL('../scripts/update-video-feed.mjs', import.meta.url), 'utf8');

  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /yt-dlp/);
  assert.match(workflow, /node scripts\/update-video-feed\.mjs/);
  assert.match(workflow, /git push origin main/);
  assert.match(workflow, /git push origin (HEAD:)?gh-pages/);
  assert.match(workflow, /data\/daily-video-feed\.json/);
  assert.match(script, /YOUTUBE_API_KEY/);
  assert.match(script, /buildYtDlpSearchUrl/);
  assert.match(script, /ytsearch\$\{safeLimit\}/);
  assert.doesNotMatch(script, /ytsearchdate/);
  assert.match(script, /bilibili/);
  assert.match(script, /serializeFeedModule/);
});

test('source cards keep tags and source links readable on dark panels', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.card\s+\.badge/);
  assert.match(css, /\.source-card\s+\.source-link/);
  assert.match(css, /\.source-card h3,[\s\S]*\.daily-video-card h3\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /\.source-card p,[\s\S]*\.notice\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.source-card \.source-link,[\s\S]*\.daily-video-url a\s*\{[\s\S]*color:\s*var\(--v3-cyan\)/);
});

test('technique cards keep nested chains and validation panels readable on dark surfaces', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.card\s+\.badge/);
  assert.match(css, /\.technique-chain\s+li/);
  assert.match(css, /\.technique-validation-grid\s*>\s*div/);
  assert.match(css, /\.technique-chain strong,[\s\S]*\.source-card h3,[\s\S]*\.daily-video-card h3\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /\.technique-chain li,[\s\S]*\.notice\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.technique-validation\s*\{[\s\S]*background:\s*rgba\(8,\s*10,\s*18,\s*0\.18\)/);
  assert.match(css, /\.technique-chain li::before,[\s\S]*\.deep-signal-flow li > span\s*\{[\s\S]*color:\s*var\(--v3-cyan\)/);
});

test('dark theme shared cards and practice buttons avoid washed text', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /color-scheme:\s*dark/);
  assert.match(css, /--surface:\s*#10131F/);
  assert.match(css, /\.card,[\s\S]*\.daily-video-card,[\s\S]*\.synth-workbench-layout\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /\.secondary-button,[\s\S]*\.sound-preset-card\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.signal-node,[\s\S]*\.sound-lab-meter-grid\s*>\s*div,[\s\S]*\.integration-status-grid\s*>\s*div\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.daily-sync-panel,[\s\S]*\.daily-sync-stats div,[\s\S]*\.daily-suggestion-card,[\s\S]*\.integration-status-grid\s*>\s*div\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.82\)/);
  assert.match(css, /\.source-card p,[\s\S]*\.notice\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.doesNotMatch(css, /color-scheme:\s*light/);
});

test('dark theme neutralizes nested legacy light modules across every route', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /Premium dark visual system v3\.4 nested legacy neutralizer/);
  assert.match(css, /\.research-metrics div,[\s\S]*\.lab-goal,[\s\S]*\.challenge-select-button,[\s\S]*\.challenge-answer-button,[\s\S]*\.sound-lab-engine-panel,[\s\S]*\.coach-explain,[\s\S]*\.community-lab-button,[\s\S]*\.community-control,[\s\S]*\.sidebar-progress-card button\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.84\)/);
  assert.match(css, /\.research-metrics strong,[\s\S]*\.community-mapping-grid strong,[\s\S]*\.sidebar-progress-card button\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /\.community-route-node span,[\s\S]*background:\s*rgba\(110,\s*231,\s*249,\s*0\.12\)/);
  assert.match(css, /\.community-practice-scene-grid span,[\s\S]*background:\s*rgba\(110,\s*231,\s*249,\s*0\.12\)/);
  assert.match(css, /\.module-priority-badge,[\s\S]*background:\s*rgba\(110,\s*231,\s*249,\s*0\.12\)/);
  assert.match(css, /Premium dark visual system v3\.5 route-wide readability clamp/);
  assert.match(css, /\.community-lab-button,[\s\S]*\.mini-quality-knob,[\s\S]*\.module-directory-card,[\s\S]*\.sidebar-progress-card button\s*\{[\s\S]*background-color:\s*rgba\(18,\s*24,\s*38,\s*0\.86\)/);
  assert.match(css, /\.brand-mark,[\s\S]*\.sidebar-progress-card strong,[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /\.usage-panel-head,[\s\S]*\.module-directory-group-head,[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /Premium dark visual system v3\.6 high-specificity legacy clamps/);
  assert.match(css, /\.synth-workbench-layout \.advanced-overview-grid > div,[\s\S]*\.synth-workbench-layout \.sound-lab-engine-panel,[\s\S]*\.technique-card \.technique-validation,[\s\S]*\.daily-suggestion-card button\s*\{[\s\S]*background-color:\s*rgba\(18,\s*24,\s*38,\s*0\.9\)/);
  assert.match(css, /\.interactive-lab-card \.lab-control output,[\s\S]*\.module-directory-card > span,[\s\S]*\.module-directory-card small\s*\{[\s\S]*color:\s*var\(--v3-cyan\)/);
  assert.match(css, /Premium dark visual system v3\.7 final state and importance cleanup/);
  assert.match(css, /\.synth-workbench-layout \.engine-mode-button\.is-active,[\s\S]*\.synth-workbench-layout \.quality-mode-button\.is-active\s*\{[\s\S]*background-color:\s*rgba\(18,\s*24,\s*38,\s*0\.92\)/);
  assert.match(css, /\.technique-card \.source-reliability,[\s\S]*\.community-technique-card \.source-reliability\s*\{[\s\S]*color:\s*#D9F99D !important/);
  assert.match(css, /Premium dark visual system v3\.8 final nested child cleanup/);
  assert.match(css, /\.synth-workbench-layout \.panel-heading-row > span,[\s\S]*\.synth-workbench-layout \.quick-entry-panel button,[\s\S]*\.synth-workbench-layout \.lab-control output\s*\{[\s\S]*color:\s*var\(--v3-cyan\)/);
  assert.match(css, /\.synth-workbench-layout \.coach-bottom-row > div strong,[\s\S]*\.community-blueprint-row b\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /Premium dark visual system v3\.9 range label contrast cleanup/);
  assert.match(css, /\.synth-workbench-layout \.lab-control\.layer-control > span,[\s\S]*\.synth-workbench-layout \.lab-control > span:first-child\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /Premium dark visual system v3\.10 coach microcopy cleanup/);
  assert.match(css, /\.synth-workbench-layout \.coach-listen span,[\s\S]*\.synth-workbench-layout \.coach-route-head span\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.synth-workbench-layout \.coach-node > span,[\s\S]*\.synth-workbench-layout \.coach-route-node > span\s*\{[\s\S]*color:\s*var\(--v3-cyan\)/);
  assert.match(css, /Premium dark visual system v3\.11 synth focus microcopy cleanup/);
  assert.match(css, /\.synth-workbench-layout \.coach-synth-focus strong\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /\.synth-workbench-layout \.coach-synth-focus span\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /Premium dark visual system v3\.12 coach grid legacy text cleanup/);
  assert.match(css, /\.synth-workbench-layout \.coach-synth-grid article strong\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /\.synth-workbench-layout \.coach-synth-grid li,[\s\S]*\.synth-workbench-layout \.coach-bottom-row span\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /Premium dark visual system v3\.13 footer and compare text cleanup/);
  assert.match(css, /\.synth-workbench-layout \.coach-synth-compare button span,[\s\S]*\.synth-workbench-layout \.quick-entry-panel \.mini-panel-head\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
});

test('professional information architecture separates primary and secondary modules', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(html, /class="nav-section"/);
  assert.match(html, /data-nav-group="workflow"/);
  assert.match(html, /data-nav-group="learning"/);
  assert.match(html, /data-nav-group="delivery"/);
  assert.match(html, /data-priority="primary"/);
  assert.match(html, /data-priority="secondary"/);

  assert.match(appJs, /dashboard-module-directory/);
  assert.match(appJs, /module-directory-card/);
  assert.match(appJs, /data-module-directory-view/);
  assert.match(appJs, /research-hub-shell/);
  assert.match(appJs, /research-command-panel/);
  assert.match(appJs, /source-result-toolbar/);
  assert.match(appJs, /sound-lab-secondary-section/);
  assert.match(appJs, /practice-reference-card/);
  assert.doesNotMatch(appJs, /style="margin-top:16px"/);

  assert.match(css, /--panel-soft:\s*rgba\(16,\s*19,\s*31,\s*0\.72\)/);
  assert.match(css, /\.nav-section/);
  assert.match(css, /\.dashboard-module-directory/);
  assert.match(css, /\.module-directory-card/);
  assert.match(css, /\.research-hub-shell/);
  assert.match(css, /\.source-result-toolbar/);
  assert.match(css, /\.sound-lab-secondary-section/);
  assert.match(css, /\.module-priority-badge/);
});

test('dashboard launchpad makes the first four actions visually obvious and touchable', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /dashboard-launchpad/);
  assert.match(appJs, /launchpad-button/);
  assert.match(appJs, /从这里开始/);
  assert.match(appJs, /data-dashboard-primary-view="soundlab"/);
  assert.match(appJs, /data-dashboard-primary-view="interactive"/);
  assert.match(css, /\.dashboard-launchpad\s*\{/);
  assert.match(css, /\.launchpad-button\s*\{[\s\S]*cursor:\s*pointer/);
  assert.match(css, /\.launchpad-button\s*\{[\s\S]*min-height:\s*74px/);
  assert.match(css, /\.launchpad-button:active\s*\{[\s\S]*transform:\s*translateY\(1px\)/);
  assert.match(css, /\.launchpad-button\.is-primary\s*\{[\s\S]*color:\s*#ffffff/);
  assert.match(css, /\.launchpad-button\.is-secondary\s*\{[\s\S]*color:\s*#213442/);
});

test('sound lab exposes a guided workflow map and real material family switching', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(appJs, /header\('Sound Lab'/);
  assert.match(appJs, /可试听合成器工作台/);
  assert.match(renderJs, /workbench-flow-map/);
  assert.match(renderJs, /workflow-context-strip/);
  assert.match(renderJs, /data-workflow-step/);
  assert.match(renderJs, /\['source',\s*'01'/);
  assert.match(renderJs, /data-workbench-family/);
  assert.match(renderJs, /\['metal-impact',\s*'金属'/);
  assert.match(renderJs, /material-current-brief/);
  assert.match(renderJs, /material-workflow-hint/);
  assert.match(appJs, /data-workbench-family/);
  assert.match(appJs, /selectSoundLabFamily/);
  assert.match(appJs, /已切换到 \$\{family\.titleZh\.split\('：'\)\[0\]\}：先听 dry 主体，再进入参数塑形。/);
  assert.match(appJs, /function selectSoundLabFamily[\s\S]*state\.activeWorkbenchModule = 'generator'/);
  assert.match(appJs, /activeAdvancedModule:\s*'advanced'/);
  assert.match(css, /\.control-bottom-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(250px,\s*0\.44fr\)/);
  assert.match(css, /\.material-selector-grid\s*\{[\s\S]*grid-column:\s*1\s*\/\s*-1/);
  assert.match(css, /\.material-token-row\s*\{[\s\S]*repeat\(auto-fit,\s*minmax\(74px,\s*1fr\)\)/);
  assert.match(css, /\.workflow-context-strip\s*\{[\s\S]*grid-column:\s*1\s*\/\s*-1/);
  assert.match(css, /\.material-workflow-hint\s*\{[\s\S]*background:\s*linear-gradient/);
});

test('sound lab keeps the primary workbench before secondary preset browsing', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.sound-family-rail\s*\{[\s\S]*order:\s*0/);
  assert.match(css, /\.sound-lab-shell \.synth-workbench-layout\s*\{[\s\S]*order:\s*1/);
  assert.match(css, /\.sound-lab-secondary-section\s*\{[\s\S]*order:\s*3/);
});

test('sound lab workstation utility controls have real stateful handlers', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /data-analyzer-mode/);
  assert.match(renderJs, /data-workflow-step/);
  assert.match(renderJs, /data-workbench-action="toggle-more"/);
  assert.match(renderJs, /data-active-advanced-panel/);
  assert.match(renderJs, /renderProfessionalControlGrid\(model,\s*options\.activeAdvancedModule\)/);
  assert.match(renderJs, /renderAdvancedOverviewPanel/);
  assert.match(appJs, /soundLabAnalyzerMode/);
  assert.match(appJs, /soundLabWorkflowStep/);
  assert.match(appJs, /activeAdvancedModule/);
  assert.match(appJs, /activeWorkbenchSynth/);
  assert.match(appJs, /handleWorkbenchStep/);
  assert.match(appJs, /data-synth-tab/);
  assert.match(appJs, /data-analyzer-mode/);
  assert.match(appJs, /data-advanced-module/);
  assert.match(appJs, /toggle-more/);
  assert.match(css, /\.workflow-step\s*\{[\s\S]*cursor:\s*pointer/);
  assert.match(css, /\.segmented-mini button\.is-active\s*\{[\s\S]*background:\s*rgba\(110,\s*231,\s*249,\s*0\.12\)/);
  assert.match(css, /\.advanced-module-pill\.is-active\s*\{[\s\S]*border-color:\s*rgba\(110,\s*231,\s*249/);
  assert.match(css, /\.professional-control-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test('sound lab workbench has a clear usage guide and section hierarchy', () => {
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /renderWorkbenchUsageGuide/);
  assert.match(renderJs, /workbench-usage-panel/);
  assert.match(renderJs, /renderWorkbenchModuleMap/);
  assert.match(renderJs, /workbench-module-map/);
  assert.match(renderJs, /data-workbench-module-jump/);
  assert.match(renderJs, /currentByAdvancedModule/);
  assert.match(renderJs, /focus-controls/);
  assert.match(renderJs, /focus-coach/);
  assert.match(renderJs, /workbench-zone-title/);
  assert.match(renderJs, /community-module-guide/);
  assert.match(renderJs, /community-synth-route-map/);
  assert.match(renderJs, /data-community-synth-route/);
  assert.match(renderJs, /community-practice-scenes/);
  assert.match(renderJs, /data-community-practice-scene/);
  assert.match(renderJs, /renderCommunityParameterTranslator/);
  assert.match(renderJs, /data-community-parameter-card/);
  assert.match(renderJs, /parameter-action-list/);
  assert.match(appJs, /focus-controls/);
  assert.match(appJs, /focus-coach/);
  assert.match(appJs, /data-workbench-module-jump/);
  assert.match(appJs, /handleWorkbenchModuleJump/);
  assert.match(appJs, /activeWorkbenchModuleMapId/);
  assert.match(appJs, /activeCommunitySynthRoute/);
  assert.match(appJs, /data-community-synth-route/);
  assert.match(appJs, /data-community-practice-scene/);
  assert.match(css, /\.workbench-usage-panel\s*\{[\s\S]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.workbench-module-map\s*\{/);
  assert.match(css, /\.module-map-card\s*\{[\s\S]*cursor:\s*pointer/);
  assert.match(css, /\.community-module-guide\s*\{/);
  assert.match(css, /\.community-synth-route-map\s*\{/);
  assert.match(css, /\.community-practice-scenes\s*\{/);
  assert.match(css, /\.community-parameter-translator\s*\{/);
  assert.match(css, /\.workbench-zone-title\s*\{[\s\S]*background:\s*linear-gradient/);
  assert.match(css, /\.workbench-zone-title strong\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
});

test('sound lab no longer depends on the historical light workstation renderer', () => {
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.doesNotMatch(renderJs, /function renderLightSoundLabWorkbench/);
  assert.doesNotMatch(renderJs, /return renderLightSoundLabWorkbench/);
  assert.doesNotMatch(renderJs, /return `\s*<article class="card sound-lab-workbench/);
  assert.match(renderJs, /class="usage-card"/);
  assert.match(css, /\.workbench-module-map,[\s\S]*\.workbench-usage-panel,[\s\S]*\.module-map-card,[\s\S]*\.usage-card,[\s\S]*\.video-source-row\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.84\)/);
  assert.match(css, /\.video-source-row p,[\s\S]*\.numbered-step-list li,[\s\S]*\.check-list li\s*\{[\s\S]*color:\s*#AEB7C6/);
  assert.match(css, /\.workbench-waveform-svg,[\s\S]*\.spectrum-canvas\s*\{[\s\S]*rgba\(8,\s*10,\s*18,\s*0\.86\)/);
  assert.match(css, /\.waveform-analyzer-canvas\s*\{[\s\S]*mix-blend-mode:\s*screen/);
});

test('sound lab has a command center with current task, next action, and click feedback', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /renderWorkbenchCommandCenter/);
  assert.match(renderJs, /workbench-command-center/);
  assert.match(renderJs, /workbench-command-actions/);
  assert.match(renderJs, /workbench-feedback/);
  assert.match(renderJs, /data-workflow-step="\$\{escapeHtml\(options\.activeWorkflowStep/);
  assert.match(renderJs, /data-sound-lab-play/);
  assert.match(renderJs, /data-workbench-action="focus-source"/);
  assert.match(renderJs, /data-workbench-action="focus-controls"/);
  assert.match(renderJs, /data-workbench-action="focus-coach"/);
  assert.match(renderJs, /data-workbench-action="focus-export"/);
  assert.match(appJs, /workbenchActionFeedback/);
  assert.match(appJs, /showWorkbenchActionFeedback/);
  assert.match(appJs, /handleWorkbenchAction/);
  assert.match(appJs, /workbenchActionFeedback:\s*state\.workbenchActionFeedback/);
  assert.match(css, /\.workbench-command-center\s*\{/);
  assert.match(css, /\.workbench-command-actions button\s*\{[\s\S]*cursor:\s*pointer/);
  assert.match(css, /\.workbench-command-actions button:active\s*\{[\s\S]*transform:\s*translateY\(1px\)/);
  assert.match(css, /\.workbench-feedback\s*\{[\s\S]*min-height:\s*34px/);
  assert.match(css, /\.synth-workbench-layout\[data-workflow-step="deliver"\] \.sound-lab-export\s*\{[\s\S]*display:\s*grid/);
});

test('workbench actions are routed through a guarded dispatcher instead of loose dead buttons', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /const WORKBENCH_ACTION_VIEW_TARGETS/);
  assert.match(appJs, /'open-reaper-template':\s*'practice'/);
  assert.match(appJs, /'open-library':\s*'integrations'/);
  assert.match(appJs, /'start-ab':\s*'challenges'/);
  assert.match(appJs, /const WORKBENCH_ACTION_MESSAGES/);
  assert.match(appJs, /function handleWorkbenchAction\(action,\s*button\)/);
  assert.match(appJs, /showWorkbenchActionFeedback\(WORKBENCH_ACTION_MESSAGES\[action\]/);
  assert.match(appJs, /if \(action === 'focus-coach'\)\s*\{[\s\S]*state\.activeAdvancedModule = 'mod-matrix'/);
  assert.match(appJs, /if \(action === 'focus-coach'\)\s*\{[\s\S]*state\.activeWorkbenchModule = 'modulation'/);
  assert.match(appJs, /未识别的工作台按钮/);
});

test('sound lab waveform detective is a routed beginner module, not a dead card', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /renderWaveformDetectivePanel/);
  assert.match(renderJs, /waveform-detective-panel/);
  assert.match(renderJs, /data-workbench-action="focus-waveform"/);
  assert.match(renderJs, /waveformFingerprint/);
  assert.match(appJs, /focus-waveform/);
  assert.match(appJs, /state\.activeAtlasNode = 'source'/);
  assert.match(appJs, /scrollSoundLabIntoView\('\.waveform-detective-panel'\)/);
  assert.match(css, /\.waveform-detective-panel\s*\{/);
  assert.match(css, /\.waveform-ingredient-card\s*\{[\s\S]*cursor:\s*default/);
  assert.match(css, /@media \(max-width: 880px\)[\s\S]*\.waveform-ingredient-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});

test('workflow step binding targets only step buttons so the article state attribute cannot reset clicks', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');

  assert.match(renderJs, /class="card sound-lab-workbench synth-workbench-layout/);
  assert.match(renderJs, /data-workflow-step="\$\{escapeHtml\(options\.activeWorkflowStep/);
  assert.match(appJs, /document\.querySelectorAll\('\.workflow-step\[data-workflow-step\]'\)/);
  assert.doesNotMatch(appJs, /document\.querySelectorAll\('\[data-workflow-step\]'\)/);
});

test('sound lab module coach is interactive and visually separated from the workbench controls', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(appJs, /synthModulationGuides/);
  assert.match(appJs, /activeSynthModGuideId/);
  assert.match(appJs, /applySynthModGuide/);
  assert.match(appJs, /data-mod-guide/);
  assert.match(appJs, /data-guide-load/);
  assert.match(appJs, /data-guide-preview/);
  assert.match(appJs, /modulationGuides:\s*synthModulationGuides/);
  assert.match(appJs, /activeModulationGuideId:\s*state\.activeSynthModGuideId/);
  assert.match(renderJs, /workbench-coach-panel/);
  assert.match(renderJs, /coach-route-panel/);
  assert.match(renderJs, /data-coach-synth/);
  assert.match(renderJs, /coach-synth-grid/);
  assert.match(renderJs, /data-guide-preview/);
  assert.match(css, /\.workbench-coach-panel\s*\{[\s\S]*background:\s*linear-gradient/);
  assert.match(css, /\.coach-synth-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(260px,\s*0\.58fr\)/);
});

test('signal atlas console fuses the primary lab with a guided signal path', () => {
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /signal-atlas-console/);
  assert.match(renderJs, /atlas-signal-ribbon/);
  assert.match(renderJs, /data-atlas-node/);
  assert.match(renderJs, /atlas-main-console/);
  assert.match(renderJs, /atlas-lab-stage/);
  assert.match(renderJs, /atlas-right-rail/);
  assert.match(renderJs, /atlas-command-dock/);
  assert.match(renderJs, /atlas-roadmap-strip/);
  assert.match(renderJs, /data-workbench-action="randomize-patch"/);
  assert.match(renderJs, /confirmedWorkbenchAction/);
  assert.match(renderJs, /atlas-goal-panel/);
  assert.match(renderJs, /atlas-theory-panel/);
  assert.match(renderJs, /atlas-push-button/);
  assert.match(renderJs, /LISTENING/);
  assert.match(renderJs, /SOUND LAB/);

  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(appJs, /randomize-patch/);
  assert.match(appJs, /randomizeSoundLabMacros/);
  assert.match(appJs, /confirmedWorkbenchAction/);
  assert.match(appJs, /workbenchConfirmTimer/);

  assert.match(css, /Signal Atlas Console v4/);
  assert.match(css, /Signal Atlas Console v4\.1 fidelity pass/);
  assert.match(css, /Signal Atlas Console v4\.4 Stitch inspector fusion/);
  assert.match(css, /\.atlas-goal-panel/);
  assert.match(css, /\.atlas-push-button/);
  assert.match(css, /\.signal-atlas-console\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(280px,\s*0\.34fr\)/);
  assert.match(css, /\.atlas-signal-ribbon\s*\{[\s\S]*display:\s*grid/);
  assert.match(css, /\.atlas-lab-stage\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(300px,\s*0\.72fr\)/);
  assert.match(css, /\.atlas-command-dock\s*\{[\s\S]*backdrop-filter:\s*blur\(24px\)/);
  assert.match(css, /@keyframes atlas-node-arrive/);
  assert.match(css, /@keyframes atlas-soft-pulse/);
  assert.match(css, /@keyframes atlas-confirm-pop/);
  assert.match(css, /transition:\s*transform 180ms cubic-bezier/);
});
