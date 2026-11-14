import { Suspense } from "react";
import { GuestPage } from "@/components/guest/guest-page";
import { PageLoading } from "@/components/loading";
import { loadPartyWithState } from "@/lib/server/load";

export default function Page({ params }: PageProps<"/p/[slug]">) {
  return (
    <Suspense fallback={<PageLoading phone />}>
      {params.then(({ slug }) => (
        <Load slug={slug} />
      ))}
    </Suspense>
  );
}

async function Load({ slug }: { slug: string }) {
  const { party, state } = await loadPartyWithState(slug);
  return <GuestPage party={party} initial={state} />;
}
