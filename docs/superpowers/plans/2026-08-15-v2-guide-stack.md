# V2 Guide Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将点位导览页的站点任务和继续追问改为上下全宽布局，放大可交互内容并消除多余留白。

**Architecture:** 保留现有 HTML 语义和 JavaScript 交互，只调整探索区的 CSS Grid 和按钮尺寸。使用静态合约测试锁定上下布局，再用真实浏览器尺寸验收一屏可见性。

**Tech Stack:** HTML5、CSS Grid、Node.js `node:test`、百度地图 JavaScript API。

## Global Constraints

- 仅修改 `/Users/学习/挑战杯/网页原型 V1/v2-package`，不修改 V1 `public-package`。
- 桌面端验收尺寸为 1366×768、1440×900、1920×1080。
- 导览右侧保持一屏无整体滚动，下一站按钮始终可用。
- 不改动现有俄文内容、任务逻辑和追问数据。

---

### Task 1: 锁定上下布局合约

**Files:**
- Modify: `tests/html-contract.test.js`

**Interfaces:**
- Consumes: `styles/layout.css` 中的 `.guide-explore-grid`。
- Produces: 要求探索区为单列、任务选项为三列的静态回归保护。

- [x] **Step 1: 写入失败的 CSS 合约测试**

```js
test("导览探索区使用上下全宽布局", async () => {
  const css = await readFile(new URL("../styles/layout.css", import.meta.url), "utf8");
  assert.match(css, /\.guide-explore-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.task-options\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
});
```

- [x] **Step 2: 确认测试先失败**

Run: `node --test tests/html-contract.test.js`

Expected: FAIL，因为 `.guide-explore-grid` 仍为两列，`.task-options` 仍未定义三列。

### Task 2: 实现全宽上下布局

**Files:**
- Modify: `styles/layout.css`
- Modify: `styles/components.css`

**Interfaces:**
- Consumes: `#guide-explore-grid` 下现有 `.task-module` 和 `.qa-module` DOM 顺序。
- Produces: 单列探索区、三列任务选项、纵向追问按钮和内容自适应卡片。

- [x] **Step 1: 将探索区改为单列内容高度**

```css
.guide-explore-grid {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto auto;
  align-content: start;
  gap: 10px;
  overflow: hidden;
}
```

- [x] **Step 2: 放大卡片和交互元素**

```css
.task-options { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.task-options button,
.suggested-questions button {
  min-height: 34px;
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.3;
}
```

- [x] **Step 3: 运行合约测试**

Run: `node --test tests/html-contract.test.js`

Expected: PASS。

### Task 3: 完整验证桌面端版式

**Files:**
- Modify: `V2验收/V2电脑端验收记录.md`

**Interfaces:**
- Consumes: 完成的导览页 CSS。
- Produces: 自动化校验结果与三种视口的可见性记录。

- [x] **Step 1: 运行项目全量校验**

Run: `npm run validate`

Expected: 内容、资产、HTML 和 Node 测试全部通过。

- [x] **Step 2: 使用浏览器检查三种视口**

Run: 启动本地 HTTP 服务，分别设置 1366×768、1440×900、1920×1080。

Expected: 任务卡在追问卡上方；两者均全宽；无重叠、无水平溢出；下一站按钮完整可见并可用。

- [x] **Step 3: 写入验收记录**

在 `V2验收/V2电脑端验收记录.md` 记录修改项、视口尺寸和实测结果。
