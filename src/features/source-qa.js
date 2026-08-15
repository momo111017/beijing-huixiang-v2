import { QUESTIONS, getQuestion, getSource } from "../data/route-content.js";
import { localized } from "../core/i18n.js";

export const suggestQuestions = (stopId) => QUESTIONS.filter((question) => question.stopId === stopId);

export function answerQuestion(questionId, language) {
  const question = getQuestion(questionId);
  if (!question) return { found: false, answer: language === "ru" ? "В текущей базе нет ответа" : "当前资料库暂未收录", sources: [] };
  return {
    found: true,
    answer: localized(question.a, language),
    sources: question.sourceIds.map(getSource).filter(Boolean).map((source) => ({ title: localized(source.title, language), detail: localized(source.detail, language) })),
  };
}

export function answerFromReviewedSources(input, language) {
  const normalized = String(input || "").trim().toLowerCase();
  const question = QUESTIONS.find((item) => localized(item.q, language).toLowerCase() === normalized);
  return question ? answerQuestion(question.id, language) : { found: false, answer: language === "ru" ? "В текущей базе нет ответа" : "当前资料库暂未收录", sources: [] };
}
