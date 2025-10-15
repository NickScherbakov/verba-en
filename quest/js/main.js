// Main application logic
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
        alert('This level is locked! Complete previous levels first.');
        return;
    }

    // Redirect to level page
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
        if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
            storage.reset();
            location.reload();
        }
    });

    // View stats button
    document.getElementById('viewStats').addEventListener('click', (e) => {
        e.preventDefault();
        showStatistics();
    });
}

// Show statistics modal
function showStatistics() {
    const progress = storage.getProgress();
    if (!progress) return;

    const stats = `
📊 Your Statistics:

Total Score: ${progress.totalScore} points
Completed Levels: ${progress.completedLevels.length}/20
Current Level: ${progress.currentLevel}
Badges Earned: ${progress.badges.length}/4

Average Score: ${progress.completedLevels.length > 0 ? Math.round(progress.totalScore / progress.completedLevels.length) : 0} points per level

Keep going! ${20 - progress.completedLevels.length} levels remaining!
    `;

    alert(stats);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
