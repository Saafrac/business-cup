import { isThemeId, themeOf } from "@/lib/invite-themes";
import { NO_STORE, rateLimited } from "@/lib/server/party-api";
import { setPartyTheme } from "@/lib/server/parties";

/** Организатор меняет дизайн приглашения: { theme: "dino" }. Кабинет открыт всем, как и остальные страницы организатора. */
export async function PUT(req: Request, ctx: RouteContext<"/api/party/[id]/theme">) {
  const { id } = await ctx.params;
  if (rateLimited(req)) return Response.json({ error: "Too many tries, wait a minute" }, { status: 429, headers: NO_STORE });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400, headers: NO_STORE });
  }
  const theme = (body as { theme?: unknown })?.theme;
  if (!isThemeId(theme)) return Response.json({ error: "Pick a design" }, { status: 422, headers: NO_STORE });

  const party = await setPartyTheme(id, theme, themeOf(theme).pro);
  if (!party) return Response.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  return Response.json({ theme: party.theme, isPro: party.isPro }, { headers: NO_STORE });
}
