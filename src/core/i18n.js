export const localized = (value, language) => value && typeof value === "object" && !Array.isArray(value) ? (value[language] ?? value.ru ?? value.zh ?? "") : (value ?? "");
export const otherLanguage = (language) => language === "ru" ? "zh" : "ru";
export const languageTag = (language) => language === "ru" ? "ru" : "zh-CN";
