"use client";

import Link from "next/link";
import { useState } from "react";
import { CopyIcon, QrIcon } from "@/components/icons";
import { AppHeader, Bar, Key, NameTag, Note, SWATCH, type TagKind } from "@/components/shell";
import { PARTY, TILT } from "@/lib/demo";
import { usdShort, type GuestStatus } from "@/lib/party-state";
import { useOrigin } from "@/lib/use-demo";
import { useParty } from "@/lib/use-party";

// Venmo в дашборде — тоже «оплачено» (зелёная плитка), только подпись другая
const LOOK: Record<GuestStatus, [TagKind, string]> = {
  paid: ["paid", "Paid"],
  external: ["paid", "Paid by Venmo"],
  yes: ["yes", "Coming"],
  no: ["no", "Can’t come"],
  open: ["open", "No answer"],
};

function listNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function Dashboard({ id }: { id: string }) {
  const { state } = useParty();
  const origin = useOrigin();
  const [edited, setEdited] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const quiet = state.guests.filter((g) => g.status === "open").slice(0, 3).map((g) => g.name);
  const nudge =
    edited ??
    `Hi! ${PARTY.honoree}’s party is Sat ${PARTY.date} at ${PARTY.place}. Would love to know if you can come. Everyone is chipping in for her ${PARTY.giftShort}, totally optional.`;
  const link = `${origin}/p/${PARTY.slug}`;

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
      <AppHeader active="parties" avatar="S" avatarLabel="Signed in as Sarah" avatarClass="bg-signal-soft" />

      <div className="wrap flex flex-col gap-2xl pt-md pb-3xl">
        <section
          aria-labelledby="party"
          className="paper torn on-accent flex flex-wrap items-end justify-between gap-xl bg-accent px-lg py-2xl text-accent-ink md:px-xl"
        >
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-md">
            <div className="flex flex-wrap items-center gap-sm">
              <h1 id="party" className="text-display-s">
                {PARTY.honoree} turns {PARTY.age}
              </h1>
              <span role="status" className="tag bg-accent-ink text-ink">
                Open until {PARTY.deadline}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-md">
              <span className="figure text-figure">{usdShort(state.raisedCents)}</span>
              <span className="text-lg font-extrabold">
                of ${PARTY.goal} for the {PARTY.giftShort}
              </span>
            </div>
            <Bar
              ratio={state.raisedCents / (PARTY.goal * 100)}
              label={`${usdShort(state.raisedCents)} of $${PARTY.goal} raised`}
              className="max-w-[560px]"
              style={{ backgroundColor: "var(--color-accent-deep)" }}
              fillStyle={{ backgroundColor: "var(--color-signal)" }}
            />
          </div>
          <div className="flex flex-wrap gap-sm">
            <Link className="btn" href={`/party/${id}/qr`}>
              <QrIcon size={18} />
              QR for a screen
            </Link>
            <Link className="btn" href={`/party/${id}/album`}>
              Photo album
            </Link>
            <Link className="btn btn--signal" href={`/party/${id}/payout`}>
              Split the money
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-sm border-y border-edge py-sm">
          <span className="label">Invite link</span>
          <span className="num min-w-0 flex-[1_1_220px] font-extrabold break-all">{link.replace(/^https?:\/\//, "")}</span>
          <button type="button" onClick={copy} className="btn btn--small">
            <CopyIcon size={16} />
            {copied ? "Copied" : "Copy for the chat"}
          </button>
        </div>

        <div className="flex flex-wrap items-start gap-2xl">
          <section aria-labelledby="gl" className="flex min-w-0 flex-[999_1_600px] flex-col gap-lg">
            <div className="flex flex-wrap items-baseline justify-between gap-md border-b-2 border-ink pb-sm">
              <h2 id="gl" className="text-2xl">
                Guests
              </h2>
              <p className="font-bold text-ink-2">
                {state.coming} coming, {state.contributors} chipped in, {state.quiet} quiet
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-sm sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
              {state.guests.map((g, i) => {
                const [kind, label] = LOOK[g.status];
                return <NameTag key={g.name} name={g.name} state={label} kind={kind} tilt={TILT[i % TILT.length]} />;
              })}
            </div>
            <div className="flex flex-wrap gap-lg">
              <Key swatch={SWATCH.paid}>Paid</Key>
              <Key swatch={SWATCH.soft}>Coming, not paid</Key>
              <Key swatch={SWATCH.no}>Can’t come</Key>
              <Key swatch={SWATCH.open}>Opened, no answer</Key>
            </div>
          </section>

          <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-2xl">
            <section aria-labelledby="feed" className="flex flex-col gap-sm">
              <h2 id="feed" className="text-xl">
                Latest
              </h2>
              <table aria-label="Latest activity" className="border-collapse text-md">
                <tbody>
                  {state.feed.slice(0, 5).map((f) => (
                    <tr key={f.id} className="enter border-t border-edge">
                      <td className="py-sm">{f.text}</td>
                      <td className="num text-right font-extrabold">{f.amountCents > 0 ? usdShort(f.amountCents) : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="label">Only you see the amounts.</p>
            </section>

            {quiet.length > 0 && (
              <section aria-labelledby="nudge" className="flex flex-col gap-md">
                <h2 id="nudge" className="text-xl">
                  A nudge for {listNames(quiet)}
                </h2>
                {editing ? (
                  <textarea
                    aria-label="Reminder text"
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
                <p className="label">Drafted by AI, {nudge.length} of 280 characters</p>
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
                    {sent ? `Sent to ${quiet.length} guests` : `Send to ${quiet.length} guests`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing((e) => !e);
                      setSent(false);
                    }}
                    className="btn"
                  >
                    {editing ? "Done" : "Edit"}
                  </button>
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
