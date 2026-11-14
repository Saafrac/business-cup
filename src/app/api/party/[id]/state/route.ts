import { connection } from "next/server";
import { NO_STORE, knownParty, partyState } from "@/lib/server/party-api";

export async function GET(_req: Request, ctx: RouteContext<"/api/party/[id]/state">) {
  await connection();
  const { id } = await ctx.params;
  if (!knownParty(id)) return Response.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  return Response.json(await partyState(id), { headers: NO_STORE });
}
