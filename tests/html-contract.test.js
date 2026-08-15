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
});

test("导览探索区使用上下全宽布局", async () => {
  const layoutCss = await readFile(new URL("../styles/layout.css", import.meta.url), "utf8");
  const componentCss = await readFile(new URL("../styles/components.css", import.meta.url), "utf8");
  assert.match(layoutCss, /\.guide-explore-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*;/s);
  assert.match(layoutCss, /\.guide-content\s*\{[^}]*gap:\s*9px[^}]*padding:\s*16px\s+24px\s+14px/s);
  assert.match(layoutCss, /\.task-module,\s*\.qa-module\s*\{[^}]*padding:\s*10px\s+14px/s);
  assert.match(componentCss, /\.task-options\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(componentCss, /\.qa-module:has\(\.qa-answer:not\(:empty\)\)\s+\.suggested-questions\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(componentCss, /\.qa-answer\s*\{[^}]*max-height:\s*64px/s);
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
  assert.match(layout, /\.route-view\s*\{[^}]*grid-template-columns:\s*360px\s+minmax\(0,\s*1fr\)/s);
  assert.match(layout, /\.route-rail\s*\{[^}]*padding:\s*20px\s+22px\s+16px/s);
  assert.match(layout, /\.route-stop-list\s*\{[^}]*grid-template-rows:\s*repeat\(5,\s*minmax\(68px,\s*1fr\)\)/s);
  assert.match(layout, /\.route-stop-list\s*\{[^}]*margin:\s*10px\s+0/s);
  assert.match(layout, /\.route-stop-list small\s*\{[^}]*font-size:\s*12px/s);
  assert.match(layout, /\.route-stop-list button > span:nth-child\(2\) small\s*\{[^}]*white-space:\s*nowrap[^}]*text-overflow:\s*ellipsis/s);
  assert.match(layout, /\.route-heading h1\s*\{[^}]*text-wrap:\s*wrap/s);
  assert.match(layout, /@media\s*\(min-width:\s*1600px\)[^{]*\{[^}]*\.route-view\s*\{[^}]*grid-template-columns:\s*380px/s);
});
