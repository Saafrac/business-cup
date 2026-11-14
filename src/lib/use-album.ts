"use client";

import { useCallback, useEffect, useState } from "react";
import { seedPhotos, type AlbumPhoto, type AlbumState } from "@/lib/album";
import { PARTY } from "@/lib/demo";

const ALBUM_API = `/api/party/${PARTY.id}/album`;
const GUEST_KEY = "chipin:guest-name";
const ORGANIZER_KEY = "chipin:organizer-code";

const initial = (): AlbumState => {
  const photos = seedPhotos();
  return { albumUrl: null, photos, count: photos.length, guests: new Set(photos.map((p) => p.guest)).size };
};

/** Альбом события: опрос сервера, новые фото гостей появляются без перезагрузки */
export function useAlbum(intervalMs = 5000) {
  const [album, setAlbum] = useState<AlbumState>(initial);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(ALBUM_API, { cache: "no-store" });
      if (res.ok) {
        setAlbum((await res.json()) as AlbumState);
        setLoaded(true);
      }
    } catch {
      // сеть пропала — показываем то, что уже есть, следующий опрос попробует снова
    }
  }, []);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (!document.hidden) await refresh();
      if (!stopped) timer = setTimeout(tick, intervalMs);
    };
    timer = setTimeout(tick, 0);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [refresh, intervalMs]);

  const addLocal = useCallback((p: AlbumPhoto) => {
    setAlbum((a) => (a.photos.some((x) => x.id === p.id) ? a : { ...a, photos: [p, ...a.photos], count: a.count + 1 }));
  }, []);

  return { album, loaded, refresh, addLocal, setAlbum };
}

// Имя гостя и код организатора помним в браузере: это удобство, без них всё работает
export function readStored(key: "guest" | "organizer") {
  try {
    return localStorage.getItem(key === "guest" ? GUEST_KEY : ORGANIZER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeStored(key: "guest" | "organizer", value: string) {
  try {
    localStorage.setItem(key === "guest" ? GUEST_KEY : ORGANIZER_KEY, value);
  } catch {
    // приватный режим или запрет хранилища — просто не запоминаем
  }
}

type Resized = { blob: Blob; width: number; height: number };

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      return img;
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }
}

function draw(src: ImageBitmap | HTMLImageElement, max: number, quality: number): Promise<Resized> {
  const w0 = "naturalWidth" in src ? src.naturalWidth : src.width;
  const h0 = "naturalHeight" in src ? src.naturalHeight : src.height;
  const scale = Math.min(1, max / Math.max(w0, h0));
  const width = Math.max(1, Math.round(w0 * scale));
  const height = Math.max(1, Math.round(h0 * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("canvas"));
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(src, 0, 0, width, height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve({ blob: b, width, height }) : reject(new Error("encode"))), "image/jpeg", quality),
  );
}

/** Ужать фото в браузере (фото с телефона весят 3–10 МБ): полное до 2048 px и превью до 480 px */
export async function prepare(file: File) {
  const src = await decode(file);
  const full = await draw(src, 2048, 0.85);
  const thumb = await draw(src, 480, 0.75);
  if ("close" in src) src.close();
  return { full, thumb };
}

export type UploadResult = { ok: true; photo: AlbumPhoto } | { ok: false; error: string };

export function uploadPhoto(
  prepared: { full: Resized; thumb: Resized },
  guest: string,
  onProgress: (pct: number) => void,
): Promise<UploadResult> {
  const form = new FormData();
  form.append("guest", guest);
  form.append("width", String(prepared.full.width));
  form.append("height", String(prepared.full.height));
  form.append("file", prepared.full.blob, "photo.jpg");
  form.append("thumb", prepared.thumb.blob, "thumb.jpg");

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", ALBUM_API);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
    };
    xhr.onload = () => {
      let data: { error?: string } & Partial<AlbumPhoto> = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // ответ не JSON — ниже вернём общую ошибку
      }
      if (xhr.status === 201 && data.id) {
        onProgress(100);
        resolve({ ok: true, photo: data as AlbumPhoto });
      } else {
        resolve({ ok: false, error: data.error ?? "Upload failed" });
      }
    };
    xhr.onerror = () => resolve({ ok: false, error: "The connection dropped" });
    xhr.send(form);
  });
}

export async function organizerRequest(path: string, init: RequestInit, code: string) {
  return fetch(`${ALBUM_API}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), ...(code ? { "x-demo-key": code } : {}) },
  });
}
