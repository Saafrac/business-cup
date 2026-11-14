import { connection } from "next/server";
import { Suspense } from "react";
import { PageLoading } from "@/components/loading";
import { PartiesView } from "@/components/party/parties-view";
import { recentParties } from "@/lib/server/parties";

export const metadata = { title: "Parties · Chip In" };

export default function PartiesPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PartiesList />
    </Suspense>
  );
}

/** Все события: в MVP открыты всем, без входа */
async function PartiesList() {
  await connection();
  const parties = await recentParties();
  return <PartiesView parties={parties} />;
}
