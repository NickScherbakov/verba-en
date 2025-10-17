# AI Features Documentation

## Overview

Verba-EN now includes AI-powered features to enhance your English learning experience. These features help with vocabulary building, text comprehension, grammar checking, and conversational practice.

## Available Features

### 1. 🤖 Word Definition Lookup

Get instant AI-powered definitions and usage examples for any word.

**How to use:**
1. Type a word in the "Word" field under "Vocabulary Notes"
2. Click the "🤖 Get Definition" button
3. The definition will be automatically loaded into the "Definition/Translation" field
4. Examples of usage will be shown in a popup

**Benefits:**
- Instant definitions without leaving the app
- Real-world usage examples
- Cached responses for faster lookups

### 2. ✨ Text Summarization

Summarize any page or chapter to quickly understand the main points.

**How to use:**
1. Navigate to any page in your book
2. Click the "✨ Summarize Page" button below the content
3. View the AI-generated summary with key points

**Benefits:**
- Quick comprehension of long texts
- Extracted key points for easy review
- Helps with note-taking and studying

### 3. ✓ Grammar Checking

Check your vocabulary notes and definitions for grammar errors.

**How to use:**
1. Type your text in the "Definition/Translation" field
2. Click the "✓ Check Grammar" button
3. View the grammar score and suggestions
4. Feedback appears below the input fields and auto-hides after 10 seconds

**Benefits:**
- Improve your writing accuracy
- Learn from corrections
- Build better language habits

### 4. 💬 English Practice Chat

Practice English conversation with an AI chatbot.

**How to use:**
1. Scroll to the "English Practice Chat" section
2. Type your message in the chat input
3. Press Enter or click "Send"
4. The AI will respond to help you practice

**Benefits:**
- 24/7 conversation practice
- Safe environment to make mistakes
- Get help with grammar, vocabulary, or general questions
- Chat history is saved locally

## Configuration

### AI Provider Setup

The app supports multiple AI providers:

1. **OpenAI** (Recommended for best results)
2. **Google Cloud NLP**
3. **HuggingFace**
4. **Mock Mode** (Default - for testing without API keys)

### Setting Up Your AI Provider

1. Copy `.env.example` to `.env`
2. Choose your AI provider and add your API key:

```bash
# For OpenAI
OPENAI_API_KEY=your_openai_api_key_here
AI_PROVIDER=openai

# For Google Cloud
GOOGLE_CLOUD_API_KEY=your_google_api_key_here
AI_PROVIDER=google

# For HuggingFace
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
AI_PROVIDER=huggingface

# For testing (no API key needed)
AI_PROVIDER=mock
```

3. Restart the server: `npm start`

### Getting API Keys

#### OpenAI (Recommended)
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste it into your `.env` file

#### Google Cloud NLP
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Cloud Natural Language API
3. Create credentials (API key)
4. Copy and paste it into your `.env` file

#### HuggingFace
1. Visit [HuggingFace](https://huggingface.co/)
2. Create an account or sign in
3. Go to Settings > Access Tokens
4. Create a new token
5. Copy and paste it into your `.env` file

## Caching

All AI responses are automatically cached for 24 hours to:
- Reduce API costs
- Improve response speed
- Provide offline access to previously requested data

The cache is stored in-memory and resets when the server restarts.

## Error Handling

The app includes robust error handling:
- Fallback to mock responses if AI service is unavailable
- User-friendly error messages
- Automatic retry logic
- Graceful degradation

## Privacy & Security

- API keys are stored securely in environment variables
- No conversation data is sent to external servers (except AI provider)
- Chat history is stored locally in your browser
- All communications use HTTPS

## Usage Tips

1. **Definition Lookup**: Try looking up words while reading to build context
2. **Summarization**: Use at the end of each chapter for quick review
3. **Grammar Check**: Check your notes before saving them
4. **Chat Practice**: Use the chatbot to:
   - Ask questions about the book
   - Practice sentence construction
   - Get explanations of grammar rules
   - Role-play conversations

## Troubleshooting

### AI features not working
- Check that your API key is correctly set in `.env`
- Verify the `AI_PROVIDER` setting matches your chosen provider
- Restart the server after changing `.env`
- Check server logs for error messages

### Slow response times
- First request may be slower (no cache)
- Check your internet connection
- Consider upgrading your AI provider plan

### Mock mode messages appearing
- This means no API key is configured
- Set up a real AI provider for full functionality
- Mock mode is only for testing

## Support

For issues or questions:
1. Check the main README.md
2. Review server logs for errors
3. Ensure API keys are valid and have sufficient credits
4. Verify your internet connection

## Future Enhancements

Planned features:
- Speech-to-text for pronunciation practice
- Text-to-speech for listening practice
- Flashcard generation from vocabulary
- Progress tracking with AI insights
- Multi-language support
