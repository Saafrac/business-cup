import { Suspense } from "react";
import { PageLoading } from "@/components/loading";
import { Payout } from "@/components/party/payout";
import { loadPartyWithState } from "@/lib/server/load";

export default function Page({ params }: PageProps<"/party/[id]/payout">) {
  return (
    <Suspense fallback={<PageLoading />}>
      {params.then(({ id }) => (
        <Load id={id} />
      ))}
    </Suspense>
  );
}

async function Load({ id }: { id: string }) {
  const { party, state } = await loadPartyWithState(id);
  return <Payout party={party} initial={state} />;
}
