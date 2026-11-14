"use client";

import { QRCodeSVG } from "qrcode.react";
import { Bar } from "@/components/shell";
import { PARTY } from "@/lib/demo";
import { usdShort } from "@/lib/party-state";
import { useOrigin } from "@/lib/use-demo";
import { useParty } from "@/lib/use-party";

/** Экран для зала: QR на страницу гостя, сумма и лента растут от взносов жюри */
export function DemoQr({ slug }: { slug: string }) {
  const { state, live } = useParty(1000);
  const origin = useOrigin();
  const url = `${origin}/p/${slug}`;
  const reached = state.raisedCents >= PARTY.goal * 100;
  const latest = state.feed[0];

  return (
    <div className="paper on-dark flex min-h-dvh w-full flex-wrap items-center justify-center gap-2xl bg-night px-lg py-2xl text-night-ink lg:flex-nowrap lg:gap-3xl lg:px-3xl">
      <div className="flex flex-[0_0_auto] flex-col items-center gap-lg">
        <div className="sheet" style={{ rotate: "-2deg" }}>
          <div className="paper torn-note bg-card p-xl">
            <QRCodeSVG
              value={url}
              size={340}
              level="M"
              fgColor="#07051A"
              bgColor="#FFFEFF"
              className="block h-auto w-[min(340px,70vw)]"
              title={`QR code for ${url}`}
            />
          </div>
        </div>
        <span className="text-lg font-bold text-night-muted md:text-xl">{url.replace(/^https?:\/\//, "")}</span>
      </div>

      <div className="flex min-w-0 flex-[1_1_0] flex-col gap-xl">
        <div className="flex flex-col gap-sm">
          <h1 className="text-[3.5rem] leading-[0.95] tracking-[-0.045em] md:text-[6rem]">
            A {PARTY.giftShort} for {PARTY.child}
          </h1>
          <p className="text-xl font-bold text-signal md:text-2xl">Scan, RSVP, chip in. About 30 seconds.</p>
        </div>
        <div className="flex flex-col gap-md">
          <div className="flex items-baseline gap-lg">
            <span className="figure text-[5rem] md:text-[8.5rem]" role="status" aria-live="polite">
              {usdShort(state.raisedCents)}
            </span>
            <span className="text-2xl font-extrabold text-night-muted md:text-3xl">of ${PARTY.goal}</span>
          </div>
          <Bar
            ratio={state.raisedCents / (PARTY.goal * 100)}
            label={`${usdShort(state.raisedCents)} of $${PARTY.goal} raised`}
            style={{ height: 24, backgroundColor: "var(--color-night-rule)" }}
            fillStyle={{ backgroundColor: "var(--color-signal)" }}
          />
          <p className="text-xl font-extrabold md:text-2xl">
            {state.families} of {state.invited} families are in
          </p>
        </div>
        <div className="flex min-h-16 flex-wrap gap-sm">
          {latest && (
            <span
              key={latest.id}
              className="pop inline-flex items-center rounded-pill bg-night-ink px-lg py-sm text-lg font-extrabold text-ink md:text-xl"
            >
              {latest.text}
            </span>
          )}
          {reached && (
            <span className="pop inline-flex items-center rounded-pill bg-signal px-lg py-sm text-lg font-extrabold text-signal-ink md:text-xl">
              That’s the whole {PARTY.giftShort}. Thank you, class!
            </span>
          )}
        </div>
        {!live && <p className="label text-night-muted!">Connecting…</p>}
      </div>
    </div>
  );
}
