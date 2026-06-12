# Synth SFX Learning Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first static local Chinese learning tool for synth-based sound-effect study, with English YouTube-oriented source intake, bilingual knowledge cards, a synth/SFX roadmap, recipe library, search, and REAPER practice guidance.

**Architecture:** A static ES-module browser app backed by local JavaScript data files and localStorage. Core behavior is kept in pure functions (`content`, `search`, `view-model`, `render`) so it can be tested with Node's built-in test runner before wiring the browser UI.

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, Node.js built-in `node --test`; no npm dependency install required for version 1.

---

## Scope Check

The approved spec contains one cohesive first-version product: local content library, Chinese learning route, source/cards/recipes UI, search/filtering, and REAPER practice guidance. Automated web crawling, speech transcription, plugin automation, audio-quality scoring, and cloud sync are explicitly out of scope for this plan.

## File Structure

Create these files under `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool`:

- `package.json`: project metadata and test/start scripts.
- `index.html`: static app entry point and semantic page shell.
- `styles.css`: restrained tool-style layout, responsive grid, filters, cards, and badges.
- `src/content.js`: seed data for sources, transcript segments, knowledge cards, roadmap lessons, recipes, glossary, and REAPER practice tasks.
- `src/search.js`: pure filtering and tag/search helpers.
- `src/view-model.js`: pure dashboard and derived data helpers.
- `src/render.js`: pure HTML rendering helpers for cards, sources, lessons, recipes, and practice tasks.
- `src/app.js`: browser wiring, localStorage source intake, filters, tabs, and rendering.
- `tests/content.test.mjs`: data-shape and minimum-content tests.
- `tests/search.test.mjs`: search and filtering behavior tests.
- `tests/view-model.test.mjs`: dashboard/roadmap derived-state tests.
- `tests/render.test.mjs`: rendering behavior tests.
- `README.md`: local usage, data model, and first-version limitations.

---

### Task 1: Project Skeleton And Content Contract

**Files:**
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\package.json`
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\tests\content.test.mjs`
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\src\content.js`

- [ ] **Step 1: Write the failing content contract test**

Create `tests/content.test.mjs` with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sources,
  transcriptSegments,
  knowledgeCards,
  roadmapLessons,
  recipes,
  glossary,
  reaperPracticeTasks,
} from '../src/content.js';

test('seed content includes the first-version learning surface', () => {
  assert.ok(sources.length >= 8, 'expected official, YouTube-search, and research sources');
  assert.ok(transcriptSegments.length >= 3, 'expected bilingual transcript examples');
  assert.ok(knowledgeCards.length >= 8, 'expected starter knowledge cards');
  assert.equal(roadmapLessons.length, 10, 'expected ten roadmap lessons');
  assert.equal(recipes.length, 20, 'expected twenty recipe exercises');
  assert.ok(glossary.length >= 12, 'expected core English-to-Chinese synth terms');
  assert.ok(reaperPracticeTasks.length >= 6, 'expected REAPER practice tasks');
});

test('every source has traceable provenance and credibility', () => {
  for (const source of sources) {
    assert.match(source.id, /^[a-z0-9-]+$/);
    assert.ok(source.title);
    assert.ok(source.platform);
    assert.ok(source.url.startsWith('https://'));
    assert.ok(['official', 'youtube-search', 'paper', 'article', 'community'].includes(source.type));
    assert.ok(['official', 'professional-tutorial', 'verifiable-experience', 'inspiration', 'research'].includes(source.credibility));
  }
});

test('every knowledge card keeps Chinese learning text tied to source evidence', () => {
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const card of knowledgeCards) {
    assert.match(card.id, /^[a-z0-9-]+$/);
    assert.ok(card.titleZh);
    assert.ok(card.principleZh.length > 20);
    assert.ok(Array.isArray(card.tags));
    assert.ok(card.tags.length > 0);
    assert.ok(['foundation', 'beginner', 'intermediate', 'advanced', 'creative'].includes(card.difficulty));
    assert.ok(sourceIds.has(card.sourceId), `unknown source ${card.sourceId}`);
    assert.ok(card.evidence.timecode);
    assert.ok(card.evidence.summaryZh);
    assert.ok(card.synthMappings.serum || card.synthMappings.phasePlant || card.synthMappings.vital);
  }
});

test('recipes include synth mappings, REAPER steps, and acceptance checks', () => {
  for (const recipe of recipes) {
    assert.match(recipe.id, /^[a-z0-9-]+$/);
    assert.ok(recipe.titleZh);
    assert.ok(recipe.goalZh.length > 10);
    assert.ok(recipe.methodTags.length > 0);
    assert.ok(recipe.synthMappings.serum || recipe.synthMappings.phasePlant || recipe.synthMappings.vital);
    assert.ok(recipe.reaperSteps.length >= 2);
    assert.ok(recipe.acceptanceChecks.length >= 2);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool`:

```powershell
node --test tests/content.test.mjs
```

Expected: FAIL because `src/content.js` does not exist yet.

- [ ] **Step 3: Create minimal package metadata**

Create `package.json` with:

```json
{
  "name": "synth-sfx-learning-tool",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "start": "python -m http.server 5177"
  }
}
```

- [ ] **Step 4: Implement seed content**

Create `src/content.js` with complete seed arrays for sources, transcript segments, knowledge cards, ten roadmap lessons, twenty recipes, glossary entries, and REAPER practice tasks. Keep content concise but useful. Each recipe must include at least one synth mapping and at least two REAPER steps.

- [ ] **Step 5: Run test to verify it passes**

Run:

```powershell
node --test tests/content.test.mjs
```

Expected: PASS with 4 passing tests.

---

### Task 2: Search And Filtering

**Files:**
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\tests\search.test.mjs`
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\src\search.js`

- [ ] **Step 1: Write failing search tests**

Create `tests/search.test.mjs` with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { knowledgeCards, recipes } from '../src/content.js';
import { normalizeText, collectTags, filterItems } from '../src/search.js';

test('normalizeText handles case, spacing, and Chinese text safely', () => {
  assert.equal(normalizeText('  Serum  FM 金属  '), 'serum fm 金属');
  assert.equal(normalizeText(undefined), '');
});

test('collectTags returns sorted unique tags from cards and recipes', () => {
  const tags = collectTags([...knowledgeCards, ...recipes]);
  assert.ok(tags.includes('metal'));
  assert.ok(tags.includes('Serum'));
  assert.deepEqual(tags, [...tags].sort((a, b) => a.localeCompare(b)));
});

test('filterItems matches query against Chinese title, English title, tags, and synth mappings', () => {
  const metal = filterItems(knowledgeCards, { query: '金属', tags: [], difficulty: 'all', synth: 'all' });
  assert.ok(metal.some((item) => item.id.includes('metal')));

  const serum = filterItems(knowledgeCards, { query: 'warp', tags: [], difficulty: 'all', synth: 'Serum' });
  assert.ok(serum.every((item) => item.synthMappings.serum));
});

test('filterItems combines tag, difficulty, and synth filters', () => {
  const result = filterItems(recipes, {
    query: '',
    tags: ['FM'],
    difficulty: 'intermediate',
    synth: 'Phase Plant',
  });
  assert.ok(result.length >= 1);
  assert.ok(result.every((item) => item.difficulty === 'intermediate'));
  assert.ok(result.every((item) => item.methodTags.includes('FM') || item.tags?.includes('FM')));
  assert.ok(result.every((item) => item.synthMappings.phasePlant));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node --test tests/search.test.mjs
```

Expected: FAIL because `src/search.js` does not exist yet.

- [ ] **Step 3: Implement search helpers**

Create `src/search.js` with:

```js
export function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function collectTags(items) {
  const tags = new Set();
  for (const item of items) {
    for (const tag of [...(item.tags ?? []), ...(item.methodTags ?? [])]) {
      tags.add(tag);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

function itemText(item) {
  const synthText = Object.entries(item.synthMappings ?? {})
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key} ${Array.isArray(value) ? value.join(' ') : value}`)
    .join(' ');

  return normalizeText([
    item.titleZh,
    item.titleEn,
    item.goalZh,
    item.principleZh,
    item.evidence?.summaryZh,
    ...(item.tags ?? []),
    ...(item.methodTags ?? []),
    synthText,
  ].filter(Boolean).join(' '));
}

function hasSynth(item, synth) {
  if (synth === 'all') return true;
  const key = { Serum: 'serum', 'Phase Plant': 'phasePlant', Vital: 'vital' }[synth];
  return Boolean(key && item.synthMappings?.[key]);
}

export function filterItems(items, filters) {
  const query = normalizeText(filters.query);
  const tags = filters.tags ?? [];
  const difficulty = filters.difficulty ?? 'all';
  const synth = filters.synth ?? 'all';

  return items.filter((item) => {
    const text = itemText(item);
    const itemTags = [...(item.tags ?? []), ...(item.methodTags ?? [])];
    const matchesQuery = !query || text.includes(query);
    const matchesTags = tags.length === 0 || tags.every((tag) => itemTags.includes(tag));
    const matchesDifficulty = difficulty === 'all' || item.difficulty === difficulty;
    return matchesQuery && matchesTags && matchesDifficulty && hasSynth(item, synth);
  });
}
```

- [ ] **Step 4: Run search tests**

Run:

```powershell
node --test tests/search.test.mjs
```

Expected: PASS with 4 passing tests.

---

### Task 3: Dashboard And Roadmap View Model

**Files:**
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\tests\view-model.test.mjs`
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\src\view-model.js`

- [ ] **Step 1: Write failing view-model tests**

Create `tests/view-model.test.mjs` with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { sources, knowledgeCards, roadmapLessons, recipes } from '../src/content.js';
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node --test tests/view-model.test.mjs
```

Expected: FAIL because `src/view-model.js` does not exist yet.

- [ ] **Step 3: Implement view-model helpers**

Create `src/view-model.js` with:

```js
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
    const stage = item.stage ?? '未分组';
    if (!index.has(stage)) {
      const group = { stage, items: [] };
      index.set(stage, group);
      groups.push(group);
    }
    index.get(stage).items.push(item);
  }
  return groups;
}
```

- [ ] **Step 4: Run view-model tests**

Run:

```powershell
node --test tests/view-model.test.mjs
```

Expected: PASS with 3 passing tests.

---

### Task 4: HTML Rendering Helpers

**Files:**
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\tests\render.test.mjs`
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\src\render.js`

- [ ] **Step 1: Write failing render tests**

Create `tests/render.test.mjs` with:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { sources, knowledgeCards, recipes, roadmapLessons } from '../src/content.js';
import { renderSourceCard, renderKnowledgeCard, renderRecipeCard, renderLessonCard } from '../src/render.js';

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
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
node --test tests/render.test.mjs
```

Expected: FAIL because `src/render.js` does not exist yet.

- [ ] **Step 3: Implement render helpers**

Create `src/render.js` with HTML escaping and pure card rendering functions. Use small helpers: `escapeHtml`, `badgeList`, `renderSynthMappings`, `findSource`. Render Chinese labels for 原理, 来源, REAPER, 验收, and 产出.

- [ ] **Step 4: Run render tests**

Run:

```powershell
node --test tests/render.test.mjs
```

Expected: PASS with 4 passing tests.

---

### Task 5: Browser App Shell And Interaction

**Files:**
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\index.html`
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\styles.css`
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\src\app.js`

- [ ] **Step 1: Write app shell after pure helpers are tested**

Create `index.html` with a tool-first layout:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>合成器音效学习工具</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">SFX</span>
        <div>
          <h1>合成器音效学习工具</h1>
          <p>英文来源，中文学习，REAPER 实战</p>
        </div>
      </div>
      <nav class="tabs" aria-label="主导航">
        <button class="tab is-active" data-view="dashboard">总览</button>
        <button class="tab" data-view="sources">资料库</button>
        <button class="tab" data-view="cards">知识卡片</button>
        <button class="tab" data-view="roadmap">路线</button>
        <button class="tab" data-view="recipes">配方</button>
        <button class="tab" data-view="practice">REAPER</button>
      </nav>
    </aside>
    <main class="workspace">
      <section class="toolbar" aria-label="筛选">
        <input id="query" type="search" placeholder="搜索：金属、FM、Serum、whoosh..." />
        <select id="synth-filter">
          <option value="all">全部合成器</option>
          <option value="Serum">Serum</option>
          <option value="Phase Plant">Phase Plant</option>
          <option value="Vital">Vital</option>
        </select>
        <select id="difficulty-filter">
          <option value="all">全部难度</option>
          <option value="foundation">基础</option>
          <option value="beginner">初级</option>
          <option value="intermediate">中级</option>
          <option value="advanced">高级</option>
          <option value="creative">创意</option>
        </select>
      </section>
      <section id="app" class="content" aria-live="polite"></section>
    </main>
    <script type="module" src="./src/app.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create responsive CSS**

Create `styles.css` with a dense, quiet, tool-like interface: sidebar, sticky toolbar, responsive cards, badge styles, source cards, recipe cards, and mobile stacking. Avoid decorative landing-page hero layout.

- [ ] **Step 3: Wire app state**

Create `src/app.js` to import content/search/view/render modules, manage current tab and filters, render each view, and store user-added source drafts in localStorage with key `synthSfxLearningTool:userSources`.

- [ ] **Step 4: Run full automated tests**

Run:

```powershell
npm test
```

Expected: PASS for all test files.

---

### Task 6: README And Local Verification

**Files:**
- Create: `E:\zhaoshangqi\AI\学习\synth-sfx-learning-tool\README.md`

- [ ] **Step 1: Create README**

Create `README.md` with:

```markdown
# 合成器音效学习工具

本工具用于把英文 YouTube/官方文档/论文/社区资料整理成中文合成器音效学习路线。

## 使用方式

```powershell
npm test
python -m http.server 5177
```

然后打开 `http://localhost:5177`。

## 第一版包含

- 中文学习路线
- 英文来源资料卡
- 双语知识卡片
- 20 个音效配方
- Serum / Phase Plant / Vital 对照
- REAPER 练习任务
- 本地搜索和筛选

## 第一版限制

- 不自动批量抓取 YouTube
- 不自动转录无字幕视频
- 不自动控制合成器参数
- 不做音频质量自动评分
```

- [ ] **Step 2: Run tests**

Run:

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 3: Start local server**

Run:

```powershell
python -m http.server 5177
```

Expected: server listens on `http://localhost:5177`.

- [ ] **Step 4: Browser verification**

Open `http://localhost:5177` and verify:

- Dashboard shows sources, cards, lessons, recipes counts.
- Sources tab shows official and YouTube-search sources.
- Cards tab search for `金属` returns metallic/FM material.
- Recipes tab filter `Phase Plant` and `中级` shows at least one FM/metal recipe.
- Roadmap shows ten lessons.
- REAPER tab shows practice tasks.
- Mobile-width layout stacks without overlapping text.

---

## Plan Self-Review

Spec coverage:

- Local static app: Task 5.
- English YouTube-oriented sources with Chinese output: Tasks 1 and 5.
- Knowledge cards with provenance and credibility: Tasks 1 and 4.
- Roadmap: Tasks 1, 3, and 5.
- Twenty recipes: Task 1.
- Serum / Phase Plant / Vital mappings: Tasks 1, 2, and 4.
- REAPER practice guidance: Tasks 1, 4, and 5.
- Search and filters: Task 2 and Task 5.
- Verification: Tasks 1-6.

Placeholder scan: no TBD/TODO placeholder language is used. The only future work is explicitly listed as out of scope or second version scope.

Type consistency: `sources`, `transcriptSegments`, `knowledgeCards`, `roadmapLessons`, `recipes`, `glossary`, and `reaperPracticeTasks` are named consistently across tests and implementation tasks. Synth mapping keys are `serum`, `phasePlant`, and `vital` throughout.
