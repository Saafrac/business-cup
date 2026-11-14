"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CopyIcon, QrIcon } from "@/components/icons";
import { ShareDialog } from "@/components/party/share-dialog";
import { AppHeader, Bar, Key, NameTag, Note, SWATCH, type TagKind } from "@/components/shell";
import { TILT } from "@/lib/demo";
import { noteLabel } from "@/components/invite/rsvp-flow";
import { useI18n, type TFn } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n/dict";
import { themeName } from "@/lib/invite-themes";
import { goalUsd, partyUrls, type PartyInfo } from "@/lib/party";
import { usdShort, type FeedItem, type GuestStatus, type PartyState } from "@/lib/party-state";
import { useOrigin } from "@/lib/use-demo";
import { useParty } from "@/lib/use-party";

// Venmo в дашборде — тоже «оплачено» (зелёная плитка), только подпись другая
const LOOK: Record<GuestStatus, [TagKind, MessageKey]> = {
  paid: ["paid", "d.paid"],
  external: ["paid", "d.paidExt"],
  yes: ["yes", "d.coming"],
  no: ["no", "d.no"],
  open: ["open", "d.open"],
};

function listNames(t: TFn, names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} ${t("d.and")} ${names[names.length - 1]}`;
}

const feedText = (t: TFn, f: FeedItem) => t(`fe.${f.kind}` as MessageKey, { who: f.guest });

export function Dashboard({ party, initial }: { party: PartyInfo; initial: PartyState }) {
  const { t, title, lit, giftShort, dayShort, md } = useI18n();
  const { state } = useParty(party.id, initial);
  const urls = partyUrls(party.id);
  const goal = goalUsd(party);
  const short = giftShort(party.gift);
  const origin = useOrigin();
  const [edited, setEdited] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const [share, setShare] = useState(useSearchParams().get("share") === "1");
  const notes = state.guests.filter((g) => g.note && g.status !== "no" && g.status !== "open");

  const quiet = state.guests.filter((g) => g.status === "open").slice(0, 3).map((g) => g.name);
  const nudge =
    edited ??
    t("d.nudge", { title: title(party), day: dayShort(party.date), date: md(party.date), place: lit(party.place), gift: short });
  const link = `${origin}${urls.guest}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // буфер обмена недоступен (http, старый браузер) — ссылка видна рядом, её можно выделить руками
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <AppHeader active="parties" avatar="S" avatarLabel={t("sh.signedSarah")} avatarClass="bg-signal-soft" />

      <div className="wrap flex flex-col gap-2xl pt-md pb-3xl">
        <section
          aria-labelledby="party"
          className="paper torn on-accent flex flex-wrap items-end justify-between gap-xl bg-accent px-lg py-2xl text-accent-ink md:px-xl"
        >
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-md">
            <div className="flex flex-wrap items-center gap-sm">
              <h1 id="party" className="text-display-s">
                {title(party)}
              </h1>
              <span role="status" className="tag bg-accent-ink text-ink">
                {t("d.openUntil", { date: md(party.deadline) })}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-md">
              <span className="figure text-figure">{usdShort(state.raisedCents)}</span>
              <span className="text-lg font-extrabold">
                {t("d.ofFor", { goal, gift: short })}
              </span>
            </div>
            <Bar
              ratio={state.raisedCents / party.goalCents}
              label={t("d.raisedAria", { raised: usdShort(state.raisedCents), goal })}
              className="max-w-[560px]"
              style={{ backgroundColor: "var(--color-accent-deep)" }}
              fillStyle={{ backgroundColor: "var(--color-signal)" }}
            />
          </div>
          <div className="flex flex-wrap gap-sm">
            <Link className="btn" href={urls.qr}>
              <QrIcon size={18} />
              {t("d.qr")}
            </Link>
            <Link className="btn" href={urls.design}>
              {t("d.design", { name: t(themeName(party.theme)) })}
            </Link>
            <Link className="btn" href={urls.albumManage}>
              {t("d.album")}
            </Link>
            <Link className="btn btn--signal" href={urls.payout}>
              {t("d.split")}
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-sm border-y border-edge py-sm">
          <span className="label">{t("d.invite")}</span>
          <span className="num min-w-0 flex-[1_1_220px] font-extrabold break-all">{link.replace(/^https?:\/\//, "")}</span>
          <button type="button" onClick={copy} className="btn btn--small">
            <CopyIcon size={16} />
            {copied ? t("d.copied") : t("d.copy")}
          </button>
        </div>

        <div className="flex flex-wrap items-start gap-2xl">
          <section aria-labelledby="gl" className="flex min-w-0 flex-[999_1_600px] flex-col gap-lg">
            <div className="flex flex-wrap items-baseline justify-between gap-md border-b-2 border-ink pb-sm">
              <h2 id="gl" className="text-2xl">
                {t("d.guests")}
              </h2>
              <p className="font-bold text-ink-2">
                {t("d.stat", { a: state.coming, b: state.contributors, c: state.quiet })} · {t("d.people", { n: state.headcount })}
              </p>
            </div>
            {state.guests.length === 0 && (
              <Note bg="var(--color-paper-2)" tilt={-0.5} className="flex flex-col gap-xs p-lg">
                <span className="font-extrabold">{t("d.noneT")}</span>
                <span className="text-ink-2">{t("d.noneX")}</span>
              </Note>
            )}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-sm sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
              {state.guests.map((g, i) => {
                const [kind, label] = LOOK[g.status];
                return <NameTag key={g.name} name={g.name} state={t(label)} kind={kind} tilt={TILT[i % TILT.length]} />;
              })}
            </div>
            <div className="flex flex-wrap gap-lg">
              <Key swatch={SWATCH.paid}>{t("d.key.paid")}</Key>
              <Key swatch={SWATCH.soft}>{t("d.key.soft")}</Key>
              <Key swatch={SWATCH.no}>{t("d.key.no")}</Key>
              <Key swatch={SWATCH.open}>{t("d.key.open")}</Key>
            </div>
          </section>

          <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-2xl">
            <section aria-labelledby="feed" className="flex flex-col gap-sm">
              <h2 id="feed" className="text-xl">
                {t("d.latest")}
              </h2>
              <table aria-label={t("d.latestAria")} className="border-collapse text-md">
                <tbody>
                  {state.feed.slice(0, 5).map((f) => (
                    <tr key={f.id} className="enter border-t border-edge">
                      <td className="py-sm">{feedText(t, f)}</td>
                      <td className="num text-right font-extrabold">{f.amountCents > 0 ? usdShort(f.amountCents) : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="label">{t("d.privacy")}</p>
            </section>

            {notes.length > 0 && (
              <section aria-labelledby="food" className="flex flex-col gap-sm">
                <h2 id="food" className="text-xl">
                  {t("d.notesH")}
                </h2>
                <table aria-label={t("d.notesAria")} className="border-collapse text-md">
                  <tbody>
                    {notes.map((g) => (
                      <tr key={g.name} className="border-t border-edge">
                        <th scope="row" className="py-sm pr-md text-left align-top font-extrabold">
                          {g.name}
                        </th>
                        <td className="py-sm break-words">{g.note ? noteLabel(t, g.note) : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {quiet.length > 0 && (
              <section aria-labelledby="nudge" className="flex flex-col gap-md">
                <h2 id="nudge" className="text-xl">
                  {t("d.nudgeFor", { names: listNames(t, quiet) })}
                </h2>
                {editing ? (
                  <textarea
                    aria-label={t("d.reminderAria")}
                    className="input"
                    rows={5}
                    maxLength={280}
                    value={nudge}
                    onChange={(e) => setEdited(e.target.value)}
                  />
                ) : (
                  <Note bg="var(--color-paper-2)" tilt={-1} className="p-lg leading-[1.55]">
                    {nudge}
                  </Note>
                )}
                <p className="label">{t("d.drafted", { n: nudge.length })}</p>
                <div className="flex flex-wrap gap-sm">
                  <button
                    type="button"
                    disabled={sent}
                    onClick={() => {
                      setEditing(false);
                      setSent(true);
                    }}
                    className="btn btn--primary"
                  >
                    {sent ? t("d.sent", { n: quiet.length }) : t("d.send", { n: quiet.length })}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing((e) => !e);
                      setSent(false);
                    }}
                    className="btn"
                  >
                    {editing ? t("d.done") : t("d.edit")}
                  </button>
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>

      <ShareDialog
        party={party}
        link={link}
        open={share}
        onClose={() => {
          setShare(false);
          router.replace(urls.dashboard, { scroll: false });
        }}
      />
    </div>
  );
}
