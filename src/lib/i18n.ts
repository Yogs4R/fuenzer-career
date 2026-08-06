/**
 * Lightweight i18n system — no external library required.
 *
 * Usage:
 *   import { useTranslation } from "../lib/i18n";
 *
 *   function MyComponent() {
 *     const { t, language } = useTranslation();
 *     return <p>{t("dashboard.hero.heading")}</p>;
 *   }
 *
 * Interpolation:
 *   t("key", { role: "Frontend Developer" }) → replaces "{role}" in the string.
 *
 * Fallback:
 *   Missing keys always fall back to the English (en) dictionary.
 */

import { useInterviewSession, type Language } from "./InterviewSession";
import en from "./i18n/en";
import id from "./i18n/id";
import ja from "./i18n/ja";
import zh from "./i18n/zh";
import de from "./i18n/de";
import fr from "./i18n/fr";

/** All loaded dictionaries, keyed by language code. */
const dictionaries: Record<Language, Record<string, string>> = {
  en,
  id,
  ja,
  zh,
  de,
  fr,
};

/**
 * Simple string interpolation: replaces `{key}` placeholders with values
 * from `params`. Example:
 *
 *   interpolate("Hello {name}", { name: "World" }) → "Hello World"
 */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const val = params[key];
    return val !== undefined ? String(val) : `{${key}}`;
  });
}

/**
 * Hook: returns a translation function and the current language code.
 *
 * The translation function `t(key, params?)` looks up the key in the
 * active language dictionary. If the key is missing, it falls back to
 * the English (en) dictionary. If still missing, it returns the key
 * itself so bugs are visible.
 *
 * Interpolation params example:
 *   t("interview.topBar.questionCount", { current: 1, total: 5 })
 *   → "Question 1 of 5"
 */
export function useTranslation(): {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: Language;
} {
  const { session } = useInterviewSession();
  const language: Language = session.language ?? "en";

  const t = (key: string, params?: Record<string, string | number>): string => {
    /* 1. Try active language */
    const dict = dictionaries[language];
    if (dict && key in dict) {
      return interpolate(dict[key], params);
    }

    /* 2. Fallback to English */
    if (key in en) {
      return interpolate(en[key], params);
    }

    /* 3. Visible fallback — helps catch missing keys during development */
    return `[[${key}]]`;
  };

  return { t, language };
}

/**
 * Get a raw translation dictionary for a given language.
 * Useful when you need the whole dictionary (e.g., for Terms/Privacy pages).
 */
export function getDictionary(lang: Language): Record<string, string> {
  return dictionaries[lang] ?? en;
}

export { en, id, ja, zh, de, fr };
export type { Language };
