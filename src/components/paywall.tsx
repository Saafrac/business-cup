"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";

/** Экран 10: апгрейд при > 15 гостях. Stripe Checkout подключается на кнопки. */
export function Paywall({
  open,
  invited,
  honoree,
  onUpgrade,
  onClose,
}: {
  open: boolean;
  invited: number;
  honoree: string;
  onUpgrade: () => void;
  onClose: () => void;
}) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="pw-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-32px)] max-w-[800px] overflow-visible border-0 bg-transparent p-0 text-ink backdrop:bg-scrim"
    >
      <div className="sheet">
        <div className="paper torn-note relative flex flex-col gap-xl bg-paper px-lg pt-2xl pb-xl md:px-xl">
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="btn btn--small absolute top-lg right-lg w-11 p-0"
          >
            <CloseIcon size={18} />
          </button>

          <div className="flex flex-col gap-sm pr-2xl">
            <h1 id="pw-title" className="max-w-[20ch] text-3xl">
              {t("pw.title", { n: invited })}
            </h1>
            <p className="lead">{t("pw.lead")}</p>
          </div>

          <div className="grid gap-xl border-t-2 border-ink pt-lg md:grid-cols-2">
            <section aria-labelledby="pro" className="flex flex-col gap-sm">
              <h2 id="pro" className="text-xl">
                {t("pw.pro")}
              </h2>
              <p>
                <span className="num font-display text-3xl font-semibold tracking-[-0.03em] text-accent">$9.99</span>{" "}
                <span className="label">{t("pw.proPer")}</span>
              </p>
              <p className="text-ink-2">
                {t("pw.proT", { n: invited, name: honoree })}
              </p>
              <button type="button" onClick={onUpgrade} className="btn btn--primary mt-auto self-start">
                {t("pw.proBtn")}
              </button>
            </section>
            <section
              aria-labelledby="gw"
              className="flex flex-col gap-sm md:border-l md:border-edge md:pl-xl max-md:border-t max-md:border-edge max-md:pt-lg"
            >
              <h2 id="gw" className="text-xl">
                {t("pw.gw")}
              </h2>
              <p>
                <span className="num font-display text-3xl font-semibold tracking-[-0.03em]">$49</span>{" "}
                <span className="label">{t("pw.gwPer")}</span>
              </p>
              <p className="text-ink-2">{t("pw.gwT")}</p>
              <button type="button" onClick={onUpgrade} className="btn mt-auto self-start">
                {t("pw.gwBtn")}
              </button>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-md">
            <p className="label">{t("pw.foot")}</p>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-11 items-center border-0 bg-transparent font-extrabold whitespace-nowrap text-accent-deep underline decoration-[1.5px] underline-offset-[0.18em]"
            >
              {t("pw.keep")}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
