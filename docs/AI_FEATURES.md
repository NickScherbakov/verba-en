# AI Features

Verba-EN includes four AI-powered features to enhance your English learning experience.

## Available features

| Feature | What it does |
|---|---|
| 🤖 Word Definition Lookup | Instant definitions and usage examples for any word |
| ✨ Text Summarization | Summarize any page or chapter into key points |
| ✓ Grammar Checking | Check vocabulary notes for grammar errors |
| 💬 English Practice Chat | Conversational AI for language practice |

## Configuration

Set `AI_PROVIDER` in your `.env` file to choose a provider:

```bash
# OpenAI (best results)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Google Cloud NLP
AI_PROVIDER=google
GOOGLE_CLOUD_API_KEY=...

# HuggingFace
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=...

# Mock (default — no API key needed, for testing)
AI_PROVIDER=mock
```

Restart the server after changing `.env`: `npm start`

## Getting API keys

### OpenAI
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Sign in → API Keys → Create new key

### Google Cloud NLP
1. Visit [console.cloud.google.com](https://console.cloud.google.com/)
2. Enable **Cloud Natural Language API**
3. Create credentials → API key

### HuggingFace
1. Visit [huggingface.co](https://huggingface.co/)
2. Settings → Access Tokens → New token

## Caching

All AI responses are cached in memory for 24 hours to reduce API costs and improve speed.
The cache resets when the server restarts.

## Error handling

- Falls back to mock responses when the AI service is unavailable
- Shows user-friendly error messages
- Degrades gracefully — all non-AI features continue working

## Privacy

- API keys are stored only in your `.env` (never committed to git)
- Chat history is stored locally in the browser
- Only the current request text is sent to the AI provider
