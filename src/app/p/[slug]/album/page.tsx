import { Suspense } from "react";
import { AlbumEntry } from "@/components/album/album-entry";
import { PageLoading } from "@/components/loading";
import { loadPartyWithAlbum } from "@/lib/server/load";

export const metadata = { title: "Photo album: add photos", robots: { index: false } };

export default function Page({ params }: PageProps<"/p/[slug]/album">) {
  return (
    <Suspense fallback={<PageLoading phone />}>
      {params.then(({ slug }) => (
        <Load slug={slug} />
      ))}
    </Suspense>
  );
}

async function Load({ slug }: { slug: string }) {
  const { party, album } = await loadPartyWithAlbum(slug);
  return <AlbumEntry party={party} initial={album} />;
}
