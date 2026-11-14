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

Сборка и запуск — `railway.json` (`npm run build`, `npm run start`, health check на `/api/health`).
Таблица `party_events` создаётся сама при первом запросе, туда же пишется засев.

## Деплой на VPS с автодеплоем

Сейчас работает: **http://134.209.53.12** (DigitalOcean, Ubuntu 24.04).

**Как выкатывается.** Push в `main` на GitHub → Actions: линт и сборка → `git push` на сервер →
сервер в хуке `pre-receive` собирает новый релиз рядом с работающим (`/opt/class-gift/releases/<время>-<sha>`),
переключает ссылку `current`, перезапускает сервис и ждёт, пока `/api/health` ответит новым sha.
Не собралось или не поднялось — остаётся прошлая версия, push отклонён, job в Actions красный.
Хранятся последние 5 релизов.

**Включить в GitHub (один раз):** Settings → Secrets and variables → Actions → New repository secret
`DEPLOY_SSH_KEY` = содержимое приватного ключа `~/.ssh/class_gift_deploy`. На сервере этот ключ умеет только `git push`.
Сменили сервер — переменные (вкладка Variables) `DEPLOY_HOST` и `DEPLOY_KNOWN_HOSTS` (`ssh-keyscan -t ed25519 <IP>`).

**Выкатить с ноутбука без GitHub:**

```bash
git remote add deploy root@134.209.53.12:/opt/class-gift/repo.git
git push deploy main
```

**Команды на сервере** (`ssh root@134.209.53.12`):

| Команда | Что делает |
|---|---|
| `class-gift-rollback` | вернуть предыдущий релиз (или `class-gift-rollback <id>`) |
| `ls -1t /opt/class-gift/releases` | список релизов |
| `journalctl -u class-gift -f` | логи приложения |
| `tail -f /var/log/class-gift-deploy.log` | логи деплоев |
| `cat /etc/class-gift.env` | пароль базы и ключ сброса демо |

**Новый сервер с нуля.** Ubuntu 24.04, при заказе вставить `deploy/cloud-init.yaml` в поле Cloud-init (можно и без него), затем:

```bash
ssh root@<IP> "bash -s -- '$(cat ~/.ssh/class_gift_deploy.pub)'" < deploy/server/setup.sh
```

`setup.sh` ставит Postgres, Node 22, Caddy, создаёт базу и секреты, репозиторий с хуком, скрипты релиза и отката.
Повторный запуск безопасен. Есть домен — A-запись на IP, в `/etc/caddy/Caddyfile` заменить `:80` на домен,
`systemctl reload caddy` → HTTPS.

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
| GET | `/api/health` | какая версия (git sha) работает и какое хранилище — для проверки деплоя |
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
