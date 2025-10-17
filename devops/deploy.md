Вот готовый скрипт, который ставит Docker, клонирует `verba-en`, создает `.env`, `Dockerfile`, `compose.yaml`, а затем собирает и запускает контейнер:

```bash
#!/usr/bin/env bash
# Deploy verba-en on a fresh Ubuntu 24 server via Docker.

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/NickScherbakov/verba-en.git}"
REPO_DIR="${REPO_DIR:-/opt/verba-en}"
IMAGE_NAME="${IMAGE_NAME:-verba-en:latest}"
SERVICE_NAME="${SERVICE_NAME:-verba-en}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run this script as root (e.g. sudo bash setup-verba.sh)." >&2
  exit 1
fi

: "${BOT_TOKEN:?Set BOT_TOKEN before running (export BOT_TOKEN=...)}"
: "${WEB_APP_URL:?Set WEB_APP_URL before running (export WEB_APP_URL=...)}"

PORT="${PORT:-3000}"
AI_PROVIDER="${AI_PROVIDER:-mock}"
OPENAI_API_KEY="${OPENAI_API_KEY:-}"
NODE_ENV="${NODE_ENV:-production}"

echo "[1/7] Updating APT cache and installing prerequisites..."
apt-get update -y
apt-get upgrade -y
apt-get install -y --no-install-recommends docker.io docker-compose-plugin git ca-certificates curl
apt-get autoremove -y
systemctl enable --now docker

TARGET_USER="${SUDO_USER:-}"
if [ -z "$TARGET_USER" ] || [ "$TARGET_USER" = "root" ]; then
  TARGET_USER="$(logname 2>/dev/null || echo root)"
fi

if id "$TARGET_USER" &>/dev/null && [ "$TARGET_USER" != "root" ]; then
  echo "[2/7] Adding $TARGET_USER to docker group (effective after re-login)..."
  usermod -aG docker "$TARGET_USER"
else
  echo "[2/7] Skipping docker group modification for root user."
fi

echo "[3/7] Cloning or updating repository in $REPO_DIR..."
mkdir -p "$(dirname "$REPO_DIR")"
if [ -d "$REPO_DIR/.git" ]; then
  git -C "$REPO_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$REPO_DIR"
fi

echo "[4/7] Ensuring books directory exists..."
mkdir -p "$REPO_DIR/books"
chown -R "$TARGET_USER":"$TARGET_USER" "$REPO_DIR/books" || true

ENV_FILE="$REPO_DIR/.env"
echo "[5/7] Writing environment file to $ENV_FILE..."
cat > "$ENV_FILE" <<EOF
BOT_TOKEN=$BOT_TOKEN
WEB_APP_URL=$WEB_APP_URL
PORT=$PORT
AI_PROVIDER=$AI_PROVIDER
OPENAI_API_KEY=$OPENAI_API_KEY
NODE_ENV=$NODE_ENV
EOF

DOCKERFILE_PATH="$REPO_DIR/Dockerfile"
if [ ! -f "$DOCKERFILE_PATH" ]; then
  echo "[6/7] Creating Dockerfile..."
  cat > "$DOCKERFILE_PATH" <<'EOF'
FROM node:20-bookworm-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOF
else
  echo "[6/7] Dockerfile already exists, leaving as-is."
fi

COMPOSE_FILE="$REPO_DIR/compose.yaml"
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "[6/7] Creating compose.yaml..."
  cat > "$COMPOSE_FILE" <<EOF
services:
  verba:
    build: .
    image: $IMAGE_NAME
    container_name: $SERVICE_NAME
    env_file:
      - .env
    ports:
      - "$PORT:3000"
    volumes:
      - ./books:/usr/src/app/books
    restart: unless-stopped
EOF
else
  echo "[6/7] compose.yaml already exists, leaving as-is."
fi

echo "[7/7] Building and starting the container..."
cd "$REPO_DIR"
docker compose -f "$COMPOSE_FILE" down || true
docker compose -f "$COMPOSE_FILE" up -d --build

echo
docker ps --filter "name=$SERVICE_NAME"

echo
echo "Deployment complete."
echo "- App should be reachable on port $PORT (http://SERVER_IP:$PORT)."
echo "- Telegram bot polling starts as soon as the container launches."
echo "- If you were added to the docker group, log out and back in to gain access."
```

**Как использовать**
- Сохраните содержимое в `setup-verba.sh`, сделайте исполняемым: `chmod +x setup-verba.sh`.
- Запустите (от имени root или через sudo), заранее задав переменные:
  ```
  sudo BOT_TOKEN="ваш_токен" \
       WEB_APP_URL="https://ваш-домен" \
       PORT=3000 \
       bash setup-verba.sh
  ```
- После завершения, если ваш пользователь был добавлен в группу `docker`, перелогиньтесь.