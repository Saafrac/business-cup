"use client";

import { InviteView, type InviteParty } from "@/components/invite/invite-view";
import { cn } from "@/components/shell";
import { THEMES, coverSrc, type ThemeId } from "@/lib/invite-themes";

// Выбор дизайна приглашения (макет «E1 · Choose a theme») и живое превью в рамке телефона («E2 · Editor»).

export function ThemePicker({ value, onChange, isPro }: { value: ThemeId; onChange: (t: ThemeId) => void; isPro: boolean }) {
  return (
    <div role="radiogroup" aria-label="Invite design" className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-md">
      {THEMES.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(t.id)}
            className="flex cursor-pointer flex-col gap-xs rounded-card border-0 bg-card p-xs text-left text-ink transition-[translate,box-shadow] duration-(--dur-micro) ease-(--ease-snap)"
            style={
              on
                ? { boxShadow: "inset 0 0 0 2.5px var(--color-ink), 0 6px 0 0 var(--color-accent)", translate: "0 -2px" }
                : { boxShadow: "inset 0 0 0 1.5px var(--color-edge), 0 4px 0 0 var(--color-edge)" }
            }
          >
            <span data-invite-theme={t.id} className="invite-cover paper flex h-[120px] items-center justify-center overflow-hidden rounded-stock">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG обложки темы из public */}
              <img src={coverSrc(t.id)} alt="" className="h-[104px] w-full object-contain" />
            </span>
            <span className="flex items-start justify-between gap-2xs px-2xs pb-2xs">
              <span className="flex min-w-0 flex-col">
                <span className="font-display text-md font-semibold tracking-[-0.02em]">{t.name}</span>
                <span className="text-xs font-semibold text-ink-2">{t.note}</span>
              </span>
              {t.pro && !isPro ? (
                <span className="tag min-h-6 shrink-0 bg-accent px-xs text-xs text-accent-ink">Pro</span>
              ) : (
                <span className="tag min-h-6 shrink-0 px-xs text-xs">{t.pro ? "Pro" : "Free"}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Превью приглашения в рамке телефона: то же, что увидит гость, уменьшено и прокручивается внутри */
export function PhonePreview({ party, invited = 0, className }: { party: InviteParty; invited?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-sm", className)}>
      <div
        aria-label="Invite preview"
        tabIndex={0}
        role="region"
        className="h-[600px] w-[312px] overflow-x-hidden overflow-y-auto rounded-[44px] border-[10px] border-ink bg-paper"
      >
        <div inert style={{ width: 390, zoom: 292 / 390 }}>
          <InviteView party={party} raisedCents={0} contributors={0} invited={invited} />
        </div>
      </div>
      <p className="label text-center">Guests see exactly this. Scroll inside the phone.</p>
    </div>
  );
}
