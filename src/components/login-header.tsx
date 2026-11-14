"use client";

import { Wordmark } from "@/components/shell";
import { LangSwitch } from "@/lib/i18n";

export function LoginHeader() {
  return (
    <header className="wrap flex items-center justify-between py-md">
      <Wordmark withMark />
      <LangSwitch />
    </header>
  );
}
