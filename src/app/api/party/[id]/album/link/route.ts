import { albumHostAllowed } from "@/lib/album";
import { albumStore } from "@/lib/server/album-store";
import { organizerAllowed } from "@/lib/server/organizer";
import { NO_STORE, knownParty } from "@/lib/server/party-api";

/** Организатор задаёт ссылку на внешний альбом (фотограф выложил в Google Drive и т. п.) или убирает её: { url: string | null } */
export async function PUT(req: Request, ctx: RouteContext<"/api/party/[id]/album/link">) {
  const { id } = await ctx.params;
  if (!knownParty(id)) return Response.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  if (!organizerAllowed(req)) return Response.json({ error: "Organizer code needed" }, { status: 403, headers: NO_STORE });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400, headers: NO_STORE });
  }
  const raw = (body as { url?: unknown })?.url;

  if (raw === null || raw === "") {
    await albumStore().setUrl(id, null);
    return Response.json({ albumUrl: null }, { headers: NO_STORE });
  }
  if (typeof raw !== "string" || raw.length > 500) return Response.json({ error: "Paste a link" }, { status: 422, headers: NO_STORE });

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return Response.json({ error: "That doesn’t look like a link" }, { status: 422, headers: NO_STORE });
  }
  if (url.protocol !== "https:" || !albumHostAllowed(url.hostname)) {
    return Response.json(
      { error: "Use a Google Photos, Google Drive, Dropbox, iCloud, OneDrive, Flickr or Yandex Disk link" },
      { status: 422, headers: NO_STORE },
    );
  }
  await albumStore().setUrl(id, url.toString());
  return Response.json({ albumUrl: url.toString() }, { headers: NO_STORE });
}
