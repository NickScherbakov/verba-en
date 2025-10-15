# Quick Start Guide

Get your Verba-EN Telegram Mini App running in 5 minutes!

## Prerequisites

- Node.js installed on your computer
- A Telegram account
- A PDF book you want to read

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/NickScherbakov/verba-en.git
cd verba-en

# Install dependencies
npm install
```

### 2. Add Your Book

Place your PDF file in the `books` directory:

```bash
cp /path/to/your/book.pdf books/
```

### 3. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "My Book Reader")
4. Choose a username (e.g., "mybookreader_bot")
5. Copy the bot token you receive

### 4. Configure Environment

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your bot token:

```
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
WEB_APP_URL=http://localhost:3000
PORT=3000
```

### 5. Run the App

```bash
npm start
```

You should see:
```
🚀 Server running on port 3000
📁 Web App: http://localhost:3000
📚 Loading book...
Processed PDF: your-book-name
Total pages: 150
✅ Ready to serve!
```

### 6. Test Locally

Open your browser and go to: `http://localhost:3000`

You should see the book reader interface with your book content!

## Next Steps

### For Local Testing (Development)

You can test the web app directly in your browser at `http://localhost:3000`. This is perfect for:
- Checking if your PDF was processed correctly
- Testing the UI and features
- Making customizations

### For Telegram Integration (Production)

To use it as a real Telegram Mini App, you need to deploy it to a public server:

1. **Choose a hosting platform** (see DEPLOYMENT.md for options):
   - Heroku (easiest)
   - Vercel
   - Your own server

2. **Deploy your app** and get a public URL (e.g., `https://your-app.herokuapp.com`)

3. **Configure the Web App in Telegram**:
   - Go to [@BotFather](https://t.me/botfather)
   - Send `/setmenubutton`
   - Select your bot
   - Provide button text: "📚 Open Reader"
   - Provide Web App URL: your deployed URL (must be HTTPS)

4. **Start using it**:
   - Open your bot in Telegram
   - You'll see the "📚 Open Reader" button in the menu
   - Click it to open your mini app!

## Common Issues

### "No PDF files found"
- Make sure your PDF is in the `books/` directory
- Check the file has a `.pdf` extension

### "Bot token is invalid"
- Verify you copied the complete token from BotFather
- Make sure there are no extra spaces

### "Port already in use"
- Change the PORT in `.env` to a different number (e.g., 3001)
- Or stop the other application using port 3000

### Web App doesn't open in Telegram
- Make sure you've deployed to a public HTTPS URL
- Verify the WEB_APP_URL in your environment variables is correct
- Telegram requires HTTPS for Web Apps (HTTP only works for localhost during development)

## Features to Try

Once your app is running, try these features:

1. **Navigate** through pages using the arrow buttons
2. **Add bookmarks** to save important pages
3. **Create vocabulary notes** for new words you learn
4. **Track your progress** - the app automatically saves your current page

All your data is stored locally in your browser, so it's private and persistent!

## Need Help?

- Check the full README.md for detailed documentation
- Read DEPLOYMENT.md for hosting instructions
- Review the code in `src/bot.js` and `public/app.js` to understand how it works

Happy reading! 📚
