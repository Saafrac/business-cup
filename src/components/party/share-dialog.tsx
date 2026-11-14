"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, CopyIcon } from "@/components/icons";
import { dayLong, mmdd, partyTitle, partyUrls, type PartyInfo } from "@/lib/party";

// Окно сразу после создания (макет «E3 · Share»): ссылка, текст для группового чата, QR, превью для гостя.

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // буфер обмена недоступен (http, старый браузер) — текст виден рядом, его можно выделить руками
  }
}

export function ShareDialog({ party, link, open, onClose }: { party: PartyInfo; link: string; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState<"link" | "text" | null>(null);
  const message = `Hi everyone! ${partyTitle(party)}: ${dayLong(party.date)}, ${mmdd(party.date)} at ${party.place}. Here’s the invite with all the details. Please reply by ${mmdd(party.deadline)}! ${link}`;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const copy = async (what: "link" | "text") => {
    await copyText(what === "link" ? link : message);
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
          <button type="button" aria-label="Close" onClick={onClose} className="btn btn--small absolute top-lg right-lg w-11 p-0">
            <CloseIcon size={18} />
          </button>

          <div className="flex flex-col gap-xs pr-2xl">
            <h1 id="share-title" className="text-3xl">
              The invite is live!
            </h1>
            <p className="lead">Send the link to the group chat. Guests answer and chip in right from it, no account needed.</p>
          </div>

          <div className="grid gap-xl md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="flex flex-col gap-lg">
              <div className="field">
                <label htmlFor="share-link">Invite link</label>
                <div className="flex gap-xs">
                  <input id="share-link" className="input font-extrabold" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
                  <button type="button" className="btn btn--primary shrink-0" onClick={() => copy("link")}>
                    <CopyIcon size={16} />
                    {copied === "link" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-sm border-t border-edge pt-lg">
                <h2 className="text-xl">For the group chat</h2>
                <p className="leading-normal break-words">{message}</p>
                <button type="button" className="btn btn--small self-start" onClick={() => copy("text")}>
                  {copied === "text" ? "Copied" : "Copy text"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-lg">
              <div className="flex items-center gap-md">
                <span className="shrink-0 rounded-tag bg-card p-xs">
                  <QRCodeSVG value={link} size={120} level="M" fgColor="#07051A" bgColor="#FFFEFF" title="QR code for the invite link" />
                </span>
                <p className="text-sm font-bold text-ink-2">Print it or show it on a screen: guests scan and answer.</p>
              </div>
              <div className="flex flex-col gap-xs border-t border-edge pt-lg">
                <Link className="btn" href={partyUrls(party.id).guest} target="_blank">
                  Preview as a guest
                </Link>
                <Link className="btn" href={partyUrls(party.id).design}>
                  Change the design
                </Link>
              </div>
            </div>
          </div>

          <button type="button" onClick={onClose} className="link-btn self-start">
            Go to the dashboard
          </button>
        </div>
      </div>
    </dialog>
  );
}
