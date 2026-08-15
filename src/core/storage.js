export const STORAGE_KEY = "north-echo:v2:journey";

export function createInitialState() {
  return { version: 2, language: "ru", view: "home", lastStopId: "harbin-station", completedStopIds: [], completedTaskIds: [], bookmarkedSourceIds: [] };
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 2) return createInitialState();
    const base = createInitialState();
    return {
      ...base,
      language: parsed.language === "zh" ? "zh" : "ru",
      lastStopId: typeof parsed.lastStopId === "string" ? parsed.lastStopId : base.lastStopId,
      completedStopIds: Array.isArray(parsed.completedStopIds) ? parsed.completedStopIds : [],
      completedTaskIds: Array.isArray(parsed.completedTaskIds) ? parsed.completedTaskIds : [],
      bookmarkedSourceIds: Array.isArray(parsed.bookmarkedSourceIds) ? parsed.bookmarkedSourceIds : [],
    };
  } catch {
    return createInitialState();
  }
}

export function saveState(storage, state) {
  const safe = {
    version: 2,
    language: state.language === "zh" ? "zh" : "ru",
    lastStopId: state.lastStopId,
    completedStopIds: [...new Set(state.completedStopIds || [])],
    completedTaskIds: [...new Set(state.completedTaskIds || [])],
    bookmarkedSourceIds: [...new Set(state.bookmarkedSourceIds || [])],
  };
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(safe)); return true; } catch { return false; }
}
