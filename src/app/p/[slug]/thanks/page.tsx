import Link from "next/link";
import { Suspense } from "react";
import { LiveProgress } from "@/components/guest/live-progress";
import { Note, PhoneColumn } from "@/components/shell";
import { PARTY, ROUTES, usd } from "@/lib/demo";

export function generateStaticParams() {
  return [{ slug: PARTY.slug }];
}

type How = "card" | "external" | "rsvp";

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default function ThanksPage(props: PageProps<"/p/[slug]/thanks">) {
  const slug = PARTY.slug;
  return (
    <Suspense fallback={<ThanksView slug={slug} kid="Liam" paid={20} how="card" />}>
      <ThanksFromQuery slug={slug} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function ThanksFromQuery({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = await searchParams;
  const how = one(q.how);
  return (
    <ThanksView
      slug={slug}
      kid={(one(q.kid) || "Liam").slice(0, 40)}
      paid={Number(one(q.paid) ?? 20) || 0}
      how={how === "external" || how === "rsvp" ? how : "card"}
    />
  );
}

function ThanksView({ slug, kid, paid, how }: { slug: string; kid: string; paid: number; how: How }) {
  const receipt =
    how === "card" && paid > 0
      ? `Your ${usd(paid)} receipt is in your email.`
      : how === "external"
        ? "We marked your family in as paid by Venmo or Zelle."
        : "Thanks for letting us know.";

  return (
    <PhoneColumn>
      <div className="flex items-center justify-between p-md">
        <span className="font-display text-lg font-semibold tracking-[-0.03em]">class gift</span>
        <Link href={`/p/${slug}`} className="flex min-h-11 items-center text-sm font-bold">
          Party details
        </Link>
      </div>

      <div className="flex flex-col gap-xs px-md pt-xs">
        <h1 className="text-3xl">See you Saturday, {kid}</h1>
        <p className="text-ink-2">
          {PARTY.date} at {PARTY.time}, {PARTY.place}. {receipt}
        </p>
      </div>

      <div className="relative px-lg pt-xl">
        <Note bg="var(--color-signal-soft)" tilt={-2} className="flex flex-col gap-xs px-lg py-xl">
          <span className="text-sm font-extrabold">From {PARTY.child}</span>
          <p className="font-display text-xl leading-[1.3] font-medium tracking-[-0.015em]">
            “Thank you for helping with my bike. I’m going to ride it to school every day.”
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

      <LiveProgress />

      <div className="paper torn-top on-accent mt-auto flex flex-col gap-sm bg-accent px-md pt-2xl pb-lg text-accent-ink max-sm:mt-2xl">
        <h2 className="text-2xl">When is {kid}’s birthday?</h2>
        <p>The same page for the party takes about two minutes. Free for up to 15 guests.</p>
        <Link className="btn btn--signal btn--block mt-xs" href={ROUTES.newParty}>
          Start {kid}’s gift page
        </Link>
      </div>
    </PhoneColumn>
  );
}
