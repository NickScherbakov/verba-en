// Initialize Telegram Web App
const tg = window.Telegram && window.Telegram.WebApp
    ? window.Telegram.WebApp
    : {
        expand: function () {},
        ready: function () {},
        showAlert: function (msg, cb) { alert(msg); if (cb) cb(); },
        showPopup: function (opts, cb) {
            var isDestructive = opts.buttons && opts.buttons.some(function (b) { return b.type === 'destructive'; });
            var ok = isDestructive ? confirm(opts.message) : (alert(opts.message), true);
            if (cb) {
                var btn = ok && opts.buttons
                    ? opts.buttons.find(function (b) { return b.type !== 'cancel'; })
                    : null;
                cb(btn ? btn.id : '');
            }
        },
        themeParams: {},
        initData: '',
        initDataUnsafe: {},
        colorScheme: 'light',
        BackButton: { show: function () {}, hide: function () {}, onClick: function () {}, offClick: function () {} },
        MainButton: {
            setText: function () { return this; }, show: function () {}, hide: function () {},
            onClick: function () {}, offClick: function () {},
            showProgress: function () {}, hideProgress: function () {}, isVisible: false
        },
        HapticFeedback: { notificationOccurred: function () {}, impactOccurred: function () {} },
        onEvent: function () {},
        enableClosingConfirmation: function () {}
    };

tg.expand();
tg.enableClosingConfirmation();

// Apply Telegram theme colors
function applyTheme() {
    var p = tg.themeParams || {};
    document.documentElement.style.setProperty('--tg-theme-bg-color', p.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', p.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-hint-color', p.hint_color || '#707579');
    document.documentElement.style.setProperty('--tg-theme-link-color', p.link_color || '#3390ec');
    document.documentElement.style.setProperty('--tg-theme-button-color', p.button_color || '#3390ec');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', p.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', p.secondary_bg_color || '#f4f4f5');
}
applyTheme();
tg.onEvent('themeChanged', applyTheme);

// Current Telegram user
var tgUser = (tg.initDataUnsafe && tg.initDataUnsafe.user) || null;
var tgUserId = tgUser && tgUser.id ? String(tgUser.id) : 'guest';

// App State — keyed per Telegram user so each user has separate progress
var STATE_KEY = 'verba-en-state_' + tgUserId;
let appState = {
    currentPage: 1,
    totalPages: 1,
    bookContent: [],
    bookmarks: [],
    vocabulary: [],
    bookTitle: 'Sample Book',
    progress: 0,
    chatHistory: []
};

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appState = { ...appState, ...parsed };
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }
}

// Save state to localStorage
function saveState() {
    try {
        localStorage.setItem(STATE_KEY, JSON.stringify(appState));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

// Helper: API call that injects the Telegram initData header for server-side auth
function apiCall(url, options) {
    options = options || {};
    var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    if (tg.initData) {
        headers['X-Telegram-Init-Data'] = tg.initData;
    }
    return fetch(url, Object.assign({}, options, { headers: headers }));
}

// Initialize app
async function initApp() {
    loadState();

    // Personalize greeting with Telegram user name
    if (tgUser && tgUser.first_name) {
        const greeting = document.getElementById('user-greeting');
        if (greeting) greeting.textContent = 'Hello, ' + tgUser.first_name + '! 👋';
    }

    // Handle deep-link start parameter: ?startapp=level_5 or tg start_param
    const urlParam = new URLSearchParams(window.location.search).get('startapp');
    const startParam = urlParam || (tg.initDataUnsafe && tg.initDataUnsafe.start_param) || '';
    if (startParam && startParam.startsWith('level_')) {
        const levelId = parseInt(startParam.split('_')[1], 10);
        if (levelId >= 1 && levelId <= 20) {
            window._pendingQuestLevel = levelId;
        }
    }

    // Load book content from server
    try {
        const response = await apiCall('/api/book-content');
        const data = await response.json();
        
        if (data.success) {
            appState.bookContent = data.pages || [];
            appState.totalPages = data.pages ? data.pages.length : 1;
            appState.bookTitle = data.title || 'Sample Book';
        }
    } catch (e) {
        console.log('Using sample content:', e);
        // Use sample content if no book is available
        appState.bookContent = [
            'Welcome to Verba-EN!\n\nThis is a Telegram Mini App designed for reading and studying books.\n\nTo get started:\n1. Upload a PDF book to the /books directory\n2. The app will automatically process it\n3. Start reading and learning!\n\nFeatures:\n• Page navigation\n• Progress tracking\n• Bookmarks\n• Vocabulary notes\n\nEnjoy your learning journey!',
            'This is page 2 of the sample content.\n\nOnce you upload a real PDF book, this content will be replaced with the actual book pages.\n\nThe app splits the book into manageable pages for easy reading on mobile devices.'
        ];
        appState.totalPages = appState.bookContent.length;
    }
    
    updateUI();
    attachEventListeners();

    // Init quest module (defined in quest.js, loaded before app.js)
    if (typeof questInit === 'function') {
        questInit(tgUserId);
    }

    // Handle pending deep-link quest level
    if (window._pendingQuestLevel) {
        showScreen('quest');
        if (typeof startQuestLevel === 'function') {
            startQuestLevel(window._pendingQuestLevel);
        }
        window._pendingQuestLevel = null;
    }
}

// Update UI
function updateUI() {
    updateBookInfo();
    updateProgress();
    updateContent();
    updateBookmarks();
    updateVocabulary();
}

// Update book information
function updateBookInfo() {
    const bookDetails = document.getElementById('book-details');
    bookDetails.innerHTML = `
        <p><strong>Title:</strong> ${appState.bookTitle}</p>
        <p><strong>Pages:</strong> ${appState.totalPages}</p>
        <p><strong>Current Page:</strong> ${appState.currentPage}</p>
    `;
}

// Update progress
function updateProgress() {
    appState.progress = Math.round((appState.currentPage / appState.totalPages) * 100);
    document.getElementById('progress-fill').style.width = appState.progress + '%';
    document.getElementById('progress-text').textContent = appState.progress + '% completed';
}

// Update content display
function updateContent() {
    const content = appState.bookContent[appState.currentPage - 1] || 'No content available';
    document.getElementById('book-content').textContent = content;
    document.getElementById('page-info').textContent = `Page ${appState.currentPage} / ${appState.totalPages}`;
    
    // Hide summary when changing pages
    document.getElementById('summary-section').style.display = 'none';
    
    // Update navigation buttons
    const prevButtons = [document.getElementById('prev-page'), document.getElementById('prev-page-bottom')];
    const nextButtons = [document.getElementById('next-page'), document.getElementById('next-page-bottom')];
    
    prevButtons.forEach(btn => {
        btn.disabled = appState.currentPage <= 1;
    });
    
    nextButtons.forEach(btn => {
        btn.disabled = appState.currentPage >= appState.totalPages;
    });
    
    saveState();
}

// Navigate to previous page
function prevPage() {
    if (appState.currentPage > 1) {
        appState.currentPage--;
        updateUI();
        window.scrollTo(0, 0);
    }
}

// Navigate to next page
function nextPage() {
    if (appState.currentPage < appState.totalPages) {
        appState.currentPage++;
        updateUI();
        window.scrollTo(0, 0);
    }
}

// Add bookmark
function addBookmark() {
    tg.showPopup({
        title: 'Add Bookmark',
        message: 'Bookmark page ' + appState.currentPage + '?',
        buttons: [
            { id: 'ok', type: 'default', text: 'Add' },
            { id: 'cancel', type: 'cancel' }
        ]
    }, function (btnId) {
        if (btnId === 'ok') {
            const bookmark = {
                page: appState.currentPage,
                note: 'Page ' + appState.currentPage,
                timestamp: new Date().toISOString()
            };
            appState.bookmarks.push(bookmark);
            updateBookmarks();
            saveState();
            tg.showAlert('Bookmark added!');
        }
    });
}

// Update bookmarks display
function updateBookmarks() {
    const bookmarksList = document.getElementById('bookmarks-list');
    
    if (appState.bookmarks.length === 0) {
        bookmarksList.innerHTML = '<p class="info-text">No bookmarks yet</p>';
        return;
    }
    
    bookmarksList.innerHTML = appState.bookmarks
        .sort((a, b) => b.page - a.page)
        .map((bookmark, index) => `
            <div class="bookmark-item">
                <div class="bookmark-info">
                    <div class="bookmark-page">📖 Page ${bookmark.page}</div>
                    <div class="bookmark-note">${bookmark.note}</div>
                </div>
                <button class="delete-button" onclick="deleteBookmark(${index})">Delete</button>
            </div>
        `).join('');
}

// Delete bookmark
function deleteBookmark(index) {
    tg.showPopup({
        message: 'Delete this bookmark?',
        buttons: [
            { id: 'delete', type: 'destructive', text: 'Delete' },
            { id: 'cancel', type: 'cancel' }
        ]
    }, function (btnId) {
        if (btnId === 'delete') {
            appState.bookmarks.splice(index, 1);
            updateBookmarks();
            saveState();
        }
    });
}

// Add vocabulary
function addVocabulary() {
    const word = document.getElementById('vocab-word').value.trim();
    const definition = document.getElementById('vocab-definition').value.trim();
    
    if (word && definition) {
        const vocab = {
            word: word,
            definition: definition,
            page: appState.currentPage,
            timestamp: new Date().toISOString()
        };
        appState.vocabulary.push(vocab);
        
        // Clear inputs
        document.getElementById('vocab-word').value = '';
        document.getElementById('vocab-definition').value = '';
        
        updateVocabulary();
        saveState();
        
        tg.showAlert('Vocabulary added!');
    } else {
        tg.showAlert('Please fill in both word and definition');
    }
}

// Update vocabulary display
function updateVocabulary() {
    const vocabList = document.getElementById('vocab-list');
    
    if (appState.vocabulary.length === 0) {
        vocabList.innerHTML = '<p class="info-text">No vocabulary notes yet</p>';
        return;
    }
    
    vocabList.innerHTML = appState.vocabulary
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map((vocab, index) => `
            <div class="vocab-item">
                <div class="vocab-word">${vocab.word}</div>
                <div class="vocab-definition">${vocab.definition}</div>
                <div class="bookmark-note">Page ${vocab.page}</div>
            </div>
        `).join('');
}

// Attach event listeners
function attachEventListeners() {
    // Navigation
    document.getElementById('prev-page').addEventListener('click', prevPage);
    document.getElementById('next-page').addEventListener('click', nextPage);
    document.getElementById('prev-page-bottom').addEventListener('click', prevPage);
    document.getElementById('next-page-bottom').addEventListener('click', nextPage);
    
    // Bookmarks
    document.getElementById('add-bookmark').addEventListener('click', addBookmark);
    
    // Vocabulary
    document.getElementById('add-vocab').addEventListener('click', addVocabulary);
    document.getElementById('get-definition').addEventListener('click', getDefinition);
    document.getElementById('check-grammar').addEventListener('click', checkGrammar);
    
    // AI Features
    document.getElementById('summarize-page').addEventListener('click', summarizePage);
    document.getElementById('send-chat').addEventListener('click', sendChatMessage);
    
    // Enter key support for vocabulary input
    document.getElementById('vocab-definition').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addVocabulary();
        }
    });
    
    // Enter key support for chat input
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}

// AI Feature Functions

// Get word definition from AI
async function getDefinition() {
    const word = document.getElementById('vocab-word').value.trim();
    
    if (!word) {
        tg.showAlert('Please enter a word first');
        return;
    }
    
    const button = document.getElementById('get-definition');
    const originalText = button.textContent;
    button.textContent = '⏳ Loading...';
    button.disabled = true;
    
    try {
        const response = await apiCall('/api/ai/define', {
            method: 'POST',
            body: JSON.stringify({ word })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const definition = result.data.definition;
            const examples = result.data.examples || [];
            
            // Pre-fill the definition field
            document.getElementById('vocab-definition').value = definition;
            
            // Show examples in alert
            if (examples.length > 0) {
                const examplesText = examples.join('\n\n');
                tg.showAlert(`Definition loaded!\n\nExamples:\n${examplesText}`);
            } else {
                tg.showAlert('Definition loaded!');
            }
        } else {
            tg.showAlert(result.message || 'Failed to get definition');
        }
    } catch (error) {
        console.error('Definition error:', error);
        tg.showAlert('Failed to connect to AI service');
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Check grammar of vocabulary note
async function checkGrammar() {
    const text = document.getElementById('vocab-definition').value.trim();
    
    if (!text) {
        tg.showAlert('Please enter some text to check');
        return;
    }
    
    const button = document.getElementById('check-grammar');
    const originalText = button.textContent;
    button.textContent = '⏳ Checking...';
    button.disabled = true;
    
    try {
        const response = await apiCall('/api/ai/grammar-check', {
            method: 'POST',
            body: JSON.stringify({ text })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            const feedbackDiv = document.getElementById('grammar-feedback');
            
            let feedbackHTML = `<strong>Grammar Check Results:</strong><br>`;
            feedbackHTML += `Score: ${data.score || 'N/A'}/100<br>`;
            
            if (data.suggestions && data.suggestions.length > 0) {
                feedbackHTML += `<br><strong>Suggestions:</strong><br>`;
                data.suggestions.forEach(suggestion => {
                    feedbackHTML += `• ${suggestion}<br>`;
                });
            } else {
                feedbackHTML += `<br>✅ ${data.message || 'No issues found!'}`;
            }
            
            if (data.corrected && data.corrected !== data.original) {
                feedbackHTML += `<br><br><strong>Suggested correction:</strong><br>${data.corrected}`;
            }
            
            feedbackDiv.innerHTML = feedbackHTML;
            feedbackDiv.style.display = 'block';
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                feedbackDiv.style.display = 'none';
            }, 10000);
        } else {
            tg.showAlert(result.message || 'Failed to check grammar');
        }
    } catch (error) {
        console.error('Grammar check error:', error);
        tg.showAlert('Failed to connect to AI service');
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Summarize current page
async function summarizePage() {
    const content = appState.bookContent[appState.currentPage - 1];
    
    if (!content || content.length < 50) {
        tg.showAlert('Current page content is too short to summarize');
        return;
    }
    
    const button = document.getElementById('summarize-page');
    const originalText = button.textContent;
    button.textContent = '⏳ Summarizing...';
    button.disabled = true;
    
    try {
        const response = await apiCall('/api/ai/summarize', {
            method: 'POST',
            body: JSON.stringify({ text: content })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            const summarySection = document.getElementById('summary-section');
            const summaryContent = document.getElementById('summary-content');
            
            let summaryHTML = `<p>${data.summary}</p>`;
            
            if (data.keyPoints && data.keyPoints.length > 0) {
                summaryHTML += `<br><strong>Key Points:</strong><ul>`;
                data.keyPoints.forEach(point => {
                    summaryHTML += `<li>${point}</li>`;
                });
                summaryHTML += `</ul>`;
            }
            
            summaryContent.innerHTML = summaryHTML;
            summarySection.style.display = 'block';
            
            // Scroll to summary
            summarySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            tg.showAlert(result.message || 'Failed to summarize text');
        }
    } catch (error) {
        console.error('Summarization error:', error);
        tg.showAlert('Failed to connect to AI service');
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Send chat message to AI
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) {
        return;
    }
    
    // Add user message to chat
    addChatMessage(message, 'user');
    input.value = '';
    
    // Show loading indicator
    const chatMessages = document.getElementById('chat-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message bot-message loading-message';
    loadingDiv.innerHTML = '<p>⏳ Thinking...</p>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        const response = await apiCall('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ 
                message,
                history: appState.chatHistory 
            })
        });
        
        const result = await response.json();
        
        // Remove loading indicator
        chatMessages.removeChild(loadingDiv);
        
        if (result.success) {
            const botResponse = result.data.response;
            addChatMessage(botResponse, 'bot');
            
            // Update chat history
            appState.chatHistory.push({ role: 'user', content: message });
            appState.chatHistory.push({ role: 'assistant', content: botResponse });
            
            // Keep only last 10 messages in history
            if (appState.chatHistory.length > 20) {
                appState.chatHistory = appState.chatHistory.slice(-20);
            }
            
            saveState();
        } else {
            addChatMessage(result.message || 'Sorry, I encountered an error. Please try again.', 'bot');
        }
    } catch (error) {
        console.error('Chat error:', error);
        chatMessages.removeChild(loadingDiv);
        addChatMessage('Sorry, I could not connect to the chat service. Please try again.', 'bot');
    }
}

// Add message to chat display
function addChatMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Make functions globally accessible
window.deleteBookmark = deleteBookmark;
window.prevPage = prevPage;
window.nextPage = nextPage;

// Screen navigation — switches between reader / quest / quest-level screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    var screen = document.getElementById('screen-' + screenId);
    if (screen) screen.classList.add('active');

    // Update tab highlighting
    document.querySelectorAll('.mode-tab').forEach(function (t) { t.classList.remove('active'); });
    var tabId = (screenId === 'quest-level') ? 'tab-quest' : ('tab-' + screenId);
    var tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');

    // Hide mode tabs during quiz to keep full screen for questions
    var tabs = document.getElementById('mode-tabs');
    if (tabs) tabs.style.display = screenId === 'quest-level' ? 'none' : 'flex';
}
window.showScreen = showScreen;

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Tell Telegram the app is ready
tg.ready();
