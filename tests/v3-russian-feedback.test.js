import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { ROUTE, QUESTIONS } from "../src/data/route-content.js";
import { UI_COPY } from "../src/data/ui-copy.js";

const root = new URL("../", import.meta.url);

test("V3 Russian route copy uses the approved feedback wording", () => {
  assert.match(UI_COPY.ru.homeLead, /Пять знаковых мест/);
  assert.match(UI_COPY.ru.routeTitle, /Пять остановок маршрута/);
  assert.match(UI_COPY.ru.routeIntro, /Географически и исторически связанные места/);
  assert.equal(UI_COPY.ru.openGuide, "Открыть экскурсию");
  assert.equal(UI_COPY.ru.audioReady, "Готов к прослушиванию");
  assert.match(UI_COPY.ru.principleCopy, /не делать лишних перемещений/);
});

test("V3 expands the three feedback-priority stops into distinct scenes", () => {
  for (const stopId of ["qiulin-company", "saint-sophia", "stalin-park"]) {
    const stop = ROUTE.stops.find((item) => item.id === stopId);
    assert.ok(stop, `${stopId} exists`);
    assert.ok(stop.scenes.length >= 2, `${stopId} has at least two scenes`);
    assert.ok(stop.scenes.every((scene) => scene.body.ru.length >= 120), `${stopId} scenes carry substantive Russian history`);
  }
});

test("V3 keeps feedback facts in the route model", () => {
  const qiulin = ROUTE.stops.find((stop) => stop.id === "qiulin-company");
  const sophia = ROUTE.stops.find((stop) => stop.id === "saint-sophia");
  const park = ROUTE.stops.find((stop) => stop.id === "stalin-park");
  const qiulinText = qiulin.scenes.map((scene) => scene.body.ru).join(" ");
  const sophiaText = sophia.scenes.map((scene) => scene.body.ru).join(" ");
  const parkText = park.scenes.map((scene) => `${scene.title.ru} ${scene.body.ru}`).join(" ");
  assert.match(qiulinText, /1900 году.*Иван Чурин/);
  assert.match(qiulinText, /1953 году.*возмездной коммерческой сделкой/);
  assert.match(sophiaText, /1907 году.*1911 году/);
  assert.match(sophiaText, /1923 году.*1932 году/);
  assert.match(sophiaText, /1996 году.*1997 года/);
  assert.match(parkText, /Тихая прибрежная зона Сунгари/);
  assert.match(parkText, /мирной городской жизнью/);
});

test("V3 source questions remain evidence-bound and do not copy scene bodies verbatim", () => {
  const questionById = new Map(QUESTIONS.map((question) => [question.id, question]));
  for (const stop of ROUTE.stops) {
    const sceneBodies = stop.scenes.map((scene) => scene.body.ru);
    for (const questionId of stop.questionIds) {
      const question = questionById.get(questionId);
      assert.ok(question?.sourceIds?.length, `${questionId} has sources`);
      assert.ok(!sceneBodies.includes(question.a.ru), `${questionId} is not a scene copy`);
    }
  }
});

test("V3 transcripts are present, non-empty and paired with unapproved audio", async () => {
  for (const stop of ROUTE.stops) {
    assert.equal(stop.audio.reviewStatus, "needs-review", `${stop.id} remains pending Russian listening review`);
    const transcript = await readFile(new URL(stop.audio.transcript.replace("./", ""), root), "utf8");
    assert.ok(transcript.trim().length >= 120, `${stop.id} transcript is substantive`);
  }
});
