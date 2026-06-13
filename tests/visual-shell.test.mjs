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

test('sound lab professional controls stay contained and use readable light surfaces', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.mod-matrix-row[\s\S]*grid-template-columns:\s*minmax\(0,\s*0\.82fr\)\s+16px\s+minmax\(0,\s*1fr\)/);
  assert.match(css, /\.mod-matrix-row[\s\S]*min-width:\s*0/);
  assert.match(css, /\.mod-matrix-row\s*>\s*span[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(css, /\.professional-module-panel[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(255,\s*255,\s*255,\s*0\.98\)/);
  assert.match(css, /\.professional-module-panel[\s\S]*color:\s*#203442/);
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

test('visual shell uses a brighter premium glass tone and view transition motion', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /--bg:\s*#f4f7fb/);
  assert.doesNotMatch(css, /--bg:\s*#050910/);
  assert.match(css, /\.content\.is-view-switching/);
  assert.match(css, /@keyframes view-soft-swap/);
  assert.match(appJs, /synth:view-transition/);
  assert.match(appJs, /is-view-switching/);
});

test('view switching keeps content below the sticky toolbar', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /scrollTo\(\{\s*top:\s*0,\s*behavior:\s*'auto'\s*\}\)/);
  assert.doesNotMatch(appJs, /getBoundingClientRect\(\)\.top \+ globalThis\.scrollY/);
});

test('styles include the light synth workstation layout from the reference image', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /color-scheme:\s*light/);
  assert.match(css, /--surface:\s*#ffffff/);
  assert.match(css, /--accent:\s*#17a7a3/);
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

test('dashboard overview uses readable light workstation panels instead of dark washed text', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.dashboard-hero\s*\{[\s\S]*background:[\s\S]*rgba\(255,\s*255,\s*255,\s*0\.88\)/);
  assert.match(css, /\.hero-copy p\s*\{[\s\S]*color:\s*#4f6476/);
  assert.match(css, /\.quality-panel\s*\{[\s\S]*background:[\s\S]*rgba\(255,\s*255,\s*255,\s*0\.92\)/);
  assert.match(css, /\.metric-row strong\s*\{[\s\S]*color:\s*#243846/);
  assert.match(css, /\.learning-flow\s*\{[\s\S]*background:[\s\S]*rgba\(255,\s*255,\s*255,\s*0\.88\)/);
  assert.match(css, /\.signal-node\s*\{[\s\S]*background:\s*#fbfdff/);
  assert.match(css, /\.signal-node p\s*\{[\s\S]*color:\s*#536879/);
});

test('interactive course controls keep light readable surfaces and explicit click hit areas', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.lab-select-button,[\s\S]*\.preset-button\s*\{[\s\S]*background:\s*#ffffff/);
  assert.match(css, /\.lab-select-button,[\s\S]*\.preset-button\s*\{[\s\S]*pointer-events:\s*auto/);
  assert.match(css, /\.lab-select-button\.is-active\s*\{[\s\S]*color:\s*#0d7774/);
  assert.match(css, /\.interactive-lab-card\s*\{[\s\S]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.92\)/);
  assert.match(css, /\.lab-goal\s*\{[\s\S]*color:\s*#385064/);
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
  assert.match(css, /\.dashboard-actions \.primary-button\s*\{[\s\S]*background:\s*linear-gradient\(180deg,\s*#17a7a3/);
  assert.match(css, /\.dashboard-actions \.primary-button\s*\{[\s\S]*color:\s*#ffffff/);
  assert.match(css, /\.dashboard-actions \.secondary-button\s*\{[\s\S]*background:\s*#ffffff/);
  assert.match(css, /\.dashboard-actions \.secondary-button\s*\{[\s\S]*color:\s*#243846/);
  assert.match(css, /\.dashboard-actions button\s*\{[\s\S]*pointer-events:\s*auto/);
  assert.match(css, /\.dashboard-actions button\s*\{[\s\S]*min-height:\s*58px/);
  assert.match(css, /\.dashboard-actions button em\s*\{/);
});

test('sound lab exposes a guided workflow map and real material family switching', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

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
  assert.match(appJs, /activeAdvancedModule:\s*'advanced'/);
  assert.match(css, /\.control-bottom-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(250px,\s*0\.44fr\)/);
  assert.match(css, /\.material-selector-grid\s*\{[\s\S]*grid-column:\s*1\s*\/\s*-1/);
  assert.match(css, /\.material-token-row\s*\{[\s\S]*repeat\(auto-fit,\s*minmax\(74px,\s*1fr\)\)/);
  assert.match(css, /\.workflow-context-strip\s*\{[\s\S]*grid-column:\s*1\s*\/\s*-1/);
  assert.match(css, /\.material-workflow-hint\s*\{[\s\S]*background:\s*linear-gradient/);
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
  assert.match(css, /\.segmented-mini button\.is-active\s*\{[\s\S]*background:\s*#ffffff/);
  assert.match(css, /\.advanced-module-pill\.is-active\s*\{[\s\S]*border-color:\s*rgba\(23,\s*167,\s*163/);
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
  assert.match(css, /\.workbench-zone-title strong\s*\{[\s\S]*color:\s*#203442/);
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
