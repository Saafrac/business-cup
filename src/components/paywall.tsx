"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons";

/** Экран 10: апгрейд при > 15 гостях. Stripe Checkout подключается на кнопки. */
export function Paywall({
  open,
  invited,
  child,
  onUpgrade,
  onClose,
}: {
  open: boolean;
  invited: number;
  child: string;
  onUpgrade: () => void;
  onClose: () => void;
}) {
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
            aria-label="Close"
            onClick={onClose}
            className="btn btn--small absolute top-lg right-lg w-11 p-0"
          >
            <CloseIcon size={18} />
          </button>

          <div className="flex flex-col gap-sm pr-2xl">
            <h1 id="pw-title" className="max-w-[20ch] text-3xl">
              {invited} kids are invited. Free covers 15.
            </h1>
            <p className="lead">Party Pro opens this party to the whole class for $9.99, once.</p>
          </div>

          <div className="grid gap-xl border-t-2 border-ink pt-lg md:grid-cols-2">
            <section aria-labelledby="pro" className="flex flex-col gap-sm">
              <h2 id="pro" className="text-xl">
                Party Pro
              </h2>
              <p>
                <span className="num font-display text-3xl font-semibold tracking-[-0.03em] text-accent">$9.99</span>{" "}
                <span className="label">for this party</span>
              </p>
              <p className="text-ink-2">
                All {invited} kids, reminders that send themselves, a thank-you from {child} to every family.
              </p>
              <button type="button" onClick={onUpgrade} className="btn btn--primary mt-auto self-start">
                Upgrade this party
              </button>
            </section>
            <section
              aria-labelledby="cw"
              className="flex flex-col gap-sm md:border-l md:border-edge md:pl-xl max-md:border-t max-md:border-edge max-md:pt-lg"
            >
              <h2 id="cw" className="text-xl">
                Class Wallet
              </h2>
              <p>
                <span className="num font-display text-3xl font-semibold tracking-[-0.03em]">$49</span>{" "}
                <span className="label">a school year</span>
              </p>
              <p className="text-ink-2">For room parents: every class collection, the paid roster, a year-end report.</p>
              <button type="button" onClick={onUpgrade} className="btn mt-auto self-start">
                Get Class Wallet
              </button>
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-md">
            <p className="label">Checkout by Stripe. We never charge a fee on contributions.</p>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-11 items-center border-0 bg-transparent font-extrabold whitespace-nowrap text-accent-deep underline decoration-[1.5px] underline-offset-[0.18em]"
            >
              Keep 15 guests for free
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
