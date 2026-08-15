import { fileURLToPath } from "node:url";
import { ROUTE, QUESTIONS, SOURCES } from "../src/data/route-content.js";

export function validateRouteContent(route, { release = false } = {}) {
  const errors = [];
  if (route.defaultLanguage !== "ru") errors.push("defaultLanguage must be ru");
  if (route.stops.length !== 5) errors.push("route must contain exactly five stops");
  if (new Set(route.stops.map((stop) => stop.id)).size !== route.stops.length) errors.push("stop ids must be unique");
  if (new Set(route.stops.map((stop) => stop.routeOrder)).size !== route.stops.length) errors.push("routeOrder values must be unique");
  const questionIds = new Set(QUESTIONS.map((question) => question.id));
  const sourceIds = new Set(SOURCES.map((source) => source.id));
  for (const stop of route.stops) {
    if (!Array.isArray(stop.positionWgs84) || stop.positionWgs84.length !== 2 || stop.positionWgs84.some((value) => !Number.isFinite(value))) errors.push(`${stop.id}: invalid coordinates`);
    if (!stop.name?.ru || !stop.name?.zh) errors.push(`${stop.id}: missing bilingual name`);
    if (!stop.scenes?.length) errors.push(`${stop.id}: missing scenes`);
    if (!stop.task?.id || stop.task.options?.length < 2) errors.push(`${stop.id}: missing task`);
    if ((stop.questionIds?.length ?? 0) < 2) errors.push(`${stop.id}: needs at least two questions`);
    for (const id of stop.questionIds || []) if (!questionIds.has(id)) errors.push(`${stop.id}: unknown question ${id}`);
    for (const id of stop.sourceIds || []) if (!sourceIds.has(id)) errors.push(`${stop.id}: unknown source ${id}`);
    if (!/^\.\/assets\/audio\/.+-ru\.mp3$/.test(stop.audio?.src || "")) errors.push(`${stop.id}: invalid audio path`);
    if (!/^\.\/assets\/transcripts\/.+-ru\.txt$/.test(stop.audio?.transcript || "")) errors.push(`${stop.id}: invalid transcript path`);
    if (release && stop.coordinateStatus !== "verified") errors.push(`${stop.id}: coordinate not verified`);
    if (release && stop.audio.reviewStatus !== "approved") errors.push(`${stop.id}: russian audio not approved`);
  }
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateRouteContent(ROUTE, { release: process.argv.includes("--release") });
  if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
  console.log("content validation passed");
}
