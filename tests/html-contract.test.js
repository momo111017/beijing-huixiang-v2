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
  assert.match(componentCss, /\.task-options\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(componentCss, /\.qa-module:has\(\.qa-answer:not\(:empty\)\)\s+\.suggested-questions\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
});

test("重新渲染导览时清除上一语言的追问答案", async () => {
  const source = await readFile(new URL("../src/views/stop-guide.js", import.meta.url), "utf8");
  assert.match(source, /const answer = document\.querySelector\("#qa-answer"\);\s*answer\.replaceChildren\(\);/);
});
