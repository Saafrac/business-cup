import { Suspense } from "react";
import { AlbumManage } from "@/components/album/album-manage";
import { PageLoading } from "@/components/loading";
import { loadPartyWithAlbum } from "@/lib/server/load";

export default function Page({ params }: PageProps<"/party/[id]/album">) {
  return (
    <Suspense fallback={<PageLoading />}>
      {params.then(({ id }) => (
        <Load id={id} />
      ))}
    </Suspense>
  );
}

async function Load({ id }: { id: string }) {
  const { party, album } = await loadPartyWithAlbum(id);
  return <AlbumManage party={party} initial={album} />;
}
