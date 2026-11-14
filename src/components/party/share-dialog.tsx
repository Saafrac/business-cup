"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, CopyIcon } from "@/components/icons";
import { copyText } from "@/lib/copy-text";
import { useI18n } from "@/lib/i18n";
import { partyUrls, type PartyInfo } from "@/lib/party";

// Окно сразу после создания (макет «E3 · Share»): ссылка, текст для группового чата, QR, превью для гостя.

export function ShareDialog({ party, link, open, onClose }: { party: PartyInfo; link: string; open: boolean; onClose: () => void }) {
  const { t, title, dayLong, md, lit } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState<"link" | "text" | null>(null);
  const [failed, setFailed] = useState(false);
  const message = t("sd.message", {
    title: title(party),
    day: dayLong(party.date),
    date: md(party.date),
    place: lit(party.place),
    deadline: md(party.deadline),
    link,
  });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const copy = async (what: "link" | "text") => {
    const ok = await copyText(what === "link" ? link : message, ref.current);
    setFailed(!ok);
    if (!ok) {
      // не вышло — выделяем ссылку, чтобы скопировать руками
      linkRef.current?.focus();
      linkRef.current?.select();
      return;
    }
    setCopied(what);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="share-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-32px)] max-w-[880px] overflow-visible border-0 bg-transparent p-0 text-ink backdrop:bg-scrim"
    >
      <div className="sheet">
        <div data-invite-theme={party.theme} className="paper torn-note relative flex flex-col gap-xl bg-paper px-lg pt-2xl pb-xl md:px-xl">
          <button type="button" aria-label={t("close")} onClick={onClose} className="btn btn--small absolute top-lg right-lg w-11 p-0">
            <CloseIcon size={18} />
          </button>

          <div className="flex flex-col gap-xs pr-2xl">
            <h1 id="share-title" className="text-3xl">
              {t("sd.h")}
            </h1>
            <p className="lead">{t("sd.lead")}</p>
          </div>

          <div className="grid gap-xl md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="flex flex-col gap-lg">
              <div className="field">
                <label htmlFor="share-link">{t("d.invite")}</label>
                <div className="flex gap-xs">
                  <input ref={linkRef} id="share-link" className="input font-extrabold" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
                  <button type="button" className="btn btn--primary shrink-0" onClick={() => copy("link")}>
                    <CopyIcon size={16} />
                    {copied === "link" ? t("d.copied") : t("sd.copy")}
                  </button>
                </div>
                {failed && (
                  <p role="alert" className="text-sm font-bold text-error">
                    {t("copy.fail")}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-sm border-t border-edge pt-lg">
                <h2 className="text-xl">{t("sd.chatH")}</h2>
                <p className="leading-normal break-words">{message}</p>
                <button type="button" className="btn btn--small self-start" onClick={() => copy("text")}>
                  {copied === "text" ? t("d.copied") : t("sd.copyText")}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-lg">
              <div className="flex items-center gap-md">
                <span className="shrink-0 rounded-tag bg-card p-xs">
                  <QRCodeSVG value={link} size={120} level="M" fgColor="#07051A" bgColor="#FFFEFF" title={t("sd.qrAlt")} />
                </span>
                <p className="text-sm font-bold text-ink-2">{t("sd.qrP")}</p>
              </div>
              <div className="flex flex-col gap-xs border-t border-edge pt-lg">
                <Link className="btn" href={partyUrls(party.id).guest} target="_blank">
                  {t("sd.preview")}
                </Link>
                <Link className="btn" href={partyUrls(party.id).design}>
                  {t("sd.design")}
                </Link>
              </div>
            </div>
          </div>

          <button type="button" onClick={onClose} className="link-btn self-start">
            {t("sd.toDash")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
