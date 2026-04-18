# Architecture

## Project overview

Verba-EN is an English learning platform with two independent products:

| Component | Technology | Entry point |
|---|---|---|
| Telegram Mini App (PDF reader + AI) | Node.js + Express + Telegram Bot API | `src/bot.js` |
| Quest Website (EGE prep) | Pure HTML/CSS/JS | `quest/index.html` |

---

## Directory structure

```
verba-en/
├── books/              # Place PDF files here (auto-loaded on startup)
├── data/               # Extracted PDF content cache
├── devops/
│   ├── zerodeploy.sh   # One-command Ubuntu 24 VPS deploy
│   └── README.md       # Devops documentation
├── docs/               # All documentation
│   ├── QUICKSTART.md
│   ├── DEPLOYMENT.md
│   ├── AI_FEATURES.md
│   ├── QUEST.md
│   ├── ARCHITECTURE.md (this file)
│   └── archive/        # Historical documents
├── public/             # Telegram Mini App frontend (SPA)
│   ├── index.html      # Shell HTML
│   ├── styles.css      # Responsive styling + Telegram theme support
│   └── app.js          # All frontend logic (screens, AI calls, storage)
├── quest/              # Quest website (standalone, no backend needed)
│   ├── index.html      # Quest home page
│   ├── css/            # Quest styles
│   ├── js/             # Quiz engine (main.js, quiz.js, storage.js)
│   └── levels/         # 20 level HTML pages
├── scripts/
│   └── extract-pdf.js  # Standalone PDF extraction utility
├── src/
│   └── bot.js          # Telegram bot + Express server (all backend)
├── .env.example        # Environment variable template
├── .dockerignore
├── compose.yaml        # Docker Compose definition
├── Dockerfile          # Production container image
├── package.json
└── Procfile            # For Heroku / Railway
```

---

## How it works

### PDF processing

1. On startup, `src/bot.js` scans the `books/` directory for `.pdf` files
2. The first PDF found is extracted with `pdf-parse` and split into ~500-character chunks
3. Each chunk becomes one "page" served via the `/api/page` endpoint

### Telegram Mini App flow

1. User sends `/start` to the bot
2. Bot replies with a button that opens the Mini App (`WEB_APP_URL`)
3. The Mini App SPA (`public/app.js`) loads and calls `/api/book-info`
4. User reads pages, adds bookmarks/vocabulary — all stored in `localStorage`
5. For AI features, the frontend calls `/api/ai/*` endpoints in `src/bot.js`

### AI providers

`src/bot.js` reads `AI_PROVIDER` from the environment and delegates AI calls to the matching provider module (OpenAI / Google / HuggingFace / Mock). Responses are cached in memory for 24 hours.

### Authentication

API routes under `/api` use an `X-Telegram-Init-Data` header for optional HMAC-SHA256 verification (controlled by `VALIDATE_INIT_DATA`). An in-memory rate limiter enforces 60 requests/minute per IP.

### Quest website

The quest is a fully static frontend — it needs no backend. Progress is stored in `localStorage`. It can be deployed to GitHub Pages independently of the Node.js server.

---

## Customization

### Adjust page chunk size

Edit `src/bot.js` and change:
```javascript
const pagesPerChunk = 500; // characters per page
```

### Styling

- Mini App: edit `public/styles.css` — uses Telegram CSS variables automatically
- Quest: edit `quest/css/style.css` — uses CSS custom properties in `:root`
