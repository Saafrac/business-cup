"use client";

import { useEffect, useRef, useState } from "react";
import { CameraIcon, CheckIcon, CloseIcon, ImageIcon, RefreshIcon } from "@/components/icons";
import type { AlbumPhoto } from "@/lib/album";
import { prepare, readStoredGuest, uploadPhoto, writeStoredGuest } from "@/lib/use-album";

type Item = {
  key: string;
  file: File;
  preview: string;
  pct: number;
  status: "waiting" | "uploading" | "done" | "failed";
  error?: string;
};

const RING = 2 * Math.PI * 19;
const PARALLEL = 2;
const MAX_FILES = 30;

/** Шторка загрузки: имя, «снять» или «из галереи», прогресс на каждом фото, повтор упавших */
export function UploadSheet({
  partyId,
  onClose,
  onUploaded,
}: {
  partyId: string;
  onClose: () => void;
  onUploaded: (p: AlbumPhoto) => void;
}) {
  const [name, setName] = useState(() => readStoredGuest());
  const [items, setItems] = useState<Item[]>([]);
  const [hint, setHint] = useState("");
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const running = useRef(0);
  const queue = useRef<Item[]>([]);
  const nameValue = useRef(name);

  useEffect(() => {
    nameValue.current = name;
  }, [name]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // превью — локальные object URL, освобождаем при закрытии
  const previews = useRef<string[]>([]);
  useEffect(() => () => previews.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const patch = (key: string, p: Partial<Item>) => setItems((list) => list.map((it) => (it.key === key ? { ...it, ...p } : it)));

  const pump = () => {
    while (running.current < PARALLEL && queue.current.length > 0) {
      const it = queue.current.shift()!;
      running.current += 1;
      void (async () => {
        patch(it.key, { status: "uploading", pct: 1, error: undefined });
        try {
          const prepared = await prepare(it.file);
          const res = await uploadPhoto(partyId, prepared, nameValue.current.trim(), (pct) => patch(it.key, { pct }));
          if (res.ok) {
            patch(it.key, { status: "done", pct: 100 });
            onUploaded(res.photo);
          } else {
            patch(it.key, { status: "failed", error: res.error });
          }
        } catch {
          patch(it.key, { status: "failed", error: "This file isn’t a photo we can read" });
        } finally {
          running.current -= 1;
          pump();
        }
      })();
    }
  };

  const pick = (files: FileList | null) => {
    if (!files?.length) return;
    const chosen = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name));
    if (chosen.length < files.length) setHint("Only photos for now, videos were skipped.");
    const room = MAX_FILES - items.length;
    const next: Item[] = chosen.slice(0, Math.max(0, room)).map((file, i) => {
      const preview = URL.createObjectURL(file);
      previews.current.push(preview);
      return { key: `${Date.now()}-${i}-${file.name}`, file, preview, pct: 0, status: "waiting" };
    });
    if (chosen.length > room) setHint(`Up to ${MAX_FILES} photos at a time.`);
    setItems((list) => [...list, ...next]);
    queue.current.push(...next);
    pump();
  };

  const openPicker = (which: "camera" | "gallery") => {
    if (!name.trim()) {
      setHint("Type your name first, so friends know who shared");
      nameRef.current?.focus();
      return;
    }
    writeStoredGuest(name.trim());
    setHint("");
    (which === "camera" ? camRef : galRef).current?.click();
  };

  const retry = (it: Item) => {
    queue.current.push(it);
    patch(it.key, { status: "waiting", pct: 0, error: undefined });
    pump();
  };

  const done = items.filter((i) => i.status === "done").length;
  const failed = items.filter((i) => i.status === "failed");
  const busy = items.some((i) => i.status === "waiting" || i.status === "uploading");
  const status =
    items.length === 0
      ? "Photos show up in the album a few seconds after they upload."
      : failed.length
        ? `${done} of ${items.length} uploaded. ${failed[0].error}. Tap it to try again.`
        : busy
          ? `${done} of ${items.length} uploaded. Keep this open until they finish.`
          : `All ${items.length} ${items.length === 1 ? "photo is" : "photos are"} in the album.`;

  return (
    <div className="fixed inset-0 z-(--z-modal) flex items-end justify-center bg-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="up-title"
        className="paper torn-top flex max-h-[92dvh] w-full max-w-[430px] flex-col gap-md overflow-y-auto bg-paper px-md pt-xl pb-md text-ink"
      >
        <div className="flex items-center justify-between">
          <h2 id="up-title" className="text-2xl">
            Add photos
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="btn btn--small w-11 p-0">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="field">
          <label htmlFor="who">Your name</label>
          <input
            ref={nameRef}
            id="who"
            className="input"
            type="text"
            maxLength={40}
            autoComplete="name"
            placeholder="For example, Rachel"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <span className="label">So friends know who shared. Guests of this event will see your photos.</span>
        </div>

        <div className="grid grid-cols-2 gap-sm">
          <button type="button" className="choice flex min-h-24 flex-col items-center justify-center gap-xs" onClick={() => openPicker("camera")}>
            <CameraIcon size={28} strokeWidth={2} />
            Take photo
          </button>
          <button type="button" className="choice flex min-h-24 flex-col items-center justify-center gap-xs" onClick={() => openPicker("gallery")}>
            <ImageIcon size={28} strokeWidth={2} />
            Choose from gallery
          </button>
        </div>
        <input
          ref={camRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            pick(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={galRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            pick(e.target.files);
            e.target.value = "";
          }}
        />

        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-xs">
            {items.map((it) => (
              <div key={it.key} className="relative aspect-square overflow-hidden rounded-tag bg-paper-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- локальное превью выбранного файла */}
                <img src={it.preview} alt="" className="block size-full object-cover" />
                {it.status !== "done" && <div className="absolute inset-0 bg-scrim" />}
                {(it.status === "waiting" || it.status === "uploading") && (
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 48 48"
                    role="img"
                    aria-label={it.status === "waiting" ? "Waiting to upload" : `Uploading, ${it.pct}%`}
                    className="absolute inset-0 m-auto"
                  >
                    <circle cx="24" cy="24" r="19" fill="none" strokeWidth="5" stroke="var(--color-paper)" strokeOpacity="0.5" />
                    <circle
                      cx="24"
                      cy="24"
                      r="19"
                      fill="none"
                      strokeWidth="5"
                      strokeLinecap="round"
                      stroke="var(--color-paper)"
                      strokeDasharray={`${((RING * it.pct) / 100).toFixed(1)} ${RING.toFixed(1)}`}
                      transform="rotate(-90 24 24)"
                    />
                    <text x="24" y="28" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--color-paper)">
                      {it.status === "waiting" ? "Next" : `${it.pct}%`}
                    </text>
                  </svg>
                )}
                {it.status === "done" && (
                  <span
                    role="img"
                    aria-label="Uploaded"
                    className="absolute right-2xs bottom-2xs flex size-8 items-center justify-center rounded-pill bg-mint text-mint-ink"
                  >
                    <CheckIcon size={18} />
                  </span>
                )}
                {it.status === "failed" && (
                  <button
                    type="button"
                    onClick={() => retry(it)}
                    aria-label="Retry this photo"
                    className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-pill border-0 bg-paper text-error"
                  >
                    <RefreshIcon size={24} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <p role="status" className={`text-sm font-bold ${failed.length || hint ? "text-error" : "text-ink-2"}`}>
          {hint || status}
        </p>

        <button type="button" onClick={onClose} className="btn btn--primary btn--block min-h-14 text-lg">
          {items.length && !busy ? "See them in the album" : "Close"}
        </button>
      </div>
    </div>
  );
}
