"use client";

import { useState } from "react";
import { Note, PhoneColumn } from "@/components/shell";
import { DREAM, PARTY } from "@/lib/demo";
import { LangSwitch, useI18n } from "@/lib/i18n";

type Pick = 25 | 50 | 100 | "other";
const PICKS: Pick[] = [25, 50, 100, "other"];

type Entry = { text: string; meta: string; bg: string; tilt: number; quoted: boolean };

const BGS = ["var(--color-signal-soft)", "var(--color-paper-3)", "var(--color-mint)"];
const TILTS = [-1.2, 1, -0.6];

export function DreamFundPage() {
  const { t, md } = useI18n();
  const [pick, setPick] = useState<Pick>(50);
  const [other, setOther] = useState("20");
  const [fromRaw, setFrom] = useState<string | null>(null);
  const [wishRaw, setWish] = useState<string | null>(null);
  const [added, setAdded] = useState<Entry[]>([]);
  const [extra, setExtra] = useState(0);

  const from = fromRaw ?? t("df.fromDef");
  const wish = wishRaw ?? t("df.wishDef");
  const balance = DREAM.balance + extra;

  // демо-история собирается на текущем языке; добавленные гостем записи остаются как введены
  const history: Entry[] = [
    { text: t("df.h1text"), meta: t("df.h1meta"), bg: BGS[0], tilt: TILTS[0], quoted: true },
    { text: t("df.h2text"), meta: t("df.h2meta"), bg: BGS[1], tilt: TILTS[1], quoted: false },
    { text: t("df.h3text"), meta: t("df.h3meta"), bg: BGS[2], tilt: TILTS[2], quoted: true },
  ];
  const entries = [...added, ...history];

  const amount = pick === "other" ? Math.max(0, Number(other) || 0) : pick;
  const left = Math.max(0, DREAM.goal - balance);
  const fill = Math.min(100, (balance / DREAM.goal) * 100);
  const gifts = entries.length;

  const add = () => {
    if (amount < 5) return;
    const i = entries.length;
    setExtra((b) => b + amount);
    setAdded((list) => [
      {
        text: wish.trim() || t("df.giftFor", { name: PARTY.honoree }),
        meta: t("df.newMeta", { from: from.trim() || t("df.someone"), n: amount, date: md("2026-12-14") }),
        bg: BGS[i % BGS.length],
        tilt: TILTS[i % TILTS.length],
        quoted: Boolean(wish.trim()),
      },
      ...list,
    ]);
    setWish("");
  };

  return (
    <PhoneColumn>
      <div className="paper torn-bottom on-dark flex flex-col gap-xl bg-night px-md pt-md pb-2xl text-night-ink">
        <div className="flex items-center justify-between gap-xs">
          <span className="font-display text-lg font-semibold tracking-[-0.03em]">chip in</span>
          <span className="flex items-center gap-xs">
            <span className="text-sm font-bold text-night-muted">{t("df.title", { name: PARTY.honoree })}</span>
            <LangSwitch />
          </span>
        </div>
        <h1 className="text-[2.5rem] leading-[1.02]">{t("df.h1", { name: PARTY.honoree })}</h1>
        <div className="flex items-end gap-lg">
          <div
            role="img"
            aria-label={t("df.jar", { n: balance, goal: DREAM.goal })}
            className="relative h-[196px] w-28 shrink-0 overflow-hidden rounded-[24px_24px_30px_30px] border-[3px] border-night-ink"
          >
            <div
              className="paper absolute inset-x-0 bottom-0 bg-signal transition-[height] duration-(--dur-long) ease-(--ease-out)"
              style={{ height: `${fill}%` }}
            />
            <span className="figure absolute inset-x-0 bottom-sm text-center text-xl text-signal-ink">${balance}</span>
          </div>
          <div className="flex flex-col gap-xs pb-xs">
            <span className="num font-display text-3xl leading-none font-semibold tracking-[-0.03em]">
              {left > 0 ? t("df.toGo", { n: left }) : t("df.reached")}
            </span>
            <p className="text-sm text-night-muted">{t("df.sub", { goal: DREAM.goal, n: gifts })}</p>
          </div>
        </div>
      </div>

      <section aria-labelledby="add" className="flex flex-col gap-md px-md pt-xl">
        <h2 id="add" className="text-2xl">
          {t("df.addH")}
        </h2>
        <div className="grid grid-cols-4 gap-xs">
          {PICKS.map((p) => (
            <button key={p} className="choice" type="button" aria-pressed={pick === p} onClick={() => setPick(p)}>
              {p === "other" ? t("df.other") : `$${p}`}
            </button>
          ))}
        </div>
        {pick === "other" && (
          <div className="field">
            <label htmlFor="other">{t("df.otherL")}</label>
            <input
              id="other"
              className="input"
              type="number"
              min={5}
              inputMode="decimal"
              value={other}
              onChange={(e) => setOther(e.target.value)}
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="from">{t("df.from")}</label>
          <input id="from" className="input" type="text" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="wish">{t("df.wishL", { name: PARTY.honoree })}</label>
          <textarea id="wish" className="input" rows={2} value={wish} onChange={(e) => setWish(e.target.value)} />
        </div>
      </section>

      <section aria-labelledby="jar" className="flex flex-col gap-lg px-md pt-2xl pb-3xl">
        <h2 id="jar" className="text-2xl">
          {t("df.jarH")}
        </h2>
        {entries.map((e) => (
          <div key={e.meta + e.text} className="enter">
            <Note bg={e.bg} tilt={e.tilt} className="p-lg">
              <p className="font-display text-lg leading-[1.3] font-medium">{e.quoted ? `“${e.text}”` : e.text}</p>
              <p className="pt-xs text-sm font-extrabold">{e.meta}</p>
            </Note>
          </div>
        ))}
      </section>

      <div className="paper sticky bottom-0 z-(--z-sticky) mt-auto flex flex-col gap-xs border-t-2 border-ink bg-paper px-md pt-sm pb-lg">
        <button type="button" onClick={add} disabled={amount < 5} className="btn btn--primary btn--block min-h-14 text-lg">
          {t("df.add", { n: amount, name: PARTY.honoree })}
        </button>
        <span className="text-center text-xs font-semibold text-ink-2">{t("df.foot")}</span>
      </div>
    </PhoneColumn>
  );
}
