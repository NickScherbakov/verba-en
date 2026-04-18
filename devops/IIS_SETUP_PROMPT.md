# IIS Infrastructure Setup Prompt — Trifecta Project
## Subdomain: verba.ege.infolimp.ru → verba-en Docker service

---

## Role

You are a senior DevOps/IIS infrastructure engineer on the **Trifecta project** team. Your task is to configure a new subdomain and reverse proxy for a Node.js Telegram Mini App service running in Docker.

---

## Context

A new module called **Verba-EN** is being added to the Trifecta project infrastructure. It is a Node.js/Express application packaged as a Docker container. The app serves as a **Telegram Mini App** — meaning Telegram's servers will open it inside the Telegram client. This has one hard requirement: **the public URL must be HTTPS with a valid SSL certificate**.

- **GitHub repository**: https://github.com/NickScherbakov/verba-en
- **Deploy script**: `devops/zerodeploy.sh` (Ubuntu 24, Docker-based, one-command)
- **Docker Compose file**: `compose.yaml` (in repo root)
- **Internal app port**: `3000`
- **Public URL to provision**: `https://verba.ege.infolimp.ru`

---

## Your Task

Complete **all four steps** below in order. Do not skip steps. For each step, confirm completion before proceeding to the next.

---

### Step 1 — DNS Record

Add a DNS record for the new subdomain pointing to the Trifecta server IP.

**Preferred**: A record
```
verba.ege.infolimp.ru.   IN   A   <TRIFECTA_SERVER_IP>
```

**Alternative** (if the server is already behind a CNAME chain):
```
verba.ege.infolimp.ru.   IN   CNAME   ege.infolimp.ru.
```

✅ Verify: `nslookup verba.ege.infolimp.ru` resolves to the correct IP before proceeding.

---

### Step 2 — SSL Certificate

Check whether a wildcard certificate `*.ege.infolimp.ru` already exists on the server.

**If wildcard exists** — the subdomain is already covered. Skip to Step 3.

**If no wildcard** — issue a certificate for the subdomain:
```bash
sudo certbot --nginx -d verba.ege.infolimp.ru
# OR for IIS with win-acme:
wacs.exe --target manual --host verba.ege.infolimp.ru --store certificatestore
```

✅ Verify: Certificate is valid, not self-signed, covers `verba.ege.infolimp.ru`.

---

### Step 3 — Reverse Proxy Configuration

Configure a reverse proxy from `verba.ege.infolimp.ru:443` → `localhost:3000`.

Choose the configuration block that matches your server setup:

#### Option A — IIS with Application Request Routing (ARR)

Create a new IIS site bound to `verba.ege.infolimp.ru` on port 443 with the SSL certificate from Step 2.

Place the following `web.config` in the site root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>

    <rewrite>
      <rules>
        <rule name="ReverseProxy-verba-en" stopProcessing="true">
          <match url="(.*)" />
          <conditions>
            <add input="{CACHE_URL}" pattern="^(https?)://" />
          </conditions>
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>

    <httpProtocol>
      <customHeaders>
        <add name="X-Forwarded-Proto" value="https" />
        <add name="X-Real-IP" value="{REMOTE_ADDR}" />
      </customHeaders>
    </httpProtocol>

    <webSocket enabled="true" />

  </system.webServer>
</configuration>
```

> ⚠️ Make sure **WebSocket proxying** is enabled in ARR settings:
> IIS Manager → Application Request Routing → Proxy → Enable WebSocket proxying ✅

#### Option B — Nginx (if running alongside IIS or as standalone)

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name verba.ege.infolimp.ru;
    return 301 https://$host$request_uri;
}

# Main HTTPS server block
server {
    listen 443 ssl http2;
    server_name verba.ege.infolimp.ru;

    # SSL — adjust paths to match your certificate location
    ssl_certificate     /etc/letsencrypt/live/ege.infolimp.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ege.infolimp.ru/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Reverse proxy to Docker container
    location / {
        proxy_pass          http://localhost:3000;
        proxy_http_version  1.1;

        # Required for WebSocket (Telegram Mini App uses it)
        proxy_set_header    Upgrade $http_upgrade;
        proxy_set_header    Connection 'upgrade';

        # Pass real client info to the Node.js app
        proxy_set_header    Host              $host;
        proxy_set_header    X-Real-IP         $remote_addr;
        proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto https;

        proxy_cache_bypass  $http_upgrade;
        proxy_read_timeout  60s;
    }
}
```

✅ Verify: `curl -I https://verba.ege.infolimp.ru` returns `HTTP/2 200` (or 302/301 if app redirects).

---

### Step 4 — Deploy the verba-en Application

On the target server, run the one-command deploy script. Set environment variables **before** running:

```bash
export BOT_TOKEN="<telegram_bot_token_from_botfather>"
export WEB_APP_URL="https://verba.ege.infolimp.ru"
export PORT=3000
export WEBHOOK_MODE=true
export TELEGRAM_BOT_SECRET="
$(openssl rand -hex 32)"
export VALIDATE_INIT_DATA=true
export AI_PROVIDER=mock

sudo -E bash <(curl -fsSL https://raw.githubusercontent.com/NickScherbakov/verba-en/main/devops/zerodeploy.sh)
```

The script will:
1. Install Docker (if not present)
2. Clone the repository to `/opt/verba-en`
3. Write the `.env` file from your exported variables
4. Build the Docker image
5. Start the container with `docker compose up -d`
6. Configure auto-restart on reboot

✅ Verify: `docker ps` shows `verba-en` container with status `Up`.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `BOT_TOKEN` | ✅ | — | Telegram Bot token from @BotFather |
| `WEB_APP_URL` | ✅ | — | Must be `https://verba.ege.infolimp.ru` |
| `PORT` | ❌ | `3000` | Internal HTTP port (do not change unless port conflict) |
| `WEBHOOK_MODE` | ❌ | `false` | Set `true` for production (webhook vs polling) |
| `TELEGRAM_BOT_SECRET` | ❌ | — | Random hex string for webhook HMAC verification |
| `VALIDATE_INIT_DATA` | ❌ | `false` | Set `true` to validate Telegram initData on every API request |
| `AI_PROVIDER` | ❌ | `mock` | `openai` / `google` / `huggingface` / `mock` |
| `OPENAI_API_KEY` | ❌ | — | Required only if `AI_PROVIDER=openai` |

---

## Final Acceptance Checklist

Run through every item. Mark ✅ or ❌ with a note if something failed.

- [ ] DNS resolves: `nslookup verba.ege.infolimp.ru` → correct server IP
- [ ] HTTPS works: `https://verba.ege.infolimp.ru` opens in browser, padlock shown
- [ ] No mixed content warnings in browser DevTools console
- [ ] HTTP → HTTPS redirect: `curl -I http://verba.ege.infolimp.ru` returns `301`
- [ ] App responds: `curl https://verba.ege.infolimp.ru` returns HTML content
- [ ] Docker container running: `docker ps | grep verba-en` shows `Up`
- [ ] Telegram Mini App opens inside Telegram client (test via @BotFather → `/setmenubutton` → set URL → open)
- [ ] Container survives reboot: `sudo reboot` → `docker ps` still shows container `Up`

---

## Contacts & Resources

| Resource | Link |
|---|---|
| GitHub Repository | https://github.com/NickScherbakov/verba-en |
| Deploy Script | https://github.com/NickScherbakov/verba-en/blob/main/devops/zerodeploy.sh |
| Docker Compose | https://github.com/NickScherbakov/verba-en/blob/main/compose.yaml |
| Full Deployment Docs | https://github.com/NickScherbakov/verba-en/blob/main/docs/DEPLOYMENT.md |
| Project Owner | @NickScherbakov |

---

*This prompt was generated for the Trifecta project infrastructure team.*
*Last updated: 2026-04-18*