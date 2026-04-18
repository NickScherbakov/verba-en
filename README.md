# Verba-EN 📚

An English learning platform with a **Telegram Mini App** for PDF reading and an **interactive Quest website** for EGE exam preparation.

## Features

| Telegram Mini App | Quest Website |
|---|---|
| 📖 PDF Book Reader (page-by-page) | 🎯 20 Interactive Variants (Levels) |
| 📊 Progress Tracking | 🏆 Badge & Achievement System |
| 🔖 Bookmarks with notes | 📝 Multiple question types |
| 📝 Vocabulary builder | 📱 Responsive design |
| 🤖 AI Word Definitions | 💾 localStorage progress save |
| ✨ AI Text Summarization | |
| ✓ AI Grammar Checking | |
| 💬 AI Practice Chat | |

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/NickScherbakov/verba-en.git
cd verba-en
npm install

# 2. Place a PDF in books/
cp /path/to/book.pdf books/

# 3. Configure
cp .env.example .env
# Edit .env — set BOT_TOKEN and WEB_APP_URL

# 4. Run
npm start
```

Open `http://localhost:3000` to verify the reader works.

For development with auto-reload: `npm run dev`

## Documentation

| Guide | Description |
|---|---|
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | Step-by-step setup from zero to running |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | All deployment options + environment variables reference |
| [docs/AI_FEATURES.md](docs/AI_FEATURES.md) | AI provider setup |
| [docs/QUEST.md](docs/QUEST.md) | Quest website documentation |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Project structure and how it works |

## One-command VPS deploy

```bash
sudo BOT_TOKEN="your_token" \
     WEB_APP_URL="https://your-domain.com" \
     bash <(curl -fsSL https://raw.githubusercontent.com/NickScherbakov/verba-en/main/devops/zerodeploy.sh)
```

See [devops/README.md](devops/README.md) for details.

## Project structure

```
verba-en/
├── books/          # Place PDF files here
├── docs/           # All documentation
├── devops/         # Deploy scripts
├── public/         # Telegram Mini App frontend (SPA)
├── quest/          # Quest website (standalone, no backend)
├── src/
│   └── bot.js      # Telegram bot + Express server
├── Dockerfile
├── compose.yaml
└── package.json
```

## Bot commands

- `/start` — open the book reader
- `/help` — show help message
- `/info` — show current book information

## License

MIT License — see [LICENSE](LICENSE) for details.
