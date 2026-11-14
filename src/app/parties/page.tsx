import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageLoading } from "@/components/loading";
import { AppHeader, Note } from "@/components/shell";
import { ROUTES } from "@/lib/demo";
import { dayShort, goalUsd, isDemo, mmdd, partyTitle, partyUrls, time12 } from "@/lib/party";
import { recentParties } from "@/lib/server/parties";

export const metadata = { title: "Parties · Chip In" };

export default function PartiesPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PartiesList />
    </Suspense>
  );
}

/** Все события: в MVP открыты всем, без входа */
async function PartiesList() {
  await connection();
  const parties = await recentParties();

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <AppHeader active="parties" avatar="S" avatarLabel="Organizer" avatarClass="bg-signal-soft" />

      <div className="wrap flex flex-col gap-xl pt-md pb-3xl">
        <div className="flex flex-wrap items-end justify-between gap-lg border-b-2 border-ink pb-md">
          <div className="flex flex-col gap-xs">
            <h1 className="text-display-s">Parties</h1>
            <p className="text-ink-2">Every gift page on Chip In. Open one to see guests, the total and the album.</p>
          </div>
          <Link className="btn btn--primary" href={ROUTES.newParty}>
            Create an invite
          </Link>
        </div>

        <ul role="list" className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-lg p-0">
          {parties.map((p, i) => {
            const urls = partyUrls(p.id);
            return (
              <li key={p.id}>
                <Note bg={i % 3 === 0 ? "var(--color-signal-soft)" : i % 3 === 1 ? "var(--color-card)" : "var(--color-mint)"} tilt={i % 2 ? 0.6 : -0.6} className="flex h-full flex-col gap-sm p-lg">
                  <div className="flex items-start justify-between gap-sm">
                    <h2 className="text-xl">{partyTitle(p)}</h2>
                    {isDemo(p.id) && <span className="tag shrink-0 bg-accent text-accent-ink">Demo</span>}
                  </div>
                  <p className="text-sm font-bold text-ink-2">
                    {dayShort(p.date)} {mmdd(p.date)}, {time12(p.time)} · {p.place}
                  </p>
                  <p className="text-sm">
                    {p.gift} · goal <span className="num font-extrabold">${goalUsd(p)}</span>
                  </p>
                  <div className="mt-auto flex flex-wrap gap-xs pt-xs">
                    <Link className="btn btn--small btn--primary" href={urls.dashboard}>
                      Dashboard
                    </Link>
                    <Link className="btn btn--small" href={urls.guest}>
                      Guest page
                    </Link>
                  </div>
                </Note>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
