import { AlbumManage } from "@/components/album/album-manage";
import { PARTY } from "@/lib/demo";

export function generateStaticParams() {
  return [{ id: PARTY.id }];
}

export default function Page() {
  return <AlbumManage id={PARTY.id} />;
}
