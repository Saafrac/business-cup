import { DreamFundPage } from "@/components/dream/dream-fund";
import { DREAM } from "@/lib/demo";

export function generateStaticParams() {
  return [{ slug: DREAM.slug }];
}

export default function Page() {
  return <DreamFundPage />;
}
