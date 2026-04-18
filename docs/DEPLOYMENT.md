# Deployment Guide

## ⚡ Option 0: One-Command VPS Deploy (Recommended)

If you have a fresh Ubuntu 24 VPS, deploy everything in one command:

```bash
sudo BOT_TOKEN="your_token" \
     WEB_APP_URL="https://your-domain.com" \
     bash <(curl -fsSL https://raw.githubusercontent.com/NickScherbakov/verba-en/main/devops/zerodeploy.sh)
```

This script installs Docker, clones the repository, creates your `.env` file, builds and starts the
Docker container, and sets up auto-restart on reboot.

See [devops/README.md](../devops/README.md) for full details.

---

## Option 1: Docker (any platform)

```bash
# Copy and fill in env file
cp .env.example .env
# Edit .env with your BOT_TOKEN and WEB_APP_URL

# Start with Docker Compose
docker compose up -d
```

To rebuild after code changes:

```bash
docker compose up -d --build
```

---

## Option 2: Railway (beginner-friendly, free tier available)

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your GitHub repository
3. Add environment variables in the dashboard (`BOT_TOKEN`, `WEB_APP_URL`)
4. Deploy automatically on every push

---

## Option 3: Render (beginner-friendly, free tier available)

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repository
3. Set **Start Command** to `npm start`
4. Add environment variables in the dashboard
5. Deploy

---

## Option 4: Vercel

> ⚠️ Vercel is optimised for serverless/static sites. Long-running bot polling does not work there.
> Use webhook mode (`WEBHOOK_MODE=true`) and configure the webhook URL after deployment.

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in the Vercel dashboard

---

## Option 5: DigitalOcean App Platform

1. Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Create a new app from GitHub
3. Configure environment variables
4. Select a plan and deploy

---

## Option 6: Your Own VPS (manual)

```bash
# 1. Connect to your server
ssh user@your-server-ip

# 2. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone and install
git clone https://github.com/NickScherbakov/verba-en.git
cd verba-en
npm install --omit=dev

# 4. Configure environment
cp .env.example .env
# Edit .env

# 5. Run with PM2
npm install -g pm2
pm2 start src/bot.js --name verba-en
pm2 save
pm2 startup
```

---

## Environment Variables Reference

All variables come from `.env` (copy `.env.example` as a starting point).

| Variable | Required | Default | Description |
|---|---|---|---|
| `BOT_TOKEN` | ✅ | — | Telegram Bot token from @BotFather |
| `WEB_APP_URL` | ✅ | — | Public HTTPS URL of the deployed app |
| `PORT` | ❌ | `3000` | HTTP port the server listens on |
| `WEBHOOK_MODE` | ❌ | `false` | `true` = use Telegram webhook (production), `false` = long-polling (development) |
| `TELEGRAM_BOT_SECRET` | ❌ | — | Random secret for webhook HMAC verification (generate with `openssl rand -hex 32`) |
| `VALIDATE_INIT_DATA` | ❌ | `false` | `true` = validate Telegram initData on every `/api/*` request (recommended for production) |
| `AI_PROVIDER` | ❌ | `mock` | AI provider: `openai`, `google`, `huggingface`, `mock` |
| `OPENAI_API_KEY` | ❌ | — | Required when `AI_PROVIDER=openai` |
| `GOOGLE_CLOUD_API_KEY` | ❌ | — | Required when `AI_PROVIDER=google` |
| `HUGGINGFACE_API_KEY` | ❌ | — | Required when `AI_PROVIDER=huggingface` |

For AI provider setup see [AI_FEATURES.md](AI_FEATURES.md).

---

## Post-deployment checklist

- [ ] Test the `/start` command in your bot
- [ ] Verify the web app opens correctly
- [ ] Upload a PDF book to the `books/` directory
- [ ] Test navigation, bookmarks, and vocabulary features
- [ ] Verify the app works on both mobile and desktop Telegram

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Bot not responding | Wrong `BOT_TOKEN` or env vars not loaded |
| Web app not loading | `WEB_APP_URL` incorrect or SSL certificate missing |
| PDF not processing | PDF not in `books/` directory or corrupt file |
| Webhook not receiving updates | `TELEGRAM_BOT_SECRET` mismatch or URL not reachable |
