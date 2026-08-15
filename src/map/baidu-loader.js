let mapPromise = null;

export function loadBaiduMap(ak, timeoutMs = 12000) {
  if (globalThis.BMap) return Promise.resolve(globalThis.BMap);
  if (!ak) return Promise.reject(new Error("Baidu AK is missing"));
  if (mapPromise) return mapPromise;

  mapPromise = new Promise((resolve, reject) => {
    const callbackName = `initNorthEchoV2_${Date.now()}`;
    const script = document.createElement("script");
    const timer = window.setTimeout(() => {
      delete window[callbackName];
      mapPromise = null;
      reject(new Error("Baidu JSAPI timeout"));
    }, timeoutMs);
    window[callbackName] = () => {
      window.clearTimeout(timer);
      delete window[callbackName];
      if (window.BMap) resolve(window.BMap);
      else reject(new Error("Baidu JSAPI unavailable"));
    };
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${encodeURIComponent(ak)}&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timer);
      delete window[callbackName];
      mapPromise = null;
      reject(new Error("Baidu JSAPI network error"));
    };
    document.head.append(script);
  });
  return mapPromise;
}

export function resetBaiduLoaderForRetry() {
  mapPromise = null;
}
