"use client";

import Link from "next/link";
import { AppHeader, Note } from "@/components/shell";
import { ROUTES } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { goalUsd, isDemo, partyUrls, type PartyInfo } from "@/lib/party";

export function PartiesView({ parties }: { parties: PartyInfo[] }) {
  const { t, title, lit, dayShort, md, time } = useI18n();

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <AppHeader active="parties" avatar="S" avatarLabel={t("sh.organizer")} avatarClass="bg-signal-soft" />

      <div className="wrap flex flex-col gap-xl pt-md pb-3xl">
        <div className="flex flex-wrap items-end justify-between gap-lg border-b-2 border-ink pb-md">
          <div className="flex flex-col gap-xs">
            <h1 className="text-display-s">{t("pt.title")}</h1>
            <p className="text-ink-2">{t("pt.lead")}</p>
          </div>
          <Link className="btn btn--primary" href={ROUTES.newParty}>
            {t("pt.start")}
          </Link>
        </div>

        <ul role="list" className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-lg p-0">
          {parties.map((p, i) => {
            const urls = partyUrls(p.id);
            return (
              <li key={p.id}>
                <Note bg={i % 3 === 0 ? "var(--color-signal-soft)" : i % 3 === 1 ? "var(--color-card)" : "var(--color-mint)"} tilt={i % 2 ? 0.6 : -0.6} className="flex h-full flex-col gap-sm p-lg">
                  <div className="flex items-start justify-between gap-sm">
                    <h2 className="text-xl">{title(p)}</h2>
                    {isDemo(p.id) && <span className="tag shrink-0 bg-accent text-accent-ink">{t("demo")}</span>}
                  </div>
                  <p className="text-sm font-bold text-ink-2">
                    {dayShort(p.date)} {md(p.date)}, {time(p.time)} · {lit(p.place)}
                  </p>
                  <p className="text-sm">{t("pt.goal", { gift: lit(p.gift), n: goalUsd(p) })}</p>
                  <div className="mt-auto flex flex-wrap gap-xs pt-xs">
                    <Link className="btn btn--small btn--primary" href={urls.dashboard}>
                      {t("pt.dashboard")}
                    </Link>
                    <Link className="btn btn--small" href={urls.guest}>
                      {t("pt.guest")}
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
