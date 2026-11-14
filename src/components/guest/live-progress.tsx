"use client";

import { Bar } from "@/components/shell";
import { PARTY } from "@/lib/demo";
import { usdShort } from "@/lib/party-state";
import { useParty } from "@/lib/use-party";

/** Прогресс сбора на «Спасибо» — живой, гость видит, как его взнос сдвинул полосу */
export function LiveProgress() {
  const { state } = useParty(2000);
  const raised = usdShort(state.raisedCents);
  return (
    <div className="flex flex-col gap-xs px-md pt-xl">
      <Bar ratio={state.raisedCents / (PARTY.goal * 100)} label={`${raised} of $${PARTY.goal} raised`} />
      <p className="text-sm font-extrabold">
        {raised} of ${PARTY.goal}, from {state.families} of {state.invited} families
      </p>
    </div>
  );
}
