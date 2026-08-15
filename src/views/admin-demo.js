import { ROUTE, SOURCES } from "../data/route-content.js";

const reviewedSources = (stop) => stop.sourceIds.filter((id) => SOURCES.find((source) => source.id === id)?.review === "reviewed").length;

document.querySelector("#admin-summary").innerHTML = `
  <article><strong>${ROUTE.stops.length}</strong><span>真实点位</span></article>
  <article><strong>${ROUTE.stops.reduce((sum, stop) => sum + stop.questionIds.length, 0)}</strong><span>限定史料问题</span></article>
  <article><strong>${ROUTE.stops.filter((stop) => stop.audio.reviewStatus === "approved").length}/5</strong><span>俄语音频已复核</span></article>
  <article><strong>${ROUTE.stops.filter((stop) => stop.coordinateStatus === "verified").length}/5</strong><span>坐标已复核</span></article>`;

document.querySelector("#admin-table-body").innerHTML = ROUTE.stops.map((stop) => `<tr><td><strong>${stop.name.zh}</strong><br><small>${stop.name.ru}</small></td><td><span class="status-chip ok">${stop.scenes.length} 个场景</span></td><td><span class="status-chip review">待俄方复核</span></td><td>${reviewedSources(stop)}/${stop.sourceIds.length}</td><td><span class="status-chip review">试听稿</span></td><td><span class="status-chip review">图片待补</span></td></tr>`).join("");
