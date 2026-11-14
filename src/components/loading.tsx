"use client";

import { useT } from "@/lib/i18n";

/** Пока страница события грузится с сервера (обычно доли секунды) */
export function PageLoading({ phone = false }: { phone?: boolean }) {
  const t = useT();
  return (
    <div className="paper flex min-h-dvh items-center justify-center bg-paper text-ink">
      <div className={phone ? "flex w-full max-w-[430px] flex-col items-center gap-sm px-md" : "flex flex-col items-center gap-sm"}>
        <span className="font-display text-xl font-semibold tracking-[-0.03em]">chip in</span>
        <span role="status" className="label">
          {t("loading")}
        </span>
      </div>
    </div>
  );
}
