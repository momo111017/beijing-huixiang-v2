# V2 Global UI Softening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 放大 V2 电脑端过小文字，用节制圆角柔化全局 UI，并让“我的路线”五个点位均匀填满左栏可用高度。

**Architecture:** 保留现有 HTML 与 JavaScript，通过 `tokens.css` 新增圆角和低强度阴影令牌，再在 `base.css`、`layout.css` 和 `components.css` 中统一调整。路线页使用明确桌面端断点和五等分 Grid，其他页面只调整字号、圆角、边框和状态样式。

**Tech Stack:** HTML5、CSS Custom Properties、CSS Grid、Node.js `node:test`、浏览器视觉验收。

## Global Constraints

- 仅修改 `/Users/学习/挑战杯/网页原型 V1/v2-package`，不修改 V1 `public-package`。
- 正式验收尺寸为 1366×768、1440×900、1920×1080；手机端不在本轮范围。
- 不改动配色、字体家族、照片、百度地图、内容数据或交互逻辑。
- 主要可见界面文字不低于 12px；只有来源、版权和其他明确元数据可使用 10—11px。
- 阴影只用于地图覆盖层、浮层和激活卡；静态卡使用浅边框和底色。
- 不新增依赖，不部署 V2。

---

### Task 1: 锁定视觉令牌和路线布局合约

**Files:**
- Modify: `tests/html-contract.test.js`

**Interfaces:**
- Consumes: `styles/tokens.css` 的圆角令牌与 `styles/layout.css` 的路线 Grid。
- Produces: 可防止字号、圆角和路线布局回退的静态合约。

- [x] **Step 1: 写入失败的视觉合约测试**

```js
test("桌面端使用统一柔化令牌和路线栅格", async () => {
  const tokens = await readFile(new URL("../styles/tokens.css", import.meta.url), "utf8");
  const layout = await readFile(new URL("../styles/layout.css", import.meta.url), "utf8");
  assert.match(tokens, /--radius-sm:\s*8px/);
  assert.match(tokens, /--radius:\s*10px/);
  assert.match(tokens, /--radius-lg:\s*14px/);
  assert.match(layout, /\.route-view\s*\{[^}]*grid-template-columns:\s*360px\s+minmax\(0,\s*1fr\)/s);
  assert.match(layout, /\.route-stop-list\s*\{[^}]*grid-template-rows:\s*repeat\(5,\s*minmax\(68px,\s*1fr\)\)/s);
  assert.match(layout, /@media\s*\(min-width:\s*1600px\)[^{]*\{[^}]*\.route-view\s*\{[^}]*grid-template-columns:\s*380px/s);
});
```

- [x] **Step 2: 运行单项测试并确认失败**

Run: `node --test tests/html-contract.test.js`

Expected: FAIL，因为当前圆角仅 4px，路线栏仍为 340px，点位最小高度仍为 54px。

### Task 2: 建立全局字号和圆角系统

**Files:**
- Modify: `styles/tokens.css`
- Modify: `styles/base.css`
- Modify: `styles/components.css`

**Interfaces:**
- Consumes: 现有 `--paper`、`--pine`、`--rust`、`--line` 配色令牌。
- Produces: `--radius-sm: 8px`、`--radius: 10px`、`--radius-lg: 14px` 和统一低强度 `--shadow`。

- [x] **Step 1: 更新视觉令牌**

```css
--radius-sm: 8px;
--radius: 10px;
--radius-lg: 14px;
--shadow: 0 12px 30px rgba(23, 47, 43, 0.1);
```

- [x] **Step 2: 调整全局基础组件**

```css
.eyebrow { font-size: 12px; }
.button { border-radius: var(--radius); }
.task-options button,
.suggested-questions button { min-height: 36px; font-size: 12px; border-radius: var(--radius-sm); }
.task-module,
.qa-module { border-radius: var(--radius-lg); }
```

- [x] **Step 3: 统一地图卡、资料卡、状态和对话框**

```css
.home-map-card,
.route-stop-card,
.archive-card { border-radius: var(--radius-lg); }
.status-chip,
.map-tools button,
.map-retry { border-radius: var(--radius-sm); font-size: 12px; }
.location-dialog { border-radius: var(--radius-lg); }
```

- [x] **Step 4: 运行合约测试**

Run: `node --test tests/html-contract.test.js`

Expected: 圆角令牌断言通过；路线布局断言仍失败。

### Task 3: 重排“我的路线”左栏

**Files:**
- Modify: `styles/layout.css`

**Interfaces:**
- Consumes: `#route-view`、`.route-rail`、`#route-stop-list` 和现有五站 DOM。
- Produces: 1366—1599px 下 360px 左栏、1600px 以上 380px 左栏、五个均匀填满的点位卡。

- [x] **Step 1: 改造路线页结构尺寸**

```css
.route-view { grid-template-columns: 360px minmax(0, 1fr); }
.route-rail { padding: 24px 22px 20px; }
.route-stop-list {
  grid-template-rows: repeat(5, minmax(68px, 1fr));
  gap: 9px;
  margin: 16px 0;
}
@media (min-width: 1600px) {
  .route-view { grid-template-columns: 380px minmax(0, 1fr); }
}
```

- [x] **Step 2: 放大路线文字与点位卡**

```css
.route-heading > p:last-child { font-size: 13px; }
.progress-head { font-size: 12px; }
.route-stop-list button { padding: 12px 13px; border-radius: var(--radius); }
.route-stop-list strong { font-size: 15px; line-height: 1.25; }
.route-stop-list small { font-size: 12px; line-height: 1.3; }
.route-stop-list .stop-no { font-size: 18px; }
.route-open-guide { min-height: 52px; }
```

- [x] **Step 3: 统一地图工具和当前点位卡**

```css
.map-tools button,
.map-retry { min-height: 40px; }
.home-map-card,
.route-stop-card { padding: 18px 20px; }
.home-map-card small,
.route-stop-card small { font-size: 12px; }
```

- [x] **Step 4: 运行合约测试**

Run: `node --test tests/html-contract.test.js`

Expected: PASS。

### Task 4: 柔化首页、导览页与史料页

**Files:**
- Modify: `styles/layout.css`
- Modify: `styles/components.css`

**Interfaces:**
- Consumes: Task 2 产生的圆角令牌和字号下限。
- Produces: 首页事实栏、地图浮层、导览探索区和史料卡的统一外观。

- [x] **Step 1: 放大首页与顶部辅助文字**

```css
.brand small { font-size: 10px; }
.source-entry { font-size: 12px; border-radius: var(--radius-sm); }
.home-facts small { font-size: 12px; }
.map-titlebar { font-size: 11px; }
```

- [x] **Step 2: 柔化导览小组件**

```css
.scene-tabs button { width: 34px; height: 34px; border-radius: var(--radius-sm); font-size: 12px; }
.source-note { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 10px; }
.qa-answer { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 12px; }
.complete-stop { border-radius: var(--radius); }
```

- [x] **Step 3: 柔化史料卡和筛选状态**

```css
.archive-card { border-radius: var(--radius-lg); }
.archive-card p { font-size: 13px; }
.archive-filters button { border-radius: var(--radius-sm); font-size: 12px; }
.status-chip { font-size: 12px; }
```

- [x] **Step 4: 运行全量自动校验**

Run: `npm run validate`

Expected: 内容、资产、HTML 和所有 Node 测试全部通过。

### Task 5: 浏览器验收与记录

**Files:**
- Modify: `/Users/学习/挑战杯/网页原型 V1/V2验收/V2电脑端验收记录.md`

**Interfaces:**
- Consumes: 完整的 CSS 调整。
- Produces: 三个电脑视口的实际渲染证据。

- [x] **Step 1: 验收 1366×768 路线页**

Expected: 左栏 360px，五站卡和底部按钮同屏完整可见；五张卡均匀填满剩余高度；无水平滚动。

- [x] **Step 2: 验收 1440×900 和 1920×1080**

Expected: 1440px 左栏 360px，1920px 左栏 380px；地图、点位卡和主按钮无遮挡。

- [x] **Step 3: 回归首页、点位导览和史料来源**

Expected: 三页圆角与字号统一；导览页仍为一屏，追问答案与下一站按钮不重叠；控制台无相关错误或警告。

- [x] **Step 4: 更新验收记录并提交**

Run: `git add styles tests docs && git commit -m "feat: soften V2 desktop UI"`

Expected: 工作区只包含本轮预期文件，提交成功。
