import test from 'node:test';
import assert from 'node:assert/strict';
import { sources, knowledgeCards, roadmapLessons, recipes, learningPathUnits } from '../src/content.js';
import { buildDashboardStats, buildPracticePrescription, getNextLesson, groupByStage } from '../src/view-model.js';

test('buildDashboardStats summarizes learning content', () => {
  const stats = buildDashboardStats({ sources, knowledgeCards, roadmapLessons, recipes });
  assert.equal(stats.sources, sources.length);
  assert.equal(stats.cards, knowledgeCards.length);
  assert.equal(stats.lessons, roadmapLessons.length);
  assert.equal(stats.recipes, recipes.length);
  assert.ok(stats.youtubeSources >= 1);
});

test('getNextLesson returns first incomplete lesson or final lesson fallback', () => {
  assert.equal(getNextLesson(roadmapLessons, new Set()).id, roadmapLessons[0].id);
  const completed = new Set(roadmapLessons.slice(0, 3).map((lesson) => lesson.id));
  assert.equal(getNextLesson(roadmapLessons, completed).id, roadmapLessons[3].id);
  assert.equal(getNextLesson(roadmapLessons, new Set(roadmapLessons.map((lesson) => lesson.id))).id, roadmapLessons.at(-1).id);
});

test('groupByStage groups lessons without losing order', () => {
  const groups = groupByStage(roadmapLessons);
  assert.ok(groups.length >= 4);
  assert.equal(groups.flatMap((group) => group.items).length, roadmapLessons.length);
  assert.equal(groups[0].items[0].id, roadmapLessons[0].id);
});

test('groupByStage also groups detailed learning units by stageZh', () => {
  const groups = groupByStage(learningPathUnits);
  assert.ok(groups.length >= 7);
  assert.equal(groups[0].stage, '0. 听觉地基');
  assert.equal(groups.flatMap((group) => group.items).length, learningPathUnits.length);
});

test('buildPracticePrescription turns a learning route step into a beginner-safe daily drill', () => {
  const step = {
    id: 'fm-metal',
    index: '04',
    title: 'FM 金属',
    level: '中级',
    view: 'soundlab',
    familyId: 'metal-impact',
    focusZh: '金属感来自非谐波侧频、短 decay 和受控共振，不是单纯 EQ 提亮。',
    listenZh: '听侧频是否变硬但不刺耳，金属短响是否清楚，body 是否还稳。',
    soundTargetZh: '做一个短金属 hit：有非谐波边缘，但 3-8kHz 不刺。',
    oneKnobZh: '只动 FM Amount：从轻微侧频到明显金属，找到刚好成立的位置。',
    reaperZh: '导出 dry 和 changed 两版，响度匹配后判断是不是“更金属”而不是“更大声”。',
    proofZh: '能指出 carrier / modulator 比例改变后哪一段听感变了。',
    nextStepZh: '下一步进入分层材质，把 transient、body、texture 和 tail 拆开。',
  };
  const prescription = buildPracticePrescription({
    activePathStep: step,
    nextLesson: roadmapLessons[0],
    stats: { sources: 29, recipes: 19 },
  });

  assert.equal(prescription.routeId, 'fm-metal');
  assert.equal(prescription.launchView, 'soundlab');
  assert.match(prescription.titleZh, /今日练习处方/);
  assert.match(prescription.objectiveZh, /短金属 hit|非谐波/);
  assert.match(prescription.listenQuestionZh, /侧频|body/);
  assert.match(prescription.oneChange.labelZh, /只动 FM Amount/);
  assert.match(prescription.verification.zh, /A\/B|dry|changed|响度匹配/);
  assert.ok(prescription.steps.length >= 4);
  assert.ok(prescription.steps.every((item) => item.action && item.proofZh));
  assert.match(prescription.deliveryZh, /REAPER|记录|交付/);
  assert.match(prescription.nextZh, /分层材质|下一步/);
});
