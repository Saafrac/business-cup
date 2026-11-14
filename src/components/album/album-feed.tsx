"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { PhotoViewer } from "@/components/album/photo-viewer";
import { UploadSheet } from "@/components/album/upload-sheet";
import { CameraIcon, ChevronLeftIcon, ExternalIcon, PlusIcon } from "@/components/icons";
import { Note, PhoneColumn } from "@/components/shell";
import { SEED_ALT, albumHostLabel, type AlbumState } from "@/lib/album";
import { LangSwitch, useI18n } from "@/lib/i18n";
import { partyUrls, type PartyInfo } from "@/lib/party";
import { useAlbum } from "@/lib/use-album";

/** Лента альбома: сетка 3 в ряд, новые сверху, тап — полноэкранный просмотр */
export function AlbumFeed({ party, initial }: { party: PartyInfo; initial: AlbumState }) {
  const { t, title, lit } = useI18n();
  const { album, addLocal } = useAlbum(party.id, initial);
  const [open, setOpen] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const photos = album.photos;
  const close = useCallback(() => setOpen(null), []);

  return (
    <PhoneColumn>
      <div className="flex flex-col gap-md px-md pt-sm pb-md">
        <div className="flex items-center gap-xs">
          <Link
            href={partyUrls(party.id).album}
            aria-label={t("al.back")}
            className="flex size-11 items-center justify-center text-ink no-underline hover:text-ink"
          >
            <ChevronLeftIcon size={22} />
          </Link>
          <div className="flex flex-1 flex-col">
            <h1 className="text-xl">{t("al.feedTitle", { title: title(party) })}</h1>
            <p className="label">{t("al.countNewest", { n: photos.length })}</p>
          </div>
          <LangSwitch />
        </div>
        {album.albumUrl && (
          <a href={album.albumUrl} target="_blank" rel="noopener noreferrer" className="btn btn--small self-start">
            <ExternalIcon size={16} />
            {t("al.hostBtn", { host: albumHostLabel(album.albumUrl) })}
          </a>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center gap-xl px-lg pb-3xl">
          <div className="w-60 self-center">
            <Note bg="var(--color-paper-3)" tilt={-2} className="flex h-[220px] items-center justify-center text-accent">
              <CameraIcon size={88} strokeWidth={1.5} />
            </Note>
          </div>
          <div className="flex flex-col items-center gap-sm text-center">
            <h2 className="max-w-[14ch] text-2xl">{t("al.first")}</h2>
            <p className="max-w-[30ch] text-ink-2">{t("al.firstX")}</p>
          </div>
          <button type="button" onClick={() => setUploading(true)} className="btn btn--primary btn--block min-h-14 text-lg">
            {t("al.add")}
          </button>
        </div>
      ) : (
        <ul role="list" className="m-0 grid list-none grid-cols-3 gap-[2px] p-0 pb-3xl">
          {photos.map((p, i) => (
            <li key={p.id} className="relative aspect-square overflow-hidden bg-paper-3">
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={t("al.sharedAria", { name: p.guest })}
                className="block size-full cursor-zoom-in border-0 bg-transparent p-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- превью из нашего API */}
                <img src={p.thumb} alt={lit(SEED_ALT[p.id] ?? "")} loading="lazy" decoding="async" className="block size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {photos.length > 0 && (
        <button
          type="button"
          onClick={() => setUploading(true)}
          aria-label={t("al.add")}
          className="btn btn--primary fixed right-[max(16px,calc(50vw-215px+16px))] bottom-lg z-(--z-sticky) size-16 rounded-pill p-0"
        >
          <PlusIcon size={28} />
        </button>
      )}

      {open !== null && <PhotoViewer photos={photos} index={open} onIndex={setOpen} onClose={close} />}
      {uploading && <UploadSheet partyId={party.id} onClose={() => setUploading(false)} onUploaded={addLocal} />}
    </PhoneColumn>
  );
}
