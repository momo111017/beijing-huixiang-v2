# V3 Russian Feedback Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 根据俄语用户 V2 反馈完成 V3 的俄语内容重写、音频文字稿校准、任务问答去重和桌面端百度地图失败兜底。

**Architecture:** 延续 V2 的数据驱动前端。俄语界面文案集中在 `src/data/ui-copy.js`，五站内容、任务、问答和来源集中在 `src/data/route-content.js`，音频文字稿继续作为 `assets/transcripts/*-ru.txt` 静态资产。地图加载状态保留在 `src/app.js` 与 `src/map/baidu-loader.js`，失败时由现有列表和点位卡承担可用兜底。

**Tech Stack:** 原生 ES modules、静态 HTML/CSS、百度地图 JavaScript API、Node `node:test`、现有 `npm run validate`。

## Global Constraints

- 默认语言继续为俄语，中文只作为切换语言。
- 不修改移动端响应式布局；本轮只验证桌面端地图和主流程。
- 所有新增事实必须关联现有审核来源，资料库没有依据时不编造。
- 音频未完成俄语母语核听前，`reviewStatus` 保持 `needs-review`。
- 不新增依赖、不引入后端、不把限定问答改成开放域 AI。

### Task 1: 建立 V3 文案与内容回归基线

**Files:**
- Modify: `src/data/ui-copy.js`
- Modify: `src/data/route-content.js`
- Create: `tests/v3-russian-feedback.test.js`

**Interfaces:**
- Consumes: `UI_COPY`, `ROUTE`, `QUESTIONS`, `SOURCES`。
- Produces: 可被后续内容和发布校验使用的俄语文案、站点正文和反馈回归断言。

- [ ] **Step 1: Write failing tests for required Russian copy.**

  在 `tests/v3-russian-feedback.test.js` 中导入 `UI_COPY`、`ROUTE` 和 `QUESTIONS`，断言 `UI_COPY.ru.routeTitle` 包含 `Пять остановок маршрута`、`UI_COPY.ru.openGuide === "Открыть экскурсию"`、`UI_COPY.ru.audioReady === "Готов к прослушиванию"`，并断言路线介绍包含 `Географически и исторически связанные места`。

- [ ] **Step 2: Run the focused test and verify it fails.**

  Run: `node --test tests/v3-russian-feedback.test.js`

  Expected: FAIL because the current V2 copy still uses `Пять остановок городского диалога`, `Открыть гид`, and `Готов к воспроизведению`.

- [ ] **Step 3: Update UI copy and station content.**

  修改 `UI_COPY.ru` 的 `homeLead`、`principleCopy`、`routeTitle`、`routeIntro`、`openGuide`、`audioReady`；修改 `route-content.js` 中五站的俄语 `transition`、`scenes` 和相关站点名称/角色，使站点简介、场景正文和任务问题承担不同信息层级。秋林内容必须保留 1900 年伊万·秋林开设分店、铁路物流、食品与城市生活、1953 年有偿商业移交；圣索菲亚内容必须覆盖 1907、1911、1923—1932、1996—1997 时间线；斯大林公园必须使用反馈中的江畔表达。

- [ ] **Step 4: Run the focused test and content validation.**

  Run: `node --test tests/v3-russian-feedback.test.js` and `npm run validate`.

  Expected: PASS with no content-contract errors.

- [ ] **Step 5: Commit the content baseline.**

  Run: `git add src/data/ui-copy.js src/data/route-content.js tests/v3-russian-feedback.test.js && git commit -m "feat: update Russian V3 route content"`

### Task 2: 校准五份俄语文字稿与音频状态

**Files:**
- Modify: `assets/transcripts/harbin-station-ru.txt`
- Modify: `assets/transcripts/qiulin-company-ru.txt`
- Modify: `assets/transcripts/saint-sophia-ru.txt`
- Modify: `assets/transcripts/soviet-memorial-ru.txt`
- Modify: `assets/transcripts/stalin-park-ru.txt`
- Modify: `src/data/route-content.js`
- Modify: `scripts/validate-assets.mjs`
- Modify: `tests/v3-russian-feedback.test.js`

**Interfaces:**
- Consumes: Each stop's `audio.src`, `audio.transcript`, `audio.reviewStatus` and the static transcript files.
- Produces: 与页面展示一致的俄语文字稿、可识别的音频审核状态和非空资产检查。

- [ ] **Step 1: Add failing transcript assertions.**

  在测试中读取五个 transcript 文件，断言每个文件包含所属站点的关键事实；断言所有 stop 的 `audio.transcript` 与文件存在且 `reviewStatus` 仍为 `needs-review`。

- [ ] **Step 2: Run the focused test and verify the stale text is detected.**

  Run: `node --test tests/v3-russian-feedback.test.js`

  Expected: FAIL for outdated Saint Sophia and Stalin Park wording.

- [ ] **Step 3: Replace transcript content with the reviewed V3 drafts.**

  更新五份 `.txt`，保证文本与页面场景一致；对无法确认的录音差异只更新文字稿并保留 `needs-review`，不伪造“已重新录音”。若本地 MP3 在本轮没有新录音文件，不替换 MP3，只在测试和验收记录中明确待核听。

- [ ] **Step 4: Strengthen asset validation without requiring unverified audio approval.**

  在 `scripts/validate-assets.mjs` 中增加 transcript 非空和 stop-to-transcript basename 对应检查，保持 `npm run validate:release` 对 `approved` 的严格要求。

- [ ] **Step 5: Run validation and commit.**

  Run: `npm run validate`.

  Expected: `content validation passed`, `asset validation passed`, HTML validation and all tests pass.

  Commit: `git add assets/transcripts src/data/route-content.js scripts/validate-assets.mjs tests/v3-russian-feedback.test.js && git commit -m "fix: align V3 Russian transcripts"`

### Task 3: 去除任务与史料追问的重复信息

**Files:**
- Modify: `src/data/route-content.js`
- Modify: `tests/tasks-qa.test.js`
- Modify: `tests/v3-russian-feedback.test.js`

**Interfaces:**
- Consumes: `ROUTE.stops[*].task`, `QUESTIONS`, `getQuestion`。
- Produces: 每站具有现场观察/判断任务和来源补充问答的内容模型。

- [ ] **Step 1: Add failing anti-duplication checks.**

  添加测试：每个问题答案必须包含至少一个 `sourceIds`；每个 stop 的任务问题不能与其场景正文完全相等；V3 指定的秋林、圣索菲亚和斯大林公园问题必须出现反馈要求的补充事实。

- [ ] **Step 2: Run the focused test and verify the current overlap.**

  Run: `node --test tests/tasks-qa.test.js tests/v3-russian-feedback.test.js`

  Expected: FAIL for at least one duplicated or under-specified question.

- [ ] **Step 3: Rewrite task and question copy only, preserving the existing interaction API.**

  修改 `task.question`、选项、解释和 `QUESTIONS` 的 `q/a`，不改 `tasks.js` 或 `source-qa.js` 的接口。任务优先要求用户观察建筑、判断时间线或辨认地点；追问补充人物、用途、年代和城市生活，并保留 `sourceIds`。

- [ ] **Step 4: Run task, content and full validation.**

  Run: `node --test tests/tasks-qa.test.js tests/v3-russian-feedback.test.js` and `npm run validate`.

  Expected: PASS.

- [ ] **Step 5: Commit the interaction copy.**

  Run: `git add src/data/route-content.js tests/tasks-qa.test.js tests/v3-russian-feedback.test.js && git commit -m "feat: deepen V3 stop tasks and source questions"`

### Task 4: 修复桌面端地图加载失败时的可用性

**Files:**
- Modify: `src/map/baidu-loader.js`
- Modify: `src/app.js`
- Modify: `index.html`
- Modify: `styles/components.css`
- Create or Modify: `tests/map-loading.test.js`

**Interfaces:**
- Consumes: `loadBaiduMap`, `resetBaiduLoaderForRetry`, `setMapState`, existing route list.
- Produces: 地图加载成功、失败、重试状态；地图失败时五站列表和进入导览按钮仍可操作。

- [ ] **Step 1: Add failing loader tests.**

  使用无 DOM 的纯函数测试或导出的 `getMapLoadErrorCopy`/`isRetryableMapError`，覆盖缺少 AK、脚本 `onerror`、超时和重试后重新创建 promise；测试不依赖真实百度网络。

- [ ] **Step 2: Run the focused map tests and verify missing behavior.**

  Run: `node --test tests/map-loading.test.js`

  Expected: FAIL until loader errors have stable classifications and retry clears the failed promise.

- [ ] **Step 3: Make loader failures explicit and retry-safe.**

  在 `baidu-loader.js` 中统一错误码/消息来源，确保 timeout、network、missing-AK 均清除 callback 和 `mapPromise`；保留 `resetBaiduLoaderForRetry()` 作为唯一重试入口。

- [ ] **Step 4: Keep the route list usable when the map fails.**

  在 `app.js`/`index.html` 中把错误状态与路线列表可用性分开：失败时显示地图错误和检查 AK/Referer 的提示，但不隐藏路线列表、点位卡和进入导览按钮；重试成功后更新两个地图状态面板。必要时只做桌面宽度下的状态样式调整，不修改移动端断点。

- [ ] **Step 5: Run focused tests, full validation and a desktop smoke test.**

  Run: `node --test tests/map-loading.test.js tests/map-resize.test.js tests/html-contract.test.js` and `npm run validate`.

  Expected: PASS; manual desktop check confirms map success/error/retry and list fallback.

- [ ] **Step 6: Commit the map fallback.**

  Run: `git add src/map/baidu-loader.js src/app.js index.html styles/components.css tests/map-loading.test.js && git commit -m "fix: keep route usable when map fails"`

### Task 5: V3 发布门槛与验收记录

**Files:**
- Modify: `README.md`
- Create: `docs/qa/2026-08-18-v3-russian-feedback-acceptance.md`
- Modify: `tests/v3-russian-feedback.test.js`

**Interfaces:**
- Consumes: V3 content, transcript, map-loading and full validation results.
- Produces: 可复核的 V3 变更记录和桌面端验收结论。

- [ ] **Step 1: Add release metadata assertions.**

  测试 V3 文案关键短语、五站 transcript 路径和地图错误文案存在；不把音频 `needs-review` 强行改为 `approved`。

- [ ] **Step 2: Run the complete validation suite.**

  Run: `npm run validate`.

  Expected: all content, asset, HTML and Node tests pass.

- [ ] **Step 3: Perform the desktop smoke checks.**

  使用本地服务器打开首页，检查俄语默认、路线进入、五站列表、导览进入、文字稿展开、任务/追问和地图失败兜底；记录未做移动端适配。

- [ ] **Step 4: Write the V3 acceptance record.**

  在 `docs/qa/2026-08-18-v3-russian-feedback-acceptance.md` 记录变更摘要、测试命令、桌面端结果、音频待核听项和明确未纳入的移动端适配。

- [ ] **Step 5: Commit documentation and final V3 changes.**

  Run: `git add README.md docs/qa/2026-08-18-v3-russian-feedback-acceptance.md tests/v3-russian-feedback.test.js && git commit -m "docs: record V3 Russian feedback acceptance"`
