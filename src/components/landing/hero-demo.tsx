"use client";

import { Bar } from "@/components/shell";
import { useT } from "@/lib/i18n";
import { useDemoStep } from "@/lib/use-demo";

const TOTALS = [230, 255, 270, 290, 300];
const MESSAGES = ["m1", "m2", "m3", "m4", "m5"] as const;
const LAST = TOTALS.length - 1;

/** Групповой чат гостей: ссылка на подарок наполняется вживую (пример — день рождения) */
export function HeroDemo() {
  const t = useT();
  const step = useDemoStep(LAST, 1600);
  const total = TOTALS[step];
  const chat = MESSAGES.slice(Math.max(0, step - 1), step + 1);

  return (
    <div className="relative flex min-w-0 flex-[0_1_460px] justify-center py-lg">
      <span
        className="pop paper absolute top-xs left-0 z-[2] flex size-[132px] flex-col items-center justify-center rounded-full bg-signal text-center font-display text-lg leading-[1.05] font-semibold tracking-[-0.02em] text-signal-ink"
        style={{ rotate: "-8deg", filter: "var(--shadow-paper)", animationDelay: "900ms" }}
      >
        {t("hd.free1")}
        <br />
        {t("hd.free2")}
      </span>
      <div
        className="flex h-[620px] w-[340px] max-w-full flex-col overflow-hidden rounded-[46px] border-[10px] border-ink bg-card"
        style={{ filter: "var(--shadow-paper)" }}
      >
        <div className="flex flex-col border-b border-rule px-md pt-md pb-sm">
          <span className="text-md font-extrabold">{t("hd.group")}</span>
          <span className="text-xs font-semibold text-muted">{t("hd.members")}</span>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-xs bg-paper-2 p-sm">
          <p
            className="enter max-w-[86%] self-end rounded-[18px_18px_4px_18px] bg-accent px-sm py-xs text-sm leading-[1.45] text-accent-ink"
            style={{ animationDelay: "200ms" }}
          >
            {t("hd.msg")}
          </p>
          <div
            className="enter flex w-[86%] flex-col gap-xs self-end rounded-2xl bg-card p-sm shadow-[inset_0_0_0_1.5px_var(--color-paper-3)]"
            style={{ animationDelay: "420ms" }}
          >
            <span className="text-xs font-bold text-muted">chipin.app</span>
            <span className="font-display text-lg leading-[1.1] font-semibold tracking-[-0.02em]">{t("hd.title")}</span>
            <Bar ratio={total / 300} label={t("hd.raised", { n: total })} />
            <span className="text-sm font-extrabold">
              <span className="num text-accent">${total}</span> {t("hd.of")}
            </span>
          </div>
          {chat.map((m) => (
            <div key={m} className="enter flex max-w-[82%] flex-col gap-3xs self-start">
              <span className="pl-2xs text-xs font-extrabold text-muted">{t(`hd.${m}.who`)}</span>
              <span className="rounded-[18px_18px_18px_4px] bg-card px-sm py-xs text-sm leading-[1.45]">{t(`hd.${m}.text`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
