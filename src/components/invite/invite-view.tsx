"use client";

import Link from "next/link";
import { useSyncExternalStore, type CSSProperties } from "react";
import { BikeIcon, CameraIcon, GiftIcon, PaletteIcon, TelescopeIcon } from "@/components/icons";
import { Bar, cn } from "@/components/shell";
import { coverSrc, type ThemeId } from "@/lib/invite-themes";
import {
  calendarUrl,
  dayLong,
  directionsUrl,
  giftShort,
  goalUsd,
  inviteTitle,
  mmdd,
  time12,
  type PartyInfo,
} from "@/lib/party";
import { usdShort } from "@/lib/party-state";

// Приглашение гостя (макет «G1 · Invite»): обложка темы, обратный отсчёт, когда и где, подарок, RSVP, альбом.
// Тот же компонент — превью в мастере и в настройке дизайна (без onAnswer кнопки не активны).

export type InviteParty = Pick<
  PartyInfo,
  "occasion" | "honoree" | "age" | "date" | "time" | "place" | "placeNote" | "deadline" | "gift" | "goalCents" | "theme"
>;

export type Answer = "yes" | "no" | "chip";

const SPOTS: Array<[number, number]> = [
  [8, 22], [20, 60], [34, 14], [52, 40], [66, 18], [80, 52], [90, 24],
  [14, 78], [44, 70], [72, 76], [96, 70], [28, 34], [58, 8], [86, 8],
];
const CONFETTI_COLORS = ["var(--color-accent)", "var(--theme-accent)", "var(--color-signal)"];

export function confettiStyle(i: number, left: number, top: number, delayStep = 70): CSSProperties {
  const size = 8 + (i % 3) * 3;
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: size,
    height: size,
    animationDelay: `${i * delayStep}ms`,
    backgroundColor: CONFETTI_COLORS[i % 3],
  };
}

export function GiftArt({ gift, size = 40 }: { gift: string; size?: number }) {
  const g = giftShort(gift);
  const Icon = g === "bike" ? BikeIcon : g === "telescope" ? TelescopeIcon : g === "art set" ? PaletteIcon : GiftIcon;
  return <Icon size={size} strokeWidth={1.6} />;
}

/** Картинка для экранов шагов: у динозавров свой маскот, у остальных — обложка темы */
export const mascotSrc = (theme: ThemeId) => (theme === "dino" ? "/invite/dino-mascot.svg" : coverSrc(theme));

// Время для обратного отсчёта: только в браузере (на сервере null), обновляется раз в минуту
const subscribeMinute = (cb: () => void) => {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
};
const useNowMinute = () =>
  useSyncExternalStore(
    subscribeMinute,
    () => Math.floor(Date.now() / 60_000) * 60_000,
    () => null,
  );

function Countdown({ date, time }: { date: string; time: string }) {
  const now = useNowMinute();
  const at = new Date(`${date}T${time || "00:00"}:00`).getTime();
  if (now === null || Number.isNaN(at) || at <= now) return null;
  const hoursLeft = Math.floor((at - now) / 3_600_000);
  const days = Math.floor(hoursLeft / 24);
  const hours = hoursLeft % 24;
  return (
    <section aria-label="Countdown" className="invite-block flex-row items-baseline justify-center gap-lg py-md">
      {days > 0 && (
        <p className="font-extrabold whitespace-nowrap">
          <span className="figure text-3xl">{days}</span> {days === 1 ? "day" : "days"}
        </p>
      )}
      <p className="font-extrabold whitespace-nowrap">
        <span className="figure text-3xl">{hours}</span> {hours === 1 ? "hour" : "hours"}
      </p>
      <p className="font-extrabold whitespace-nowrap text-ink-2">to go</p>
    </section>
  );
}

function CalendarGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function PinGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

export function InviteView({
  party,
  raisedCents,
  contributors,
  invited,
  albumHref,
  onAnswer,
  className,
}: {
  party: InviteParty;
  raisedCents: number;
  contributors: number;
  invited: number;
  albumHref?: string;
  /** Нет обработчика — превью: кнопки ответа не нажимаются */
  onAnswer?: (a: Answer) => void;
  className?: string;
}) {
  const goal = goalUsd(party);
  const preview = !onAnswer;
  const answer = (a: Answer) => () => onAnswer?.(a);

  return (
    <div data-invite-theme={party.theme} className={cn("invite-page flex flex-col text-ink", className)}>
      <header className="invite-cover paper torn-bottom relative flex flex-col gap-md overflow-hidden px-md pt-md pb-2xl">
        {SPOTS.map(([l, t], i) => (
          <span key={i} aria-hidden="true" className="pixel confetti" style={confettiStyle(i, l, t)} />
        ))}
        <span className="relative font-display text-md font-semibold tracking-[-0.03em]">chip in</span>
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG обложки темы из public, оптимизация не нужна */}
        <img src={coverSrc(party.theme)} alt="" className="relative block h-[240px] w-full object-contain" />
        <h1 className="relative text-[2.5rem] leading-[1.02]">{inviteTitle(party)}</h1>
      </header>

      <div className="flex flex-col gap-md p-md">
        <Countdown date={party.date} time={party.time} />

        <section aria-labelledby="when" className="invite-block">
          <h2 id="when" className="visually-hidden">
            When and where
          </h2>
          <div className="flex items-center gap-md">
            <span className="invite-icon">
              <CalendarGlyph />
            </span>
            <div className="flex flex-col">
              <time dateTime={`${party.date}T${party.time}`} className="font-display text-xl font-semibold tracking-[-0.02em]">
                {dayLong(party.date)}, {mmdd(party.date)}
              </time>
              <span className="font-bold text-ink-2">{time12(party.time)}</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <span className="invite-icon">
              <PinGlyph />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="font-display text-xl font-semibold tracking-[-0.02em] break-words">{party.place || "The place"}</span>
              {party.placeNote && <span className="font-bold text-ink-2">{party.placeNote}</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-xs">
            <a className="btn px-sm" href={calendarUrl(party)} target="_blank" rel="noopener noreferrer" tabIndex={preview ? -1 : undefined}>
              Add to calendar
            </a>
            <a className="btn px-sm" href={directionsUrl(party.place)} target="_blank" rel="noopener noreferrer" tabIndex={preview ? -1 : undefined}>
              Directions
            </a>
          </div>
        </section>

        <section aria-labelledby="gift" className="invite-block">
          <div className="flex items-center gap-md">
            <span className="flex size-[76px] shrink-0 items-center justify-center rounded-stock bg-(--theme-soft)">
              <GiftArt gift={party.gift} />
            </span>
            <div className="flex min-w-0 flex-col">
              <h2 id="gift" className="text-xl">
                The gift: {party.gift}
              </h2>
              <p className="text-sm text-ink-2">One gift from everyone, chipping in is optional</p>
            </div>
          </div>
          <Bar ratio={raisedCents / party.goalCents} label={`${usdShort(raisedCents)} of $${goal} raised`} />
          <p className="font-extrabold whitespace-nowrap">
            <span className="num text-accent">{usdShort(raisedCents)}</span> of ${goal}, {contributors} of {invited} guests chipped in
          </p>
          <button type="button" className="btn btn--block" onClick={answer("chip")} disabled={preview} tabIndex={preview ? -1 : undefined}>
            Chip in
          </button>
        </section>

        <section aria-labelledby="rsvp" className="invite-block bg-paper-2">
          <h2 id="rsvp" className="text-2xl">
            Can you come?
          </h2>
          <div className="grid grid-cols-2 gap-sm">
            <button type="button" className="btn btn--primary min-h-14 px-sm" onClick={answer("yes")} disabled={preview} tabIndex={preview ? -1 : undefined}>
              We’ll be there!
            </button>
            <button type="button" className="btn min-h-14 px-sm" onClick={answer("no")} disabled={preview} tabIndex={preview ? -1 : undefined}>
              Can’t make it
            </button>
          </div>
          <p className="text-sm font-bold text-ink-2">
            Please reply by {dayLong(party.deadline)}, {mmdd(party.deadline)}
          </p>
        </section>

        {albumHref && (
          <Link href={albumHref} className="invite-block flex-row items-center text-ink no-underline hover:text-ink">
            <span className="invite-icon">
              <CameraIcon size={22} />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-lg font-semibold">Party Album</span>
              <span className="text-sm text-ink-2">See the photos and add yours, no account needed</span>
            </span>
          </Link>
        )}
      </div>

      <footer className="mt-auto flex flex-col items-center gap-2xs px-md pt-lg pb-xl text-center">
        <span className="text-sm font-bold text-ink-2">Made with Chip In</span>
        <Link href="/party/new" className="flex min-h-11 items-center font-extrabold" tabIndex={preview ? -1 : undefined}>
          Make your own invite
        </Link>
      </footer>
    </div>
  );
}
