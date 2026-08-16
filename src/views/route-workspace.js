import { localized } from "../core/i18n.js";

const twoDigits = (value) => String(value).padStart(2, "0");

export function renderRouteWorkspace({ state, stops, selectedStop, copy, onSelect }) {
  const completed = new Set(state.completedStopIds);
  document.querySelector("#route-progress-count").textContent = `${completed.size} / ${stops.length}`;
  document.querySelector("#route-progress-bar").innerHTML = stops.map((stop) => `<i class="${completed.has(stop.id) ? "done" : stop.id === selectedStop.id ? "active" : ""}"></i>`).join("");
  const list = document.querySelector("#route-stop-list");
  list.innerHTML = stops.map((stop) => {
    const status = completed.has(stop.id) ? copy.completed : stop.id === selectedStop.id ? copy.current : copy.notStarted;
    const duration = state.language === "ru" ? `${stop.duration} мин` : `${stop.duration} 分钟`;
    return `<li><button type="button" data-stop-id="${stop.id}" class="${stop.id === selectedStop.id ? "active" : ""}"><span class="stop-no">${twoDigits(stop.routeOrder)}</span><span><strong>${localized(stop.name, state.language)}</strong><small>${localized(stop.role, state.language)} · ${duration}</small></span><small>${status}</small></button></li>`;
  }).join("");
  list.querySelectorAll("[data-stop-id]").forEach((button) => button.addEventListener("click", () => onSelect(button.dataset.stopId)));
  document.querySelector("#route-stop-card").innerHTML = `<span class="stop-number">${twoDigits(selectedStop.routeOrder)}</span><div><small>${copy.selectedStop}</small><strong>${localized(selectedStop.name, state.language)}</strong><small>${localized(selectedStop.role, state.language)}</small></div><button type="button" id="card-open-guide" aria-label="${copy.openGuide}">→</button>`;
}
