import { ROUTE, getStop } from "./data/route-content.js";
import { UI_COPY } from "./data/ui-copy.js";
import { loadState, saveState } from "./core/storage.js";
import { localized, otherLanguage } from "./core/i18n.js";
import { completeTask, completeStop, guideNextDestination, nextStopId, progressCount } from "./core/progress.js";
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
let lastMapError = null;

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

function mapErrorDetail(error = lastMapError) {
  const details = state.language === "ru"
    ? {
      "missing-ak": "Не найден ключ карты. Проверьте config.js; пять точек маршрута доступны в списке.",
      network: "Не удалось связаться с Baidu JSAPI. Проверьте сеть и Referer; пять точек маршрута доступны в списке.",
      timeout: "Baidu JSAPI не ответил вовремя. Повторите загрузку; пять точек маршрута доступны в списке.",
      unavailable: "Baidu JSAPI не вернул объект карты. Проверьте AK и Referer; пять точек маршрута доступны в списке.",
    }
    : {
      "missing-ak": "未找到地图 AK，请检查 config.js；五个点位仍可从列表进入。",
      network: "百度地图脚本网络加载失败，请检查网络和 Referer 白名单；五个点位仍可从列表进入。",
      timeout: "百度地图脚本响应超时，请重试；五个点位仍可从列表进入。",
      unavailable: "百度地图 API 未返回可用对象，请检查 AK 和 Referer 白名单；五个点位仍可从列表进入。",
    };
  return details[error?.code] || (state.language === "ru"
    ? "Проверьте сеть, AK и Referer. Пять точек маршрута доступны в списке."
    : "请检查网络、AK 和 Referer 白名单，五个点位仍可从列表进入。");
}

function refreshMapStateCopy() {
  if (mapStatusKind === "success") {
    setMapState("success", copy().mapReady, state.language === "ru" ? "Карта использует реальные координаты пяти точек маршрута." : "首页与路线页共用五个真实点位。");
    return;
  }
  if (mapStatusKind === "error") {
    setMapState("error", copy().mapError, mapErrorDetail());
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
  if ((viewName === "home" || viewName === "route") && mapReady) {
    if (viewName === "route") mapController.mount("route", "route-map");
    window.setTimeout(() => mapController.resize(viewName), 100);
  }
  if (viewName === "guide") renderGuide();
  if (viewName === "archive") renderArchive({ language: state.language, stops: ROUTE.stops });
  window.scrollTo({ top: 0, behavior: "instant" });
}

function openGuide() { navigate("guide"); }

function renderGuide() {
  const followingStopId = nextStopId(ROUTE.stops, selectedStop().id);
  renderStopGuide({
    stop: selectedStop(), nextStop: followingStopId ? getStop(followingStopId) : null, state, copy: copy(),
    onTaskComplete: (taskId) => { state = completeTask(state, taskId); persist(); },
    onNextStop: (stopId) => {
      state = completeStop(state, stopId);
      persist();
      const destination = guideNextDestination(ROUTE.stops, stopId);
      selectStop(destination.stopId);
      navigate(destination.view);
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
  lastMapError = null;
  try {
    const BMap = await loadBaiduMap(appConfig.baiduAk);
    mapController = createMapController({ BMap, stops: ROUTE.stops, onStopSelect: selectStop });
    await mapController.prepare();
    mapController.mount("home", "home-map", { compact: true });
    mapController.selectStop(selectedStopId, { pan: false });
    mapReady = true;
    lastMapError = null;
    createLocation(BMap);
    setMapState("success", copy().mapReady, state.language === "ru" ? "Карта использует реальные координаты пяти точек маршрута." : "首页与路线页共用五个真实点位。" );
  } catch (error) {
    console.error(error);
    mapReady = false;
    lastMapError = error;
    setMapState("error", copy().mapError, mapErrorDetail(error));
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
