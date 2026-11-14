import type { Metadata } from "next";
import { AlbumEntry } from "@/components/album/album-entry";
import { PARTY } from "@/lib/demo";

export const metadata: Metadata = {
  title: `${PARTY.honoree}’s party album: add photos`,
  robots: { index: false },
};

export function generateStaticParams() {
  return [{ slug: PARTY.slug }];
}

export default function Page() {
  return <AlbumEntry slug={PARTY.slug} />;
}
