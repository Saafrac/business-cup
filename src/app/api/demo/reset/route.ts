import { timingSafeEqual } from "node:crypto";
import { DEMO_PARTY } from "@/lib/party";
import { albumStore } from "@/lib/server/album-store";
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
  await store().reset(DEMO_PARTY.id);
  await albumStore().reset(DEMO_PARTY.id);
  const state = await partyState(DEMO_PARTY);
  return Response.json({ store: storeKind(), raised: state.raisedCents / 100, contributors: state.contributors }, { headers: NO_STORE });
}
