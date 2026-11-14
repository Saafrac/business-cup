import { ClassWallet } from "@/components/class/class-wallet";
import { CLASS } from "@/lib/demo";

export function generateStaticParams() {
  return [{ id: CLASS.id }];
}

export default function Page() {
  return <ClassWallet />;
}
