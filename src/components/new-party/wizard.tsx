"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BikeIcon, PaletteIcon, RefreshIcon, TelescopeIcon } from "@/components/icons";
import { PhonePreview, ThemePicker } from "@/components/invite/theme-picker";
import { Paywall } from "@/components/paywall";
import { Wordmark, cn } from "@/components/shell";
import { LangSwitch, useI18n } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/dict";
import { themeName, themeOf, type ThemeId } from "@/lib/invite-themes";
import { OCCASIONS, partyUrls, type Occasion } from "@/lib/party";

// Порядок мастера: что празднуем → когда и где → дизайн приглашения → подарок. После создания — окно «поделиться».
type Step = 1 | 2 | 3 | 4;

const IDEAS: Array<{ title: string; price: number; why: MessageKey; tile: string; Icon: typeof BikeIcon }> = [
  { title: "A 20-inch bike", price: 300, why: "w.why1", tile: "var(--color-signal)", Icon: BikeIcon },
  { title: "A first telescope", price: 249, why: "w.why2", tile: "var(--color-paper-3)", Icon: TelescopeIcon },
  { title: "Art set and easel", price: 180, why: "w.why3", tile: "var(--color-mint)", Icon: PaletteIcon },
];

const FREE_GUESTS = 15;

// Дата по умолчанию — через две недели, сбор денег — за два дня до события (считается на клиенте по клику, без расхождения с SSR)
function isoPlusDays(days: number, from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function NewPartyWizard() {
  const router = useRouter();
  const { t, err, lit, title, occasion: occLabel, dayShort, md, mdy, time: fmtTime } = useI18n();
  const [step, setStep] = useState<Step>(1);
  const [occasion, setOccasion] = useState<Occasion>("Birthday");
  const [honoree, setHonoree] = useState("");
  const [age, setAge] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("14:00");
  const [place, setPlace] = useState("");
  const [placeNote, setPlaceNote] = useState("");
  const [invited, setInvited] = useState(15);
  const [deadline, setDeadline] = useState("");
  const [likes, setLikes] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [picked, setPicked] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("classic");

  const name = honoree.trim() || t("w.guestOfHonor");
  const isBirthday = occasion === "Birthday";
  const eventName = title({ occasion, honoree: name, age: null });
  const budget = invited * 20;
  const goalTitle = manual ? manualTitle || t("w.yourGift") : lit(IDEAS[picked].title);
  const goalPrice = manual ? Number(manualPrice) || 0 : IDEAS[picked].price;

  const toEvent = () => {
    if (!honoree.trim()) {
      setError(t("w.errName"));
      return;
    }
    setError("");
    if (!date) {
      setDate(isoPlusDays(14));
      setDeadline(isoPlusDays(12));
    }
    setStep(2);
  };

  const toDesign = () => {
    if (!honoree.trim()) return toEvent();
    if (!place.trim() || !date || !deadline) {
      setStep(2);
      setError(t("w.errEvent"));
      return;
    }
    setError("");
    if (invited > FREE_GUESTS && !isPro) setPaywall(true);
    setStep(3);
  };

  const toGift = () => {
    if (!honoree.trim() || !place.trim() || !date || !deadline) return toDesign();
    setError("");
    setStep(4);
  };

  const goTo = (n: Step) => (n === 4 ? toGift() : n === 3 ? toDesign() : n === 2 ? toEvent() : setStep(n));

  const create = async () => {
    if (manual && (!manualTitle.trim() || goalPrice < 5)) {
      setError(t("w.errGift"));
      return;
    }
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          honoree: honoree.trim(),
          age: isBirthday ? Number(age) || null : null,
          gift: manual ? goalTitle : IDEAS[picked].title,
          goal: goalPrice,
          date,
          time,
          place: place.trim(),
          placeNote: placeNote.trim(),
          deadline,
          invited,
          isPro: isPro || themeOf(theme).pro,
          theme,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error ? err(data.error) : t("w.errCreate"));
        setCreating(false);
        return;
      }
      router.push(`${partyUrls(data.id).dashboard}?share=1`);
    } catch {
      setError(err("No connection, try again"));
      setCreating(false);
    }
  };

  const suggestAgain = () => {
    setThinking(true);
    setTimeout(() => setThinking(false), 900);
  };

  const steps: Array<[Step, string]> = [
    [1, name],
    [2, t("w.stepEvent")],
    [3, t("w.stepDesign")],
    [4, t("w.stepGift")],
  ];

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <header className="wrap flex flex-wrap items-center justify-between gap-md py-md">
        <Wordmark />
        <LangSwitch />
        <ol aria-label={t("w.steps")} className="m-0 flex list-none gap-xs p-0 text-sm font-bold">
          {steps.map(([n, label]) => (
            <li key={n}>
              <button
                type="button"
                onClick={() => goTo(n)}
                aria-current={n === step ? "step" : undefined}
                className={cn(
                  "flex min-h-9 items-center gap-xs rounded-pill border-0 px-sm py-xs font-bold",
                  n === step ? "bg-ink text-paper" : n < step ? "bg-mint text-mint-ink" : "bg-paper-3 text-ink-2",
                )}
              >
                {n} {label}
              </button>
            </li>
          ))}
        </ol>
      </header>

      <div className="wrap flex flex-wrap items-start gap-2xl pt-xl pb-3xl">
        <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-xl">
          {step === 1 && (
            <>
              <Heading title={t("w.h1")} lead={t("w.l1")} />
              <div role="group" aria-label={t("w.occ")} className="flex flex-wrap gap-xs">
                {OCCASIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={occasion === o}
                    onClick={() => setOccasion(o)}
                    className="choice px-md"
                  >
                    {occLabel(o)}
                  </button>
                ))}
              </div>
              <div className={cn("grid gap-md", isBirthday && "sm:grid-cols-[2fr_1fr]")}>
                <Field id="honoree" label={t("w.who")}>
                  <input
                    id="honoree"
                    className="input"
                    maxLength={40}
                    placeholder={t("w.whoP")}
                    value={honoree}
                    onChange={(e) => setHonoree(e.target.value)}
                  />
                </Field>
                {isBirthday && (
                  <Field id="age" label={t("w.turning")}>
                    <input id="age" className="input" type="number" min={1} max={120} placeholder="7" value={age} onChange={(e) => setAge(e.target.value)} />
                  </Field>
                )}
              </div>
              <button type="button" onClick={toEvent} className="btn btn--primary self-start">
                {t("w.next1")}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <Heading title={t("w.h2")} lead={t("w.l2")} />
              <div className="grid gap-md sm:grid-cols-2">
                <Field id="date" label={t("w.date")}>
                  <input id="date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
                <Field id="time" label={t("w.time")}>
                  <input id="time" className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </Field>
                <Field id="place" label={t("w.place")} wide>
                  <input
                    id="place"
                    className="input"
                    maxLength={80}
                    placeholder={t("w.placeP")}
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                  />
                </Field>
                <Field id="place-note" label={t("w.note")} wide>
                  <input
                    id="place-note"
                    className="input"
                    maxLength={80}
                    placeholder={t("w.noteP")}
                    value={placeNote}
                    onChange={(e) => setPlaceNote(e.target.value)}
                  />
                </Field>
                <Field id="invited" label={t("w.invited")}>
                  <input
                    id="invited"
                    className="input"
                    type="number"
                    min={1}
                    max={200}
                    value={invited}
                    onChange={(e) => setInvited(Math.min(200, Math.max(1, Number(e.target.value) || 1)))}
                  />
                </Field>
                <Field id="deadline" label={t("w.deadline")}>
                  <input id="deadline" className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </Field>
              </div>
              {invited > FREE_GUESTS && !isPro && (
                <p className="label">{t("w.free", { n: FREE_GUESTS })}</p>
              )}
              <button type="button" onClick={toDesign} className="btn btn--primary self-start">
                {t("w.nextDesign")}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <Heading title={t("w.hDesign")} lead={t("w.lDesign")} />
              <ThemePicker value={theme} onChange={setTheme} isPro={isPro} />
              {themeOf(theme).pro && !isPro && <p className="label">{t("w.proTheme", { name: t(themeName(theme)) })}</p>}
              <button type="button" onClick={toGift} className="btn btn--primary self-start">
                {t("w.next2")}
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <Heading
                title={t("w.h3", { name })}
                lead={t("w.l3", { n: invited, budget })}
                narrow
              />

              <div className="flex flex-col gap-sm">
                <div className="field">
                  <label htmlFor="likes">{t("w.likes", { name })}</label>
                  <textarea
                    id="likes"
                    className="input"
                    rows={2}
                    placeholder={t("w.likesP")}
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-end gap-sm">
                  <button type="button" onClick={suggestAgain} disabled={thinking} className="btn btn--small">
                    <RefreshIcon size={18} className={thinking ? "animate-spin" : undefined} />
                    {thinking ? t("w.thinking") : t("w.newIdeas")}
                  </button>
                </div>
              </div>

              <div
                role="radiogroup"
                aria-label={t("w.ideas")}
                aria-busy={thinking}
                className={cn("grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-md transition-opacity", thinking && "opacity-40")}
              >
                {IDEAS.map((idea, idx) => {
                  const on = !manual && idx === picked;
                  return (
                    <button
                      key={idea.title}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        setManual(false);
                        setPicked(idx);
                      }}
                      className="flex min-h-[300px] cursor-pointer flex-col items-start gap-sm rounded-card border-0 bg-card p-lg text-left text-ink transition-[translate,box-shadow] duration-(--dur-micro) ease-(--ease-snap)"
                      style={
                        on
                          ? { boxShadow: "inset 0 0 0 2.5px var(--color-ink), 0 6px 0 0 var(--color-accent)", translate: "0 -2px" }
                          : { boxShadow: "inset 0 0 0 1.5px var(--color-edge), 0 4px 0 0 var(--color-edge)" }
                      }
                    >
                      <span
                        className="flex size-[60px] items-center justify-center rounded-stock text-ink"
                        style={{ backgroundColor: idea.tile }}
                      >
                        <idea.Icon size={34} />
                      </span>
                      <span className="font-display text-xl leading-[1.1] font-semibold tracking-[-0.02em]">{lit(idea.title)}</span>
                      <span className="text-md leading-normal text-ink-2">{t(idea.why)}</span>
                      <span className="num mt-auto font-display text-2xl font-semibold">${idea.price}</span>
                    </button>
                  );
                })}
              </div>

              {manual ? (
                <div className="grid gap-md sm:grid-cols-[2fr_1fr]">
                  <Field id="mtitle" label={t("w.mGift")}>
                    <input
                      id="mtitle"
                      className="input"
                      placeholder={t("w.mGiftP")}
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                    />
                  </Field>
                  <Field id="mprice" label={t("w.mPrice")}>
                    <input
                      id="mprice"
                      className="input"
                      type="number"
                      min={5}
                      placeholder="120"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                    />
                  </Field>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setManual(true)}
                  className="flex min-h-11 items-center self-start border-0 bg-transparent p-0 font-extrabold text-accent-deep underline decoration-[1.5px] underline-offset-[0.18em]"
                >
                  {t("w.know")}
                </button>
              )}
            </>
          )}
        </div>

        {step === 3 ? (
          <aside className="flex min-w-0 flex-[1_1_320px] flex-col items-center gap-md">
            <PhonePreview
              invited={invited}
              party={{
                occasion,
                honoree: name,
                age: isBirthday ? Number(age) || null : null,
                date,
                time,
                place,
                placeNote,
                deadline,
                gift: goalTitle,
                goalCents: Math.max(100, goalPrice * 100),
                theme,
              }}
            />
            {error && (
              <p role="alert" className="text-sm font-bold text-error">
                {error}
              </p>
            )}
          </aside>
        ) : (
        <aside className="sheet min-w-0 flex-[1_1_320px]" style={{ rotate: "1deg" }}>
          <div className="paper torn-note flex flex-col gap-md bg-signal-soft px-lg py-xl">
            <h2 className="text-2xl">{isBirthday && age ? title({ occasion, honoree: name, age: Number(age) }) : eventName}</h2>
            <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-md gap-y-xs text-md">
              <dt className="text-ink-2">{t("w.sideWhen")}</dt>
              <dd className="m-0 font-extrabold">{date ? `${dayShort(date)} ${md(date)}, ${fmtTime(time)}` : "—"}</dd>
              <dt className="text-ink-2">{t("w.sideWhere")}</dt>
              <dd className="m-0 font-extrabold">{place || "—"}</dd>
              <dt className="text-ink-2">{t("w.sideInvited")}</dt>
              <dd className="m-0 font-extrabold">{t("w.sideGuests", { n: invited })}</dd>
              <dt className="text-ink-2">{t("w.sideUntil")}</dt>
              <dd className="m-0 font-extrabold">{mdy(deadline)}</dd>
              <dt className="text-ink-2">{t("w.sideDesign")}</dt>
              <dd className="m-0 font-extrabold">{t(themeName(theme))}</dd>
            </dl>
            <div className="flex flex-col gap-2xs border-t-2 border-dashed border-signal-deep pt-md">
              <span className="font-extrabold">{step === 4 ? goalTitle : t("w.giftNext")}</span>
              <span className="num font-display text-3xl leading-[1.05] font-semibold tracking-[-0.03em]">
                {step === 4 ? `$${goalPrice}` : "—"}
              </span>
              <span className="label text-ink-2">{t("w.goalNote")}</span>
            </div>
            {error && (
              <p role="alert" className="text-sm font-bold text-error">
                {error}
              </p>
            )}
            {step === 4 ? (
              <button type="button" onClick={create} disabled={creating} className="btn btn--primary btn--block">
                {creating ? t("w.creating") : t("w.create")}
              </button>
            ) : (
              <button type="button" onClick={() => goTo((step + 1) as Step)} className="btn btn--primary btn--block">
                {t("w.cont")}
              </button>
            )}
          </div>
        </aside>
        )}
      </div>

      <Paywall
        open={paywall}
        invited={invited}
        honoree={name}
        onUpgrade={() => {
          setIsPro(true);
          setPaywall(false);
        }}
        onClose={() => {
          setPaywall(false);
          if (!isPro) setInvited((n) => Math.min(n, FREE_GUESTS));
        }}
      />
    </div>
  );
}

function Heading({ title, lead, narrow }: { title: string; lead: string; narrow?: boolean }) {
  return (
    <div className="flex flex-col gap-md">
      <h1 className={cn("text-display-s", narrow && "max-w-[16ch]")}>{title}</h1>
      <p className="lead">{lead}</p>
    </div>
  );
}

function Field({ id, label, wide, children }: { id: string; label: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={cn("field", wide && "sm:col-span-2")}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
