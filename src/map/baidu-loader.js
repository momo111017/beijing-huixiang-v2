let mapPromise = null;

export function createMapLoadError(code, cause) {
  const messages = {
    "missing-ak": "Baidu AK is missing",
    network: "Baidu JSAPI network error",
    timeout: "Baidu JSAPI timeout",
    unavailable: "Baidu JSAPI unavailable",
  };
  const error = new Error(messages[code] || "Baidu JSAPI error");
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

export function isRetryableMapError(error) {
  return ["network", "timeout", "unavailable"].includes(error?.code);
}

export function loadBaiduMap(ak, timeoutMs = 12000) {
  if (globalThis.BMap) return Promise.resolve(globalThis.BMap);
  if (!ak) return Promise.reject(createMapLoadError("missing-ak"));
  if (mapPromise) return mapPromise;

  mapPromise = new Promise((resolve, reject) => {
    const callbackName = `initNorthEchoV3_${Date.now()}`;
    const script = document.createElement("script");
    const timer = window.setTimeout(() => {
      delete window[callbackName];
      mapPromise = null;
      reject(createMapLoadError("timeout"));
    }, timeoutMs);
    window[callbackName] = () => {
      window.clearTimeout(timer);
      delete window[callbackName];
      if (window.BMap) resolve(window.BMap);
      else {
        mapPromise = null;
        reject(createMapLoadError("unavailable"));
      }
    };
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${encodeURIComponent(ak)}&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timer);
      delete window[callbackName];
      mapPromise = null;
      reject(createMapLoadError("network"));
    };
    document.head.append(script);
  });
  return mapPromise;
}

export function resetBaiduLoaderForRetry() {
  mapPromise = null;
}
