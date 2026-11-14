import "server-only";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { albumState } from "@/lib/server/album-store";
import { getParty } from "@/lib/server/parties";
import { partyState } from "@/lib/server/party-api";

// Страницы события грузят его на сервере: первая отрисовка сразу со своими данными, неизвестный id — 404.

export async function loadParty(id: string) {
  await connection();
  const party = await getParty(id);
  if (!party) notFound();
  return party;
}

export async function loadPartyWithState(id: string) {
  const party = await loadParty(id);
  return { party, state: await partyState(party) };
}

export async function loadPartyWithAlbum(id: string) {
  const party = await loadParty(id);
  return { party, album: await albumState(party.id) };
}
