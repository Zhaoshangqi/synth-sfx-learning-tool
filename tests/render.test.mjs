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
  deepDiveModules,
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
