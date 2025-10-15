# Verba-EN 📚

A Telegram Mini App for reading and studying from PDF books. Perfect for language learners who want to read books, track progress, create bookmarks, and build vocabulary lists.

## Features

- 📖 **PDF Book Reader** - Upload any PDF book and read it page by page
- 📊 **Progress Tracking** - Automatically track your reading progress
- 🔖 **Bookmarks** - Save important pages with notes
- 📝 **Vocabulary Notes** - Build your personal vocabulary list
- 🎨 **Telegram Theme Integration** - Automatically matches your Telegram theme
- 💾 **Auto-Save** - Your progress is saved automatically

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- A Telegram Bot (create one via [@BotFather](https://t.me/botfather))
- A web server or hosting platform (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NickScherbakov/verba-en.git
   cd verba-en
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your PDF book**
   - Place your PDF file in the `/books` directory
   - The app will automatically process the first PDF it finds

4. **Configure your Telegram Bot**
   - Create a bot using [@BotFather](https://t.me/botfather)
   - Get your bot token
   - Set up environment variables:
   ```bash
   export BOT_TOKEN="your_bot_token_here"
   export WEB_APP_URL="https://your-domain.com"
   export PORT=3000
   ```

5. **Run the application**
   ```bash
   npm start
   ```

### Telegram Bot Setup

1. Talk to [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot with `/newbot`
3. Set your bot's menu button to open the web app:
   ```
   /setmenubutton
   [Select your bot]
   [Provide button text: "📚 Open Reader"]
   [Provide web app URL: your deployed URL]
   ```

### Deployment Options

#### Option 1: Heroku
```bash
heroku create your-app-name
heroku config:set BOT_TOKEN="your_token"
heroku config:set WEB_APP_URL="https://your-app-name.herokuapp.com"
git push heroku main
```

#### Option 2: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in Vercel dashboard

#### Option 3: Your Own Server
1. Upload files to your server
2. Install dependencies: `npm install --production`
3. Use PM2 or similar to keep the app running:
   ```bash
   npm install -g pm2
   pm2 start src/bot.js --name verba-en
   pm2 save
   ```

## Usage

1. Open your bot in Telegram
2. Send `/start` command
3. Click "Open Book Reader" button
4. Start reading!

### Bot Commands

- `/start` - Open the book reader
- `/help` - Show help message
- `/info` - Show current book information

## Project Structure

```
verba-en/
├── books/              # Place your PDF files here
├── public/             # Frontend files
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styling
│   └── app.js          # Frontend logic
├── src/                # Backend files
│   └── bot.js          # Telegram bot and server
├── package.json        # Dependencies
└── README.md          # This file
```

## Development

To run in development mode:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## How It Works

1. **PDF Processing**: When you upload a PDF to the `/books` directory, the server automatically extracts and processes the text
2. **Page Splitting**: The content is split into manageable chunks (approximately 500 characters per page) for comfortable mobile reading
3. **State Management**: All user data (progress, bookmarks, vocabulary) is stored in the browser's localStorage
4. **Telegram Integration**: The app uses Telegram Web App API to integrate seamlessly with Telegram's UI

## Customization

### Adjusting Page Size
Edit `src/bot.js` and change the `pagesPerChunk` variable:
```javascript
const pagesPerChunk = 500; // Characters per page
```

### Styling
Customize the appearance by editing `public/styles.css`. The app automatically adapts to Telegram's theme colors.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions:
1. Check the console logs for errors
2. Ensure your bot token is correct
3. Verify that your PDF file is in the `/books` directory
4. Make sure your web app URL is properly configured

## Credits

Created with ❤️ for language learners

---

**Note**: Make sure to replace `YOUR_BOT_TOKEN_HERE` and `https://your-domain.com` with your actual bot token and deployed URL before running in production.