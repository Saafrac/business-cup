// Локализация без роутинга: язык хранится в localStorage, по умолчанию русский.
export const LOCALES = ["ru", "kk", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_LABEL: Record<Locale, string> = { ru: "RU", kk: "ҚАЗ", en: "EN" };
export const LOCALE_NAME: Record<Locale, string> = { ru: "Русский", kk: "Қазақша", en: "English" };
export const HTML_LANG: Record<Locale, string> = { ru: "ru", kk: "kk", en: "en" };
/** Локаль для Intl (даты) */
export const INTL_LOCALE: Record<Locale, string> = { ru: "ru-RU", kk: "kk-KZ", en: "en-US" };

export type Params = Record<string, string | number>;
export type Msg = string | ((p: Params) => string);

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

/** Склонение по числу: ru — 3 формы, en — 2; казахский после числа не склоняется (передают одну форму) */
export function plural(locale: Locale, n: number, forms: [string, string, string?]): string {
  const [one, few, many = few] = forms;
  if (locale === "ru") {
    const a = Math.abs(n) % 100;
    const b = a % 10;
    if (b === 1 && a !== 11) return one;
    if (b >= 2 && b <= 4 && (a < 12 || a > 14)) return few;
    return many;
  }
  if (locale === "kk") return one;
  return Math.abs(n) === 1 ? one : many;
}

export function format(msg: Msg, p: Params = {}): string {
  if (typeof msg === "function") return msg(p);
  return msg.replace(/\{(\w+)\}/g, (_, k: string) => (k in p ? String(p[k]) : `{${k}}`));
}

export type Area<K extends string> = { en: Record<K, Msg>; ru: Record<K, Msg>; kk: Record<K, Msg> };
export function area<K extends string>(a: Area<K>) {
  return a;
}
