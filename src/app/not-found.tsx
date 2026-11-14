"use client";

import Link from "next/link";
import { Note } from "@/components/shell";
import { ROUTES } from "@/lib/demo";
import { LangSwitch, useT } from "@/lib/i18n";

export default function NotFound() {
  const t = useT();
  return (
    <div className="paper flex min-h-dvh items-center justify-center bg-paper px-md text-ink">
      <div className="flex w-full max-w-[420px] flex-col items-end gap-sm">
        <LangSwitch />
        <Note bg="var(--color-card)" tilt={-1} className="flex w-full flex-col gap-md px-lg py-xl">
          <span className="figure text-3xl text-accent">404</span>
          <h1 className="text-3xl">{t("nf.title")}</h1>
          <p className="text-ink-2">{t("nf.text")}</p>
          <div className="flex flex-wrap gap-sm pt-xs">
            <Link className="btn btn--primary" href="/parties">
              {t("nf.see")}
            </Link>
            <Link className="btn" href={ROUTES.newParty}>
              {t("nf.start")}
            </Link>
          </div>
        </Note>
      </div>
    </div>
  );
}
