import { Suspense } from "react";
import { PageLoading } from "@/components/loading";
import { Dashboard } from "@/components/party/dashboard";
import { loadPartyWithState } from "@/lib/server/load";

export default function Page({ params }: PageProps<"/party/[id]">) {
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
  return <Dashboard party={party} initial={state} />;
}
