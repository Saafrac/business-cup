import { LoginForm } from "@/components/login-form";
import { Wordmark } from "@/components/shell";

// В макете экрана входа нет — собран из тех же компонентов (ТЗ, экран 2: email + magic link)
export default function LoginPage() {
  return (
    <div className="paper flex min-h-dvh flex-col bg-paper-2 text-ink">
      <header className="wrap py-md">
        <Wordmark withMark />
      </header>
      <main className="flex flex-1 items-center justify-center px-md pb-3xl">
        <LoginForm />
      </main>
    </div>
  );
}
