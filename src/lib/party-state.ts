// Состояние события считается из ленты событий (RSVP и взносы).
// Модуль общий для сервера и браузера: сервер отдаёт события → клиент и сервер считают одно и то же.
import { GUESTS } from "@/lib/demo";

export type Method = "card" | "external" | "test";
export type Rsvp = "yes" | "no";

export type PartyEvent = {
  id: string;
  guest: string;
  rsvp: Rsvp | null;
  amountCents: number;
  tipCents: number;
  method: Method | null;
  createdAt: string;
};

export type NewEvent = Omit<PartyEvent, "id" | "createdAt">;

export type GuestStatus = "paid" | "external" | "yes" | "no" | "open";

export type Guest = { name: string; status: GuestStatus; amountCents: number };

export type FeedItem = { id: string; guest: string; text: string; amountCents: number };

export type PartyState = {
  raisedCents: number;
  contributors: number;
  invited: number;
  coming: number;
  quiet: number;
  guests: Guest[];
  feed: FeedItem[];
  version: string;
};

/** Засев: 14 гостей уже скинулись на $210 — жюри своими взносами доводит до $300 */
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
  ...SEED_PAID.map(([guest, usd, method]): NewEvent => ({
    guest,
    rsvp: "yes",
    amountCents: usd * 100,
    tipCents: 0,
    method,
  })),
  ...SEED_RSVP.map(([guest, rsvp]): NewEvent => ({ guest, rsvp, amountCents: 0, tipCents: 0, method: null })),
];

export function eventText(e: Pick<PartyEvent, "guest" | "rsvp" | "amountCents" | "method">) {
  const who = e.guest;
  if (e.amountCents > 0) return e.method === "external" ? `${who} paid by Venmo` : `${who} chipped in`;
  if (e.rsvp === "yes") return `${who} is coming`;
  if (e.rsvp === "no") return `${who} can’t make it`;
  return `${who} opened the invite`;
}

/**
 * roster — заранее известный список гостей (есть только у демо: плитки «No answer» с самого начала);
 * у нового события гости появляются, когда отвечают. invited — сколько позвали.
 */
export function buildState(events: PartyEvent[], roster: readonly string[] = [], invitedBase = roster.length): PartyState {
  const sorted = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const byGuest = new Map<string, { rsvp: Rsvp | null; amount: number; external: boolean; card: boolean }>();
  const order: string[] = [...roster];
  let raised = 0;

  for (const e of sorted) {
    const key = canonicalGuest(e.guest);
    if (!byGuest.has(key)) {
      byGuest.set(key, { rsvp: null, amount: 0, external: false, card: false });
      if (!order.includes(key)) order.push(key);
    }
    const g = byGuest.get(key)!;
    if (e.rsvp) g.rsvp = e.rsvp;
    if (e.amountCents > 0) {
      g.amount += e.amountCents;
      raised += e.amountCents;
      if (e.method === "external") g.external = true;
      else g.card = true;
    }
  }

  const guests: Guest[] = order.map((name) => {
    const g = byGuest.get(name);
    if (!g) return { name, status: "open", amountCents: 0 };
    const status: GuestStatus =
      g.amount > 0 ? (g.card ? "paid" : "external") : g.rsvp === "yes" ? "yes" : g.rsvp === "no" ? "no" : "open";
    return { name, status, amountCents: g.amount };
  });

  const feed = sorted
    .slice(-6)
    .reverse()
    .map((e) => {
      const guest = canonicalGuest(e.guest);
      return { id: e.id, guest, text: eventText({ ...e, guest }), amountCents: e.amountCents };
    });

  const last = sorted[sorted.length - 1];
  return {
    raisedCents: raised,
    contributors: guests.filter((g) => g.amountCents > 0).length,
    invited: Math.max(invitedBase, guests.length),
    coming: guests.filter((g) => g.status !== "no" && g.status !== "open").length,
    quiet: guests.filter((g) => g.status === "open").length,
    guests,
    feed,
    version: `${sorted.length}:${last?.id ?? ""}`,
  };
}

/** «liam », «LIAM» → «Liam»: одно имя гостя — одна плитка */
export function canonicalGuest(raw: string) {
  const s = raw.trim().replace(/\s+/g, " ");
  const known = GUESTS.find((k) => k.toLowerCase() === s.toLowerCase());
  if (known) return known;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const usdFromCents = (c: number) => `$${(c / 100).toFixed(2)}`;
export const usdShort = (c: number) => `$${Math.round(c / 100)}`;
