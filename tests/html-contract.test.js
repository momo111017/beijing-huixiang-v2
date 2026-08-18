import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("游客端俄语默认并只暴露精简主导航", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /<html lang="ru">/);
  for (const id of ["home-map", "route-map", "route-stop-list", "guide-audio", "archive-view", "language-switch"]) assert.match(html, new RegExp(`id="${id}"`));
  for (const id of ["guide-image", "guide-photo-credit", "guide-explore-grid", "guide-footer"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.equal((html.match(/class="nav-link/g) || []).length, 2);
  assert.match(html, /id="source-entry"[^>]*data-view="archive"/);
  assert.doesNotMatch(html, /data-view="admin"/);
  assert.doesNotMatch(html, /data-view="map"/);
  assert.doesNotMatch(html, /data-view="task"/);
  assert.doesNotMatch(html, /home-facts|factStops|factFlagship|factAudio/);
});

test("V3 俄语反馈中的英文混用和术语问题不再出现", async () => {
  const [html, uiCopy, routeContent, routeWorkspace, stopGuide, memorialTranscript, parkTranscript] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/data/ui-copy.js", import.meta.url), "utf8"),
    readFile(new URL("../src/data/route-content.js", import.meta.url), "utf8"),
    readFile(new URL("../src/views/route-workspace.js", import.meta.url), "utf8"),
    readFile(new URL("../src/views/stop-guide.js", import.meta.url), "utf8"),
    readFile(new URL("../assets/transcripts/soviet-memorial-ru.txt", import.meta.url), "utf8"),
    readFile(new URL("../assets/transcripts/stalin-park-ru.txt", import.meta.url), "utf8"),
  ]);
  assert.match(uiCopy, /русско-китайского взаимодействия в Харбине/);
  assert.match(uiCopy, /openGuide:\s*"Открыть экскурсию"/);
  assert.match(html, /КАРТА БАЙДУ/);
  assert.doesNotMatch(`${html}\n${uiCopy}`, /HARBIN|ROUTE 01|BAIDU MAP|Следовать за позицией/);
  assert.match(routeWorkspace, /\$\{stop\.duration\} мин/);
  assert.doesNotMatch(routeWorkspace, /\$\{stop\.duration\} min/);
  assert.match(stopGuide, /language === "ru" \? "; " : "；"/);
  assert.doesNotMatch(routeContent, /1898—современность|1938—сегодня|закончить маршрутом покупок|общей набережной/);
  assert.match(memorialTranscript, /Памятник советским воинам.+Музейной площади/s);
  assert.match(parkTranscript, /Тихая прибрежная зона Сунгари/);
});

test("导览探索区使用上下全宽布局", async () => {
  const layoutCss = await readFile(new URL("../styles/layout.css", import.meta.url), "utf8");
  const componentCss = await readFile(new URL("../styles/components.css", import.meta.url), "utf8");
  assert.match(layoutCss, /\.guide-explore-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*;/s);
  assert.match(layoutCss, /\.guide-content\s*\{[^}]*gap:\s*9px[^}]*padding:\s*16px\s+24px\s+20px/s);
  assert.match(layoutCss, /\.task-module,\s*\.qa-module\s*\{[^}]*padding:\s*12px\s+16px/s);
  assert.match(componentCss, /\.task-options\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(componentCss, /\.qa-module:has\(\.qa-answer:not\(:empty\)\)\s+\.suggested-questions\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(componentCss, /\.qa-answer\s*\{[^}]*max-height:\s*74px/s);
});

test("重新渲染导览时清除上一语言的追问答案", async () => {
  const source = await readFile(new URL("../src/views/stop-guide.js", import.meta.url), "utf8");
  assert.match(source, /const answer = document\.querySelector\("#qa-answer"\);\s*answer\.replaceChildren\(\);/);
});

test("桌面端使用统一柔化令牌和路线栅格", async () => {
  const tokens = await readFile(new URL("../styles/tokens.css", import.meta.url), "utf8");
  const layout = await readFile(new URL("../styles/layout.css", import.meta.url), "utf8");
  assert.match(tokens, /--radius-sm:\s*8px/);
  assert.match(tokens, /--radius:\s*10px/);
  assert.match(tokens, /--radius-lg:\s*14px/);
  assert.match(layout, /\.route-view\s*\{[^}]*--route-rail-width:\s*390px[^}]*grid-template-columns:\s*var\(--route-rail-width\)\s+minmax\(0,\s*1fr\)/s);
  assert.match(layout, /\.route-rail\s*\{[^}]*padding:\s*20px\s+22px\s+16px/s);
  assert.match(layout, /\.route-stop-list\s*\{[^}]*grid-template-rows:\s*repeat\(5,\s*minmax\(72px,\s*1fr\)\)/s);
  assert.match(layout, /\.route-stop-list\s*\{[^}]*margin:\s*10px\s+0/s);
  assert.match(layout, /\.route-stop-list small\s*\{[^}]*font-size:\s*13\.5px/s);
  assert.match(layout, /\.route-stop-list button > span:nth-child\(2\) small\s*\{[^}]*white-space:\s*nowrap[^}]*text-overflow:\s*ellipsis/s);
  assert.match(layout, /\.route-heading h1\s*\{[^}]*text-wrap:\s*wrap/s);
  assert.match(layout, /@media\s*\(min-width:\s*1600px\)[^{]*\{[^}]*\.route-view\s*\{[^}]*--route-rail-width:\s*410px/s);
});

test("路线选中态和五站导览使用统一暖色与伸展布局", async () => {
  const layout = await readFile(new URL("../styles/layout.css", import.meta.url), "utf8");
  assert.match(layout, /\.route-stop-list button\.active\s*\{[^}]*border-color:\s*var\(--rust\)[^}]*background:\s*#efe4d4[^}]*color:\s*var\(--ink\)/s);
  assert.match(layout, /\.guide-explore-grid\s*\{[^}]*grid-template-rows:\s*minmax\(140px,\s*\.9fr\)\s+minmax\(170px,\s*1\.1fr\)[^}]*align-content:\s*stretch/s);
  assert.match(layout, /\.complete-stop\s*\{[^}]*width:\s*calc\(100%\s*-\s*80px\)[^}]*margin:\s*0\s+auto/s);
});

test("路线左栏使用放大字号且地图点位卡保持紧凑", async () => {
  const layout = await readFile(new URL("../styles/layout.css", import.meta.url), "utf8");
  assert.match(layout, /\.route-view\s*\{[^}]*--route-rail-width:\s*390px[^}]*grid-template-columns:\s*var\(--route-rail-width\)\s+minmax\(0,\s*1fr\)/s);
  assert.match(layout, /\.route-heading h1\s*\{[^}]*font:\s*700\s+38px\/1\.08/s);
  assert.match(layout, /\.route-stop-list strong\s*\{[^}]*font-size:\s*19px/s);
  assert.match(layout, /\.route-stop-list button > span:nth-child\(2\) small\s*\{[^}]*font-size:\s*14\.5px/s);
  assert.match(layout, /\.route-stop-list button > small:last-child\s*\{[^}]*font-size:\s*13\.5px/s);
  assert.match(layout, /\.route-stop-card\s*\{[^}]*right:\s*auto[^}]*width:\s*var\(--route-rail-width\)[^}]*max-width:\s*calc\(100%\s*-\s*48px\)/s);
  assert.match(layout, /@media\s*\(max-width:\s*1180px\)[^{]*\{[\s\S]*?\.route-view\s*\{[^}]*--route-rail-width:\s*350px/s);
  assert.match(layout, /@media\s*\(min-height:\s*900px\)[^{]*\{[^}]*\.route-heading h1\s*\{[^}]*font-size:\s*40px/s);
  assert.match(layout, /@media\s*\(max-height:\s*820px\)[^{]*\{[\s\S]*?\.route-heading h1\s*\{[^}]*font-size:\s*35px/s);
});
