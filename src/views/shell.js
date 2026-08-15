import { UI_COPY } from "../data/ui-copy.js";
import { languageTag } from "../core/i18n.js";

export function applyShellCopy(language) {
  const copy = UI_COPY[language];
  document.documentElement.lang = languageTag(language);
  document.body.classList.toggle("language-zh", language === "zh");
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = copy[element.dataset.copy];
    if (value) element.textContent = value;
  });
  document.querySelector("#home-title").innerHTML = copy.homeTitle;
  document.querySelector("#brand-name").textContent = language === "ru" ? "Эхо Севера" : "北境回响";
  const languageSwitch = document.querySelector("#language-switch");
  languageSwitch.textContent = language === "ru" ? "中文" : "RU";
  languageSwitch.setAttribute("aria-label", language === "ru" ? "切换中文" : "Переключить на русский");
  document.querySelector(".brand").setAttribute("aria-label", language === "ru" ? "Эхо Севера — на главную" : "北境回响——返回首页");
  document.querySelector(".main-nav").setAttribute("aria-label", language === "ru" ? "Основная навигация" : "主要导航");
  document.querySelector("#skip-link").textContent = language === "ru" ? "Перейти к содержанию" : "跳到主要内容";
}

export function showView(viewName) {
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    const active = panel.dataset.viewPanel === viewName;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === viewName || (viewName === "guide" && link.dataset.view === "route")));
  document.querySelector("#source-entry")?.classList.toggle("active", viewName === "archive");
}
