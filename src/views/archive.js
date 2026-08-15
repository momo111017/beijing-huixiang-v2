import { SOURCES } from "../data/route-content.js";
import { localized } from "../core/i18n.js";

export function renderArchive({ language, stops, activeFilter = "all" }) {
  const filters = document.querySelector("#archive-filters");
  const choices = [{ id: "all", label: language === "ru" ? "Все" : "全部" }, ...stops.map((stop) => ({ id: stop.id, label: localized(stop.name, language) }))];
  filters.innerHTML = choices.map((choice) => `<button type="button" data-filter="${choice.id}" class="${choice.id === activeFilter ? "active" : ""}">${choice.label}</button>`).join("");
  const visible = SOURCES.filter((source) => activeFilter === "all" || source.stopId === "all" || source.stopId === activeFilter);
  document.querySelector("#archive-grid").innerHTML = visible.map((source) => `<article class="archive-card"><div class="archive-meta"><span>${localized(source.type, language)}</span><span class="status-chip ${source.review === "reviewed" ? "ok" : "review"}">${source.review === "reviewed" ? (language === "ru" ? "проверено" : "已核对") : (language === "ru" ? "проверяется" : "待复核")}</span></div><h2>${localized(source.title, language)}</h2><p>${localized(source.detail, language)}</p><footer>${localized(source.rights, language)}</footer></article>`).join("");
  filters.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => renderArchive({ language, stops, activeFilter: button.dataset.filter })));
}
