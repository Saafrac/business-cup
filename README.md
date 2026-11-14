# Class Gift — MVP (Zimran Business Cup 2.0)

Next.js 16 + Tailwind 4. Живой сценарий «гость сканирует QR → платит тестово → сумма растёт на экране»
работает через свой небольшой бэк: Postgres на Railway (локально — память процесса).
Остальное (вход, ИИ, Class Wallet, Dream Fund) — интерактивный макет на демо-данных.

```bash
npm install
npm run dev        # http://localhost:3000, данные в памяти
npm run build      # прод-сборка + проверка типов
```

С телефонов в той же Wi-Fi — `npm run dev -- -H 0.0.0.0` и `http://<IP ноутбука>:3000`.

## Деплой на Railway

1. New Project → Deploy from GitHub repo (или `railway up` из папки проекта).
2. В проекте: **+ New → Database → PostgreSQL**.
3. В сервисе приложения → **Variables**:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (ссылка на базу, Railway подставит сам);
   - `DEMO_ADMIN_KEY` = любая длинная строка — ключ для сброса демо.
4. **Settings → Networking → Generate Domain**. QR берёт адрес из открытой страницы, отдельно указывать не нужно.

Сборка и запуск — `railway.json` (`npm run build`, `npm run start`, health check на `/api/party/emma7k2q/state`).
Таблица `party_events` создаётся сама при первом запросе, туда же пишется засев.

## Демо на питче

| Что | Где |
|---|---|
| Большой экран с QR | `/party/emma7k2q/qr` |
| Телефон жюри после сканирования | `/p/emma7k2q` → имя ребёнка → **Test payment** (карта не нужна) |
| Дашборд организатора | `/party/emma7k2q` — плитки, лента с суммами, напоминание |
| Распределение | `/party/emma7k2q/payout` — делит реально собранное |

Старт демо — засев: **$210, 14 из 25 семей**; жюри своими взносами доводит до $300,
на экране появляется «That’s the whole bike».

Сброс к засеву за минуту до выхода:

```bash
curl -X POST https://<ваш-домен>/api/demo/reset -H "x-demo-key: <DEMO_ADMIN_KEY>"
```

Ограничения от случайностей в зале: сумма $5–$500, имя — только буквы, 20 запросов в минуту с одного IP,
не больше 2000 событий на праздник.

## API

| Метод | Путь | Что делает |
|---|---|---|
| GET | `/api/party/emma7k2q/state` | сумма, семьи, плитки гостей, лента (экраны опрашивают раз в 1–2 с) |
| POST | `/api/party/emma7k2q/events` | `{ kid, rsvp, amount?, tip?, method? }`, `method`: `test` или `external` (Venmo) |
| POST | `/api/demo/reset` | сброс к засеву, заголовок `x-demo-key` |

## Экраны

| # | Экран | Маршрут | Данные |
|---|---|---|---|
| 1 | Лендинг | `/` | анимация в телефоне (маркетинг) |
| 2 | Вход | `/login` | макет magic link |
| 3 | Создание праздника | `/party/new` | макет: 3 шага, AI Dream Finder, paywall при > 15 гостях |
| 4 | Страница гостя | `/p/emma7k2q` | **живые**: прогресс, Test payment, Venmo, только RSVP |
| 5 | Спасибо + виральный CTA | `/p/emma7k2q/thanks` | **живой** прогресс |
| 6 | Дашборд праздника | `/party/emma7k2q` | **живые** плитки, счётчики, лента, кого напомнить |
| — | Экран QR для зала | `/party/emma7k2q/qr` | **живые** сумма, семьи, последнее событие |
| 7 | Распределение | `/party/emma7k2q/payout` | **живая** собранная сумма |
| 8 | Class Wallet | `/class/carter-2` | макет: письмо → черновик сбора |
| 9 | Dream Fund | `/dream/emma` | макет: взнос пополняет банку в браузере |
| 10 | Paywall | модалка на `/party/new` | макет |

## Где что лежит

- `src/lib/party-state.ts` — события → состояние праздника (общий для сервера и браузера), засев.
- `src/lib/server/store.ts` — хранилище: Postgres при `DATABASE_URL`, иначе память.
- `src/lib/server/party-api.ts` — проверка тела запроса гостя, лимит частоты.
- `src/lib/use-party.ts` — опрос состояния и отправка взноса из браузера.
- `src/app/design.css` — дизайн-система из макета как есть (токены, `.btn`, `.choice`, `.paper`, `.torn*`…).
  `.container` макета здесь называется `.wrap` — имя занято утилитой Tailwind.
- `src/app/globals.css` — связывает токены с Tailwind: `bg-accent`, `text-ink-2`, `gap-md`, `text-xl`.
- `src/components/shell.tsx` — шапка кабинета, `Bar`, `NameTag`, `Key`, `Note`, мобильная колонка.
- `src/lib/demo.ts` — константы истории «Emma turns 7» и маршруты.

## Что дальше

1. Stripe test: Checkout или Payment Element вместо Test payment, статус — по вебхуку `payment_intent.succeeded`.
2. ИИ через серверные route handlers (zod-схемы из ТЗ §5), запасные ответы на случай таймаута.
3. Вход по magic link и несколько праздников вместо одного демо-id.
