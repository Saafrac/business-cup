import { Suspense } from "react";
import { PageLoading } from "@/components/loading";
import { DemoQr } from "@/components/party/demo-qr";
import { loadPartyWithState } from "@/lib/server/load";

export default function Page({ params }: PageProps<"/party/[id]/qr">) {
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
  return <DemoQr party={party} initial={state} />;
}
