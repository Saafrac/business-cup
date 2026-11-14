import "server-only";
import { rosterFor, type PartyInfo } from "@/lib/party";
import { buildState, canonicalGuest, type NewEvent } from "@/lib/party-state";
import { partyExists } from "@/lib/server/parties";
import { store } from "@/lib/server/store";

export const NO_STORE = { "Cache-Control": "no-store" };

export async function knownParty(id: string) {
  return partyExists(id);
}

export async function partyState(p: Pick<PartyInfo, "id" | "invited">) {
  return buildState(await store().list(p.id), rosterFor(p.id), p.invited);
}

type Parsed = { ok: true; event: NewEvent } | { ok: false; error: string };

const NAME_RE = /^[\p{L}\p{M}' .-]{1,40}$/u;
const MIN_USD = 5;
const MAX_USD = 500;
const MAX_PEOPLE = 20;
const MAX_NOTE = 140;

/** Проверка тела запроса от гостя: имя, RSVP, сумма в долларах, чаевые, способ */
export function parseGuestEvent(body: unknown): Parsed {
  if (!body || typeof body !== "object") return { ok: false, error: "Bad request" };
  const b = body as Record<string, unknown>;

  const guest = typeof b.guest === "string" ? b.guest.trim().replace(/\s+/g, " ") : "";
  if (!NAME_RE.test(guest)) return { ok: false, error: "Type your name" };

  const rsvp = b.rsvp === "yes" || b.rsvp === "no" ? b.rsvp : null;

  const amount = typeof b.amount === "number" && Number.isFinite(b.amount) ? Math.round(b.amount * 100) : 0;
  if (amount !== 0 && (amount < MIN_USD * 100 || amount > MAX_USD * 100)) {
    return { ok: false, error: `Chip in from $${MIN_USD} to $${MAX_USD}` };
  }

  const tip = typeof b.tip === "number" && Number.isFinite(b.tip) ? Math.round(b.tip * 100) : 0;
  if (tip < 0 || tip > amount) return { ok: false, error: "Bad tip" };

  // карты в демо нет: со страницы приходит только тестовый платёж или отметка «заплатил через Venmo»
  const method = b.method === "test" || b.method === "external" ? b.method : null;
  if (amount > 0 && !method) return { ok: false, error: "Pick how you paid" };
  if (amount === 0 && !rsvp) return { ok: false, error: "Nothing to save" };

  // ответы шагов RSVP: сколько человек придёт и аллергии — только вместе с «приду»
  const peopleNum = Number(b.people);
  const people = rsvp === "yes" && Number.isInteger(peopleNum) && peopleNum >= 1 && peopleNum <= MAX_PEOPLE ? peopleNum : null;
  const note =
    rsvp === "yes" && typeof b.note === "string" ? b.note.replace(/[\u0000-\u001f\u007f]/g, " ").trim().replace(/\s+/g, " ").slice(0, MAX_NOTE) || null : null;

  return {
    ok: true,
    event: {
      guest: canonicalGuest(guest),
      rsvp,
      amountCents: amount,
      tipCents: amount > 0 ? tip : 0,
      method: amount > 0 ? method : null,
      people,
      note,
    },
  };
}

// Простой лимит частоты на процесс: защита от зажатой кнопки и скриптов в зале
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const LIMIT = 20;

export function rateLimited(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}
