import { coordinateKey, convertWgs84Positions } from "./coordinates.js";

const markerStyle = (active) => ({
  width: active ? "40px" : "34px",
  height: active ? "40px" : "34px",
  padding: "0",
  border: "3px solid #fff",
  borderRadius: "50%",
  backgroundColor: active ? "#173f39" : "#aa452f",
  color: "#fff",
  boxShadow: "0 5px 14px rgba(23,47,43,.28)",
  fontSize: active ? "13px" : "11px",
  fontWeight: "900",
  lineHeight: active ? "34px" : "28px",
  textAlign: "center",
  cursor: "pointer",
});

export function createMapController({ BMap, stops, onStopSelect }) {
  const maps = new Map();
  const markerSets = new Map();
  const userOverlays = new Map();
  let convertedStops = new Map();
  let activeStopId = stops[0].id;

  async function prepare() {
    const cache = await convertWgs84Positions(BMap, stops.map((stop) => stop.positionWgs84));
    convertedStops = new Map(stops.map((stop) => [stop.id, cache.get(coordinateKey(stop.positionWgs84))]));
  }

  function fit(map, compact = false) {
    map.setViewport(Array.from(convertedStops.values()), { margins: compact ? [52, 52, 100, 52] : [72, 72, 120, 72], zoomFactor: -1 });
  }

  function addMarkers(key, map) {
    const set = new Map();
    stops.forEach((stop) => {
      const active = stop.id === activeStopId;
      const size = active ? 40 : 34;
      const label = new BMap.Label(String(stop.routeOrder).padStart(2, "0"), {
        position: convertedStops.get(stop.id),
        offset: new BMap.Size(-size / 2, -size / 2),
      });
      label.setStyle(markerStyle(active));
      label.setTitle(stop.name.ru);
      label.setZIndex(active ? 130 : 110);
      label.addEventListener("click", () => onStopSelect(stop.id));
      map.addOverlay(label);
      set.set(stop.id, label);
    });
    markerSets.set(key, set);
  }

  function mount(key, containerId, { compact = false } = {}) {
    if (maps.has(key)) return maps.get(key);
    const map = new BMap.Map(containerId, { enableMapClick: false, enableRotate: false, enableTilt: false });
    map.centerAndZoom(convertedStops.get(stops[0].id), 13);
    map.enableScrollWheelZoom(true);
    map.addControl(new BMap.NavigationControl({ anchor: window.BMAP_ANCHOR_TOP_RIGHT, type: window.BMAP_NAVIGATION_CONTROL_SMALL }));
    addMarkers(key, map);
    fit(map, compact);
    maps.set(key, map);
    return map;
  }

  function selectStop(stopId, { pan = true } = {}) {
    activeStopId = stopId;
    markerSets.forEach((set) => {
      set.forEach((marker, id) => {
        const active = id === stopId;
        const size = active ? 40 : 34;
        marker.setStyle(markerStyle(active));
        marker.setOffset(new BMap.Size(-size / 2, -size / 2));
        marker.setZIndex(active ? 130 : 110);
      });
    });
    if (pan) maps.forEach((map) => map.panTo(convertedStops.get(stopId)));
  }

  function setUserPosition(point, accuracy) {
    maps.forEach((map, key) => {
      let overlays = userOverlays.get(key);
      if (!overlays) {
        const marker = new BMap.Label("", { position: point, offset: new BMap.Size(-11, -11) });
        marker.setStyle({ width: "22px", height: "22px", padding: "0", border: "4px solid #fff", borderRadius: "50%", backgroundColor: "#187e69", boxShadow: "0 0 0 7px rgba(24,126,105,.22)" });
        marker.setTitle("Моё местоположение");
        marker.setZIndex(200);
        const circle = new BMap.Circle(point, Math.max(accuracy || 0, 8), { strokeColor: "#173f39", strokeOpacity: .55, strokeWeight: 1, fillColor: "#173f39", fillOpacity: .12 });
        map.addOverlay(circle); map.addOverlay(marker);
        overlays = { marker, circle };
        userOverlays.set(key, overlays);
      } else {
        overlays.marker.setPosition(point);
        overlays.circle.setCenter(point);
        overlays.circle.setRadius(Math.max(accuracy || 0, 8));
      }
    });
  }

  function panAllTo(point) { maps.forEach((map) => map.panTo(point)); }
  function resizeAll() { maps.forEach((map, key) => { map.checkResize(); fit(map, key === "home"); }); }

  return { prepare, mount, selectStop, setUserPosition, panAllTo, resizeAll, getMap: (key) => maps.get(key), getPoint: (stopId) => convertedStops.get(stopId) };
}
