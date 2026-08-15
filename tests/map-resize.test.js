import test from "node:test";
import assert from "node:assert/strict";
import { resizeMountedMap } from "../src/map/map-controller.js";

test("只调整指定的可见地图", () => {
  const calls = [];
  const maps = new Map([
    ["home", { checkResize: () => calls.push("home") }],
    ["route", { checkResize: () => calls.push("route") }],
  ]);

  assert.equal(resizeMountedMap(maps, "route", (_map, key) => calls.push(`fit:${key}`)), true);
  assert.deepEqual(calls, ["route", "fit:route"]);
});

test("未挂载地图时不执行调整", () => {
  assert.equal(resizeMountedMap(new Map(), "home", () => { throw new Error("should not run"); }), false);
});
