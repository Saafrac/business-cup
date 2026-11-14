import { Payout } from "@/components/party/payout";
import { PARTY } from "@/lib/demo";

export function generateStaticParams() {
  return [{ id: PARTY.id }];
}

export default function Page() {
  const id = PARTY.id;
  return <Payout id={id} />;
}
