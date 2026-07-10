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
  assert.match(html, /src="\.\/src\/visual-space\.js\?v=20260710-route-shell-v17"/);
  assert.match(html, /src="\.\/src\/interaction-effects\.js"/);
  assert.match(html, /class="visual-splash"/);
  assert.match(html, /class="visual-burger-btn"/);
  assert.match(html, /class="visual-spotlight"/);
  assert.match(html, /src="\.\/src\/shell-visuals\.js\?v=20260710-route-shell-v17"/);
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

test('stitch dark pro audio redesign replaces the light showcase shell with console-grade tokens', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(html, /class="audio-space"/);
  assert.match(html, /class="sidebar"/);
  assert.match(html, /class="toolbar"/);
  assert.ok(html.indexOf('styles-reference.css') < html.indexOf('styles.css?v=20260709-learning-synths-v13'));
  assert.doesNotMatch(html, /cdn\.tailwindcss\.com/);
  assert.doesNotMatch(html, /three\.min\.js/);
  assert.match(css, /Stitch dark pro audio redesign v11/);
  assert.match(css, /Stitch dark pro audio redesign v11\.1 cascade guard/);
  assert.match(css, /Stitch dark pro audio redesign v11\.2 shell reset/);
  assert.match(css, /Stitch dark pro audio redesign v11\.3 grid placement guard/);
  assert.match(css, /Stitch dark pro audio redesign v11\.4 control chrome reset/);
  assert.match(css, /Stitch dark pro audio redesign v11\.5 compact workstation fit/);
  assert.match(css, /Stitch dark pro audio redesign v11\.6 first-screen scan fit/);
  assert.match(css, /Stitch dark pro audio redesign v11\.7 full-width console order/);
  assert.match(css, /Stitch dark pro audio redesign v11\.8 implicit-column purge/);
  assert.match(css, /Stitch dark pro audio redesign v11\.9 page length discipline/);
  assert.match(css, /Stitch dark pro audio redesign v11\.10 first-screen density/);
  assert.match(css, /Stitch dark pro audio redesign v11\.11 viewport fill/);
  assert.match(css, /--lab-bg:\s*#111319/);
  assert.match(css, /--lab-surface-lowest:\s*#0c0e14/);
  assert.match(css, /--lab-surface:\s*#1d1f26/);
  assert.match(css, /--lab-primary:\s*#8aebff/);
  assert.match(css, /--lab-primary-hot:\s*#2fd9f4/);
  assert.match(css, /--lab-outline-variant:\s*#3c494c/);
  assert.match(css, /\.sidebar\s*\{[\s\S]*background:[\s\S]*var\(--lab-surface-lowest\)/);
  assert.match(css, /\.toolbar\s*\{[\s\S]*backdrop-filter:\s*blur\(18px\)/);
  assert.match(css, /\.content\s*\{[\s\S]*background:[\s\S]*var\(--lab-bg\)/);
  assert.match(css, /\.audio-space::before\s*\{[\s\S]*radial-gradient/);
  assert.match(css, /html,[\s\S]*body\s*\{[\s\S]*background-color:\s*var\(--lab-bg\)\s*!important/);
  assert.match(css, /\.stitch-workbench-board\s*:where\(h1, h2, h3, h4, h5, strong, b, output\)/);
  assert.match(css, /body\.is-direct-workstation-route \.sidebar,[\s\S]*body\.visual-shell-ready \.sidebar/);
  assert.match(css, /\.sidebar\s*\{[\s\S]*grid-column:\s*1\s*!important[\s\S]*grid-row:\s*1\s*!important/);
  assert.match(css, /\.workspace\s*\{[\s\S]*grid-column:\s*2\s*!important[\s\S]*grid-row:\s*1\s*!important/);
  assert.match(css, /body\.is-direct-workstation-route \.workspace,[\s\S]*padding-top:\s*0\s*!important/);
  assert.match(css, /\.sound-family-rail\s*\{[\s\S]*background:\s*rgba\(12,\s*14,\s*20,\s*0\.74\)\s*!important/);
  assert.match(css, /\.sound-lab-mode-switcher \.mode-switch-card,[\s\S]*\.sound-lab-mode-switcher \.mode-switch-copy/);
  assert.match(css, /\.stitch-engine-display\s*\{[\s\S]*height:\s*260px\s*!important/);
  assert.match(css, /\.stitch-display-analyzers \.workbench-panel,[\s\S]*height:\s*100%\s*!important/);
  assert.match(css, /\.stitch-engine-controls\s*\{[\s\S]*height:\s*190px\s*!important/);
  assert.match(css, /\.stitch-engine-bottom\s*\{[\s\S]*height:\s*178px\s*!important/);
  assert.match(css, /@media \(max-width:\s*1120px\)[\s\S]*\.stitch-workbench-board/);
  assert.match(css, /\.signal-atlas-console\.sound-lab-workbench\.synth-workbench-layout\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*!important/);
  assert.match(css, /\.signal-atlas-console > \.workbench-topbar\s*\{[\s\S]*order:\s*1\s*!important/);
  assert.match(css, /\.signal-atlas-console > \.stitch-workbench-board\s*\{[\s\S]*order:\s*3\s*!important/);
  assert.match(css, /\.stitch-workbench-board\s*\{[\s\S]*minmax\(176px,\s*0\.62fr\)[\s\S]*minmax\(420px,\s*1\.55fr\)[\s\S]*minmax\(210px,\s*0\.72fr\)/);
  assert.match(css, /\.stitch-material-column,[\s\S]*\.stitch-visual-column\s*\{[\s\S]*max-height:\s*560px\s*!important[\s\S]*overflow:\s*auto\s*!important/);
  assert.match(css, /\.signal-atlas-console\.sound-lab-workbench\.synth-workbench-layout > :not\(\.atlas-orb\)\s*\{[\s\S]*grid-column:\s*1 \/ span 1\s*!important/);
  assert.match(css, /\.signal-atlas-console > \.workbench-right-rail,[\s\S]*\.signal-atlas-console > \.atlas-right-rail\s*\{[\s\S]*order:\s*6\s*!important/);
  assert.match(css, /\.content \.sound-lab-shell\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*!important[\s\S]*overflow:\s*hidden\s*!important/);
  assert.match(css, /\.stitch-secondary-strip > \*\s*\{[\s\S]*max-height:\s*420px\s*!important[\s\S]*overflow:\s*auto\s*!important/);
  assert.match(css, /\.signal-atlas-console > \.atlas-main-console\s*\{[\s\S]*max-height:\s*980px\s*!important[\s\S]*overflow:\s*auto\s*!important/);
  assert.match(css, /\.content \.view-header p\s*\{[\s\S]*-webkit-line-clamp:\s*1/);
  assert.match(css, /\.sound-family-rail \.material-select-button\s*\{[\s\S]*min-height:\s*50px\s*!important/);
  assert.match(css, /\.signal-atlas-console \.workbench-topbar\s*\{[\s\S]*min-height:\s*72px\s*!important/);
  assert.match(css, /\.signal-atlas-console > \.atlas-signal-ribbon,[\s\S]*\.signal-atlas-console > \.workbench-flow-map\s*\{[\s\S]*max-height:\s*112px\s*!important/);
  assert.match(css, /body\.is-direct-workstation-route \.content,[\s\S]*body\.visual-shell-ready \.content\s*\{[\s\S]*height:\s*calc\(100dvh - 100px\)\s*!important/);
});

test('sound lab workbench follows the supplied Stitch module architecture with real controls', () => {
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  for (const label of ['Learning Step', 'Synth Engine', 'Material Substrate', 'Physical Properties', 'Resonance Topology', 'Texture Morph Matrix']) {
    assert.match(renderJs, new RegExp(label));
  }
  for (const className of ['stitch-workbench-board', 'stitch-learning-step-panel', 'stitch-synth-engine-panel', 'material-substrate-panel', 'physical-properties-panel', 'resonance-topology-panel', 'texture-morph-panel', 'stitch-reference-panel']) {
    assert.match(renderJs, new RegExp(className));
    assert.match(css, new RegExp(`\\.${className}`));
  }
  assert.match(renderJs, /data-beginner-synthesis-step/);
  assert.match(renderJs, /data-workbench-family/);
  assert.match(renderJs, /data-sound-lab-control/);
  assert.match(renderJs, /data-xy-pad/);
  assert.match(renderJs, /data-fx-chain-list/);
  assert.match(appJs, /bindSoundLabControls/);
  assert.match(appJs, /data-sound-lab-play/);
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
  assert.equal(shellJs.includes('\u95B8'), false);
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
  assert.match(appJs, /今日练习处方|一次只改到A\/B|REAPER/);
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

test('aether flow prompt adds adaptive node currents and focused flow lanes', () => {
  const js = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const referenceCss = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const appCss = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(js, /aetherFlowNodes/);
  assert.match(js, /AETHER_FLOW_NODE_COUNT/);
  assert.match(js, /AETHER_NODE_CONNECTION_RADIUS/);
  assert.match(js, /createAetherFlowNode/);
  assert.match(js, /drawAetherNodeCurrents/);
  assert.match(js, /aetherNodeConnections/);
  assert.match(js, /isAetherFlowPaused\(\)[\s\S]*drawAetherNodeCurrents/, 'node currents should pause during direct control drags');
  assert.match(referenceCss, /Reference aether node current v9\.4/);
  assert.match(referenceCss, /\.signal-field::before/);
  assert.match(referenceCss, /@keyframes ref9-node-current/);
  assert.match(referenceCss, /body\.is-direct-manipulating \.signal-field::before[\s\S]*animation-play-state:\s*paused/);
  assert.match(appCss, /\.practice-focus-strip::before/);
  assert.match(appCss, /@keyframes practice-focus-current/);
  assert.match(appCss, /body\.is-direct-manipulating \.practice-focus-strip::before[\s\S]*animation-play-state:\s*paused/);
});

test('aether flow prompt adds cursor wake currents without click flashes', () => {
  const js = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

  assert.match(js, /cursorWakeParticles/);
  assert.match(js, /AETHER_WAKE_MAX_PARTICLES/);
  assert.match(js, /AETHER_WAKE_MIN_DISTANCE/);
  assert.match(js, /function spawnCursorWake/);
  assert.match(js, /function drawCursorFlowWake/);
  assert.match(js, /function spawnCursorWake[\s\S]*isAetherFlowPaused/);
  assert.match(js, /drawAetherCurrentPackets\(time\)[\s\S]*drawCursorFlowWake\(time\)/);
  assert.doesNotMatch(js, /addEventListener\('pointerdown'[\s\S]{0,220}spawnCursorWake/, 'cursor wake must be pointermove-only so clicks do not flash the viewport');
  assert.doesNotMatch(pkg, /framer-motion|lucide-react/);

  assert.match(css, /Reference aether cursor wake v9\.5/);
  assert.match(css, /\.hero-signal-mesh::after/);
  assert.match(css, /\.dashboard-starter-strip::after/);
  assert.match(css, /\.waveform-drill-rail::after/);
  assert.match(css, /\.signal-atlas-console \.waveform-drill-step,[\s\S]*\.sound-lab-workbench \.waveform-drill-step\s*\{[\s\S]*border-radius:\s*14px !important/);
  assert.match(css, /\.signal-atlas-console \.waveform-drill-step,[\s\S]*\.sound-lab-workbench \.waveform-drill-step\s*\{[\s\S]*overflow:\s*hidden !important/);
  assert.match(css, /@keyframes ref9-signal-current/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*ref9-signal-current/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-signal-current/);
});

test('aether flow prompt adds pressure pulses and surface currents without click flashes', () => {
  const js = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');

  assert.match(js, /aetherPressurePulses/);
  assert.match(js, /AETHER_PRESSURE_RADIUS/);
  assert.match(js, /AETHER_FLOW_SURFACE_SELECTOR/);
  assert.match(js, /function spawnAetherPressurePulse/);
  assert.match(js, /function drawAetherPressureField/);
  assert.match(js, /synth:flow-pulse/);
  assert.match(js, /addEventListener\('pointerover'/);
  assert.match(js, /drawRippleField\(time\)[\s\S]*drawAetherPressureField\(time\)/);
  assert.doesNotMatch(js, /addEventListener\('pointerdown'[\s\S]{0,240}spawnAetherPressurePulse/, 'flow pulses must not be click-triggered viewport flashes');

  assert.match(css, /Reference aether pressure flow v9\.6/);
  assert.match(css, /@keyframes ref9-surface-stream/);
  assert.match(css, /\.sound-lab-workbench :where\([\s\S]*\.waveform-drill-step/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*ref9-surface-stream/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-surface-stream/);
});

test('aether flow prompt adds magnetic particle flow lanes and transition-safe edge currents', () => {
  const js = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(js, /aetherMagneticLinks/);
  assert.match(js, /AETHER_MAGNETIC_LINK_COUNT/);
  assert.match(js, /createAetherMagneticLink/);
  assert.match(js, /drawAetherMagneticLinks/);
  assert.match(js, /drawAetherNodeCurrents\(time\)[\s\S]*shouldDrawAetherComplexLayer\('magnetic'\)[\s\S]*drawAetherMagneticLinks\(time\)/);
  assert.match(js, /synth:view-transition[\s\S]*spawnAetherPressurePulse[\s\S]*hue: 'cyan'/);
  assert.doesNotMatch(js, /ctx\.fillStyle\s*=\s*['"]black['"]/, 'Aether flow must not repaint the viewport black like the pasted React demo');

  assert.match(css, /Reference aether magnetic flow v9\.7/);
  assert.match(css, /\.content\.is-view-switching::after/);
  assert.match(css, /@keyframes ref9-route-current/);
  assert.match(css, /@keyframes ref9-magnetic-edge/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*ref9-magnetic-edge/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-route-current/);
  assert.match(html, /visual-space\.js\?v=20260710-route-shell-v17/);
  assert.match(html, /styles-reference\.css\?v=20260709-quality-audition/);
});

test('pasted Aether Flow prompt becomes a soft component-aware flow network', () => {
  const js = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

  assert.match(js, /aetherComponentFlowParticles/);
  assert.match(js, /AETHER_COMPONENT_FLOW_COUNT/);
  assert.match(js, /AETHER_COMPONENT_FLOW_RADIUS/);
  assert.match(js, /function collectAetherComponentFlowTargets/);
  assert.match(js, /function createAetherComponentFlowParticle/);
  assert.match(js, /function resetAetherComponentFlowNetwork/);
  assert.match(js, /function drawAetherComponentFlowNetwork/);
  assert.match(js, /componentFlowPointerPressure/);
  assert.match(js, /drawAetherHeroFlowNetwork\(time\)[\s\S]*drawAetherComponentFlowNetwork\(time\)/);
  assert.doesNotMatch(js, /addEventListener\('pointerdown'[\s\S]{0,260}aetherComponentFlowParticles/, 'component flow must be hover/move driven, not click-flash driven');
  assert.doesNotMatch(pkg, /framer-motion|lucide-react/);

  assert.match(css, /Reference aether component flow v9\.20/);
  assert.match(css, /\.audio-space::before/);
  assert.match(css, /@keyframes ref9-component-flow-sheen/);
  assert.match(css, /@keyframes ref9-component-edge-flow/);
  assert.match(css, /\.content \.sound-lab-workbench :where\([\s\S]*\.translation-monitor-panel/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*ref9-component-edge-flow/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-component-flow-sheen/);
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

  assert.match(html, /src="\.\/src\/app\.js\?v=20260710-course-surface-v18"/);
  assert.match(appJs, /from '\.\/sound-lab-model\.js\?v=20260709-learning-synths-v13'/);
  assert.match(appJs, /from '\.\/audio-player\.js\?v=20260709-learning-synths-v13'/);
  assert.match(appJs, /from '\.\/view-model\.js\?v=20260709-learning-synths-v13'/);
  assert.match(appJs, /from '\.\/render\.js\?v=20260709-learning-synths-v13'/);
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

test('roadmap is an exposed learning route rather than a hidden direct URL', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(html, /data-view="roadmap"[\s\S]*nav-label">学习路线/);
  assert.match(appJs, /\{ view: 'roadmap',[\s\S]*title: '学习路线'/);
});

test('view routing accepts human-readable Sound Lab hash aliases', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /const VIEW_HASH_ALIASES = new Map\(/);
  assert.match(appJs, /\['sound-lab',\s*'soundlab'\]/);
  assert.match(appJs, /\['sound_lab',\s*'soundlab'\]/);
  assert.match(appJs, /\['lab',\s*'soundlab'\]/);
  assert.match(appJs, /function resolveViewHash/);
  assert.match(appJs, /return VIEW_IDS\.has\(normalizedHash\) \? normalizedHash : 'dashboard'/);
  assert.match(appJs, /view:\s*getViewFromHash\(\)/);
  assert.match(appJs, /switchView\(getViewFromHash\(\),\s*\{\s*updateHash:\s*false\s*\}\)/);
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
  assert.match(audioPlayerJs, /sound-lab-model\.js\?v=20260709-quality-audition/);
  assert.match(audioPlayerJs, /sound-lab-processor\.js/);
  assert.match(audioPlayerJs, /sound-lab-processor\.js\?v=20260709-quality-audition/);
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
  assert.match(appJs, /\u4eca\u65e5\u7ec3\u4e60\u63a7\u5236\u53f0/);
  assert.match(appJs, /learning-flow/);
  assert.match(appJs, /\u8d28\u91cf\u5b88\u95e8/);
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

test('sound lab app wires procedural source cards to their own play options', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const soundLabBlock = appJs.match(/function bindSoundLabControls\([\s\S]*?\r?\n}\r?\n\r?\nfunction bindMicroRouteControls/)?.[0] ?? '';

  assert.match(renderJs, /data-procedural-source-play="\$\{escapeHtml\(item\.id/);
  assert.match(appJs, /function getProceduralSourceAudition/);
  assert.match(appJs, /function playProceduralSourceAudition/);
  assert.match(appJs, /source\.playOptions/);
  assert.match(appJs, /state\.activeAdvancedModule = 'advanced'/);
  assert.match(appJs, /data-procedural-source-play/);
  assert.match(soundLabBlock, /playProceduralSourceAudition\(button\.dataset\.proceduralSourcePlay\)/);
  assert.match(soundLabBlock, /\[data-layer-audition\]:not\(\[data-procedural-source-play\]\)/);
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

test('sound lab engines keep a natural release tail instead of hard-cutting ambience', () => {
  const processorJs = readFileSync(new URL('../src/sound-lab-processor.js', import.meta.url), 'utf8');
  const audioPlayerJs = readFileSync(new URL('../src/audio-player.js', import.meta.url), 'utf8');

  assert.match(processorJs, /computeReleaseTailSeconds/);
  assert.match(processorJs, /computeTailReleaseGain/);
  assert.match(processorJs, /const releaseTailSeconds = this\.computeReleaseTailSeconds\(\)/);
  assert.match(processorJs, /if \(t > totalDuration \+ releaseTailSeconds\)/);
  assert.match(processorJs, /const tailReleaseGain = this\.computeTailReleaseGain\(t, totalDuration, releaseTailSeconds\)/);
  assert.doesNotMatch(processorJs, /if \(t > totalDuration\)\s*\{\s*left\[index\] = 0;/);
  assert.match(processorJs, /this\.stereoBusLeft \*= tailReleaseGain/);
  assert.match(processorJs, /this\.stereoBusRight \*= tailReleaseGain/);

  assert.match(audioPlayerJs, /const latestTailSeconds = computePatchReleaseTailSeconds\(patch\)/);
  assert.match(audioPlayerJs, /\(patch\.durationSeconds \+ latestHitSeconds \+ latestTailSeconds\) \* 1000/);
  assert.match(audioPlayerJs, /stopAt \+ latestTailSeconds/);
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

test('xy pad is a professional continuous control with live readout and no rerender flash', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const xyUpdateBlock = appJs.match(/function updateXyPadFromPointer[\s\S]*?\r?\n}\r?\n\r?\nfunction updateMacroMorph/)?.[0] ?? '';
  const xyBindBlock = appJs.match(/document\.querySelectorAll\('\[data-xy-pad\]'\)[\s\S]*?\r?\n\s*\}\);/)?.[0] ?? '';

  assert.match(renderJs, /data-xy-pad[\s\S]*tabindex="0"/);
  assert.match(renderJs, /data-xy-readout/);
  assert.match(renderJs, /aria-valuetext=/);
  assert.match(appJs, /let activeXyPadPointerId = null/);
  assert.match(appJs, /function setXyPadDragging/);
  assert.match(appJs, /function commitXyPadFeedback/);
  assert.match(appJs, /function updateXyPadFromKeyboard/);
  assert.match(appJs, /pad\.addEventListener\('keydown'/);
  assert.match(xyBindBlock, /pad\.focus\?\.\(\{\s*preventScroll:\s*true\s*\}\)/);
  assert.match(appJs, /activeXyPadPointerId !== event\.pointerId/);
  assert.match(appJs, /setXyPadDragging\(pad,\s*true\)/);
  assert.match(appJs, /setXyPadDragging\(pad,\s*false\)/);
  assert.match(xyUpdateBlock, /querySelector\('\[data-xy-readout\]'\)/);
  assert.match(xyUpdateBlock, /pad\.setAttribute\('aria-valuetext'/);
  assert.match(xyUpdateBlock, /pad\.setAttribute\('data-live-value'/);
  assert.match(xyUpdateBlock, /commitXyPadFeedback\(pad,\s*x,\s*y\)/);
  assert.doesNotMatch(xyUpdateBlock, /renderSameView\(|render\(/);
  assert.doesNotMatch(xyBindBlock, /renderSameView\(|render\(/);

  assert.match(css, /XY Pad professional handfeel v9\.25/);
  assert.match(css, /\.xy-pad\.is-dragging/);
  assert.match(css, /\.xy-pad output/);
  assert.match(css, /body\.is-direct-manipulating\s+\.xy-pad\.is-dragging[\s\S]*transition:\s*none !important/);
  assert.match(css, /body\.is-direct-manipulating\s+\.xy-pad\.is-dragging[\s\S]*filter:\s*none !important/);
});

test('fx chain reorder supports drag insertion without rebuilding Sound Lab', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const moveBlock = appJs.match(/function moveFxSlot[\s\S]*?\r?\n}\r?\n\r?\nfunction setXyPadDragging/)?.[0] ?? '';
  const fxBindBlock = appJs.match(/document\.querySelectorAll\('\[data-fx-chain-slot\]'\)[\s\S]*?\r?\n\r?\n\s*document\.querySelectorAll\('\[data-xy-pad\]'\)/)?.[0] ?? '';

  assert.match(renderJs, /data-fx-chain-list/);
  assert.match(renderJs, /role="listbox"/);
  assert.match(renderJs, /data-fx-chain-slot="\$\{escapeHtml\(slot\.id\)\}"[\s\S]*tabindex="0"/);
  assert.match(renderJs, /aria-grabbed="false"/);
  assert.match(renderJs, /aria-posinset="\$\{index \+ 1\}"/);
  assert.match(renderJs, /data-fx-index/);
  assert.match(appJs, /let activeFxSlotId = null/);
  assert.match(appJs, /function applyFxChainOrder/);
  assert.match(appJs, /function refreshFxChainRuntimeUi/);
  assert.match(appJs, /function reorderFxSlot/);
  assert.match(appJs, /function setFxSlotDropMarker/);
  assert.match(appJs, /dragstart/);
  assert.match(appJs, /dragover/);
  assert.match(appJs, /drop/);
  assert.match(appJs, /dragend/);
  assert.match(fxBindBlock, /slot\.addEventListener\('keydown'/);
  assert.match(appJs, /syncActiveSoundLabPatch\(\)/);
  assert.match(appJs, /refreshSoundLabRuntimeUi\(\)/);
  assert.doesNotMatch(moveBlock, /renderSameView\(|render\(/);
  assert.doesNotMatch(fxBindBlock, /renderSameView\(|render\(/);

  assert.match(css, /FX Chain professional reorder v9\.26/);
  assert.match(css, /\.fx-chain-list\.is-reordering/);
  assert.match(css, /\.fx-chain-slot\.is-dragging/);
  assert.match(css, /\.fx-chain-slot\.is-drop-before::before/);
  assert.match(css, /\.fx-chain-slot\.is-drop-after::after/);
  assert.match(css, /body\.is-direct-manipulating\s+\.fx-chain-slot\.is-dragging[\s\S]*transition:\s*none !important/);
  assert.match(css, /body\.is-direct-manipulating\s+\.fx-chain-slot\.is-dragging[\s\S]*filter:\s*none !important/);
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

  assert.match(appJs, /\u8fdb\u5165\u53ef\u8bd5\u542c\u5de5\u4f5c\u53f0/);
  assert.match(appJs, /\u5148\u7ec3\u6ce2\u5f62 \/ ADSR \/ FM/);
  assert.match(appJs, /\u4e3b\u5165\u53e3/);
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
  assert.match(html, /\u6bcf\u65e5\u65b0\u6559\u7a0b/);
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
  assert.match(appJs, /sound-lab-shell learning-synths-shell/);
  assert.match(appJs, /practice-reference-card/);
  assert.doesNotMatch(appJs, /style="margin-top:16px"/);

  assert.match(css, /--panel-soft:\s*rgba\(16,\s*19,\s*31,\s*0\.72\)/);
  assert.match(css, /\.nav-section/);
  assert.match(css, /\.dashboard-module-directory/);
  assert.match(css, /\.module-directory-card/);
  assert.match(css, /\.research-hub-shell/);
  assert.match(css, /\.source-result-toolbar/);
  assert.match(css, /\.learning-synths-clone-frame/);
  assert.match(css, /\.ls-route-panel/);
  assert.match(css, /\.ls-advanced-drawer/);
});

test('dashboard launchpad makes the first four actions visually obvious and touchable', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /dashboard-launchpad/);
  assert.match(appJs, /dashboard-starter-strip/);
  assert.match(appJs, /launchpad-button/);
  assert.match(appJs, /\u4ece\u8fd9\u91cc\u5f00\u59cb/);
  assert.match(appJs, /\u65b0\u624b\u4eca\u65e5\u8def\u5f84/);
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

test('sound lab exposes a Learning Synths style route map and real material family switching', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(appJs, /sound-lab-shell learning-synths-shell/);
  assert.match(appJs, /familyList:\s*soundLabFamilies/);
  assert.match(renderJs, /function renderLearningSynthsFamilyPicker/);
  assert.match(renderJs, /function renderLearningSynthsLessonMap/);
  assert.match(renderJs, /function renderLearningSynthsDragBoard/);
  assert.match(renderJs, /data-workflow-step/);
  assert.match(renderJs, /data-workbench-family/);
  assert.match(renderJs, /ls-family-picker/);
  assert.match(renderJs, /ls-route-panel/);
  assert.match(renderJs, /ls-drag-board/);
  assert.match(appJs, /selectSoundLabFamily/);
  assert.match(appJs, /const focusMode = getSoundLabFocusMode\(\)/);
  assert.match(appJs, /function selectSoundLabFamily[\s\S]*state\.activeWorkbenchModule = focusMode\.workbenchModule/);
  assert.match(appJs, /activeAdvancedModule:\s*'advanced'/);
  assert.match(css, /\.ls-family-picker\s*\{[\s\S]*border:\s*3px solid var\(--ls-navy\)/);
  assert.match(css, /\.ls-route-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.ls-drag-board\s*\{[\s\S]*touch-action:\s*none/);
  assert.match(css, /\.ls-drag-handle\s*\{[\s\S]*left:\s*var\(--xy-x,\s*50%\)/);
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
  assert.match(appJs, /\u672a\u8bc6\u522b\u7684\u5de5\u4f5c\u53f0\u6309\u94ae/);
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
  assert.match(appJs, /activeWaveformDrillStep/);
  assert.match(appJs, /completedWaveformDrillSteps/);
  assert.match(appJs, /function handleWaveformDrillStep\(stepId/);
  assert.match(appJs, /document\.querySelectorAll\('\[data-waveform-drill-step\]'\)/);
  assert.match(appJs, /data-waveform-drill-progress/);
  assert.match(appJs, /scrollSoundLabIntoView\('\.waveform-detective-panel'\)/);
  assert.match(css, /\.waveform-detective-panel\s*\{/);
  assert.match(css, /\.waveform-ingredient-card\s*\{[\s\S]*cursor:\s*default/);
  assert.match(css, /\.waveform-drill-rail\s*\{/);
  assert.match(css, /\.waveform-drill-progress\s*\{/);
  assert.match(css, /\.waveform-drill-grid\s*\{[\s\S]*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /\.waveform-drill-step\s*\{[\s\S]*min-height:\s*168px/);
  assert.match(css, /\.waveform-drill-step\.is-active,[\s\S]*\.waveform-drill-step\.is-complete/);
  assert.match(css, /\.waveform-drill-step:hover,[\s\S]*\.waveform-drill-step:focus-visible\s*\{[\s\S]*transform:\s*translateY\(-2px\)/);
  assert.match(css, /\.waveform-drill-step :where\(p,\s*small,\s*em\)\s*\{[\s\S]*rgba\(244,\s*241,\s*232,\s*0\.72\)/);
  assert.match(css, /@media \(max-width: 880px\)[\s\S]*\.waveform-ingredient-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media \(max-width: 880px\)[\s\S]*\.waveform-drill-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test('waveform ear decision tree is routed, readable, and responsive', () => {
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(modelJs, /buildWaveformEarDecisionTree/);
  assert.match(modelJs, /waveformEarDecisionTree/);
  assert.match(renderJs, /renderWaveformEarDecisionTree/);
  assert.match(renderJs, /waveform-ear-tree/);
  assert.match(renderJs, /data-waveform-ear-clue/);
  assert.match(renderJs, /data-waveform-drill-step/);
  assert.match(renderJs, /data-layer-audition/);
  assert.match(renderJs, /data-workbench-action/);
  assert.match(css, /\.waveform-ear-tree\s*\{[\s\S]*border:\s*1px solid rgba\(110,\s*231,\s*249,\s*0\.18\)/);
  assert.match(css, /\.waveform-ear-clue\s*\{[\s\S]*cursor:\s*pointer/);
  assert.match(css, /\.waveform-ear-clue\.is-active\s*\{[\s\S]*border-color:\s*rgba\(110,\s*231,\s*249,\s*0\.52\)/);
  assert.match(css, /\.waveform-ear-clue :where\(p,\s*small,\s*em,\s*b,\s*dd,\s*code\)\s*\{[\s\S]*rgba\(244,\s*241,\s*232,\s*0\.74\)/);
  assert.match(css, /\.waveform-ear-proof\s*\{[\s\S]*overflow-wrap:\s*anywhere/);
  assert.match(css, /body\.is-direct-manipulating\s+\.waveform-ear-tree::before[\s\S]*animation-play-state:\s*paused !important/);
  assert.match(css, /@media \(max-width: 880px\)[\s\S]*\.waveform-ear-clue-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
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

test('beginner ear chain is visually readable and pauses motion during direct manipulation', () => {
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');

  assert.match(renderJs, /renderEarTrainingChainPanel/);
  assert.match(renderJs, /ear-chain-panel/);
  assert.match(renderJs, /data-ear-chain-step/);
  assert.match(css, /\.ear-chain-panel\s*\{[\s\S]*background:[\s\S]*rgba\(8,\s*10,\s*18,\s*0\.88\)/);
  assert.match(css, /\.ear-chain-panel\s+:where\(p,\s*small,\s*span,\s*em,\s*li\)\s*\{[\s\S]*rgba\(244,\s*247,\s*251,\s*0\.78\)/);
  assert.match(css, /\.ear-chain-step\s*\{[\s\S]*cursor:\s*pointer/);
  assert.match(css, /\.ear-chain-step\.is-active\s*\{[\s\S]*border-color:[\s\S]*rgba\(110,\s*231,\s*249,\s*0\.72\)/);
  assert.match(css, /body\.is-direct-manipulating\s+\.ear-chain-panel::before[\s\S]*animation-play-state:\s*paused !important/);
});

test('material modal body panel keeps dark readable contrast after final cascade', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const lockIndex = css.indexOf('v10.1 modal body material resonance contrast lock');
  const finalShowcaseIndex = css.indexOf('Reference showcase visual system v8.4 final cascade lock');

  assert.ok(lockIndex > finalShowcaseIndex, 'material contrast lock should load after old showcase cascade styles');
  assert.match(css, /\.material-resonance-panel[\s\S]*rgba\(8,\s*10,\s*18,\s*0\.92\)/);
  assert.match(css, /\.material-body-model[\s\S]*rgba\(9,\s*13,\s*24,\s*0\.82\)/);
  assert.match(css, /\.resonance-peak-card[\s\S]*rgba\(13,\s*18,\s*30,\s*0\.86\)/);
  assert.match(css, /\.material-body-metrics article[\s\S]*rgba\(12,\s*18,\s*31,\s*0\.78\)/);
  assert.match(css, /\.material-resonance-panel :where\(p,\s*li,\s*small,\s*span,\s*em,\s*label,\s*dt,\s*dd\)[\s\S]*rgba\(244,\s*241,\s*232,\s*0\.76\)/);
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

test('sound lab first screen keeps the decorative atlas orb out of layout flow', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');

  assert.match(css, /Sound Lab first-screen hierarchy repair/);
  assert.match(css, /\.signal-atlas-console > \.atlas-orb\s*\{[\s\S]*position:\s*absolute !important/);
  assert.match(css, /\.signal-atlas-console > \.atlas-orb\s*\{[\s\S]*pointer-events:\s*none !important/);
  assert.match(css, /\.signal-atlas-console > \.atlas-orb\s*\{[\s\S]*grid-column:\s*auto !important/);
  assert.match(css, /\.signal-atlas-console > \.mission-brief-panel\s*\{[\s\S]*order:\s*2/);
  assert.match(css, /\.signal-atlas-console > \.session-transport-dock\s*\{[\s\S]*order:\s*3/);
  assert.match(css, /\.signal-atlas-console > \.atlas-signal-ribbon\s*\{[\s\S]*order:\s*4/);
  assert.match(css, /\.signal-atlas-console > \.ear-chain-panel\s*\{[\s\S]*order:\s*6/);
  assert.match(css, /\.signal-atlas-console > \.atlas-main-console\s*\{[\s\S]*order:\s*9/);
});

test('sound lab beginner synthesis path is a routed first-screen learning director', () => {
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(modelJs, /function buildBeginnerSynthesisPath/);
  assert.match(modelJs, /beginnerSynthesisPath:\s*buildBeginnerSynthesisPath/);
  assert.match(renderJs, /function renderBeginnerSynthesisPathPanel/);
  assert.match(renderJs, /beginner-synthesis-path-panel/);
  assert.match(renderJs, /data-beginner-synthesis-step/);
  assert.match(renderJs, /data-workbench-action/);
  assert.match(renderJs, /data-layer-audition/);
  assert.match(renderJs, /data-output-compare/);
  assert.match(renderJs, /data-doctor-apply/);
  assert.match(renderJs, /Serum/);
  assert.match(renderJs, /Phase Plant/);
  assert.match(renderJs, /Vital/);
  assert.match(renderJs, /renderWorkbenchFlowMap\(family, options\.activeWorkflowStep, options\.activeAtlasNode\)[\s\S]*renderStitchWorkbenchBoard\(family, model, options/);
  assert.match(renderJs, /renderStitchLearningStepPanel\(model, family\)/);
  assert.match(renderJs, /renderSessionTransportDock\(family, model, \{ \.\.\.options, isPlaying \}\)[\s\S]*renderPracticeFocusStrip\(model\)/);
  assert.match(appJs, /\[data-workbench-action\]/);
  assert.match(appJs, /\[data-layer-audition\]/);
  assert.match(appJs, /\[data-output-compare\]/);
  assert.match(appJs, /\[data-doctor-apply\]/);
  assert.match(css, /Beginner synthesis path v10/);
  assert.match(css, /\.beginner-synthesis-path-panel\s*\{/);
  assert.match(css, /\.beginner-synthesis-grid\s*\{/);
  assert.match(css, /\.beginner-synthesis-step\.is-current\s*\{/);
  assert.match(css, /@media \(max-width:\s*980px\)[\s\S]*\.beginner-synthesis-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test('sound lab beginner synthesis path has a compact current-step focus card', () => {
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(modelJs, /function buildBeginnerFocusCard/);
  assert.match(modelJs, /focusCard:\s*buildBeginnerFocusCard/);
  assert.match(modelJs, /listenQuestionZh/);
  assert.match(modelJs, /oneChangeRuleZh/);
  assert.match(modelJs, /proofQuestionZh/);
  assert.match(renderJs, /beginner-synthesis-focus/);
  assert.match(renderJs, /data-beginner-focus-action/);
  assert.match(renderJs, /data-sound-lab-play/);
  assert.match(renderJs, /data-workbench-action/);
  assert.match(renderJs, /data-output-compare/);
  assert.match(appJs, /\[data-workbench-action\]/);
  assert.match(appJs, /\[data-output-compare\]/);
  assert.match(appJs, /\[data-sound-lab-play\]/);
  assert.match(css, /Beginner synthesis focus card v10\.2/);
  assert.match(css, /\.beginner-synthesis-focus\s*\{/);
  assert.match(css, /\.beginner-focus-actions\s*\{/);
  assert.match(css, /\.beginner-focus-actions button:active\s*\{[\s\S]*transform:\s*translateY\(1px\)/);
  assert.match(css, /body\.is-direct-manipulating\s+\.beginner-synthesis-focus[\s\S]*transition:\s*none !important/);
});

test('sound lab beginner synthesis steps are real route controls rather than passive cards', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');

  assert.match(modelJs, /activeBeginnerStepId/);
  assert.match(appJs, /activeBeginnerSynthesisStepId/);
  assert.match(appJs, /function applyBeginnerSynthesisStep/);
  assert.match(appJs, /data-beginner-synthesis-step/);
  assert.match(appJs, /state\.activeBeginnerSynthesisStepId = step\.id/);
  assert.match(appJs, /state\.soundLabAuditionMode = step\.layerAudition/);
  assert.match(appJs, /state\.soundLabOutputMode = step\.outputMode/);
  assert.match(appJs, /event\.stopImmediatePropagation\(\)/);
  assert.match(appJs, /activeBeginnerStepId: state\.activeBeginnerSynthesisStepId/);
  assert.match(renderJs, /data-active-beginner-step/);
  assert.match(renderJs, /data-beginner-step-role/);
});

test('target match coach is routed, readable, and visually integrated with Signal Atlas', () => {
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(modelJs, /function buildTargetMatchCoach/);
  assert.match(modelJs, /(targetMatchCoach:\s*buildTargetMatchCoach|const targetMatchCoach = buildTargetMatchCoach)/);
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

test('macro knobs expose full-card hot zones without Sound Lab rerender flashes', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const bindRangeBlock = appJs.match(/function bindSmoothRangeInput[\s\S]*?\r?\n}\r?\n\r?\nfunction getActiveLab/)?.[0] ?? '';

  assert.match(appJs, /function macroHotZoneRectForInput/);
  assert.match(appJs, /function updateMacroRangeFromHotZone/);
  assert.match(appJs, /function bindMacroKnobHotZone/);
  assert.match(appJs, /input\.closest\('\.macro-knob'\)/);
  assert.match(appJs, /macroKnob\.addEventListener\('pointerdown'/);
  assert.match(appJs, /event\.target === input/);
  assert.match(appJs, /macroKnob\.setPointerCapture\?\.\(event\.pointerId\)/);
  assert.match(appJs, /macroKnob\.releasePointerCapture\?\.\(event\.pointerId\)/);
  assert.match(appJs, /writeRangeValue\(input,\s*steppedRangeValue\(rawValue/);
  assert.match(appJs, /applyImmediateControlFeedback\(input\)[\s\S]*scheduleRangeChromeUpdate\(input\)[\s\S]*onValue\(input\)/);
  assert.doesNotMatch(bindRangeBlock, /render\(/);
  assert.doesNotMatch(bindRangeBlock, /renderSameView\(/);

  assert.match(css, /Macro hot-zone handfeel v9\.24/);
  assert.match(css, /\.macro-knob\.is-dragging/);
  assert.match(css, /\.macro-knob\.is-dragging[\s\S]*cursor:\s*grabbing/);
  assert.match(css, /body\.is-direct-manipulating\s+\.macro-knob\.is-dragging[\s\S]*transition:\s*none !important/);
  assert.match(css, /body\.is-direct-manipulating\s+\.macro-knob\.is-dragging[\s\S]*filter:\s*none !important/);
});

test('sound lab analyzer coach is readable and tied to live analysis UI', () => {
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /renderAnalyzerCoachPanel/);
  assert.match(renderJs, /analyzer-coach-panel/);
  assert.match(renderJs, /data-analyzer-coach-band/);
  assert.match(renderJs, /renderWorkbenchWaveform\(model\)[\s\S]*renderWorkbenchSpectrum\(model, options\.analyzerMode\)[\s\S]*renderAnalyzerCoachPanel\(model\)/);
  assert.match(css, /\.analyzer-coach-panel\s*\{/);
  assert.match(css, /\.analyzer-coach-grid\s*\{/);
  assert.match(css, /\.analyzer-coach-band\s*\{/);
  assert.match(css, /\.analyzer-coach-band :where\(p,\s*small,\s*dd\)\s*\{[\s\S]*rgba\(244,\s*241,\s*232,\s*0\.72\)/);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*\.analyzer-coach-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});

test('sound lab analyzer coach updates from live analyser frames without rerendering', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /data-analyzer-coach-live/);
  assert.match(renderJs, /class="analyzer-coach-live-status"/);
  assert.match(appJs, /function computeAnalyzerCoachFrame/);
  assert.match(appJs, /function updateAnalyzerCoachRuntimeUi/);
  assert.match(appJs, /drawSoundLabAnalyserFrame\(frame\)[\s\S]*updateAnalyzerCoachRuntimeUi\(workbench,\s*frame\)/);
  assert.doesNotMatch(appJs, /updateAnalyzerCoachRuntimeUi[\s\S]{0,200}render\(/);
  assert.match(appJs, /data-analyzer-coach-band/);
  assert.match(appJs, /--coach-live-value/);
  assert.match(appJs, /data-live-status/);
  assert.match(css, /\.analyzer-coach-live-status\s*\{/);
  assert.match(css, /\.analyzer-coach-band\s*\{[\s\S]*--coach-live-value:\s*var\(--coach-value,\s*50%\)/);
  assert.match(css, /\.analyzer-coach-band \.analyzer-coach-meter i\s*\{[\s\S]*width:\s*var\(--coach-live-value/);
});

test('sound lab spectral balance monitor follows live analyser frames without rerendering', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /data-spectral-balance-live/);
  assert.match(renderJs, /data-spectral-balance-status/);
  assert.match(renderJs, /data-spectral-band-status/);
  assert.match(appJs, /function computeSpectralBalanceLiveFrame/);
  assert.match(appJs, /function updateSpectralBalanceRuntimeUi/);
  assert.match(appJs, /drawSoundLabAnalyserFrame\(frame\)[\s\S]*updateAnalyzerCoachRuntimeUi\(workbench,\s*frame\)[\s\S]*updateSpectralBalanceRuntimeUi\(workbench,\s*frame\)/);
  assert.doesNotMatch(appJs, /updateSpectralBalanceRuntimeUi[\s\S]{0,240}render\(/);
  assert.match(appJs, /data-spectral-balance-live/);
  assert.match(appJs, /--spectral-live-value/);
  assert.match(appJs, /data-spectral-live-status/);
  assert.match(css, /\.spectral-balance-band\s*\{[\s\S]*--spectral-live-value:\s*var\(--spectral-value,\s*50%\)/);
  assert.match(css, /\.spectral-balance-band i b\s*\{[\s\S]*width:\s*var\(--spectral-live-value/);
  assert.match(css, /\.spectral-balance-band\[data-spectral-live-status="active"\]/);
});

test('sound lab waveform fingerprint follows live analyser frames without rerendering', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /data-waveform-fingerprint-live/);
  assert.match(renderJs, /data-waveform-fingerprint-status/);
  assert.match(renderJs, /data-waveform-ingredient-live/);
  assert.match(renderJs, /data-waveform-ingredient-status/);
  assert.match(appJs, /function computeWaveformFingerprintLiveFrame/);
  assert.match(appJs, /function updateWaveformFingerprintRuntimeUi/);
  assert.match(appJs, /drawSoundLabAnalyserFrame\(frame\)[\s\S]*updateSpectralBalanceRuntimeUi\(workbench,\s*frame\)[\s\S]*updateWaveformFingerprintRuntimeUi\(workbench,\s*frame\)/);
  assert.doesNotMatch(appJs, /updateWaveformFingerprintRuntimeUi[\s\S]{0,260}render\(/);
  assert.match(appJs, /data-waveform-ingredient-live/);
  assert.match(appJs, /--ingredient-live/);
  assert.match(appJs, /data-waveform-live-status/);
  assert.match(css, /\.waveform-ingredient-card\s*\{[\s\S]*--ingredient-live:\s*var\(--ingredient,\s*50%\)/);
  assert.match(css, /\.waveform-ingredient-card i\s*\{[\s\S]*width:\s*var\(--ingredient-live/);
  assert.match(css, /\.waveform-ingredient-card\[data-waveform-live-status="active"\]/);
});

test('sound lab live analyzer summaries keep readable Chinese fallback text', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const start = appJs.indexOf('function computeAnalyzerCoachFrame');
  const end = appJs.indexOf('function updateAnalyzerCoachRuntimeUi');
  const block = appJs.slice(start, end);
  const updateStart = appJs.indexOf('function updateAnalyzerCoachRuntimeUi');
  const updateEnd = appJs.indexOf('function drawSoundLabAnalyserFrame');
  const updateBlock = appJs.slice(updateStart, updateEnd);

  assert.ok(start > -1 && end > start, 'computeAnalyzerCoachFrame block should be inspectable');
  assert.doesNotMatch(block, /璧烽|瀹炴椂|棰戣|涓讳綋|楂橀|灏惧|俙/);
  assert.match(block, /summaryZh:\s*`实时读图：\$\{statusByBand\[dominant\]\}/);
  assert.match(block, /statusByBand\[dominant\]/);
  assert.ok(updateStart > -1 && updateEnd > updateStart, 'updateAnalyzerCoachRuntimeUi block should be inspectable');
  assert.doesNotMatch(updateBlock, /runtimeStatusByBand/);
  assert.match(updateBlock, /if \(status\) status\.textContent = analysis\.summaryZh;/);
});

test('sound lab live analyzer coach routes the next one-change action from the dominant band', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /data-analyzer-coach-live-move/);
  assert.match(renderJs, /data-analyzer-coach-live-action/);
  assert.match(renderJs, /data-analyzer-coach-live-parameter/);
  assert.match(appJs, /function getAnalyzerCoachLiveMove/);
  assert.match(appJs, /const ANALYZER_COACH_LIVE_MOVES/);
  assert.match(appJs, /data-analyzer-coach-live-title/);
  assert.match(appJs, /data-analyzer-coach-live-note/);
  assert.match(appJs, /setAttribute\('data-workbench-action',\s*move\.action\)/);
  assert.match(appJs, /setAttribute\('data-analyzer-coach-live-parameter',\s*move\.parameterId\)/);
  assert.match(appJs, /getAnalyzerCoachLiveMove\(analysis\.dominant,\s*analysis\.bands\)/);
  assert.doesNotMatch(appJs, /getAnalyzerCoachLiveMove[\s\S]{0,240}render\(/);
  assert.match(css, /\.analyzer-coach-next\[data-live-move/);
  assert.match(css, /\.analyzer-coach-next\[data-live-move="transient"\]/);
});

test('sound lab coach target buttons highlight the exact parameter after routing', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(renderJs, /data-analyzer-coach-target/);
  assert.match(appJs, /function getWorkbenchCoachTargetSelector/);
  assert.match(appJs, /function focusWorkbenchCoachTarget/);
  assert.match(appJs, /button\?\.dataset\?\.analyzerCoachTarget/);
  assert.match(appJs, /button\?\.dataset\?\.analyzerCoachLiveParameter/);
  assert.match(appJs, /focusWorkbenchCoachTarget\(coachTarget\)/);
  assert.match(appJs, /data-sound-lab-control="\$\{escapeSelector\(targetId\)\}"/);
  assert.match(appJs, /data-envelope-control="\$\{escapeSelector\(targetId\)\}"/);
  assert.match(appJs, /data-sound-lab-layer="\$\{escapeSelector\(targetId\)\}"/);
  assert.match(css, /\.is-coach-target/);
  assert.match(css, /\.range-shell\.is-coach-target/);
  assert.match(css, /\.macro-knob\.is-coach-target/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*\.is-coach-target/);
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
  assert.equal(shellJs.includes('\u95B8'), false);
});

test('reference v9 stays below the final dark pro audio cascade', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const finalUrl = new URL('../styles-reference.css', import.meta.url);

  assert.match(html, /href="\.\/styles-reference\.css(?:\?v=[^"]+)?"[\s\S]*href="\.\/styles\.css\?v=20260709-learning-synths-v13"/);
  assert.ok(existsSync(finalUrl), 'reference layer should remain available but load before the final app stylesheet');

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

test('reference aether flow layer adds subtle streaming motion without drag flash', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');

  assert.match(html, /styles-reference\.css\?v=20260709-quality-audition/);
  assert.match(html, /src="\.\/src\/visual-space\.js\?v=20260710-route-shell-v17/);
  assert.match(css, /Reference aether flow hero current v9\.8/);
  assert.match(css, /\.dashboard-hero::after\s*\{[\s\S]*animation:\s*ref9-hero-scan/);
  assert.match(css, /\.hero-sound-visual::after\s*\{[\s\S]*animation:\s*ref9-core-current/);
  assert.match(css, /\.visual-burger-btn::before\s*\{[\s\S]*animation:\s*ref9-surface-stream/);
  assert.match(css, /\.content\.is-view-switching::after\s*\{[\s\S]*animation:\s*ref9-route-current/);
  assert.match(css, /body\.is-direct-manipulating\s+#particle-canvas\s*\{[\s\S]*opacity:\s*0\.08\s*!important/);
  assert.match(css, /body\.is-direct-manipulating\s+\.hero-sound-visual::after\s*\{[\s\S]*animation-play-state:\s*paused !important/);
  assert.match(visualSpaceJs, /AETHER_CONNECTION_RADIUS/);
  assert.match(visualSpaceJs, /drawAetherCurrentPackets/);
  assert.match(visualSpaceJs, /drawAetherNodeCurrents/);
  assert.match(visualSpaceJs, /synth:view-transition/);
  assert.match(visualSpaceJs, /__synthDirectManipulating/);
});

test('aether flow prompt adds orbital currents while preserving drag-safe motion', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');

  assert.match(html, /styles-reference\.css\?v=20260709-quality-audition/);
  assert.match(html, /src="\.\/src\/visual-space\.js\?v=20260710-route-shell-v17/);
  assert.match(css, /Reference aether orbital flow v9\.9/);
  assert.match(css, /\.dashboard-hero\s+\.hero-copy::after\s*\{[\s\S]*animation:\s*ref9-orbital-copy-current/);
  assert.match(css, /\.signal-atlas-console::after\s*\{[\s\S]*animation:\s*ref9-orbital-console-current/);
  assert.match(css, /\.content:not\(\.is-view-switching\):not\(\.is-same-view-rendering\)\s+\.signal-atlas-console::after\s*\{[\s\S]*animation:\s*ref9-orbital-console-current 28s linear infinite !important/);
  assert.match(css, /body\.is-direct-manipulating\s+\.dashboard-hero\s+\.hero-copy::after[\s\S]*animation-play-state:\s*paused !important/);
  assert.match(visualSpaceJs, /AETHER_ORBITAL_FIELD_COUNT/);
  assert.match(visualSpaceJs, /createAetherOrbitalField/);
  assert.match(visualSpaceJs, /drawAetherOrbitalCurrents/);
  assert.match(visualSpaceJs, /shouldDrawAetherComplexLayer\('orbital'\)[\s\S]*drawAetherOrbitalCurrents\(time\)/);
  assert.doesNotMatch(
    visualSpaceJs,
    /addEventListener\('pointerdown'[\s\S]{0,260}drawAetherOrbitalCurrents/,
    'orbital current layer must be continuous ambient motion, not a click-triggered viewport flash',
  );
});

test('aether flow prompt adds decaying pointer flow and control micro-currents', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /AETHER_POINTER_EASE/);
  assert.match(visualSpaceJs, /AETHER_POINTER_DECAY/);
  assert.match(visualSpaceJs, /targetForce/);
  assert.match(visualSpaceJs, /pointer\.force/);
  assert.match(visualSpaceJs, /pointer\.force \+= \(pointer\.targetForce - pointer\.force\) \* AETHER_POINTER_EASE/);
  assert.match(visualSpaceJs, /pointer\.targetForce = 1/);
  assert.match(visualSpaceJs, /pointer\.targetForce = 0/);
  assert.match(visualSpaceJs, /addEventListener\('pointerleave'/);
  assert.match(visualSpaceJs, /addEventListener\('blur'/);
  assert.match(visualSpaceJs, /const force = Math\.max\(0, 1 - distance \/ AETHER_MOUSE_RADIUS\) \* z \* pointer\.force/);

  assert.match(css, /Reference aether flow prompt polish v9\.10/);
  assert.match(css, /@keyframes ref9-canvas-flow-breath/);
  assert.match(css, /@keyframes ref9-control-current/);
  assert.match(css, /\.sound-lab-workbench :where\([\s\S]*\.engine-mode-button[\s\S]*\)::after/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*ref9-control-current/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-control-current/);
});

test('aether flow prompt adds a connected constellation mesh without canvas flashes', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherConstellationParticles/);
  assert.match(visualSpaceJs, /AETHER_CONSTELLATION_RADIUS/);
  assert.match(visualSpaceJs, /createAetherConstellationParticle/);
  assert.match(visualSpaceJs, /drawAetherConstellationMesh/);
  assert.match(visualSpaceJs, /if \(!isAetherFlowPaused\(\)\) drawAetherConstellationMesh\(time\)/);
  assert.doesNotMatch(visualSpaceJs, /ctx\.fillStyle\s*=\s*['"]black['"]/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react/);

  assert.match(css, /Reference aether constellation mesh v9\.11/);
  assert.match(css, /\.audio-space::before\s*\{[\s\S]*animation:\s*ref9-constellation-drift/);
  assert.match(css, /@keyframes ref9-constellation-drift/);
  assert.match(css, /body\.is-direct-manipulating\s+\.audio-space::before[\s\S]*animation-play-state:\s*paused !important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-constellation-drift/);
});

test('pasted aether flow hero prompt is adapted into an ambient native flow network', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherHeroFlowParticles/);
  assert.match(visualSpaceJs, /AETHER_HERO_FLOW_RADIUS/);
  assert.match(visualSpaceJs, /createAetherHeroFlowParticle/);
  assert.match(visualSpaceJs, /drawAetherHeroFlowNetwork/);
  assert.match(visualSpaceJs, /resetAetherHeroFlowNetwork/);
  assert.match(visualSpaceJs, /shouldDrawAetherComplexLayer\('hero'\)[\s\S]*drawAetherHeroFlowNetwork\(time\)/);
  assert.match(visualSpaceJs, /pointerBoost = Math\.max\(0, 1 - pointerDistance \/ AETHER_HERO_FLOW_RADIUS\) \* pointer\.force/);
  assert.match(visualSpaceJs, /synth:view-transition[\s\S]*resetAetherHeroFlowNetwork/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react/);

  assert.match(css, /Reference aether hero native network v9\.12/);
  assert.match(css, /\.dashboard-hero\.aether-flow-stage::after\s*\{[\s\S]*animation:\s*ref9-aether-hero-flow/);
  assert.match(css, /\.hero-sound-visual\.aether-flow-stage::before\s*\{[\s\S]*animation:\s*ref9-aether-core-flow/);
  assert.match(css, /body\.is-direct-manipulating\s+\.aether-flow-stage::after[\s\S]*animation-play-state:\s*paused !important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-aether-hero-flow/);
});

test('pasted aether flow prompt adds liquid filaments and stage glints without React deps', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherFlowFilaments/);
  assert.match(visualSpaceJs, /AETHER_FLOW_FILAMENT_COUNT/);
  assert.match(visualSpaceJs, /createAetherFlowFilament/);
  assert.match(visualSpaceJs, /drawAetherLiquidFilaments/);
  assert.match(visualSpaceJs, /if \(!isAetherFlowPaused\(\)\) drawAetherLiquidFilaments\(time\)/);
  assert.match(visualSpaceJs, /globalCompositeOperation = 'lighter'/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react|tailwindcss/);

  assert.match(css, /Reference aether liquid filaments v9\.13/);
  assert.match(css, /\.dashboard-hero\.aether-flow-stage\s+\.hero-copy::after\s*\{[\s\S]*animation:\s*ref9-aether-text-glint/);
  assert.match(css, /\.hero-sound-visual\.aether-flow-stage\s+\.hero-reveal-layer::after\s*\{[\s\S]*animation:\s*ref9-aether-orbit-glint/);
  assert.match(css, /body\.is-direct-manipulating\s+\.aether-flow-stage\s+\.hero-copy::after[\s\S]*animation-play-state:\s*paused !important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-aether-text-glint/);
});

test('aether flow prompt adds audio-synced currents without slider flash', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherAudioRipples/);
  assert.match(visualSpaceJs, /AETHER_AUDIO_RIPPLE_MAX/);
  assert.match(visualSpaceJs, /spawnAetherAudioRipple/);
  assert.match(visualSpaceJs, /drawAetherAudioRipples/);
  assert.match(visualSpaceJs, /synth:audio-pulse/);
  assert.match(visualSpaceJs, /if \(!isAetherFlowPaused\(\)\) drawAetherAudioRipples\(time\)/);

  assert.match(appJs, /lastSynthAudioPulseAt/);
  assert.match(appJs, /emitSynthAudioPulse/);
  assert.match(appJs, /new CustomEvent\('synth:audio-pulse'/);
  assert.match(appJs, /emitSynthAudioPulse\(\{ selector, level: safeLevel/);

  assert.match(css, /Reference aether audio reactive flow v9\.14/);
  assert.match(css, /\.sound-lab-workbench\.is-playing::before\s*\{[\s\S]*animation:\s*ref9-audio-current-breathe/);
  assert.match(css, /\.sound-lab-workbench\.is-playing\s+:where\([\s\S]*\.atlas-play-button[\s\S]*\)::after/);
  assert.match(css, /body\.is-direct-manipulating\s+\.sound-lab-workbench\.is-playing::before[\s\S]*animation-play-state:\s*paused !important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-audio-current-breathe/);
  assert.match(css, /Reference aether audio reactive cascade lock v9\.15/);
  assert.match(css, /\.content \.signal-atlas-console\.sound-lab-workbench\.synth-workbench-layout\.is-playing::before[\s\S]*animation:\s*ref9-audio-current-breathe 3\.4s ease-in-out infinite alternate !important/);
  assert.match(css, /body\.is-direct-manipulating \.content \.signal-atlas-console\.sound-lab-workbench\.synth-workbench-layout\.is-playing::before[\s\S]*opacity:\s*0\.08 !important/);
});

test('pasted aether flow prompt adds an adaptive particle mesh without React dependencies', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherAdaptiveMeshParticles/);
  assert.match(visualSpaceJs, /AETHER_ADAPTIVE_MESH_RADIUS/);
  assert.match(visualSpaceJs, /createAetherAdaptiveMeshParticle/);
  assert.match(visualSpaceJs, /rethreadAetherAdaptiveMesh/);
  assert.match(visualSpaceJs, /energizeAetherAdaptiveMesh/);
  assert.match(visualSpaceJs, /drawAetherAdaptiveMesh/);
  assert.match(visualSpaceJs, /if \(particle\.x > width \|\| particle\.x < 0\) particle\.vx = -particle\.vx/);
  assert.match(visualSpaceJs, /mouseRepel = Math\.max\(0, 1 - pointerDistance \/ AETHER_ADAPTIVE_MOUSE_RADIUS\) \* pointer\.force/);
  assert.match(visualSpaceJs, /synth:view-transition[\s\S]*rethreadAetherAdaptiveMesh/);
  assert.match(visualSpaceJs, /synth:audio-pulse[\s\S]*energizeAetherAdaptiveMesh/);
  assert.match(visualSpaceJs, /if \(!isAetherFlowPaused\(\)\) drawAetherAdaptiveMesh\(time\)/);
  assert.doesNotMatch(visualSpaceJs, /fillStyle\s*=\s*['"]black['"]/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react|tailwindcss/);

  assert.match(css, /Reference aether adaptive mesh v9\.16/);
  assert.match(css, /#particle-canvas\s*\{[\s\S]*will-change:\s*opacity,\s*filter/);
  assert.match(css, /body\.is-direct-manipulating #particle-canvas[\s\S]*transition:\s*none !important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*#particle-canvas/);
  assert.match(html, /styles-reference\.css\?v=20260709-quality-audition/);
  assert.match(html, /src="\.\/src\/visual-space\.js\?v=20260710-route-shell-v17"/);
});

test('pasted aether flow prompt adds slow energy rivers and card-edge currents', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherFlowRivers/);
  assert.match(visualSpaceJs, /AETHER_FLOW_RIVER_COUNT/);
  assert.match(visualSpaceJs, /AETHER_FLOW_RIVER_SEGMENTS/);
  assert.match(visualSpaceJs, /createAetherFlowRiver/);
  assert.match(visualSpaceJs, /getAetherFlowRiverPoint/);
  assert.match(visualSpaceJs, /rethreadAetherFlowRivers/);
  assert.match(visualSpaceJs, /drawAetherFlowRivers/);
  assert.match(visualSpaceJs, /drawAetherLiquidFilaments\(time\)[\s\S]*drawAetherFlowRivers\(time\)[\s\S]*drawAetherCurrentPackets\(time\)/);
  assert.match(visualSpaceJs, /synth:view-transition[\s\S]*rethreadAetherFlowRivers/);
  assert.match(visualSpaceJs, /function drawAetherFlowRivers\(time\)[\s\S]*isAetherFlowPaused/);
  assert.doesNotMatch(visualSpaceJs, /fillStyle\s*=\s*['"]black['"]/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react|tailwindcss/);

  assert.match(css, /Reference aether flow river v9\.17/);
  assert.match(css, /\.dashboard-hero\.aether-flow-stage::after,[\s\S]*\.synth-transfer-panel::after/);
  assert.match(css, /\.sound-lab-workbench :where\([\s\S]*\.synth-transfer-panel,[\s\S]*\.target-match-coach-panel[\s\S]*\)::after/);
  assert.match(css, /@keyframes ref9-aether-river-current/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*ref9-aether-river-current/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-aether-river-current/);
});

test('pasted aether flow prompt adds surface threadlines that reweave around interactions', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherSurfaceThreads/);
  assert.match(visualSpaceJs, /AETHER_SURFACE_THREAD_MAX/);
  assert.match(visualSpaceJs, /collectAetherFlowSurfaces/);
  assert.match(visualSpaceJs, /createAetherSurfaceThread/);
  assert.match(visualSpaceJs, /refreshAetherSurfaceThreads/);
  assert.match(visualSpaceJs, /energizeAetherSurfaceThreads/);
  assert.match(visualSpaceJs, /drawAetherSurfaceThreads/);
  assert.match(visualSpaceJs, /synth:view-transition[\s\S]*refreshAetherSurfaceThreads/);
  assert.match(visualSpaceJs, /synth:audio-pulse[\s\S]*energizeAetherSurfaceThreads/);
  assert.match(visualSpaceJs, /if \(!isAetherFlowPaused\(\)\) drawAetherSurfaceThreads\(time\)/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react|tailwindcss/);

  assert.match(css, /Reference aether interaction threadlines v9\.18/);
  assert.match(css, /\.audio-space::after\s*\{[\s\S]*animation:\s*ref9-interaction-thread-drift/);
  assert.match(css, /body\.is-direct-manipulating \.audio-space::after[\s\S]*animation-play-state:\s*paused !important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-interaction-thread-drift/);
});

test('pasted aether flow prompt adds a viscous stream lattice without React dependencies', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherViscousCurrents/);
  assert.match(visualSpaceJs, /AETHER_VISCOUS_CURRENT_COUNT/);
  assert.match(visualSpaceJs, /createAetherViscousCurrent/);
  assert.match(visualSpaceJs, /resetAetherViscousCurrents/);
  assert.match(visualSpaceJs, /energizeAetherViscousCurrents/);
  assert.match(visualSpaceJs, /drawAetherViscousCurrents/);
  assert.match(visualSpaceJs, /if \(!isAetherFlowPaused\(\)\) drawAetherViscousCurrents\(time\)/);
  assert.match(visualSpaceJs, /synth:view-transition[\s\S]*resetAetherViscousCurrents/);
  assert.match(visualSpaceJs, /synth:audio-pulse[\s\S]*energizeAetherViscousCurrents/);
  assert.doesNotMatch(visualSpaceJs, /fillStyle\s*=\s*['"]black['"]/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react|tailwindcss/);

  assert.match(css, /Reference aether viscous stream lattice v9\.19/);
  assert.match(css, /\.hero-status-strip::after,[\s\S]*\.dashboard-actions::after,[\s\S]*\.signal-atlas-console \.workbench-topbar::after/);
  assert.match(css, /@keyframes ref9-viscous-edge-current/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*ref9-viscous-edge-current/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-viscous-edge-current/);
  assert.match(html, /styles-reference\.css\?v=20260709-quality-audition/);
  assert.match(html, /src="\.\/src\/visual-space\.js\?v=20260710-route-shell-v17"/);
});

test('pasted aether flow prompt adds component relay packets without dragging flashes', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherRelayPackets/);
  assert.match(visualSpaceJs, /AETHER_RELAY_PACKET_COUNT/);
  assert.match(visualSpaceJs, /collectAetherComponentRelayLinks/);
  assert.match(visualSpaceJs, /createAetherRelayPacket/);
  assert.match(visualSpaceJs, /resetAetherRelayPackets/);
  assert.match(visualSpaceJs, /energizeAetherRelayPackets/);
  assert.match(visualSpaceJs, /drawAetherComponentRelayPackets/);
  assert.match(visualSpaceJs, /drawAetherComponentFlowNetwork\(time\)[\s\S]*drawAetherComponentRelayPackets\(time\)/);
  assert.match(visualSpaceJs, /synth:view-transition[\s\S]*resetAetherRelayPackets/);
  assert.match(visualSpaceJs, /synth:audio-pulse[\s\S]*energizeAetherRelayPackets/);
  assert.match(visualSpaceJs, /shouldDrawAetherComplexLayer\('relay'\)[\s\S]*drawAetherComponentRelayPackets\(time\)/);
  assert.doesNotMatch(visualSpaceJs, /fillStyle\s*=\s*['"]black['"]/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react|tailwindcss/);

  assert.match(css, /Reference aether relay packet flow v9\.21/);
  assert.match(css, /\.content :where\([\s\S]*\.dashboard-module-directory,[\s\S]*\.learning-flow,[\s\S]*\.workbench-panel[\s\S]*\)::after/);
  assert.match(css, /@keyframes ref9-relay-packet-flow/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*ref9-relay-packet-flow/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-relay-packet-flow/);
});

test('pasted aether flow prompt adds laminar signal curtains without React dependencies', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherLaminarCurrents/);
  assert.match(visualSpaceJs, /AETHER_LAMINAR_CURRENT_COUNT/);
  assert.match(visualSpaceJs, /AETHER_LAMINAR_SEGMENTS/);
  assert.match(visualSpaceJs, /createAetherLaminarCurrent/);
  assert.match(visualSpaceJs, /resetAetherLaminarCurrents/);
  assert.match(visualSpaceJs, /energizeAetherLaminarCurrents/);
  assert.match(visualSpaceJs, /drawAetherLaminarCurrents/);
  assert.match(visualSpaceJs, /if \(!isAetherFlowPaused\(\)\) drawAetherLaminarCurrents\(time\)/);
  assert.match(visualSpaceJs, /synth:view-transition[\s\S]*resetAetherLaminarCurrents/);
  assert.match(visualSpaceJs, /synth:audio-pulse[\s\S]*energizeAetherLaminarCurrents/);
  assert.doesNotMatch(visualSpaceJs, /fillStyle\s*=\s*['"]black['"]/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react|tailwindcss/);

  assert.match(css, /Reference aether laminar signal curtain v9\.22/);
  assert.match(css, /\.signal-field::after/);
  assert.match(css, /@keyframes ref9-laminar-signal-drift/);
  assert.match(css, /body\.is-direct-manipulating[\s\S]*ref9-laminar-signal-drift/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-laminar-signal-drift/);
});

test('aether flow prompt adds a native flow-field particle layer without viewport flashes', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherFlowFieldParticles/);
  assert.match(visualSpaceJs, /AETHER_FLOW_FIELD_COUNT/);
  assert.match(visualSpaceJs, /AETHER_FLOW_FIELD_MOUSE_RADIUS/);
  assert.match(visualSpaceJs, /createAetherFlowFieldParticle/);
  assert.match(visualSpaceJs, /resetAetherFlowField/);
  assert.match(visualSpaceJs, /energizeAetherFlowField/);
  assert.match(visualSpaceJs, /drawAetherFlowFieldNetwork/);
  assert.match(visualSpaceJs, /pointerPressure = Math\.max\(0, 1 - pointerDistance \/ AETHER_FLOW_FIELD_MOUSE_RADIUS\) \* pointer\.force/);
  assert.match(visualSpaceJs, /synth:view-transition[\s\S]*resetAetherFlowField/);
  assert.match(visualSpaceJs, /synth:audio-pulse[\s\S]*energizeAetherFlowField/);
  assert.match(visualSpaceJs, /drawAetherLaminarCurrents\(time\)[\s\S]*drawAetherFlowFieldNetwork\(time\)[\s\S]*drawAetherAdaptiveMesh\(time\)/);
  assert.match(visualSpaceJs, /if \(!isAetherFlowPaused\(\)\) drawAetherFlowFieldNetwork\(time\)/);
  assert.doesNotMatch(visualSpaceJs, /ctx\.fillStyle\s*=\s*['"]black['"]/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react|tailwindcss/);

  assert.match(css, /Reference aether native flow field v9\.23/);
  assert.match(css, /\.audio-space\.is-flow-field-ready #particle-canvas/);
  assert.match(css, /\.content\.is-view-switching::after\s*\{[\s\S]*animation:\s*ref9-route-current/);
  assert.match(css, /body\.is-direct-manipulating #particle-canvas[\s\S]*transition:\s*none !important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*#particle-canvas/);
  assert.match(html, /styles-reference\.css\?v=20260709-quality-audition/);
  assert.match(html, /src="\.\/src\/visual-space\.js\?v=20260710-route-shell-v17"/);
});

test('pasted aether flow prompt adds silk current ribbons without React dependencies', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherSilkCurrents/);
  assert.match(visualSpaceJs, /AETHER_SILK_CURRENT_COUNT/);
  assert.match(visualSpaceJs, /createAetherSilkCurrent/);
  assert.match(visualSpaceJs, /resetAetherSilkCurrents/);
  assert.match(visualSpaceJs, /energizeAetherSilkCurrents/);
  assert.match(visualSpaceJs, /drawAetherSilkCurrents/);
  assert.match(visualSpaceJs, /drawAetherFlowFieldNetwork\(time\)[\s\S]*drawAetherSilkCurrents\(time\)[\s\S]*drawAetherSurfaceThreads\(time\)/);
  assert.match(visualSpaceJs, /synth:view-transition[\s\S]*resetAetherSilkCurrents/);
  assert.match(visualSpaceJs, /synth:audio-pulse[\s\S]*energizeAetherSilkCurrents/);
  assert.match(visualSpaceJs, /if \(!isAetherFlowPaused\(\)\) drawAetherSilkCurrents\(time\)/);
  assert.doesNotMatch(visualSpaceJs, /ctx\.fillStyle\s*=\s*['"]black['"]/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react|tailwindcss/);

  assert.match(css, /Reference aether silk current ribbons v9\.27/);
  assert.match(css, /\.audio-space\.is-flow-field-ready::before\s*\{[\s\S]*animation:\s*ref9-silk-current-drift/);
  assert.match(css, /\.signal-atlas-console \.atlas-command-dock::before,[\s\S]*\.dashboard-hero\.aether-flow-stage \.hero-status-strip::before/);
  assert.match(css, /body\.is-direct-manipulating \.audio-space\.is-flow-field-ready::before[\s\S]*animation-play-state:\s*paused !important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-silk-current-drift/);
  assert.match(html, /styles-reference\.css\?v=20260709-quality-audition/);
  assert.match(html, /src="\.\/src\/visual-space\.js\?v=20260710-route-shell-v17"/);
});

test('pasted aether flow prompt adds a focus lens field without React dependencies', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /aetherFocusLensParticles/);
  assert.match(visualSpaceJs, /AETHER_FOCUS_LENS_COUNT/);
  assert.match(visualSpaceJs, /AETHER_FOCUS_LENS_RADIUS/);
  assert.match(visualSpaceJs, /createAetherFocusLensParticle/);
  assert.match(visualSpaceJs, /resetAetherFocusLens/);
  assert.match(visualSpaceJs, /energizeAetherFocusLens/);
  assert.match(visualSpaceJs, /drawAetherFocusLens/);
  assert.match(visualSpaceJs, /focusLensPressure = Math\.max\(0, 1 - pointerDistance \/ AETHER_FOCUS_LENS_RADIUS\) \* pointer\.force/);
  assert.match(visualSpaceJs, /synth:view-transition[\s\S]*resetAetherFocusLens/);
  assert.match(visualSpaceJs, /synth:audio-pulse[\s\S]*energizeAetherFocusLens/);
  assert.match(visualSpaceJs, /drawAetherSilkCurrents\(time\)[\s\S]*drawAetherFocusLens\(time\)[\s\S]*drawAetherSurfaceThreads\(time\)/);
  assert.match(visualSpaceJs, /if \(!isAetherFlowPaused\(\)\) drawAetherFocusLens\(time\)/);
  assert.doesNotMatch(visualSpaceJs, /ctx\.fillStyle\s*=\s*['"]black['"]/);
  assert.doesNotMatch(pkg, /framer-motion|lucide-react|tailwindcss/);

  assert.match(css, /Reference aether flow focus lens v9\.28/);
  assert.match(css, /\.audio-space\.is-flow-field-ready::after\s*\{[\s\S]*animation:\s*ref9-focus-lens-drift/);
  assert.match(css, /\.dashboard-hero\.aether-flow-stage \.hero-reveal-layer::before,[\s\S]*\.sound-lab-workbench \.macro-control-panel::before/);
  assert.match(css, /body\.is-direct-manipulating \.audio-space\.is-flow-field-ready::after[\s\S]*animation-play-state:\s*paused !important/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*ref9-focus-lens-drift/);
});

test('sound lab renders procedural source map with playable layer routes', () => {
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const modelJs = readFileSync(new URL('../src/sound-lab-model.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');

  assert.match(modelJs, /proceduralSourceMap:\s*buildProceduralSourceMap/);
  assert.match(renderJs, /function renderProceduralSourceMapPanel/);
  assert.match(renderJs, /model\.proceduralSourceMap/);
  assert.match(renderJs, /class="procedural-source-panel/);
  assert.match(renderJs, /data-layer-audition="\$\{escapeHtml\(item\.layerAudition\)\}"/);
  assert.match(renderJs, /item\.generatorShape\.map/);
  assert.match(renderJs, /renderProceduralSourceMapPanel\(model\)/);
  assert.match(css, /\.procedural-source-panel/);
  assert.match(css, /\.procedural-source-grid/);
  assert.match(css, /\.procedural-source-card/);
  assert.match(css, /\.procedural-source-card:active/);
});

test('procedural source map stays readable inside the dark Sound Lab workbench', () => {
  const css = readFileSync(new URL('../styles-reference.css', import.meta.url), 'utf8');

  assert.match(css, /Sound Lab procedural source readability patch/);
  assert.match(css, /\.sound-lab-workbench \.procedural-source-panel\s*\{[\s\S]*background:[\s\S]*rgba\(8,\s*10,\s*18,\s*0\.84\)/);
  assert.match(css, /\.sound-lab-workbench \.procedural-source-head strong\s*\{[\s\S]*color:\s*var\(--ref9-paper/);
  assert.match(css, /\.sound-lab-workbench \.procedural-source-card\s*\{[\s\S]*background:[\s\S]*rgba\(12,\s*18,\s*30,\s*0\.88\)/);
  assert.match(css, /\.sound-lab-workbench \.procedural-source-card :where\(strong,\s*span,\s*em,\s*li,\s*p,\s*small\)\s*\{[\s\S]*color:\s*var\(--ref9-paper/);
  assert.match(css, /\.sound-lab-workbench \.procedural-source-proof\s*\{[\s\S]*background:\s*rgba\(12,\s*18,\s*30,\s*0\.72\)/);
});

test('headline reveal segments Chinese text without mojibake regexes', () => {
  const shellJs = readFileSync(new URL('../src/shell-visuals.js', import.meta.url), 'utf8');

  assert.match(shellJs, /function segmentHeadlineText/);
  assert.match(shellJs, /Intl\.Segmenter/);
  assert.match(shellJs, /Array\.from\(text\)/);
  assert.doesNotMatch(shellJs, /閳闁竱濡珅缁眧婕東娼€/);
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
  assert.equal(shellJs.includes('\u95B8'), false);
});
test('Sound Lab quality auditions are real playback routes and do not trigger full view rerenders', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const bindBlock = appJs.match(/function bindSoundLabControls\([\s\S]*?\r?\n}\r?\n\r?\nfunction bindMicroRouteControls/)?.[0] ?? '';

  assert.match(appJs, /function buildQualityAuditionOverrides/);
  assert.match(appJs, /function playQualityAudition/);
  assert.match(appJs, /qualityBypass/);
  assert.match(bindBlock, /data-quality-audition/);
  assert.match(bindBlock, /playQualityAudition\(button\.dataset\.qualityAudition/);
  assert.doesNotMatch(bindBlock, /data-quality-audition[\s\S]{0,260}renderSameView\(/);
});

test('direct Sound Lab routes use a lean aether visual budget for smoother workstation startup', () => {
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const shellJs = readFileSync(new URL('../src/shell-visuals.js', import.meta.url), 'utf8');

  assert.match(visualSpaceJs, /function getInitialRouteId/);
  assert.match(visualSpaceJs, /function isDirectWorkstationRoute/);
  assert.match(visualSpaceJs, /function scaleAetherCount/);
  assert.match(visualSpaceJs, /AETHER_DIRECT_ROUTE_SCALE/);
  assert.match(visualSpaceJs, /scaleAetherCount\(120,\s*54,\s*Math\.floor\(\(width \* height\) \/ 18000\)\)/);
  assert.match(visualSpaceJs, /scaleAetherCount\(\s*AETHER_FLOW_FIELD_COUNT/);
  assert.match(visualSpaceJs, /function shouldDrawAetherComplexLayer/);
  assert.match(visualSpaceJs, /if \(shouldDrawAetherComplexLayer\('hero'\)\)/);
  assert.match(visualSpaceJs, /if \(shouldDrawAetherComplexLayer\('relay'\)\)/);
  assert.match(visualSpaceJs, /if \(shouldDrawAetherComplexLayer\('magnetic'\)\)/);
  assert.match(visualSpaceJs, /if \(shouldDrawAetherComplexLayer\('orbital'\)\)/);
  assert.match(shellJs, /body\.classList\.toggle\('is-direct-workstation-route'/);
  assert.match(shellJs, /addEventListener\('hashchange',\s*markRouteMode/);
});

test('only Sound Lab uses the direct workstation shell', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const shellJs = readFileSync(new URL('../src/shell-visuals.js', import.meta.url), 'utf8');
  const visualSpaceJs = readFileSync(new URL('../src/visual-space.js', import.meta.url), 'utf8');
  const appDirectViews = appJs.match(/const DIRECT_WORKSTATION_VIEWS = new Set\([\s\S]*?\]\);/)?.[0] ?? '';
  const shellRouteMode = shellJs.match(/function markRouteMode\([\s\S]*?\r?\n}\r?\n/)?.[0] ?? '';
  const visualRouteMode = visualSpaceJs.match(/function isDirectWorkstationRoute\([\s\S]*?\r?\n}\r?\n/)?.[0] ?? '';

  for (const block of [appDirectViews, shellRouteMode, visualRouteMode]) {
    assert.match(block, /soundlab/);
    assert.doesNotMatch(block, /interactive|challenges|deep|community/);
  }
});

test('programmatic view switching keeps the outer route shell in sync', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const switchViewBlock = appJs.match(/function switchView\([\s\S]*?\r?\n}\r?\n\r?\nfunction rangePercentFromInput/)?.[0] ?? '';

  assert.match(appJs, /const DIRECT_WORKSTATION_VIEWS = new Set\(\[/);
  assert.match(appJs, /function syncShellRouteMode\(viewId = state\.view\)/);
  assert.match(appJs, /body\.classList\.toggle\('is-direct-workstation-route', DIRECT_WORKSTATION_VIEWS\.has\(viewId\)\)/);
  assert.match(appJs, /document\.documentElement\.classList\.toggle\('ls-boot-route', viewId === 'soundlab'\)/);
  assert.match(switchViewBlock, /syncShellRouteMode\(nextView\);/);
});

test('pages workflow publishes the static site to gh-pages without failing deploy-pages mode', () => {
  const pagesWorkflow = readFileSync(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');

  assert.match(pagesWorkflow, /branches:\s*\["main"\]/);
  assert.match(pagesWorkflow, /contents:\s*write/);
  assert.match(pagesWorkflow, /actions\/setup-node@v4/);
  assert.match(pagesWorkflow, /node-version:\s*"20"/);
  assert.match(pagesWorkflow, /styles-reference\.css/);
  assert.match(pagesWorkflow, /git fetch origin gh-pages/);
  assert.match(pagesWorkflow, /git worktree add _gh_pages/);
  assert.match(pagesWorkflow, /git push origin HEAD:gh-pages/);
  assert.doesNotMatch(pagesWorkflow, /actions\/deploy-pages/);
  assert.doesNotMatch(pagesWorkflow, /pages:\s*write/);
});

test('daily video sync keeps the reference visual stylesheet in gh-pages publishes', () => {
  const workflow = readFileSync(new URL('../.github/workflows/daily-video-sync.yml', import.meta.url), 'utf8');

  assert.match(workflow, /Publish static site to gh-pages/);
  assert.match(workflow, /styles-reference\.css/);
  assert.match(workflow, /git push origin HEAD:gh-pages/);
});

test('Sound Lab now mounts a Learning Synths style lesson shell as the visible workbench', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const renderJs = readFileSync(new URL('../src/render.js', import.meta.url), 'utf8');
  const soundLabViewBlock = appJs.match(/function renderSoundLabView\([\s\S]*?\r?\n}\r?\n\r?\nfunction renderMicroView/)?.[0] ?? '';

  assert.match(renderJs, /function renderLearningSynthsCloneLayout/);
  assert.match(renderJs, /data-learning-synths-clone="v14"/);
  assert.match(renderJs, /class="ls-chapter-rail"/);
  assert.match(renderJs, /class="ls-mission-bar"/);
  assert.match(renderJs, /class="ls-live-lab-grid"/);
  assert.match(renderJs, /class="ls-control-stack"/);
  assert.match(renderJs, /class="ls-learning-deck"/);
  assert.match(renderJs, /class="ls-drag-board"/);
  assert.match(renderJs, /data-xy-pad/);
  assert.match(renderJs, /data-sound-lab-play/);
  assert.match(renderJs, /LEARNING_SYNTHS_WAVEFORMS/);
  assert.match(renderJs, /ls-legacy-fixture/);
  assert.match(soundLabViewBlock, /sound-lab-shell learning-synths-shell/);
  assert.match(soundLabViewBlock, /familyList:\s*soundLabFamilies/);
  assert.match(soundLabViewBlock, /activeWaveform:\s*state\.activeWaveform/);
  assert.doesNotMatch(soundLabViewBlock, /view-header/);
  assert.doesNotMatch(soundLabViewBlock, /sound-family-rail/);
});

test('Learning Synths clone CSS keeps the rebuilt studio hierarchy readable and motion-safe', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const v12Index = css.indexOf('Learning Synths clarity rebuild v14');
  const darkIndex = css.indexOf('Stitch dark pro audio redesign v11.11');

  assert.ok(v12Index > darkIndex, 'Learning Synths clone reset must win the final cascade');
  assert.match(css, /--ls-page:\s*#ffffff/);
  assert.match(css, /--ls-navy:\s*#00004c/);
  assert.match(css, /--ls-pink:\s*#ff6577/);
  assert.match(css, /body\.is-direct-workstation-route:has\(\.learning-synths-clone\) \.sidebar/);
  assert.match(css, /body\.is-direct-workstation-route:has\(\.learning-synths-clone\) \.toolbar/);
  assert.match(css, /\.learning-synths-clone-frame\s*\{[\s\S]*grid-template-columns:\s*88px minmax\(0,\s*1fr\)/);
  assert.match(css, /\.ls-hero h1\s*\{[\s\S]*font-size:\s*clamp\(64px,\s*9vw,\s*132px\)/);
  assert.match(css, /\.ls-drag-board\s*\{[\s\S]*border:\s*5px solid var\(--ls-navy\)/);
  assert.match(css, /\.ls-drag-handle\s*\{[\s\S]*background:\s*var\(--ls-pink\) !important/);
  assert.match(css, /body\.is-direct-manipulating \.learning-synths-clone/);
  assert.match(css, /\.ls-live-lab-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1\.25fr\) minmax\(320px,\s*0\.75fr\)/);
  assert.match(css, /\.ls-mission-bar\s*\{[\s\S]*border-bottom:\s*3px solid var\(--ls-navy\)/);
  assert.match(css, /\.ls-learning-deck\s*\{[\s\S]*background:\s*var\(--ls-gray\)/);
  assert.match(css, /\.ls-legacy-fixture\s*\{[\s\S]*display:\s*none !important/);
});

test('Sound Lab boot route hides legacy chrome before the app finishes rendering', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(html, /document\.documentElement\.classList\.add\('ls-boot-route'\)/);
  assert.match(html, /html\.ls-boot-route \.sidebar/);
  assert.match(html, /html\.ls-boot-route \.toolbar/);
  assert.match(css, /:root\.ls-boot-route \.visual-splash/);
  assert.match(css, /:root\.ls-boot-route \.workspace/);
});

test('all non-lab routes render in the shared learning course shell', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  assert.match(appJs, /const LEARNING_ROUTE_META = new Map\(/);
  assert.match(appJs, /function wrapLearningRoute\(/);
  assert.match(appJs, /class="learning-route-shell/);
  assert.match(appJs, /state\.view === 'soundlab' \? rendered : wrapLearningRoute\(state\.view, rendered\)/);
});

test('course surface metadata covers every non-lab route and preserves interactive contracts', () => {
  const appJs = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

  for (const route of ['dashboard', 'sources', 'daily', 'cards', 'interactive', 'micro', 'challenges', 'techniques', 'community', 'deep', 'roadmap', 'diagrams', 'recipes', 'practice', 'integrations']) {
    assert.match(appJs, new RegExp(`\\['${route}', \\{`));
  }
  assert.match(appJs, /data-daily-filter/);
  assert.match(appJs, /data-lab-id/);
  assert.match(appJs, /data-integration-action/);
});

test('course surface styles use the Learning Synths visual language across ordinary routes', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.learning-route-shell\s*\{[\s\S]*--ls-page/);
  assert.match(css, /\.learning-route-content\s*\{/);
  assert.match(css, /body\.is-learning-course-route \.sidebar/);
  assert.match(css, /\.learning-route-rail/);
  assert.match(css, /\.learning-route-topbar/);
});
