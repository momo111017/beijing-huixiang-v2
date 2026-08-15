export function completeTask(state, taskId) {
  return { ...state, completedTaskIds: [...new Set([...(state.completedTaskIds || []), taskId])] };
}

export function completeStop(state, stopId) {
  return { ...state, lastStopId: stopId, completedStopIds: [...new Set([...(state.completedStopIds || []), stopId])] };
}

export function nextStopId(stops, currentStopId) {
  const ordered = [...stops].sort((a, b) => a.routeOrder - b.routeOrder);
  const index = ordered.findIndex((stop) => stop.id === currentStopId);
  return index >= 0 && index < ordered.length - 1 ? ordered[index + 1].id : null;
}

export function guideNextDestination(stops, currentStopId) {
  return {
    view: "route",
    stopId: nextStopId(stops, currentStopId) || currentStopId,
  };
}

export const progressCount = (state) => new Set(state.completedStopIds || []).size;
