"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import { confettiStyle, GiftArt, mascotSrc } from "@/components/invite/invite-view";
import { cn } from "@/components/shell";
import { usd } from "@/lib/demo";
import { calendarUrl, dayLong, giftShort, goalUsd, partyUrls, type PartyInfo } from "@/lib/party";
import { usdShort, type PartyState } from "@/lib/party-state";
import { postPartyEvent } from "@/lib/use-party";

// Короткие шаги ответа гостя (макет «G2 · Steps»): имя → кто придёт → аллергии → взнос → готово; «Can’t make it» — свой экран.
// На сервер уходит один запрос в конце: RSVP, число гостей, аллергии и взнос вместе.

export type FlowStart = "yes" | "no" | "chip";
type Step = "name" | "who" | "allergies" | "chip" | "sorry" | "done";
type Amount = 10 | 20 | 25 | "other";
type How = "test" | "external" | "later" | "rsvp";

const AMOUNTS: Amount[] = [10, 20, 25, "other"];
const TIPS = [0, 5, 10];
const MIN_OTHER = 5;
const ALLERGIES = ["Nuts", "Dairy", "Gluten", "Eggs", "Vegetarian", "None"];
const BURST = Array.from({ length: 22 }, (_, i) => [((i * 37) % 96) + 2, ((i * 53) % 42) + 2] as const);

export function RsvpFlow({
  party,
  state,
  start,
  onState,
  onClose,
}: {
  party: PartyInfo;
  state: PartyState;
  start: FlowStart;
  onState: (s: PartyState) => void;
  onClose: () => void;
}) {
  const short = giftShort(party.gift);
  const nameRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<FlowStart>(start);
  const [step, setStep] = useState<Step>(start === "no" ? "sorry" : "name");
  const [name, setName] = useState("");
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [allergy, setAllergy] = useState<Record<string, boolean>>({});
  const [other, setOther] = useState("");
  const [amount, setAmount] = useState<Amount>(20);
  const [otherAmount, setOtherAmount] = useState("15");
  const [tip, setTip] = useState(0);
  const [cover, setCover] = useState(true);
  const [busy, setBusy] = useState<How | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ how: How; paid: number } | null>(null);

  // порядок шагов зависит от того, с какой кнопки пришёл гость
  const order: Step[] = mode === "yes" ? ["name", "who", "allergies", "chip"] : mode === "chip" ? ["name", "chip"] : ["chip"];
  const idx = order.indexOf(step);
  const rsvp = mode === "yes" ? "yes" : mode === "no" ? "no" : null;

  const gift = amount === "other" ? Math.max(0, Number(otherAmount) || 0) : amount;
  const otherInvalid = amount === "other" && gift < MIN_OTHER;
  const tipAmt = Math.round(gift * tip) / 100;
  const base = gift + tipAmt;
  // покрыть комиссию Stripe 2.9% + $0.30, чтобы виновнику пришла полная сумма
  const fee = cover && base > 0 ? Math.round(((base + 0.3) / (1 - 0.029) - base) * 100) / 100 : 0;
  const total = base + fee;

  const picked = ALLERGIES.filter((a) => allergy[a] && a !== "None");
  const note = [...picked, other.trim()].filter(Boolean).join(", ");
  const people = adults + kids;

  const go = (s: Step) => {
    setError("");
    setStep(s);
  };

  const next = () => {
    if (step === "name" && !name.trim()) {
      setError("Type your name first");
      nameRef.current?.focus();
      return;
    }
    if (step === "who" && people < 1) {
      setError("At least one person is coming");
      return;
    }
    go(order[idx + 1]);
  };

  const back = () => (idx > 0 ? go(order[idx - 1]) : mode === "no" ? go("sorry") : onClose());

  const send = async (how: How) => {
    setError("");
    const guest = name.trim();
    if (!guest) {
      setError("Type your name first");
      if (step !== "sorry") go(mode === "no" ? "sorry" : "name");
      return;
    }
    if ((how === "test" || how === "external") && otherInvalid) {
      setError(`Chip in from $${MIN_OTHER}`);
      return;
    }
    const pays = how === "test" || how === "external";
    if (!pays && !rsvp) {
      onClose(); // «Maybe later» без RSVP: сохранять нечего
      return;
    }
    setBusy(how);
    const res = await postPartyEvent(party.id, {
      guest,
      rsvp,
      ...(pays ? { amount: gift, tip: tipAmt, method: how } : {}),
      ...(rsvp === "yes" ? { people, note } : {}),
    });
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onState(res.state);
    setResult({ how, paid: how === "test" ? total : how === "external" ? gift : 0 });
    go("done");
    window.scrollTo({ top: 0 });
  };

  const restart = () => {
    setResult(null);
    setMode("yes");
    go("name");
  };

  if (step === "done") {
    return (
      <Done
        party={party}
        state={state}
        name={name.trim()}
        coming={rsvp === "yes"}
        summary={[
          ...(rsvp === "yes"
            ? [
                ["Coming", `${adults} ${adults === 1 ? "adult" : "adults"}${kids ? `, ${kids} ${kids === 1 ? "kid" : "kids"}` : ""}`],
                ["Allergies", note || "None given"],
              ]
            : rsvp === "no"
              ? [["Answer", "Can’t make it"]]
              : []),
          [
            "Gift",
            result && result.paid > 0
              ? result.how === "external"
                ? `You sent ${usd(result.paid)} by Venmo or Zelle`
                : `You chipped in ${usd(result.paid)}`
              : "Maybe later",
          ],
        ]}
        chipLater={!result || result.paid === 0}
        onChip={() => {
          setMode(rsvp === "no" ? "no" : "chip");
          go(rsvp === "no" ? "chip" : "name");
        }}
        onRestart={restart}
        short={short}
      />
    );
  }

  if (step === "sorry") {
    return (
      <Screen theme={party.theme}>
        <div className="flex flex-1 flex-col gap-lg px-md pt-md">
          <button type="button" onClick={onClose} aria-label="Back to the invite" className="flex size-11 items-center justify-center border-0 bg-transparent p-0 text-ink">
            <ArrowLeftIcon size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG темы из public */}
          <img src={mascotSrc(party.theme)} alt="" className="h-[180px] w-full object-contain" />
          <div className="flex flex-col gap-xs">
            <h1 className="text-3xl">Sorry you’ll miss it</h1>
            <p className="text-ink-2">
              We’ll let the organizer know. Want to chip in for the {short} anyway? It’s optional.
            </p>
          </div>
          <Field id="sorry-name" label="Your name">
            <input
              ref={nameRef}
              id="sorry-name"
              className="input"
              autoComplete="off"
              autoCapitalize="words"
              maxLength={40}
              placeholder="For example, Liam"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
        </div>
        <Footer error={error}>
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => {
              if (!name.trim()) {
                setError("Type your name first");
                nameRef.current?.focus();
                return;
              }
              go("chip");
            }}
          >
            Chip in for the {short}
          </button>
          <button type="button" disabled={busy !== null} onClick={() => send("rsvp")} className="link-btn">
            {busy === "rsvp" ? "Sending…" : "No thanks, just send my answer"}
          </button>
        </Footer>
      </Screen>
    );
  }

  return (
    <Screen theme={party.theme}>
      <div className="flex items-center gap-sm px-md pt-sm">
        <button type="button" onClick={back} aria-label="Back" className="flex size-11 items-center justify-center border-0 bg-transparent p-0 text-ink">
          <ArrowLeftIcon size={22} />
        </button>
        {order.length > 1 && (
          <div className="steps-dots" role="img" aria-label={`Step ${idx + 1} of ${order.length}`}>
            {order.map((s, k) => (
              <i key={s} data-on={k <= idx ? "true" : "false"} />
            ))}
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG темы из public */}
        <img src={mascotSrc(party.theme)} alt="" className="ml-auto h-[68px] w-24 object-contain" />
      </div>

      <div className="flex flex-1 flex-col gap-lg px-md pt-lg pb-lg">
        {step === "name" && (
          <>
            <h1 className="text-3xl">Who’s answering?</h1>
            <Field id="guest-name" label="Your name">
              <input
                ref={nameRef}
                id="guest-name"
                className="input"
                autoComplete="off"
                autoCapitalize="words"
                maxLength={40}
                placeholder="For example, Liam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && next()}
              />
            </Field>
            <p className="text-sm text-ink-2">The organizer sees your name. Other guests see only the headcount.</p>
          </>
        )}

        {step === "who" && (
          <>
            <h1 className="text-3xl">How many are coming?</h1>
            <div className="flex flex-col">
              <Counter label="Adults" value={adults} onChange={setAdults} min={0} />
              <Counter label="Kids" value={kids} onChange={setKids} min={0} />
            </div>
          </>
        )}

        {step === "allergies" && (
          <>
            <div className="flex flex-col gap-xs">
              <h1 className="text-3xl">Any allergies?</h1>
              <p className="text-ink-2">The organizer will plan the food around them.</p>
            </div>
            <div className="flex flex-wrap gap-xs">
              {ALLERGIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  className="choice px-md"
                  aria-pressed={Boolean(allergy[a])}
                  onClick={() =>
                    setAllergy((cur) => (a === "None" ? { None: !cur.None } : { ...cur, [a]: !cur[a], None: false }))
                  }
                >
                  {a}
                </button>
              ))}
            </div>
            <Field id="allergy-other" label="Anything else">
              <input
                id="allergy-other"
                className="input"
                maxLength={80}
                placeholder="Strawberries, for example"
                value={other}
                onChange={(e) => setOther(e.target.value)}
              />
            </Field>
          </>
        )}

        {step === "chip" && (
          <>
            <h1 className="text-3xl">Chip in for the {short}?</h1>
            <div className="flex items-center gap-md">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-stock bg-(--theme-soft)">
                <GiftArt gift={party.gift} size={34} />
              </span>
              <p className="font-bold">
                <span className="num text-accent">{usdShort(state.raisedCents)}</span> of ${goalUsd(party)}. Optional, and other guests
                never see your amount.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-xs">
              {AMOUNTS.map((a) => (
                <button key={a} type="button" className="choice" aria-pressed={amount === a} onClick={() => setAmount(a)}>
                  {a === "other" ? "Other" : `$${a}`}
                </button>
              ))}
            </div>
            {amount === "other" && (
              <Field id="other-amount" label={`Your amount, from $${MIN_OTHER}`}>
                <input
                  id="other-amount"
                  className="input"
                  type="number"
                  inputMode="decimal"
                  min={MIN_OTHER}
                  max={500}
                  value={otherAmount}
                  onChange={(e) => setOtherAmount(e.target.value)}
                  aria-invalid={otherInvalid}
                />
              </Field>
            )}
            <div className="flex flex-col gap-xs">
              <span className="text-sm font-extrabold">A tip for Chip In</span>
              <div className="grid grid-cols-3 gap-xs">
                {TIPS.map((t) => (
                  <button key={t} type="button" className="choice min-h-11" aria-pressed={tip === t} onClick={() => setTip(t)}>
                    {t === 0 ? "No tip" : `${t}%`}
                  </button>
                ))}
              </div>
              <label htmlFor="fee" className="flex min-h-11 cursor-pointer items-center gap-sm text-sm font-semibold">
                <input id="fee" type="checkbox" checked={cover} onChange={() => setCover((c) => !c)} className="m-0 size-[22px] shrink-0 accent-accent" />
                <span>
                  Cover the card fee ({usd(fee)}) so {party.honoree} gets it all
                </span>
              </label>
            </div>
          </>
        )}
      </div>

      <Footer
        error={error}
        hint={idx === 0 && mode === "yes" ? "Four quick questions, about 30 seconds" : idx > 0 ? "Your answers are sent at the end" : undefined}
      >
        {step === "chip" ? (
          <>
            <button
              type="button"
              disabled={busy !== null || otherInvalid || gift === 0}
              onClick={() => send("test")}
              className="btn btn--primary btn--block min-h-14 text-lg"
            >
              {busy === "test" ? "Paying…" : `Test payment ${usd(total)}`}
            </button>
            <button type="button" disabled={busy !== null || otherInvalid} onClick={() => send("external")} className="btn btn--block">
              {busy === "external" ? "Saving…" : `I sent ${usd(gift)} by Venmo or Zelle`}
            </button>
            <button type="button" disabled={busy !== null} onClick={() => send("later")} className="link-btn">
              {busy === "later" ? "Sending…" : rsvp ? "Maybe later, just send my answer" : "Maybe later"}
            </button>
            <span className="text-center text-xs font-semibold text-ink-2">Demo mode: no card is charged</span>
          </>
        ) : (
          <>
            <button type="button" onClick={next} className="btn btn--primary btn--block min-h-14 text-lg">
              Next
            </button>
            {(step === "who" || step === "allergies") && (
              <button type="button" onClick={() => go(order[idx + 1])} className="link-btn">
                Skip this
              </button>
            )}
          </>
        )}
      </Footer>
    </Screen>
  );
}

function Done({
  party,
  state,
  name,
  coming,
  summary,
  chipLater,
  onChip,
  onRestart,
  short,
}: {
  party: PartyInfo;
  state: PartyState;
  name: string;
  coming: boolean;
  summary: string[][];
  chipLater: boolean;
  onChip: () => void;
  onRestart: () => void;
  short: string;
}) {
  const urls = partyUrls(party.id);
  return (
    <Screen theme={party.theme} className="overflow-hidden">
      {BURST.map(([l, t], i) => (
        <span key={i} aria-hidden="true" className="pixel confetti" style={confettiStyle(i, l, t, 45)} />
      ))}
      <div className="relative flex flex-col items-center gap-md px-md pt-xl text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG темы из public */}
        <img src={mascotSrc(party.theme)} alt="" className="h-[182px] w-[260px] object-contain" />
        <h1 className="max-w-[14ch] text-3xl">{coming ? `See you on ${dayLong(party.date)}, ${name}!` : `Thanks, ${name}!`}</h1>
        <p className="text-ink-2">
          {state.coming} coming so far, {usdShort(state.raisedCents)} raised for the {short}.
        </p>
      </div>
      <div className="relative flex flex-col gap-sm px-md pt-lg">
        <dl className="invite-block m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-md gap-y-xs px-lg py-md">
          {summary.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-ink-2">{k}</dt>
              <dd className="m-0 font-extrabold break-words">{v}</dd>
            </div>
          ))}
        </dl>
        {coming && (
          <a className="btn btn--primary btn--block" href={calendarUrl(party)} target="_blank" rel="noopener noreferrer">
            Add to calendar
          </a>
        )}
        {chipLater && (
          <button type="button" className="btn btn--block" onClick={onChip}>
            Chip in for the {short}
          </button>
        )}
        <Link className="btn btn--block" href={urls.album}>
          Party Album
        </Link>
        <button type="button" onClick={onRestart} className="link-btn">
          Change my answer
        </button>
      </div>
      <Link
        href="/party/new"
        className="paper torn-top relative mt-auto flex items-center justify-between gap-md bg-paper-2 px-md pt-xl pb-lg text-ink no-underline hover:text-ink max-sm:mt-xl"
      >
        <span className="flex flex-col">
          <span className="font-display text-lg font-semibold tracking-[-0.02em]">Got an event coming up?</span>
          <span className="text-sm text-ink-2">Make a free invite in 2 minutes</span>
        </span>
        <span aria-hidden="true" className="text-2xl font-extrabold">
          →
        </span>
      </Link>
    </Screen>
  );
}

function Screen({ theme, className, children }: { theme: PartyInfo["theme"]; className?: string; children: ReactNode }) {
  return (
    <div data-invite-theme={theme} className={cn("invite-page relative flex min-h-dvh flex-col text-ink", className)}>
      {children}
    </div>
  );
}

function Footer({ error, hint, children }: { error: string; hint?: string; children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-(--z-sticky) mt-auto flex flex-col gap-xs border-t-2 border-ink bg-paper px-md pt-sm pb-lg">
      {error ? (
        <p role="alert" className="text-center text-sm font-bold text-error">
          {error}
        </p>
      ) : (
        hint && <p className="label text-center">{hint}</p>
      )}
      {children}
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

function Counter({ label, value, onChange, min }: { label: string; value: number; onChange: (n: number) => void; min: number }) {
  return (
    <div className="flex items-center justify-between border-b border-rule py-sm">
      <span className="text-lg font-extrabold">{label}</span>
      <div className="flex items-center gap-md">
        <button
          type="button"
          className="choice w-12 p-0"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <span className="figure min-w-6 text-center text-2xl" role="status" aria-label={`${value} ${label.toLowerCase()}`}>
          {value}
        </span>
        <button
          type="button"
          className="choice w-12 p-0"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={value >= 10}
          onClick={() => onChange(Math.min(10, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
