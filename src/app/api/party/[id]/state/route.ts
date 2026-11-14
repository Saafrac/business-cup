import { connection } from "next/server";
import { getParty } from "@/lib/server/parties";
import { NO_STORE, partyState } from "@/lib/server/party-api";

export async function GET(_req: Request, ctx: RouteContext<"/api/party/[id]/state">) {
  await connection();
  const { id } = await ctx.params;
  const party = await getParty(id);
  if (!party) return Response.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  return Response.json(await partyState(party), { headers: NO_STORE });
}
