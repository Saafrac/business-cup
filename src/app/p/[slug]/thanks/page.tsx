import { Suspense } from "react";
import { PageLoading } from "@/components/loading";
import { ThanksView } from "@/components/guest/thanks-view";
import { loadPartyWithState } from "@/lib/server/load";

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default function ThanksPage(props: PageProps<"/p/[slug]/thanks">) {
  return (
    <Suspense fallback={<PageLoading phone />}>
      <Load params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Load({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, q] = await Promise.all([params, searchParams]);
  const { party, state } = await loadPartyWithState(slug);
  const how = one(q.how);
  return (
    <ThanksView
      party={party}
      state={state}
      guest={(one(q.guest) || "").slice(0, 40)}
      paid={Number(one(q.paid) ?? 0) || 0}
      how={how === "external" || how === "rsvp" ? how : "card"}
    />
  );
}
