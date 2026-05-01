const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const crypto = require('crypto');

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-domain.com';
const PORT = process.env.PORT || 3000;
const AI_PROVIDER = process.env.AI_PROVIDER || 'mock';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WEBHOOK_MODE = process.env.WEBHOOK_MODE === 'true';
const TELEGRAM_BOT_SECRET = process.env.TELEGRAM_BOT_SECRET || '';
const VALIDATE_INIT_DATA = process.env.VALIDATE_INIT_DATA === 'true';

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize Telegram Bot
let bot;
if (WEBHOOK_MODE) {
    // In webhook mode the bot instance processes updates via POST /webhook
    bot = new TelegramBot(BOT_TOKEN);
    console.log('Bot initialized in webhook mode.');
} else {
    try {
        bot = new TelegramBot(BOT_TOKEN, { polling: true });
        console.log('Bot started successfully (polling)!');
    } catch (error) {
        console.log('Bot initialization skipped (token not configured):', error.message);
    }
}

// Webhook endpoint (only active when WEBHOOK_MODE=true)
app.post('/webhook', (req, res) => {
    // If a secret token is configured, every request must carry it
    if (TELEGRAM_BOT_SECRET.length > 0) {
        if (req.headers['x-telegram-bot-api-secret-token'] !== TELEGRAM_BOT_SECRET) {
            return res.status(403).send('Forbidden');
        }
    }
    if (bot) bot.processUpdate(req.body);
    res.sendStatus(200);
});

// ─── Telegram initData validation ────────────────────────────────────────────
// Validates the X-Telegram-Init-Data header using HMAC-SHA256 per Telegram spec.
// Returns { user, params } on success, null on failure.
function verifyInitData(initDataStr) {
    if (!initDataStr) return null;
    try {
        const params = new URLSearchParams(initDataStr);
        const hash = params.get('hash');
        if (!hash) return null;
        params.delete('hash');

        const dataCheckString = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join('\n');

        const secretKey = crypto.createHmac('sha256', 'WebAppData')
            .update(BOT_TOKEN)
            .digest();
        const expected = crypto.createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        if (expected !== hash) return null;

        const userStr = params.get('user');
        const user = userStr ? JSON.parse(userStr) : null;
        return { user, params };
    } catch (e) {
        return null;
    }
}

// Middleware: require valid initData on /api/* routes when VALIDATE_INIT_DATA=true.
// In development (VALIDATE_INIT_DATA=false) the header is optional — a guest user is used.
function requireInitData(req, res, next) {
    const initDataStr = req.headers['x-telegram-init-data'];
    if (!VALIDATE_INIT_DATA) {
        // Development mode — attach a guest user if no header present
        if (!initDataStr) {
            req.tgUser = { id: 'dev_guest', first_name: 'Developer' };
            return next();
        }
    }
    const result = verifyInitData(initDataStr);
    if (!result) {
        return res.status(401).json({ success: false, error: 'Missing or invalid Telegram initData' });
    }
    req.tgUser = result.user;
    next();
}

// Simple in-memory rate limiter for /api/* routes (no external dependencies)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // max 60 requests per minute per IP

function rateLimiter(req, res, next) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || (now - entry.start) > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.set(key, { start: now, count: 1 });
        return next();
    }
    if (entry.count >= RATE_LIMIT_MAX) {
        return res.status(429).json({ success: false, error: 'Too many requests. Please slow down.' });
    }
    entry.count++;
    next();
}

// Periodically evict stale rate limit entries to prevent unbounded memory growth
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
        if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000); // run every 5 minutes

app.use('/api', requireInitData);
app.use('/api', rateLimiter);

// ─── User progress store ──────────────────────────────────────────────────────
// In-memory store with JSON file persistence (no native dependencies required).
const progressStore = new Map();
const PROGRESS_FILE = path.join(__dirname, '../data/user-progress.json');

function loadProgress() {
    try {
        if (fs.existsSync(PROGRESS_FILE)) {
            const raw = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
            Object.entries(raw).forEach(([k, v]) => progressStore.set(k, v));
            console.log(`Loaded progress for ${progressStore.size} user(s).`);
        }
    } catch (e) {
        console.error('Failed to load progress file:', e.message);
    }
}

function saveProgress() {
    try {
        const dir = path.dirname(PROGRESS_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const obj = Object.fromEntries(progressStore);
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify(obj, null, 2));
    } catch (e) {
        console.error('Failed to save progress file:', e.message);
    }
}

// GET /api/user/progress — return progress for the authenticated user
app.get('/api/user/progress', (req, res) => {
    const userId = req.tgUser && req.tgUser.id ? String(req.tgUser.id) : null;
    if (!userId) return res.status(400).json({ success: false, error: 'No user ID' });
    const progress = progressStore.get(userId) || null;
    res.json({ success: true, userId, progress });
});

// POST /api/user/progress — save progress for the authenticated user
app.post('/api/user/progress', (req, res) => {
    const userId = req.tgUser && req.tgUser.id ? String(req.tgUser.id) : null;
    if (!userId) return res.status(400).json({ success: false, error: 'No user ID' });
    const { progress } = req.body;
    if (!progress || typeof progress !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid progress payload' });
    }
    progressStore.set(userId, progress);
    saveProgress();
    res.json({ success: true });
});

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

    // Call OpenAI chat completions and return parsed JSON from the model
    async _openaiJson(messages, temperature = 0.3) {
        const axios = require('axios');
        const resp = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages,
                temperature,
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );
        return JSON.parse(resp.data.choices[0].message.content);
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
                result = await this._openaiJson([
                    {
                        role: 'system',
                        content: 'You are an English language assistant helping Russian students prepare for the EGE exam. ' +
                                 'Always respond with valid JSON only, no markdown.'
                    },
                    {
                        role: 'user',
                        content: `Define the English word "${word}". ` +
                                 'Return JSON with keys: word (string), definition (string), ' +
                                 'examples (array of 2 example sentences), partOfSpeech (string).'
                    }
                ]);
            }

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('AI Definition Error:', error.message || error);
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
                result = await this._openaiJson([
                    {
                        role: 'system',
                        content: 'You are an English language assistant helping Russian students prepare for the EGE exam. ' +
                                 'Always respond with valid JSON only, no markdown.'
                    },
                    {
                        role: 'user',
                        content: `Summarize the following English text in 2-3 sentences and provide 3 key points. ` +
                                 'Return JSON with keys: summary (string), keyPoints (array of 3 strings). ' +
                                 `Text:\n${text.substring(0, 3000)}`
                    }
                ]);
            }

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('AI Summarization Error:', error.message || error);
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
                result = await this._openaiJson([
                    {
                        role: 'system',
                        content: 'You are an English grammar checker for Russian EGE students. ' +
                                 'Always respond with valid JSON only, no markdown.'
                    },
                    {
                        role: 'user',
                        content: `Check the following English text for grammar and spelling errors. ` +
                                 'Return JSON with keys: original (string), corrected (string), ' +
                                 'suggestions (array of strings describing each issue), ' +
                                 'score (integer 0-100 reflecting grammar quality), ' +
                                 `message (string with overall feedback). Text: "${text}"`
                    }
                ]);
            }

            this.setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('AI Grammar Check Error:', error.message || error);
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
                const messages = [
                    {
                        role: 'system',
                        content: 'You are a friendly English practice partner helping Russian students prepare for the EGE exam. ' +
                                 'Speak only in English. Keep responses concise (2-4 sentences). ' +
                                 'Always respond with valid JSON only, no markdown, with a single key: response (string).'
                    },
                    ...conversationHistory.slice(-10).map(m => ({ role: m.role, content: m.content })),
                    { role: 'user', content: message }
                ];
                result = await this._openaiJson(messages, 0.7);
            }

            return result;
        } catch (error) {
            console.error('AI Chat Error:', error.message || error);
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
    // /start with optional deep-link parameter (e.g. /start level_5)
    bot.onText(/\/start(?:\s+(.+))?/, (msg, match) => {
        const chatId = msg.chat.id;
        const param = match && match[1] ? match[1].trim() : '';

        let text = '👋 Welcome to Verba-EN!\n\nYour personal English learning companion.\n\n';
        const buttons = [];

        if (param.startsWith('level_')) {
            const levelId = param.split('_')[1];
            text += `Click below to open Level ${levelId} directly:`;
            buttons.push([{
                text: `🎯 Open Level ${levelId}`,
                web_app: { url: `${WEB_APP_URL}?startapp=${param}` }
            }]);
        } else {
            text += 'Click below to open the app:';
            buttons.push([{
                text: '📚 Open Book Reader',
                web_app: { url: WEB_APP_URL }
            }]);
            buttons.push([{
                text: '🎯 Open EGE Quest',
                web_app: { url: `${WEB_APP_URL}?startapp=quest` }
            }]);
        }

        bot.sendMessage(chatId, text, { reply_markup: { inline_keyboard: buttons } });
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
    loadProgress();

    if (WEBHOOK_MODE && bot && WEB_APP_URL) {
        const webhookUrl = `${WEB_APP_URL}/webhook`;
        try {
            await bot.setWebHook(webhookUrl, {
                secret_token: TELEGRAM_BOT_SECRET.length > 0 ? TELEGRAM_BOT_SECRET : undefined
            });
            console.log(`✅ Webhook set to: ${webhookUrl}`);
        } catch (e) {
            console.error('Failed to set webhook:', e.message);
        }
    }

    console.log('\n✅ Ready to serve!\n');
});
