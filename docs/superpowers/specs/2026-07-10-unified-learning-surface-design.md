# Unified Learning Surface Design

## Goal

Apply the Learning Synths inspired course interface to every route, while preserving the existing content models, links, and interactive controls.

## Visual System

- A slim chapter rail at the left; it carries the product mark and the current section number.
- A shared course top bar with a dashboard link, route label, and two compact utility actions.
- A calm off-white canvas, navy typography, soft gray practice panels, and restrained coral actions.
- A fixed content rhythm: route heading, mission panel, primary activity, supporting evidence/resources.
- Cards are used for learning units and controls only. Large routes remain open surfaces rather than a dashboard of nested cards.

## Route Behavior

- `soundlab` keeps the existing high-density, real-time lesson workbench.
- Every other route is rendered inside the shared course shell and retains its existing buttons, filters, forms, source links, and audio controls.
- The old sidebar, dark toolbar, particle layers, and legacy dark workstation surfaces are suppressed whenever a course shell is present.
- Route switching must update the chapter label without leaving stale direct-workstation classes behind.

## Safety and Validation

- Do not alter source data, existing action attributes, or audio event bindings.
- Add static regression coverage for the shared shell, all route wrapping, and readable course tokens.
- Verify representative routes: dashboard, daily videos, interactive course, knowledge cards, techniques, deep analysis, recipes, REAPER practice, and integrations.
