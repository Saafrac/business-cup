"use client";

import Link from "next/link";
import { useState } from "react";
import { UploadSheet } from "@/components/album/upload-sheet";
import { CameraIcon, ExternalIcon } from "@/components/icons";
import { Note, PhoneColumn } from "@/components/shell";
import { albumCover, albumHostLabel, type AlbumState } from "@/lib/album";
import { LangSwitch, useI18n } from "@/lib/i18n";
import { partyUrls, type PartyInfo } from "@/lib/party";
import { useAlbum } from "@/lib/use-album";

/** Вход в альбом по ссылке из чата или QR: обложка, «Добавить фото», «Смотреть», внешний альбом фотографа */
export function AlbumEntry({ party, initial }: { party: PartyInfo; initial: AlbumState }) {
  const { t, rich, title, lit, dayLong, md } = useI18n();
  const { album, addLocal } = useAlbum(party.id, initial);
  const [uploading, setUploading] = useState(false);
  const urls = partyUrls(party.id);

  return (
    <PhoneColumn>
      <div className="flex items-center justify-between p-md">
        <Link href={urls.guest} className="font-display text-lg font-semibold tracking-[-0.03em] text-ink no-underline hover:text-ink">
          chip in
        </Link>
        <span className="flex items-center gap-xs">
          <span className="text-sm font-bold text-ink-2">{t("al.title")}</span>
          <LangSwitch />
        </span>
      </div>

      <div className="px-md">
        <Note bg="var(--color-card)" tilt={-1} className="flex flex-col gap-md px-sm pt-sm pb-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- обложка: своё фото или иллюстрация из public */}
          <img src={albumCover(party.id, album)} alt="" className="block h-[190px] w-full rounded-stock object-cover" />
          <div className="flex flex-col gap-2xs px-xs">
            <h1 className="text-3xl">{title(party)}</h1>
            <p className="font-bold text-ink-2">
              {dayLong(party.date)} {md(party.date)}, {lit(party.place)}
            </p>
            <p className="pt-xs font-extrabold">
              {rich("al.count", {
                count: <span className="figure text-xl text-accent">{album.count}</span>,
                guests: <span className="figure text-xl text-accent">{album.guests}</span>,
              })}
            </p>
          </div>
        </Note>
      </div>

      {album.albumUrl && (
        <div className="px-md pt-xl">
          <a
            href={album.albumUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-md rounded-card border-[1.5px] border-edge bg-card p-md text-ink no-underline hover:text-ink"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-stock bg-signal-soft">
              <ExternalIcon size={22} />
            </span>
            <span className="flex flex-col">
              <span className="font-extrabold">{t("al.photographer")}</span>
              <span className="text-sm text-ink-2">{t("al.opensOn", { host: albumHostLabel(album.albumUrl) })}</span>
            </span>
          </a>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-sm p-md pt-xl">
        <button type="button" onClick={() => setUploading(true)} className="btn btn--primary btn--block min-h-14 text-lg">
          <CameraIcon size={22} />
          {t("al.add")}
        </button>
        <Link className="btn btn--block" href={urls.albumPhotos}>
          {t("al.see")}
        </Link>
        <p className="label pt-xs text-center">{t("al.anyone")}</p>
      </div>

      {uploading && <UploadSheet partyId={party.id} onClose={() => setUploading(false)} onUploaded={addLocal} />}
    </PhoneColumn>
  );
}
