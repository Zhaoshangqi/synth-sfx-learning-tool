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
  assert.match(html, /data-output-compare="raw"/);
  assert.match(html, /data-output-compare="comfort"/);
  assert.match(html, /data-output-compare="studio"/);
  assert.match(html, /Raw/);
  assert.match(html, /Comfort/);
  assert.match(html, /Studio/);
  assert.match(html, /data-sound-lab-control="brightness"/);
  assert.match(html, /data-sound-lab-control="material"/);
  assert.match(html, /AudioWorklet/);
  assert.match(html, /频谱/);
  assert.match(html, /REAPER/);
  assert.match(html, /来源依据/);
});

test('renderSoundLabWorkbench keeps core listening controls in a first-screen session dock', () => {
  const family = soundLabFamilies[0];
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS, {
    outputMode: 'comfort',
    workflowStep: 'source',
  });
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    activeWorkflowStep: 'source',
    isPlaying: false,
  });
  const dockIndex = html.indexOf('session-transport-dock');
  const analyzerIndex = html.indexOf('atlas-lab-stage');
  const supportIndex = html.indexOf('atlas-support-grid');

  assert.ok(dockIndex > -1, 'session dock should render near the top of Sound Lab');
  assert.ok(analyzerIndex > -1, 'main analyzer stage should still render');
  assert.ok(supportIndex > -1, 'secondary support grid should still render');
  assert.ok(dockIndex < analyzerIndex, 'session dock should appear before the deep analyzer stage');
  assert.ok(dockIndex < supportIndex, 'session dock should appear before lower support modules');
  assert.match(html, /data-sound-lab-play/);
  assert.match(html, /data-output-compare="raw"/);
  assert.match(html, /data-output-compare="comfort"/);
  assert.match(html, /data-output-compare="studio"/);
  assert.match(html, /data-session-jump="playback"/);
  assert.match(html, /data-session-jump="coach"/);
  assert.match(html, /当前练习|Current Session/);
  assert.match(html, /先听|Raw|Comfort|Studio/);
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
  assert.match(html, /stitch-workbench-board/);
  assert.match(html, /Learning Step/);
  assert.match(html, /Synth Engine/);
  assert.match(html, /Material Substrate/);
  assert.match(html, /Physical Properties/);
  assert.match(html, /Resonance Topology/);
  assert.match(html, /Texture Morph Matrix/);
  assert.match(html, /02 Advanced Panel/);
  assert.match(html, /高级编辑区保留 Mod Matrix、FX Chain、A\/B、项目库、MIDI 和导出命名/);
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
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    activeWaveformDrillStep: 'body-solo',
    completedWaveformDrillSteps: ['anchor', 'body-solo'],
  });

  assert.match(html, /waveform-detective-panel/);
  assert.match(html, /波形拆解/);
  assert.match(html, /Sine/);
  assert.match(html, /Square/);
  assert.match(html, /Saw/);
  assert.match(html, /Noise/);
  assert.match(html, /data-workbench-action="focus-waveform"/);
  assert.match(html, /先听纯音锚点/);
  assert.match(html, /waveform-drill-rail/);
  assert.match(html, /data-waveform-drill-step="anchor"/);
  assert.match(html, /data-waveform-drill-step="body-solo"/);
  assert.match(html, /data-waveform-drill-step="edge-sweep"/);
  assert.match(html, /data-waveform-drill-step="ab-proof"/);
  assert.match(html, /data-sound-lab-play/);
  assert.match(html, /data-layer-audition="body"/);
  assert.match(html, /data-workbench-action="focus-controls"/);
  assert.match(html, /data-output-compare="comfort"/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /REAPER|A\/B/);
  assert.match(html, /waveform-drill-progress/);
  assert.match(html, /data-waveform-drill-feedback=/);
  assert.match(html, /data-waveform-drill-next=/);
  assert.match(html, /class="waveform-drill-step is-complete"/);
  assert.match(html, /class="waveform-drill-step is-active is-complete"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /当前训练/);
  assert.match(html, /下一步/);
});

test('renderSoundLabWorkbench exposes live waveform fingerprint hooks for beginner ear training', () => {
  const family = soundLabFamilies[0];
  const model = buildSoundLabViewModel(family, {
    brightness: 74,
    motion: 28,
    material: 66,
    space: 22,
    variation: 48,
  }, {
    qualityMode: 'studio',
    layerMix: { transient: 72, body: 78, texture: 34, tail: 18 },
  });
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
  });

  assert.match(html, /data-waveform-fingerprint-live/);
  assert.match(html, /data-waveform-fingerprint-status/);
  assert.match(html, /waveform-fingerprint-live-status/);
  assert.match(html, /data-waveform-ingredient-live="sine"/);
  assert.match(html, /data-waveform-ingredient-live="square"/);
  assert.match(html, /data-waveform-ingredient-live="saw"/);
  assert.match(html, /data-waveform-ingredient-live="triangle"/);
  assert.match(html, /data-waveform-ingredient-live="noise"/);
  assert.match(html, /data-waveform-ingredient-status/);
  assert.match(html, /--ingredient-live:/);
  assert.match(html, /等待实时信号/);
});

test('renderSoundLabWorkbench renders a waveform ear decision tree with routed clue actions', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact') ?? soundLabFamilies[0];
  const model = buildSoundLabViewModel(family, {
    brightness: 88,
    motion: 38,
    material: 86,
    space: 34,
    variation: 28,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'source',
    layerMix: { transient: 82, body: 68, texture: 84, tail: 36 },
  });
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    activeWaveformEarClue: model.waveformEarDecisionTree.activeClueId,
  });

  assert.match(html, /waveform-ear-tree/);
  assert.match(html, /Waveform Ear Decision Tree|波形听辨决策树|听辨决策树/);
  assert.match(html, /听到什么|反推|基础波形/);
  assert.match(html, /谐波|噪声|非谐波|包络/);
  assert.match(html, /data-waveform-ear-clue="/);
  assert.match(html, /data-waveform-drill-step="body-solo"/);
  assert.match(html, /data-waveform-drill-step="edge-sweep"/);
  assert.match(html, /data-layer-audition="texture"|data-layer-audition="transient"|data-layer-audition="body"/);
  assert.match(html, /data-workbench-action="focus-controls"|data-workbench-action="focus-practice-loop"|data-workbench-action="focus-material-resonance"/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /REAPER|A\/B/);
  assert.match(html, /wrong-trap|误判/);
  assert.match(html, /full \/ body-only \/ texture-only \/ tail-only|full.*body.*texture.*tail/i);
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

test('renderSoundLabWorkbench exposes a beginner listening compass with routed actions', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact') ?? soundLabFamilies[0];
  const model = buildSoundLabViewModel(family, {
    brightness: 76,
    motion: 44,
    material: 88,
    space: 66,
    variation: 38,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    workflowStep: 'shape',
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /listening-compass-panel/);
  assert.match(html, /听辨导航/);
  assert.match(html, /起音/);
  assert.match(html, /主体/);
  assert.match(html, /尾巴/);
  assert.match(html, /data-workbench-action="focus-controls"/);
  assert.match(html, /data-workbench-action="focus-practice-loop"/);
  assert.match(html, /只改一个参数/);
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

test('renderSoundLabWorkbench exposes a beginner-readable Performance Feel panel', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 78,
    motion: 64,
    material: 88,
    space: 48,
    variation: 56,
  }, {
    qualityMode: 'studio',
    performance: { note: 'D3', velocity: 104, glide: 48, hold: false, octave: 0 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id, engineMode: 'worklet' });

  assert.match(html, /performance-feel-panel/);
  assert.match(html, /Performance Feel|演奏手感/);
  assert.match(html, /data-performance-feel-play="gesture"/);
  assert.match(html, /data-performance-feel-apply="tight"/);
  assert.match(html, /data-performance-feel-apply="expressive"/);
  assert.match(html, /performance-feel-meter/);
  assert.match(html, /三连|力度|微漂移|空间/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /REAPER/);
});

test('renderSoundLabWorkbench exposes layer audition buttons for realistic SFX listening', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 82,
    motion: 52,
    material: 86,
    space: 46,
    variation: 38,
  }, {
    qualityMode: 'studio',
    layerMix: { transient: 88, body: 74, texture: 64, tail: 42 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /layer-audition-strip/);
  assert.match(html, /data-layer-audition="full"/);
  assert.match(html, /data-layer-audition="transient"/);
  assert.match(html, /data-layer-audition="body"/);
  assert.match(html, /data-layer-audition="texture"/);
  assert.match(html, /data-layer-audition="tail"/);
  assert.match(html, /分层试听|Layer Audition|solo/i);
  assert.match(html, /transient|body|texture|tail/i);
});

test('renderSoundLabWorkbench renders a material resonance map with playable body audition', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 78,
    motion: 48,
    material: 88,
    space: 42,
    variation: 36,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /material-resonance-panel/);
  assert.match(html, /Material Resonance|材质共振地图/);
  assert.match(html, /data-layer-audition="body"/);
  assert.match(html, /data-workbench-action="focus-material-resonance"/);
  assert.match(html, /Serum|Phase Plant|Vital|REAPER/);
  assert.match(html, /Hz|ratio|decay|Q|峰/);
});

test('renderSoundLabWorkbench shows modal body diffusion inside material resonance guidance', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 82,
    motion: 46,
    material: 92,
    space: 42,
    variation: 58,
  }, {
    engineMode: 'worklet',
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'studio',
    layerMix: { transient: 86, body: 78, texture: 62, tail: 44 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });
  const resonanceBlock = html.match(/<section class="workbench-panel material-resonance-panel"[\s\S]*?<\/section>/)?.[0] ?? '';

  assert.ok(resonanceBlock, 'material resonance panel should render as a distinct panel');
  assert.match(resonanceBlock, /material-body-model/);
  assert.match(resonanceBlock, /Modal Body|material body|modal/i);
  assert.match(resonanceBlock, /Detune|Spread|Damping|Stereo|Strike|Excitation/i);
  assert.match(resonanceBlock, /body-only|spectrum|A\/B|REAPER/i);
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
  assert.match(html, /Comfort|舒适度/);
  assert.match(html, /Polish/);
  assert.match(html, /glue \+ guard|后级|抛光/i);
  assert.match(html, /de-harsh|刺耳|headroom|余量/i);
  assert.match(html, /合成器真实感/);
});

test('renderSoundLabWorkbench renders perceptual calibration as beginner quality guidance', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 86,
    motion: 54,
    material: 88,
    space: 46,
    variation: 48,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /polish-calibration-panel/);
  assert.match(html, /Perceptual Calibration|音质校准/);
  assert.match(html, /响度匹配/);
  assert.match(html, /刺耳控制/);
  assert.match(html, /低频居中|声像锚定/);
  assert.match(html, /尾巴避让/);
  assert.match(html, /Raw|Comfort|Studio|-14 LUFS/);
});

test('renderSoundLabWorkbench renders a sound quality coach with a real one-click repair action', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 96,
    motion: 26,
    material: 92,
    space: 82,
    variation: 30,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 92, body: 54, texture: 86, tail: 88 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /sound-quality-coach-panel/);
  assert.match(html, /音质听诊台|质量教练/);
  assert.match(html, /响度余量|刺耳风险|主体锚点|尾巴遮挡|层级平衡/);
  assert.match(html, /data-quality-coach-apply="/);
  assert.match(html, /一键|试修|优先/);
  assert.match(html, /只改一个|A\/B|验证/);
});

test('renderSoundLabWorkbench renders a first-screen Mission Brief with actionable beginner steps', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 88,
    motion: 36,
    material: 84,
    space: 64,
    variation: 34,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'source',
    layerMix: { transient: 86, body: 58, texture: 74, tail: 62 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /mission-brief-panel/);
  assert.match(html, /Mission Brief|听|改|验|交付/);
  assert.match(html, /只改一个|A\/B|REAPER|记录/);
  assert.match(html, /data-workbench-action="focus-source"/);
  assert.match(html, /data-workbench-action="focus-controls"/);
  assert.match(html, /data-workbench-action="focus-practice-loop"/);
  assert.match(html, /data-workbench-action="focus-export"/);
});

test('renderSoundLabWorkbench renders a compact practice focus rail before deep modules', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 92,
    motion: 34,
    material: 88,
    space: 72,
    variation: 42,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 90, body: 58, texture: 82, tail: 78 },
  });
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    activeWorkflowStep: 'shape',
  });
  const focusIndex = html.indexOf('practice-focus-strip');
  const analyzerIndex = html.indexOf('atlas-lab-stage');

  assert.ok(focusIndex > -1, 'practice focus rail should render on the first screen');
  assert.ok(analyzerIndex > -1, 'main analyzer stage should still render');
  assert.ok(focusIndex < analyzerIndex, 'practice focus rail should appear before deep analyzer controls');
  assert.match(html, /Practice Focus|练习焦点|Focus Rail/);
  assert.match(html, /data-practice-focus-step="listen"/);
  assert.match(html, /data-practice-focus-step="isolate"/);
  assert.match(html, /data-practice-focus-step="adjust"/);
  assert.match(html, /data-practice-focus-step="verify"/);
  assert.match(html, /data-sound-lab-play/);
  assert.match(html, /data-layer-audition="/);
  assert.match(html, /data-doctor-apply="/);
  assert.match(html, /data-output-compare="comfort"/);
  assert.match(html, /只改一个|A\/B|REAPER/);
});

test('renderSoundLabWorkbench renders a routed beginner ear chain as the main learning path', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 92,
    motion: 36,
    material: 88,
    space: 58,
    variation: 42,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 90, body: 58, texture: 82, tail: 76 },
  });
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    activeWorkflowStep: 'shape',
  });
  const focusIndex = html.indexOf('practice-focus-strip');
  const chainIndex = html.indexOf('ear-chain-panel');
  const analyzerIndex = html.indexOf('atlas-main-console');

  assert.ok(chainIndex > -1, 'beginner ear chain should render on the first screen');
  assert.ok(focusIndex > -1, 'practice focus should still render');
  assert.ok(analyzerIndex > -1, 'main atlas console should still render');
  assert.ok(focusIndex < chainIndex, 'ear chain should follow the compact current-practice rail');
  assert.ok(chainIndex < analyzerIndex, 'ear chain should teach the route before deep analyzer controls');
  assert.match(html, /Beginner Ear Chain|听音诊断链/);
  assert.match(html, /波形|起音|主体|尾巴|A\/B|REAPER/);
  assert.match(html, /data-ear-chain-step="waveform-map"/);
  assert.match(html, /data-ear-chain-step="time-split"/);
  assert.match(html, /data-ear-chain-step="layer-solo"/);
  assert.match(html, /data-ear-chain-step="one-change"/);
  assert.match(html, /data-ear-chain-step="ab-proof"/);
  assert.match(html, /data-workbench-action="focus-waveform"/);
  assert.match(html, /data-workbench-action="focus-practice-loop"/);
  assert.match(html, /data-layer-audition="body"/);
  assert.match(html, /data-doctor-apply="/);
  assert.match(html, /data-output-compare="comfort"/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
});

test('renderSoundLabWorkbench renders a target match coach with routed one-change practice', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 92,
    motion: 34,
    material: 88,
    space: 68,
    variation: 32,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 88, body: 58, texture: 78, tail: 72 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /target-match-coach-panel/);
  assert.match(html, /Target Match|目标匹配/);
  assert.match(html, /target-match-meter/);
  assert.match(html, /target-match-challenge/);
  assert.match(html, /data-target-match-action="/);
  assert.match(html, /data-workbench-action="focus-controls"/);
  assert.match(html, /data-doctor-apply="/);
  assert.match(html, /只改一个|One Change/);
  assert.match(html, /REAPER note|REAPER 记录/);
});

test('renderSoundLabWorkbench renders a synth transfer plan with real routed actions', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 92,
    motion: 34,
    material: 88,
    space: 68,
    variation: 32,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 88, body: 58, texture: 78, tail: 72 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /synth-transfer-panel/);
  assert.match(html, /Synth Transfer|三合成器迁移/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /REAPER|A\/B|dry|full|tail/);
  assert.match(html, /data-synth-transfer-step="serum"/);
  assert.match(html, /data-synth-transfer-step="phasePlant"/);
  assert.match(html, /data-synth-transfer-step="vital"/);
  assert.match(html, /data-doctor-apply="/);
  assert.match(html, /data-workbench-action="focus-practice-loop"/);
  assert.match(html, /data-workbench-action="focus-export"/);
});

test('renderSoundLabWorkbench renders playable reference match controls', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 94,
    motion: 28,
    material: 92,
    space: 76,
    variation: 44,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'compare',
    layerMix: { transient: 92, body: 44, texture: 86, tail: 82 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /reference-match-panel/);
  assert.match(html, /参考目标|Reference Match/);
  assert.match(html, /data-target-reference-play="current"/);
  assert.match(html, /data-target-reference-play="target"/);
  assert.match(html, /data-target-reference-play="nudge"/);
  assert.match(html, /data-target-reference-apply="nudge"/);
  assert.match(html, /reference-control-row/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /REAPER/);
});

test('renderSoundLabWorkbench renders a perceptual signature coach for realistic synth tone', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 82,
    motion: 58,
    material: 88,
    space: 42,
    variation: 36,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 82, body: 66, texture: 72, tail: 44 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /perceptual-signature-panel/);
  assert.match(html, /听感指纹|Perceptual Signature|真实感/);
  assert.match(html, /signature-proof-card/);
  assert.match(html, /signature-next-move/);
  assert.match(html, /signature-synth-map/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /REAPER|A\/B|dry|full/);
  assert.match(html, /data-workbench-action="focus-controls"|data-workbench-action="focus-practice-loop"|data-workbench-action="analyze-patch"/);
});

test('renderSoundLabWorkbench shows motion bus realism in the quality card', () => {
  const family = soundLabFamilies.find((item) => item.id === 'energy-charge');
  const model = buildSoundLabViewModel(family, {
    brightness: 76,
    motion: 82,
    material: 62,
    space: 68,
    variation: 74,
  }, {
    qualityMode: 'studio',
    outputMode: 'studio',
    workflowStep: 'shape',
    layerMix: { transient: 62, body: 72, texture: 76, tail: 70 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });
  const qualityBlock = html.match(/<section class="workbench-panel patch-quality-card"[\s\S]*?<\/section>/)?.[0] ?? '';

  assert.ok(qualityBlock, 'quality card should render as a distinct panel');
  assert.match(qualityBlock, /Micro Motion|生命感|微动态/);
  assert.match(qualityBlock, /transient shield|tail bloom|wow|瞬态|尾巴/i);
});

test('renderSoundLabWorkbench explains dynamic detail polish as snap glue and silk', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 84,
    motion: 58,
    material: 88,
    space: 38,
    variation: 62,
  }, {
    qualityMode: 'studio',
    outputMode: 'studio',
    workflowStep: 'shape',
    layerMix: { transient: 92, body: 82, texture: 64, tail: 34 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });
  const qualityBlock = html.match(/<section class="workbench-panel patch-quality-card"[\s\S]*?<\/section>/)?.[0] ?? '';

  assert.ok(qualityBlock, 'quality card should render as a distinct panel');
  assert.match(qualityBlock, /Dynamic Detail|动态细节|细节抛光/);
  assert.match(qualityBlock, /snap|glue|silk|瞬态|粘合|柔化/i);
});

test('renderSoundLabWorkbench teaches temporal masking in the quality card', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 82,
    motion: 48,
    material: 88,
    space: 76,
    variation: 52,
  }, {
    qualityMode: 'studio',
    outputMode: 'studio',
    workflowStep: 'shape',
    layerMix: { transient: 92, body: 64, texture: 72, tail: 86 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });
  const qualityBlock = html.match(/<section class="workbench-panel patch-quality-card"[\s\S]*?<\/section>/)?.[0] ?? '';

  assert.ok(qualityBlock, 'quality card should render as a distinct panel');
  assert.match(qualityBlock, /Temporal Mask/);
  assert.match(qualityBlock, /duck|瞬态|tail|尾巴/i);
});

test('renderSoundLabWorkbench teaches spatial image and early reflections in the quality card', () => {
  const family = soundLabFamilies.find((item) => item.id === 'glass-ping');
  const model = buildSoundLabViewModel(family, {
    brightness: 74,
    motion: 58,
    material: 62,
    space: 78,
    variation: 66,
  }, {
    engineMode: 'worklet',
    qualityMode: 'studio',
    outputMode: 'studio',
    workflowStep: 'shape',
    layerMix: { transient: 54, body: 68, texture: 76, tail: 82 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });
  const qualityBlock = html.match(/<section class="workbench-panel patch-quality-card"[\s\S]*?<\/section>/)?.[0] ?? '';

  assert.ok(qualityBlock, 'quality card should render as a distinct panel');
  assert.match(qualityBlock, /Spatial Image|空间成像|空间距离/);
  assert.match(qualityBlock, /early|早期反射|front-back|距离/i);
  assert.match(qualityBlock, /space-depth/);
  assert.match(qualityBlock, /tail-only|predelay|early reflection|空间|距离/i);
});

test('renderSoundLabWorkbench renders spectral balance as a playable A/B monitor', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 88,
    motion: 52,
    material: 92,
    space: 42,
    variation: 66,
  }, {
    engineMode: 'worklet',
    qualityMode: 'studio',
    outputMode: 'studio',
    workflowStep: 'compare',
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });
  const qualityBlock = html.match(/<section class="workbench-panel patch-quality-card"[\s\S]*?<\/section>/)?.[0] ?? '';

  assert.ok(qualityBlock, 'quality card should render as a distinct panel');
  assert.match(qualityBlock, /spectral-balance-monitor/);
  assert.match(qualityBlock, /Spectral Balance|频谱平衡|棰戣氨/);
  assert.match(qualityBlock, /Body|Low-Mid|Air|主体|高频/i);
  assert.match(qualityBlock, /data-quality-audition="spectral-balance"/);
  assert.match(qualityBlock, /bypass|旁路|A\/B/i);
  assert.match(qualityBlock, /REAPER|LUFS/);
});

test('renderSoundLabWorkbench exposes live spectral balance hooks for the analyser', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, SOUND_LAB_MACROS, {
    engineMode: 'worklet',
    qualityMode: 'studio',
    outputMode: 'studio',
    workflowStep: 'compare',
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });
  const qualityBlock = html.match(/<section class="workbench-panel patch-quality-card"[\s\S]*?<\/section>/)?.[0] ?? '';

  assert.match(qualityBlock, /data-spectral-balance-status/);
  assert.match(qualityBlock, /data-spectral-balance-live/);
  assert.match(qualityBlock, /data-spectral-band-status/);
  assert.match(qualityBlock, /--spectral-live-value/);
  assert.match(qualityBlock, /等待实时信号|live signal|实时/i);
});

test('renderSoundLabWorkbench renders Ear Triage as a real listening workflow', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 94,
    motion: 28,
    material: 92,
    space: 76,
    variation: 44,
  }, {
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'compare',
    layerMix: { transient: 92, body: 44, texture: 86, tail: 82 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /ear-triage-panel/);
  assert.match(html, /Ear Triage|听感分诊|分诊/);
  assert.match(html, /triage-step-card/);
  assert.match(html, /data-layer-audition="(?:transient|body|texture|tail|full)"/);
  assert.match(html, /data-quality-coach-apply="/);
  assert.match(html, /data-workbench-action="/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /REAPER|A\/B|保留|撤回/);
});

test('renderSoundLabWorkbench renders live parameter coach with synth and REAPER guidance', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 46,
    motion: 50,
    material: 91,
    space: 28,
    variation: 20,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /parameter-coach-panel/);
  assert.match(html, /data-live-parameter-coach/);
  assert.match(html, /实时参数导师/);
  assert.match(html, /data-live-coach-listen/);
  assert.match(html, /data-live-coach-synth/);
  assert.match(html, /data-live-coach-reaper/);
  assert.match(html, /Serum\/Vital|Phase Plant/);
  assert.match(html, /REAPER 验证/);
});

test('renderSoundLabWorkbench renders Patch Doctor diagnostics with routed actions', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 91,
    motion: 34,
    material: 86,
    space: 72,
    variation: 38,
  }, {
    presetId: 'vital-metal-modal-hit',
    qualityMode: 'studio',
    outputMode: 'comfort',
    workflowStep: 'shape',
    layerMix: { transient: 86, body: 62, texture: 72, tail: 78 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /patch-doctor-panel/);
  assert.match(html, /Patch Doctor|下一步诊断/);
  assert.match(html, /先听|为什么|去修改/);
  assert.match(html, /Serum/);
  assert.match(html, /Phase Plant/);
  assert.match(html, /Vital/);
  assert.match(html, /data-workbench-action="focus-controls"|data-workbench-action="analyze-patch"|data-workbench-action="focus-practice-loop"/);
  assert.match(html, /data-doctor-apply="/);
  assert.match(html, /patch-doctor-actions/);
  assert.match(html, /patch-doctor-apply-button/);
  assert.match(html, /试调|小幅|A\/B/);
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

test('renderSoundLabWorkbench renders analyzer coach beside live waveform and spectrum', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 86,
    motion: 42,
    material: 88,
    space: 66,
    variation: 28,
  }, {
    qualityMode: 'studio',
    outputMode: 'comfort',
  });
  const html = renderSoundLabWorkbench(family, model, {
    selectedFamilyId: family.id,
    engineMode: 'hq',
    workletReady: true,
  });

  assert.match(html, /analyzer-coach-panel/);
  assert.match(html, /data-analyzer-coach-band="transient"/);
  assert.match(html, /data-analyzer-coach-band="body"/);
  assert.match(html, /data-analyzer-coach-band="air"/);
  assert.match(html, /data-workbench-action="focus-controls"/);
  assert.match(html, /Serum|Phase Plant|Vital/);
  assert.match(html, /REAPER|A\/B/);
});

test('renderSoundLabWorkbench exposes a live analyzer next-move slot', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 74,
    motion: 42,
    material: 80,
    space: 34,
    variation: 24,
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id, analyzerMode: 'live' });

  assert.match(html, /data-analyzer-coach-live-move/);
  assert.match(html, /data-analyzer-coach-live-title/);
  assert.match(html, /data-analyzer-coach-live-note/);
  assert.match(html, /data-analyzer-coach-live-action/);
  assert.match(html, /data-analyzer-coach-live-parameter/);
});

test('renderSoundLabWorkbench renders a translation monitor with real audition routes', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 88,
    motion: 42,
    material: 84,
    space: 78,
    variation: 30,
  }, {
    qualityMode: 'studio',
    outputMode: 'comfort',
    layerMix: { transient: 88, body: 48, texture: 84, tail: 82 },
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id });

  assert.match(html, /translation-monitor-panel/);
  assert.match(html, /Translation Monitor|翻译检查/);
  assert.match(html, /data-translation-check="mono-anchor"/);
  assert.match(html, /data-translation-check="small-speaker"/);
  assert.match(html, /data-translation-check="headphone-width"/);
  assert.match(html, /data-translation-check="tail-safety"/);
  assert.match(html, /data-layer-audition="body"/);
  assert.match(html, /data-layer-audition="tail"/);
  assert.match(html, /data-output-compare="comfort"/);
  assert.match(html, /data-workbench-action="focus-controls"/);
  assert.match(html, /REAPER|A\/B|mono/i);
});
test('renderSoundLabWorkbench turns sound quality meters into playable A/B auditions', () => {
  const family = soundLabFamilies.find((item) => item.id === 'metal-impact');
  const model = buildSoundLabViewModel(family, {
    brightness: 84,
    motion: 62,
    material: 90,
    space: 48,
    variation: 58,
  }, {
    qualityMode: 'studio',
    outputMode: 'studio',
  });
  const html = renderSoundLabWorkbench(family, model, { selectedFamilyId: family.id, engineMode: 'hq' });

  assert.match(html, /data-quality-audition="analog-gesture"/);
  assert.match(html, /data-quality-audition="temporal-mask"/);
  assert.match(html, /data-quality-audition="dynamic-detail"/);
  assert.match(html, /data-quality-audition="transient-gloss"/);
  assert.match(html, /data-quality-audition="spatial-image"/);
  assert.match(html, /quality-audition-button/);
  assert.match(html, /听差异|A\/B/);
});
