"use client";

import { useState } from "react";
import { SparkIcon } from "@/components/icons";
import { AppHeader, Key, NameTag, Note, SWATCH, type TagKind } from "@/components/shell";
import { GUESTS, TILT } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/dict";

const EXTERNAL = new Set(["Olivia", "Isabella", "Harper"]);
const NOT_YET = new Set(["Noah", "Ethan", "Wyatt"]);

const TABS = ["gw.tab1", "gw.tab2", "gw.tab3"] as const;

const NUDGES = [
  { id: "n1", tilt: -1 },
  { id: "n2", tilt: 0.8 },
  { id: "n3", tilt: -0.5 },
] as const;

type Draft = { titleKey: MessageKey; perPerson: number; due: { m: number; d: number } | null; expected: number };

/** Черновик сбора для демо: тот же формат, что вернёт AI Collection Builder (запасной ответ на таймаут) */
function draftFrom(text: string): Draft {
  const money = text.match(/\$(\d+(?:\.\d{1,2})?)/);
  const dates = [...text.matchAll(/(\d{2})([/.])(\d{2})/g)];
  const last = dates.length ? dates[dates.length - 1] : null;
  // «03/06» — месяц/день (США), «06.03» — день.месяц
  const due = last ? (last[2] === "." ? { d: Number(last[1]), m: Number(last[3]) } : { m: Number(last[1]), d: Number(last[3]) }) : null;
  const per = money ? Number(money[1]) : 12;
  const lower = text.toLowerCase();
  const has = (...words: string[]) => words.some((w) => lower.includes(w));
  const titleKey: MessageKey = has("museum", "музей", "мұражай")
    ? "gw.d.museum"
    : has("teacher", "thank", "учител", "благодар", "мұғалім", "алғыс")
      ? "gw.d.teacher"
      : has("supplies", "канцт", "кеңсе")
        ? "gw.d.supplies"
        : "gw.d.group";
  return { titleKey, perPerson: per, due, expected: per * GUESTS.length };
}

export function GroupWallet() {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState(0);
  const [typed, setTyped] = useState<string | null>(null);
  const paste = typed ?? t("gw.sample");
  const [built, setBuilt] = useState<Draft | null>(null);
  const draft = built ?? draftFrom(t("gw.sample"));
  const dueText = draft.due
    ? locale === "en"
      ? `${String(draft.due.m).padStart(2, "0")}/${String(draft.due.d).padStart(2, "0")}/2027`
      : `${String(draft.due.d).padStart(2, "0")}.${String(draft.due.m).padStart(2, "0")}.2027`
    : "—";
  const [thinking, setThinking] = useState(false);
  const [published, setPublished] = useState(false);
  const [sentAll, setSentAll] = useState(false);

  const build = () => {
    setThinking(true);
    setPublished(false);
    setTimeout(() => {
      setBuilt(draftFrom(paste));
      setThinking(false);
    }, 900);
  };

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <AppHeader active="group" avatar="J" avatarLabel={t("sh.signedJulia")} avatarClass="bg-mint text-mint-ink" />

      <div className="wrap flex flex-col gap-xl pt-xl pb-3xl">
        <div className="flex flex-wrap items-end justify-between gap-lg">
          <div className="flex flex-col gap-xs">
            <h1 className="text-display-s">{t("gw.name")}</h1>
            <p className="text-ink-2">{t("gw.sub")}</p>
          </div>
          <div role="tablist" aria-label={t("gw.tabs")} className="flex flex-wrap gap-xs">
            {TABS.map((tk, i) => (
              <button
                key={tk}
                role="tab"
                aria-selected={tab === i}
                type="button"
                onClick={() => setTab(i)}
                className="choice px-md"
              >
                {t(tk)}
              </button>
            ))}
            {published && (
              <span className="pop tag min-h-[52px] bg-signal px-md font-extrabold">{t("gw.new", { title: t(draft.titleKey) })}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-xl">
          <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-2xl">
            <section aria-labelledby="tg" className="flex flex-col gap-lg">
              <div className="flex flex-wrap items-end justify-between gap-md border-b-2 border-ink pb-md">
                <div className="flex flex-col gap-2xs">
                  <h2 id="tg" className="text-2xl">
                    {t("gw.tgH")}
                  </h2>
                  <p className="text-ink-2">{t("gw.tgS")}</p>
                </div>
                <div className="flex items-baseline gap-sm">
                  <span className="figure text-3xl text-accent">22/25</span>
                  <span className="font-extrabold">{t("gw.tgPaid")}</span>
                </div>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-sm sm:grid-cols-[repeat(auto-fill,minmax(132px,1fr))]">
                {GUESTS.map((n, i) => {
                  const [kind, label]: [TagKind, string] = NOT_YET.has(n)
                    ? ["open", t("gw.notYet")]
                    : EXTERNAL.has(n)
                      ? ["venmo", t("gw.venmo")]
                      : ["paid", t("gw.paid")];
                  return <NameTag key={n} name={n} state={label} kind={kind} tilt={TILT[i % TILT.length]} />;
                })}
              </div>
              <div className="flex flex-wrap gap-lg">
                <Key swatch={SWATCH.paid}>{t("gw.k1")}</Key>
                <Key swatch={SWATCH.soft}>{t("gw.k2")}</Key>
                <Key swatch={SWATCH.open}>{t("gw.k3")}</Key>
              </div>
            </section>

            <section aria-labelledby="rm" className="flex flex-col gap-md">
              <div className="flex flex-wrap items-baseline justify-between gap-md">
                <h2 id="rm" className="text-2xl">
                  {t("gw.rmH")}
                </h2>
                <span className="label">{t("gw.rmS")}</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-md">
                {NUDGES.map((m) => (
                  <Note key={m.id} bg="var(--color-paper-2)" tilt={m.tilt} className="p-lg">
                    <span className="font-extrabold">{t("gw.to", { name: t(`gw.${m.id}.to` as MessageKey) })}</span>
                    <p className="pt-xs leading-normal">{t(`gw.${m.id}.text` as MessageKey)}</p>
                  </Note>
                ))}
              </div>
              <div className="flex flex-wrap gap-sm">
                <button type="button" disabled={sentAll} onClick={() => setSentAll(true)} className="btn btn--primary">
                  {sentAll ? t("gw.sentAll") : t("gw.sendAll")}
                </button>
                <button type="button" className="btn">
                  {t("gw.edit")}
                </button>
              </div>
            </section>
          </div>

          <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-xl">
            <section
              aria-labelledby="nc"
              className="paper torn on-dark flex flex-col gap-md bg-night px-lg py-xl text-night-ink"
            >
              <h2 id="nc" className="text-2xl">
                {t("gw.ncH")}
              </h2>
              <div className="field">
                <label htmlFor="paste" className="text-night-muted!">
                  {t("gw.pasteL")}
                </label>
                <textarea
                  id="paste"
                  className="input"
                  rows={5}
                  value={paste}
                  onChange={(e) => setTyped(e.target.value)}
                  style={{
                    backgroundColor: "var(--color-night-2)",
                    color: "var(--color-night-ink)",
                    borderColor: "var(--color-night-muted)",
                  }}
                />
              </div>
              <button type="button" onClick={build} disabled={thinking || !paste.trim()} className="btn btn--small self-start">
                <SparkIcon size={16} className="text-signal" />
                {thinking ? t("gw.reading") : t("gw.draftBtn")}
              </button>
              <div
                aria-busy={thinking}
                className={`flex flex-col gap-sm border-t-[1.5px] border-dashed border-night-rule pt-md transition-opacity ${thinking ? "opacity-40" : ""}`}
              >
                <h3 className="text-xl">{t(draft.titleKey)}</h3>
                <p className="label text-night-muted!">{t("gw.draftNote")}</p>
                <div className="flex flex-wrap gap-xs">
                  {[t("gw.each", { n: draft.perPerson }), t("gw.due", { d: dueText }), t("gw.expected", { n: draft.expected })].map((tag) => (
                    <span key={tag} className="tag bg-night-rule text-night-ink">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-sm">
                <button type="button" onClick={() => setPublished(true)} disabled={thinking} className="btn btn--signal">
                  {published ? t("gw.published") : t("gw.publish")}
                </button>
                <button type="button" onClick={() => document.getElementById("paste")?.focus()} className="btn">
                  {t("gw.editDraft")}
                </button>
              </div>
            </section>

            <section aria-labelledby="rp" className="flex flex-col gap-sm">
              <h2 id="rp" className="text-xl">
                {t("gw.busH")}
              </h2>
              <table aria-label={t("gw.busAria")} className="border-collapse text-md">
                <tbody>
                  <tr className="border-t-2 border-ink">
                    <th scope="row" className="py-sm text-left font-medium text-ink-2">
                      {t("gw.came")}
                    </th>
                    <td className="num text-right font-extrabold">$250.00</td>
                  </tr>
                  <tr className="border-t border-edge">
                    <th scope="row" className="py-sm text-left font-medium text-ink-2">
                      {t("gw.paidBus")}
                    </th>
                    <td className="num text-right font-extrabold">$235.00</td>
                  </tr>
                  <tr className="border-y border-edge">
                    <th scope="row" className="py-sm text-left font-extrabold">
                      {t("gw.leftIn")}
                    </th>
                    <td className="num text-right font-display text-xl font-semibold text-accent">$15.00</td>
                  </tr>
                </tbody>
              </table>
              <a href="#csv" className="flex min-h-11 items-center font-extrabold">
                {t("gw.csv")}
              </a>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
