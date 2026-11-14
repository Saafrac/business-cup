import { GuestPage } from "@/components/guest/guest-page";
import { PARTY } from "@/lib/demo";

export function generateStaticParams() {
  return [{ slug: PARTY.slug }];
}

export default function Page() {
  const slug = PARTY.slug;
  return <GuestPage slug={slug} />;
}
