export function createLocationController({ geolocation, convertPoint, onUpdate, onStatus }) {
  let watchId = null;
  let tracking = false;
  let sequence = 0;
  let following = true;
  let lastPoint = null;

  async function handlePosition(position) {
    const current = ++sequence;
    try {
      const point = await convertPoint([position.coords.longitude, position.coords.latitude]);
      if (!tracking || current !== sequence) return;
      lastPoint = point;
      onUpdate({ point, accuracy: position.coords.accuracy, following });
      onStatus({ kind: "success", code: position.coords.accuracy > 100 ? "approximate" : "tracking", accuracy: Math.round(position.coords.accuracy || 0) });
    } catch (error) {
      if (current === sequence) onStatus({ kind: "error", code: "conversion", message: error.message });
    }
  }

  function handleError(error) {
    const codes = { 1: "permission-denied", 2: "unavailable", 3: "timeout" };
    onStatus({ kind: "error", code: codes[error.code] || "unknown" });
    if (error.code === 1) stop("permission-denied", false);
  }

  function start() {
    if (!geolocation) { onStatus({ kind: "error", code: "unsupported" }); return null; }
    stop("restart", false);
    tracking = true;
    onStatus({ kind: "loading", code: "waiting" });
    watchId = geolocation.watchPosition(handlePosition, handleError, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
    return watchId;
  }

  function stop(reason = "stopped", notify = true) {
    if (watchId !== null && geolocation) geolocation.clearWatch(watchId);
    watchId = null;
    tracking = false;
    sequence += 1;
    if (notify) onStatus({ kind: "info", code: reason });
  }

  function setFollowing(value) { following = Boolean(value); if (following && lastPoint) onUpdate({ point: lastPoint, accuracy: null, following: true }); }
  return { start, stop, setFollowing, isTracking: () => tracking, isFollowing: () => following };
}
