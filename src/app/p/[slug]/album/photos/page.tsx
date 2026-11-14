import { Suspense } from "react";
import { AlbumFeed } from "@/components/album/album-feed";
import { PageLoading } from "@/components/loading";
import { loadPartyWithAlbum } from "@/lib/server/load";

export const metadata = { title: "Photo album", robots: { index: false } };

export default function Page({ params }: PageProps<"/p/[slug]/album/photos">) {
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
  return <AlbumFeed party={party} initial={album} />;
}
