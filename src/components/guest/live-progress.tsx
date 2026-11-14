"use client";

import { Bar } from "@/components/shell";
import { goalUsd, type PartyInfo } from "@/lib/party";
import { usdShort, type PartyState } from "@/lib/party-state";
import { useParty } from "@/lib/use-party";

/** Прогресс сбора на «Спасибо» — живой, гость видит, как его взнос сдвинул полосу */
export function LiveProgress({ party, initial }: { party: PartyInfo; initial: PartyState }) {
  const { state } = useParty(party.id, initial, 2000);
  const raised = usdShort(state.raisedCents);
  return (
    <div className="flex flex-col gap-xs px-md pt-xl">
      <Bar ratio={state.raisedCents / party.goalCents} label={`${raised} of $${goalUsd(party)} raised`} />
      <p className="text-sm font-extrabold">
        {raised} of ${goalUsd(party)}, from {state.contributors} of {state.invited} guests
      </p>
    </div>
  );
}
