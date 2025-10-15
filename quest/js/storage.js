// Storage management for user progress
class ProgressStorage {
    constructor() {
        this.storageKey = 'egeQuestProgress';
        this.init();
    }

    init() {
        if (!this.getData()) {
            this.setData({
                totalScore: 0,
                currentLevel: 1,
                completedLevels: [],
                levelScores: {},
                badges: ['beginner'],
                lastUpdated: new Date().toISOString()
            });
        }
    }

    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    setData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    }

    updateProgress(levelId, score) {
        const data = this.getData();
        if (!data) return false;

        // Update completed levels
        if (!data.completedLevels.includes(levelId)) {
            data.completedLevels.push(levelId);
        }

        // Update score for this level (keep best score)
        if (!data.levelScores[levelId] || score > data.levelScores[levelId]) {
            data.levelScores[levelId] = score;
        }

        // Calculate total score
        data.totalScore = Object.values(data.levelScores).reduce((sum, s) => sum + s, 0);

        // Update current level (next uncompleted level)
        data.currentLevel = Math.min(data.completedLevels.length + 1, 20);

        // Update badges based on progress
        this.updateBadges(data);

        data.lastUpdated = new Date().toISOString();
        return this.setData(data);
    }

    updateBadges(data) {
        const completed = data.completedLevels.length;
        
        if (completed >= 1 && !data.badges.includes('beginner')) {
            data.badges.push('beginner');
        }
        if (completed >= 5 && !data.badges.includes('intermediate')) {
            data.badges.push('intermediate');
        }
        if (completed >= 12 && !data.badges.includes('advanced')) {
            data.badges.push('advanced');
        }
        if (completed >= 20 && !data.badges.includes('expert')) {
            data.badges.push('expert');
        }
    }

    reset() {
        localStorage.removeItem(this.storageKey);
        this.init();
        return true;
    }

    getProgress() {
        return this.getData();
    }

    isLevelCompleted(levelId) {
        const data = this.getData();
        return data && data.completedLevels.includes(levelId);
    }

    isLevelUnlocked(levelId) {
        const data = this.getData();
        if (!data) return levelId === 1;
        
        // Level 1 is always unlocked
        if (levelId === 1) return true;
        
        // Other levels unlock after completing the previous one
        return data.completedLevels.includes(levelId - 1);
    }

    getLevelScore(levelId) {
        const data = this.getData();
        return data && data.levelScores[levelId] ? data.levelScores[levelId] : 0;
    }
}

// Export for use in other files
window.ProgressStorage = ProgressStorage;
