"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import { PhonePreview, ThemePicker } from "@/components/invite/theme-picker";
import { themeOf, type ThemeId } from "@/lib/invite-themes";
import { partyTitle, partyUrls, type PartyInfo } from "@/lib/party";

/** Смена дизайна приглашения у созданного события: ссылка для гостей не меняется */
export function DesignEditor({ party, invited }: { party: PartyInfo; invited: number }) {
  const router = useRouter();
  const urls = partyUrls(party.id);
  const [theme, setTheme] = useState<ThemeId>(party.theme);
  const [saved, setSaved] = useState<ThemeId>(party.theme);
  const [isPro, setIsPro] = useState(party.isPro);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = theme !== saved;
  const proNote = themeOf(theme).pro && !isPro;

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/party/${party.id}/theme`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const data = (await res.json().catch(() => ({}))) as { theme?: ThemeId; isPro?: boolean; error?: string };
      if (!res.ok || !data.theme) {
        setError(data.error ?? "Couldn’t save, try again");
      } else {
        setSaved(data.theme);
        setIsPro(Boolean(data.isPro));
        router.refresh();
      }
    } catch {
      setError("No connection, try again");
    }
    setBusy(false);
  };

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <header className="wrap flex flex-wrap items-center justify-between gap-md py-md">
        <Link href={urls.dashboard} className="flex min-h-11 items-center gap-xs font-extrabold no-underline">
          <ArrowLeftIcon size={18} />
          {partyTitle(party)}
        </Link>
        <div className="flex flex-wrap items-center gap-sm">
          <p role="status" className="label">
            {busy ? "Saving…" : dirty ? "Not saved yet" : "Saved"}
          </p>
          <Link className="btn" href={urls.guest} target="_blank">
            Preview as a guest
          </Link>
          <button type="button" className="btn btn--primary" disabled={!dirty || busy} onClick={save}>
            Save the design
          </button>
        </div>
      </header>

      <div className="wrap flex flex-wrap items-start gap-2xl pt-lg pb-3xl">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-xl">
          <div className="flex flex-col gap-md">
            <h1 className="text-display-s">Invite design</h1>
            <p className="lead">The link stays the same: guests who already have it see the new design right away.</p>
          </div>
          <ThemePicker value={theme} onChange={setTheme} isPro={isPro} />
          {proNote && (
            <p className="label">{themeOf(theme).name} is a Party Pro design: saving it makes this party Pro ($9.99, not charged in demo mode).</p>
          )}
          {error && (
            <p role="alert" className="text-sm font-bold text-error">
              {error}
            </p>
          )}
        </div>
        <aside className="flex min-w-0 flex-[1_1_320px] justify-center">
          <PhonePreview party={{ ...party, theme }} invited={invited} />
        </aside>
      </div>
    </div>
  );
}
