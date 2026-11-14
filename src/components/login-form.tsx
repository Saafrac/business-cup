"use client";

import Link from "next/link";
import { useState } from "react";
import { MailIcon } from "@/components/icons";
import { Note } from "@/components/shell";

export function LoginForm() {
  const [email, setEmail] = useState("sarah@example.com");
  const [sent, setSent] = useState(false);

  return (
    <div className="w-full max-w-[460px]">
      <Note bg="var(--color-paper)" tilt={-0.6} className="flex flex-col gap-lg px-lg py-xl sm:px-xl">
        {sent ? (
          <>
            <div className="flex flex-col gap-sm">
              <h1 className="text-3xl">Check your inbox</h1>
              <p className="text-ink-2">
                We sent a sign-in link to <strong className="text-ink">{email}</strong>. It works for 15 minutes.
              </p>
            </div>
            <Link className="btn btn--primary btn--block" href="/parties">
              Open my events
            </Link>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="min-h-11 self-center border-0 bg-transparent font-extrabold text-accent-deep"
            >
              Use a different email
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
              <h1 className="text-3xl">Log in</h1>
              <p className="text-ink-2">For organizers and room parents. Guests never need an account.</p>
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
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
              Email me a magic link
            </button>
          </form>
        )}
      </Note>
    </div>
  );
}
