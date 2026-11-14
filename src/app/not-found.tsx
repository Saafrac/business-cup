import Link from "next/link";
import { Note } from "@/components/shell";
import { ROUTES } from "@/lib/demo";

export default function NotFound() {
  return (
    <div className="paper flex min-h-dvh items-center justify-center bg-paper px-md text-ink">
      <div className="w-full max-w-[420px]">
        <Note bg="var(--color-card)" tilt={-1} className="flex flex-col gap-md px-lg py-xl">
          <span className="figure text-3xl text-accent">404</span>
          <h1 className="text-3xl">We can’t find this page</h1>
          <p className="text-ink-2">The link may have a typo, or the gift page was never created. Ask whoever sent it for a fresh link.</p>
          <div className="flex flex-wrap gap-sm pt-xs">
            <Link className="btn btn--primary" href="/parties">
              See all parties
            </Link>
            <Link className="btn" href={ROUTES.newParty}>
              Start a gift page
            </Link>
          </div>
        </Note>
      </div>
    </div>
  );
}
