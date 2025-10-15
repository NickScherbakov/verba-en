// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Apply Telegram theme colors
if (tg.themeParams) {
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#707579');
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#3390ec');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#3390ec');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f4f4f5');
}

// App State
let appState = {
    currentPage: 1,
    totalPages: 1,
    bookContent: [],
    bookmarks: [],
    vocabulary: [],
    bookTitle: 'Sample Book',
    progress: 0
};

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('verba-en-state');
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
        localStorage.setItem('verba-en-state', JSON.stringify(appState));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

// Initialize app
async function initApp() {
    loadState();
    
    // Load book content from server
    try {
        const response = await fetch('/api/book-content');
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
    const note = prompt('Add a note for this bookmark (optional):');
    if (note !== null) { // User didn't cancel
        const bookmark = {
            page: appState.currentPage,
            note: note || 'No note',
            timestamp: new Date().toISOString()
        };
        appState.bookmarks.push(bookmark);
        updateBookmarks();
        saveState();
        
        // Show feedback
        tg.showAlert('Bookmark added!');
    }
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
    if (confirm('Delete this bookmark?')) {
        appState.bookmarks.splice(index, 1);
        updateBookmarks();
        saveState();
    }
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
    
    // Enter key support for vocabulary input
    document.getElementById('vocab-definition').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addVocabulary();
        }
    });
}

// Make functions globally accessible
window.deleteBookmark = deleteBookmark;
window.prevPage = prevPage;
window.nextPage = nextPage;

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Tell Telegram the app is ready
tg.ready();
