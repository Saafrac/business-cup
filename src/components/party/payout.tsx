"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import { Note, Table } from "@/components/shell";
import { usd } from "@/lib/demo";
import { giftShort, goalUsd, partyTitle, partyUrls, type PartyInfo } from "@/lib/party";
import type { PartyState } from "@/lib/party-state";
import { useParty } from "@/lib/use-party";

// «Use the money»: что сделать с собранным — купить подарок по ссылке магазина или вывести на свой банк,
// и разослать благодарности тем, кто скинулся. В демо деньги никуда не уходят.

type Choice = "buy" | "bank";

export function Payout({ party, initial }: { party: PartyInfo; initial: PartyState }) {
  const { state } = useParty(party.id, initial, 2000);
  const urls = partyUrls(party.id);
  const goal = goalUsd(party);
  const short = giftShort(party.gift);
  const collected = state.raisedCents / 100;
  const over = Math.round((collected - goal) * 100) / 100;
  const thankers = state.guests.filter((g) => g.amountCents > 0).map((g) => g.name);
  const [choice, setChoice] = useState<Choice>("buy");
  const [words, setWords] = useState("It means the world to me");
  const [done, setDone] = useState(false);
  const said = words.trim().replace(/[.!]+$/, "");
  const quote = "font-display text-lg leading-[1.35] font-medium";

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <header className="wrap flex items-center py-md">
        <Link href={urls.dashboard} className="flex min-h-11 items-center gap-xs font-extrabold no-underline">
          <ArrowLeftIcon size={18} />
          {partyTitle(party)}
        </Link>
      </header>

      <div className="wrap flex flex-wrap items-start gap-2xl pt-lg pb-3xl">
        <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-2xl">
          <div className="flex flex-col gap-md">
            <h1 className="max-w-[18ch] text-display-s">
              {state.contributors} {state.contributors === 1 ? "guest" : "guests"} gave {usd(collected)}. What’s next?
            </h1>
            <p className="lead">
              The money is in your Stripe balance. Pick how to get the {short}, then thank everyone who chipped in.
            </p>
          </div>

          <section aria-labelledby="how" className="flex flex-col gap-md">
            <h2 id="how" className="text-2xl">
              1. Get the {short}
            </h2>
            <div role="group" aria-label="How to use the money" className="grid gap-sm sm:grid-cols-2">
              {(
                [
                  ["buy", `Buy the ${short} from the store link`, "We pay the store, the gift ships to you."],
                  ["bank", "Move it to my bank", "1 to 2 business days, then you buy it yourself."],
                ] as const
              ).map(([id, title, text]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setChoice(id)}
                  className="choice flex flex-col items-start gap-2xs p-md text-left"
                  aria-pressed={choice === id}
                >
                  <span>{title}</span>
                  <span className="text-sm font-semibold opacity-80">{text}</span>
                </button>
              ))}
            </div>
            {over > 0 && (
              <p className="label">
                {usd(over)} over the ${goal} goal goes {choice === "buy" ? "to your bank" : "with the rest"}.
              </p>
            )}
          </section>

          <section aria-labelledby="notes" className="flex flex-col gap-lg">
            <h2 id="notes" className="text-2xl">
              2. Thank-you notes from {party.honoree}
            </h2>
            <div className="field">
              <label htmlFor="thanks-words">Ask {party.honoree} what to say, and type it here</label>
              <input id="thanks-words" className="input" type="text" maxLength={140} value={words} onChange={(e) => setWords(e.target.value)} />
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-lg">
              {(thankers.length ? thankers.slice(0, 2) : ["friend"]).map((name, i) => (
                <Note key={name} bg={i % 2 ? "var(--color-mint)" : "var(--color-signal-soft)"} tilt={i % 2 ? 1 : -1.2} className="p-lg">
                  <p className={quote}>
                    “Dear {name}, thank you for helping with my {short}. {said}.”
                  </p>
                  <p className="pt-xs text-sm font-extrabold">To {name}</p>
                </Note>
              ))}
            </div>
          </section>
        </div>

        <aside aria-labelledby="sum" className="flex min-w-0 flex-[1_1_320px] flex-col gap-md pt-md">
          <h2 id="sum" className="text-xl">
            Before you confirm
          </h2>
          <Table
            label="Summary"
            rows={[
              { k: "Collected", v: usd(collected) },
              { k: "Gift goal", v: usd(goal) },
              { k: over >= 0 ? "Over the goal" : "Short of the goal", v: usd(Math.abs(over)) },
              { k: "Thank-you notes", v: String(thankers.length) },
            ]}
          />
          {done ? (
            <p role="status" className="font-extrabold">
              Done (demo): {choice === "buy" ? `the ${short} is ordered` : `${usd(collected)} is on its way to your bank`}, {thankers.length}{" "}
              notes sent.
            </p>
          ) : (
            <button type="button" className="btn btn--primary btn--block" disabled={collected === 0} onClick={() => setDone(true)}>
              Confirm and send {thankers.length} {thankers.length === 1 ? "note" : "notes"}
            </button>
          )}
          {collected === 0 && <p className="label">Nothing collected yet. Share the invite link first.</p>}
          <Link className="btn btn--block" href={urls.dashboard}>
            Back to the dashboard
          </Link>
        </aside>
      </div>
    </div>
  );
}
