# V2 Layout Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复隐藏地图导致的首页世界地图问题，并把路线列表、顶部导航和哈尔滨站导览重排为无需整页滚动的电脑端布局。

**Architecture:** 保留当前原生 HTML／CSS／ES Modules 架构。地图控制器从“批量调整所有实例”改为“只调整当前可见实例”；导览继续复用同一数据模型，通过可选图片元数据和固定视口 CSS 网格实现新的 38／62 布局。

**Tech Stack:** HTML5、CSS Grid、原生 ES Modules、百度地图 JavaScript API 3.0、Node.js 内置测试。

## Global Constraints

- 不覆盖或修改 `../public-package/` 中的 V1。
- 只正式验收 1366×768、1440×900、1920×1080 电脑端。
- 中央主导航只保留“首页／我的路线”；“史料来源”位于右上角。
- 任务与史料问答不得阻止用户进入下一站。
- 哈尔滨站照片必须保留作者、原文件链接和 CC BY-SA 4.0 许可。
- 用户精确位置不得写入 localStorage 或上传。

---

### Task 1: 修复隐藏地图视野污染

**Files:**
- Modify: `src/map/map-controller.js`
- Modify: `src/app.js`
- Create: `tests/map-resize.test.js`

**Interfaces:**
- Produces: `resizeMountedMap(maps: Map, key: string, fit: Function): boolean`
- Produces: `mapController.resize(key: "home" | "route"): boolean`

- [ ] **Step 1: 写失败测试**

```js
test("只调整指定的可见地图", () => {
  const calls = [];
  const maps = new Map([
    ["home", { checkResize: () => calls.push("home") }],
    ["route", { checkResize: () => calls.push("route") }],
  ]);
  assert.equal(resizeMountedMap(maps, "route", (_map, key) => calls.push(`fit:${key}`)), true);
  assert.deepEqual(calls, ["route", "fit:route"]);
});
```

- [ ] **Step 2: 运行聚焦测试并确认失败**

Run: `node --test tests/map-resize.test.js`  
Expected: FAIL，提示 `resizeMountedMap` 未导出。

- [ ] **Step 3: 实现单地图调整**

```js
export function resizeMountedMap(maps, key, fitMap) {
  const map = maps.get(key);
  if (!map) return false;
  map.checkResize();
  fitMap(map, key);
  return true;
}

function resize(key) {
  return resizeMountedMap(maps, key, (map, currentKey) => fit(map, currentKey === "home"));
}
```

将 `resizeAll` 从返回接口移除，改为返回 `resize`。在 `navigate()` 中，显示首页或路线页后只调用对应 key：

```js
if ((viewName === "home" || viewName === "route") && mapReady) {
  if (viewName === "route") mapController.mount("route", "route-map");
  window.setTimeout(() => mapController.resize(viewName), 100);
}
```

- [ ] **Step 4: 运行测试**

Run: `node --test tests/map-resize.test.js && npm run validate`  
Expected: 全部通过。

- [ ] **Step 5: 浏览器复验**

刷新首页，记录哈尔滨地图瓦片为约 14 级；依次点击“我的路线／首页”，确认首页地图仍为哈尔滨五点位且不出现 4 级世界地图。

- [ ] **Step 6: 提交**

```bash
git add src/map/map-controller.js src/app.js tests/map-resize.test.js
git commit -m "fix: preserve home map viewport across navigation"
```

### Task 2: 精简顶部导航并拉开五站列表

**Files:**
- Modify: `index.html`
- Modify: `src/data/ui-copy.js`
- Modify: `styles/layout.css`
- Modify: `tests/html-contract.test.js`

**Interfaces:**
- Central navigation: exactly two `.nav-link` buttons.
- Secondary archive entry: `#source-entry[data-view="archive"]` inside `.header-actions`.

- [ ] **Step 1: 扩充 HTML 契约测试**

```js
assert.equal((html.match(/class="nav-link/g) || []).length, 2);
assert.match(html, /id="source-entry"[^>]*data-view="archive"/);
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/html-contract.test.js`  
Expected: FAIL，当前中央导航仍有三个 `.nav-link`。

- [ ] **Step 3: 修改导航结构和文案**

从 `.main-nav` 移除 archive 按钮，在 `.header-actions` 中加入：

```html
<button class="source-entry" id="source-entry" type="button" data-view="archive" data-copy="navArchive">Источники</button>
```

俄文 `navArchive` 改为 `Источники`，中文改为 `史料来源`。

- [ ] **Step 4: 调整路线列表网格**

```css
.route-stop-list {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(5, minmax(64px, 1fr));
  gap: 6px;
  margin: 18px 0;
}
.route-stop-list li { min-height: 0; }
.route-stop-list button { height: 100%; padding: 12px 10px; }
```

为 `.source-entry` 添加低权重边框按钮样式，active 状态只使用文字和底边，不抢占主导航层级。

- [ ] **Step 5: 运行验证并提交**

Run: `npm run validate`  
Expected: 全部通过。

```bash
git add index.html src/data/ui-copy.js styles/layout.css tests/html-contract.test.js
git commit -m "feat: simplify navigation and balance route rail"
```

### Task 3: 加入哈尔滨站许可照片和一屏导览

**Files:**
- Create: `assets/images/harbin-station-south-facade.jpg`
- Modify: `src/data/route-content.js`
- Modify: `index.html`
- Modify: `src/views/stop-guide.js`
- Modify: `src/app.js`
- Modify: `styles/layout.css`
- Modify: `styles/components.css`
- Modify: `tests/content-validation.test.js`
- Modify: `tests/html-contract.test.js`

**Interfaces:**
- Optional stop field: `visual: { src, alt: {ru,zh}, credit, license, sourceUrl }`.
- `renderStopGuide` consumes `onNextStop(stopId)`; next is never gated by task completion.

- [ ] **Step 1: 添加失败测试**

```js
const station = ROUTE.stops.find((stop) => stop.id === "harbin-station");
assert.match(station.visual.src, /assets\/images\/harbin-station/);
assert.equal(station.visual.license, "CC BY-SA 4.0");

assert.match(html, /id="guide-image"/);
assert.match(html, /id="guide-footer"/);
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/content-validation.test.js tests/html-contract.test.js`  
Expected: FAIL，图片数据和导览页元素尚不存在。

- [ ] **Step 3: 下载照片并记录许可**

从 Wikimedia Commons 的 `Special:Redirect/file/South facade of Harbin Railway Station (20230721081450).jpg?width=1600` 下载本地 JPEG，检查 MIME、像素和文件大小。数据中写入作者 `N509FZ`、许可 `CC BY-SA 4.0` 与原文件页链接。

- [ ] **Step 4: 重构导览 HTML**

左侧加入 `<img id="guide-image">` 和 `#guide-photo-credit`。右侧改为：章节区、音频区、`.guide-explore-grid`（任务／问答两列）及 `#guide-footer`。底部按钮保留 `#complete-stop-button`，但语义改为始终可用的下一站按钮。

- [ ] **Step 5: 让任务完全可选**

删除：

```js
completeButton.disabled = !taskCompleted;
```

替换为：

```js
completeButton.disabled = false;
completeButton.onclick = () => onNextStop(stop.id);
```

`app.js` 中 `onNextStop` 点击时记录当前点位已游览；有下一站时直接选中并打开下一站导览，末站时返回路线地图，不跳转史料来源。

- [ ] **Step 6: 实现固定一屏 CSS**

```css
.guide-view { height: calc(100vh - var(--header-height)); grid-template-columns: 38% 62%; overflow: hidden; }
.guide-content { height: 100%; display: grid; grid-template-rows: auto minmax(0,1fr) auto; overflow: hidden; }
.guide-explore-grid { min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.guide-footer { position: relative; align-self: end; }
```

压缩标题、正文、按钮和模块间距，使俄文最长文案在 1366×768 下仍不产生整页滚动；问答结果在固定高度区域内显示。

- [ ] **Step 7: 运行自动验证并提交**

Run: `npm run validate`  
Expected: 全部通过。

```bash
git add assets/images src/data/route-content.js index.html src/views/stop-guide.js src/app.js styles/layout.css styles/components.css tests
git commit -m "feat: redesign stop guide around optional exploration"
```

### Task 4: 三档电脑端浏览器验收和记录

**Files:**
- Modify: `../V2验收/V2电脑端验收记录.md`
- Modify: `../V2内容整理/坐标与内容核对记录.md`

**Interfaces:**
- Acceptance viewports: 1366×768, 1440×900, 1920×1080.

- [ ] **Step 1: 地图回归验收**

对每个视口执行：首页 → 我的路线 → 首页，确认首页地图仍显示五个哈尔滨点位，且 `documentElement.scrollWidth <= innerWidth`。

- [ ] **Step 2: 路线页验收**

确认五站按钮与进入导览按钮均在视口内；记录每个按钮边界，最后一个点位与底部主按钮之间无大片空白。

- [ ] **Step 3: 导览页验收**

在未点击任务的情况下直接点击下一站，确认进入第二站。返回哈尔滨站后验证照片、署名、章节、音频、任务、问答和下一站按钮均可见；页面无横向溢出，`guide-view` 高度不超过视口内容区。

- [ ] **Step 4: 完整验证**

Run: `npm run validate`  
Expected: 全部通过且浏览器无应用级 error 日志。

- [ ] **Step 5: 更新验收记录并提交**

在两份记录中写明地图根因与修复、图片许可、任务可选和三档结果。项目仓库只提交仓库内文件；仓库外验收记录保存在 `网页原型 V1` 对应文件夹。

```bash
git status --short
git log --oneline -5
```

Expected: V2 仓库干净，V1 `public-package` 仍无改动。
