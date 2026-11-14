import { Dashboard } from "@/components/party/dashboard";
import { PARTY } from "@/lib/demo";

export function generateStaticParams() {
  return [{ id: PARTY.id }];
}

export default function Page() {
  const id = PARTY.id;
  return <Dashboard id={id} />;
}
