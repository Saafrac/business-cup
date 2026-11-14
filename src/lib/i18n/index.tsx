"use client";

import { Fragment, useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { DICT, LIT, type MessageKey } from "@/lib/i18n/dict";
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  INTL_LOCALE,
  LOCALES,
  LOCALE_LABEL,
  LOCALE_NAME,
  format,
  isLocale,
  plural,
  type Locale,
  type Params,
} from "@/lib/i18n/core";
import type { Occasion } from "@/lib/party";

const KEY = "cg-lang";
const listeners = new Set<() => void>();
let fallback: Locale | null = null; // если localStorage закрыт, язык живёт до перезагрузки

function read(): Locale {
  try {
    const v = window.localStorage.getItem(KEY);
    if (isLocale(v)) return v;
  } catch {
    // хранилище недоступно
  }
  return fallback ?? DEFAULT_LOCALE;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function setLocale(next: Locale) {
  fallback = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // см. fallback
  }
  listeners.forEach((l) => l());
}

export type TFn = (key: MessageKey, params?: Params) => string;

const pad = (n: number) => String(n).padStart(2, "0");

function ymd(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? { y, m, d } : null;
}

/** Язык, перевод, склонение и форматирование дат/времени/названий событий под текущий язык */
export function useI18n() {
  const locale = useSyncExternalStore(subscribe, read, () => DEFAULT_LOCALE);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  const t = useCallback<TFn>(
    (key, params) => format(DICT[locale][key] ?? DICT.en[key] ?? key, params),
    [locale],
  );

  return useMemo(() => {
    const intl = INTL_LOCALE[locale];
    const weekday = (iso: string, style: "long" | "short") => {
      const p = ymd(iso);
      if (!p) return "";
      return new Intl.DateTimeFormat(intl, { weekday: style, timeZone: "UTC" }).format(new Date(Date.UTC(p.y, p.m - 1, p.d)));
    };
    /** «Riverside Park» из демо → перевод; остальное как есть */
    const lit = (s: string) => LIT[locale][s] ?? s;
    const giftShort = (gift: string) => {
      const g = gift.toLowerCase();
      if (g.includes("bike")) return t("gift.bike");
      if (g.includes("telescope")) return t("gift.telescope");
      if (g.includes("art set")) return t("gift.artSet");
      return t("gift.other");
    };
    const title = (p: { occasion: Occasion; honoree: string; age: number | null }) => {
      const h = p.honoree;
      switch (p.occasion) {
        case "Birthday":
          return p.age ? t("title.birthdayAge", { h, age: p.age }) : t("title.birthday", { h });
        case "Wedding":
          return t("title.wedding", { h });
        case "Baby shower":
          return t("title.babyShower", { h });
        case "Farewell":
          return t("title.farewell", { h });
        default:
          return t("title.other", { h });
      }
    };
    return {
      locale,
      t,
      pl: (n: number, forms: [string, string, string?]) => plural(locale, n, forms),
      lit,
      giftShort,
      title,
      /** Заголовок обложки приглашения: «You’re invited to Emma’s 7th birthday!» */
      inviteTitle: (p: { occasion: Occasion; honoree: string; age: number | null }) => {
        const h = p.honoree;
        switch (p.occasion) {
          case "Birthday":
            return p.age ? t("inv.t.birthdayAge", { h, age: p.age }) : t("inv.t.birthday", { h });
          case "Wedding":
            return t("inv.t.wedding", { h });
          case "Baby shower":
            return t("inv.t.babyShower", { h });
          case "Farewell":
            return t("inv.t.farewell", { h });
          default:
            return t("inv.t.other", { h });
        }
      },
      invite: (p: { occasion: Occasion; honoree: string; age: number | null }) =>
        p.occasion === "Birthday" && p.age ? t("title.invite", { h: p.honoree, age: p.age }) : title(p),
      occasion: (o: Occasion) => t(`oc.${o}` as MessageKey),
      dayLong: (iso: string) => weekday(iso, "long"),
      dayShort: (iso: string) => weekday(iso, "short"),
      /** 12/05 (США) или 05.12 */
      md: (iso: string) => {
        const p = ymd(iso);
        if (!p) return "—";
        return locale === "en" ? `${pad(p.m)}/${pad(p.d)}` : `${pad(p.d)}.${pad(p.m)}`;
      },
      mdy: (iso: string) => {
        const p = ymd(iso);
        if (!p) return "—";
        return locale === "en" ? `${pad(p.m)}/${pad(p.d)}/${p.y}` : `${pad(p.d)}.${pad(p.m)}.${p.y}`;
      },
      /** «14:00» → «2:00 PM» (en) или «14:00» */
      time: (hhmm: string) => {
        const [h, m] = hhmm.split(":").map(Number);
        if (Number.isNaN(h)) return "";
        if (locale !== "en") return `${pad(h)}:${pad(m || 0)}`;
        return `${((h + 11) % 12) + 1}:${pad(m || 0)} ${h >= 12 ? "PM" : "AM"}`;
      },
      /** Время фото: часовой пояс события, а не зрителя */
      photoTime: (iso: string) =>
        new Date(iso).toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }),
      /** Серверная ошибка (по-английски) → текст на текущем языке; неизвестное показываем как есть */
      err: (text: string) => {
        const key = ERROR_KEYS[text];
        if (key) return t(key);
        const range = /^Chip in from \$(\d+) to \$(\d+)$/.exec(text);
        if (range) return t("err.range", { min: range[1], max: range[2] });
        return text;
      },
      /** Сообщение с вставками-элементами: rich("al.count", { count: <b/>, guests: <b/> }) */
      rich: (key: MessageKey, parts: Record<string, ReactNode>, params?: Params): ReactNode => {
        const raw = format(DICT[locale][key] ?? DICT.en[key] ?? key, { ...params, ...Object.fromEntries(Object.keys(parts).map((k) => [k, `{${k}}`])) });
        return raw.split(/(\{\w+\})/).map((chunk, i) => {
          const m = /^\{(\w+)\}$/.exec(chunk);
          return <Fragment key={i}>{m && m[1] in parts ? parts[m[1]] : chunk}</Fragment>;
        });
      },
    };
  }, [locale, t]);
}

const ERROR_KEYS: Record<string, MessageKey> = {
  "Bad request": "err.bad",
  "Something went wrong, try again": "err.bad",
  "No connection, try again": "err.net",
  "Type your name": "err.name",
  "Type your name first": "g.errName",
  "Pick how you paid": "err.method",
  "Nothing to save": "err.nothing",
  "Too many tries, wait a minute": "err.tooMany",
  "Too many uploads, wait a minute": "err.tooMany",
  "The demo is full, ask the team to reset it": "err.full",
  "We’re full for the demo, try later": "err.full",
  "Pick the occasion": "err.occasion",
  "Type a first name for who it’s for": "w.errName",
  "Name the gift": "err.gift",
  "Set a goal from $5 to $10,000": "err.goal",
  "Pick the date": "err.date",
  "Pick when to collect money until": "err.until",
  "Pick the time": "err.timeP",
  "Add the place": "err.placeP",
  "Guests: from 1 to 200": "err.guests",
  "Only JPEG, PNG or WebP photos": "err.format",
  "This photo is too big": "err.big",
  "The album is full": "err.albumFull",
  "Upload failed": "err.upload",
  "The connection dropped": "err.dropped",
  "Paste a link": "err.paste",
  "That doesn’t look like a link": "err.notLink",
  "Use a Google Photos, Google Drive, Dropbox, iCloud, OneDrive, Flickr or Yandex Disk link": "err.host",
  "This file isn’t a photo we can read": "up.notPhoto",
  "Pick a design": "de.errDesign",
  "Not found": "de.errNotFound",
};

export function useT() {
  return useI18n().t;
}

/** Переключатель RU / ҚАЗ / EN. Цвет наследуется от контейнера, активный язык — подложка. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  return (
    <div role="group" aria-label={t("lang.label")} className={`inline-flex items-center gap-3xs ${className}`}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={HTML_LANG[l]}
          title={LOCALE_NAME[l]}
          aria-pressed={l === locale}
          onClick={() => setLocale(l)}
          className={`flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-pill border-0 px-xs text-xs font-extrabold ${
            l === locale ? "bg-ink text-paper" : "bg-transparent text-inherit opacity-80 hover:opacity-100"
          }`}
        >
          {LOCALE_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
