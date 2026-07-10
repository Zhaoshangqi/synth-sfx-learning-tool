# Unified Learning Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every learning route use the same readable Learning Synths inspired course surface as Sound Lab without replacing route-specific content or controls.

**Architecture:** Add one route metadata map and one `wrapLearningRoute` renderer in `src/app.js`. The wrapper supplies the chapter rail, top bar, title/mission band, and route body slot. A final CSS layer scopes the light course surface to `.learning-route-shell`, allowing Sound Lab to retain its dedicated clone layout.

**Tech Stack:** Static HTML templates, vanilla ES modules, CSS, Node built-in test runner.

---

### Task 1: Establish route-shell contracts

**Files:**
- Modify: `tests/visual-shell.test.mjs`
- Modify: `src/app.js`

- [ ] **Step 1: Write the failing regression test**

```js
test('all non-lab routes render in the shared learning course shell', () => {
  const appJs = fs.readFileSync(path.join(projectRoot, 'src', 'app.js'), 'utf8');
  assert.match(appJs, /const LEARNING_ROUTE_META = new Map\(/);
  assert.match(appJs, /function wrapLearningRoute\(/);
  assert.match(appJs, /class="learning-route-shell/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/visual-shell.test.mjs --test-name-pattern="shared learning course shell"`

Expected: FAIL because the route metadata and wrapper do not yet exist.

- [ ] **Step 3: Add the minimal route metadata and wrapper**

```js
const LEARNING_ROUTE_META = new Map([
  ['dashboard', { index: '01', label: '起点', title: '从目标声音开始', mission: '先确定今天要做的声音，再进入一个练习。' }],
]);

function wrapLearningRoute(viewId, content) {
  const meta = LEARNING_ROUTE_META.get(viewId);
  if (!meta) return content;
  return `<section class="learning-route-shell" data-learning-route="${viewId}">...</section>`;
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test tests/visual-shell.test.mjs --test-name-pattern="shared learning course shell"`

Expected: PASS.

### Task 2: Route all non-Sound-Lab content through the shared shell

**Files:**
- Modify: `src/app.js`
- Test: `tests/visual-shell.test.mjs`

- [ ] **Step 1: Extend the test for the complete route set**

```js
for (const route of ['dashboard', 'daily', 'interactive', 'cards', 'techniques', 'deep', 'recipes', 'practice', 'integrations']) {
  assert.match(appJs, new RegExp(`\\['${route}', \\{`));
}
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/visual-shell.test.mjs --test-name-pattern="complete route set"`

Expected: FAIL until every route has course metadata.

- [ ] **Step 3: Wrap the render switch output once**

```js
const rendered = renderViewContent(state.view);
app.innerHTML = state.view === 'soundlab' ? rendered : wrapLearningRoute(state.view, rendered);
```

The existing `renderDashboard`, `renderDailyVideosView`, and other route functions continue to produce their current content unchanged.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test tests/visual-shell.test.mjs --test-name-pattern="complete route set"`

Expected: PASS.

### Task 3: Add one scoped course-surface CSS layer

**Files:**
- Modify: `styles.css`
- Test: `tests/visual-shell.test.mjs`

- [ ] **Step 1: Add the failing style contract**

```js
assert.match(css, /\.learning-route-shell \{[\s\S]*--ls-page/);
assert.match(css, /\.learning-route-shell \.learning-route-content/);
assert.match(css, /body:has\(\.learning-route-shell\) \.sidebar/);
```

- [ ] **Step 2: Run it and verify it fails**

Run: `node --test tests/visual-shell.test.mjs --test-name-pattern="course surface tokens"`

Expected: FAIL because regular routes still use the old dark workspace shell.

- [ ] **Step 3: Add scoped light course-surface rules**

```css
body:has(.learning-route-shell) .sidebar,
body:has(.learning-route-shell) .toolbar { display: none !important; }

.learning-route-shell {
  --ls-page: #fffdf9;
  --ls-navy: #00004c;
  --ls-pink: #ff6577;
  min-height: 100dvh;
  background: var(--ls-page);
  color: var(--ls-navy);
}
```

- [ ] **Step 4: Run it and verify it passes**

Run: `node --test tests/visual-shell.test.mjs --test-name-pattern="course surface tokens"`

Expected: PASS.

### Task 4: Verify visual routes and interaction preservation

**Files:**
- Modify: `tests/visual-shell.test.mjs`

- [ ] **Step 1: Add a regression test that preserves route control attributes**

```js
assert.match(appJs, /data-daily-filter/);
assert.match(appJs, /data-lab-id/);
assert.match(appJs, /data-integration-action/);
```

- [ ] **Step 2: Run the full test suite**

Run: `node --test tests/visual-shell.test.mjs; node --check src/app.js; git diff --check`

Expected: all tests pass, no syntax error, and no whitespace error.

- [ ] **Step 3: Browser-check representative routes**

Navigate to `#dashboard`, `#daily`, `#interactive`, `#cards`, `#techniques`, `#deep`, `#recipes`, `#practice`, and `#integrations`; confirm each page has `.learning-route-shell`, the old sidebar is hidden, a visible action remains clickable, and no console error appears.

- [ ] **Step 4: Commit the implementation**

```bash
git add src/app.js styles.css tests/visual-shell.test.mjs docs/superpowers/specs/2026-07-10-unified-learning-surface-design.md docs/superpowers/plans/2026-07-10-unified-learning-surface.md
git commit -m "Unify learning route surfaces"
```
