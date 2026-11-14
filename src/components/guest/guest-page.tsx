"use client";

import { useState } from "react";
import { InviteView, type Answer } from "@/components/invite/invite-view";
import { RsvpFlow } from "@/components/invite/rsvp-flow";
import { PhoneColumn } from "@/components/shell";
import { partyUrls, type PartyInfo } from "@/lib/party";
import type { PartyState } from "@/lib/party-state";
import { useParty } from "@/lib/use-party";

/** Страница гостя: приглашение в выбранном дизайне → короткие шаги ответа. Переключатель языка — в шапке приглашения. */
export function GuestPage({ party, initial }: { party: PartyInfo; initial: PartyState }) {
  const { state, accept } = useParty(party.id, initial);
  const [flow, setFlow] = useState<{ start: Answer; key: number } | null>(null);

  const open = (a: Answer) => {
    setFlow({ start: a, key: Date.now() });
    window.scrollTo({ top: 0 });
  };

  return (
    <PhoneColumn>
      {flow ? (
        <RsvpFlow key={flow.key} party={party} state={state} start={flow.start} onState={accept} onClose={() => setFlow(null)} />
      ) : (
        <InviteView
          party={party}
          raisedCents={state.raisedCents}
          contributors={state.contributors}
          invited={state.invited}
          albumHref={partyUrls(party.id).album}
          onAnswer={open}
          className="min-h-dvh"
        />
      )}
    </PhoneColumn>
  );
}
