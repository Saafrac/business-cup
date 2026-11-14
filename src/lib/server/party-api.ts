import "server-only";
import { PARTY } from "@/lib/demo";
import { buildState, canonicalGuest, type NewEvent } from "@/lib/party-state";
import { store } from "@/lib/server/store";

export const NO_STORE = { "Cache-Control": "no-store" };

export function knownParty(id: string) {
  return id === PARTY.id;
}

export async function partyState(id: string) {
  return buildState(await store().list(id));
}

type Parsed = { ok: true; event: NewEvent } | { ok: false; error: string };

const NAME_RE = /^[\p{L}\p{M}' .-]{1,40}$/u;
const MIN_USD = 5;
const MAX_USD = 500;

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

  return {
    ok: true,
    event: { guest: canonicalGuest(guest), rsvp, amountCents: amount, tipCents: amount > 0 ? tip : 0, method: amount > 0 ? method : null },
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
