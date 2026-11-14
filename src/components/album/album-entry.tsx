"use client";

import Link from "next/link";
import { useState } from "react";
import { UploadSheet } from "@/components/album/upload-sheet";
import { CameraIcon, ExternalIcon } from "@/components/icons";
import { Note, PhoneColumn } from "@/components/shell";
import { ALBUM_COVER, albumHostLabel, albumPhotosUrlFor } from "@/lib/album";
import { PARTY } from "@/lib/demo";
import { useAlbum } from "@/lib/use-album";

/** Вход в альбом по ссылке из чата или QR: обложка, «Добавить фото», «Смотреть», внешний альбом фотографа */
export function AlbumEntry({ slug }: { slug: string }) {
  const { album, addLocal } = useAlbum();
  const [uploading, setUploading] = useState(false);

  return (
    <PhoneColumn>
      <div className="flex items-center justify-between p-md">
        <Link href={`/p/${slug}`} className="font-display text-lg font-semibold tracking-[-0.03em] text-ink no-underline hover:text-ink">
          chip in
        </Link>
        <span className="text-sm font-bold text-ink-2">Photo album</span>
      </div>

      <div className="px-md">
        <Note bg="var(--color-card)" tilt={-1} className="flex flex-col gap-md px-sm pt-sm pb-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- обложка из public */}
          <img src={ALBUM_COVER} alt="" className="block h-[190px] w-full rounded-stock object-cover" />
          <div className="flex flex-col gap-2xs px-xs">
            <h1 className="text-3xl">
              {PARTY.honoree} turns {PARTY.age}
            </h1>
            <p className="font-bold text-ink-2">
              {PARTY.dayLong} {PARTY.date}, {PARTY.place}
            </p>
            <p className="pt-xs font-extrabold">
              <span className="figure text-xl text-accent">{album.count}</span> photos from{" "}
              <span className="figure text-xl text-accent">{album.guests}</span> guests
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
              <span className="font-extrabold">The photographer’s album</span>
              <span className="text-sm text-ink-2">Opens on {albumHostLabel(album.albumUrl)}</span>
            </span>
          </a>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-sm p-md pt-xl">
        <button type="button" onClick={() => setUploading(true)} className="btn btn--primary btn--block min-h-14 text-lg">
          <CameraIcon size={22} />
          Add photos
        </button>
        <Link className="btn btn--block" href={albumPhotosUrlFor(slug)}>
          See album
        </Link>
        <p className="label pt-xs text-center">Anyone with the party link can open this album.</p>
      </div>

      {uploading && <UploadSheet onClose={() => setUploading(false)} onUploaded={addLocal} />}
    </PhoneColumn>
  );
}
