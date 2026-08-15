# V2 Five-stop Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 统一五站导览页视觉、删除首页数据栏、补齐四站合法实景图，并完成五段俄语讲解核对。

**Architecture:** 保留现有 HTML／CSS／ES Modules 架构。静态实景图落在 `assets/images`，版权信息进入每个点位的 `visual` 对象；共享 CSS 负责全部五站导览布局，自动测试锁定数据和结构契约。

**Tech Stack:** HTML5、CSS Grid、JavaScript ES Modules、Node.js `node:test`、FFmpeg、Whisper、Wikimedia Commons、百度地图。

## Global Constraints

- 只修改 `/Users/学习/挑战杯/网页原型 V1/v2-package`，不修改 V1 `public-package`。
- 不修改地图、坐标、路线顺序、任务、问答或现有音频文件。
- 电脑端验收尺寸为 1366×768、1440×900、1920×1080；手机端不在本轮范围。
- 图片必须保留作者、来源页、许可证链接和“经尺寸压缩与界面裁切”说明。
- 技术核对不能替代俄方母语审核，`reviewStatus` 保持 `needs-review`。

---

### Task 1: 锁定首页、选中态和媒体数据契约

**Files:**
- Modify: `tests/html-contract.test.js`
- Modify: `tests/content-validation.test.js`

**Interfaces:**
- Consumes: `index.html`、`styles/layout.css`、`ROUTE.stops`。
- Produces: 删除首页数据栏、非绿色选中态和五站完整媒体字段的回归保护。

- [x] **Step 1: 写失败测试**

在 HTML 测试中断言 `home-facts`、`factStops`、`factFlagship`、`factAudio` 不存在；在 CSS 测试中断言选中卡使用 `#efe4d4` 与 `var(--rust)`；在内容测试中断言五站 `visual` 均含 `src`、`alt.ru`、`alt.zh`、`credit`、`license`、`licenseUrl`、`sourceUrl`、`modificationNote`。

- [x] **Step 2: 运行并确认失败**

Run: `node --test tests/html-contract.test.js tests/content-validation.test.js`

Expected: FAIL，首页数据栏仍存在、选中态仍为绿色、四站没有 `visual`。

### Task 2: 补齐四站图片和版权呈现

**Files:**
- Create: `assets/images/soviet-memorial.jpg`
- Create: `assets/images/qiulin-company.jpg`
- Create: `assets/images/saint-sophia.jpg`
- Create: `assets/images/stalin-park.jpg`
- Modify: `src/data/route-content.js`
- Modify: `src/views/stop-guide.js`
- Modify: `styles/layout.css`

**Interfaces:**
- Consumes: Wikimedia Commons 1600px 缩略图和 `visual` 数据接口。
- Produces: 五站均可渲染的本地实景图与来源／许可双链接。

- [x] **Step 1: 下载并验证四张 1600px JPEG**

Run: `curl -L '<Special:Redirect URL>?width=1600' -o assets/images/<file>.jpg`

Expected: 四文件均为非零 JPEG，宽或高不小于 1200px。

- [x] **Step 2: 给四站增加完整 `visual` 对象**

字段固定为：`src`、`alt`、`credit`、`license`、`licenseUrl`、`sourceUrl`、`modificationNote`。

- [x] **Step 3: 将图片署名渲染为来源与许可证两个链接**

`#guide-photo-credit` 内显示“照片／Фото：作者 · 许可 · 经尺寸压缩与界面裁切”，来源和许可均可点击。

- [x] **Step 4: 运行媒体契约测试**

Run: `node --test tests/content-validation.test.js && node scripts/validate-assets.mjs`

Expected: PASS。

### Task 3: 统一页面视觉修正

**Files:**
- Modify: `index.html`
- Modify: `styles/layout.css`
- Modify: `styles/components.css`

**Interfaces:**
- Consumes: 现有共享路线卡与五站导览 DOM。
- Produces: 暖米灰路线选中态、删除后的首页、五站共享放大导览布局。

- [x] **Step 1: 删除首页数据栏 DOM 和相关 CSS**

删除 `.home-facts` HTML 与全部 `.home-facts` 规则。

- [x] **Step 2: 改路线选中态**

使用 `background:#efe4d4`、`color:var(--ink)`、`border-color:var(--rust)`、红褐编号和低强度内描边，不使用绿色底色。

- [x] **Step 3: 放大并拉伸五站导览内容**

提高章节正文、音频、任务、追问字号；让 `.guide-explore-grid` 使用剩余高度并将任务／追问按比例填充；限制内部溢出。

- [x] **Step 4: 收窄并上移下一站按钮**

`.guide-footer` 水平居中，`.complete-stop` 使用 `width:calc(100% - 80px)`，底部保留 10—14px 间距。

- [x] **Step 5: 运行结构与样式测试**

Run: `node --test tests/html-contract.test.js`

Expected: PASS。

### Task 4: 核对五段俄语音频

**Files:**
- Modify: `/Users/学习/挑战杯/网页原型 V1/V2验收/V2电脑端验收记录.md`

**Interfaces:**
- Consumes: 五个 MP3、五个 TXT、页面 `stop.scenes` 俄语正文。
- Produces: 可复查的逐站音频验收表。

- [x] **Step 1: 完整解码与非静音检查**

Run: `ffmpeg -v error -i <audio> -f null -`

Expected: 五段零解码错误；时长均为 20—60 秒；音频非静音。

- [x] **Step 2: Whisper 转写并比对关键事实**

使用 `mlx-community/whisper-large-v3-turbo`、`--language ru`、逐词时间戳；逐站比较 MP3 转写、TXT 和页面正文中的年份、专名、地点和事件关系。

- [x] **Step 3: 保持人工审核状态**

确认五站 `reviewStatus` 仍为 `needs-review`，在验收记录注明仍待俄方母语成员复核自然度和发音。

### Task 5: 自动化和三档电脑端验收

**Files:**
- Modify: `/Users/学习/挑战杯/网页原型 V1/V2验收/V2电脑端验收记录.md`

**Interfaces:**
- Consumes: 完成后的页面、内容数据和媒体资产。
- Produces: 五站 × 两种语言 × 三档视口的验收证据。

- [x] **Step 1: 运行全量自动校验**

Run: `npm run validate`

Expected: 内容、资产、HTML 与全部 Node 测试通过。

- [ ] **Step 2: 逐站浏览器验收**

在 1366×768、1440×900、1920×1080 下逐站打开导览并切换中俄文，检查图片、版权链接、音频元数据、任务、问答、按钮和页面溢出。

- [ ] **Step 3: 记录结果并提交**

Run: `git add assets index.html src styles tests docs && git commit -m "feat: polish all five V2 stops"`

Expected: V2 工作区干净，V1 无改动。
