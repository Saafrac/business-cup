"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BikeIcon, GiftIcon, PaletteIcon, TelescopeIcon } from "@/components/icons";
import { Bar, PhoneColumn } from "@/components/shell";
import { usd } from "@/lib/demo";
import { dayLong, giftShort, goalUsd, inviteHeadline, mmdd, partyUrls, time12, type PartyInfo } from "@/lib/party";
import { usdShort, type PartyState } from "@/lib/party-state";
import { postPartyEvent, useParty } from "@/lib/use-party";

type Amount = 10 | 20 | 25 | "other";
type How = "card" | "external" | "rsvp";

const AMOUNTS: Amount[] = [10, 20, 25, "other"];
const TIPS = [0, 5, 10];
const MIN_OTHER = 5;

function GiftArt({ gift }: { gift: string }) {
  const g = giftShort(gift);
  const Icon = g === "bike" ? BikeIcon : g === "telescope" ? TelescopeIcon : g === "art set" ? PaletteIcon : GiftIcon;
  return <Icon size={40} strokeWidth={1.6} />;
}

export function GuestPage({ party, initial }: { party: PartyInfo; initial: PartyState }) {
  const router = useRouter();
  const { state, accept } = useParty(party.id, initial);
  const goal = goalUsd(party);
  const short = giftShort(party.gift);
  const nameRef = useRef<HTMLInputElement>(null);
  const [guest, setGuest] = useState("");
  const [rsvp, setRsvp] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState<Amount>(20);
  const [other, setOther] = useState("15");
  const [tip, setTip] = useState(0);
  const [cover, setCover] = useState(true);
  const [busy, setBusy] = useState<How | null>(null);
  const [error, setError] = useState("");

  const gift = amount === "other" ? Math.max(0, Number(other) || 0) : amount;
  const otherInvalid = amount === "other" && gift < MIN_OTHER;
  const tipAmt = Math.round(gift * tip) / 100;
  const base = gift + tipAmt;
  // Покрыть комиссию Stripe 2.9% + $0.30: grossup, чтобы виновнику события пришла полная сумма
  const proc = cover && base > 0 ? Math.round(((base + 0.3) / (1 - 0.029) - base) * 100) / 100 : 0;
  const total = base + proc;

  const submit = async (how: How) => {
    setError("");
    const name = guest.trim();
    if (!name) {
      setError("Type your name first");
      nameRef.current?.focus();
      return;
    }
    if (how !== "rsvp" && otherInvalid) {
      setError(`Chip in from $${MIN_OTHER}`);
      return;
    }
    setBusy(how);
    const res = await postPartyEvent(
      party.id,
      how === "rsvp"
        ? { guest: name, rsvp }
        : { guest: name, rsvp, amount: gift, tip: tipAmt, method: how === "external" ? "external" : "test" },
    );
    if (!res.ok) {
      setBusy(null);
      setError(res.error);
      return;
    }
    accept(res.state);
    const paid = how === "card" ? total : how === "external" ? gift : 0;
    router.push(`${partyUrls(party.id).thanks}?guest=${encodeURIComponent(name)}&paid=${paid.toFixed(2)}&how=${how}`);
  };

  return (
    <PhoneColumn>
      <div className="paper torn-bottom on-accent flex flex-col gap-xl bg-accent px-md pt-md pb-3xl text-accent-ink">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-semibold tracking-[-0.03em]">chip in</span>
          <span className="text-sm font-bold">No account needed</span>
        </div>
        <h1 className="text-[3.25rem] leading-[0.98]">
          {inviteHeadline(party)}
        </h1>
      </div>

      <div className="sheet relative z-[1] mx-md -mt-2xl" style={{ rotate: "-1.2deg" }}>
        <div className="paper torn-note grid grid-cols-[auto_minmax(0,1fr)] items-center gap-md bg-signal-soft p-lg">
          <div className="flex flex-col border-r-2 border-dashed border-signal-deep pr-md">
            <span className="text-sm font-extrabold">{dayLong(party.date)}</span>
            <span className="num font-display text-2xl leading-[1.05] font-semibold tracking-[-0.03em]">{mmdd(party.date)}</span>
            <span className="text-sm font-bold">{time12(party.time)}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold">{party.place}</span>
            {party.placeNote && <span className="text-sm text-ink-2">{party.placeNote}</span>}
          </div>
        </div>
      </div>

      <section aria-labelledby="gift" className="flex flex-col gap-md px-md pt-xl">
        <div className="flex items-center gap-md">
          <span className="paper flex size-16 shrink-0 items-center justify-center rounded-stock bg-signal">
            <GiftArt gift={party.gift} />
          </span>
          <div className="flex flex-col">
            <h2 id="gift" className="text-xl">
              {party.gift}
            </h2>
            <p className="text-sm text-ink-2">The gift for {party.honoree}</p>
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="num font-display text-3xl font-semibold tracking-[-0.03em] text-accent">
            {usdShort(state.raisedCents)}
          </span>
          <span className="font-bold text-ink-2">of ${goal}</span>
        </div>
        <Bar
          ratio={state.raisedCents / party.goalCents}
          label={`${usdShort(state.raisedCents)} of $${goal} raised`}
        />
        <p className="font-extrabold">
          {state.contributors} of {state.invited} guests are in
        </p>
      </section>

      <div className="flex flex-col gap-xl px-md pt-xl pb-2xl">
        <section aria-labelledby="rsvp" className="flex flex-col gap-sm">
          <h2 id="rsvp" className="text-2xl">
            Can you come?
          </h2>
          <div className="field">
            <label htmlFor="guest-name">Your name</label>
            <input
              ref={nameRef}
              id="guest-name"
              className="input"
              type="text"
              autoComplete="off"
              autoCapitalize="words"
              maxLength={40}
              placeholder="For example, Liam"
              value={guest}
              onChange={(e) => setGuest(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-xs pt-xs">
            <button className="choice" type="button" aria-pressed={rsvp === "yes"} onClick={() => setRsvp("yes")}>
              We’ll be there
            </button>
            <button className="choice" type="button" aria-pressed={rsvp === "no"} onClick={() => setRsvp("no")}>
              Can’t make it
            </button>
          </div>
        </section>

        <section aria-labelledby="chip" className="flex flex-col gap-sm">
          <h2 id="chip" className="text-2xl">
            Chip in for the {short}
          </h2>
          <p className="text-sm text-ink-2">Optional. Other guests see the total, never your amount.</p>
          <div className="grid grid-cols-4 gap-xs pt-xs">
            {AMOUNTS.map((a) => (
              <button key={a} className="choice" type="button" aria-pressed={amount === a} onClick={() => setAmount(a)}>
                {a === "other" ? "Other" : `$${a}`}
              </button>
            ))}
          </div>
          {amount === "other" && (
            <div className="field pt-xs">
              <label htmlFor="other">Your amount, from ${MIN_OTHER}</label>
              <input
                id="other"
                className="input"
                type="number"
                inputMode="decimal"
                min={MIN_OTHER}
                max={500}
                value={other}
                onChange={(e) => setOther(e.target.value)}
                aria-invalid={otherInvalid}
                style={otherInvalid ? { borderColor: "var(--color-error)" } : undefined}
              />
            </div>
          )}
        </section>

        <section aria-labelledby="tip" className="flex flex-col gap-sm">
          <h2 id="tip" className="text-lg">
            A tip for Chip In
          </h2>
          <div className="grid grid-cols-3 gap-xs">
            {TIPS.map((t) => (
              <button key={t} className="choice" type="button" aria-pressed={tip === t} onClick={() => setTip(t)}>
                {t === 0 ? "No tip" : `${t}%`}
              </button>
            ))}
          </div>
          <label htmlFor="fee" className="flex min-h-11 cursor-pointer items-center gap-sm text-sm font-semibold">
            <input
              id="fee"
              type="checkbox"
              checked={cover}
              onChange={() => setCover((c) => !c)}
              className="m-0 size-[22px] shrink-0 accent-accent"
            />
            <span>Cover the card fee (2.9% + $0.30) so {party.honoree} gets it all</span>
          </label>
        </section>

        <table aria-label="Your payment" className="border-collapse text-md">
          <tbody>
            <SumRow label="Gift" value={usd(gift)} first />
            <SumRow label="Tip" value={usd(tipAmt)} />
            <SumRow label="Card fee" value={usd(proc)} />
            <tr className="border-t border-edge">
              <th scope="row" className="py-sm text-left font-extrabold">
                Total
              </th>
              <td className="num text-right font-display text-xl font-semibold text-accent">{usd(total)}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex flex-col gap-xs">
          <button type="button" className="btn btn--block" disabled={busy !== null} onClick={() => submit("external")}>
            {busy === "external" ? "Saving…" : "I sent it by Venmo or Zelle"}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => submit("rsvp")}
            className="flex min-h-11 items-center self-center border-0 bg-transparent font-bold text-accent-deep underline decoration-[1.5px] underline-offset-[0.18em]"
          >
            {busy === "rsvp" ? "Saving…" : "Just RSVP, skip the gift"}
          </button>
        </div>
      </div>

      <div className="paper sticky bottom-0 z-(--z-sticky) mt-auto flex flex-col gap-xs border-t-2 border-ink bg-paper px-md pt-sm pb-lg">
        {error && (
          <p role="alert" className="text-center text-sm font-bold text-error">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={busy !== null || otherInvalid || gift === 0}
          onClick={() => submit("card")}
          className="btn btn--primary btn--block min-h-14 text-lg"
        >
          {busy === "card" ? "Paying…" : `Test payment ${usd(total)}`}
        </button>
        <span className="text-center text-xs font-semibold text-ink-2">Demo mode: no card is charged</span>
      </div>
    </PhoneColumn>
  );
}

function SumRow({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <tr className={first ? "border-t-2 border-ink" : undefined}>
      <th scope="row" className="py-xs text-left font-medium text-ink-2">
        {label}
      </th>
      <td className="num text-right font-bold">{value}</td>
    </tr>
  );
}
