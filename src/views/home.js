import { localized } from "../core/i18n.js";

const twoDigits = (value) => String(value).padStart(2, "0");

export function renderHome({ state, stops, selectedStop, copy }) {
  const count = new Set(state.completedStopIds).size;
  document.querySelector("#home-progress").textContent = `${count} / ${stops.length}`;
  const primary = document.querySelector("#home-primary-action");
  primary.innerHTML = `${count ? copy.continue : copy.start} <span>→</span>`;
  const card = document.querySelector("#home-map-card");
  card.innerHTML = `<span class="stop-number">${twoDigits(selectedStop.routeOrder)}</span><div><strong>${localized(selectedStop.name, state.language)}</strong><small>${localized(selectedStop.role, state.language)}</small></div><button type="button" data-view="route" aria-label="${copy.enter}">→</button>`;
}
