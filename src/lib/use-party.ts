"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PARTY } from "@/lib/demo";
import { buildState, seedEventsForClient, type PartyState } from "@/lib/party-state";

const STATE_URL = `/api/party/${PARTY.id}/state`;

// Живое состояние события: опрос сервера раз в intervalMs (≤ 2 с по ТЗ).
// Опрос, а не WebSocket: проще и надёжнее за прокси Railway, 30 телефонов × 1 запрос/с — копейки.
export function useParty(intervalMs = 1200) {
  const [state, setState] = useState<PartyState>(() => buildState(seedEventsForClient()));
  const [live, setLive] = useState(false);
  const version = useRef("");

  const accept = useCallback((next: PartyState) => {
    setLive(true);
    if (next.version === version.current) return;
    version.current = next.version;
    setState(next);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(STATE_URL, { cache: "no-store" });
      if (res.ok) accept((await res.json()) as PartyState);
      else setLive(false);
    } catch {
      setLive(false);
    }
  }, [accept]);

  useEffect(() => {
    let stopped = false;
    const tick = async () => {
      if (!document.hidden) await refresh();
      if (!stopped) timer = setTimeout(tick, intervalMs);
    };
    let timer = setTimeout(tick, 0);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [refresh, intervalMs]);

  return { state, live, accept, refresh };
}

export type PostResult = { ok: true; state: PartyState } | { ok: false; error: string };

export async function postPartyEvent(body: {
  guest: string;
  rsvp: "yes" | "no" | null;
  amount?: number;
  tip?: number;
  method?: "test" | "external";
}): Promise<PostResult> {
  try {
    const res = await fetch(`/api/party/${PARTY.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: typeof data.error === "string" ? data.error : "Something went wrong, try again" };
    return { ok: true, state: data as PartyState };
  } catch {
    return { ok: false, error: "No connection, try again" };
  }
}
