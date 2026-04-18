# devops — One-Command VPS Deploy

This directory contains `zerodeploy.sh`, a Bash script that turns a fresh Ubuntu 24 VPS into a
running Verba-EN instance in a single command.

## What the script does

| Step | Action |
|---|---|
| 1 | Updates APT and installs Docker + Git |
| 2 | Adds your user to the `docker` group |
| 3 | Clones (or updates) the repository into `/opt/verba-en` |
| 4 | Creates the `books/` directory with correct permissions |
| 5 | Writes a `.env` file from the environment variables you pass |
| 6 | Builds and starts the Docker container via `docker compose` |
| 7 | Prints the running container status |

The `Dockerfile` and `compose.yaml` already exist in the repository root, so the script never
needs to generate them.

## One-liner

```bash
sudo BOT_TOKEN="your_token" \
     WEB_APP_URL="https://your-domain.com" \
     bash <(curl -fsSL https://raw.githubusercontent.com/NickScherbakov/verba-en/main/devops/zerodeploy.sh)
```

## Environment variables accepted by the script

| Variable | Required | Default | Description |
|---|---|---|---|
| `BOT_TOKEN` | ✅ | — | Telegram Bot token |
| `WEB_APP_URL` | ✅ | — | Public HTTPS URL of the app |
| `PORT` | ❌ | `3000` | Port to expose on the host |
| `AI_PROVIDER` | ❌ | `mock` | AI provider (`openai`, `google`, `huggingface`, `mock`) |
| `OPENAI_API_KEY` | ❌ | — | Required when `AI_PROVIDER=openai` |
| `NODE_ENV` | ❌ | `production` | Node environment |
| `REPO_URL` | ❌ | GitHub URL | Override repository to clone |
| `REPO_DIR` | ❌ | `/opt/verba-en` | Directory where the repo is cloned |

## After deployment

- App is reachable at `http://SERVER_IP:PORT`
- Container auto-restarts on reboot (`restart: unless-stopped`)
- To view logs: `docker logs verba-en`
- To update: `cd /opt/verba-en && git pull && docker compose up -d --build`

## Full documentation

See [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for all deployment options.
