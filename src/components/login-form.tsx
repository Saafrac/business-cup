"use client";

import Link from "next/link";
import { useState } from "react";
import { MailIcon } from "@/components/icons";
import { Note } from "@/components/shell";
import { useT } from "@/lib/i18n";

export function LoginForm() {
  const t = useT();
  const [email, setEmail] = useState("sarah@example.com");
  const [sent, setSent] = useState(false);

  return (
    <div className="w-full max-w-[460px]">
      <Note bg="var(--color-paper)" tilt={-0.6} className="flex flex-col gap-lg px-lg py-xl sm:px-xl">
        {sent ? (
          <>
            <div className="flex flex-col gap-sm">
              <h1 className="text-3xl">{t("lg.checkTitle")}</h1>
              <p className="text-ink-2">
                {t("lg.sentA")} <strong className="text-ink">{email}</strong>. {t("lg.sentB")}
              </p>
            </div>
            <Link className="btn btn--primary btn--block" href="/parties">
              {t("lg.open")}
            </Link>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="min-h-11 self-center border-0 bg-transparent font-extrabold text-accent-deep"
            >
              {t("lg.other")}
            </button>
          </>
        ) : (
          <form
            className="flex flex-col gap-lg"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="flex flex-col gap-sm">
              <h1 className="text-3xl">{t("lg.title")}</h1>
              <p className="text-ink-2">{t("lg.lead")}</p>
            </div>
            <div className="field">
              <label htmlFor="email">{t("lg.email")}</label>
              <input
                id="email"
                className="input"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn--primary btn--block">
              <MailIcon size={18} />
              {t("lg.send")}
            </button>
          </form>
        )}
      </Note>
    </div>
  );
}
