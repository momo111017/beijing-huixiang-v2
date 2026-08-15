import test from "node:test";
import assert from "node:assert/strict";
import { localized } from "../src/core/i18n.js";
import { createInitialState, loadState, saveState, STORAGE_KEY } from "../src/core/storage.js";

test("首次访问默认俄语", () => assert.equal(createInitialState().language, "ru"));
test("本地化按当前语言返回", () => assert.equal(localized({ ru: "Карта", zh: "地图" }, "ru"), "Карта"));
test("损坏数据恢复初始状态", () => assert.deepEqual(loadState({ getItem: () => "{bad" }), createInitialState()));
test("保存时剔除精确位置", () => {
  let value = "";
  saveState({ setItem: (key, next) => { assert.equal(key, STORAGE_KEY); value = next; } }, { ...createInitialState(), preciseLocation: [126, 45] });
  assert.doesNotMatch(value, /preciseLocation/);
});
