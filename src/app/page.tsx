import Link from "next/link";
import type { ReactNode } from "react";
import { HeroDemo } from "@/components/landing/hero-demo";
import { ArrowRightIcon, QrIcon } from "@/components/icons";
import { Key, NameTag, Note, Wordmark, cn, type TagKind } from "@/components/shell";
import { KIDS, ROUTES } from "@/lib/demo";

const ROSTER_TILT = [-2, 1, -1, 2, 0, -1.5, 1.5];
const EXTERNAL = new Set(["Olivia", "Isabella", "Harper"]);
const NOT_YET = new Set(["Noah", "Ethan", "Wyatt"]);

const quote = "font-display text-lg leading-[1.3] font-medium tracking-[-0.01em]";

const PLANS = [
  { name: "Free", text: "Up to 15 guests, one class collection at a time", price: "$0" },
  { name: "Party Pro", text: "The whole class, automatic reminders, thank-you notes", price: "$9.99", per: "per party" },
  { name: "Class Wallet", text: "Every class collection, the paid roster, a year-end report", price: "$49", per: "per school year" },
];

export default function Landing() {
  return (
    <div className="paper w-full bg-paper text-ink">
      <header className="wrap flex flex-wrap items-center justify-between gap-md py-md">
        <Wordmark withMark />
        <nav aria-label="Main" className="flex flex-wrap items-center gap-2xs text-md font-bold">
          {[
            ["How it works", "#week"],
            ["Room parents", "#parents"],
            ["Pricing", "#pricing"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="flex min-h-11 items-center px-sm text-ink no-underline">
              {label}
            </a>
          ))}
          <Link href={ROUTES.login} className="flex min-h-11 items-center px-sm text-ink no-underline">
            Log in
          </Link>
        </nav>
      </header>

      <section id="top" className="wrap flex flex-wrap items-center gap-2xl pt-lg pb-2xl lg:min-h-[760px]">
        <div className="flex min-w-0 flex-[1_1_500px] flex-col gap-lg">
          <h1 className="max-w-[11ch]">The class birthday gift, in one link</h1>
          <p className="lead">Parents RSVP and chip in right from the class group chat.</p>
          <div className="flex flex-wrap gap-sm pt-xs">
            <Link className="btn btn--primary" href={ROUTES.newParty}>
              Start a birthday gift
            </Link>
            <Link className="btn" href={ROUTES.classWallet}>
              I’m a room parent
            </Link>
          </div>
        </div>
        <HeroDemo />
      </section>

      <section id="week" className="paper torn-top bg-paper-2 pt-(--section-gap) pb-(--section-gap-s)">
        <div className="wrap flex flex-col gap-2xl">
          <h2 className="max-w-[14ch]">Your part of the birthday week</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] border-t-2 border-ink">
            <WeekDay title="Monday" text="Name, date, place and the gift. About two minutes." first>
              <div className="mt-auto flex items-center gap-sm pt-md">
                <QrIcon size={48} strokeWidth={1.8} />
                <span className="text-sm font-extrabold">classgift.app/p/emma7k2q</span>
              </div>
            </WeekDay>
            <WeekDay title="Wednesday" text="AI drafts a gentle reminder for the quiet families. You read it, then send.">
              <p className={cn(quote, "mt-auto pt-md")}>“Would love to know if Noah can come. The gift is optional.”</p>
            </WeekDay>
            <WeekDay title="Friday" text="The deadline. $300 buys the bike, the other $40 waits in her Dream Fund.">
              <div
                role="img"
                aria-label="Split chart: $300 to the gift, $40 to the Dream Fund"
                className="mt-auto flex h-11 overflow-hidden rounded-tag text-sm font-extrabold"
              >
                <span className="flex flex-[300] items-center bg-accent pl-sm text-accent-ink">Bike</span>
                <span className="flex flex-[70] items-center justify-center bg-signal">$40</span>
              </div>
            </WeekDay>
            <WeekDay title="Saturday" text="Every family gets a thank-you in Emma’s own words." last>
              <p className={cn(quote, "mt-auto pt-md")}>“Dear Liam, I’m going to ride it to school every day.”</p>
            </WeekDay>
          </div>
        </div>
      </section>

      <section className="py-(--section-gap-l)">
        <div className="wrap flex flex-col gap-xl">
          <h2 className="max-w-[18ch] text-display">
            Parents see the total and the headcount.
            <span className="block pt-sm text-section text-accent">Never who gave what.</span>
          </h2>
          <p className="lead">Chipping in stays optional, and every reminder says so. A family can RSVP and skip the gift.</p>
        </div>
      </section>

      <section id="parents" className="paper torn on-dark bg-night py-(--section-gap) text-night-ink">
        <div className="wrap flex flex-col gap-2xl">
          <h2 className="max-w-[16ch]">Turn the teacher’s email into a class collection</h2>

          <div className="flex flex-wrap items-center gap-xl">
            <div className="min-w-0 flex-[1_1_340px]">
              <Note bg="var(--color-card)" tilt={-1.5} className="px-lg py-xl text-ink">
                <span className="label">The email you paste</span>
                <p className="pt-xs text-lg leading-normal">
                  Hi families! Our spring museum trip is on 03/20. The museum asks $12 per student, please send by 03/06.
                  Thank you! Mrs. Carter
                </p>
              </Note>
            </div>
            <ArrowRightIcon size={48} className="shrink-0 text-signal max-md:rotate-90" />
            <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-md rounded-card bg-night-2 p-lg shadow-[inset_0_0_0_1.5px_var(--color-night-rule)]">
              <h3 className="text-2xl">Spring museum trip</h3>
              <p className="text-sm font-bold text-night-muted">AI’s draft. You check it, then publish.</p>
              <div className="flex flex-wrap gap-xs">
                {["$12 a family", "due 03/06", "25 families"].map((t) => (
                  <span key={t} className="tag bg-night-rule text-night-ink">
                    {t}
                  </span>
                ))}
              </div>
              <Link className="btn btn--signal self-start" href={ROUTES.classWallet}>
                Publish and share
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-lg pt-xl">
            <div className="flex flex-wrap items-baseline justify-between gap-md">
              <h3 className="text-2xl">Teacher gift, $15 a family</h3>
              <span className="figure text-3xl text-signal">22/25</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-sm">
              {KIDS.map((n, i) => {
                const kind: TagKind = NOT_YET.has(n) ? "open" : EXTERNAL.has(n) ? "venmo" : "paid";
                return <NameTag key={n} name={n} kind={kind} tilt={ROSTER_TILT[i % ROSTER_TILT.length]} />;
              })}
            </div>
            <div className="flex flex-wrap gap-lg">
              <Key swatch={{ backgroundColor: "var(--color-mint)" }} className="text-night-muted">
                Paid here
              </Key>
              <Key swatch={{ backgroundColor: "var(--color-signal-soft)" }} className="text-night-muted">
                Paid by Venmo or Zelle
              </Key>
              <Key
                swatch={{ outline: "2px dashed var(--color-night-muted)", outlineOffset: -2 }}
                className="text-night-muted"
              >
                Not yet, reminder ready
              </Key>
            </div>
          </div>
        </div>
      </section>

      <section id="dream" className="pt-(--section-gap-l) pb-(--section-gap)">
        <div className="wrap flex flex-wrap items-center gap-3xl">
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-lg">
            <h2 className="max-w-[13ch]">Leftover money saves up for the next wish</h2>
            <p className="lead">
              Grandparents and aunts open one link all year, add money with a line for Emma, and watch the jar fill.
            </p>
            <Link href={ROUTES.dream} className="inline-flex min-h-11 items-center self-start font-extrabold">
              See Emma’s Dream Fund
            </Link>
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] items-end justify-center gap-lg">
            <div
              role="img"
              aria-label="Dream Fund jar: $120 saved of $300"
              className="relative h-[312px] w-[156px] shrink-0 overflow-hidden rounded-[30px_30px_40px_40px] border-[3px] border-ink bg-card"
            >
              <div className="paper absolute inset-x-0 bottom-0 h-[40%] bg-accent" />
              <span className="figure absolute inset-x-0 bottom-md text-center text-2xl text-accent-ink">$120</span>
              <span className="absolute inset-x-0 top-md text-center text-sm font-extrabold">of $300</span>
            </div>
            <div className="flex max-w-[260px] flex-col gap-md">
              <Note bg="var(--color-signal-soft)" tilt={-2.5} className="p-lg">
                <p className={quote}>“For the stars you’ll find, sweetheart.”</p>
                <span className="block pt-xs text-sm font-extrabold">Grandma Ruth, $50</span>
              </Note>
              <Note bg="var(--color-mint)" tilt={2} className="p-lg">
                <p className={quote}>“Send me a photo of the moon.”</p>
                <span className="block pt-xs text-sm font-extrabold">Aunt Maya, $30</span>
              </Note>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="paper bg-paper-2 py-(--section-gap-s)">
        <div className="wrap flex flex-wrap items-start gap-3xl">
          <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-lg">
            <h2>What it costs</h2>
            <p className="lead">We never take a cut of the gift. Parents’ money goes to the organizer’s Stripe account.</p>
          </div>
          <table aria-label="Plans and prices" className="min-w-0 flex-[1_1_600px] border-collapse text-body">
            <tbody>
              {PLANS.map((p, i) => (
                <tr
                  key={p.name}
                  className={cn(
                    i === 0 ? "border-t-2 border-ink" : "border-t border-edge",
                    i === PLANS.length - 1 && "border-b border-edge",
                  )}
                >
                  <th
                    scope="row"
                    className="py-lg pr-md text-left align-top font-display text-xl font-semibold tracking-[-0.02em]"
                  >
                    {p.name}
                  </th>
                  <td className="px-md py-lg align-top text-ink-2">{p.text}</td>
                  <td className="num py-lg text-right align-top">
                    <span className={cn("block font-display text-2xl font-semibold", p.per && "text-accent")}>
                      {p.price}
                    </span>
                    {p.per && <span className="label">{p.per}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pt-(--section-gap) pb-3xl">
        <div className="wrap">
          <div className="paper torn on-accent flex flex-wrap items-center justify-between gap-xl bg-accent px-lg py-3xl text-accent-ink md:px-2xl">
            <h2 className="max-w-[14ch] flex-[1_1_460px]">Whose birthday is next in your class?</h2>
            <div className="flex flex-wrap gap-sm">
              <Link className="btn btn--signal" href={ROUTES.newParty}>
                Start a birthday gift
              </Link>
              <Link className="btn" href={ROUTES.classWallet}>
                Set up my class
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="wrap flex flex-wrap items-center justify-between gap-lg pt-lg pb-2xl text-sm text-ink-2">
        <span className="font-display text-lg font-semibold text-ink">class gift</span>
        <p>Payments run on Stripe. For kids we keep a first name and a party date.</p>
        <nav aria-label="Footer" className="flex gap-2xs">
          {["Privacy", "Terms", "Help"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="flex min-h-11 items-center px-xs text-ink-2">
              {l}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}

function WeekDay({
  title,
  text,
  first,
  last,
  children,
}: {
  title: string;
  text: string;
  first?: boolean;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-md py-lg",
        first ? "pr-lg" : last ? "pl-lg" : "px-lg",
        !last && "border-r border-edge",
        "max-[600px]:border-r-0 max-[600px]:border-b max-[600px]:px-0",
      )}
    >
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
