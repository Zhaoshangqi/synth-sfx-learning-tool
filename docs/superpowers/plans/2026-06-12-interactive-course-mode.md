# Interactive Course Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Ableton Learning Synths inspired interactive teaching mode focused on synth sound-effect design.

**Architecture:** Keep the app static and dependency-free. Add structured `interactiveLabs` data, a pure `lab-engine` module for control state and visual models, render helpers for lab panels, and browser wiring in `app.js`.

**Tech Stack:** Vanilla JavaScript ES modules, HTML, CSS, Node.js `node --test`, Python Playwright verification.

---

## Task 1: Interactive Lab Data

**Files:**
- Modify: `src/content.js`
- Modify: `tests/content.test.mjs`

- [ ] Add tests requiring five labs: ADSR, Filter, FM Metal, Layer Stack, Recipe Playground.
- [ ] Add `interactiveLabs` export with control ranges, defaults, lesson links, diagram links, synth mappings, and REAPER tasks.
- [ ] Run `node --test tests/content.test.mjs`.

## Task 2: Lab Engine

**Files:**
- Create: `src/lab-engine.js`
- Create: `tests/lab-engine.test.mjs`

- [ ] Test default state creation, control updates/clamping, visual model generation, and preset application.
- [ ] Implement pure helpers: `buildDefaultLabState`, `updateLabControl`, `applyLabPreset`, `buildLabVisualModel`.
- [ ] Run `node --test tests/lab-engine.test.mjs`.

## Task 3: Lab Rendering

**Files:**
- Modify: `src/render.js`
- Modify: `tests/render.test.mjs`

- [ ] Test `renderInteractiveLab` includes objective, controls, SVG visual, synth mappings, REAPER checklist, and linked lesson labels.
- [ ] Implement lab rendering helpers using escaped user-visible text and generated SVG visuals.
- [ ] Run `node --test tests/render.test.mjs`.

## Task 4: App Wiring And Styling

**Files:**
- Modify: `index.html`
- Modify: `src/app.js`
- Modify: `styles.css`
- Modify: `README.md`

- [ ] Add `互动课程` navigation.
- [ ] Add `renderInteractiveView` with lab selector, range controls, presets, and real-time visual/explanation updates.
- [ ] Style the interaction layout for desktop and mobile.
- [ ] Update README capabilities.
- [ ] Run `npm test`.

## Task 5: Browser Verification

**Files:**
- Save screenshots under `output/playwright/`.

- [ ] Verify interactive page shows five labs.
- [ ] Verify moving ADSR/filter/FM sliders changes visual state.
- [ ] Verify mobile layout has no horizontal overflow.
- [ ] Save screenshot `output/playwright/interactive-course.png`.
