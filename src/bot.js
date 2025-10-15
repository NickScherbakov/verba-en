const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-domain.com';
const PORT = process.env.PORT || 3000;

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize Telegram Bot
let bot;
try {
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log('Bot started successfully!');
} catch (error) {
    console.log('Bot initialization skipped (token not configured):', error.message);
}

// Store processed book content
let bookData = {
    title: 'Sample Book',
    pages: [],
    totalPages: 0
};

// Process PDF file
async function processPDF(pdfPath) {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        
        // Extract text and split into pages
        const text = data.text;
        const pagesPerChunk = 500; // Characters per page in the app
        const pages = [];
        
        let currentPage = '';
        const words = text.split(/\s+/);
        
        for (const word of words) {
            if (currentPage.length + word.length + 1 > pagesPerChunk) {
                pages.push(currentPage.trim());
                currentPage = word;
            } else {
                currentPage += (currentPage ? ' ' : '') + word;
            }
        }
        
        if (currentPage) {
            pages.push(currentPage.trim());
        }
        
        bookData = {
            title: path.basename(pdfPath, '.pdf'),
            pages: pages,
            totalPages: pages.length
        };
        
        console.log(`Processed PDF: ${bookData.title}`);
        console.log(`Total pages: ${bookData.totalPages}`);
        
        return true;
    } catch (error) {
        console.error('Error processing PDF:', error);
        return false;
    }
}

// Check for PDF files in the books directory
async function loadBook() {
    const booksDir = path.join(__dirname, '../books');
    
    // Create books directory if it doesn't exist
    if (!fs.existsSync(booksDir)) {
        fs.mkdirSync(booksDir, { recursive: true });
        console.log('Created books directory');
    }
    
    // Find first PDF file
    const files = fs.readdirSync(booksDir);
    const pdfFile = files.find(file => file.toLowerCase().endsWith('.pdf'));
    
    if (pdfFile) {
        const pdfPath = path.join(booksDir, pdfFile);
        console.log(`Found PDF: ${pdfFile}`);
        await processPDF(pdfPath);
    } else {
        console.log('No PDF files found in books directory');
        console.log('Upload a PDF file to /books directory to get started');
    }
}

// API endpoint to get book content
app.get('/api/book-content', (req, res) => {
    if (bookData.pages.length > 0) {
        res.json({
            success: true,
            title: bookData.title,
            pages: bookData.pages,
            totalPages: bookData.totalPages
        });
    } else {
        res.json({
            success: false,
            message: 'No book loaded yet'
        });
    }
});

// API endpoint to get book info
app.get('/api/book-info', (req, res) => {
    res.json({
        title: bookData.title,
        totalPages: bookData.totalPages,
        hasContent: bookData.pages.length > 0
    });
});

// Bot command handlers
if (bot) {
    // Start command
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '📚 Open Book Reader',
                            web_app: { url: WEB_APP_URL }
                        }
                    ]
                ]
            }
        };
        
        bot.sendMessage(
            chatId,
            '👋 Welcome to Verba-EN!\n\n' +
            'Your personal English learning companion.\n\n' +
            'Click the button below to start reading:',
            opts
        );
    });

    // Help command
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(
            chatId,
            '📖 *Verba-EN Help*\n\n' +
            '*Commands:*\n' +
            '/start - Open the book reader\n' +
            '/help - Show this help message\n' +
            '/info - Show current book information\n\n' +
            '*Features:*\n' +
            '• Read books page by page\n' +
            '• Track your reading progress\n' +
            '• Add bookmarks\n' +
            '• Save vocabulary notes\n\n' +
            'All your progress is saved automatically!',
            { parse_mode: 'Markdown' }
        );
    });

    // Info command
    bot.onText(/\/info/, (msg) => {
        const chatId = msg.chat.id;
        if (bookData.pages.length > 0) {
            bot.sendMessage(
                chatId,
                `📚 *Current Book*\n\n` +
                `Title: ${bookData.title}\n` +
                `Total Pages: ${bookData.totalPages}\n\n` +
                `Click /start to begin reading!`,
                { parse_mode: 'Markdown' }
            );
        } else {
            bot.sendMessage(
                chatId,
                '📭 No book loaded yet.\n\n' +
                'Please upload a PDF file to the books directory.',
                { parse_mode: 'Markdown' }
            );
        }
    });

    // Handle errors
    bot.on('polling_error', (error) => {
        console.log('Polling error:', error.message);
    });
}

// Start server
app.listen(PORT, async () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📁 Web App: http://localhost:${PORT}`);
    console.log('\n📚 Loading book...');
    await loadBook();
    console.log('\n✅ Ready to serve!\n');
});
