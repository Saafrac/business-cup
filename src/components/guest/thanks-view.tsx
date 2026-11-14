"use client";

import Link from "next/link";
import { LiveProgress } from "@/components/guest/live-progress";
import { Note, PhoneColumn } from "@/components/shell";
import { ROUTES, usd } from "@/lib/demo";
import { LangSwitch, useI18n } from "@/lib/i18n";
import { partyUrls, type PartyInfo } from "@/lib/party";
import type { PartyState } from "@/lib/party-state";

export type How = "card" | "external" | "rsvp";

export function ThanksView({ party, state, guest, paid, how }: { party: PartyInfo; state: PartyState; guest: string; paid: number; how: How }) {
  const { t, dayLong, md, time, lit, giftShort } = useI18n();
  const urls = partyUrls(party.id);
  const name = guest || t("th.friend");
  const receipt =
    how === "card" && paid > 0
      ? t("th.rcptCard", { amount: usd(paid) })
      : how === "external"
        ? t("th.rcptExt")
        : t("th.rcptRsvp");

  return (
    <PhoneColumn>
      <div className="flex items-center justify-between gap-xs p-md">
        <span className="font-display text-lg font-semibold tracking-[-0.03em]">chip in</span>
        <div className="flex items-center gap-xs">
          <Link href={urls.guest} className="flex min-h-11 items-center text-sm font-bold">
            {t("th.details")}
          </Link>
          <LangSwitch />
        </div>
      </div>

      <div className="flex flex-col gap-xs px-md pt-xs">
        <h1 className="text-3xl">{t("th.seeYou", { day: dayLong(party.date), guest: name })}</h1>
        <p className="text-ink-2">
          {t("th.when", { date: md(party.date), time: time(party.time), place: lit(party.place) })} {receipt}
        </p>
      </div>

      <div className="relative px-lg pt-xl">
        <Note bg="var(--color-signal-soft)" tilt={-2} className="flex flex-col gap-xs px-lg py-xl">
          <span className="text-sm font-extrabold">{t("th.from", { name: party.honoree })}</span>
          <p className="font-display text-xl leading-[1.3] font-medium tracking-[-0.015em]">
            {t("th.quote", { gift: giftShort(party.gift) })}
          </p>
        </Note>
        {how !== "rsvp" && (
          <span
            role="status"
            className="pop figure absolute top-md right-md rounded-tag border-[3px] border-accent bg-card px-sm py-2xs text-lg text-accent"
            style={{ rotate: "9deg", animationDelay: "300ms" }}
          >
            {t("th.paid")}
          </span>
        )}
      </div>

      <LiveProgress party={party} initial={state} />

      <div className="px-md pt-xl">
        <Link
          href={urls.album}
          className="flex items-center justify-between gap-md rounded-card border-[1.5px] border-edge bg-card p-md text-ink no-underline hover:text-ink"
        >
          <span className="flex flex-col">
            <span className="font-extrabold">{t("th.photosT")}</span>
            <span className="text-sm text-ink-2">{t("th.photosS")}</span>
          </span>
          <span aria-hidden="true" className="text-xl font-extrabold text-accent">
            →
          </span>
        </Link>
      </div>

      <div className="paper torn-top on-accent mt-auto flex flex-col gap-sm bg-accent px-md pt-2xl pb-lg text-accent-ink max-sm:mt-2xl">
        <h2 className="text-2xl">{t("th.next", { guest: name })}</h2>
        <p>{t("th.nextP")}</p>
        <Link className="btn btn--signal btn--block mt-xs" href={ROUTES.newParty}>
          {t("th.nextBtn")}
        </Link>
      </div>
    </PhoneColumn>
  );
}
