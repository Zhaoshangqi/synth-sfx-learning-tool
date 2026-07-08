import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('document shell includes premium audio-space background layers', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /class="audio-space"/);
  assert.match(html, /id="particle-canvas"/);
  assert.match(html, /class="signal-field"/);
  assert.doesNotMatch(html, /rel="preload"\s+href="\.\/vendor\/tone\/Tone\.js"/);
  assert.match(html, /rel="prefetch"\s+href="\.\/vendor\/tone\/Tone\.js"/);
  assert.match(html, /rel="icon"/);
  assert.match(html, /src="\.\/src\/visual-space\.js\?v=20260708-aether-mask"/);
  assert.match(html, /src="\.\/src\/interaction-effects\.js"/);
  assert.match(html, /class="visual-splash"/);
  assert.match(html, /class="visual-burger-btn"/);
  assert.match(html, /class="visual-spotlight"/);
  assert.match(html, /src="\.\/src\/shell-visuals\.js"/);
});

test('studio reference shell ports the supplied splash menu CTA and spotlight motion language', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const shellJs = readFileSync(new URL('../src/shell-visuals.js', import.meta.url), 'utf8');

  assert.match(html, /visual-splash-row-top/);
  assert.match(html, /visual-splash-row-bottom/);
  assert.match(html, /aria-controls="site-menu"/);
  assert.match(css, /Studio reference visual system v4\.0/);
  assert.match(css, /--studio-bg:\s*#E4E4E4/);
  assert.match(css, /--studio-cyan:\s*#75C5DE/);
  assert.match(css, /@keyframes studio-splash-top/);
  assert.match(css, /@keyframes studio-splash-bottom/);
  assert.match(css, /\.visual-burger-btn\.is-open/);
  assert.match(css, /\.shell-menu-open \.sidebar/);
  assert.match(css, /@keyframes studio-word-reveal/);
  assert.match(css, /\.visual-spotlight/);
  assert.match(shellJs, /setMenuOpen/);
  assert.match(shellJs, /word-reveal/);
  assert.match(shellJs, /--spot-x/);
});

test('stitch visual direction keeps the app as a premium light studio with readable dark lab modules', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /Stitch reference fusion v4\.8/);
  assert.match(css, /--stitch-canvas:\s*#E4E4E4/);
  assert.match(css, /--stitch-accent:\s*#75C5DE/);
  assert.match(css, /\.dashboard-hero::before\s*\{[\s\S]*content:\s*"SFX"/);
  assert.match(css, /\.dashboard-actions \.launchpad-button\.is-primary::after\s*\{[\s\S]*border-radius:\s*50%/);
  assert.match(css, /\.visual-burger-btn\s*\{[\s\S]*border-radius:\s*50%/);
  assert.match(css, /\.shell-menu-open \.sidebar\s*\{[\s\S]*transform:\s*translateY\(0\)/);
  assert.match(css, /\.signal-atlas-console \.workbench-panel,[\s\S]*\.signal-atlas-console \.sound-quality-coach-panel\s*\{[\s\S]*background:\s*rgba\(244,\s*241,\s*232,\s*0\.07\)/);
  assert.match(css, /\.signal-atlas-console \.workbench-panel p,[\s\S]*\.signal-atlas-console \.sound-quality-coach-panel p\s*\{[\s\S]*color:\s*rgba\(244,\s*241,\s*232,\s*0\.74\)/);
  assert.match(css, /Stitch Chinese typography and console readability v4\.9/);
  assert.match(css, /\.hero-copy h3\s*\{[\s\S]*line-height:\s*1\.02/);
  assert.match(css, /\.signal-atlas-console \.workbench-topbar h3\s*\{[\s\S]*color:\s*var\(--stitch-paper\)/);
  assert.match(css, /\.signal-atlas-console \.workbench-topbar p\s*\{[\s\S]*color:\s*rgba\(244,\s*241,\s*232,\s*0\.72\)/);
});

test('stitch showcase production pass adds a pointer reveal audio core and capsule CTAs', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(appJs, /hero-sound-visual/);
  assert.match(appJs, /hero-sonic-core/);
  assert.match(appJs, /hero-wave-strip/);
  assert.match(appJs, /hero-creator-word/);
  assert.match(css, /Stitch showcase production pass v5\.0/);
  assert.match(css, /\.hero-sound-visual\s*\{/);
  assert.match(css, /\.hero-sound-visual::before\s*\{[\s\S]*mask-image:\s*radial-gradient\(circle at var\(--spot-x\) var\(--spot-y\)/);
  assert.match(css, /\.hero-sonic-core\s*\{[\s\S]*animation:\s*hero-sonic-float/);
  assert.match(css, /\.hero-wave-strip span\s*\{[\s\S]*animation:\s*hero-wave-scan/);
  assert.match(css, /\.dashboard-actions \.launchpad-button\s*\{[\s\S]*border-radius:\s*999px/);
  assert.match(css, /\.sidebar \.tab\[data-priority="primary"\]\s*\{[\s\S]*font-size:\s*32px/);
  assert.match(css, /\.content\.is-view-switching > \*\s*\{[\s\S]*animation:\s*stitch-view-enter/);
});

test('showcase reference refit uses a single clean stage with reveal layers and no canvas mask repaint loop', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const shellJs = readFileSync(new URL('../src/shell-visuals.js', import.meta.url), 'utf8');

  assert.match(appJs, /hero-reveal-layer/);
  assert.match(appJs, /hero-signal-mesh/);
  assert.match(appJs, /hero-capsule-cta/);
  assert.match(css, /Showcase exact reference refit v6\.5/);
  assert.match(css, /\.dashboard-hero\s*\{[\s\S]*background:[\s\S]*var\(--showcase-canvas\)/);
  assert.match(css, /\.dashboard-hero::before\s*\{[\s\S]*content:\s*"Sound"/);
  assert.match(css, /\.hero-reveal-layer\s*\{[\s\S]*mask-image:\s*radial-gradient\(circle at var\(--spot-x\) var\(--spot-y\)/);
  assert.match(css, /\.hero-capsule-cta::before\s*\{[\s\S]*transition:\s*inset 360ms var\(--showcase-ease\)/);
  assert.match(css, /\.hero-capsule-cta::after\s*\{[\s\S]*border-radius:\s*50%/);
  assert.doesNotMatch(shellJs, /toDataURL/, 'spotlight reveal must stay CSS-variable driven rather than repainting a canvas mask every frame');
});

test('stitch visual refit keeps the supplied showcase motion but removes click flash sources', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const shellJs = readFileSync(new URL('../src/shell-visuals.js', import.meta.url), 'utf8');

  assert.match(css, /Stitch visual refit v5\.3/);
  assert.match(css, /--stitch-canvas:\s*#E4E4E4/);
  assert.match(css, /--stitch-paper:\s*#F4F1E8/);
  assert.match(css, /--stitch-accent:\s*#75C5DE/);
  assert.match(css, /\.visual-splash\.is-done\s*\{[\s\S]*display:\s*none/);
  assert.match(css, /\.dashboard-hero\s*\{[\s\S]*background:[\s\S]*radial-gradient\(circle at var\(--spot-x\) var\(--spot-y\)/);
  assert.match(css, /\.hero-sound-visual::before\s*\{[\s\S]*mask-image:\s*radial-gradient\(circle at var\(--spot-x\) var\(--spot-y\)/);
  assert.match(css, /\.dashboard-actions \.launchpad-button\.is-primary::after\s*\{[\s\S]*border-radius:\s*50%/);
  assert.match(css, /\.dashboard-actions \.launchpad-button:hover::after\s*\{[\s\S]*transform:\s*translateX\(-7px\)/);
  assert.match(css, /\.content :where\(\.card,[\s\S]*\.quality-panel\) :where\(p, li, small, span, label\)\s*\{[\s\S]*color:\s*rgba\(11,\s*11,\s*11,\s*0\.68\)/);
  assert.match(css, /\.content \.quality-panel :where\(p, span, small\)\s*\{[\s\S]*color:\s*rgba\(11,\s*11,\s*11,\s*0\.68\)/);
  assert.match(css, /\.content \.quality-panel :where\(h3, h4, strong\)\s*\{[\s\S]*color:\s*var\(--stitch-ink\)/);
  assert.match(css, /\.signal-atlas-console :where\(p, li, small, span, label\)\s*\{[\s\S]*color:\s*rgba\(244,\s*241,\s*232,\s*0\.74\)/);
  assert.match(css, /\.signal-atlas-console \.xy-pad,[\s\S]*\.signal-atlas-console \.macro-morph-card\s*\{[\s\S]*background:\s*#fbfdff[\s\S]*color:\s*#243846/);
  assert.match(css, /\.signal-atlas-console \.xy-pad span,[\s\S]*\.signal-atlas-console \.macro-morph-card p\s*\{[\s\S]*color:\s*rgba\(11,\s*11,\s*11,\s*0\.68\)\s*!important/);
  assert.match(css, /\.signal-atlas-console \.macro-morph-card strong\s*\{[\s\S]*color:\s*#243846\s*!important/);
  assert.match(shellJs, /function settleSplash/);
  assert.match(shellJs, /splash\?\.classList\.add\('is-done'\)/);
  assert.match(shellJs, /function tickSpotlight/);
  assert.match(shellJs, /requestAnimationFrame\(tickSpotlight\)/);
  assert.match(shellJs, /Close navigation menu/);
  assert.match(shellJs, /Open navigation menu/);
  assert.doesNotMatch(shellJs, /鍏抽棴|鎵撳紑/);
});

test('stitch QA pass keeps the menu above the toolbar and Sound Lab mission readable', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /Stitch showcase QA pass v5\.1/);
  assert.match(css, /\.visual-burger-wrapper\s*\{[\s\S]*z-index:\s*92/);
  assert.match(css, /\.sidebar\s*\{[\s\S]*z-index:\s*88/);
  assert.match(css, /\.signal-atlas-console\.sound-lab-workbench\.synth-workbench-layout\s*\{[\s\S]*background:[\s\S]*rgba\(13,\s*15,\s*18,\s*0\.99\)[\s\S]*!important/);
  assert.match(css, /\.signal-atlas-console \.mission-brief-panel,[\s\S]*\.signal-atlas-console \.atlas-main-console[\s\S]*grid-column:\s*1 \/ -1/);
  assert.match(css, /\.signal-atlas-console \.mission-brief-step-grid\s*\{[\s\S]*repeat\(4,\s*minmax\(160px,\s*1fr\)\)/);
  assert.match(css, /\.signal-atlas-console \.mission-brief-head p,[\s\S]*\.signal-atlas-console \.mission-brief-step small\s*\{[\s\S]*rgba\(244,\s*241,\s*232,\s*0\.74\)/);
});

test('dashboard learning path gives beginners a clickable route into real modules', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(appJs, /const DASHBOARD_LEARNING_PATH = \[/);
  assert.match(appJs, /id: 'listen-source'/);
  assert.match(appJs, /id: 'fm-metal'/);
  assert.match(appJs, /id: 'ab-deliver'/);
  assert.match(appJs, /soundTargetZh:/);
  assert.match(appJs, /oneKnobZh:/);
  assert.match(appJs, /mistakeZh:/);
  assert.match(appJs, /checkpointZh:/);
  assert.match(appJs, /nextStepZh:/);
  assert.match(appJs, /activeDashboardPathStep: DASHBOARD_LEARNING_PATH\[0\]\?\.id/);
  assert.match(appJs, /function getActiveDashboardPathStep\(\)/);
  assert.match(appJs, /class="dashboard-learning-console"/);
  assert.match(appJs, /data-dashboard-path-step/);
  assert.match(appJs, /class="learning-coach-grid"/);
  assert.match(appJs, /class="learning-path-cta"/);
  assert.match(appJs, /data-dashboard-path-launch/);
  assert.match(appJs, /function applyDashboardPathStep\(step\)/);
  assert.match(appJs, /function launchDashboardPathStep\(step\)/);
  assert.match(appJs, /selectSoundLabFamily\(step\.familyId, false\)/);
  assert.match(appJs, /state\.activeLabId = step\.labId/);
  assert.match(appJs, /state\.soundLabWorkflowStep = step\.workflowStep/);
  assert.match(appJs, /state\.activeWorkbenchModule = step\.workbenchModule/);
  assert.match(appJs, /function bindDashboardLearningPathControls\(\)/);
  assert.match(appJs, /launchDashboardPathStep\(step\)/);
  assert.match(css, /\.dashboard-learning-console\s*\{/);
  assert.match(css, /\.learning-path-grid\s*\{/);
  assert.match(css, /\.learning-path-step\.is-active\s*\{/);
  assert.match(css, /\.learning-path-detail\s*\{/);
  assert.match(css, /\.learning-path-checks\s*\{/);
  assert.match(css, /\.learning-coach-grid\s*\{/);
  assert.match(css, /\.learning-coach-card\s*\{/);
  assert.match(css, /\.learning-path-cta\s*\{/);
  assert.match(css, /color:\s*var\(--studio-ink\)/);
  assert.match(css, /color:\s*var\(--studio-paper\)/);
});

test('dashboard practice prescription connects the route to a concrete listen edit verify drill', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const viewModelJs = readFileSync(new URL('../src/view-model.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(viewModelJs, /export function buildPracticePrescription/);
  assert.match(appJs, /buildPracticePrescription/);
  assert.match(appJs, /const practicePrescription = buildPracticePrescription/);
  assert.match(appJs, /class="dashboard-practice-prescription"/);
  assert.match(appJs, /class="prescription-step-grid"/);
  assert.match(appJs, /data-dashboard-prescription-action="launch"/);
  assert.match(appJs, /data-dashboard-prescription-action="ab"/);
  assert.match(appJs, /今日练习处方|一次只改|A\/B|REAPER/);
  assert.match(appJs, /launchDashboardPathStep\(activePathStep\)/);
  assert.match(css, /\.dashboard-practice-prescription\s*\{/);
  assert.match(css, /\.prescription-step-grid\s*\{/);
  assert.match(css, /\.prescription-action-row\s*\{/);
  assert.match(css, /\.prescription-action-row button:hover\s*\{/);
});

test('dashboard dark route and module cards keep readable light text after showcase overrides', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /Dashboard dark-card contrast fix v6\.6/);
  assert.match(css, /\.dashboard-learning-console \.learning-path-detail,[\s\S]*\.dashboard-module-directory \.module-directory-card\s*\{[\s\S]*background:[\s\S]*rgba\(17,\s*17,\s*17,\s*0\.92\)/);
  assert.match(css, /\.dashboard-learning-console \.learning-path-detail :where\(h4,\s*strong\),[\s\S]*\.dashboard-module-directory \.module-directory-card strong\s*\{[\s\S]*color:\s*var\(--showcase-paper\)\s*!important/);
  assert.match(css, /\.dashboard-learning-console \.learning-path-detail :where\(p,\s*small,\s*span\),[\s\S]*\.dashboard-module-directory \.module-directory-card :where\(p,\s*small\)\s*\{[\s\S]*color:\s*rgba\(244,\s*241,\s*232,\s*0\.72\)\s*!important/);
  assert.match(css, /\.dashboard-module-directory \.module-directory-card > span,[\s\S]*\.dashboard-learning-console \.learning-path-detail-main > span\s*\{[\s\S]*color:\s*rgba\(117,\s*197,\s*222,\s*0\.95\)\s*!important/);
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
  assert.match(css, /\.is-pressing/);
  assert.doesNotMatch(css, /\.tap-spark/);
  assert.doesNotMatch(css, /@keyframes tap-spark/);
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

test('aether flow prompt is adapted as native signal flow without viewport flashes', () => {
  const js = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

  assert.match(js, /AETHER_MOUSE_RADIUS/);
  assert.match(js, /AETHER_CONNECTION_RADIUS/);
  assert.match(js, /drawAetherFlowWeb/);
  assert.match(js, /aetherRepel/);
  assert.match(js, /isAetherFlowPaused/);
  assert.doesNotMatch(js, /ctx\.fillStyle\s*=\s*['"]black['"]/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react/);
  assert.match(css, /Reference aether flow motion v9\.1/);
  assert.match(css, /@keyframes ref9-aether-flow/);
  assert.match(css, /@keyframes ref9-edge-flow/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*ref9-aether-flow/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-aether-flow/);
});

test('aether flow prompt adds continuous stream ribbons and restrained hover currents', () => {
  const js = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');

  assert.match(js, /aetherStreams/);
  assert.match(js, /AETHER_STREAM_COUNT/);
  assert.match(js, /drawAetherStreamRibbons/);
  assert.match(js, /createAetherStream/);
  assert.match(js, /isAetherFlowPaused\(\)[\s\S]*drawAetherStreamRibbons/, 'stream ribbons should respect direct-control pause');
  assert.match(css, /Reference aether stream ribbons v9\.2/);
  assert.match(css, /@keyframes ref9-capsule-current/);
  assert.match(css, /@keyframes ref9-hover-current/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*ref9-hover-current/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-capsule-current/);
});

test('aether flow prompt adds packet currents and a drag-safe ambient field', () => {
  const js = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');

  assert.match(js, /aetherCurrentPackets/);
  assert.match(js, /AETHER_CURRENT_PACKET_COUNT/);
  assert.match(js, /createAetherCurrentPacket/);
  assert.match(js, /getAetherStreamPoint/);
  assert.match(js, /drawAetherCurrentPackets/);
  assert.match(js, /globalCompositeOperation = 'lighter'/);
  assert.match(js, /drawAetherStreamRibbons\(time\)[\s\S]*drawAetherCurrentPackets\(time\)/);
  assert.match(css, /Reference aether packet field v9\.3/);
  assert.match(css, /\.audio-space::after/);
  assert.match(css, /@keyframes ref9-aether-field-drift/);
  assert.match(css, /body\.is-direct-manipulating \.audio-space::after[\s\S]*animation-play-state:\s*paused/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.audio-space::after/);
});

test('direct hash routes skip the opening splash to avoid route flash', () => {
  const shellJs = readFileSync(new URL('../src/shell-visuals.js', import.meta.url), 'utf8');

  assert.match(shellJs, /function shouldSkipSplash/);
  assert.match(shellJs, /globalThis\.location\.hash/);
  assert.match(shellJs, /shouldSkipSplash\(\)/);
  assert.match(shellJs, /settleSplash\(\)/);
});

test('module entry points carry cache-busting versions for static Pages delivery', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(html, /src="\.\/src\/app\.js\?v=20260708-aether-mask"/);
  assert.match(appJs, /from '\.\/sound-lab-model\.js\?v=20260708-aether-mask'/);
  assert.match(appJs, /from '\.\/audio-player\.js\?v=20260708-aether-mask'/);
  assert.match(appJs, /from '\.\/view-model\.js\?v=20260708-aether-mask'/);
  assert.match(appJs, /from '\.\/render\.js\?v=20260708-aether-mask'/);
});

test('range controls use smooth drag state and animation-frame chrome updates', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(appJs, /scheduleRangeChromeUpdate/);
  assert.match(appJs, /requestAnimationFrame/);
  assert.match(appJs, /bindSmoothRangeInput/);
  assert.match(appJs, /updateHorizontalRangeFromPointer/);
  assert.match(appJs, /commitPointerRangeValue/);
  assert.match(appJs, /input\.addEventListener\('keydown'/);
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
  assert.doesNotMatch(css, /\.content\.is-view-switching\s*\{[\s\S]*animation:/, 'view transition must not animate the whole content surface');
  assert.doesNotMatch(css, /\.content > \*\s*\{[\s\S]*animation:\s*v3-panel-in/, 'default content children should not animate on every rerender');
  assert.doesNotMatch(css, /\.content:not\(\.is-view-switching\) \*,[\s\S]*animation:\s*none !important/, 'same-view renders must not blanket-disable every nested animation because that reads as a screen flash');
  assert.match(css, /\.content\.is-view-switching > \*\s*\{[\s\S]*animation:\s*v3-panel-in/, 'view transitions should keep a scoped soft entrance');
  assert.match(interactionJs, /isContinuousControl/, 'tactile effects should skip continuous controls such as range sliders and XY pads');
});

test('range chrome updates value outputs without rewriting control labels', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const updateRangeBlock = appJs.match(/function updateRangeChrome[\s\S]*?\r?\n}\r?\n\r?\nfunction applyImmediateControlFeedback/)?.[0] ?? '';

  assert.ok(updateRangeBlock, 'updateRangeChrome should remain the single live range chrome updater');
  assert.match(updateRangeBlock, /querySelector\('output'\)/, 'live range updates should target numeric output elements');
  assert.match(updateRangeBlock, /--knob-value/, 'live range updates should keep macro knob rings in sync with the numeric value');
  assert.doesNotMatch(updateRangeBlock, /querySelector\('output,\s*strong'\)/, 'range updates must not overwrite strong labels such as Attack or Decay');
  assert.doesNotMatch(updateRangeBlock, /querySelector\('strong,\s*output'\)/, 'range updates must not use strong labels as value outputs');
});

test('tactile effects use class-only feedback and cannot flash the viewport', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const interactionJs = readFileSync(new URL('../src/interaction-effects.js', import.meta.url), 'utf8');

  assert.doesNotMatch(interactionJs, /document\.createElement\('span'\)/, 'ordinary click feedback must not insert animated DOM particles');
  assert.doesNotMatch(interactionJs, /append\(spark\)/, 'click feedback must stay class-only to avoid paint flashes');
  assert.doesNotMatch(interactionJs, /setProperty\('--tap-/, 'ordinary click feedback should not mutate per-click geometry variables');
  assert.doesNotMatch(interactionJs, /has-tactile/, 'ordinary click feedback should not add a new compositing class at pointerdown');
  assert.doesNotMatch(css, /\.tap-spark/, 'obsolete click spark CSS should not survive as an accidental viewport flash layer');
  assert.doesNotMatch(css, /@keyframes tap-spark/, 'obsolete click spark keyframes should not survive');
  assert.doesNotMatch(
    css,
    /html\.is-(?:local-interacting|direct-manipulating)\s+#particle-canvas[\s\S]*opacity:/,
    'local interaction states must not dim the full particle canvas because that reads as a viewport flash',
  );
  assert.match(interactionJs, /if\s*\(isContinuousControl\(event,\s*target\)\)\s*return/, 'continuous controls should not run global tactile feedback');
  assert.doesNotMatch(interactionJs, /document\.documentElement\.classList/, 'ordinary click feedback must not touch the html element because that can invalidate the whole viewport');
  assert.doesNotMatch(interactionJs, /is-local-interacting/, 'ordinary click feedback should stay local to the pressed target');
  assert.match(interactionJs, /classList\.add\('is-pressing'\)/, 'tactile feedback should still provide local press state');
  assert.match(css, /\.is-pressing\s*\{[\s\S]*box-shadow/, 'press feedback should remain a local style, not a viewport layer');
});

test('same-view Sound Lab interactions do not restart atlas entrance or glow animations', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const rangeShellBlock = css.match(/\.range-shell\s*\{[^}]*\}/)?.[0] ?? '';
  const draggingBlock = css.match(/\.range-shell\.is-dragging\s*\{[^}]*\}/)?.[0] ?? '';
  const draggingFillBlock = css.match(/\.range-shell\.is-dragging::after\s*\{[^}]*\}/)?.[0] ?? '';
  const signalRangeBlock = css.match(/\.signal-atlas-console \.range-shell input,\s*\r?\n\.signal-atlas-console input\[type="range"\]\s*\{[^}]*\}/)?.[0] ?? '';

  assert.match(css, /Same-view interaction anti-flash guard/);
  assert.match(css, /\.content:not\(\.is-view-switching\) \.signal-atlas-console::after,[\s\S]*\.content:not\(\.is-view-switching\) \.signal-atlas-console \.atlas-orb,[\s\S]*\.content:not\(\.is-view-switching\) \.signal-atlas-console \.atlas-signal-node,[\s\S]*\.content:not\(\.is-view-switching\) \.signal-atlas-console \.atlas-command-dock,[\s\S]*animation:\s*none !important/);
  assert.match(css, /\.content:not\(\.is-view-switching\) \.signal-atlas-console \.atlas-dock-actions button\.is-confirmed,[\s\S]*\.content:not\(\.is-view-switching\) \.signal-atlas-console \[data-workbench-action\]\.is-confirmed[\s\S]*animation:\s*none !important/);
  assert.match(rangeShellBlock, /filter:\s*none/);
  assert.match(draggingBlock, /filter:\s*none/);
  assert.doesNotMatch(rangeShellBlock, /transition:\s*filter/, 'range drag should not animate filter because it repaints a wide control strip');
  assert.doesNotMatch(draggingFillBlock, /filter:/, 'range fill should not brighten via filter while dragging');
  assert.match(css, /\.range-shell\.is-dragging::after\s*\{[\s\S]*transition:\s*none !important/, 'dragging should update the range fill without delayed rail animation');
  assert.doesNotMatch(css, /html\.is-local-interacting \.space-glow/, 'ordinary clicks must not pause broad background layers because that looks like a viewport flash');
  assert.doesNotMatch(css, /html\.is-direct-manipulating \.space-glow/, 'dragging controls must not pause broad background layers because that looks like a viewport flash');
  assert.doesNotMatch(css, /html\.is-(?:local-interacting|direct-manipulating)[\s\S]*\.signal-field span[\s\S]*animation-play-state:\s*paused !important/, 'interaction states should not stop global signal-field animation');
  assert.ok(signalRangeBlock, 'Signal Atlas should keep its own range input transition block auditable');
  assert.doesNotMatch(signalRangeBlock, /filter/, 'Signal Atlas range input transitions must not include filter because it flashes during dragging');
});

test('sound lab calibration panel connects quality guidance to real Worklet controls', () => {
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(modelJs, /buildPolishCalibration/);
  assert.match(modelJs, /loudnessMatch/);
  assert.match(modelJs, /monoAnchor/);
  assert.match(modelJs, /tailDuck/);
  assert.match(processorJs, /applyStereoComfortBus/);
  assert.match(processorJs, /monoAnchor/);
  assert.match(processorJs, /tailDuck/);
  assert.match(renderJs, /polish-calibration-panel/);
  assert.match(css, /\.polish-calibration-panel\s*\{/);
  assert.match(css, /\.calibration-step-grid\s*\{/);
});

test('same-view Sound Lab rerenders keep layout stable and suppress animation restarts', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const renderBlock = appJs.match(/function render\([\s\S]*?\r?\n}\r?\n\r?\nfunction switchView/)?.[0] ?? '';
  const stabilizeBlock = appJs.match(/function stabilizeSameViewRender[\s\S]*?\r?\n}\r?\n\r?\nfunction releaseSameViewRender/)?.[0] ?? '';
  const restoreScrollBlock = appJs.match(/function restoreSameViewScroll[\s\S]*?\r?\n}\r?\n\r?\nfunction releaseSameViewRender/)?.[0] ?? '';
  const releaseBlock = appJs.match(/function releaseSameViewRender[\s\S]*?\r?\n}\r?\n\r?\nfunction render/)?.[0] ?? '';
  const scrollIntoViewBlock = appJs.match(/function scrollSoundLabIntoView[\s\S]*?\r?\n}\r?\n\r?\nfunction selectAdvancedModule/)?.[0] ?? '';
  const bindSoundLabBlock = appJs.match(/function bindSoundLabControls\([\s\S]*?\r?\n}\r?\n\r?\nfunction bindMicroRouteControls/)?.[0] ?? '';
  const sameViewCssBlock = css.match(/\.content\.is-same-view-rendering\s*\{[^}]*\}/)?.[0] ?? '';
  const sameViewQuietMountBlock = css.match(/\.content\.is-same-view-rendering \.sound-lab-shell,[\s\S]*?\.content\.is-same-view-rendering \.patch-doctor-card::before\s*\{[\s\S]*?\}/)?.[0] ?? '';
  const sameViewSoundLabChildrenBlock = css.match(/\.content\.is-same-view-rendering \.sound-lab-shell \*,[\s\S]*?\.content\.is-same-view-rendering \.sound-lab-shell \*::after\s*\{[\s\S]*?\}/)?.[0] ?? '';

  assert.ok(renderBlock, 'render should be easy to audit for same-view stability');
  assert.ok(stabilizeBlock, 'same-view stabilization should be easy to audit');
  assert.ok(restoreScrollBlock, 'same-view scroll restoration should be easy to audit');
  assert.ok(releaseBlock, 'same-view release should be easy to audit');
  assert.ok(scrollIntoViewBlock, 'programmatic Sound Lab scrolling should be easy to audit');
  assert.ok(bindSoundLabBlock, 'Sound Lab binding block should be easy to audit for same-view render paths');
  assert.match(appJs, /function renderSameView\(\)/);
  assert.match(appJs, /is-same-view-rendering/);
  assert.match(appJs, /sameViewScrollLock/);
  assert.match(appJs, /allowProgrammaticScroll/);
  assert.doesNotMatch(appJs, /is-local-interacting/);
  assert.doesNotMatch(appJs, /function\s+setLocalInteraction/);
  assert.match(appJs, /style\.minHeight/);
  assert.match(appJs, /requestAnimationFrame/);
  assert.match(stabilizeBlock, /globalThis\.scrollX/);
  assert.match(stabilizeBlock, /globalThis\.scrollY/);
  assert.match(restoreScrollBlock, /globalThis\.scrollTo\(\{\s*left:\s*x,\s*top:\s*y,\s*behavior:\s*'auto'\s*\}\)/);
  assert.doesNotMatch(stabilizeBlock, /setLocalInteraction\(true\)/, 'same-view rendering should not pulse the global interaction state');
  assert.match(bindSoundLabBlock, /renderSameView\(\)/);
  assert.doesNotMatch(bindSoundLabBlock, /render\(\);/, 'Sound Lab button clicks should use quiet same-view render instead of a raw full repaint');
  assert.ok(sameViewCssBlock, 'same-view stabilization should keep an auditable scoped CSS rule');
  assert.doesNotMatch(sameViewCssBlock, /animation:/, 'same-view stabilization must not kill all animations for a frame');
  assert.doesNotMatch(sameViewCssBlock, /transition:/, 'same-view stabilization must not kill all transitions for a frame');
  assert.match(releaseBlock, /requestAnimationFrame\(\(\)\s*=>\s*\{[\s\S]*requestAnimationFrame/, 'same-view stabilization must survive one painted frame before release');
  assert.match(releaseBlock, /if \(!sameViewScrollLock\.allowProgrammaticScroll\) restoreSameViewScroll\(\)/, 'targeted module jumps must not be undone by delayed same-view scroll restoration');
  assert.match(scrollIntoViewBlock, /allowProgrammaticScroll\s*=\s*true/, 'module jump scrolling should intentionally opt out of the delayed scroll restore');
  assert.ok(sameViewQuietMountBlock, 'same-view Sound Lab rerenders should silence newly mounted heavy panels for one frame');
  assert.match(sameViewQuietMountBlock, /animation:\s*none !important/);
  assert.match(sameViewQuietMountBlock, /transition:\s*none !important/);
  assert.match(sameViewQuietMountBlock, /contain:\s*paint/);
  assert.doesNotMatch(sameViewQuietMountBlock, /filter:/, 'quiet mount should not visibly remove filters');
  assert.doesNotMatch(sameViewQuietMountBlock, /box-shadow:/, 'quiet mount should not visibly remove panel shadows');
  assert.strictEqual(sameViewSoundLabChildrenBlock, '', 'same-view guards must not blanket-disable every child transition because that reads as a screen flash');
});

test('same-view interactions do not call raw full-content render', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const withoutSwitchView = appJs.replace(/function switchView[\s\S]*?\r?\n}\r?\n\r?\nfunction rangePercentFromInput/, 'function rangePercentFromInput');
  const withoutBootstrap = withoutSwitchView.replace(/\r?\nrender\(\);\s*$/, '');

  assert.doesNotMatch(
    withoutBootstrap,
    /\brender\(\);/,
    'only switchView and initial bootstrap may call raw render(); same-view controls must use renderSameView()',
  );
});

test('Sound Lab playback updates runtime chrome without rebuilding the page', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const refreshBlock = appJs.match(/function refreshSoundLabRuntimeUi[\s\S]*?\r?\n}\r?\n\r?\nfunction syncActiveSoundLabPatch/)?.[0] ?? '';
  const playBlock = appJs.match(/async function playSoundLabPatch[\s\S]*?\r?\n}\r?\n\r?\nfunction bindSoundLabControls/)?.[0] ?? '';
  const feedbackBlock = appJs.match(/function showWorkbenchActionFeedback[\s\S]*?\r?\n}\r?\n\r?\nasync function handleWorkbenchAction/)?.[0] ?? '';

  assert.ok(refreshBlock, 'runtime Sound Lab UI refresh should be easy to audit');
  assert.ok(playBlock, 'playSoundLabPatch should be easy to audit for rerender regressions');
  assert.ok(feedbackBlock, 'workbench feedback should be easy to audit for delayed rerenders');
  assert.match(refreshBlock, /\[data-sound-lab-play\]/, 'play buttons should update in place');
  assert.match(refreshBlock, /\[data-output-compare\]/, 'output compare buttons should update in place');
  assert.match(refreshBlock, /\.workbench-feedback,\s*\.atlas-dock-status small/, 'status copy should update in place');
  assert.match(playBlock, /refreshSoundLabRuntimeUi\(model\)/);
  assert.doesNotMatch(playBlock, /renderSameView\(\)/, 'playback start, engine status, and stop timers must not rebuild Sound Lab');
  assert.doesNotMatch(playBlock, /render\(/, 'playback should not trigger a raw page render');
  assert.match(feedbackBlock, /refreshSoundLabRuntimeUi\(\)/, 'small workbench feedback should update status text in place');
  assert.doesNotMatch(feedbackBlock, /renderSameView\(\)/, 'clearing a button confirmation state must not rebuild Sound Lab after a delay');
});

test('Sound Lab live control feedback explains the edit without rebuilding the page', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const feedbackBlock = appJs.match(/function updateLiveControlFeedback[\s\S]*?\r?\n}\r?\n\r?\nfunction applyImmediateControlFeedback/)?.[0] ?? '';
  const immediateBlock = appJs.match(/function applyImmediateControlFeedback[\s\S]*?\r?\n}\r?\n\r?\nfunction scheduleRangeChromeUpdate/)?.[0] ?? '';

  assert.ok(feedbackBlock, 'live control feedback should be an explicit helper that can be audited');
  assert.match(feedbackBlock, /state\.workbenchActionFeedback\s*=/, 'live control edits should write the shared workbench status');
  assert.match(feedbackBlock, /topic\.listenZh/, 'feedback should tell beginners what to listen for');
  assert.match(feedbackBlock, /topic\.reaperZh/, 'feedback should include the REAPER verification habit');
  assert.match(immediateBlock, /updateLiveControlFeedback\(topic,\s*`\$\{input\.value\}\$\{unit\}`\)/);
  assert.match(immediateBlock, /refreshSoundLabRuntimeUi\(\)/);
  assert.doesNotMatch(immediateBlock, /renderSameView\(\)|render\(/, 'continuous control feedback must not rebuild Sound Lab');
});

test('background parallax is throttled and pauses during direct manipulation', () => {
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const directManipulationBlock = appJs.match(/function setDirectManipulation[\s\S]*?\r?\n}\r?\n\r?\nfunction updateVerticalRangeFromPointer/)?.[0] ?? '';

  assert.match(visualSpaceJs, /let\s+spaceParallaxFrame\s*=\s*0/);
  assert.match(visualSpaceJs, /requestAnimationFrame\(\(\)\s*=>\s*\{/);
  assert.match(visualSpaceJs, /__synthDirectManipulating/);
  assert.match(appJs, /function\s+setDirectManipulation/);
  assert.match(appJs, /setDirectManipulation\(true\)/);
  assert.match(appJs, /setDirectManipulation\(false\)/);
  assert.ok(directManipulationBlock, 'direct manipulation should be easy to audit');
  assert.match(directManipulationBlock, /__synthDirectManipulating/, 'dragging should pause parallax through a JS flag instead of a root CSS class');
  assert.doesNotMatch(directManipulationBlock, /document\.documentElement\.classList/, 'dragging sliders or XY pads must not invalidate the whole document style tree');
});

test('Signal Atlas range drag avoids expensive filter flashes', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const activeRangeBlock = css.match(/\.signal-atlas-console \.range-shell\.is-dragging input,\s*\r?\n\.signal-atlas-console input\[type="range"\]:active\s*\{[^}]*\}/)?.[0] ?? '';
  const activeThumbBlock = css.match(/\.signal-atlas-console input\[type="range"\]:active::-webkit-slider-thumb\s*\{[^}]*\}/)?.[0] ?? '';

  assert.ok(activeRangeBlock, 'Signal Atlas should keep an explicit range dragging style');
  assert.match(activeRangeBlock, /box-shadow/);
  assert.doesNotMatch(activeRangeBlock, /filter:/);
  assert.ok(activeThumbBlock, 'Signal Atlas should keep an explicit thumb active style');
  assert.doesNotMatch(activeThumbBlock, /filter:/);
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
  assert.doesNotMatch(appJs, /classList\.add\('is-live-editing'\)/, 'range dragging should not repaint whole control cards on every input frame');
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
  assert.match(css, /\.content\.is-view-switching > \*/);
  assert.doesNotMatch(css, /@keyframes view-soft-swap/);
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
  assert.match(js, /is-pressing/);
  assert.match(js, /addPressState/);
  assert.match(js, /prefers-reduced-motion/);
});

test('ADSR handle dragging updates the current lab surface without full rerender flashes', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const dragBlock = appJs.match(/function updateAdsrFromPointer[\s\S]*?\r?\n}\r?\n\r?\nasync function startAudition/)?.[0] ?? '';

  assert.ok(dragBlock, 'ADSR drag handler should be easy to audit');
  assert.doesNotMatch(dragBlock, /render\(/, 'ADSR pointermove should not rebuild the entire app');
  assert.match(appJs, /function syncInteractiveAdsrSurface/);
  assert.match(appJs, /function finishAdsrDrag/);
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

test('sound lab app wires raw comfort studio output comparison playback', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const soundLabBlock = appJs.match(/function bindSoundLabControls\([\s\S]*?\r?\n}\r?\n\r?\nfunction bindMicroRouteControls/)?.[0] ?? '';

  assert.match(renderJs, /data-output-compare/);
  assert.match(renderJs, /outputCompare/);
  assert.match(css, /\.output-compare-strip\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.output-compare-strip button:hover,[\s\S]*\.output-compare-strip button\.is-active[\s\S]*box-shadow/);
  assert.match(soundLabBlock, /data-output-compare/);
  assert.match(soundLabBlock, /playSoundLabPatch\(\{\},\s*buildOutputCompareOverrides/);
  assert.match(appJs, /function buildOutputCompareOverrides/);
  assert.match(appJs, /outputMode:\s*'raw'/);
  assert.match(appJs, /outputMode:\s*'comfort'/);
  assert.match(appJs, /outputMode:\s*'studio'/);
});

test('sound lab app wires layer audition playback as real patch overrides', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const soundLabBlock = appJs.match(/function bindSoundLabControls\([\s\S]*?\r?\n}\r?\n\r?\nfunction bindMicroRouteControls/)?.[0] ?? '';

  assert.match(renderJs, /data-layer-audition/);
  assert.match(renderJs, /layerAudition/);
  assert.match(appJs, /soundLabAuditionMode/);
  assert.match(appJs, /function buildLayerAuditionOverrides/);
  assert.match(appJs, /function playLayerAudition/);
  assert.match(soundLabBlock, /data-layer-audition/);
  assert.match(soundLabBlock, /playLayerAudition\(button\.dataset\.layerAudition\)/);
  assert.match(appJs, /layerMix:\s*audition\.layerMix/);
  assert.match(appJs, /state\.soundLabAuditionMode = audition\.id/);
  assert.match(css, /\.layer-audition-strip\s*\{/);
  assert.match(css, /\.layer-audition-strip button\.is-active/);
});

test('sound lab app wires material resonance map as a real beginner action', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(modelJs, /function buildMaterialResonanceMap/);
  assert.match(modelJs, /materialResonanceMap/);
  assert.match(renderJs, /renderMaterialResonancePanel/);
  assert.match(renderJs, /material-resonance-panel/);
  assert.match(renderJs, /data-layer-audition="body"/);
  assert.match(renderJs, /data-workbench-action="focus-material-resonance"/);
  assert.match(appJs, /'focus-material-resonance'/);
  assert.match(appJs, /scrollSoundLabIntoView\('\.material-resonance-panel'\)/);
  assert.match(css, /\.material-resonance-panel\s*\{/);
  assert.match(css, /\.resonance-peak-card/);
});

test('sound lab app wires reference match playback and nudge controls', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(modelJs, /referenceMatch/);
  assert.match(modelJs, /playTargets/);
  assert.match(renderJs, /reference-match-panel/);
  assert.match(renderJs, /data-target-reference-play/);
  assert.match(renderJs, /data-target-reference-apply/);
  assert.match(appJs, /playTargetReference/);
  assert.match(appJs, /applyTargetReferenceNudge/);
  assert.match(appJs, /\[data-target-reference-play\]/);
  assert.match(appJs, /\[data-target-reference-apply\]/);
  assert.match(css, /\.reference-match-panel/);
  assert.match(css, /\.reference-control-row/);
});

test('sound lab app wires performance feel gesture playback and presets', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(modelJs, /performanceFeel/);
  assert.match(modelJs, /triggerPattern/);
  assert.match(renderJs, /performance-feel-panel/);
  assert.match(renderJs, /data-performance-feel-play/);
  assert.match(renderJs, /data-performance-feel-apply/);
  assert.match(appJs, /playPerformanceFeelGesture/);
  assert.match(appJs, /applyPerformanceFeelPreset/);
  assert.match(appJs, /\[data-performance-feel-play\]/);
  assert.match(appJs, /\[data-performance-feel-apply\]/);
  assert.match(css, /\.performance-feel-panel/);
  assert.match(css, /\.performance-feel-meter/);
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

test('sound lab processor applies master polish before the final limiter', () => {
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');

  assert.match(modelJs, /masterPolish/);
  assert.match(modelJs, /polish/);
  assert.match(processorJs, /createPolishState/);
  assert.match(processorJs, /applyMasterPolish/);
  assert.match(processorJs, /masterPolish/);
  assert.match(processorJs, /lowTighten/);
  assert.match(processorJs, /airGuard/);
  assert.match(processorJs, /transientHold/);
  assert.match(processorJs, /comfortBus/);
  assert.match(processorJs, /deHarsh/);
  assert.match(processorJs, /headroom/);
  assert.match(processorJs, /warmth/);
  assert.match(processorJs, /this\.softLimiter\(this\.applyMasterPolish/);
});

test('native sound lab processor rounds hot synth output with an analog-style output stage', () => {
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');

  assert.match(processorJs, /createOutputStageState/);
  assert.match(processorJs, /outputStageLeft/);
  assert.match(processorJs, /outputStageRight/);
  assert.match(processorJs, /applyAnalogOutputSaturation/);
  assert.match(processorJs, /preEmphasis/);
  assert.match(processorJs, /deEmphasis/);
  assert.match(processorJs, /slew/);
  assert.match(processorJs, /firstStage/);
  assert.match(processorJs, /secondAmount/);
  assert.match(processorJs, /softLimiter\(sample,\s*state\s*=\s*null\)/);
  assert.match(processorJs, /this\.softLimiter\(this\.applyMasterPolish\([\s\S]*this\.outputStageLeft\)/);
  assert.match(processorJs, /this\.softLimiter\(this\.applyMasterPolish\([\s\S]*this\.outputStageRight\)/);
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

test('sound lab live controls update the parameter coach without forcing rerenders', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /data-live-parameter-coach/);
  assert.match(renderJs, /data-live-coach-listen/);
  assert.match(appJs, /SOUND_LAB_PARAMETER_COACH/);
  assert.match(appJs, /function updateParameterCoach/);
  assert.match(appJs, /coachTopicForInput/);
  assert.match(appJs, /const topic = coachTopicForInput\(input\)/);
  assert.match(appJs, /updateParameterCoach\(topic/);
  assert.match(appJs, /updateLiveControlFeedback\(topic/);
  assert.match(appJs, /SOUND_LAB_PARAMETER_COACH\.special\.xyPad/);
  assert.doesNotMatch(appJs, /function updateParameterCoach[\s\S]{0,1200}renderSameView\(/);
  assert.match(css, /\.parameter-coach-panel\s*\{/);
  assert.match(css, /\.parameter-coach-meter i\s*\{[\s\S]*transition:\s*width 120ms/);
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
  assert.match(appJs, /querySelector\('output'\)/);
  assert.doesNotMatch(appJs, /querySelector\('output,\s*strong'\)/);
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

test('studio light canvas keeps cards readable while Sound Lab stays professional dark', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /color-scheme:\s*light/);
  assert.match(css, /--studio-bg:\s*#E4E4E4/);
  assert.match(css, /--studio-paper:\s*#F4F1E8/);
  assert.match(css, /--studio-ink:\s*#0B0B0B/);
  assert.match(css, /\.card,[\s\S]*\.daily-video-card,[\s\S]*\.synth-workbench-layout\s*\{[\s\S]*color:\s*var\(--v3-text\)/);
  assert.match(css, /\.secondary-button,[\s\S]*\.sound-preset-card\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.signal-node,[\s\S]*\.sound-lab-meter-grid\s*>\s*div,[\s\S]*\.integration-status-grid\s*>\s*div\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.daily-sync-panel,[\s\S]*\.daily-sync-stats div,[\s\S]*\.daily-suggestion-card,[\s\S]*\.integration-status-grid\s*>\s*div\s*\{[\s\S]*rgba\(18,\s*24,\s*38,\s*0\.82\)/);
  assert.match(css, /\.source-card p,[\s\S]*\.notice\s*\{[\s\S]*color:\s*var\(--v3-body\)/);
  assert.match(css, /\.sound-lab-workbench,[\s\S]*\.synth-workbench-layout,[\s\S]*\.signal-atlas-console\s*\{[\s\S]*rgba\(17,\s*17,\s*17,\s*0\.96\)/);
  assert.match(css, /\.sound-lab-workbench \.workbench-actions button,[\s\S]*\.signal-atlas-console \.workbench-actions button\s*\{[\s\S]*color:\s*var\(--studio-paper\)/);
  assert.match(css, /\.visual-burger-btn/);
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
  assert.match(appJs, /dashboard-starter-strip/);
  assert.match(appJs, /launchpad-button/);
  assert.match(appJs, /从这里开始/);
  assert.match(appJs, /新手今日路径/);
  assert.match(appJs, /data-dashboard-primary-view="soundlab"/);
  assert.match(appJs, /data-dashboard-primary-view="interactive"/);
  assert.match(appJs, /data-dashboard-primary-view="daily"/);
  assert.match(css, /\.dashboard-starter-strip\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.dashboard-starter-strip button\s*\{[\s\S]*min-height:\s*62px/);
  assert.match(css, /\.hero-copy h3\s*\{[\s\S]*font-size:\s*clamp\(36px,\s*5\.2vw,\s*64px\)/);
  assert.match(css, /\.dashboard-hero\s*\{[\s\S]*min-height:\s*380px/);
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
  assert.match(appJs, /const focusMode = getSoundLabFocusMode\(\)/);
  assert.match(appJs, /function selectSoundLabFamily[\s\S]*state\.activeWorkbenchModule = focusMode\.workbenchModule/);
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

test('sound lab focus modes are real routed controls, not decorative pills', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(appJs, /SOUND_LAB_FOCUS_MODES/);
  assert.match(appJs, /id:\s*'guided'/);
  assert.match(appJs, /id:\s*'studio'/);
  assert.match(appJs, /id:\s*'expert'/);
  assert.match(appJs, /function applySoundLabFocusMode/);
  assert.match(appJs, /button\[data-sound-lab-focus-mode\]/);
  assert.match(appJs, /state\.soundLabWorkflowStep = mode\.workflowStep/);
  assert.match(appJs, /state\.activeAdvancedModule = mode\.advancedModule/);
  assert.match(renderJs, /data-focus-mode="\$\{escapeHtml\(focusMode\)\}"/);
  assert.match(css, /\.sound-lab-mode-switcher\s*\{/);
  assert.match(css, /\.mode-switch-card\.is-active\s*\{/);
  assert.match(css, /\.sound-lab-shell\[data-sound-lab-focus-mode="guided"\] \.signal-atlas-console \.atlas-support-grid\s*\{[\s\S]*opacity:\s*0\.58/);
  assert.match(css, /\.signal-atlas-console\[data-focus-mode="expert"\] \.atlas-support-grid\s*\{[\s\S]*opacity:\s*1/);
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

test('sound lab first-screen session dock exposes listen compare and guided jump actions', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /renderSessionTransportDock/);
  assert.match(renderJs, /session-transport-dock/);
  assert.match(renderJs, /data-session-jump="playback"/);
  assert.match(renderJs, /data-session-jump="coach"/);
  assert.match(renderJs, /data-output-compare="\$\{escapeHtml\(mode\.id\)\}"/);
  assert.match(appJs, /data-session-jump/);
  assert.match(appJs, /handleSessionJump/);
  assert.match(appJs, /scrollSoundLabIntoView/);
  assert.match(css, /\.session-transport-dock\s*\{[\s\S]*grid-template-columns:\s*minmax\(220px,\s*1fr\)\s+auto\s+minmax\(240px,\s*0\.9fr\)/);
  assert.match(css, /\.session-output-compare\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(76px,\s*1fr\)\)/);
  assert.match(css, /\.session-jump-actions button\s*\{[\s\S]*cursor:\s*pointer/);
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
  assert.match(appJs, /if \(action === 'analyze-patch'\)\s*\{[\s\S]*state\.activeAdvancedModule = 'mod-matrix'/);
  assert.match(appJs, /if \(action === 'analyze-patch'\)\s*\{[\s\S]*state\.activeWorkbenchModule = 'modulation'/);
  assert.match(appJs, /if \(action === 'analyze-patch'\)\s*\{[\s\S]*scrollSoundLabIntoView\('\.modulation-panel'\)/);
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

test('sound lab practice loop has routed actions and readable dark panel styling', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /renderPracticeLoopPanel/);
  assert.match(renderJs, /practice-loop-panel/);
  assert.match(renderJs, /data-workbench-action="focus-practice-loop"/);
  assert.match(renderJs, /practiceLoop/);
  assert.match(appJs, /focus-practice-loop/);
  assert.match(appJs, /state\.soundLabWorkflowStep = 'compare'/);
  assert.match(appJs, /scrollSoundLabIntoView\('\.practice-loop-panel'\)/);
  assert.match(css, /\.practice-loop-panel\s*\{/);
  assert.match(css, /\.practice-loop-step\s*\{[\s\S]*color:\s*rgba\(244,\s*247,\s*251,\s*0\.84\)/);
});

test('sound lab Patch Doctor is routed, readable, and not a dead card', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(modelJs, /buildPatchDoctor/);
  assert.match(modelJs, /synthTargets/);
  assert.match(modelJs, /applyAction/);
  assert.match(modelJs, /macroDelta/);
  assert.match(modelJs, /layerDelta/);
  assert.match(renderJs, /renderPatchDoctorPanel/);
  assert.match(renderJs, /patch-doctor-panel/);
  assert.match(renderJs, /data-workbench-action="\$\{escapeHtml\(diagnostic\.action\)\}"/);
  assert.match(renderJs, /data-doctor-apply="\$\{escapeHtml\(diagnostic\.id\)\}"/);
  assert.match(appJs, /function applyPatchDoctorSuggestion\(diagnosticId,\s*button\)/);
  assert.match(appJs, /\[data-doctor-apply\]/);
  assert.match(appJs, /state\.soundLabMacros/);
  assert.match(appJs, /state\.soundLabLayerMix/);
  assert.match(appJs, /focus-controls/);
  assert.match(appJs, /analyze-patch/);
  assert.match(appJs, /focus-practice-loop/);
  assert.match(css, /\.patch-doctor-panel\s*\{/);
  assert.match(css, /\.patch-doctor-card\s*\{[\s\S]*background:/);
  assert.match(css, /\.patch-doctor-actions\s*\{/);
  assert.match(css, /\.patch-doctor-apply-button\s*\{/);
  assert.match(css, /\.patch-doctor-card button\s*\{[\s\S]*cursor:\s*pointer/);
});

test('sound lab quality coach is a live routed panel, not a decorative score card', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(modelJs, /buildSoundQualityCoach/);
  assert.match(modelJs, /soundQualityCoach:\s*buildSoundQualityCoach/);
  assert.match(renderJs, /sound-quality-coach-panel/);
  assert.match(renderJs, /data-quality-coach-apply="\$\{escapeHtml\(coach\.primaryFix\.diagnosticId\)\}"/);
  assert.match(appJs, /\[data-quality-coach-apply\]/);
  assert.match(appJs, /applyPatchDoctorSuggestion\(button\.dataset\.qualityCoachApply,\s*button\)/);
  assert.match(css, /\.sound-quality-coach-panel\s*\{/);
  assert.match(css, /\.quality-coach-metric-grid\s*\{/);
  assert.match(css, /\.quality-coach-apply-button\s*\{/);
});

test('sound lab listening compass stays readable and routes to existing workbench actions', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /renderListeningCompassPanel/);
  assert.match(renderJs, /listening-compass-panel/);
  assert.match(renderJs, /listeningCompass/);
  assert.match(renderJs, /data-workbench-action="\$\{escapeHtml\(stage\.action\)\}"/);
  assert.match(appJs, /focus-controls/);
  assert.match(appJs, /focus-practice-loop/);
  assert.match(css, /\.listening-compass-panel\s*\{/);
  assert.match(css, /\.listening-compass-step\s*\{[\s\S]*color:\s*rgba\(244,\s*247,\s*251,\s*0\.86\)/);
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
  assert.match(css, /Signal Atlas v4\.5 collision guard/);
  assert.match(css, /\.atlas-goal-panel/);
  assert.match(css, /\.atlas-push-button/);
  assert.match(css, /\.signal-atlas-console\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(280px,\s*0\.34fr\)/);
  assert.match(css, /\.signal-atlas-console\s*\{[\s\S]*overflow:\s*visible/);
  assert.match(css, /\.atlas-signal-ribbon\s*\{[\s\S]*display:\s*grid/);
  assert.match(css, /\.signal-atlas-console > \.atlas-main-console\s*\{[\s\S]*grid-column:\s*1\s*\/\s*2/);
  assert.match(css, /\.signal-atlas-console > \.atlas-right-rail\s*\{[\s\S]*grid-column:\s*2\s*\/\s*3/);
  assert.match(css, /\.signal-atlas-console > \.atlas-main-console,[\s\S]*\.signal-atlas-console > \.atlas-right-rail\s*\{[\s\S]*align-self:\s*start/);
  assert.match(css, /\.atlas-right-rail\s*\{[\s\S]*position:\s*sticky/);
  assert.match(css, /\.atlas-right-rail\s*\{[\s\S]*top:\s*92px/);
  assert.match(css, /\.atlas-right-rail\s*\{[\s\S]*max-height:\s*calc\(100vh - 116px\)/);
  assert.match(css, /\.atlas-right-rail\s*\{[\s\S]*overflow-y:\s*auto/);
  assert.match(css, /\.atlas-right-rail\s*\{[\s\S]*overscroll-behavior:\s*contain/);
  assert.match(css, /\.atlas-right-rail::-webkit-scrollbar-thumb\s*\{[\s\S]*linear-gradient/);
  assert.match(css, /\.signal-atlas-console \.atlas-lab-stage,[\s\S]*\.signal-atlas-console \.atlas-analyzer-row\s*\{[\s\S]*width:\s*100%/);
  assert.match(css, /\.signal-atlas-console \.atlas-lab-stage,[\s\S]*\.signal-atlas-console \.atlas-analyzer-row\s*\{[\s\S]*max-width:\s*100%/);
  assert.match(css, /\.signal-atlas-console \.atlas-analyzer-row\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1\.08fr\)\s+minmax\(0,\s*0\.92fr\)\s+72px/);
  assert.match(css, /\.signal-atlas-console \.atlas-analyzer-row \.waveform-panel,[\s\S]*\.signal-atlas-console \.atlas-analyzer-row \.output-meter-strip\s*\{[\s\S]*min-width:\s*0/);
  assert.match(css, /@media \(max-width:\s*1180px\)[\s\S]*\.atlas-right-rail\s*\{[\s\S]*position:\s*static/);
  assert.match(css, /@media \(max-width:\s*1180px\)[\s\S]*\.atlas-right-rail\s*\{[\s\S]*top:\s*auto/);
  assert.match(css, /@media \(max-width:\s*1180px\)[\s\S]*\.atlas-right-rail\s*\{[\s\S]*max-height:\s*none/);
  assert.match(css, /@media \(max-width:\s*1180px\)[\s\S]*\.atlas-right-rail\s*\{[\s\S]*overflow:\s*visible/);
  assert.match(css, /@media \(max-width:\s*1180px\)[\s\S]*\.signal-atlas-console > \.atlas-main-console,[\s\S]*\.signal-atlas-console > \.atlas-right-rail\s*\{[\s\S]*grid-column:\s*1\s*\/\s*-1/);
  assert.match(css, /\.atlas-lab-stage\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(300px,\s*0\.72fr\)/);
  assert.match(css, /\.atlas-command-dock\s*\{[\s\S]*backdrop-filter:\s*blur\(24px\)/);
  assert.match(css, /@keyframes atlas-node-arrive/);
  assert.match(css, /@keyframes atlas-soft-pulse/);
  assert.match(css, /@keyframes atlas-confirm-pop/);
  assert.match(css, /transition:\s*transform 180ms cubic-bezier/);
});

test('target match coach is routed, readable, and visually integrated with Signal Atlas', () => {
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(modelJs, /function buildTargetMatchCoach/);
  assert.match(modelJs, /targetMatchCoach:\s*buildTargetMatchCoach/);
  assert.match(renderJs, /function renderTargetMatchCoachPanel/);
  assert.match(renderJs, /target-match-coach-panel/);
  assert.match(renderJs, /data-target-match-action/);
  assert.match(renderJs, /data-doctor-apply/);
  assert.match(css, /Target Match Coach v5\.2/);
  assert.match(css, /\.target-match-coach-panel\s*\{[\s\S]*background:\s*linear-gradient/);
  assert.match(css, /\.target-match-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.target-match-meter::after\s*\{[\s\S]*width:\s*var\(--target-score\)/);
  assert.match(css, /\.signal-atlas-console \.target-match-coach-panel\s*\{[\s\S]*grid-column:\s*1\s*\/\s*-1/);
  assert.match(css, /\.target-match-challenge button:active\s*\{[\s\S]*transform:\s*translateY\(1px\)/);
});

test('product stability pass contains overflow, menu hit areas, and Sound Lab controls', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /Product stability pass v5\.4/);
  assert.match(css, /html,\s*\nbody\s*\{[\s\S]*overflow-x:\s*clip/);
  assert.match(css, /\.visual-logo-wrapper\s*\{[\s\S]*max-width:\s*min\(440px,\s*calc\(100vw - 116px\)\)/);
  assert.match(css, /\.signal-field\s*\{[\s\S]*max-width:\s*calc\(100vw - 36px\)/);
  assert.match(css, /\.signal-field\s*\{[\s\S]*contain:\s*paint/);
  assert.match(css, /\.signal-field\s*\{[\s\S]*transform:\s*translate3d/);
  assert.match(css, /\.shell-menu-open \.sidebar,[\s\S]*\.shell-menu-open \.sidebar \.daily-suggestion-card button\s*\{[\s\S]*pointer-events:\s*auto/);
  assert.match(css, /\.notification-button span\s*\{[\s\S]*background:\s*#b91c2b/);
  assert.match(css, /\.quality-panel \.card-kicker,[\s\S]*\.quality-panel > span\s*\{[\s\S]*color:\s*#064c5b !important/);
  assert.match(css, /\.signal-atlas-console,[\s\S]*\.synth-workbench-layout\s*\{[\s\S]*background-color:\s*#111315 !important/);
  assert.match(css, /\.content \.signal-atlas-console\.sound-lab-workbench\.synth-workbench-layout\s*\{[\s\S]*background-color:\s*#111315 !important/);
  assert.match(css, /\.signal-atlas-console \.macro-knob input,[\s\S]*\.synth-workbench-layout \.macro-knob input\s*\{[\s\S]*left:\s*10px/);
  assert.match(css, /\.signal-atlas-console \.macro-knob input,[\s\S]*\.synth-workbench-layout \.macro-knob input\s*\{[\s\S]*width:\s*auto/);
  assert.match(css, /\.signal-atlas-console \.macro-knob input,[\s\S]*\.synth-workbench-layout \.macro-knob input\s*\{[\s\S]*max-width:\s*calc\(100% - 20px\)/);
  assert.match(css, /\.signal-atlas-console \.vertical-slider input,[\s\S]*\.synth-workbench-layout \.vertical-slider input\s*\{[\s\S]*width:\s*44px/);
  assert.match(css, /\.signal-atlas-console \.range-shell,[\s\S]*\.synth-workbench-layout \.range-shell\s*\{[\s\S]*max-width:\s*100%/);
});

test('showcase reference redesign supersedes legacy dark overrides with readable studio styling', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const stabilityIndex = css.indexOf('Product stability pass v5.4');
  const showcaseIndex = css.indexOf('Showcase reference redesign v6.0');
  const cleanupIndex = css.indexOf('Showcase reference v6.1');
  const polishIndex = css.indexOf('Showcase interaction polish v6.2');

  assert.ok(stabilityIndex > -1, 'legacy stability guard should remain auditable');
  assert.ok(showcaseIndex > stabilityIndex, 'showcase redesign must load after the old dark fallback rules');
  assert.ok(cleanupIndex > showcaseIndex, 'first viewport cleanup must load after the showcase visual system');
  assert.ok(polishIndex > cleanupIndex, 'interaction polish must load after the viewport cleanup');
  assert.match(css, /--showcase-canvas:\s*#E4E4E4/);
  assert.match(css, /--showcase-ink:\s*#111111/);
  assert.match(css, /--showcase-paper:\s*#F4F1E8/);
  assert.match(css, /--showcase-cyan:\s*#75C5DE/);
  assert.match(css, /\.sidebar\s*\{[\s\S]*position:\s*fixed !important[\s\S]*right:\s*8px !important[\s\S]*background:\s*var\(--showcase-menu\) !important/);
  assert.match(css, /\.shell-menu-open \.sidebar\s*\{[\s\S]*top:\s*8px !important[\s\S]*transform:\s*translate3d\(0,\s*0,\s*0\) !important/);
  assert.match(css, /\.dashboard-hero::before\s*\{[\s\S]*content:\s*"Sonic"/);
  assert.match(css, /Showcase reference v6\.1/);
  assert.match(css, /\.content:has\(\.dashboard-hero\) > \.view-header\s*\{[\s\S]*display:\s*none/);
  assert.match(css, /\.quality-panel\s*\{[\s\S]*position:\s*absolute[\s\S]*min-height:\s*0 !important[\s\S]*max-height:\s*none !important[\s\S]*overflow:\s*hidden/);
  assert.match(css, /\.quality-panel \.metric-row p\s*\{[\s\S]*display:\s*none/);
  assert.match(css, /\.hero-copy \.card-kicker\s*\{[\s\S]*display:\s*none/);
  assert.match(css, /\.dashboard-actions \.launchpad-button::before,[\s\S]*\.source-link::before\s*\{[\s\S]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.9\)/);
  assert.match(css, /\.hero-sound-visual::before\s*\{[\s\S]*mask-image:\s*radial-gradient\(circle at var\(--spot-x/);
  assert.match(css, /\.signal-atlas-console,[\s\S]*\.synth-workbench-layout\s*\{[\s\S]*background-color:\s*transparent !important/);
  assert.match(css, /\.content \.signal-atlas-console\.sound-lab-workbench\.synth-workbench-layout\s*\{[\s\S]*background-color:\s*transparent !important/);
  assert.match(css, /\.signal-atlas-console :where\(p, li, small, span, label, output\),[\s\S]*\.synth-workbench-layout :where\(p, li, small, span, label, output\)\s*\{[\s\S]*rgba\(244,\s*241,\s*232,\s*0\.78\) !important/);
  assert.match(css, /\.range-shell\.is-dragging,[\s\S]*\.synth-workbench-layout \.range-shell\.is-dragging\s*\{[\s\S]*filter:\s*none !important/);
  assert.match(css, /\.signal-atlas-console input\[type="range"\],[\s\S]*\.synth-workbench-layout input\[type="range"\]\s*\{[\s\S]*min-height:\s*40px[\s\S]*cursor:\s*grab[\s\S]*touch-action:\s*none/);
  assert.match(css, /\.signal-atlas-console input\[type="range"\]:active,[\s\S]*\.synth-workbench-layout \.range-shell\.is-dragging\s*\{[\s\S]*cursor:\s*grabbing/);
});

test('showcase v6.4 turns the dashboard into a clean reference-style sonic stage', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const shellJs = readFileSync(new URL('../src/shell-visuals.js', import.meta.url), 'utf8');
  const polishIndex = css.indexOf('Showcase interaction polish v6.2');
  const stageIndex = css.indexOf('Showcase sonic stage v6.4');

  assert.ok(stageIndex > polishIndex, 'v6.4 must load after previous showcase patches');
  assert.match(css, /\.workspace:has\(\.dashboard-hero\) \.toolbar\s*\{[\s\S]*display:\s*none/);
  assert.match(css, /\.content:has\(\.dashboard-hero\)\s*\{[\s\S]*margin-top:\s*0/);
  assert.match(css, /\.dashboard-hero\s*\{[\s\S]*min-height:\s*min\(780px,\s*calc\(100dvh - 108px\)\)/);
  assert.match(css, /\.dashboard-hero\s*\{[\s\S]*background:[\s\S]*radial-gradient\(circle at var\(--spot-x/);
  assert.match(css, /\.dashboard-hero::before\s*\{[\s\S]*content:\s*"Sonic"/);
  assert.match(css, /\.hero-copy h3\s*\{[\s\S]*font-size:\s*clamp\(38px,\s*5\.2vw,\s*76px\)/);
  assert.match(css, /\.hero-copy h3\s*\{[\s\S]*letter-spacing:\s*-0\.035em/);
  assert.match(css, /\.dashboard-starter-strip\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.dashboard-actions\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(240px,\s*1fr\)\)/);
  assert.match(css, /\.dashboard-actions \.launchpad-button span\s*\{[\s\S]*white-space:\s*nowrap/);
  assert.match(css, /\.dashboard-actions \.launchpad-button::before\s*\{[\s\S]*inset:\s*7px 68px 7px 8px/);
  assert.match(css, /\.sidebar\s*\{[\s\S]*visibility:\s*hidden/);
  assert.match(css, /\.shell-menu-open \.sidebar\s*\{[\s\S]*visibility:\s*visible/);
  assert.match(css, /\.sidebar \.tab\s*\{[\s\S]*font-size:\s*clamp\(24px,\s*4\.5vw,\s*40px\)/);
  assert.match(css, /\.visual-spotlight\s*\{[\s\S]*mix-blend-mode:\s*soft-light/);
  assert.match(shellJs, /setMenuOpen/);
  assert.match(shellJs, /Close navigation menu/);
  assert.match(shellJs, /Open navigation menu/);
  assert.doesNotMatch(shellJs, /鍏抽棴|鎵撳紑/);
});

test('reference v9 loads a final clean visual layer after the legacy cascade', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const finalUrl = new URL('../styles-reference.css', import.meta.url);

  assert.match(html, /href="\.\/styles\.css(?:\?v=[^"]+)?"[\s\S]*href="\.\/styles-reference\.css(?:\?v=[^"]+)?"/);
  assert.ok(existsSync(finalUrl), 'final reference layer should be a separate stylesheet loaded after legacy styles.css');

  const css = readFileSync(finalUrl, 'utf8');
  assert.match(css, /Reference visual system v9\.0 final layer/);
  assert.match(css, /--ref9-canvas:\s*#e4e4e4/);
  assert.match(css, /--ref9-ink:\s*#111111/);
  assert.match(css, /--ref9-paper:\s*#f4f1e8/);
  assert.match(css, /--ref9-cyan:\s*#75c5de/);
  assert.match(css, /body\s*\{[\s\S]*background:[\s\S]*var\(--ref9-canvas\)/);
  assert.match(css, /\.dashboard-hero\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(340px,\s*0\.72fr\)/);
  assert.match(css, /\.dashboard-hero::before\s*\{[\s\S]*content:\s*"Sonic"/);
  assert.match(css, /\.hero-copy h3\s*\{[\s\S]*font-size:\s*clamp\(42px,\s*6vw,\s*92px\)/);
  assert.match(css, /\.reference-readable-surface\s*,[\s\S]*\.content :where\([\s\S]*\)\s*\{[\s\S]*color:\s*var\(--ref9-ink\)\s*!important/);
  assert.match(css, /\.signal-atlas-console :where\(p,\s*li,\s*small,\s*span,\s*em,\s*label,\s*dt,\s*dd,\s*output\)\s*\{[\s\S]*color:\s*rgba\(244,\s*241,\s*232,\s*0\.78\)\s*!important/);
  assert.match(css, /body\.is-direct-manipulating\s+\.visual-spotlight\s*\{[\s\S]*opacity:\s*0\.12\s*!important/);
});

test('headline reveal segments Chinese text without mojibake regexes', () => {
  const shellJs = readFileSync(new URL('../src/shell-visuals.js', import.meta.url), 'utf8');

  assert.match(shellJs, /function segmentHeadlineText/);
  assert.match(shellJs, /Intl\.Segmenter/);
  assert.match(shellJs, /Array\.from\(text\)/);
  assert.doesNotMatch(shellJs, /鈥|閸|妫|绱|漖|潀/);
});

test('reference v8 applies the supplied showcase aesthetic after all legacy style layers', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const shellJs = readFileSync(new URL('../src/shell-visuals.js', import.meta.url), 'utf8');
  const v7Index = css.indexOf('v7.0 showcase reference system');
  const v8Index = css.indexOf('Reference showcase visual system v8.0');
  const v84Index = css.indexOf('Reference showcase visual system v8.4');

  assert.ok(v8Index > v7Index, 'v8 reference system must load after older showcase patches');
  assert.ok(v84Index > v8Index, 'v8.4 must lock the final cascade after v8.0');
  assert.match(css, /Reference showcase visual system v8\.1/);
  assert.match(css, /Reference showcase visual system v8\.4/);
  assert.match(css, /--ref-canvas:\s*#e4e4e4/);
  assert.match(css, /--ref-paper:\s*#f4f1e8/);
  assert.match(css, /--ref-cyan:\s*#75c5de/);
  assert.match(css, /\.visual-splash\.is-done\s*\{[\s\S]*display:\s*none !important/);
  assert.match(css, /\.visual-burger-btn\s*\{[\s\S]*border-radius:\s*50%/);
  assert.match(css, /\.workspace:has\(\.dashboard-hero\) \.toolbar,[\s\S]*\.content:has\(\.dashboard-hero\) > \.view-header\s*\{[\s\S]*display:\s*none/);
  assert.match(css, /\.dashboard-hero\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*0\.98fr\)\s*minmax\(320px,\s*0\.78fr\)/);
  assert.match(css, /\.dashboard-hero::before\s*\{[\s\S]*content:\s*"Sonic"/);
  assert.match(css, /\.hero-sound-visual::before\s*\{[\s\S]*mask-image:\s*radial-gradient\(circle at var\(--spot-x/);
  assert.match(css, /\.dashboard-actions \.launchpad-button::before\s*\{[\s\S]*inset:\s*7px 68px 7px 8px/);
  assert.match(css, /\.hero-copy h3\s*\{[\s\S]*font-size:\s*clamp\(36px,\s*4\.85vw,\s*68px\)/);
  assert.match(css, /\.content \.signal-atlas-console\.sound-lab-workbench\.synth-workbench-layout :is\([\s\S]*\.atlas-topbar,[\s\S]*\.professional-module-panel[\s\S]*\) :is\(h2, h3, h4, h5, strong, b, \.workbench-breadcrumb, button, output\)\s*\{[\s\S]*color:\s*var\(--ref-paper\) !important/);
  assert.match(css, /\.content \.signal-atlas-console\.sound-lab-workbench\.synth-workbench-layout,[\s\S]*\.signal-atlas-console,[\s\S]*\.synth-workbench-layout\s*\{[\s\S]*background-color:\s*#111315 !important/);
  assert.match(css, /\.signal-atlas-console :where\(p, li, small, span, em, label, dt, dd\),[\s\S]*\.sound-lab-workbench :where\(p, li, small, span, em, label, dt, dd\)\s*\{[\s\S]*rgba\(244,\s*241,\s*232,\s*0\.74\) !important/);
  assert.match(css, /body\.is-direct-manipulating \.visual-spotlight\s*\{[\s\S]*opacity:\s*0\.28 !important/);
  assert.match(shellJs, /Close navigation menu/);
  assert.match(shellJs, /Open navigation menu/);
  assert.match(shellJs, /segmentHeadlineText\(text\)/);
  assert.match(shellJs, /body\.classList\.contains\('is-direct-manipulating'\)/);
  assert.doesNotMatch(shellJs, /鍏抽棴|鎵撳紑/);
});
