import type { Metadata } from "next";
import { AlbumFeed } from "@/components/album/album-feed";
import { PARTY } from "@/lib/demo";

export const metadata: Metadata = {
  title: `${PARTY.honoree}’s party album`,
  robots: { index: false },
};

export function generateStaticParams() {
  return [{ slug: PARTY.slug }];
}

export default function Page() {
  return <AlbumFeed slug={PARTY.slug} />;
}
