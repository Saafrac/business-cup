import { timingSafeEqual } from "node:crypto";
import { PARTY } from "@/lib/demo";
import { NO_STORE, partyState } from "@/lib/server/party-api";
import { store, storeKind } from "@/lib/server/store";

function keyMatches(given: string | null) {
  const expected = process.env.DEMO_ADMIN_KEY;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Сброс демо к засеву ($210, 14 гостей) перед питчем. Ключ — переменная DEMO_ADMIN_KEY. */
export async function POST(req: Request) {
  if (!keyMatches(req.headers.get("x-demo-key"))) {
    return Response.json({ error: "Forbidden" }, { status: 403, headers: NO_STORE });
  }
  await store().reset(PARTY.id);
  const state = await partyState(PARTY.id);
  return Response.json({ store: storeKind(), raised: state.raisedCents / 100, contributors: state.contributors }, { headers: NO_STORE });
}
