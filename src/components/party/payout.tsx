"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import { Note, Table } from "@/components/shell";
import { usd } from "@/lib/demo";
import { LangSwitch, useI18n } from "@/lib/i18n";
import { goalUsd, partyUrls, type PartyInfo } from "@/lib/party";
import type { PartyState } from "@/lib/party-state";
import { useParty } from "@/lib/use-party";

// «Использовать деньги»: купить подарок по ссылке магазина или вывести на свой банк,
// и разослать благодарности тем, кто скинулся. В демо деньги никуда не уходят.

type Choice = "buy" | "bank";

export function Payout({ party, initial }: { party: PartyInfo; initial: PartyState }) {
  const { t, title, giftShort } = useI18n();
  const { state } = useParty(party.id, initial, 2000);
  const urls = partyUrls(party.id);
  const goal = goalUsd(party);
  const short = giftShort(party.gift);
  const collected = state.raisedCents / 100;
  const over = Math.round((collected - goal) * 100) / 100;
  const thankers = state.guests.filter((g) => g.amountCents > 0).map((g) => g.name);
  const [choice, setChoice] = useState<Choice>("buy");
  const [typed, setTyped] = useState<string | null>(null);
  const words = typed ?? t("po.words");
  const [done, setDone] = useState(false);
  const said = words.trim().replace(/[.!]+$/, "");
  const quote = "font-display text-lg leading-[1.35] font-medium";

  const options: Array<[Choice, string, string]> = [
    ["buy", t("po.buy", { short }), t("po.buyT")],
    ["bank", t("po.bank"), t("po.bankT")],
  ];

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <header className="wrap flex items-center justify-between gap-md py-md">
        <Link href={urls.dashboard} className="flex min-h-11 items-center gap-xs font-extrabold no-underline">
          <ArrowLeftIcon size={18} />
          {title(party)}
        </Link>
        <LangSwitch />
      </header>

      <div className="wrap flex flex-wrap items-start gap-2xl pt-lg pb-3xl">
        <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-2xl">
          <div className="flex flex-col gap-md">
            <h1 className="max-w-[18ch] text-display-s">{t("po.h1", { n: state.contributors, money: usd(collected) })}</h1>
            <p className="lead">{t("po.lead", { short })}</p>
          </div>

          <section aria-labelledby="how" className="flex flex-col gap-md">
            <h2 id="how" className="text-2xl">
              {t("po.howH", { short })}
            </h2>
            <div role="group" aria-label={t("po.howAria")} className="grid gap-sm sm:grid-cols-2">
              {options.map(([id, head, text]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setChoice(id)}
                  className="choice flex flex-col items-start gap-2xs p-md text-left"
                  aria-pressed={choice === id}
                >
                  <span>{head}</span>
                  <span className="text-sm font-semibold opacity-80">{text}</span>
                </button>
              ))}
            </div>
            {over > 0 && <p className="label">{t(choice === "buy" ? "po.overBuy" : "po.overBank", { over: usd(over), goal })}</p>}
          </section>

          <section aria-labelledby="notes" className="flex flex-col gap-lg">
            <h2 id="notes" className="text-2xl">
              {t("po.notesH", { name: party.honoree })}
            </h2>
            <div className="field">
              <label htmlFor="thanks-words">{t("po.ask", { name: party.honoree })}</label>
              <input id="thanks-words" className="input" type="text" maxLength={140} value={words} onChange={(e) => setTyped(e.target.value)} />
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-lg">
              {(thankers.length ? thankers.slice(0, 2) : [t("po.friend")]).map((name, i) => (
                <Note key={name} bg={i % 2 ? "var(--color-mint)" : "var(--color-signal-soft)"} tilt={i % 2 ? 1 : -1.2} className="p-lg">
                  <p className={quote}>{t("po.note", { name, short, said })}</p>
                  <p className="pt-xs text-sm font-extrabold">{t("po.to", { name })}</p>
                </Note>
              ))}
            </div>
          </section>
        </div>

        <aside aria-labelledby="sum" className="flex min-w-0 flex-[1_1_320px] flex-col gap-md pt-md">
          <h2 id="sum" className="text-xl">
            {t("po.before")}
          </h2>
          <Table
            label={t("po.sumAria")}
            rows={[
              { k: t("po.collected"), v: usd(collected) },
              { k: t("po.goalRow"), v: usd(goal) },
              { k: over >= 0 ? t("po.overRow") : t("po.shortRow"), v: usd(Math.abs(over)) },
              { k: t("po.notesRow"), v: String(thankers.length) },
            ]}
          />
          {done ? (
            <p role="status" className="font-extrabold">
              {choice === "buy" ? t("po.doneBuy", { short, n: thankers.length }) : t("po.doneBank", { amount: usd(collected), n: thankers.length })}
            </p>
          ) : (
            <button type="button" className="btn btn--primary btn--block whitespace-normal" disabled={collected === 0} onClick={() => setDone(true)}>
              {t("po.confirm", { n: thankers.length })}
            </button>
          )}
          {collected === 0 && <p className="label">{t("po.empty")}</p>}
          <Link className="btn btn--block" href={urls.dashboard}>
            {t("po.back")}
          </Link>
        </aside>
      </div>
    </div>
  );
}
