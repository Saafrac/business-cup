import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { GiftIcon } from "@/components/icons";
import { ROUTES } from "@/lib/demo";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Wordmark({ withMark = false, className }: { withMark?: boolean; className?: string }) {
  return (
    <Link
      href={ROUTES.home}
      className={cn("flex min-h-11 items-center gap-xs text-ink no-underline hover:text-ink", className)}
    >
      {withMark && <GiftIcon size={30} strokeWidth={2} className="text-accent" />}
      <span className="font-display text-xl font-semibold tracking-[-0.03em]">chip in</span>
    </Link>
  );
}

type NavKey = "parties" | "dream" | "group";

const NAV: Array<{ key: NavKey; label: string; href: string }> = [
  { key: "parties", label: "Parties", href: "/parties" },
  { key: "dream", label: "Dream Fund", href: ROUTES.dream },
  { key: "group", label: "Group Wallet", href: ROUTES.groupWallet },
];

/** Шапка кабинета организатора события и группы */
export function AppHeader({
  active,
  avatar,
  avatarLabel,
  avatarClass,
}: {
  active: NavKey;
  avatar: string;
  avatarLabel: string;
  avatarClass: string;
}) {
  return (
    <header className="wrap flex flex-wrap items-center justify-between gap-md py-md">
      <div className="flex flex-wrap items-center gap-x-lg gap-y-2xs">
        <Wordmark />
        <nav aria-label="App" className="flex flex-wrap gap-2xs font-bold">
          {NAV.map((n) => {
            const on = n.key === active;
            return (
              <Link
                key={n.key}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center no-underline",
                  on ? "rounded-pill bg-ink px-md text-paper hover:text-paper" : "px-sm text-ink hover:text-accent",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <span
        aria-label={avatarLabel}
        className={cn("flex size-11 items-center justify-center rounded-pill font-extrabold max-sm:hidden", avatarClass)}
      >
        {avatar}
      </span>
    </header>
  );
}

/** Прогресс-бар из макета (.bar): заполнение через scaleX */
export function Bar({
  ratio,
  label,
  className,
  style,
  fillStyle,
}: {
  ratio: number;
  label: string;
  className?: string;
  style?: CSSProperties;
  fillStyle?: CSSProperties;
}) {
  return (
    <div className={cn("bar", className)} role="img" aria-label={label} style={style}>
      <span style={{ transform: `scaleX(${Math.max(0, Math.min(1, ratio))})`, ...fillStyle }} />
    </div>
  );
}

export type TagKind = "paid" | "venmo" | "yes" | "no" | "open";

export function NameTag({ name, state, kind, tilt }: { name: string; state?: string; kind: TagKind; tilt: number }) {
  return (
    <div className={`name-tag name-tag--${kind}`} style={{ rotate: `${tilt}deg` }}>
      <b>{name}</b>
      {state && <span>{state}</span>}
    </div>
  );
}

export function Key({ swatch, children, className }: { swatch: CSSProperties; children: ReactNode; className?: string }) {
  return (
    <span className={cn("key", className)}>
      <i style={swatch} />
      {children}
    </span>
  );
}

export const SWATCH = {
  paid: { backgroundColor: "var(--color-mint)" },
  soft: { backgroundColor: "var(--color-signal-soft)" },
  no: { backgroundColor: "var(--color-paper-3)" },
  open: { outline: "2px dashed var(--color-muted)", outlineOffset: -2 },
} satisfies Record<string, CSSProperties>;

/** Листок с рваным краем и бумажной тенью (.sheet > .paper.torn-note) */
export function Note({
  bg,
  tilt = 0,
  className,
  children,
}: {
  bg: string;
  tilt?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="sheet" style={{ rotate: `${tilt}deg` }}>
      <div className={cn("paper torn-note", className)} style={{ backgroundColor: bg }}>
        {children}
      </div>
    </div>
  );
}

/** Мобильная колонка гостевых страниц: на телефоне во всю ширину, на десктопе по центру */
export function PhoneColumn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="flex min-h-dvh justify-center bg-paper-3">
      <div className={cn("paper relative flex min-h-dvh w-full max-w-[430px] flex-col bg-paper text-ink", className)}>
        {children}
      </div>
    </div>
  );
}

export function Table({ label, rows }: { label: string; rows: Array<{ k: string; v: ReactNode; strong?: boolean }> }) {
  return (
    <table aria-label={label} className="border-collapse text-md">
      <tbody>
        {rows.map((r, i) => (
          <tr
            key={r.k}
            className={cn(i === 0 ? "border-t-2 border-ink" : "border-t border-edge", i === rows.length - 1 && "border-b border-edge")}
          >
            <th scope="row" className={cn("py-sm text-left", r.strong ? "font-extrabold" : "font-medium text-ink-2")}>
              {r.k}
            </th>
            <td className="num text-right font-extrabold">{r.v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
