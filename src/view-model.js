export function buildDashboardStats({ sources, knowledgeCards, roadmapLessons, recipes }) {
  return {
    sources: sources.length,
    cards: knowledgeCards.length,
    lessons: roadmapLessons.length,
    recipes: recipes.length,
    youtubeSources: sources.filter((source) => source.platform.toLowerCase().includes('youtube')).length,
  };
}

export function getNextLesson(lessons, completedIds) {
  return lessons.find((lesson) => !completedIds.has(lesson.id)) ?? lessons.at(-1);
}

export function groupByStage(items) {
  const groups = [];
  const index = new Map();
  for (const item of items) {
    const stage = item.stage ?? item.stageZh ?? '未分组';
    if (!index.has(stage)) {
      const group = { stage, items: [] };
      index.set(stage, group);
      groups.push(group);
    }
    index.get(stage).items.push(item);
  }
  return groups;
}
