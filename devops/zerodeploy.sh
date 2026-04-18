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

echo "[1/6] Updating APT cache and installing prerequisites..."
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
  echo "[2/6] Adding $TARGET_USER to docker group (effective after re-login)..."
  usermod -aG docker "$TARGET_USER"
else
  echo "[2/6] Skipping docker group modification for root user."
fi

echo "[3/6] Cloning or updating repository in $REPO_DIR..."
mkdir -p "$(dirname "$REPO_DIR")"
if [ -d "$REPO_DIR/.git" ]; then
  git -C "$REPO_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$REPO_DIR"
fi

echo "[4/6] Ensuring books directory exists..."
mkdir -p "$REPO_DIR/books"
chown -R "$TARGET_USER":"$TARGET_USER" "$REPO_DIR/books" || true

ENV_FILE="$REPO_DIR/.env"
echo "[5/6] Writing environment file to $ENV_FILE..."
cat > "$ENV_FILE" <<EOF
BOT_TOKEN=$BOT_TOKEN
WEB_APP_URL=$WEB_APP_URL
PORT=$PORT
AI_PROVIDER=$AI_PROVIDER
OPENAI_API_KEY=$OPENAI_API_KEY
NODE_ENV=$NODE_ENV
EOF

COMPOSE_FILE="$REPO_DIR/compose.yaml"

echo "[6/6] Building and starting the container..."
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