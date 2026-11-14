import { connection } from "next/server";
import { canonicalGuest } from "@/lib/party-state";
import { AlbumFullError, albumState, albumStore } from "@/lib/server/album-store";
import { sniffImage, uploadLimited } from "@/lib/server/organizer";
import { NO_STORE, knownParty } from "@/lib/server/party-api";

const MAX_FULL = 6 * 1024 * 1024;
const MAX_THUMB = 400 * 1024;
const NAME_RE = /^[\p{L}\p{M}' .-]{1,40}$/u;

export async function GET(_req: Request, ctx: RouteContext<"/api/party/[id]/album">) {
  await connection();
  const { id } = await ctx.params;
  if (!knownParty(id)) return Response.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  return Response.json(await albumState(id), { headers: NO_STORE });
}

/** Гость добавляет фото: multipart с полным снимком (уже уменьшенным в браузере) и превью */
export async function POST(req: Request, ctx: RouteContext<"/api/party/[id]/album">) {
  const { id } = await ctx.params;
  if (!knownParty(id)) return Response.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  if (uploadLimited(req)) return Response.json({ error: "Too many uploads, wait a minute" }, { status: 429, headers: NO_STORE });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Bad upload" }, { status: 400, headers: NO_STORE });
  }

  const guest = String(form.get("guest") ?? "").trim().replace(/\s+/g, " ");
  if (!NAME_RE.test(guest)) return Response.json({ error: "Type your name" }, { status: 422, headers: NO_STORE });

  const file = form.get("file");
  const thumbFile = form.get("thumb");
  if (!(file instanceof File) || !(thumbFile instanceof File)) {
    return Response.json({ error: "No photo" }, { status: 422, headers: NO_STORE });
  }
  if (file.size > MAX_FULL || thumbFile.size > MAX_THUMB) {
    return Response.json({ error: "This photo is too big" }, { status: 413, headers: NO_STORE });
  }

  const data = Buffer.from(await file.arrayBuffer());
  const thumb = Buffer.from(await thumbFile.arrayBuffer());
  const mime = sniffImage(data);
  if (!mime || sniffImage(thumb) !== "image/jpeg") {
    return Response.json({ error: "Only JPEG, PNG or WebP photos" }, { status: 415, headers: NO_STORE });
  }

  const clamp = (v: FormDataEntryValue | null) => Math.min(10000, Math.max(1, Math.round(Number(v) || 1)));

  try {
    const photo = await albumStore().add(id, {
      guest: canonicalGuest(guest),
      mime,
      width: clamp(form.get("width")),
      height: clamp(form.get("height")),
      data,
      thumb,
    });
    return Response.json(photo, { status: 201, headers: NO_STORE });
  } catch (err) {
    if (err instanceof AlbumFullError) {
      return Response.json({ error: "The album is full" }, { status: 409, headers: NO_STORE });
    }
    throw err;
  }
}
