import { localized } from "../core/i18n.js";
import { suggestQuestions, answerQuestion } from "../features/source-qa.js";
import { evaluateTask } from "../features/tasks.js";
import { configureAudioPlayer } from "../features/audio-player.js";
import { getSource } from "../data/route-content.js";

const twoDigits = (value) => String(value).padStart(2, "0");

export function renderStopGuide({ stop, nextStop, state, copy, onTaskComplete, onNextStop }) {
  const language = state.language;
  let activeSceneIndex = 0;
  document.querySelector("#guide-order").textContent = twoDigits(stop.routeOrder);
  document.querySelector("#guide-period").textContent = stop.period;
  document.querySelector("#guide-role").textContent = localized(stop.role, language);
  document.querySelector("#guide-title").textContent = localized(stop.name, language);
  const visual = document.querySelector("#guide-visual");
  const image = document.querySelector("#guide-image");
  const credit = document.querySelector("#guide-photo-credit");
  if (stop.visual) {
    image.src = stop.visual.src;
    image.alt = localized(stop.visual.alt, language);
    image.hidden = false;
    credit.href = stop.visual.sourceUrl;
    credit.textContent = `${language === "ru" ? "Фото" : "照片"}: ${stop.visual.credit} · ${stop.visual.license}`;
    credit.hidden = false;
    visual.classList.add("has-photo");
  } else {
    image.removeAttribute("src");
    image.alt = "";
    image.hidden = true;
    credit.hidden = true;
    visual.classList.remove("has-photo");
  }

  const sceneTabs = document.querySelector("#scene-tabs");
  sceneTabs.innerHTML = stop.scenes.map((_scene, index) => `<button type="button" data-scene="${index}" aria-label="${index + 1}">${twoDigits(index + 1)}</button>`).join("");
  const updateScene = (index) => {
    activeSceneIndex = index;
    const scene = stop.scenes[index];
    sceneTabs.querySelectorAll("button").forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === index));
    document.querySelector("#scene-kicker").textContent = `${language === "ru" ? "ГЛАВА" : "章节"} ${twoDigits(index + 1)}`;
    document.querySelector("#scene-title").textContent = localized(scene.title, language);
    document.querySelector("#scene-body").textContent = localized(scene.body, language);
    document.querySelector("#scene-source").textContent = `${copy.source}: ${scene.sourceIds.map((id) => localized(getSource(id)?.title, language)).filter(Boolean).join("；")}`;
  };
  sceneTabs.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => updateScene(Number(button.dataset.scene))));
  updateScene(activeSceneIndex);

  const transcriptText = stop.scenes.map((scene) => localized(scene.body, "ru")).join("\n\n");
  document.querySelector("#audio-transcript").textContent = transcriptText;
  configureAudioPlayer(document.querySelector("#guide-audio"), document.querySelector("#audio-status"), { src: stop.audio.src, readyText: copy.audioReady, errorText: copy.audioError });

  document.querySelector("#task-question").textContent = localized(stop.task.question, language);
  const options = document.querySelector("#task-options");
  const feedback = document.querySelector("#task-feedback");
  options.innerHTML = stop.task.options.map((option, index) => `<button type="button" data-answer-index="${index}"><b>${String.fromCharCode(65 + index)}</b>　${localized(option, language)}</button>`).join("");
  options.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    const result = evaluateTask(stop.task, button.dataset.answerIndex);
    options.querySelectorAll("button").forEach((item) => item.classList.remove("correct", "wrong"));
    button.classList.add(result.correct ? "correct" : "wrong");
    feedback.textContent = `${result.correct ? copy.correct : copy.wrong}${language === "ru" ? ". " : "。"}${localized(result.explanation, language)}`;
    if (result.correct) onTaskComplete(stop.task.id);
  }));

  const suggestions = document.querySelector("#suggested-questions");
  suggestions.innerHTML = suggestQuestions(stop.id).map((question) => `<button type="button" data-question-id="${question.id}">${localized(question.q, language)}</button>`).join("");
  const answer = document.querySelector("#qa-answer");
  answer.replaceChildren();
  suggestions.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
    const result = answerQuestion(button.dataset.questionId, language);
    const linkLabel = language === "ru" ? "ссылка" : "链接";
    answer.innerHTML = `<p>${result.answer}</p>${result.sources.map((source) => `<cite>${copy.source}: ${source.title}${source.detail?.startsWith("http") ? ` · <a href="${source.detail}" target="_blank" rel="noreferrer">${linkLabel}</a>` : ""}</cite>`).join("")}`;
  }));

  const completeButton = document.querySelector("#complete-stop-button");
  completeButton.disabled = false;
  completeButton.textContent = nextStop
    ? (language === "ru" ? `Следующая остановка: ${localized(nextStop.name, language)} →` : `下一站：${localized(nextStop.name, language)} →`)
    : copy.finishMap;
  completeButton.onclick = () => onNextStop(stop.id);
}
