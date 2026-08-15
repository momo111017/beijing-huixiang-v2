import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/core/storage.js";
import { completeStop, completeTask, guideNextDestination, nextStopId, progressCount } from "../src/core/progress.js";
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
test("导览下一站先返回路线页并选中下一点位", () => {
  assert.deepEqual(guideNextDestination(ROUTE.stops, "harbin-station"), {
    view: "route",
    stopId: "soviet-memorial",
  });
  assert.deepEqual(guideNextDestination(ROUTE.stops, "stalin-park"), {
    view: "route",
    stopId: "stalin-park",
  });
});
