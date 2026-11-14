import { DemoQr } from "@/components/party/demo-qr";
import { PARTY } from "@/lib/demo";

export function generateStaticParams() {
  return [{ id: PARTY.id }];
}

export default function Page() {
  return <DemoQr slug={PARTY.slug} />;
}
