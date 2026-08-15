import test from "node:test";
import assert from "node:assert/strict";
import { ROUTE } from "../src/data/route-content.js";
import { validateRouteContent } from "../scripts/validate-content.mjs";

test("五站内容模型满足 V2 草稿契约", () => {
  assert.deepEqual(validateRouteContent(ROUTE), []);
  assert.equal(ROUTE.stops.length, 5);
  assert.equal(ROUTE.stops.find((stop) => stop.id === "harbin-station").scenes.length, 3);
  assert.ok(ROUTE.stops.every((stop) => stop.questionIds.length >= 2));
});

test("坐标与俄语未人工复核时 release 门槛拒绝发布", () => {
  const errors = validateRouteContent(ROUTE, { release: true });
  assert.ok(errors.some((error) => error.includes("coordinate not verified")));
  assert.ok(errors.some((error) => error.includes("russian audio not approved")));
});
