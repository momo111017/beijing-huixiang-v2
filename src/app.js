import { ROUTE, getStop } from "./data/route-content.js";
import { UI_COPY } from "./data/ui-copy.js";
import { loadState, saveState } from "./core/storage.js";
import { localized, otherLanguage } from "./core/i18n.js";
import { completeTask, completeStop, nextStopId, progressCount } from "./core/progress.js";
import { loadBaiduMap, resetBaiduLoaderForRetry } from "./map/baidu-loader.js";
import { convertWgs84Point } from "./map/coordinates.js";
import { createMapController } from "./map/map-controller.js";
import { createLocationController } from "./map/location-controller.js";
import { applyShellCopy, showView } from "./views/shell.js";
import { renderHome } from "./views/home.js";
import { renderRouteWorkspace } from "./views/route-workspace.js";
import { renderStopGuide } from "./views/stop-guide.js";
import { renderArchive } from "./views/archive.js";

const appConfig = window.NORTH_ECHO_CONFIG || {};
let state = { ...loadState(localStorage), view: "home" };
if (!ROUTE.stops.some((stop) => stop.id === state.lastStopId)) state.lastStopId = ROUTE.stops[0].id;
let selectedStopId = state.lastStopId;
let mapController = null;
let locationController = null;
let mapReady = false;
let mapStatusKind = "loading";

const copy = () => UI_COPY[state.language];
const selectedStop = () => getStop(selectedStopId);

function persist() { saveState(localStorage, state); }

function setMapState(kind, title, detail) {
  mapStatusKind = kind || "loading";
  for (const id of ["home-map-state", "route-map-state"]) {
    const panel = document.querySelector(`#${id}`);
    panel.className = `map-loading ${kind}`.trim();
    panel.querySelector("strong").textContent = title;
    panel.querySelector("span").textContent = detail;
  }
  const retryHidden = kind !== "error";
  document.querySelector("#home-map-retry").hidden = retryHidden;
  document.querySelector("#route-map-retry").hidden = retryHidden;
}

function refreshMapStateCopy() {
  if (mapStatusKind === "success") {
    setMapState("success", copy().mapReady, state.language === "ru" ? "Карта использует реальные координаты пяти объектов." : "首页与路线页共用五个真实点位。");
    return;
  }
  if (mapStatusKind === "error") {
    setMapState("error", copy().mapError, state.language === "ru" ? "Проверьте сеть, AK и Referer. Пять объектов доступны в списке." : "请检查网络、AK 和 Referer 白名单，五个点位仍可从列表进入。");
    return;
  }
  setMapState("", copy().mapLoading, copy().mapLoadingDetail);
}

function render() {
  applyShellCopy(state.language);
  renderHome({ state, stops: ROUTE.stops, selectedStop: selectedStop(), copy: copy() });
  renderRouteWorkspace({ state, stops: ROUTE.stops, selectedStop: selectedStop(), copy: copy(), onSelect: selectStop });
  document.querySelector("#card-open-guide")?.addEventListener("click", openGuide);
  renderArchive({ language: state.language, stops: ROUTE.stops });
  if (state.view === "guide") renderGuide();
  updateLocationButtons();
}

function selectStop(stopId) {
  selectedStopId = stopId;
  state.lastStopId = stopId;
  persist();
  mapController?.selectStop(stopId);
  renderHome({ state, stops: ROUTE.stops, selectedStop: selectedStop(), copy: copy() });
  renderRouteWorkspace({ state, stops: ROUTE.stops, selectedStop: selectedStop(), copy: copy(), onSelect: selectStop });
  document.querySelector("#card-open-guide")?.addEventListener("click", openGuide);
}

function navigate(viewName) {
  if (!['home', 'route', 'guide', 'archive'].includes(viewName)) return;
  if (state.view === "route" && viewName !== "route") locationController?.stop("view-left", false);
  state.view = viewName;
  showView(viewName);
  if (viewName === "route" && mapReady) {
    mapController.mount("route", "route-map");
    window.setTimeout(() => mapController.resizeAll(), 100);
  }
  if (viewName === "guide") renderGuide();
  if (viewName === "archive") renderArchive({ language: state.language, stops: ROUTE.stops });
  window.scrollTo({ top: 0, behavior: "instant" });
}

function openGuide() { navigate("guide"); }

function renderGuide() {
  renderStopGuide({
    stop: selectedStop(), state, copy: copy(),
    onTaskComplete: (taskId) => { state = completeTask(state, taskId); persist(); },
    onStopComplete: (stopId) => {
      state = completeStop(state, stopId);
      persist();
      const nextId = nextStopId(ROUTE.stops, stopId);
      if (nextId) { selectStop(nextId); navigate("route"); }
      else { render(); navigate("archive"); }
    },
  });
}

function toggleLanguage() {
  state.language = otherLanguage(state.language);
  persist();
  render();
  refreshMapStateCopy();
  if (state.view === "guide") renderGuide();
}

function setLocationStatus(kind, message) {
  const panel = document.querySelector("#location-status");
  panel.hidden = false;
  panel.className = `location-status ${kind === "error" ? "error" : ""}`;
  panel.textContent = message;
}

function updateLocationButtons() {
  const locate = document.querySelector("#locate-button");
  const follow = document.querySelector("#follow-button");
  const tracking = locationController?.isTracking() || false;
  const following = locationController?.isFollowing() ?? true;
  locate.setAttribute("aria-pressed", String(tracking));
  locate.textContent = tracking ? copy().stopLocation : copy().locate;
  follow.setAttribute("aria-pressed", String(following));
  follow.textContent = following ? copy().follow : copy().browse;
}

function createLocation(BMap) {
  locationController = createLocationController({
    geolocation: navigator.geolocation,
    convertPoint: (point) => convertWgs84Point(BMap, point),
    onUpdate: ({ point, accuracy, following }) => {
      mapController.setUserPosition(point, accuracy);
      if (following) mapController.panAllTo(point);
    },
    onStatus: ({ kind, code, accuracy }) => {
      const messages = state.language === "ru" ? {
        waiting: "Ожидаем разрешение браузера…", tracking: `Местоположение обновляется · точность около ${accuracy} м`, approximate: `Местоположение приблизительное · около ${accuracy} м`, "permission-denied": "Доступ к геолокации запрещён. Карта и объекты остаются доступными.", unavailable: "Местоположение сейчас недоступно.", timeout: "Время ожидания геолокации истекло.", conversion: "Не удалось преобразовать координаты для карты.", unsupported: "Браузер не поддерживает геолокацию.", stopped: "Отслеживание остановлено.",
      } : {
        waiting: "正在等待浏览器授权……", tracking: `位置正在更新，精度约 ${accuracy} 米`, approximate: `当前位置仅供参考，精度约 ${accuracy} 米`, "permission-denied": "定位权限被拒绝，地图与点位仍可正常使用。", unavailable: "当前位置暂时不可用。", timeout: "定位请求超时。", conversion: "定位坐标暂时无法转换到百度地图。", unsupported: "浏览器不支持定位。", stopped: "位置追踪已停止。",
      };
      setLocationStatus(kind, messages[code] || messages.stopped);
      updateLocationButtons();
    },
  });
}

async function initMap() {
  setMapState("", copy().mapLoading, copy().mapLoadingDetail);
  try {
    const BMap = await loadBaiduMap(appConfig.baiduAk);
    mapController = createMapController({ BMap, stops: ROUTE.stops, onStopSelect: selectStop });
    await mapController.prepare();
    mapController.mount("home", "home-map", { compact: true });
    mapController.selectStop(selectedStopId, { pan: false });
    mapReady = true;
    createLocation(BMap);
    setMapState("success", copy().mapReady, state.language === "ru" ? "Карта использует реальные координаты пяти объектов." : "首页与路线页共用五个真实点位。" );
  } catch (error) {
    console.error(error);
    mapReady = false;
    setMapState("error", copy().mapError, state.language === "ru" ? "Проверьте сеть, AK и Referer. Пять объектов доступны в списке." : "请检查网络、AK 和 Referer 白名单，五个点位仍可从列表进入。" );
  }
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-view]");
    if (target) navigate(target.dataset.view);
  });
  document.querySelector("#language-switch").addEventListener("click", toggleLanguage);
  document.querySelector("#open-guide-button").addEventListener("click", openGuide);
  document.querySelectorAll("#home-map-retry,#route-map-retry").forEach((button) => button.addEventListener("click", () => { resetBaiduLoaderForRetry(); initMap(); }));
  document.querySelector("#locate-button").addEventListener("click", () => {
    if (!mapReady) return setLocationStatus("error", copy().mapError);
    if (locationController?.isTracking()) { locationController.stop("stopped"); return; }
    const localhost = ["localhost", "127.0.0.1"].includes(location.hostname);
    if (!window.isSecureContext && !localhost) return setLocationStatus("error", state.language === "ru" ? "Для геолокации нужен HTTPS." : "定位需要 HTTPS 或 localhost。 ");
    const dialog = document.querySelector("#location-dialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
  });
  document.querySelector("#allow-location").addEventListener("click", () => window.setTimeout(() => locationController?.start(), 0));
  document.querySelector("#follow-button").addEventListener("click", () => { locationController?.setFollowing(!locationController.isFollowing()); updateLocationButtons(); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") locationController?.stop("stopped", false); });
  window.addEventListener("pagehide", () => locationController?.stop("stopped", false));
}

window.addEventListener("DOMContentLoaded", () => {
  applyShellCopy(state.language);
  showView(state.view);
  render();
  bindEvents();
  initMap();
});
