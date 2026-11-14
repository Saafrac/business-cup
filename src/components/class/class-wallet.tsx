"use client";

import { useState } from "react";
import { SparkIcon } from "@/components/icons";
import { AppHeader, Key, NameTag, Note, SWATCH, type TagKind } from "@/components/shell";
import { CLASS, KIDS, TILT } from "@/lib/demo";

const EXTERNAL = new Set(["Olivia", "Isabella", "Harper"]);
const NOT_YET = new Set(["Noah", "Ethan", "Wyatt"]);

const TEACHER_EMAIL =
  "Hi families! Our spring museum trip is on 03/20. The museum asks $12 per student, please send by 03/06. Thank you! Mrs. Carter";

const TABS = ["Teacher gift", "Field trip bus", "Class supplies"];

const NUDGES = [
  { to: "Tom, Noah’s dad", text: "Hi Tom! The class gift for Mrs. Carter closes Friday. $15 if you’d like to join, no worries if not.", tilt: -1 },
  { to: "Sam, Ethan’s mom", text: "Hi Sam, we’re putting together a thank-you for Mrs. Carter. Totally optional, $15, link below.", tilt: 0.8 },
  { to: "Lee, Wyatt’s mom", text: "Hi Lee! Friday is the last day for the Mrs. Carter gift. Join if it works for you.", tilt: -0.5 },
];

type Draft = { title: string; perFamily: number; due: string; expected: number };

/** Черновик сбора для демо: тот же формат, что вернёт AI Collection Builder (запасной ответ на таймаут) */
function draftFrom(text: string): Draft {
  const money = text.match(/\$(\d+(?:\.\d{1,2})?)/);
  const dates = [...text.matchAll(/(\d{2})\/(\d{2})/g)];
  const due = dates.length ? dates[dates.length - 1] : null;
  const per = money ? Number(money[1]) : 12;
  const lower = text.toLowerCase();
  const title = lower.includes("museum")
    ? "Spring museum trip"
    : lower.includes("teacher") || lower.includes("thank")
      ? "Teacher thank-you"
      : lower.includes("supplies")
        ? "Class supplies"
        : "Class collection";
  return { title, perFamily: per, due: due ? `${due[1]}/${due[2]}/2027` : "—", expected: per * KIDS.length };
}

export function ClassWallet() {
  const [tab, setTab] = useState(0);
  const [paste, setPaste] = useState(TEACHER_EMAIL);
  const [draft, setDraft] = useState<Draft>(() => draftFrom(TEACHER_EMAIL));
  const [thinking, setThinking] = useState(false);
  const [published, setPublished] = useState(false);
  const [sentAll, setSentAll] = useState(false);

  const build = () => {
    setThinking(true);
    setPublished(false);
    setTimeout(() => {
      setDraft(draftFrom(paste));
      setThinking(false);
    }, 900);
  };

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <AppHeader active="class" avatar="J" avatarLabel="Signed in as Julia" avatarClass="bg-mint text-mint-ink" />

      <div className="wrap flex flex-col gap-xl pt-xl pb-3xl">
        <div className="flex flex-wrap items-end justify-between gap-lg">
          <div className="flex flex-col gap-xs">
            <h1 className="text-display-s">{CLASS.name}</h1>
            <p className="text-ink-2">25 families, school year 2026 to 2027</p>
          </div>
          <div role="tablist" aria-label="Collections" className="flex flex-wrap gap-xs">
            {TABS.map((t, i) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === i}
                type="button"
                onClick={() => setTab(i)}
                className="choice px-md"
              >
                {t}
              </button>
            ))}
            {published && (
              <span className="pop tag min-h-[52px] bg-signal px-md font-extrabold">{draft.title}, new</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-xl">
          <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-2xl">
            <section aria-labelledby="tg" className="flex flex-col gap-lg">
              <div className="flex flex-wrap items-end justify-between gap-md border-b-2 border-ink pb-md">
                <div className="flex flex-col gap-2xs">
                  <h2 id="tg" className="text-2xl">
                    Teacher appreciation gift
                  </h2>
                  <p className="text-ink-2">$15 a family, due Friday 12/12</p>
                </div>
                <div className="flex items-baseline gap-sm">
                  <span className="figure text-3xl text-accent">22/25</span>
                  <span className="font-extrabold">paid, $330 of $375</span>
                </div>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-sm sm:grid-cols-[repeat(auto-fill,minmax(132px,1fr))]">
                {KIDS.map((n, i) => {
                  const [kind, label]: [TagKind, string] = NOT_YET.has(n)
                    ? ["open", "Not yet"]
                    : EXTERNAL.has(n)
                      ? ["venmo", "Venmo, $15"]
                      : ["paid", "Paid, $15"];
                  return <NameTag key={n} name={n} state={label} kind={kind} tilt={TILT[i % TILT.length]} />;
                })}
              </div>
              <div className="flex flex-wrap gap-lg">
                <Key swatch={SWATCH.paid}>Paid here, 19</Key>
                <Key swatch={SWATCH.soft}>Paid by Venmo, 3</Key>
                <Key swatch={SWATCH.open}>Not yet, 3</Key>
              </div>
            </section>

            <section aria-labelledby="rm" className="flex flex-col gap-md">
              <div className="flex flex-wrap items-baseline justify-between gap-md">
                <h2 id="rm" className="text-2xl">
                  Reminders for the last three
                </h2>
                <span className="label">Drafted by AI. Read before sending.</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-md">
                {NUDGES.map((m) => (
                  <Note key={m.to} bg="var(--color-paper-2)" tilt={m.tilt} className="p-lg">
                    <span className="font-extrabold">To {m.to}</span>
                    <p className="pt-xs leading-normal">{m.text}</p>
                  </Note>
                ))}
              </div>
              <div className="flex flex-wrap gap-sm">
                <button type="button" disabled={sentAll} onClick={() => setSentAll(true)} className="btn btn--primary">
                  {sentAll ? "Sent to all three" : "Send all three"}
                </button>
                <button type="button" className="btn">
                  Edit
                </button>
              </div>
            </section>
          </div>

          <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-xl">
            <section
              aria-labelledby="nc"
              className="paper torn on-dark flex flex-col gap-md bg-night px-lg py-xl text-night-ink"
            >
              <h2 id="nc" className="text-2xl">
                New collection from a message
              </h2>
              <div className="field">
                <label htmlFor="paste" className="text-night-muted!">
                  Paste the teacher’s email or a chat message
                </label>
                <textarea
                  id="paste"
                  className="input"
                  rows={5}
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  style={{
                    backgroundColor: "var(--color-night-2)",
                    color: "var(--color-night-ink)",
                    borderColor: "var(--color-night-muted)",
                  }}
                />
              </div>
              <button type="button" onClick={build} disabled={thinking || !paste.trim()} className="btn btn--small self-start">
                <SparkIcon size={16} className="text-signal" />
                {thinking ? "Reading the message…" : "Draft it with AI"}
              </button>
              <div
                aria-busy={thinking}
                className={`flex flex-col gap-sm border-t-[1.5px] border-dashed border-night-rule pt-md transition-opacity ${thinking ? "opacity-40" : ""}`}
              >
                <h3 className="text-xl">{draft.title}</h3>
                <p className="label text-night-muted!">AI’s draft. Check it before you publish.</p>
                <div className="flex flex-wrap gap-xs">
                  {[`$${draft.perFamily} a family`, `due ${draft.due}`, `$${draft.expected} expected`].map((t) => (
                    <span key={t} className="tag bg-night-rule text-night-ink">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-sm">
                <button type="button" onClick={() => setPublished(true)} disabled={thinking} className="btn btn--signal">
                  {published ? "Published, link copied" : "Publish and share"}
                </button>
                <button type="button" onClick={() => document.getElementById("paste")?.focus()} className="btn">
                  Edit draft
                </button>
              </div>
            </section>

            <section aria-labelledby="rp" className="flex flex-col gap-sm">
              <h2 id="rp" className="text-xl">
                Field trip bus, closed
              </h2>
              <table aria-label="Field trip bus report" className="border-collapse text-md">
                <tbody>
                  <tr className="border-t-2 border-ink">
                    <th scope="row" className="py-sm text-left font-medium text-ink-2">
                      Came in
                    </th>
                    <td className="num text-right font-extrabold">$250.00</td>
                  </tr>
                  <tr className="border-t border-edge">
                    <th scope="row" className="py-sm text-left font-medium text-ink-2">
                      Paid to the bus company
                    </th>
                    <td className="num text-right font-extrabold">$235.00</td>
                  </tr>
                  <tr className="border-y border-edge">
                    <th scope="row" className="py-sm text-left font-extrabold">
                      Left in the class wallet
                    </th>
                    <td className="num text-right font-display text-xl font-semibold text-accent">$15.00</td>
                  </tr>
                </tbody>
              </table>
              <a href="#csv" className="flex min-h-11 items-center font-extrabold">
                Download the report as CSV
              </a>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
