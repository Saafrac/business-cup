import "server-only";
import { randomUUID } from "node:crypto";
import { seedPhotos, type AlbumPhoto, type AlbumState } from "@/lib/album";
import { isDemo } from "@/lib/party";
import { pool } from "@/lib/server/store";

// Фото альбома: Postgres (bytea, полное фото + превью) при DATABASE_URL, иначе память процесса.
// Фото в базе переживают выкатку релиза; на сотни фото демо этого хватает с запасом.

export const MAX_PHOTOS_PER_PARTY = 500;

export class AlbumFullError extends Error {}

export type NewPhoto = {
  guest: string;
  mime: string;
  width: number;
  height: number;
  data: Buffer;
  thumb: Buffer;
};

type StoredImage = { mime: string; data: Buffer };

interface AlbumStore {
  list(partyId: string): Promise<AlbumPhoto[]>;
  add(partyId: string, p: NewPhoto): Promise<AlbumPhoto>;
  image(partyId: string, photoId: string, size: "full" | "thumb"): Promise<StoredImage | null>;
  remove(partyId: string, photoId: string): Promise<boolean>;
  getUrl(partyId: string): Promise<string | null>;
  setUrl(partyId: string, url: string | null): Promise<void>;
  reset(partyId: string): Promise<void>;
}

const urls = (partyId: string, id: string) => ({
  src: `/api/party/${partyId}/album/${id}`,
  thumb: `/api/party/${partyId}/album/${id}?size=thumb`,
});

// Память

type MemPhoto = AlbumPhoto & { mime: string; data: Buffer; thumbData: Buffer };
const mem = globalThis as unknown as { __cgAlbum?: Map<string, MemPhoto[]>; __cgAlbumUrl?: Map<string, string | null> };

const toPublic = (p: MemPhoto): AlbumPhoto => ({
  id: p.id,
  guest: p.guest,
  src: p.src,
  thumb: p.thumb,
  width: p.width,
  height: p.height,
  createdAt: p.createdAt,
});

function memList(partyId: string) {
  mem.__cgAlbum ??= new Map();
  if (!mem.__cgAlbum.has(partyId)) mem.__cgAlbum.set(partyId, []);
  return mem.__cgAlbum.get(partyId)!;
}

const memoryAlbum: AlbumStore = {
  async list(partyId) {
    return memList(partyId).map(toPublic).reverse();
  },
  async add(partyId, p) {
    const list = memList(partyId);
    if (list.length >= MAX_PHOTOS_PER_PARTY) throw new AlbumFullError();
    const id = randomUUID();
    const photo: MemPhoto = {
      id,
      guest: p.guest,
      ...urls(partyId, id),
      width: p.width,
      height: p.height,
      createdAt: new Date().toISOString(),
      mime: p.mime,
      data: p.data,
      thumbData: p.thumb,
    };
    list.push(photo);
    return toPublic(photo);
  },
  async image(partyId, photoId, size) {
    const p = memList(partyId).find((x) => x.id === photoId);
    if (!p) return null;
    return size === "thumb" ? { mime: "image/jpeg", data: p.thumbData } : { mime: p.mime, data: p.data };
  },
  async remove(partyId, photoId) {
    const list = memList(partyId);
    const i = list.findIndex((x) => x.id === photoId);
    if (i < 0) return false;
    list.splice(i, 1);
    return true;
  },
  async getUrl(partyId) {
    return mem.__cgAlbumUrl?.get(partyId) ?? null;
  },
  async setUrl(partyId, url) {
    mem.__cgAlbumUrl ??= new Map();
    mem.__cgAlbumUrl.set(partyId, url);
  },
  async reset(partyId) {
    mem.__cgAlbum?.set(partyId, []);
    mem.__cgAlbumUrl?.set(partyId, null);
  },
};

// Postgres

const g = globalThis as unknown as { __cgAlbumSchema?: Promise<void> };

function ensureSchema() {
  g.__cgAlbumSchema ??= pool()
    .query(
      `CREATE TABLE IF NOT EXISTS album_photos (
        id uuid PRIMARY KEY,
        party_id text NOT NULL,
        guest text NOT NULL,
        mime text NOT NULL,
        width integer NOT NULL,
        height integer NOT NULL,
        data bytea NOT NULL,
        thumb bytea NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS album_photos_party_created ON album_photos (party_id, created_at DESC);
      CREATE TABLE IF NOT EXISTS party_settings (
        party_id text PRIMARY KEY,
        album_url text NULL
      );`,
    )
    .then(() => undefined)
    .catch((err) => {
      g.__cgAlbumSchema = undefined;
      throw err;
    });
  return g.__cgAlbumSchema;
}

type Row = { id: string; guest: string; width: number; height: number; created_at: Date };

const pgAlbum: AlbumStore = {
  async list(partyId) {
    await ensureSchema();
    const { rows } = await pool().query<Row>(
      `SELECT id, guest, width, height, created_at FROM album_photos
        WHERE party_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [partyId, MAX_PHOTOS_PER_PARTY],
    );
    return rows.map((r) => ({
      id: r.id,
      guest: r.guest,
      ...urls(partyId, r.id),
      width: r.width,
      height: r.height,
      createdAt: r.created_at.toISOString(),
    }));
  },
  async add(partyId, p) {
    await ensureSchema();
    const { rows } = await pool().query<{ n: number }>("SELECT count(*)::int AS n FROM album_photos WHERE party_id = $1", [
      partyId,
    ]);
    if ((rows[0]?.n ?? 0) >= MAX_PHOTOS_PER_PARTY) throw new AlbumFullError();
    const id = randomUUID();
    const res = await pool().query<{ created_at: Date }>(
      `INSERT INTO album_photos (id, party_id, guest, mime, width, height, data, thumb)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING created_at`,
      [id, partyId, p.guest, p.mime, p.width, p.height, p.data, p.thumb],
    );
    return {
      id,
      guest: p.guest,
      ...urls(partyId, id),
      width: p.width,
      height: p.height,
      createdAt: res.rows[0].created_at.toISOString(),
    };
  },
  async image(partyId, photoId, size) {
    await ensureSchema();
    const col = size === "thumb" ? "thumb" : "data";
    const { rows } = await pool().query<{ mime: string; data: Buffer }>(
      `SELECT ${size === "thumb" ? "'image/jpeg'" : "mime"} AS mime, ${col} AS data FROM album_photos
        WHERE party_id = $1 AND id = $2`,
      [partyId, photoId],
    );
    return rows[0] ?? null;
  },
  async remove(partyId, photoId) {
    await ensureSchema();
    const res = await pool().query("DELETE FROM album_photos WHERE party_id = $1 AND id = $2", [partyId, photoId]);
    return (res.rowCount ?? 0) > 0;
  },
  async getUrl(partyId) {
    await ensureSchema();
    const { rows } = await pool().query<{ album_url: string | null }>(
      "SELECT album_url FROM party_settings WHERE party_id = $1",
      [partyId],
    );
    return rows[0]?.album_url ?? null;
  },
  async setUrl(partyId, url) {
    await ensureSchema();
    await pool().query(
      `INSERT INTO party_settings (party_id, album_url) VALUES ($1, $2)
       ON CONFLICT (party_id) DO UPDATE SET album_url = EXCLUDED.album_url`,
      [partyId, url],
    );
  },
  async reset(partyId) {
    await ensureSchema();
    await pool().query("DELETE FROM album_photos WHERE party_id = $1", [partyId]);
    await pool().query("UPDATE party_settings SET album_url = NULL WHERE party_id = $1", [partyId]);
  },
};

export function albumStore(): AlbumStore {
  return process.env.DATABASE_URL ? pgAlbum : memoryAlbum;
}

export async function albumState(partyId: string): Promise<AlbumState> {
  const s = albumStore();
  const [uploaded, albumUrl] = await Promise.all([s.list(partyId), s.getUrl(partyId)]);
  const photos = isDemo(partyId) ? [...uploaded, ...seedPhotos()] : uploaded;
  return {
    albumUrl,
    photos,
    count: photos.length,
    guests: new Set(photos.map((p) => p.guest.toLowerCase())).size,
  };
}
