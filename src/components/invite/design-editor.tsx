"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeftIcon } from "@/components/icons";
import { PhonePreview, ThemePicker } from "@/components/invite/theme-picker";
import { LangSwitch, useI18n } from "@/lib/i18n";
import { themeName, themeOf, type ThemeId } from "@/lib/invite-themes";
import { partyUrls, type PartyInfo } from "@/lib/party";

/** Смена дизайна приглашения у созданного события: ссылка для гостей не меняется */
export function DesignEditor({ party, invited }: { party: PartyInfo; invited: number }) {
  const { t, err, title } = useI18n();
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
        setError(err(data.error ?? "Something went wrong, try again"));
      } else {
        setSaved(data.theme);
        setIsPro(Boolean(data.isPro));
        router.refresh();
      }
    } catch {
      setError(t("err.net"));
    }
    setBusy(false);
  };

  return (
    <div className="paper min-h-dvh w-full bg-paper text-ink">
      <header className="wrap flex flex-wrap items-center justify-between gap-md py-md">
        <Link href={urls.dashboard} className="flex min-h-11 items-center gap-xs font-extrabold no-underline">
          <ArrowLeftIcon size={18} />
          {title(party)}
        </Link>
        <div className="flex flex-wrap items-center gap-sm">
          <LangSwitch />
          <p role="status" className="label">
            {busy ? t("de.saving") : dirty ? t("de.unsaved") : t("de.saved")}
          </p>
          <Link className="btn" href={urls.guest} target="_blank">
            {t("sd.preview")}
          </Link>
          <button type="button" className="btn btn--primary" disabled={!dirty || busy} onClick={save}>
            {t("de.save")}
          </button>
        </div>
      </header>

      <div className="wrap flex flex-wrap items-start gap-2xl pt-lg pb-3xl">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-xl">
          <div className="flex flex-col gap-md">
            <h1 className="text-display-s">{t("de.h")}</h1>
            <p className="lead">{t("de.lead")}</p>
          </div>
          <ThemePicker value={theme} onChange={setTheme} isPro={isPro} />
          {proNote && <p className="label">{t("de.pro", { name: t(themeName(theme)) })}</p>}
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
