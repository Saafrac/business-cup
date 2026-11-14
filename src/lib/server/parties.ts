import "server-only";
import { randomBytes } from "node:crypto";
import { DEFAULT_THEME, isThemeId, type ThemeId } from "@/lib/invite-themes";
import { DEMO_PARTY, OCCASIONS, isDemo, type NewParty, type Occasion, type PartyInfo } from "@/lib/party";
import { pool } from "@/lib/server/store";

// События: Postgres (таблица parties) при DATABASE_URL, иначе память. Демо-событие встроено в код, в базу не пишется.

const MAX_PARTIES = 5000;
const ID_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // без похожих символов: 0/o, 1/l/i

export class TooManyPartiesError extends Error {}

function newId() {
  const bytes = randomBytes(8);
  return Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join("");
}

const mem = globalThis as unknown as { __cgParties?: Map<string, PartyInfo> };
const memMap = () => (mem.__cgParties ??= new Map());

const g = globalThis as unknown as { __cgPartiesSchema?: Promise<void> };
function ensureSchema() {
  g.__cgPartiesSchema ??= pool()
    .query(
      `CREATE TABLE IF NOT EXISTS parties (
        id text PRIMARY KEY,
        occasion text NOT NULL,
        honoree text NOT NULL,
        age integer NULL,
        gift text NOT NULL,
        goal_cents integer NOT NULL,
        date text NOT NULL,
        time text NOT NULL,
        place text NOT NULL,
        place_note text NOT NULL DEFAULT '',
        deadline text NOT NULL,
        invited integer NOT NULL,
        is_pro boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS parties_created ON parties (created_at DESC);
      ALTER TABLE parties ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'classic';`,
    )
    .then(() => undefined)
    .catch((err) => {
      g.__cgPartiesSchema = undefined;
      throw err;
    });
  return g.__cgPartiesSchema;
}

type Row = {
  id: string;
  occasion: string;
  honoree: string;
  age: number | null;
  gift: string;
  goal_cents: number;
  date: string;
  time: string;
  place: string;
  place_note: string;
  deadline: string;
  invited: number;
  is_pro: boolean;
  theme: string;
  created_at: Date;
};

const fromRow = (r: Row): PartyInfo => ({
  id: r.id,
  occasion: (OCCASIONS as readonly string[]).includes(r.occasion) ? (r.occasion as Occasion) : "Other",
  honoree: r.honoree,
  age: r.age,
  gift: r.gift,
  goalCents: r.goal_cents,
  date: r.date,
  time: r.time,
  place: r.place,
  placeNote: r.place_note,
  deadline: r.deadline,
  invited: r.invited,
  isPro: r.is_pro,
  theme: isThemeId(r.theme) ? r.theme : DEFAULT_THEME,
  createdAt: r.created_at.toISOString(),
});

const hasDb = () => Boolean(process.env.DATABASE_URL);
const ID_RE = /^[a-z0-9]{4,16}$/;

// Тему демо можно поменять на питче: живёт в памяти процесса, в базу демо не пишется
const demoTheme = globalThis as unknown as { __cgDemoTheme?: ThemeId };
const demoParty = (): PartyInfo => ({ ...DEMO_PARTY, theme: demoTheme.__cgDemoTheme ?? DEMO_PARTY.theme });

export async function getParty(id: string): Promise<PartyInfo | null> {
  if (isDemo(id)) return demoParty();
  if (!ID_RE.test(id)) return null;
  if (!hasDb()) return memMap().get(id) ?? null;
  await ensureSchema();
  const { rows } = await pool().query<Row>("SELECT * FROM parties WHERE id = $1", [id]);
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function partyExists(id: string) {
  return (await getParty(id)) !== null;
}

/** Последние события для списка «Parties» (всё открыто всем) — демо первым */
export async function recentParties(limit = 50): Promise<PartyInfo[]> {
  let list: PartyInfo[];
  if (!hasDb()) {
    list = [...memMap().values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  } else {
    await ensureSchema();
    const { rows } = await pool().query<Row>("SELECT * FROM parties ORDER BY created_at DESC LIMIT $1", [limit]);
    list = rows.map(fromRow);
  }
  return [demoParty(), ...list];
}

export async function createParty(p: NewParty): Promise<PartyInfo> {
  if (!hasDb()) {
    if (memMap().size >= MAX_PARTIES) throw new TooManyPartiesError();
    const party: PartyInfo = { ...p, id: newId(), createdAt: new Date().toISOString() };
    memMap().set(party.id, party);
    return party;
  }
  await ensureSchema();
  const { rows: cnt } = await pool().query<{ n: number }>("SELECT count(*)::int AS n FROM parties");
  if ((cnt[0]?.n ?? 0) >= MAX_PARTIES) throw new TooManyPartiesError();
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = newId();
    const { rows } = await pool().query<Row>(
      `INSERT INTO parties (id, occasion, honoree, age, gift, goal_cents, date, time, place, place_note, deadline, invited, is_pro, theme)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING RETURNING *`,
      [id, p.occasion, p.honoree, p.age, p.gift, p.goalCents, p.date, p.time, p.place, p.placeNote, p.deadline, p.invited, p.isPro, p.theme],
    );
    if (rows[0]) return fromRow(rows[0]);
  }
  throw new Error("Could not allocate a party id");
}

/** Сменить дизайн приглашения. Pro-тема делает событие Pro (в демо оплата не списывается) */
export async function setPartyTheme(id: string, theme: ThemeId, pro: boolean): Promise<PartyInfo | null> {
  if (isDemo(id)) {
    demoTheme.__cgDemoTheme = theme;
    return demoParty();
  }
  if (!ID_RE.test(id)) return null;
  if (!hasDb()) {
    const p = memMap().get(id);
    if (!p) return null;
    const next = { ...p, theme, isPro: p.isPro || pro };
    memMap().set(id, next);
    return next;
  }
  await ensureSchema();
  const { rows } = await pool().query<Row>(
    "UPDATE parties SET theme = $2, is_pro = is_pro OR $3 WHERE id = $1 RETURNING *",
    [id, theme, pro],
  );
  return rows[0] ? fromRow(rows[0]) : null;
}

type Parsed = { ok: true; party: NewParty } | { ok: false; error: string };

const NAME_RE = /^[\p{L}\p{M}' .&-]{1,40}$/u;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
const validDate = (s: string) => DATE_RE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

/** Проверка формы мастера: всё, что придёт в базу и на страницы гостей */
export function parseNewParty(body: unknown): Parsed {
  if (!body || typeof body !== "object") return { ok: false, error: "Bad request" };
  const b = body as Record<string, unknown>;

  const occasion = (OCCASIONS as readonly string[]).includes(String(b.occasion)) ? (b.occasion as Occasion) : null;
  if (!occasion) return { ok: false, error: "Pick the occasion" };

  const honoree = text(b.honoree, 40);
  if (!NAME_RE.test(honoree)) return { ok: false, error: "Type a first name for who it’s for" };

  const ageNum = Number(b.age);
  const age = occasion === "Birthday" && Number.isInteger(ageNum) && ageNum >= 1 && ageNum <= 120 ? ageNum : null;

  const gift = text(b.gift, 80);
  if (gift.length < 2) return { ok: false, error: "Name the gift" };

  const goal = Number(b.goal);
  if (!Number.isFinite(goal) || goal < 5 || goal > 10000) return { ok: false, error: "Set a goal from $5 to $10,000" };

  const date = text(b.date, 10);
  const deadline = text(b.deadline, 10);
  if (!validDate(date)) return { ok: false, error: "Pick the date" };
  if (!validDate(deadline)) return { ok: false, error: "Pick when to collect money until" };

  const time = text(b.time, 5);
  if (!TIME_RE.test(time)) return { ok: false, error: "Pick the time" };

  const place = text(b.place, 80);
  if (!place) return { ok: false, error: "Add the place" };

  const invited = Number(b.invited);
  if (!Number.isInteger(invited) || invited < 1 || invited > 200) return { ok: false, error: "Guests: from 1 to 200" };

  return {
    ok: true,
    party: {
      occasion,
      honoree,
      age,
      gift,
      goalCents: Math.round(goal * 100),
      date,
      time,
      place,
      placeNote: text(b.placeNote, 80),
      deadline,
      invited,
      isPro: b.isPro === true,
      theme: isThemeId(b.theme) ? b.theme : DEFAULT_THEME,
    },
  };
}
