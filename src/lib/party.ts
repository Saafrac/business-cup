// Событие (день рождения, свадьба, проводы…): общий тип и форматирование для сервера и браузера.
import { GUESTS } from "@/lib/demo";
import type { ThemeId } from "@/lib/invite-themes";

export const OCCASIONS = ["Birthday", "Wedding", "Baby shower", "Farewell", "Other"] as const;
export type Occasion = (typeof OCCASIONS)[number];

export type PartyInfo = {
  id: string;
  occasion: Occasion;
  honoree: string;
  age: number | null;
  gift: string;
  goalCents: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  place: string;
  placeNote: string;
  deadline: string; // YYYY-MM-DD
  invited: number;
  isPro: boolean;
  /** Дизайн приглашения */
  theme: ThemeId;
  createdAt: string;
};

export type NewParty = Omit<PartyInfo, "id" | "createdAt">;

/** Встроенное демо для питча: засев взносов и фото есть только у него */
export const DEMO_ID = "emma7k2q";

export const DEMO_PARTY: PartyInfo = {
  id: DEMO_ID,
  occasion: "Birthday",
  honoree: "Emma",
  age: 7,
  gift: "A 20-inch bike",
  goalCents: 30000,
  date: "2026-12-05",
  time: "14:00",
  place: "Riverside Park",
  placeNote: "Pavilion B, by the playground",
  deadline: "2026-12-03",
  invited: 25,
  isPro: true,
  theme: "dino",
  createdAt: "2026-11-14T10:00:00.000Z",
};

export const isDemo = (id: string) => id === DEMO_ID;
export const rosterFor = (id: string) => (isDemo(id) ? GUESTS : []);

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pad = (n: number) => String(n).padStart(2, "0");

function ymd(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? { y, m, d } : null;
}

export function dayLong(iso: string) {
  const p = ymd(iso);
  return p ? DAYS[new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay()] : "";
}
export const dayShort = (iso: string) => dayLong(iso).slice(0, 3);
export function mmdd(iso: string) {
  const p = ymd(iso);
  return p ? `${pad(p.m)}/${pad(p.d)}` : "—";
}
export function mmddyyyy(iso: string) {
  const p = ymd(iso);
  return p ? `${pad(p.m)}/${pad(p.d)}/${p.y}` : "—";
}
export function time12(t: string) {
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return "";
  return `${((h + 11) % 12) + 1}:${pad(m || 0)} ${h >= 12 ? "PM" : "AM"}`;
}

/** «Emma turns 7», «Kate’s wedding», «Tom’s farewell» */
export function partyTitle(p: Pick<PartyInfo, "occasion" | "honoree" | "age">) {
  const h = p.honoree;
  switch (p.occasion) {
    case "Birthday":
      return p.age ? `${h} turns ${p.age}` : `${h}’s birthday`;
    case "Wedding":
      return `${h}’s wedding`;
    case "Baby shower":
      return `${h}’s baby shower`;
    case "Farewell":
      return `${h}’s farewell`;
    default:
      return `${h}’s celebration`;
  }
}

/** Заголовок приглашения для гостя */
export function inviteHeadline(p: Pick<PartyInfo, "occasion" | "honoree" | "age">) {
  if (p.occasion === "Birthday" && p.age) return `${p.honoree} is turning ${p.age}`;
  return partyTitle(p);
}

function ordinal(n: number) {
  const t = n % 100;
  if (t >= 11 && t <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

/** Заголовок обложки приглашения: «You’re invited to Emma’s 7th birthday!» */
export function inviteTitle(p: Pick<PartyInfo, "occasion" | "honoree" | "age">) {
  const h = p.honoree;
  switch (p.occasion) {
    case "Birthday":
      return p.age ? `You’re invited to ${h}’s ${ordinal(p.age)} birthday!` : `You’re invited to ${h}’s birthday!`;
    case "Wedding":
      return `You’re invited to ${h}’s wedding!`;
    case "Baby shower":
      return `You’re invited to ${h}’s baby shower!`;
    case "Farewell":
      return `Come say goodbye to ${h}!`;
    default:
      return `You’re invited to celebrate ${h}!`;
  }
}

/** Ссылка «Add to calendar»: Google Calendar, событие на 2 часа */
export function calendarUrl(p: Pick<PartyInfo, "occasion" | "honoree" | "age" | "date" | "time" | "place" | "placeNote">) {
  const [h, m] = p.time.split(":").map(Number);
  const day = p.date.replaceAll("-", "");
  const end = Math.min(23, (h || 0) + 2);
  const stamp = (hh: number, mm: number) => `${day}T${pad(hh)}${pad(mm)}00`;
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: partyTitle(p),
    dates: `${stamp(h || 0, m || 0)}/${stamp(end, m || 0)}`,
    location: [p.place, p.placeNote].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export const directionsUrl = (place: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

/** Короткое имя подарка для фраз «Chip in for the bike» */
export function giftShort(gift: string) {
  const g = gift.toLowerCase();
  if (g.includes("bike")) return "bike";
  if (g.includes("telescope")) return "telescope";
  if (g.includes("art set")) return "art set";
  return "gift";
}

export const goalUsd = (p: Pick<PartyInfo, "goalCents">) => Math.round(p.goalCents / 100);

export const partyUrls = (id: string) => ({
  guest: `/p/${id}`,
  thanks: `/p/${id}/thanks`,
  album: `/p/${id}/album`,
  albumPhotos: `/p/${id}/album/photos`,
  dashboard: `/party/${id}`,
  payout: `/party/${id}/payout`,
  qr: `/party/${id}/qr`,
  albumManage: `/party/${id}/album`,
  design: `/party/${id}/invite`,
});
