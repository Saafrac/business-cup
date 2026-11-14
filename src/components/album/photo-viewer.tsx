"use client";

import { useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, DownloadIcon } from "@/components/icons";
import { SEED_ALT, type AlbumPhoto } from "@/lib/album";
import { useI18n } from "@/lib/i18n";

/** Полноэкранный просмотр: стрелки, клавиши ← → Esc, свайп на телефоне, «Сохранить» */
export function PhotoViewer({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: AlbumPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const { t, lit, photoTime } = useI18n();
  const p = photos[index];
  const startX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const n = photos.length;
  const go = (d: number) => onIndex((index + d + n) % n);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex((index - 1 + n) % n);
      if (e.key === "ArrowRight") onIndex((index + 1) % n);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, n, onClose, onIndex]);

  if (!p) return null;
  const alt = SEED_ALT[p.id] ? lit(SEED_ALT[p.id]) : t("al.sharedAria", { name: p.guest });
  const saveHref = p.seed ? p.src : `${p.src}?download=1`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("al.viewer")}
      className="on-dark fixed inset-0 z-(--z-modal) flex flex-col bg-ink text-night-ink"
    >
      <div className="flex items-center gap-xs py-sm pr-sm pl-xs">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="flex size-11 items-center justify-center border-0 bg-transparent text-night-ink"
        >
          <CloseIcon size={22} />
        </button>
        <div className="flex flex-1 flex-col">
          <span className="font-extrabold">{t("al.sharedBy", { name: p.guest })}</span>
          <time className="text-sm text-night-muted" dateTime={p.createdAt}>
            {photoTime(p.createdAt)}
          </time>
        </div>
        <span className="label text-night-muted!">
          {t("al.ofN", { i: index + 1, n })}
        </span>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center"
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- фото из нашего API и public, оптимизатор Next тут не нужен */}
        <img key={p.id} src={p.src} alt={alt} className="enter block max-h-full w-full object-contain select-none" draggable={false} />
        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("al.prev")}
              className="absolute top-1/2 left-xs flex size-11 -translate-y-1/2 items-center justify-center rounded-pill border-0 bg-scrim text-paper"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("al.next")}
              className="absolute top-1/2 right-xs flex size-11 -translate-y-1/2 items-center justify-center rounded-pill border-0 bg-scrim text-paper"
            >
              <ChevronRightIcon size={20} />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-xs px-sm pt-sm pb-lg">
        <a
          href={saveHref}
          download
          className="flex min-h-12 items-center gap-2xs rounded-stock px-sm font-extrabold text-night-ink no-underline hover:text-night-ink"
        >
          <DownloadIcon size={22} />
          {t("al.save")}
        </a>
        <span className="label text-night-muted!">{t("al.swipe")}</span>
      </div>
    </div>
  );
}
