import test from 'node:test';
import assert from 'node:assert/strict';
import { sources, knowledgeCards, roadmapLessons, recipes, learningPathUnits } from '../src/content.js';
import { buildDashboardStats, getNextLesson, groupByStage } from '../src/view-model.js';

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
