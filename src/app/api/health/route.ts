import { readFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import { storeKind } from "@/lib/server/store";

// Какая версия сейчас работает: REVISION кладёт скрипт релиза на сервере.
// По нему деплой понимает, что поднялась именно новая сборка, а не старая.
export async function GET() {
  await connection();
  const revision = await readFile(path.join(process.cwd(), "REVISION"), "utf8")
    .then((s) => s.trim())
    .catch(() => process.env.RAILWAY_GIT_COMMIT_SHA ?? "dev");
  return Response.json({ ok: true, revision, store: storeKind() }, { headers: { "Cache-Control": "no-store" } });
}
