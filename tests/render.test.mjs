import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sources,
  knowledgeCards,
  recipes,
  roadmapLessons,
  learningPathUnits,
  principleDiagrams,
  interactiveLabs,
  microLearningTracks,
  microLessons,
  soundChallenges,
  materialLabs,
  techniqueTips,
  communityTechniqueLabs,
  deepDiveModules,
  synthModulationGuides,
} from '../src/content.js';
import { buildDefaultLabState, buildLabVisualModel } from '../src/lab-engine.js';
import { buildDefaultMaterialState, buildMaterialVisualModel } from '../src/challenge-model.js';
import { BASIC_WAVEFORMS } from '../src/audio-model.js';
import {
  renderSourceCard,
  renderKnowledgeCard,
  renderRecipeCard,
  renderLessonCard,
  renderLearningUnitCard,
  renderPrincipleDiagram,
  renderInteractiveLab,
  renderMicroLessonCard,
  renderMicroTrackPanel,
  renderSoundChallenge,
  renderSoundLabWorkbench,
  renderMaterialLab,
  renderTechniqueTipCard,
  renderCommunityTechniqueLab,
  renderDeepDiveModuleCard,
} from '../src/render.js';
import { soundLabFamilies } from '../src/content.js';
import { SOUND_LAB_MACROS, buildSoundLabViewModel } from '../src/sound-lab-model.js';

test('renderSourceCard includes title, platform, credibility, and link', () => {
  const html = renderSourceCard(sources[0]);
  assert.match(html, /href="https:\/\//);
  assert.match(html, new RegExp(sources[0].platform));
  assert.match(html, new RegExp(sources[0].credibility));
});

test('renderKnowledgeCard includes Chinese explanation, evidence, and synth mappings', () => {
  const card = knowledgeCards[0];
  const html = renderKnowledgeCard(card, sources);
  assert.match(html, new RegExp(card.titleZh));
  assert.match(html, /原理/);
  assert.match(html, /来源/);
});

test('renderRecipeCard includes REAPER steps and acceptance checks', () => {
  const recipe = recipes[0];
  const html = renderRecipeCard(recipe);
  assert.match(html, new RegExp(recipe.titleZh));
  assert.match(html, /REAPER/);
  assert.match(html, /验收/);
});

test('renderLessonCard includes lesson index and practice output', () => {
  const lesson = roadmapLessons[0];
  const html = renderLessonCard(lesson, 0);
  assert.match(html, /01/);
  assert.match(html, new RegExp(lesson.titleZh));
  assert.match(html, /产出/);
});

test('renderLearningUnitCard includes steps, practice, checks, and linked diagrams', () => {
  const unit = learningPathUnits[0];
  const html = renderLearningUnitCard(unit, principleDiagrams, 0);
  assert.match(html, /学习步骤/);
  assert.match(html, /REAPER 练习/);
  assert.match(html, /验收/);
  assert.match(html, new RegExp(unit.titleZh));
  assert.match(html, /<svg/);
});

test('renderPrincipleDiagram includes inline svg and accessible caption', () => {
  const diagram = principleDiagrams[0];
  const html = renderPrincipleDiagram(diagram);
  assert.match(html, new RegExp(diagram.titleZh));
  assert.match(html, /<svg/);
  assert.match(html, /原理图/);
});

test('renderInteractiveLab includes controls, visual model, synth mappings, and REAPER practice', () => {
  const lab = interactiveLabs[0];
  const state = buildDefaultLabState(lab);
  const visualModel = buildLabVisualModel(lab, state);
  const linkedUnits = learningPathUnits.filter((unit) => lab.linkedUnitIds.includes(unit.id));
  const html = renderInteractiveLab(lab, visualModel, linkedUnits, state, {
    waveforms: BASIC_WAVEFORMS,
    activeWaveform: 'square',
    isAuditioning: true,
  });

  assert.match(html, /互动实验/);
  assert.match(html, new RegExp(lab.titleZh));
  assert.match(html, /type="range"/);
  assert.match(html, /data-lab-control="attack"/);
  assert.match(html, /class="range-shell"/);
  assert.match(html, /--range-value:/);
  assert.match(html, /data-adsr-handle="attack"/);
  assert.match(html, /data-adsr-handle="decay-sustain"/);
  assert.match(html, /data-adsr-handle="release"/);
  assert.match(html, /data-waveform="sine"/);
  assert.match(html, /data-waveform="square"/);
  assert.match(html, /data-waveform="sawtooth"/);
  assert.match(html, /data-waveform="triangle"/);
  assert.match(html, /data-audition-toggle/);
  assert.match(html, /停止/);
  assert.match(html, /macro-mod-panel/);
  assert.match(html, /data-lab-macro="tone"/);
  assert.match(html, /data-lab-macro="motion"/);
  assert.match(html, /data-lab-macro="space"/);
  assert.match(html, /<svg/);
  assert.match(html, /操作步骤/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /REAPER/);
  assert.match(html, new RegExp(linkedUnits[0].titleZh));
});

test('renderMicroTrackPanel and renderMicroLessonCard expose fine-grained lesson evidence', () => {
  const track = microLearningTracks[0];
  const lesson = microLessons.find((item) => item.trackId === track.id);
  const trackHtml = renderMicroTrackPanel(track, true, 0);
  const lessonHtml = renderMicroLessonCard(lesson, sources, 0);

  assert.match(trackHtml, /data-micro-track-id/);
  assert.match(trackHtml, new RegExp(track.titleZh));
  assert.match(lessonHtml, /微课/);
  assert.match(lessonHtml, /来源依据/);
  assert.match(lessonHtml, /声音练习/);
  assert.match(lessonHtml, /听辨提示/);
  assert.match(lessonHtml, /参数落点/);
  assert.match(lessonHtml, /常见误区/);
  assert.match(lessonHtml, /Serum/);
  assert.match(lessonHtml, new RegExp(lesson.titleZh));
});

test('renderSoundChallenge includes playable A/B controls and answer buttons', () => {
  const challenge = soundChallenges[0];
  const html = renderSoundChallenge(challenge, { selectedAnswerId: challenge.answerId, result: { correct: true, explanationZh: challenge.explanationZh } });

  assert.match(html, /data-challenge-play="a"/);
  assert.match(html, /data-challenge-answer/);
  assert.match(html, /答对/);
  assert.match(html, new RegExp(challenge.promptZh.slice(0, 8)));
});

test('renderSoundLabWorkbench exposes AudioWorklet controls, A/B comparison, and REAPER export', () => {
  const family = soundLabFamilies[0];
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS);
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    workletReady: true,
    isPlaying: true,
  });

  assert.match(html, /sound-lab-workbench/);
  assert.match(html, /data-sound-lab-play/);
  assert.match(html, /data-sound-lab-ab="a"/);
  assert.match(html, /data-sound-lab-ab="b"/);
  assert.match(html, /data-sound-lab-control="brightness"/);
  assert.match(html, /data-sound-lab-control="material"/);
  assert.match(html, /AudioWorklet/);
  assert.match(html, /频谱/);
  assert.match(html, /REAPER/);
  assert.match(html, /来源依据/);
});

test('renderSoundLabWorkbench matches the light synth workstation reference modules', () => {
  const family = soundLabFamilies[0];
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
  });
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    workletReady: true,
    toneReady: true,
    engineMode: 'hq',
    engineUsed: 'tone',
    isPlaying: false,
  });

  assert.match(html, /synth-workbench-layout/);
  assert.match(html, /workbench-main-grid/);
  assert.match(html, /workbench-core/);
  assert.match(html, /workbench-right-rail/);
  assert.match(html, /source-inspector-panel/);
  assert.match(html, /learning-step-panel/);
  assert.match(html, /reaper-export-panel/);
  assert.match(html, /route-progress-panel/);
  assert.match(html, /quick-entry-panel/);
  assert.match(html, /data-synth-tab="serum"/);
  assert.match(html, /data-synth-tab="phase-plant"/);
  assert.match(html, /data-synth-tab="vital"/);
  assert.match(html, /data-module-tab="envelope"/);
  assert.match(html, /data-workbench-action="save-patch"/);
  assert.match(html, /data-workbench-action="export-preset"/);
  assert.match(html, /ADSR 包络/);
  assert.match(html, /来源快照/);
  assert.match(html, /学习步骤/);
  assert.match(html, /REAPER 导出清单/);
  assert.match(html, /学习路线进度/);
  assert.match(html, /快速入口/);
  assert.match(html, /输出电平/);
  assert.match(html, /材质选择/);
  assert.match(html, /怎么用这个工作台/);
  assert.match(html, /先选目标音效/);
  assert.match(html, /再调声音结构/);
  assert.match(html, /最后导出复盘/);
  assert.match(html, /data-workbench-action="focus-controls"/);
  assert.match(html, /data-workbench-action="focus-coach"/);
  assert.match(html, /workbench-zone-title/);
  assert.match(html, /01 监听与频谱/);
  assert.match(html, /02 参数塑形/);
  assert.match(html, /03 合成器调制教练/);

  const phasePlantHtml = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    activeWorkbenchSynth: 'phase-plant',
  });
  assert.match(phasePlantHtml, /class="synth-tab is-active" type="button" data-synth-tab="phase-plant"/);
});

test('renderSoundLabWorkbench exposes module coaching with concrete synth steps', () => {
  const family = soundLabFamilies[0];
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS);
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    modulationGuides: synthModulationGuides,
    activeModulationGuideId: 'mod-coach-modmatrix',
  });

  assert.match(html, /workbench-coach-panel/);
  assert.match(html, /data-mod-guide="mod-coach-modmatrix"/);
  assert.match(html, /data-guide-load="mod-coach-modmatrix"/);
  assert.match(html, /data-guide-preview="mod-coach-modmatrix"/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /调制矩阵/);
});

test('renderMaterialLab includes playable material controls, visual model, and synth mappings', () => {
  const material = materialLabs[0];
  const materialState = buildDefaultMaterialState(material);
  const visualModel = buildMaterialVisualModel(material, materialState);
  const html = renderMaterialLab(material, visualModel, materialState, { isPlaying: true });

  assert.match(html, /data-material-play/);
  assert.match(html, /data-material-control="brightness"/);
  assert.match(html, /class="range-shell"/);
  assert.match(html, /--range-value:/);
  assert.match(html, /材质试听/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /<svg/);
});

test('renderTechniqueTipCard includes principle, effect chain, synth mappings, and REAPER drill', () => {
  const tip = techniqueTips[0];
  const html = renderTechniqueTipCard(tip, sources);

  assert.match(html, new RegExp(tip.titleZh));
  assert.match(html, /技巧原理/);
  assert.match(html, /效果链顺序/);
  assert.match(html, /Serum/);
  assert.match(html, /REAPER/);
  assert.match(html, /正确度验证/);
  assert.match(html, /听感检查/);
  assert.match(html, /参数边界/);
  assert.match(html, /常见误区/);
  assert.match(html, /来源依据/);
});

test('renderCommunityTechniqueLab exposes source-backed interactive creator practice controls', () => {
  const lab = communityTechniqueLabs[0];
  const html = renderCommunityTechniqueLab(lab, sources, {
    isActive: true,
    controlValues: Object.fromEntries(lab.controls.map((control) => [control.id, control.default])),
  });

  assert.match(html, new RegExp(lab.titleZh));
  assert.match(html, /非官方博主技巧/);
  assert.match(html, /观看任务/);
  assert.match(html, /详细方法/);
  assert.match(html, /这个模块怎么用/);
  assert.match(html, /community-module-guide/);
  assert.match(html, /调制蓝图/);
  assert.match(html, /三合成器参数步骤/);
  assert.match(html, /community-synth-procedure/);
  assert.match(html, /合成器路径图/);
  assert.match(html, /community-synth-route-map/);
  assert.match(html, /data-community-synth-route/);
  assert.match(html, /场景练习/);
  assert.match(html, /community-practice-scenes/);
  assert.match(html, /data-community-practice-scene/);
  assert.match(html, /交互练习/);
  assert.match(html, /data-community-technique/);
  assert.match(html, /data-community-control/);
  assert.match(html, /data-community-focus-preset/);
  assert.match(html, /data-community-load-soundlab/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /来源依据/);
});

test('renderDeepDiveModuleCard exposes deep analysis, practice stages, and evidence', () => {
  const module = deepDiveModules[0];
  const html = renderDeepDiveModuleCard(module, sources, { isActive: true });

  assert.match(html, new RegExp(module.titleZh));
  assert.match(html, /深度解析/);
  assert.match(html, /解析问题/);
  assert.match(html, /信号链拆解/);
  assert.match(html, /参数边界/);
  assert.match(html, /听感测试/);
  assert.match(html, /实践阶段/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /REAPER/);
  assert.match(html, /实践交付/);
  assert.match(html, /故障诊断/);
  assert.match(html, /来源依据/);
});

test('renderSoundLabWorkbench exposes preset DNA, quality mode, layer mixer, and source license controls', () => {
  const family = soundLabFamilies[0];
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    layerMix: { transient: 72, body: 70, texture: 45, tail: 32 },
  });
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    workletReady: true,
    isPlaying: false,
  });

  assert.match(html, /data-sound-lab-dna="vital-metal-modal-hit"/);
  assert.match(html, /data-sound-lab-quality="studio"/);
  assert.match(html, /data-sound-lab-layer="transient"/);
  assert.match(html, /data-sound-lab-layer="body"/);
  assert.match(html, /data-sound-lab-layer="texture"/);
  assert.match(html, /data-sound-lab-layer="tail"/);
  assert.match(html, /data-sound-lab-source-drawer/);
  assert.match(html, /Preset DNA/);
  assert.match(html, /Layer Mixer/);
  assert.match(html, /License/);
});

test('renderSoundLabWorkbench exposes HQ engine, playable keyboard, and FX rack controls', () => {
  const family = soundLabFamilies.find((item) => item.id === 'energy-charge');
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS, {
    engineMode: 'hq',
    performance: { note: 'C3', velocity: 76, glide: 18, hold: false, octave: 0 },
  });
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    engineMode: 'hq',
    engineUsed: 'tone',
    toneReady: true,
    workletReady: true,
    isPlaying: false,
  });

  assert.match(html, /data-sound-lab-engine="hq"/);
  assert.match(html, /data-sound-lab-engine="worklet"/);
  assert.match(html, /data-sound-lab-engine="webaudio"/);
  assert.match(html, /Tone\.js/);
  assert.match(html, /data-sound-lab-key="C3"/);
  assert.match(html, /data-sound-lab-key="B3"/);
  assert.match(html, /data-performance-control="velocity"/);
  assert.match(html, /data-performance-control="glide"/);
  assert.match(html, /data-performance-hold/);
  assert.match(html, /fx-rack-panel/);
  assert.match(html, /data-sound-lab-ab="tone"/);
});

test('renderSoundLabWorkbench exposes advanced modules and live analyzer canvases', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS, {
    engineMode: 'hq',
    xyPad: { x: 64, y: 38 },
    macroMorph: 52,
  });
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    engineMode: 'hq',
    engineUsed: 'tone',
    toneReady: true,
    workletReady: true,
    isPlaying: false,
  });

  assert.match(html, /data-analyzer-waveform/);
  assert.match(html, /data-analyzer-spectrum/);
  assert.match(html, /data-analyzer-meter/);
  assert.match(html, /data-advanced-module="mod-matrix"/);
  assert.match(html, /data-advanced-module="envelope-editor"/);
  assert.match(html, /data-advanced-module="fx-chain"/);
  assert.match(html, /data-active-advanced-panel="advanced"/);
  assert.match(html, /Advanced Panel/);

  const matrixHtml = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id, activeAdvancedModule: 'mod-matrix' });
  const fxHtml = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id, activeAdvancedModule: 'fx-chain' });
  const xyHtml = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id, activeAdvancedModule: 'xy-pad' });
  const libraryHtml = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id, activeAdvancedModule: 'batch-export' });

  assert.match(matrixHtml, /data-mod-route-amount/);
  assert.match(fxHtml, /data-fx-chain-slot="filter"/);
  assert.match(xyHtml, /data-xy-pad/);
  assert.match(xyHtml, /data-macro-morph/);
  assert.match(libraryHtml, /data-git-sync-action="pull"/);
  assert.match(libraryHtml, /data-midi-learn/);
  assert.match(libraryHtml, /data-export-name-pattern/);
});
