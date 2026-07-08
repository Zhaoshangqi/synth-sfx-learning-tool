export function buildDashboardStats({ sources, knowledgeCards, roadmapLessons, recipes }) {
  return {
    sources: sources.length,
    cards: knowledgeCards.length,
    lessons: roadmapLessons.length,
    recipes: recipes.length,
    youtubeSources: sources.filter((source) => source.platform.toLowerCase().includes('youtube')).length,
  };
}

export function buildPracticePrescription({ activePathStep, nextLesson, stats = {} }) {
  const step = activePathStep ?? {};
  const routeId = step.id ?? 'listen-source';
  const routeLabel = `${step.index ?? '01'} · ${step.title ?? '先听目标声'}`;
  const launchView = step.view ?? 'soundlab';
  const targetZh = step.soundTargetZh ?? step.focusZh ?? '先做一个短、清楚、可 A/B 的目标声音。';
  const listenZh = step.listenZh ?? '先听起音、主体、材质和尾巴，不要先看参数。';
  const oneKnobZh = step.oneKnobZh ?? '一次只改一个宏或一个包络参数，听清变化再继续。';
  const reaperZh = step.reaperZh ?? '导出 dry / changed 两版，响度匹配后再判断是否变好。';
  const proofZh = step.proofZh ?? '能用一句话说明保留或撤回这次修改的理由。';
  const nextZh = step.nextStepZh ?? nextLesson?.focusZh ?? '完成后进入下一条路线，继续从听辨开始。';
  const sourceCount = Number(stats.sources ?? 0);
  const recipeCount = Number(stats.recipes ?? 0);

  return {
    routeId,
    routeLabel,
    launchView,
    titleZh: '今日练习处方',
    subtitleZh: '目标不是把页面全部点一遍，而是按“听 -> 改 -> 验 -> 交付”完成一次可复盘练习。',
    objectiveZh: targetZh,
    listenQuestionZh: listenZh,
    oneChange: {
      labelZh: oneKnobZh,
      guardrailZh: '一次只改一个参数；如果听不出差异，先撤回，不要继续叠效果。',
    },
    verification: {
      zh: `A/B 验证：${reaperZh}`,
      methodZh: '先听 dry，再听 changed，最后响度匹配复听，避免“更大声=更好”的错觉。',
    },
    steps: [
      {
        id: 'target',
        labelZh: '定目标',
        action: 'launch',
        proofZh: targetZh,
      },
      {
        id: 'listen',
        labelZh: '先听',
        action: 'launch',
        proofZh: listenZh,
      },
      {
        id: 'edit',
        labelZh: '一次只改',
        action: 'launch',
        proofZh: oneKnobZh,
      },
      {
        id: 'verify',
        labelZh: 'A/B 验证',
        action: 'ab',
        proofZh,
      },
    ],
    deliveryZh: `REAPER 交付：记录参数、导出 dry / full / changed，对照 ${recipeCount || '配方'} 条配方和 ${sourceCount || '资料'} 个来源。`,
    nextZh,
    launchLabelZh: launchView === 'soundlab' ? '打开 Sound Lab 执行处方' : '进入对应模块执行处方',
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
