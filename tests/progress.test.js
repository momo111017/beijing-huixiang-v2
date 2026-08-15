import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/storage.js";
import { completeStop, completeTask, nextStopId, progressCount } from "../src/core/progress.js";
import { ROUTE } from "../src/data/route-content.js";

test("完成站点与任务去重", () => {
  let state = createInitialState();
  state = completeTask(completeTask(state, "t1"), "t1");
  state = completeStop(completeStop(state, "harbin-station"), "harbin-station");
  assert.deepEqual(state.completedTaskIds, ["t1"]);
  assert.equal(progressCount(state), 1);
});
test("下一站按地理顺序推进", () => assert.equal(nextStopId(ROUTE.stops, "harbin-station"), "soviet-memorial"));
test("末站后返回 null", () => assert.equal(nextStopId(ROUTE.stops, "stalin-park"), null));
