"use client";

import { QRCodeSVG } from "qrcode.react";
import { Bar } from "@/components/shell";
import { useI18n } from "@/lib/i18n";
import { goalUsd, partyUrls, type PartyInfo } from "@/lib/party";
import { usdShort, type PartyState } from "@/lib/party-state";
import { useOrigin } from "@/lib/use-demo";
import { useParty } from "@/lib/use-party";

/** Экран для зала: QR на страницу гостя, сумма и лента растут от взносов жюри */
export function DemoQr({ party, initial }: { party: PartyInfo; initial: PartyState }) {
  const { t, giftShort } = useI18n();
  const { state, live } = useParty(party.id, initial, 1000);
  const origin = useOrigin();
  const url = `${origin}${partyUrls(party.id).guest}`;
  const goal = goalUsd(party);
  const short = giftShort(party.gift);
  const reached = state.raisedCents >= party.goalCents;
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
              title={t("qr.qrTitle", { url })}
            />
          </div>
        </div>
        <span className="text-lg font-bold text-night-muted md:text-xl">{url.replace(/^https?:\/\//, "")}</span>
      </div>

      <div className="flex min-w-0 flex-[1_1_0] flex-col gap-xl">
        <div className="flex flex-col gap-sm">
          <h1 className="text-[3.5rem] leading-[0.95] tracking-[-0.045em] md:text-[6rem]">
            {t("qr.title", { gift: short, name: party.honoree })}
          </h1>
          <p className="text-xl font-bold text-signal md:text-2xl">{t("qr.scan")}</p>
        </div>
        <div className="flex flex-col gap-md">
          <div className="flex items-baseline gap-lg">
            <span className="figure text-[5rem] md:text-[8.5rem]" role="status" aria-live="polite">
              {usdShort(state.raisedCents)}
            </span>
            <span className="text-2xl font-extrabold text-night-muted md:text-3xl">{t("qr.of", { goal })}</span>
          </div>
          <Bar
            ratio={state.raisedCents / party.goalCents}
            label={t("g.raisedAria", { raised: usdShort(state.raisedCents), goal })}
            style={{ height: 24, backgroundColor: "var(--color-night-rule)" }}
            fillStyle={{ backgroundColor: "var(--color-signal)" }}
          />
          <p className="text-xl font-extrabold md:text-2xl">
            {t("qr.in", { n: state.contributors, m: state.invited })}
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
              {t("qr.done", { gift: short })}
            </span>
          )}
        </div>
        {!live && <p className="label text-night-muted!">{t("qr.connecting")}</p>}
      </div>
    </div>
  );
}
