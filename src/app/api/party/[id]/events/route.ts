import { NO_STORE, knownParty, parseGuestEvent, partyState, rateLimited } from "@/lib/server/party-api";
import { TooManyEventsError, store } from "@/lib/server/store";

/** Гость отвечает на RSVP и/или делает тестовый взнос. Записывает только сервер, из браузера в базу не пишем. */
export async function POST(req: Request, ctx: RouteContext<"/api/party/[id]/events">) {
  const { id } = await ctx.params;
  if (!knownParty(id)) return Response.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  if (rateLimited(req)) return Response.json({ error: "Too many tries, wait a minute" }, { status: 429, headers: NO_STORE });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400, headers: NO_STORE });
  }

  const parsed = parseGuestEvent(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 422, headers: NO_STORE });

  try {
    await store().add(id, parsed.event);
  } catch (err) {
    if (err instanceof TooManyEventsError) {
      return Response.json({ error: "The demo is full, ask the team to reset it" }, { status: 409, headers: NO_STORE });
    }
    throw err;
  }
  return Response.json(await partyState(id), { status: 201, headers: NO_STORE });
}
