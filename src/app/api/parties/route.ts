import { connection } from "next/server";
import { TooManyPartiesError, createParty, parseNewParty, recentParties } from "@/lib/server/parties";
import { NO_STORE, rateLimited } from "@/lib/server/party-api";

/** Список событий (всё открыто всем) */
export async function GET() {
  await connection();
  return Response.json(await recentParties(), { headers: NO_STORE });
}

/** Мастер создаёт событие → { id }: дальше /party/<id> для организатора и /p/<id> для гостей */
export async function POST(req: Request) {
  if (rateLimited(req)) return Response.json({ error: "Too many tries, wait a minute" }, { status: 429, headers: NO_STORE });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400, headers: NO_STORE });
  }

  const parsed = parseNewParty(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 422, headers: NO_STORE });

  try {
    const party = await createParty(parsed.party);
    return Response.json(party, { status: 201, headers: NO_STORE });
  } catch (err) {
    if (err instanceof TooManyPartiesError) {
      return Response.json({ error: "We’re full for the demo, try later" }, { status: 409, headers: NO_STORE });
    }
    throw err;
  }
}
