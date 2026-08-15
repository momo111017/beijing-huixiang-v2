import test from "node:test";
import assert from "node:assert/strict";
import { coordinateKey, uniquePositions } from "../src/map/coordinates.js";

test("相同 WGS84 坐标只保留一次", () => {
  const point = [126.6254465, 45.7600422];
  assert.equal(uniquePositions([point, point, [126.6102565, 45.7784887]]).length, 2);
  assert.equal(coordinateKey(point), "126.6254465,45.7600422");
});
