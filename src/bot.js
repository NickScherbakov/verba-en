const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-domain.com';
const PORT = process.env.PORT || 3000;
const AI_PROVIDER = process.env.AI_PROVIDER || 'mock';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

// AI Response Cache (simple in-memory cache)
const aiCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// AI Service Integration
class AIService {
    constructor(provider) {
        this.provider = provider;
    }

    // Get cached response or return null
    getCached(key) {
        const cached = aiCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    // Set cached response
    setCache(key, data) {
        aiCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Mock AI responses (fallback when no API key configured)
    async getMockResponse(type, input) {
        switch(type) {
            case 'define':
                return {
                    word: input,
                    definition: `Definition of "${input}": This is a sample definition. Configure your AI provider (OpenAI, Google Cloud, or HuggingFace) in .env file to get real definitions.`,
                    examples: [
                        `Example 1: "${input}" is commonly used in sentences.`,
                        `Example 2: Here is another example with "${input}".`
                    ],
                    partOfSpeech: 'noun/verb/adjective'
                };
            case 'summarize':
                return {
                    summary: `Summary: This is a mock summary of the provided text. To get real AI-powered summaries, configure your AI provider API key in the .env file. The original text had approximately ${input.split(' ').length} words.`,
                    keyPoints: [
                        'Key point 1: Main idea extracted',
                        'Key point 2: Supporting detail',
                        'Key point 3: Conclusion'
                    ]
                };
            case 'grammar':
                return {
                    original: input,
                    corrected: input,
                    suggestions: input.length > 10 ? [] : ['The text seems too short. Add more details.'],
                    score: Math.floor(Math.random() * 20) + 80,
                    message: input.length < 10 ? 'Text is too short for proper analysis.' : 'No grammar issues detected (mock mode).'
                };
            case 'chat':
                return {
                    response: `This is a mock chatbot response to: "${input}". To enable real conversational AI, configure your AI provider (OpenAI recommended) in the .env file. I can help you practice English!`
                };
            default:
                return { error: 'Unknown request type' };
        }
    }

    // Get word definition
    async getDefinition(word) {
        const cacheKey = `define:${word.toLowerCase()}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            let result;
            if (this.provider === 'mock' || !OPENAI_API_KEY) {
                result = await this.getMockResponse('define', word);
            } else {
                // In a real implementation, call the AI API here
                result = await this.getMockResponse('define', word);
            }
            
            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('AI Definition Error:', error);
            return await this.getMockResponse('define', word);
        }
    }

    // Summarize text
    async summarizeText(text) {
        const cacheKey = `summarize:${text.substring(0, 100)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            let result;
            if (this.provider === 'mock' || !OPENAI_API_KEY) {
                result = await this.getMockResponse('summarize', text);
            } else {
                // In a real implementation, call the AI API here
                result = await this.getMockResponse('summarize', text);
            }
            
            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('AI Summarization Error:', error);
            return await this.getMockResponse('summarize', text);
        }
    }

    // Check grammar
    async checkGrammar(text) {
        const cacheKey = `grammar:${text.substring(0, 100)}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            let result;
            if (this.provider === 'mock' || !OPENAI_API_KEY) {
                result = await this.getMockResponse('grammar', text);
            } else {
                // In a real implementation, call the AI API here
                result = await this.getMockResponse('grammar', text);
            }
            
            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('AI Grammar Check Error:', error);
            return await this.getMockResponse('grammar', text);
        }
    }

    // Chat with AI
    async chat(message, conversationHistory = []) {
        try {
            let result;
            if (this.provider === 'mock' || !OPENAI_API_KEY) {
                result = await this.getMockResponse('chat', message);
            } else {
                // In a real implementation, call the AI API here with conversation history
                result = await this.getMockResponse('chat', message);
            }
            
            return result;
        } catch (error) {
            console.error('AI Chat Error:', error);
            return await this.getMockResponse('chat', message);
        }
    }
}

// Initialize AI Service
const aiService = new AIService(AI_PROVIDER);

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

// AI API Endpoints

// Get word definition
app.post('/api/ai/define', async (req, res) => {
    try {
        const { word } = req.body;
        if (!word || word.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Word is required' 
            });
        }

        const result = await aiService.getDefinition(word.trim());
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Define endpoint error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get definition',
            message: 'AI service temporarily unavailable. Please try again later.'
        });
    }
});

// Summarize text
app.post('/api/ai/summarize', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Text is required' 
            });
        }

        const result = await aiService.summarizeText(text.trim());
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Summarize endpoint error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to summarize text',
            message: 'AI service temporarily unavailable. Please try again later.'
        });
    }
});

// Check grammar
app.post('/api/ai/grammar-check', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Text is required' 
            });
        }

        const result = await aiService.checkGrammar(text.trim());
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Grammar check endpoint error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to check grammar',
            message: 'AI service temporarily unavailable. Please try again later.'
        });
    }
});

// Chat with AI
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Message is required' 
            });
        }

        const result = await aiService.chat(message.trim(), history || []);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to process chat',
            message: 'AI service temporarily unavailable. Please try again later.'
        });
    }
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
