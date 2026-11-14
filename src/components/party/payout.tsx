"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import { Note, Table } from "@/components/shell";
import { PARTY, ROUTES, usd } from "@/lib/demo";
import { useParty } from "@/lib/use-party";

const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

export function Payout({ id }: { id: string }) {
  const { state } = useParty(2000);
  const [giftRaw, setGift] = useState<number>(PARTY.goal);
  const [words, setWords] = useState("I’m going to ride it to school every day");
  const [done, setDone] = useState<null | "buy" | "bank">(null);

  // делим то, что реально собрано (живые данные), подарок не больше собранного
  const COLLECTED = state.raisedCents / 100;
  const CONTRIBUTORS = state.contributors;
  const maxGift = Math.floor(COLLECTED);
  const gift = Math.min(giftRaw, maxGift);
  const dream = Math.round((COLLECTED - gift) * 100) / 100;
  const said = words.trim().replace(/[.!]+$/, "");
  const quote = "font-display text-lg leading-[1.35] font-medium";

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <header className="wrap flex items-center py-md">
        <Link href={`/party/${id}`} className="flex min-h-11 items-center gap-xs font-extrabold no-underline">
          <ArrowLeftIcon size={18} />
          {PARTY.honoree}’s party
        </Link>
      </header>

      <div className="wrap flex flex-wrap items-start gap-2xl pt-lg pb-3xl">
        <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-2xl">
          <div className="flex flex-col gap-md">
            <h1 className="max-w-[18ch] text-display-s">
              {CONTRIBUTORS} guests gave {money(COLLECTED)}. Where should it go?
            </h1>
            <p className="lead">It’s already in your Stripe balance. This decides what it’s for.</p>
          </div>

          <section aria-labelledby="split-h" className="flex flex-col gap-lg">
            <h2 id="split-h" className="visually-hidden">
              The split
            </h2>
            <div
              role="img"
              aria-label={`Split: $${gift} to the ${PARTY.giftShort}, ${money(dream)} to the Dream Fund`}
              className="flex h-28 overflow-hidden rounded-card"
            >
              <div
                className="paper flex min-w-[120px] flex-col justify-center bg-accent px-lg text-accent-ink"
                style={{ flex: `${Math.max(gift, 1)} 1 0` }}
              >
                <span className="text-sm font-extrabold">The {PARTY.giftShort}</span>
                <span className="num font-display text-3xl leading-none font-semibold tracking-[-0.03em]">${gift}</span>
              </div>
              <div
                className="paper flex min-w-[120px] flex-col justify-center bg-signal px-md text-signal-ink"
                style={{ flex: `${Math.max(dream, 1)} 1 0` }}
              >
                <span className="text-sm font-extrabold">Dream Fund</span>
                <span className="num font-display text-3xl leading-none font-semibold tracking-[-0.03em]">{money(dream)}</span>
              </div>
            </div>
            <div className="field">
              <label htmlFor="split">Amount for the gift</label>
              <input
                id="split"
                type="range"
                min={0}
                max={maxGift}
                step={5}
                value={gift}
                onChange={(e) => setGift(Number(e.target.value))}
                className="m-0 h-9 w-full accent-accent"
              />
              <div className="flex justify-between text-sm font-bold text-ink-2">
                <span>$0</span>
                <span>
                  {PARTY.giftShort} goal ${PARTY.goal}
                </span>
                <span>{money(COLLECTED)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-sm">
              <button type="button" className="btn" onClick={() => setDone("buy")}>
                {done === "buy" ? "Store link opened (demo)" : `Buy the ${PARTY.giftShort} from the store link`}
              </button>
              <button type="button" className="btn" onClick={() => setDone("bank")}>
                {done === "bank" ? `${usd(gift)} on its way (demo)` : "Move it to my bank"}
              </button>
            </div>
          </section>

          <section aria-labelledby="notes" className="flex flex-col gap-lg">
            <h2 id="notes" className="text-2xl">
              Thank-you notes from {PARTY.honoree}
            </h2>
            <div className="field">
              <label htmlFor="thanks-words">Ask {PARTY.honoree} what to say, and type it here</label>
              <input id="thanks-words" className="input" type="text" value={words} onChange={(e) => setWords(e.target.value)} />
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-lg">
              <Note bg="var(--color-signal-soft)" tilt={-1.2} className="p-lg">
                <p className={quote}>
                  “Dear Liam, thank you for helping with my {PARTY.giftShort}. {said}.”
                </p>
                <p className="pt-xs text-sm font-extrabold">To Liam</p>
              </Note>
              <Note bg="var(--color-mint)" tilt={1} className="p-lg">
                <p className={quote}>
                  “Dear Ava, thank you for my {PARTY.giftShort}! {said}. You can try it too.”
                </p>
                <p className="pt-xs text-sm font-extrabold">To Ava</p>
              </Note>
            </div>
          </section>
        </div>

        <aside aria-labelledby="sum" className="flex min-w-0 flex-[1_1_320px] flex-col gap-md pt-md">
          <h2 id="sum" className="text-xl">
            Before you confirm
          </h2>
          <Table
            label="Split summary"
            rows={[
              { k: "Collected", v: usd(COLLECTED) },
              { k: "Gift", v: usd(gift) },
              { k: "Dream Fund", v: usd(dream) },
              { k: "Left over", v: usd(Math.max(0, Math.round((COLLECTED - gift - dream) * 100) / 100)) },
            ]}
          />
          <Link className="btn btn--primary btn--block" href={ROUTES.dream}>
            Confirm and send {CONTRIBUTORS} notes
          </Link>
        </aside>
      </div>
    </div>
  );
}
