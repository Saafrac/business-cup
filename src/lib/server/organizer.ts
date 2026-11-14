import "server-only";
// Свой лимит для загрузок: гость за раз выбирает десятки фото, общий лимит в 20 запросов/мин для этого мал
const uploads = new Map<string, number[]>();
export function uploadLimited(req: Request, limit = 80) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (uploads.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  uploads.set(ip, recent);
  if (uploads.size > 5000) uploads.clear();
  return recent.length > limit;
}

/** Что лежит в файле на самом деле — по первым байтам, а не по заголовку от браузера */
export function sniffImage(buf: Buffer): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}
