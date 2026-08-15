import test from "node:test";
import assert from "node:assert/strict";
import { ROUTE } from "../src/data/route-content.js";
import { evaluateTask } from "../src/features/tasks.js";
import { answerFromReviewedSources, answerQuestion, suggestQuestions } from "../src/features/source-qa.js";

test("任务只接受审核答案", () => {
  const task = ROUTE.stops[0].task;
  assert.equal(evaluateTask(task, task.correctIndex).correct, true);
  assert.equal(evaluateTask(task, 0).correct, false);
});
test("问题推荐绑定当前点位", () => assert.ok(suggestQuestions("harbin-station").every((question) => question.stopId === "harbin-station")));
test("已审核问题返回来源", () => assert.ok(answerQuestion("station-date", "ru").sources.length >= 1));
test("未知问题明确返回未收录", () => assert.deepEqual(answerFromReviewedSources("неизвестно", "ru"), { found: false, answer: "В текущей базе нет ответа", sources: [] }));
