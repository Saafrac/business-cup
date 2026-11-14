import Link from "next/link";
import { Suspense } from "react";
import { LiveProgress } from "@/components/guest/live-progress";
import { PageLoading } from "@/components/loading";
import { Note, PhoneColumn } from "@/components/shell";
import { ROUTES, usd } from "@/lib/demo";
import { dayLong, giftShort, mmdd, partyUrls, time12, type PartyInfo } from "@/lib/party";
import type { PartyState } from "@/lib/party-state";
import { loadPartyWithState } from "@/lib/server/load";

type How = "card" | "external" | "rsvp";

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default function ThanksPage(props: PageProps<"/p/[slug]/thanks">) {
  return (
    <Suspense fallback={<PageLoading phone />}>
      <Load params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Load({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, q] = await Promise.all([params, searchParams]);
  const { party, state } = await loadPartyWithState(slug);
  const how = one(q.how);
  return (
    <ThanksView
      party={party}
      state={state}
      guest={(one(q.guest) || "friend").slice(0, 40)}
      paid={Number(one(q.paid) ?? 0) || 0}
      how={how === "external" || how === "rsvp" ? how : "card"}
    />
  );
}

function ThanksView({ party, state, guest, paid, how }: { party: PartyInfo; state: PartyState; guest: string; paid: number; how: How }) {
  const urls = partyUrls(party.id);
  const receipt =
    how === "card" && paid > 0
      ? `Your ${usd(paid)} receipt is in your email.`
      : how === "external"
        ? "We marked you as paid by Venmo or Zelle."
        : "Thanks for letting us know.";

  return (
    <PhoneColumn>
      <div className="flex items-center justify-between p-md">
        <span className="font-display text-lg font-semibold tracking-[-0.03em]">chip in</span>
        <Link href={urls.guest} className="flex min-h-11 items-center text-sm font-bold">
          Event details
        </Link>
      </div>

      <div className="flex flex-col gap-xs px-md pt-xs">
        <h1 className="text-3xl">
          See you {dayLong(party.date)}, {guest}
        </h1>
        <p className="text-ink-2">
          {mmdd(party.date)} at {time12(party.time)}, {party.place}. {receipt}
        </p>
      </div>

      <div className="relative px-lg pt-xl">
        <Note bg="var(--color-signal-soft)" tilt={-2} className="flex flex-col gap-xs px-lg py-xl">
          <span className="text-sm font-extrabold">From {party.honoree}</span>
          <p className="font-display text-xl leading-[1.3] font-medium tracking-[-0.015em]">
            “Thank you for helping with my {giftShort(party.gift)}. It means a lot.”
          </p>
        </Note>
        {how !== "rsvp" && (
          <span
            role="status"
            className="pop figure absolute top-md right-md rounded-tag border-[3px] border-accent bg-card px-sm py-2xs text-lg text-accent"
            style={{ rotate: "9deg", animationDelay: "300ms" }}
          >
            PAID
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
            <span className="font-extrabold">Photos from the event</span>
            <span className="text-sm text-ink-2">See them and add yours, no account needed</span>
          </span>
          <span aria-hidden="true" className="text-xl font-extrabold text-accent">
            →
          </span>
        </Link>
      </div>

      <div className="paper torn-top on-accent mt-auto flex flex-col gap-sm bg-accent px-md pt-2xl pb-lg text-accent-ink max-sm:mt-2xl">
        <h2 className="text-2xl">Got an event coming up, {guest}?</h2>
        <p>The same page for your event takes about two minutes. Free for up to 15 guests.</p>
        <Link className="btn btn--signal btn--block mt-xs" href={ROUTES.newParty}>
          Create your invite
        </Link>
      </div>
    </PhoneColumn>
  );
}
