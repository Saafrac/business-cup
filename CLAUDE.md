# Chip In — MVP для Zimran Business Cup 2.0

Хакатон-проект: одна ссылка в групповом чате собирает RSVP и деньги на подарок к любому событию
(день рождения, свадьба, проводы, подарок учителю); организатор группы ведёт все её сборы в Group Wallet.
Продукт общий для событий: в интерфейсе и коде не писать «class», «kid», «birthday» так, будто он только про них —
день рождения Emma и класс Mrs. Carter остались лишь демо-примером. Рынок США, интерфейс на английском, тексты в коде — по-английски.

Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind 4, Postgres (`pg`).
**Next 16 отличается от того, что ты знаешь** — перед кодом смотри `AGENTS.md` и `node_modules/next/dist/docs/`.

## Что живое, что макет

- **Живое** (бэк + Postgres): страница гостя → Test payment / Venmo / RSVP → сумма растёт на QR-экране,
  дашборде, «Спасибо», распределении. Опрос сервера раз в 1–2 с, не WebSocket.
- **Макет на демо-данных**: лендинг, вход, мастер создания события (выбор повода) + paywall, Group Wallet, Dream Fund.
- Демо — один праздник `emma7k2q` («Emma turns 7», велосипед за $300). Старт с засева: $210, 14 из 25 семей.

## Где что

| Путь | Что |
|---|---|
| `src/app/` | страницы: `/`, `/login`, `/party/new`, `/p/[slug]` (гость), `/p/[slug]/thanks`, `/party/[id]` (дашборд), `/party/[id]/qr` (экран для зала), `/party/[id]/payout`, `/group/[id]`, `/dream/[slug]` |
| `src/app/api/` | `party/[id]/state` (GET состояние), `party/[id]/events` (POST взнос/RSVP), `demo/reset` (POST, заголовок `x-demo-key`), `health` (работающий git sha) |
| `src/components/` | экраны по папкам (`guest/`, `party/`, `group/`, `dream/`, `new-party/`, `landing/`), `shell.tsx` — общие куски (шапка, `Bar`, `NameTag`, `Note`, `PhoneColumn`), `paywall.tsx`, `icons.tsx` |
| `src/lib/party-state.ts` | события → состояние события (гости, взносы), засев; общий для сервера и браузера |
| `src/lib/server/` | `store.ts` (Postgres при `DATABASE_URL`, иначе память; колонка гостя в таблице по-прежнему `kid`, в коде — `guest`), `party-api.ts` (валидация, лимит частоты) |
| `src/lib/use-party.ts` | хук опроса состояния + отправка взноса |
| `src/lib/demo.ts` | константы демо-истории Emma, маршруты, список гостей `GUESTS`, группа `GROUP` |
| `src/app/design.css` | дизайн-система из макета (claude.ai Design): токены, `.btn`, `.choice`, `.field`/`.input`, `.paper`, `.torn*`, `.wrap` (= `.container` макета) |
| `src/app/globals.css` | связка токенов с Tailwind: `bg-accent`, `gap-md`, `text-xl`, `rounded-card`… |
| `deploy/server/setup.sh` | настройка VPS с нуля (идемпотентно) |
| `.github/workflows/deploy.yml` | CI (lint + build) и автодеплой на VPS |

## Стиль

- Вёрстка — только токены и классы из `design.css` через утилиты Tailwind; новых цветов и шрифтов не вводить.
  Шрифты: Lexend (заголовки), Manrope (текст), Silkscreen (только живые цифры, класс `.figure`).
- Суммы в базе — в центах (`amount_cents`), формат дат и денег — США (`MM/DD/YYYY`, `$`).
- Суммы взносов видит только организатор; гостям — общая сумма и число семей.

## Запуск и проверка

```bash
npm run dev            # localhost:3000, данные в памяти
npx eslint src && npm run build
```

## Деплой

Серверные имена остались от старого названия и намеренно не переименованы: `/opt/class-gift`, сервис `class-gift`,
`class-gift-release` / `class-gift-rollback`, `/etc/class-gift.env`, база и пользователь `classgift`.
Переименовывать только вместе с миграцией на VPS.

- Прод: **http://134.209.53.12** (VPS DigitalOcean, временный). Push в `main` → GitHub Actions → `git push` на сервер →
  сервер собирает релиз в хуке и переключается только если `/api/health` ответил новым sha. Иначе остаётся прошлая версия.
- Вручную с ноутбука: `git push deploy main` (remote `deploy` = `root@134.209.53.12:/opt/class-gift/repo.git`).
- На сервере: `class-gift-rollback`, `journalctl -u class-gift -f`, `/var/log/class-gift-deploy.log`, секреты в `/etc/class-gift.env`.
- Сброс демо перед питчем: `POST /api/demo/reset` с `x-demo-key` из `/etc/class-gift.env`.
- Есть и `railway.json` — запасной вариант на Railway (Postgres + `DATABASE_URL`).

Подробности — `README.md`. ТЗ хакатона — у команды в PDF «ТЗ Class Gift — MVP для Zimran Business Cup 2.0».
