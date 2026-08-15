export function evaluateTask(task, answerIndex) {
  const chosen = Number(answerIndex);
  return { correct: chosen === task.correctIndex, explanation: task.explanation };
}
