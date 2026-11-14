#!/bin/bash
# Class Gift: настройка VPS под автодеплой (Ubuntu 24.04). Идемпотентный — можно запускать повторно.
#   ssh root@<IP> 'bash -s' < deploy/server/setup.sh
#   ssh root@<IP> 'bash -s -- "<публичный ключ для GitHub Actions>"' < deploy/server/setup.sh
#
# Что получается:
#   /opt/class-gift/repo.git   — git-репозиторий, куда пушат (GitHub Actions или `git push deploy main`)
#   /opt/class-gift/releases/  — собранные релизы, хранятся последние 5
#   /opt/class-gift/current    — ссылка на работающий релиз, systemd запускает его
#   class-gift-release <rev>   — собрать и переключить (вызывает git-хук pre-receive)
#   class-gift-rollback        — вернуть предыдущий релиз
#   /etc/class-gift.env        — DATABASE_URL и DEMO_ADMIN_KEY (генерируются один раз)
set -euo pipefail

DEPLOY_PUBKEY="${1:-}"
BASE=/opt/class-gift
export DEBIAN_FRONTEND=noninteractive

step() { echo "==> $*"; }

step "packages"
apt-get update -q
apt-get install -y -q postgresql caddy ufw git openssl curl tar
command -v /snap/bin/node >/dev/null || snap install node --classic --channel=22

if ! swapon --show | grep -q .; then
  step "swap 2G"
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

id app >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin app
mkdir -p "$BASE/releases"
chown app:app "$BASE" "$BASE/releases"

if [ ! -f /etc/class-gift.env ]; then
  step "database and secrets"
  PW="$(openssl rand -hex 16)"
  KEY="$(openssl rand -hex 16)"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE USER classgift WITH PASSWORD '${PW}';"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE classgift OWNER classgift;"
  printf 'DATABASE_URL=postgres://classgift:%s@127.0.0.1:5432/classgift\nDEMO_ADMIN_KEY=%s\n' "$PW" "$KEY" > /etc/class-gift.env
  chmod 600 /etc/class-gift.env
fi

step "caddy"
if ! grep -q 'reverse_proxy 127.0.0.1:3000' /etc/caddy/Caddyfile 2>/dev/null; then
  cat > /etc/caddy/Caddyfile <<'EOF'
# Есть домен — замените ":80" на домен и выполните `systemctl reload caddy`: Caddy сам выпустит HTTPS.
:80 {
  encode gzip
  reverse_proxy 127.0.0.1:3000
}
EOF
  systemctl reload caddy || systemctl restart caddy
fi

step "systemd unit"
cat > /etc/systemd/system/class-gift.service <<'EOF'
[Unit]
Description=Class Gift (Next.js)
After=network.target postgresql.service

[Service]
User=app
WorkingDirectory=/opt/class-gift/current
EnvironmentFile=/etc/class-gift.env
Environment=NODE_ENV=production
Environment=PATH=/snap/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/snap/bin/npm run start -- -p 3000 -H 127.0.0.1
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable class-gift >/dev/null

step "release script"
cat > /usr/local/bin/class-gift-release <<'EOF'
#!/bin/bash
# class-gift-release <rev>: собрать релиз из repo.git рядом с работающим и переключиться,
# только если сборка прошла и приложение отвечает. Иначе работающая версия не трогается.
set -euo pipefail
REV="${1:-main}"
BASE=/opt/class-gift
REPO="$BASE/repo.git"
KEEP=5
HEALTH=http://127.0.0.1:3000/api/health
export PATH=/snap/bin:/usr/local/bin:/usr/bin:/bin

exec 9>/run/class-gift-release.lock
flock -n 9 || { echo "!! another deploy is running, try again in a minute"; exit 1; }

SHA="$(git --git-dir="$REPO" rev-parse "$REV^{commit}")"
SHORT="${SHA:0:7}"
ID="$(date -u +%Y%m%d-%H%M%S)-$SHORT"
REL="$BASE/releases/$ID"
SWITCHED=0
cleanup_failed() { [ "$SWITCHED" = 1 ] || rm -rf "$REL"; }
trap cleanup_failed EXIT

echo "==> release $ID"
mkdir -p "$REL"
git --git-dir="$REPO" archive "$SHA" | tar -x -C "$REL"
echo "$SHA" > "$REL/REVISION"
chown -R app:app "$REL"
cd "$REL"

echo "==> npm ci"
sudo -u app env PATH="$PATH" npm ci --no-audit --no-fund --loglevel=error
echo "==> build"
sudo -u app env PATH="$PATH" NEXT_TELEMETRY_DISABLED=1 npm run build 2>&1 | grep -E "✓|⨯|rror|Warn" || true
test -f "$REL/.next/BUILD_ID" || { echo "!! build failed, the live version stays as is"; exit 1; }

PREV="$(readlink -f "$BASE/current" 2>/dev/null || true)"
ln -sfn "$REL" "$BASE/current.new" && mv -Tf "$BASE/current.new" "$BASE/current"
SWITCHED=1
echo "==> restart"
systemctl restart class-gift

healthy() {
  for _ in $(seq 1 40); do
    if curl -fsS "$HEALTH" 2>/dev/null | grep -q "\"$1\""; then return 0; fi
    sleep 1
  done
  return 1
}

if healthy "$SHA"; then
  echo "==> live: $ID"
else
  echo "!! $ID did not come up, rolling back"
  if [ -n "$PREV" ] && [ -d "$PREV" ]; then
    ln -sfn "$PREV" "$BASE/current.new" && mv -Tf "$BASE/current.new" "$BASE/current"
    systemctl restart class-gift
    echo "==> back on $(basename "$PREV")"
  fi
  rm -rf "$REL"
  exit 1
fi

CUR="$(readlink -f "$BASE/current")"
ls -1dt "$BASE"/releases/*/ 2>/dev/null | sed 's#/$##' | tail -n +$((KEEP + 1)) | while read -r old; do
  [ "$old" = "$CUR" ] || rm -rf "$old"
done
EOF
chmod 755 /usr/local/bin/class-gift-release

step "rollback script"
cat > /usr/local/bin/class-gift-rollback <<'EOF'
#!/bin/bash
# class-gift-rollback [release-id]: вернуть предыдущий (или указанный) релиз
set -euo pipefail
BASE=/opt/class-gift
CUR="$(readlink -f "$BASE/current")"
if [ -n "${1:-}" ]; then
  TARGET="$BASE/releases/$1"
else
  TARGET="$(ls -1dt "$BASE"/releases/*/ | sed 's#/$##' | grep -vxF "$CUR" | head -n 1 || true)"
fi
[ -n "$TARGET" ] && [ -d "$TARGET" ] || { echo "!! no release to roll back to"; ls -1t "$BASE/releases"; exit 1; }
ln -sfn "$TARGET" "$BASE/current.new" && mv -Tf "$BASE/current.new" "$BASE/current"
systemctl restart class-gift
echo "==> live: $(basename "$TARGET") (was $(basename "$CUR"))"
EOF
chmod 755 /usr/local/bin/class-gift-rollback

step "git repo"
if [ ! -d "$BASE/repo.git" ]; then
  git init --bare -q -b main "$BASE/repo.git"
fi
# pre-receive: сборка до обновления ветки — не собралось, значит push отклонён и GitHub Actions покажет ошибку
cat > "$BASE/repo.git/hooks/pre-receive" <<'EOF'
#!/bin/bash
set -uo pipefail
ZERO=0000000000000000000000000000000000000000
while read -r old new ref; do
  if [ "$ref" != "refs/heads/main" ]; then echo "skip $ref: only main is deployed"; continue; fi
  [ "$new" = "$ZERO" ] && { echo "!! main cannot be deleted"; exit 1; }
  /usr/local/bin/class-gift-release "$new" 2>&1 | tee -a /var/log/class-gift-deploy.log
  exit "${PIPESTATUS[0]}"
done
EOF
chmod 755 "$BASE/repo.git/hooks/pre-receive"

if [ -n "$DEPLOY_PUBKEY" ]; then
  step "deploy key (git push only)"
  mkdir -p /root/.ssh && chmod 700 /root/.ssh
  touch /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys
  KEYBODY="$(echo "$DEPLOY_PUBKEY" | awk '{print $2}')"
  grep -qF "$KEYBODY" /root/.ssh/authorized_keys || \
    echo "command=\"/usr/bin/git-shell -c \\\"\$SSH_ORIGINAL_COMMAND\\\"\",restrict $DEPLOY_PUBKEY" >> /root/.ssh/authorized_keys
fi

step "firewall"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

echo "SETUP_DONE"
