// Main application logic

// Telegram WebApp façade — works whether opened inside Telegram or in a regular browser
var tg = (window.Telegram && window.Telegram.WebApp) || {
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
    BackButton: { show: function () {}, hide: function () {}, onClick: function () {}, offClick: function () {} },
    HapticFeedback: { notificationOccurred: function () {}, impactOccurred: function () {} },
    onEvent: function () {},
    enableClosingConfirmation: function () {}
};

// Apply Telegram theme colors to quest CSS variables
function applyQuestTheme() {
    var p = tg.themeParams || {};
    var root = document.documentElement;
    if (p.bg_color) root.style.setProperty('--background', p.bg_color);
    if (p.secondary_bg_color) root.style.setProperty('--surface', p.secondary_bg_color);
    if (p.text_color) root.style.setProperty('--text-primary', p.text_color);
    if (p.hint_color) {
        root.style.setProperty('--text-muted', p.hint_color);
        root.style.setProperty('--text-secondary', p.hint_color);
    }
    if (p.button_color) root.style.setProperty('--primary-color', p.button_color);
}

tg.expand();
applyQuestTheme();
tg.onEvent('themeChanged', applyQuestTheme);

const storage = new ProgressStorage();

// Level configuration
const levels = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Variant ${i + 1}`,
    description: `Complete variant ${i + 1} of the EGE English exam`,
    maxScore: 100
}));

// Initialize the page
function init() {
    updateHeader();
    renderLevels();
    updateBadges();
    setupEventListeners();
    tg.ready();
}

// Update header statistics
function updateHeader() {
    const progress = storage.getProgress();
    if (!progress) return;

    document.getElementById('totalScore').textContent = progress.totalScore;
    document.getElementById('currentLevel').textContent = progress.currentLevel;
    
    const progressPercent = Math.round((progress.completedLevels.length / 20) * 100);
    document.getElementById('progressPercent').textContent = `${progressPercent}%`;
    document.getElementById('progressBar').style.width = `${progressPercent}%`;
    document.getElementById('completedLevels').textContent = progress.completedLevels.length;
}

// Render level cards
function renderLevels() {
    const grid = document.getElementById('levelsGrid');
    grid.innerHTML = '';

    levels.forEach(level => {
        const card = createLevelCard(level);
        grid.appendChild(card);
    });
}

// Create a level card element
function createLevelCard(level) {
    const card = document.createElement('div');
    const isCompleted = storage.isLevelCompleted(level.id);
    const isUnlocked = storage.isLevelUnlocked(level.id);
    const score = storage.getLevelScore(level.id);

    card.className = 'level-card';
    
    if (isCompleted) {
        card.classList.add('completed');
    } else if (!isUnlocked) {
        card.classList.add('locked');
    }

    let statusClass = 'available';
    let statusText = 'Available';
    
    if (isCompleted) {
        statusClass = 'completed';
        statusText = '✓ Completed';
    } else if (!isUnlocked) {
        statusClass = 'locked';
        statusText = '🔒 Locked';
    }

    card.innerHTML = `
        <div class="level-number">${level.id}</div>
        <div class="level-title">${level.title}</div>
        <div class="level-score">${score > 0 ? `Best: ${score}/${level.maxScore}` : `Max: ${level.maxScore} points`}</div>
        <div class="level-status ${statusClass}">${statusText}</div>
    `;

    if (isUnlocked && !card.classList.contains('locked')) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => startLevel(level.id));
    }

    return card;
}

// Start a level
function startLevel(levelId) {
    if (!storage.isLevelUnlocked(levelId)) {
        tg.showAlert('This level is locked! Complete previous levels first.');
        return;
    }

    // Navigate to the level page
    window.location.href = `levels/level-${levelId}.html`;
}

// Update badges display
function updateBadges() {
    const progress = storage.getProgress();
    if (!progress) return;

    const badges = ['beginner', 'intermediate', 'advanced', 'expert'];
    
    badges.forEach(badge => {
        const element = document.getElementById(`badge-${badge}`);
        if (element) {
            if (progress.badges.includes(badge)) {
                element.classList.remove('locked');
                element.classList.add('unlocked');
            } else {
                element.classList.add('locked');
                element.classList.remove('unlocked');
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Reset progress button
    document.getElementById('resetProgress').addEventListener('click', (e) => {
        e.preventDefault();
        tg.showPopup({
            message: 'Reset all progress? This action cannot be undone.',
            buttons: [
                { id: 'confirm', type: 'destructive', text: 'Reset' },
                { id: 'cancel', type: 'cancel' }
            ]
        }, (btnId) => {
            if (btnId === 'confirm') {
                storage.reset();
                location.reload();
            }
        });
    });

    // View stats button
    document.getElementById('viewStats').addEventListener('click', (e) => {
        e.preventDefault();
        showStatistics();
    });
}

// Show statistics via Telegram popup
function showStatistics() {
    const progress = storage.getProgress();
    if (!progress) return;

    const avg = progress.completedLevels.length > 0
        ? Math.round(progress.totalScore / progress.completedLevels.length)
        : 0;

    const stats =
        `📊 Your Statistics\n\n` +
        `Total Score: ${progress.totalScore} pts\n` +
        `Completed: ${progress.completedLevels.length}/20 levels\n` +
        `Current Level: ${progress.currentLevel}\n` +
        `Badges: ${progress.badges.length}/4\n` +
        `Average Score: ${avg} pts/level\n\n` +
        `${20 - progress.completedLevels.length} levels remaining!`;

    tg.showPopup({
        title: 'Statistics',
        message: stats,
        buttons: [{ id: 'ok', type: 'close' }]
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
