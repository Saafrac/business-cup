"use client";

import { Bar } from "@/components/shell";
import { useT } from "@/lib/i18n";
import { goalUsd, type PartyInfo } from "@/lib/party";
import { usdShort, type PartyState } from "@/lib/party-state";
import { useParty } from "@/lib/use-party";

/** Прогресс сбора на «Спасибо» — живой, гость видит, как его взнос сдвинул полосу */
export function LiveProgress({ party, initial }: { party: PartyInfo; initial: PartyState }) {
  const t = useT();
  const { state } = useParty(party.id, initial, 2000);
  const raised = usdShort(state.raisedCents);
  const goal = goalUsd(party);
  return (
    <div className="flex flex-col gap-xs px-md pt-xl">
      <Bar ratio={state.raisedCents / party.goalCents} label={t("g.raisedAria", { raised, goal })} />
      <p className="text-sm font-extrabold">{t("lp.line", { raised, goal, n: state.contributors, m: state.invited })}</p>
    </div>
  );
}
