import "server-only";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { isDemo } from "@/lib/party";
import { SEED_EVENTS, type NewEvent, type PartyEvent } from "@/lib/party-state";

// Хранилище ленты событий. DATABASE_URL задан (Railway Postgres) — пишем в Postgres,
// иначе — в память процесса (локальная разработка, данные живут до перезапуска).

const MAX_EVENTS_PER_PARTY = 2000;

export class TooManyEventsError extends Error {}

interface Store {
  list(partyId: string): Promise<PartyEvent[]>;
  add(partyId: string, e: NewEvent): Promise<void>;
  reset(partyId: string): Promise<void>;
}

// Память

const memory = globalThis as unknown as { __cgEvents?: Map<string, PartyEvent[]> };

function seeded(partyId: string): PartyEvent[] {
  if (!isDemo(partyId)) return [];
  const base = Date.now() - SEED_EVENTS.length * 60_000;
  return SEED_EVENTS.map((e, i) => ({ ...e, id: randomUUID(), createdAt: new Date(base + i * 60_000).toISOString() }));
}

const memoryStore: Store = {
  async list(partyId) {
    memory.__cgEvents ??= new Map();
    if (!memory.__cgEvents.has(partyId)) memory.__cgEvents.set(partyId, seeded(partyId));
    return memory.__cgEvents.get(partyId)!;
  },
  async add(partyId, e) {
    const list = await memoryStore.list(partyId);
    if (list.length >= MAX_EVENTS_PER_PARTY) throw new TooManyEventsError();
    list.push({ ...e, id: randomUUID(), createdAt: new Date().toISOString() });
  },
  async reset(partyId) {
    memory.__cgEvents ??= new Map();
    memory.__cgEvents.set(partyId, seeded(partyId));
  },
};

// Postgres

const pgGlobal = globalThis as unknown as { __cgPool?: Pool; __cgSchema?: Promise<void> };

/** Общий пул Postgres (им же пользуется альбом) */
export function pool() {
  pgGlobal.__cgPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    // внутренний адрес Railway (*.railway.internal) — без TLS, публичный прокси — с TLS
    ssl: /railway\.internal|localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "") ? false : { rejectUnauthorized: false },
  });
  return pgGlobal.__cgPool;
}

function ensureSchema() {
  pgGlobal.__cgSchema ??= pool()
    .query(
      `CREATE TABLE IF NOT EXISTS party_events (
        id uuid PRIMARY KEY,
        party_id text NOT NULL,
        kid text NOT NULL,
        rsvp text NULL,
        amount_cents integer NOT NULL DEFAULT 0,
        tip_cents integer NOT NULL DEFAULT 0,
        method text NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS party_events_party_created ON party_events (party_id, created_at);`,
    )
    .then(() => undefined)
    .catch((err) => {
      pgGlobal.__cgSchema = undefined;
      throw err;
    });
  return pgGlobal.__cgSchema;
}

type Row = {
  id: string;
  kid: string;
  rsvp: "yes" | "no" | null;
  amount_cents: number;
  tip_cents: number;
  method: "card" | "external" | "test" | null;
  created_at: Date;
};

async function insertSeed(partyId: string) {
  if (!isDemo(partyId)) return;
  const base = Date.now() - SEED_EVENTS.length * 60_000;
  const client = await pool().connect();
  try {
    await client.query("BEGIN");
    // одна вставка засева даже при параллельных первых запросах
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [partyId]);
    const { rows } = await client.query("SELECT 1 FROM party_events WHERE party_id = $1 LIMIT 1", [partyId]);
    if (rows.length === 0) {
      for (const [i, e] of SEED_EVENTS.entries()) {
        await client.query(
          `INSERT INTO party_events (id, party_id, kid, rsvp, amount_cents, tip_cents, method, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [randomUUID(), partyId, e.guest, e.rsvp, e.amountCents, e.tipCents, e.method, new Date(base + i * 60_000)],
        );
      }
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

const pgStore: Store = {
  async list(partyId) {
    await ensureSchema();
    let { rows } = await pool().query<Row>(
      `SELECT id, kid, rsvp, amount_cents, tip_cents, method, created_at
         FROM party_events WHERE party_id = $1 ORDER BY created_at LIMIT $2`,
      [partyId, MAX_EVENTS_PER_PARTY],
    );
    if (rows.length === 0 && isDemo(partyId)) {
      await insertSeed(partyId);
      ({ rows } = await pool().query<Row>(
        `SELECT id, kid, rsvp, amount_cents, tip_cents, method, created_at
           FROM party_events WHERE party_id = $1 ORDER BY created_at LIMIT $2`,
        [partyId, MAX_EVENTS_PER_PARTY],
      ));
    }
    return rows.map((r) => ({
      id: r.id,
      guest: r.kid, // колонка kid в Postgres не переименована: на проде уже есть таблица
      rsvp: r.rsvp,
      amountCents: r.amount_cents,
      tipCents: r.tip_cents,
      method: r.method,
      createdAt: r.created_at.toISOString(),
    }));
  },
  async add(partyId, e) {
    await ensureSchema();
    const { rows } = await pool().query<{ n: number }>(
      "SELECT count(*)::int AS n FROM party_events WHERE party_id = $1",
      [partyId],
    );
    if ((rows[0]?.n ?? 0) >= MAX_EVENTS_PER_PARTY) throw new TooManyEventsError();
    await pool().query(
      `INSERT INTO party_events (id, party_id, kid, rsvp, amount_cents, tip_cents, method)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [randomUUID(), partyId, e.guest, e.rsvp, e.amountCents, e.tipCents, e.method],
    );
  },
  async reset(partyId) {
    await ensureSchema();
    await pool().query("DELETE FROM party_events WHERE party_id = $1", [partyId]);
    await insertSeed(partyId);
  },
};

export function store(): Store {
  return process.env.DATABASE_URL ? pgStore : memoryStore;
}

export function storeKind() {
  return process.env.DATABASE_URL ? "postgres" : "memory";
}
