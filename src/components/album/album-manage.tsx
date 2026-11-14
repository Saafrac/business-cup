"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { PhotoViewer } from "@/components/album/photo-viewer";
import { CopyIcon, ExternalIcon, TrashIcon } from "@/components/icons";
import { AppHeader, Note } from "@/components/shell";
import { SEED_ALT, albumHostLabel, type AlbumState } from "@/lib/album";
import { partyTitle, partyUrls, type PartyInfo } from "@/lib/party";
import { useOrigin } from "@/lib/use-demo";
import { albumRequest, useAlbum } from "@/lib/use-album";

/** Альбом у организатора: ссылка на альбом фотографа, QR для гостей, удаление фото */
export function AlbumManage({ party, initial }: { party: PartyInfo; initial: AlbumState }) {
  const { album, setAlbum, refresh } = useAlbum(party.id, initial, 6000);
  const origin = useOrigin();
  const urls = partyUrls(party.id);
  const [draft, setDraft] = useState<string | null>(null);
  const [linkMsg, setLinkMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const albumLink = `${origin}${urls.album}`;
  const linkValue = draft ?? album.albumUrl ?? "";
  const uploaded = album.photos.filter((p) => !p.seed);

  const saveLink = async (url: string | null) => {
    setLinkMsg("");
    const res = await albumRequest(party.id, "/link", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = (await res.json().catch(() => ({}))) as { albumUrl?: string | null; error?: string };
    if (!res.ok) {
      setLinkMsg(data.error ?? "Couldn’t save the link");
      return;
    }
    setDraft(null);
    setAlbum((a) => ({ ...a, albumUrl: data.albumUrl ?? null }));
    setLinkMsg(data.albumUrl ? "Saved. Guests see it on the album page." : "Link removed.");
  };

  const remove = async (photoId: string) => {
    const res = await albumRequest(party.id, `/${photoId}`, { method: "DELETE" });
    if (!res.ok) return;
    setAlbum((a) => ({ ...a, photos: a.photos.filter((p) => p.id !== photoId), count: a.count - 1 }));
    void refresh();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(albumLink);
    } catch {
      // буфер обмена недоступен по http — ссылка видна рядом
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <AppHeader active="parties" avatar="S" avatarLabel="Organizer" avatarClass="bg-signal-soft" />

      <div className="wrap flex flex-col gap-xl pt-md pb-3xl">
        <div className="flex flex-col gap-sm border-b-2 border-ink pb-md">
          <nav aria-label={partyTitle(party)} className="flex flex-wrap gap-2xs font-extrabold">
            <Link href={urls.dashboard} className="flex min-h-11 items-center px-sm text-ink-2 no-underline">
              Gift collection
            </Link>
            <span
              aria-current="page"
              className="flex min-h-11 items-center px-sm text-accent underline decoration-[3px] underline-offset-[0.4em]"
            >
              Photo album
            </span>
          </nav>
          <h1 className="text-display-s">{partyTitle(party)}</h1>
        </div>

        <div className="flex flex-wrap items-start gap-2xl">
          <section aria-labelledby="ph" className="flex min-w-0 flex-[999_1_640px] flex-col gap-lg">
            <h2 id="ph" className="visually-hidden">
              Photos
            </h2>
            <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-lg">
              <div>
                <dt className="label">Photos</dt>
                <dd className="figure m-0 text-3xl">{album.count}</dd>
              </div>
              <div>
                <dt className="label">Guests who shared</dt>
                <dd className="figure m-0 text-3xl">{album.guests}</dd>
              </div>
              <div>
                <dt className="label">Uploaded by guests</dt>
                <dd className="figure m-0 text-3xl">{uploaded.length}</dd>
              </div>
            </dl>

            {album.photos.length === 0 && (
              <Note bg="var(--color-paper-2)" tilt={-0.5} className="flex flex-col gap-xs p-lg">
                <span className="font-extrabold">No photos yet</span>
                <span className="text-ink-2">Share the album link or QR at the event. Guests add photos from their phones, no account needed.</span>
              </Note>
            )}

            <ul role="list" className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-md p-0">
              {album.photos.map((p, i) => (
                <li key={p.id} className="flex flex-col gap-xs">
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-label={`Open photo shared by ${p.guest}`}
                    className="relative block aspect-square cursor-zoom-in overflow-hidden rounded-tag border-0 bg-paper-3 p-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- превью из нашего API */}
                    <img src={p.thumb} alt={SEED_ALT[p.id] ?? ""} loading="lazy" className="block size-full object-cover" />
                  </button>
                  <div className="flex items-center justify-between gap-xs">
                    <span className="truncate text-sm font-bold">{p.guest}</span>
                    {p.seed ? (
                      <span className="tag min-h-7 text-xs">Demo</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        aria-label={`Delete photo shared by ${p.guest}`}
                        className="flex size-10 items-center justify-center rounded-tag border-[1.5px] border-edge bg-card text-error"
                      >
                        <TrashIcon size={18} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-xl">
            <section aria-labelledby="share" className="flex flex-col gap-md">
              <h2 id="share" className="text-xl">
                Guests open the album here
              </h2>
              <div className="self-center">
                <Note bg="var(--color-card)" tilt={1} className="flex flex-col items-center gap-sm p-lg">
                  <QRCodeSVG value={albumLink} size={200} level="M" fgColor="#07051A" bgColor="#FFFEFF" title="QR code for the album link" />
                  <span className="text-sm font-extrabold break-all">{albumLink.replace(/^https?:\/\//, "")}</span>
                </Note>
              </div>
              <button type="button" onClick={copy} className="btn btn--block">
                <CopyIcon size={16} />
                {copied ? "Copied" : "Copy the album link"}
              </button>
              <Link className="btn btn--primary btn--block" href={urls.album}>
                Open as a guest
              </Link>
            </section>

            <section aria-labelledby="ext" className="flex flex-col gap-sm">
              <h2 id="ext" className="text-xl">
                Photographer’s album
              </h2>
              <p className="text-ink-2">
                Got the photos in Google Photos, Drive, Dropbox or iCloud? Paste the link and guests get a button to it.
              </p>
              <form
                className="flex flex-col gap-sm"
                onSubmit={(e) => {
                  e.preventDefault();
                  void saveLink(linkValue.trim() || null);
                }}
              >
                <div className="field">
                  <label htmlFor="ext-url">Album link</label>
                  <input
                    id="ext-url"
                    className="input"
                    type="url"
                    inputMode="url"
                    placeholder="https://photos.app.goo.gl/…"
                    value={linkValue}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-sm">
                  <button type="submit" className="btn btn--primary">
                    Save link
                  </button>
                  {album.albumUrl && (
                    <button type="button" className="btn" onClick={() => void saveLink(null)}>
                      Remove
                    </button>
                  )}
                </div>
                {linkMsg && (
                  <p role="status" className="text-sm font-bold text-ink-2">
                    {linkMsg}
                  </p>
                )}
                {album.albumUrl && (
                  <a
                    href={album.albumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-2xs text-sm font-extrabold"
                  >
                    <ExternalIcon size={16} />
                    Check it on {albumHostLabel(album.albumUrl)}
                  </a>
                )}
              </form>
            </section>
          </aside>
        </div>
      </div>

      {open !== null && <PhotoViewer photos={album.photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}
