// Состояние праздника считается из ленты событий (RSVP и взносы).
// Модуль общий для сервера и браузера: сервер отдаёт события → клиент и сервер считают одно и то же.
import { KIDS } from "@/lib/demo";

export type Method = "card" | "external" | "test";
export type Rsvp = "yes" | "no";

export type PartyEvent = {
  id: string;
  kid: string;
  rsvp: Rsvp | null;
  amountCents: number;
  tipCents: number;
  method: Method | null;
  createdAt: string;
};

export type NewEvent = Omit<PartyEvent, "id" | "createdAt">;

export type GuestStatus = "paid" | "external" | "yes" | "no" | "open";

export type Guest = { kid: string; status: GuestStatus; amountCents: number };

export type FeedItem = { id: string; kid: string; text: string; amountCents: number };

export type PartyState = {
  raisedCents: number;
  families: number;
  invited: number;
  coming: number;
  quiet: number;
  guests: Guest[];
  feed: FeedItem[];
  version: string;
};

/** Засев: 14 семей уже скинулись на $210 — жюри своими взносами доводит до $300 */
const SEED_PAID: Array<[string, number, Method]> = [
  ["Liam", 20, "card"],
  ["Ava", 25, "card"],
  ["Sophia", 15, "card"],
  ["Lucas", 15, "card"],
  ["Olivia", 15, "external"],
  ["Amelia", 10, "card"],
  ["James", 15, "card"],
  ["Ben", 15, "card"],
  ["Evelyn", 10, "card"],
  ["Abigail", 15, "card"],
  ["Jack", 10, "card"],
  ["Ella", 15, "card"],
  ["Leo", 10, "card"],
  ["Grace", 20, "card"],
];
const SEED_RSVP: Array<[string, Rsvp]> = [
  ["Mason", "yes"],
  ["Henry", "yes"],
  ["Chloe", "yes"],
  ["Mia", "no"],
];

export const SEED_EVENTS: NewEvent[] = [
  ...SEED_PAID.map(([kid, usd, method]): NewEvent => ({
    kid,
    rsvp: "yes",
    amountCents: usd * 100,
    tipCents: 0,
    method,
  })),
  ...SEED_RSVP.map(([kid, rsvp]): NewEvent => ({ kid, rsvp, amountCents: 0, tipCents: 0, method: null })),
];

/** Засев с фиктивными id и временем — для первой отрисовки до ответа сервера */
export function seedEventsForClient(): PartyEvent[] {
  const base = Date.UTC(2026, 10, 30, 18, 0, 0);
  return SEED_EVENTS.map((e, i) => ({ ...e, id: `seed-${i}`, createdAt: new Date(base + i * 60_000).toISOString() }));
}

export function eventText(e: Pick<PartyEvent, "kid" | "rsvp" | "amountCents" | "method">) {
  const who = `${e.kid}’s family`;
  if (e.amountCents > 0) return e.method === "external" ? `${who} paid by Venmo` : `${who} chipped in`;
  if (e.rsvp === "yes") return `${who} is coming`;
  if (e.rsvp === "no") return `${who} can’t make it`;
  return `${who} opened the invite`;
}

export function buildState(events: PartyEvent[], invitedBase = KIDS.length): PartyState {
  const sorted = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const byKid = new Map<string, { rsvp: Rsvp | null; amount: number; external: boolean; card: boolean }>();
  const order: string[] = [...KIDS];
  let raised = 0;

  for (const e of sorted) {
    const key = canonicalKid(e.kid);
    if (!byKid.has(key)) {
      byKid.set(key, { rsvp: null, amount: 0, external: false, card: false });
      if (!order.includes(key)) order.push(key);
    }
    const g = byKid.get(key)!;
    if (e.rsvp) g.rsvp = e.rsvp;
    if (e.amountCents > 0) {
      g.amount += e.amountCents;
      raised += e.amountCents;
      if (e.method === "external") g.external = true;
      else g.card = true;
    }
  }

  const guests: Guest[] = order.map((kid) => {
    const g = byKid.get(kid);
    if (!g) return { kid, status: "open", amountCents: 0 };
    const status: GuestStatus =
      g.amount > 0 ? (g.card ? "paid" : "external") : g.rsvp === "yes" ? "yes" : g.rsvp === "no" ? "no" : "open";
    return { kid, status, amountCents: g.amount };
  });

  const feed = sorted
    .slice(-6)
    .reverse()
    .map((e) => ({ id: e.id, kid: canonicalKid(e.kid), text: eventText({ ...e, kid: canonicalKid(e.kid) }), amountCents: e.amountCents }));

  const last = sorted[sorted.length - 1];
  return {
    raisedCents: raised,
    families: guests.filter((g) => g.amountCents > 0).length,
    invited: Math.max(invitedBase, guests.length),
    coming: guests.filter((g) => g.status !== "no" && g.status !== "open").length,
    quiet: guests.filter((g) => g.status === "open").length,
    guests,
    feed,
    version: `${sorted.length}:${last?.id ?? ""}`,
  };
}

/** «liam », «LIAM» → «Liam»: одно имя ребёнка — одна плитка */
export function canonicalKid(raw: string) {
  const s = raw.trim().replace(/\s+/g, " ");
  const known = KIDS.find((k) => k.toLowerCase() === s.toLowerCase());
  if (known) return known;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const usdFromCents = (c: number) => `$${(c / 100).toFixed(2)}`;
export const usdShort = (c: number) => `$${Math.round(c / 100)}`;
