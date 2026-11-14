import { connection } from "next/server";
import { albumStore } from "@/lib/server/album-store";
import { organizerAllowed } from "@/lib/server/organizer";
import { NO_STORE, knownParty } from "@/lib/server/party-api";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Картинка: ?size=thumb — превью для сетки, без параметра — полное фото. ?download=1 — сохранить файлом. */
export async function GET(req: Request, ctx: RouteContext<"/api/party/[id]/album/[photoId]">) {
  await connection();
  const { id, photoId } = await ctx.params;
  if (!knownParty(id) || !UUID_RE.test(photoId)) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const size = url.searchParams.get("size") === "thumb" ? "thumb" : "full";
  const img = await albumStore().image(id, photoId, size);
  if (!img) return new Response("Not found", { status: 404 });

  const ext = img.mime === "image/png" ? "png" : img.mime === "image/webp" ? "webp" : "jpg";
  const headers: Record<string, string> = {
    "Content-Type": img.mime,
    "Content-Length": String(img.data.length),
    // фото не меняется после загрузки: id новый на каждую загрузку
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  if (url.searchParams.get("download") === "1") {
    headers["Content-Disposition"] = `attachment; filename="party-photo-${photoId.slice(0, 8)}.${ext}"`;
  }
  return new Response(new Uint8Array(img.data), { headers });
}

/** Организатор убирает фото из альбома */
export async function DELETE(req: Request, ctx: RouteContext<"/api/party/[id]/album/[photoId]">) {
  const { id, photoId } = await ctx.params;
  if (!knownParty(id) || !UUID_RE.test(photoId)) return Response.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  if (!organizerAllowed(req)) return Response.json({ error: "Organizer code needed" }, { status: 403, headers: NO_STORE });
  const ok = await albumStore().remove(id, photoId);
  return Response.json({ ok }, { status: ok ? 200 : 404, headers: NO_STORE });
}
