# Quick Start — Verba-EN

Get your Verba-EN Telegram Mini App running in under 10 minutes.

## Prerequisites

- Node.js v18 or higher
- A Telegram account
- A PDF book you want to read

## 5-Step Setup

### 1. Clone and install

```bash
git clone https://github.com/NickScherbakov/verba-en.git
cd verba-en
npm install
```

### 2. Add your book

```bash
cp /path/to/your/book.pdf books/
```

### 3. Create a Telegram bot

1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow the prompts
3. Copy the bot token you receive

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in BOT_TOKEN and WEB_APP_URL
```

Minimum required variables:

```
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
WEB_APP_URL=http://localhost:3000
```

### 5. Run

```bash
npm start
```

You should see:

```
🚀 Server running on port 3000
📁 Web App: http://localhost:3000
📚 Loading book...
✅ Ready to serve!
```

Open `http://localhost:3000` in your browser to see the reader.

## Development mode (with auto-reload)

```bash
npm run dev
```

## Next steps

- **Deploy to production** → see [DEPLOYMENT.md](DEPLOYMENT.md)
- **Set up AI features** → see [AI_FEATURES.md](AI_FEATURES.md)
- **Connect to Telegram**:
  1. Deploy to a public HTTPS URL
  2. Set `WEB_APP_URL` to that URL in your `.env`
  3. In BotFather, use `/setmenubutton` → select your bot → set URL to your deployed URL

## Common issues

| Problem | Solution |
|---|---|
| "No PDF files found" | Place a `.pdf` file in the `books/` directory |
| "Bot token is invalid" | Check you copied the full token from BotFather |
| "Port already in use" | Change `PORT` in `.env` (e.g. `3001`) |
| Web App won't open in Telegram | Must be HTTPS in production; HTTP only works for localhost |
