"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { HeroDemo } from "@/components/landing/hero-demo";
import { ArrowRightIcon, QrIcon } from "@/components/icons";
import { Key, NameTag, Note, Wordmark, cn, type TagKind } from "@/components/shell";
import { GUESTS, ROUTES } from "@/lib/demo";
import { LangSwitch, useT } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/dict";

const ROSTER_TILT = [-2, 1, -1, 2, 0, -1.5, 1.5];
const EXTERNAL = new Set(["Olivia", "Isabella", "Harper"]);
const NOT_YET = new Set(["Noah", "Ethan", "Wyatt"]);

const quote = "font-display text-lg leading-[1.3] font-medium tracking-[-0.01em]";

const PLANS: Array<{ name: MessageKey; text: MessageKey; price: string; per?: MessageKey }> = [
  { name: "l.pr.free", text: "l.pr.freeT", price: "$0" },
  { name: "l.pr.pro", text: "l.pr.proT", price: "$9.99", per: "l.pr.proPer" },
  { name: "l.pr.gw", text: "l.pr.gwT", price: "$49", per: "l.pr.gwPer" },
];

export default function Landing() {
  const t = useT();
  return (
    <div className="paper w-full bg-paper text-ink">
      <header className="wrap flex flex-wrap items-center justify-between gap-md py-md">
        <Wordmark withMark />
        <nav aria-label={t("l.nav.aria")} className="flex flex-wrap items-center gap-2xs text-md font-bold">
          {[
            ["l.nav.how", "#week"],
            ["l.nav.groups", "#groups"],
            ["l.nav.pricing", "#pricing"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex min-h-11 items-center px-sm text-ink no-underline">
              {t(label as MessageKey)}
            </a>
          ))}
          <Link href={ROUTES.login} className="flex min-h-11 items-center px-sm text-ink no-underline">
            {t("l.nav.login")}
          </Link>
          <LangSwitch />
        </nav>
      </header>

      <section id="top" className="wrap flex flex-wrap items-center gap-2xl pt-lg pb-2xl lg:min-h-[760px]">
        <div className="flex min-w-0 flex-[1_1_500px] flex-col gap-lg">
          <h1 className="max-w-[12ch]">{t("l.h1")}</h1>
          <p className="lead">{t("l.lead")}</p>
          <div className="flex flex-wrap gap-sm pt-xs">
            <Link className="btn btn--primary" href={ROUTES.newParty}>
              {t("l.start")}
            </Link>
            <Link className="btn" href={ROUTES.groupWallet}>
              {t("l.group")}
            </Link>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section id="week" className="paper torn-top bg-paper-2 pt-(--section-gap) pb-(--section-gap-s)">
        <div className="wrap flex flex-col gap-2xl">
          <h2 className="max-w-[14ch]">{t("l.week.h2")}</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] border-t-2 border-ink">
            <WeekDay title={t("l.d.mon")} text={t("l.mon.x")} first>
              <div className="mt-auto flex items-center gap-sm pt-md">
                <QrIcon size={48} strokeWidth={1.8} />
                <span className="text-sm font-extrabold">chipin.app/p/emma7k2q</span>
              </div>
            </WeekDay>
            <WeekDay title={t("l.d.wed")} text={t("l.wed.x")}>
              <p className={cn(quote, "mt-auto pt-md")}>{t("l.wed.q")}</p>
            </WeekDay>
            <WeekDay title={t("l.d.fri")} text={t("l.fri.x")}>
              <div
                role="img"
                aria-label={t("l.fri.aria")}
                className="mt-auto flex h-11 overflow-hidden rounded-tag text-sm font-extrabold"
              >
                <span className="flex flex-[300] items-center bg-accent pl-sm text-accent-ink">{t("l.fri.bike")}</span>
                <span className="flex flex-[70] items-center justify-center bg-signal">$40</span>
              </div>
            </WeekDay>
            <WeekDay title={t("l.d.sat")} text={t("l.sat.x")} last>
              <p className={cn(quote, "mt-auto pt-md")}>{t("l.sat.q")}</p>
            </WeekDay>
          </div>
        </div>
      </section>

      <section className="py-(--section-gap-l)">
        <div className="wrap flex flex-col gap-xl">
          <h2 className="max-w-[18ch] text-display">
            {t("l.priv.a")}
            <span className="block pt-sm text-section text-accent">{t("l.priv.b")}</span>
          </h2>
          <p className="lead">{t("l.priv.lead")}</p>
        </div>
      </section>

      <section id="groups" className="paper torn on-dark bg-night py-(--section-gap) text-night-ink">
        <div className="wrap flex flex-col gap-2xl">
          <h2 className="max-w-[16ch]">{t("l.grp.h2")}</h2>

          <div className="flex flex-wrap items-center gap-xl">
            <div className="min-w-0 flex-[1_1_340px]">
              <Note bg="var(--color-card)" tilt={-1.5} className="px-lg py-xl text-ink">
                <span className="label">{t("l.grp.pasteL")}</span>
<p className="pt-xs text-lg leading-normal">{t("l.grp.email")}</p>
              </Note>
            </div>
            <ArrowRightIcon size={48} className="shrink-0 text-signal max-md:rotate-90" />
            <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-md rounded-card bg-night-2 p-lg shadow-[inset_0_0_0_1.5px_var(--color-night-rule)]">
              <h3 className="text-2xl">{t("l.grp.title")}</h3>
              <p className="text-sm font-bold text-night-muted">{t("l.grp.draft")}</p>
              <div className="flex flex-wrap gap-xs">
                {(["l.grp.tag1", "l.grp.tag2", "l.grp.tag3"] as const).map((k) => (
                  <span key={k} className="tag bg-night-rule text-night-ink">
                    {t(k)}
                  </span>
                ))}
              </div>
              <Link className="btn btn--signal self-start" href={ROUTES.groupWallet}>
                {t("l.grp.publish")}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-lg pt-xl">
            <div className="flex flex-wrap items-baseline justify-between gap-md">
              <h3 className="text-2xl">{t("l.grp.tg")}</h3>
              <span className="figure text-3xl text-signal">22/25</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-sm">
              {GUESTS.map((n, i) => {
                const kind: TagKind = NOT_YET.has(n) ? "open" : EXTERNAL.has(n) ? "venmo" : "paid";
                return <NameTag key={n} name={n} kind={kind} tilt={ROSTER_TILT[i % ROSTER_TILT.length]} />;
              })}
            </div>
            <div className="flex flex-wrap gap-lg">
              <Key swatch={{ backgroundColor: "var(--color-mint)" }} className="text-night-muted">
                {t("l.key.paid")}
              </Key>
              <Key swatch={{ backgroundColor: "var(--color-signal-soft)" }} className="text-night-muted">
                {t("l.key.ext")}
              </Key>
              <Key
                swatch={{ outline: "2px dashed var(--color-night-muted)", outlineOffset: -2 }}
                className="text-night-muted"
              >
                {t("l.key.open")}
              </Key>
            </div>
          </div>
        </div>
      </section>

      <section id="dream" className="pt-(--section-gap-l) pb-(--section-gap)">
        <div className="wrap flex flex-wrap items-center gap-3xl">
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-lg">
            <h2 className="max-w-[13ch]">{t("l.dr.h2")}</h2>
            <p className="lead">{t("l.dr.lead")}</p>
            <Link href={ROUTES.dream} className="inline-flex min-h-11 items-center self-start font-extrabold">
              {t("l.dr.link")}
            </Link>
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] items-end justify-center gap-lg">
            <div
              role="img"
              aria-label={t("l.dr.aria")}
              className="relative h-[312px] w-[156px] shrink-0 overflow-hidden rounded-[30px_30px_40px_40px] border-[3px] border-ink bg-card"
            >
              <div className="paper absolute inset-x-0 bottom-0 h-[40%] bg-accent" />
              <span className="figure absolute inset-x-0 bottom-md text-center text-2xl text-accent-ink">$120</span>
              <span className="absolute inset-x-0 top-md text-center text-sm font-extrabold">{t("l.dr.of")}</span>
            </div>
            <div className="flex max-w-[260px] flex-col gap-md">
              <Note bg="var(--color-signal-soft)" tilt={-2.5} className="p-lg">
                <p className={quote}>{t("l.dr.q1")}</p>
                <span className="block pt-xs text-sm font-extrabold">{t("l.dr.q1by")}</span>
              </Note>
              <Note bg="var(--color-mint)" tilt={2} className="p-lg">
                <p className={quote}>{t("l.dr.q2")}</p>
                <span className="block pt-xs text-sm font-extrabold">{t("l.dr.q2by")}</span>
              </Note>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="paper bg-paper-2 py-(--section-gap-s)">
        <div className="wrap flex flex-wrap items-start gap-3xl">
          <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-lg">
            <h2>{t("l.pr.h2")}</h2>
            <p className="lead">{t("l.pr.lead")}</p>
          </div>
          <table aria-label={t("l.pr.aria")} className="min-w-0 flex-[1_1_600px] border-collapse text-body">
            <tbody>
              {PLANS.map((p, i) => (
                <tr
                  key={p.name}
                  className={cn(
                    i === 0 ? "border-t-2 border-ink" : "border-t border-edge",
                    i === PLANS.length - 1 && "border-b border-edge",
                  )}
                >
                  <th
                    scope="row"
                    className="py-lg pr-md text-left align-top font-display text-xl font-semibold tracking-[-0.02em]"
                  >
                    {t(p.name)}
                  </th>
                  <td className="px-md py-lg align-top text-ink-2">{t(p.text)}</td>
                  <td className="num py-lg text-right align-top">
                    <span className={cn("block font-display text-2xl font-semibold", p.per && "text-accent")}>
                      {p.price}
                    </span>
                    {p.per && <span className="label">{t(p.per)}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pt-(--section-gap) pb-3xl">
        <div className="wrap">
          <div className="paper torn on-accent flex flex-wrap items-center justify-between gap-xl bg-accent px-lg py-3xl text-accent-ink md:px-2xl">
            <h2 className="max-w-[14ch] flex-[1_1_460px]">{t("l.cta.h2")}</h2>
            <div className="flex flex-wrap gap-sm">
              <Link className="btn btn--signal" href={ROUTES.newParty}>
                {t("l.start")}
              </Link>
              <Link className="btn" href={ROUTES.groupWallet}>
                {t("l.cta.group")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="wrap flex flex-wrap items-center justify-between gap-lg pt-lg pb-2xl text-sm text-ink-2">
        <span className="font-display text-lg font-semibold text-ink">chip in</span>
        <p>{t("l.ft.note")}</p>
        <nav aria-label={t("l.ft.aria")} className="flex gap-2xs">
          {(["privacy", "terms", "help"] as const).map((l) => (
            <a key={l} href={`#${l}`} className="flex min-h-11 items-center px-xs text-ink-2">
              {t(`l.ft.${l}`)}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}

function WeekDay({
  title,
  text,
  first,
  last,
  children,
}: {
  title: string;
  text: string;
  first?: boolean;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-md py-lg",
        first ? "pr-lg" : last ? "pl-lg" : "px-lg",
        !last && "border-r border-edge",
        "max-[600px]:border-r-0 max-[600px]:border-b max-[600px]:px-0",
      )}
    >
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
