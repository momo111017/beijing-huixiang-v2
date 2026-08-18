import assert from "node:assert/strict";
import test from "node:test";
import { createMapLoadError, isRetryableMapError } from "../src/map/baidu-loader.js";

test("地图加载错误带有稳定的分类码", () => {
  assert.equal(createMapLoadError("missing-ak").code, "missing-ak");
  assert.equal(createMapLoadError("network").code, "network");
  assert.equal(createMapLoadError("timeout").code, "timeout");
  assert.equal(createMapLoadError("unavailable").code, "unavailable");
});

test("地图网络失败、超时和 API 不可用可重试", () => {
  for (const code of ["network", "timeout", "unavailable"]) {
    assert.equal(isRetryableMapError(createMapLoadError(code)), true);
  }
  assert.equal(isRetryableMapError(createMapLoadError("missing-ak")), false);
  assert.equal(isRetryableMapError(new Error("unknown")), false);
});
