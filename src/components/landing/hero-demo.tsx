"use client";

import { Bar } from "@/components/shell";
import { useDemoStep } from "@/lib/use-demo";

const TOTALS = [230, 255, 270, 290, 300];
const MESSAGES = [
  { who: "Rachel, Liam’s mom", text: "Liam is in. Just chipped in!" },
  { who: "Daniel, Ava’s dad", text: "Ava too, she has talked about it all week" },
  { who: "Priya, Olivia’s mom", text: "Sent ours by Venmo and marked it" },
  { who: "Jen, Sophia’s mom", text: "Done. See you at the park" },
  { who: "Mark, Lucas’s dad", text: "That’s the whole bike!" },
];
const LAST = TOTALS.length - 1;

/** Групповой чат гостей: ссылка на подарок наполняется вживую (пример — день рождения) */
export function HeroDemo() {
  const step = useDemoStep(LAST, 1600);
  const total = TOTALS[step];
  const chat = MESSAGES.slice(Math.max(0, step - 1), step + 1);

  return (
    <div className="relative flex min-w-0 flex-[0_1_460px] justify-center py-lg">
      <span
        className="pop paper absolute top-xs left-0 z-[2] flex size-[132px] flex-col items-center justify-center rounded-full bg-signal text-center font-display text-lg leading-[1.05] font-semibold tracking-[-0.02em] text-signal-ink"
        style={{ rotate: "-8deg", filter: "var(--shadow-paper)", animationDelay: "900ms" }}
      >
        Free up to
        <br />
        15 guests
      </span>
      <div
        className="flex h-[620px] w-[340px] max-w-full flex-col overflow-hidden rounded-[46px] border-[10px] border-ink bg-card"
        style={{ filter: "var(--shadow-paper)" }}
      >
        <div className="flex flex-col border-b border-rule px-md pt-md pb-sm">
          <span className="text-md font-extrabold">2nd grade parents</span>
          <span className="text-xs font-semibold text-muted">25 families</span>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-xs bg-paper-2 p-sm">
          <p
            className="enter max-w-[86%] self-end rounded-[18px_18px_4px_18px] bg-accent px-sm py-xs text-sm leading-[1.45] text-accent-ink"
            style={{ animationDelay: "200ms" }}
          >
            Emma turns 7 on Saturday! RSVP and the gift link are here
          </p>
          <div
            className="enter flex w-[86%] flex-col gap-xs self-end rounded-2xl bg-card p-sm shadow-[inset_0_0_0_1.5px_var(--color-paper-3)]"
            style={{ animationDelay: "420ms" }}
          >
            <span className="text-xs font-bold text-muted">chipin.app</span>
            <span className="font-display text-lg leading-[1.1] font-semibold tracking-[-0.02em]">A bike for Emma</span>
            <Bar ratio={total / 300} label={`$${total} raised of $300`} />
            <span className="text-sm font-extrabold">
              <span className="num text-accent">${total}</span> of $300
            </span>
          </div>
          {chat.map((m) => (
            <div key={m.who} className="enter flex max-w-[82%] flex-col gap-3xs self-start">
              <span className="pl-2xs text-xs font-extrabold text-muted">{m.who}</span>
              <span className="rounded-[18px_18px_18px_4px] bg-card px-sm py-xs text-sm leading-[1.45]">{m.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
