"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { PhotoViewer } from "@/components/album/photo-viewer";
import { CopyIcon, ExternalIcon, TrashIcon } from "@/components/icons";
import { AppHeader, Note } from "@/components/shell";
import { SEED_ALT, albumHostLabel, albumUrlFor } from "@/lib/album";
import { PARTY } from "@/lib/demo";
import { useOrigin } from "@/lib/use-demo";
import { organizerRequest, readStored, useAlbum, writeStored } from "@/lib/use-album";

/** Альбом у организатора: ссылка на альбом фотографа, QR для гостей, удаление фото */
export function AlbumManage({ id }: { id: string }) {
  const { album, setAlbum, refresh } = useAlbum(6000);
  const origin = useOrigin();
  const [code, setCode] = useState(() => readStored("organizer"));
  const [needCode, setNeedCode] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [linkMsg, setLinkMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const albumLink = `${origin}${albumUrlFor(PARTY.slug)}`;
  const linkValue = draft ?? album.albumUrl ?? "";
  const uploaded = album.photos.filter((p) => !p.seed);

  const call = async (path: string, init: RequestInit) => {
    const res = await organizerRequest(path, init, code);
    if (res.status === 403) {
      setNeedCode(true);
      return null;
    }
    if (code) writeStored("organizer", code);
    setNeedCode(false);
    return res;
  };

  const saveLink = async (url: string | null) => {
    setLinkMsg("");
    const res = await call("/link", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res) return;
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
    const res = await call(`/${photoId}`, { method: "DELETE" });
    if (!res?.ok) return;
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
      <AppHeader active="parties" avatar="S" avatarLabel="Signed in as Sarah" avatarClass="bg-signal-soft" />

      <div className="wrap flex flex-col gap-xl pt-md pb-3xl">
        <div className="flex flex-col gap-sm border-b-2 border-ink pb-md">
          <nav aria-label={`${PARTY.honoree}’s party`} className="flex flex-wrap gap-2xs font-extrabold">
            <Link href={`/party/${id}`} className="flex min-h-11 items-center px-sm text-ink-2 no-underline">
              Gift collection
            </Link>
            <span
              aria-current="page"
              className="flex min-h-11 items-center px-sm text-accent underline decoration-[3px] underline-offset-[0.4em]"
            >
              Photo album
            </span>
          </nav>
          <h1 className="text-display-s">
            {PARTY.honoree} turns {PARTY.age}
          </h1>
        </div>

        {needCode && (
          <Note bg="var(--color-signal-soft)" className="flex flex-wrap items-end gap-md px-lg py-lg">
            <div className="field min-w-0 flex-[1_1_260px]">
              <label htmlFor="org-code">Organizer code</label>
              <input
                id="org-code"
                className="input"
                type="password"
                autoComplete="off"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <span className="label">This is a public demo, so changes need the code. It’s DEMO_ADMIN_KEY on the server.</span>
            </div>
            <span className="label">Then repeat the action.</span>
          </Note>
        )}

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
              <Link className="btn btn--primary btn--block" href={albumUrlFor(PARTY.slug)}>
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
                  <a href={album.albumUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2xs text-sm font-extrabold">
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
