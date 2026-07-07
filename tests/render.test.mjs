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
  renderDailyVideoCard,
} from '../src/render.js';
import { soundLabFamilies } from '../src/content.js';
import { SOUND_LAB_MACROS, buildSoundLabViewModel } from '../src/sound-lab-model.js';

test('renderSourceCard includes title, platform, credibility, and link', () => {
  const html = renderSourceCard(sources[0]);
  assert.match(html, /href="https:\/\//);
  assert.match(html, new RegExp(sources[0].platform));
  assert.match(html, new RegExp(sources[0].credibility));
});

test('renderDailyVideoCard exposes synced tutorial metadata and practice actions', () => {
  const video = {
    id: 'daily-demo',
    platform: 'YouTube',
    title: 'How to Make Metallic UI Hits in Serum with FM and Comb Filters',
    creator: 'Creator Lab',
    url: 'https://www.youtube.com/watch?v=metal001',
    durationLabel: '8:25',
    publishedAt: '2026-06-14',
    discoveredAt: '2026-06-15T00:00:00.000Z',
    statusZh: '待整理',
    difficulty: 'intermediate',
    tags: ['Serum', 'metal', 'FM', 'comb filter'],
    learningNoteZh: '适合拆金属质感：重点观察 FM 侧频和梳状共振。',
    practicePromptZh: '在 Sound Lab 里加载金属材质，用短 Decay 复刻一次。',
  };

  const html = renderDailyVideoCard(video);
  assert.match(html, /daily-video-card/);
  assert.match(html, /data-daily-video-id="daily-demo"/);
  assert.match(html, /Creator Lab/);
  assert.match(html, /待整理/);
  assert.match(html, /FM/);
  assert.match(html, /data-daily-video-action="open"/);
  assert.match(html, /data-daily-video-action="practice"/);
  assert.match(html, /https:\/\/www\.youtube\.com\/watch\?v=metal001/);
  assert.match(html, /daily-video-open-link/);
  assert.match(html, /打开视频页/);
  assert.match(html, /aria-label="打开视频页：How to Make Metallic UI Hits in Serum with FM and Comb Filters"/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /daily-video-url/);
});

test('renderDailyVideoCard shows a disabled open state when a synced tutorial has no URL', () => {
  const html = renderDailyVideoCard({
    id: 'daily-missing-url',
    platform: 'YouTube',
    title: 'Pending URL Tutorial',
    creator: 'Creator Lab',
    statusZh: '待精读',
    tags: ['Serum'],
    learningNoteZh: '等待补充来源链接。',
    practicePromptZh: '先在 Sound Lab 做参数拆解。',
  });

  assert.doesNotMatch(html, /href="undefined"/);
  assert.match(html, /daily-video-open-link is-disabled/);
  assert.match(html, /视频链接待补/);
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

test('renderSoundLabWorkbench matches the premium synth workstation reference modules', () => {
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
  assert.match(html, /workbench-module-map/);
  assert.match(html, /模块速查/);
  assert.match(html, /ADSR \/ 宏控制/);
  assert.match(html, /data-workbench-module-jump="mod-matrix"/);
  assert.match(html, /data-workbench-module-jump="coach"/);
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

  const modMatrixMapHtml = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    activeWorkflowStep: 'shape',
    activeAdvancedModule: 'mod-matrix',
  });
  assert.match(modMatrixMapHtml, /data-workbench-module-jump="mod-matrix" aria-pressed="true"/);
  assert.doesNotMatch(modMatrixMapHtml, /data-workbench-module-jump="fx-chain" aria-pressed="true"/);

  const coachMapHtml = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    activeWorkflowStep: 'shape',
    activeAdvancedModule: 'mod-matrix',
    activeModuleMapId: 'coach',
  });
  assert.match(coachMapHtml, /data-workbench-module-jump="coach" aria-pressed="true"/);
  assert.doesNotMatch(coachMapHtml, /data-workbench-module-jump="mod-matrix" aria-pressed="true"/);
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

test('renderSoundLabWorkbench teaches beginners how to infer basic waveform ingredients', () => {
  const family = soundLabFamilies[0];
  const model = buildSoundLabViewModel(family, {
    brightness: 78,
    motion: 42,
    material: 86,
    space: 30,
    variation: 55,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /waveform-detective-panel/);
  assert.match(html, /波形拆解/);
  assert.match(html, /Sine/);
  assert.match(html, /Square/);
  assert.match(html, /Saw/);
  assert.match(html, /Noise/);
  assert.match(html, /data-workbench-action="focus-waveform"/);
  assert.match(html, /先听纯音锚点/);
});

test('renderSoundLabWorkbench exposes a guided A/B practice loop for beginners', () => {
  const family = soundLabFamilies[0];
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /practice-loop-panel/);
  assert.match(html, /听辨闭环/);
  assert.match(html, /只改一个参数/);
  assert.match(html, /REAPER 记录句式/);
  assert.match(html, /data-workbench-action="focus-practice-loop"/);
  assert.match(html, /data-workbench-action="compare-view"/);
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
  assert.match(html, /参数翻译台/);
  assert.match(html, /一步一步复刻/);
  assert.match(html, /操作步骤/);
  assert.match(html, /建议范围/);
  assert.match(html, /听感检查/);
  assert.match(html, /data-community-parameter-card/);
  assert.match(html, /交互练习/);
  assert.match(html, /data-community-technique/);
  assert.match(html, /data-community-control/);
  assert.match(html, /data-community-focus-preset/);
  assert.match(html, /data-community-load-soundlab/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /来源依据/);

  const phasePlantRouteHtml = renderCommunityTechniqueLab(lab, sources, { activeCommunitySynthRoute: 'phasePlant' });
  assert.match(phasePlantRouteHtml, /class="is-active" type="button" data-community-synth-route="phasePlant"/);
  assert.match(phasePlantRouteHtml, /Generator|Group|Snapin/);
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

test('renderSoundLabWorkbench explains synth realism controls in the quality card', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 74,
    motion: 58,
    material: 82,
    space: 52,
    variation: 68,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /Unison/);
  assert.match(html, /Drift/);
  assert.match(html, /Stereo/);
  assert.match(html, /合成器真实感/);
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
