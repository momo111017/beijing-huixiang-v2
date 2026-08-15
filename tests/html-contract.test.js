import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("游客端俄语默认并只暴露精简主导航", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /<html lang="ru">/);
  for (const id of ["home-map", "route-map", "route-stop-list", "guide-audio", "archive-view", "language-switch"]) assert.match(html, new RegExp(`id="${id}"`));
  assert.doesNotMatch(html, /data-view="admin"/);
  assert.doesNotMatch(html, /data-view="map"/);
  assert.doesNotMatch(html, /data-view="task"/);
});
