import test from "node:test";
import assert from "node:assert/strict";
import { createLocationController } from "../src/map/location-controller.js";

test("停止定位会清除 watchPosition", () => {
  let cleared = null;
  const controller = createLocationController({ geolocation: { watchPosition: () => 7, clearWatch: (id) => { cleared = id; } }, convertPoint: async () => ({}), onUpdate() {}, onStatus() {} });
  controller.start(); controller.stop();
  assert.equal(cleared, 7);
  assert.equal(controller.isTracking(), false);
});

test("拒绝定位时保留明确错误提示", () => {
  const statuses = [];
  let reject;
  const controller = createLocationController({
    geolocation: {
      watchPosition: (_success, error) => { reject = error; return 9; },
      clearWatch() {},
    },
    convertPoint: async () => ({}),
    onUpdate() {},
    onStatus(status) { statuses.push(status); },
  });
  controller.start();
  reject({ code: 1 });
  assert.equal(controller.isTracking(), false);
  assert.equal(statuses.at(-1).code, "permission-denied");
  assert.equal(statuses.at(-1).kind, "error");
});
