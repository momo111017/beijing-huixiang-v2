# Route Rail Type Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enlarge route-rail typography and convert the map stop card into a compact left-aligned panel without breaking five-stop desktop layouts.

**Architecture:** Keep the existing HTML and rendering code unchanged. Add CSS contract coverage in `tests/html-contract.test.js`, then update the route-specific rules in `styles/layout.css` and verify the real route flow in the browser.

**Tech Stack:** Static HTML, CSS, JavaScript, Node test runner.

## Global Constraints

- Do not change route order, map behavior, guide navigation, or copy.
- Keep all five route stops and the guide button reachable at 1366×768.
- Support both Russian and Chinese labels without overlap.
- Do not add dependencies.

---

### Task 1: Route rail typography and compact map card

**Files:**
- Modify: `tests/html-contract.test.js`
- Modify: `styles/layout.css`

**Interfaces:**
- Consumes: Existing `.route-view`, `.route-heading`, `.route-stop-list`, and `.route-stop-card` selectors.
- Produces: Responsive route rail and compact current-stop card styling.

- [ ] **Step 1: Write the failing CSS contract test**

Add assertions requiring a 390px route rail, height-responsive route heading, 19px stop names, 14.5px descriptions, 13.5px status text, and a compact `clamp(360px, 30vw, 430px)` route card.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/html-contract.test.js`

Expected: FAIL because the current CSS still uses a 360px rail, 31px heading, 15px stop names, and a full-width route card.

- [ ] **Step 3: Implement the route-only CSS changes**

Update `styles/layout.css` so the route rail uses 390px at normal desktop widths and 410px above 1600px. Increase the heading and stop text sizes, add text-group spacing, and override `.route-stop-card` with `right: auto` plus the agreed clamp width. Preserve a 350px rail under 1180px and add a narrow-desktop card fallback.

- [ ] **Step 4: Run focused and full validation**

Run: `node --test tests/html-contract.test.js`

Expected: PASS.

Run: `npm run validate`

Expected: All validation scripts and tests pass.

- [ ] **Step 5: Verify in the browser**

At 1435×987, confirm all five stops and the guide button are visible, route text is visibly larger, and the map card is compact. At 1366×768, confirm the rail remains usable without horizontal overflow and Russian labels do not overlap status text.

- [ ] **Step 6: Commit the implementation**

```bash
git add styles/layout.css tests/html-contract.test.js docs/superpowers/plans/2026-08-16-v2-route-rail-type-scale.md
git commit -m "feat: enlarge route rail typography"
```
