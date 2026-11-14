"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PartyState } from "@/lib/party-state";

// Живое состояние события: опрос сервера раз в intervalMs (≤ 2 с по ТЗ). Первое состояние приходит со страницы (сервер).
// Опрос, а не WebSocket: проще и надёжнее за прокси, 30 телефонов × 1 запрос/с — копейки.
export function useParty(partyId: string, initial: PartyState, intervalMs = 1200) {
  const [state, setState] = useState<PartyState>(initial);
  const [live, setLive] = useState(true);
  const version = useRef(initial.version);

  const accept = useCallback((next: PartyState) => {
    setLive(true);
    if (next.version === version.current) return;
    version.current = next.version;
    setState(next);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/party/${partyId}/state`, { cache: "no-store" });
      if (res.ok) accept((await res.json()) as PartyState);
      else setLive(false);
    } catch {
      setLive(false);
    }
  }, [accept, partyId]);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (!document.hidden) await refresh();
      if (!stopped) timer = setTimeout(tick, intervalMs);
    };
    timer = setTimeout(tick, intervalMs);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [refresh, intervalMs]);

  return { state, live, accept, refresh };
}

export type PostResult = { ok: true; state: PartyState } | { ok: false; error: string };

export async function postPartyEvent(
  partyId: string,
  body: {
    guest: string;
    rsvp: "yes" | "no" | null;
    amount?: number;
    tip?: number;
    method?: "test" | "external";
  },
): Promise<PostResult> {
  try {
    const res = await fetch(`/api/party/${partyId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: typeof data.error === "string" ? data.error : "Bad request" };
    return { ok: true, state: data as PartyState };
  } catch {
    return { ok: false, error: "No connection, try again" };
  }
}
