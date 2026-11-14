import { Suspense } from "react";
import { DesignEditor } from "@/components/invite/design-editor";
import { PageLoading } from "@/components/loading";
import { loadPartyWithState } from "@/lib/server/load";

export default function Page({ params }: PageProps<"/party/[id]/invite">) {
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
  return <DesignEditor party={party} invited={state.invited} />;
}
