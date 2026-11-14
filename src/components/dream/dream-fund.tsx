"use client";

import { useState } from "react";
import { Note, PhoneColumn } from "@/components/shell";
import { DREAM, PARTY } from "@/lib/demo";

type Pick = 25 | 50 | 100 | "other";
const PICKS: Pick[] = [25, 50, 100, "other"];

type Entry = { text: string; meta: string; bg: string; tilt: number; quoted: boolean };

const BGS = ["var(--color-signal-soft)", "var(--color-paper-3)", "var(--color-mint)"];
const TILTS = [-1.2, 1, -0.6];

const HISTORY: Entry[] = [
  { text: "For the stars you’ll find, sweetheart.", meta: "Grandma Ruth, $50, 12/09", bg: BGS[0], tilt: TILTS[0], quoted: true },
  { text: "Left over from the bike, from 21 guests at her party", meta: "Birthday party, $40, 12/04", bg: BGS[1], tilt: TILTS[1], quoted: false },
  { text: "Send me a photo of the moon.", meta: "Aunt Maya, $30, 12/06", bg: BGS[2], tilt: TILTS[2], quoted: true },
];

export function DreamFundPage() {
  const [pick, setPick] = useState<Pick>(50);
  const [other, setOther] = useState("20");
  const [from, setFrom] = useState("Grandpa Joe");
  const [wish, setWish] = useState("Happy stargazing, kiddo");
  const [balance, setBalance] = useState<number>(DREAM.balance);
  const [entries, setEntries] = useState<Entry[]>(HISTORY);

  const amount = pick === "other" ? Math.max(0, Number(other) || 0) : pick;
  const left = Math.max(0, DREAM.goal - balance);
  const fill = Math.min(100, (balance / DREAM.goal) * 100);
  const gifts = entries.length;

  const add = () => {
    if (amount < 5) return;
    const i = entries.length;
    setBalance((b) => b + amount);
    setEntries((list) => [
      {
        text: wish.trim() || `A gift for ${PARTY.honoree}`,
        meta: `${from.trim() || "Someone who loves her"}, $${amount}, 12/14`,
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
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-semibold tracking-[-0.03em]">chip in</span>
          <span className="text-sm font-bold text-night-muted">{PARTY.honoree}’s Dream Fund</span>
        </div>
        <h1 className="text-[2.5rem] leading-[1.02]">{PARTY.honoree} is saving for a telescope</h1>
        <div className="flex items-end gap-lg">
          <div
            role="img"
            aria-label={`Jar: $${balance} saved of $${DREAM.goal}`}
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
              {left > 0 ? `$${left} to go` : "Goal reached!"}
            </span>
            <p className="text-sm text-night-muted">
              Goal ${DREAM.goal}. {gifts === 3 ? "Three" : gifts} gifts so far, starting with her 7th birthday.
            </p>
          </div>
        </div>
      </div>

      <section aria-labelledby="add" className="flex flex-col gap-md px-md pt-xl">
        <h2 id="add" className="text-2xl">
          Add to the jar
        </h2>
        <div className="grid grid-cols-4 gap-xs">
          {PICKS.map((p) => (
            <button key={p} className="choice" type="button" aria-pressed={pick === p} onClick={() => setPick(p)}>
              {p === "other" ? "Other" : `$${p}`}
            </button>
          ))}
        </div>
        {pick === "other" && (
          <div className="field">
            <label htmlFor="other">Your amount, from $5</label>
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
          <label htmlFor="from">From</label>
          <input id="from" className="input" type="text" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="wish">A line for {PARTY.honoree}, if you like</label>
          <textarea id="wish" className="input" rows={2} value={wish} onChange={(e) => setWish(e.target.value)} />
        </div>
      </section>

      <section aria-labelledby="jar" className="flex flex-col gap-lg px-md pt-2xl pb-3xl">
        <h2 id="jar" className="text-2xl">
          What’s in the jar
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
          Add ${amount} for {PARTY.honoree}
        </button>
        <span className="text-center text-xs font-semibold text-ink-2">Goes to her parent’s account through Stripe</span>
      </div>
    </PhoneColumn>
  );
}
