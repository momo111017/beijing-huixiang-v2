import test from "node:test";
import assert from "node:assert/strict";
import { ROUTE } from "../src/data/route-content.js";
import { validateRouteContent } from "../scripts/validate-content.mjs";

test("五站内容模型满足 V2 草稿契约", () => {
  assert.deepEqual(validateRouteContent(ROUTE), []);
  assert.equal(ROUTE.stops.length, 5);
  const station = ROUTE.stops.find((stop) => stop.id === "harbin-station");
  assert.equal(station.scenes.length, 3);
  assert.match(station.visual.src, /assets\/images\/harbin-station/);
  assert.equal(station.visual.license, "CC BY-SA 4.0");
  assert.ok(ROUTE.stops.every((stop) => stop.questionIds.length >= 2));
});

test("坐标与俄语未人工复核时 release 门槛拒绝发布", () => {
  const errors = validateRouteContent(ROUTE, { release: true });
  assert.ok(errors.some((error) => error.includes("coordinate not verified")));
  assert.ok(errors.some((error) => error.includes("russian audio not approved")));
});

test("五站均提供可追溯的本地实景图", () => {
  const fields = ["src", "alt", "credit", "license", "licenseUrl", "sourceUrl", "modificationNote"];
  for (const stop of ROUTE.stops) {
    assert.ok(stop.visual, `${stop.id}: visual missing`);
    for (const field of fields) assert.ok(stop.visual[field], `${stop.id}: visual.${field} missing`);
    assert.ok(stop.visual.alt.ru && stop.visual.alt.zh, `${stop.id}: bilingual alt missing`);
    assert.match(stop.visual.src, /^\.\/assets\/images\/.+\.jpg$/);
    assert.match(stop.visual.sourceUrl, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(stop.visual.licenseUrl, /^https:\/\/creativecommons\.org\//);
  }
});
