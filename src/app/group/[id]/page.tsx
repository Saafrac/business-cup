import { GroupWallet } from "@/components/group/group-wallet";
import { GROUP } from "@/lib/demo";

export function generateStaticParams() {
  return [{ id: GROUP.id }];
}

export default function Page() {
  return <GroupWallet />;
}
