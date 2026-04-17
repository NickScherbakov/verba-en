// Quest module — EGE English Quest integrated into the Telegram Mini App SPA.
// Depends on: levels-data.js (LEVELS_DATA), global `tg` from app.js.

// ─── Tiny TG façade (used before app.js defines the real `tg`) ───────────────
function _tg() {
    return window.Telegram && window.Telegram.WebApp
        ? window.Telegram.WebApp
        : {
            showAlert: function (msg, cb) { alert(msg); if (cb) cb(); },
            showPopup: function (opts, cb) {
                var ok = opts.buttons && opts.buttons.some(function (b) { return b.type === 'destructive'; })
                    ? confirm(opts.message)
                    : (alert(opts.message), true);
                if (cb) cb(ok ? (opts.buttons && opts.buttons.find(function (b) { return b.type !== 'cancel'; }) || {id: ''}).id : '');
            },
            HapticFeedback: { notificationOccurred: function () {}, impactOccurred: function () {} },
            BackButton: { show: function () {}, hide: function () {}, onClick: function () {}, offClick: function () {} },
            MainButton: {
                setText: function () { return this; },
                show: function () {}, hide: function () {},
                onClick: function () {}, offClick: function () {},
                showProgress: function () {}, hideProgress: function () {},
                isVisible: false
            }
        };
}

// ─── Storage ─────────────────────────────────────────────────────────────────
function QuestStorage(userId) {
    this._key = 'questProgress_' + (userId || 'guest');
    this._init();
}

QuestStorage.prototype._get = function () {
    try { var r = localStorage.getItem(this._key); return r ? JSON.parse(r) : null; }
    catch (e) { return null; }
};

QuestStorage.prototype._set = function (data) {
    try { localStorage.setItem(this._key, JSON.stringify(data)); } catch (e) { /* ignore */ }
};

QuestStorage.prototype._init = function () {
    if (!this._get()) {
        this._set({
            totalScore: 0, currentLevel: 1,
            completedLevels: [], levelScores: {},
            badges: ['beginner'], lastUpdated: new Date().toISOString()
        });
    }
};

QuestStorage.prototype.getProgress = function () { return this._get(); };

QuestStorage.prototype.updateProgress = function (levelId, score) {
    var d = this._get(); if (!d) return;
    if (d.completedLevels.indexOf(levelId) === -1) d.completedLevels.push(levelId);
    if (!d.levelScores[levelId] || score > d.levelScores[levelId]) d.levelScores[levelId] = score;
    d.totalScore = Object.values(d.levelScores).reduce(function (s, v) { return s + v; }, 0);
    d.currentLevel = Math.min(d.completedLevels.length + 1, 20);
    this._updateBadges(d);
    d.lastUpdated = new Date().toISOString();
    this._set(d);
};

QuestStorage.prototype._updateBadges = function (d) {
    var n = d.completedLevels.length;
    if (n >= 1 && d.badges.indexOf('beginner') === -1) d.badges.push('beginner');
    if (n >= 5 && d.badges.indexOf('intermediate') === -1) d.badges.push('intermediate');
    if (n >= 12 && d.badges.indexOf('advanced') === -1) d.badges.push('advanced');
    if (n >= 20 && d.badges.indexOf('expert') === -1) d.badges.push('expert');
};

QuestStorage.prototype.isCompleted = function (id) {
    var d = this._get(); return !!(d && d.completedLevels.indexOf(id) !== -1);
};

QuestStorage.prototype.isUnlocked = function (id) {
    if (id === 1) return true;
    var d = this._get(); return !!(d && d.completedLevels.indexOf(id - 1) !== -1);
};

QuestStorage.prototype.getLevelScore = function (id) {
    var d = this._get(); return (d && d.levelScores[id]) || 0;
};

QuestStorage.prototype.reset = function () {
    localStorage.removeItem(this._key); this._init();
};

// ─── Module state ─────────────────────────────────────────────────────────────
var questStorage = null;
var questCurrentLevelId = null;
var questQuestions = [];
var questUserAnswers = [];
var questCurrentQuestion = 0;
var questScore = 0;

// ─── Init ─────────────────────────────────────────────────────────────────────
function questInit(userId) {
    questStorage = new QuestStorage(userId);
    renderQuestHome();

    var resetBtn = document.getElementById('q-resetProgress');
    if (resetBtn) resetBtn.addEventListener('click', onQuestResetProgress);

    // Wire quest tab buttons
    var tabQuest = document.getElementById('tab-quest');
    var tabReader = document.getElementById('tab-reader');
    if (tabQuest) tabQuest.addEventListener('click', function () {
        renderQuestHome();
        if (typeof showScreen === 'function') showScreen('quest');
    });
    if (tabReader) tabReader.addEventListener('click', function () {
        if (typeof showScreen === 'function') showScreen('reader');
    });
}

// ─── Quest Home ───────────────────────────────────────────────────────────────
function renderQuestHome() {
    if (!questStorage) return;
    var progress = questStorage.getProgress();
    if (!progress) return;

    var totalScoreEl = document.getElementById('q-totalScore');
    var currentLevelEl = document.getElementById('q-currentLevel');
    var completedEl = document.getElementById('q-completedLevels');
    var progressBar = document.getElementById('q-progressBar');

    if (totalScoreEl) totalScoreEl.textContent = progress.totalScore;
    if (currentLevelEl) currentLevelEl.textContent = progress.currentLevel;
    if (completedEl) completedEl.textContent = progress.completedLevels.length;
    var pct = Math.round((progress.completedLevels.length / 20) * 100);
    if (progressBar) progressBar.style.width = pct + '%';

    var grid = document.getElementById('q-levelsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    LEVELS_DATA.forEach(function (level) {
        var card = document.createElement('div');
        var completed = questStorage.isCompleted(level.id);
        var unlocked = questStorage.isUnlocked(level.id);
        var score = questStorage.getLevelScore(level.id);

        card.className = 'level-card' +
            (completed ? ' completed' : '') +
            (!unlocked ? ' locked' : '');

        var statusIcon = completed ? '✓' : (!unlocked ? '🔒' : '▷');
        card.innerHTML =
            '<div class="level-number">' + level.id + '</div>' +
            '<div class="level-status">' + statusIcon + '</div>' +
            (score > 0 ? '<div class="level-score">' + score + 'pt</div>' : '');

        if (unlocked) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (function (id) {
                return function () { startQuestLevel(id); };
            })(level.id));
        } else {
            card.addEventListener('click', function () {
                _tg().showAlert('Complete previous levels to unlock this variant!');
            });
        }
        grid.appendChild(card);
    });
}

function onQuestResetProgress() {
    _tg().showPopup({
        message: 'Reset all quest progress? This cannot be undone.',
        buttons: [
            { id: 'confirm', type: 'destructive', text: 'Reset' },
            { id: 'cancel', type: 'cancel' }
        ]
    }, function (btnId) {
        if (btnId === 'confirm') {
            questStorage.reset();
            renderQuestHome();
        }
    });
}

// ─── Quest Level ──────────────────────────────────────────────────────────────
function startQuestLevel(levelId) {
    var level = null;
    for (var i = 0; i < LEVELS_DATA.length; i++) {
        if (LEVELS_DATA[i].id === levelId) { level = LEVELS_DATA[i]; break; }
    }
    if (!level) return;

    questCurrentLevelId = levelId;
    questQuestions = level.questions;
    questUserAnswers = new Array(questQuestions.length).fill(null);
    questCurrentQuestion = 0;
    questScore = 0;

    var titleEl = document.getElementById('q-levelTitle');
    var maxEl = document.getElementById('q-maxScore');
    var scoreEl = document.getElementById('q-currentScore');
    var navEl = document.getElementById('q-navigation');
    if (titleEl) titleEl.textContent = level.title;
    if (maxEl) maxEl.textContent = level.maxScore;
    if (scoreEl) scoreEl.textContent = '0';
    if (navEl) navEl.style.display = '';

    // Navigate to level screen
    if (typeof showScreen === 'function') showScreen('quest-level');

    // BackButton
    var tg = _tg();
    tg.BackButton.offClick(backFromQuestLevel);
    tg.BackButton.onClick(backFromQuestLevel);
    tg.BackButton.show();

    questRenderQuestion(0);
    questUpdateProgress();
    questUpdateNav();
}

function backFromQuestLevel() {
    var tg = _tg();
    tg.BackButton.offClick(backFromQuestLevel);
    tg.BackButton.hide();
    tg.MainButton.offClick(questSubmit);
    tg.MainButton.hide();
    if (typeof showScreen === 'function') showScreen('quest');
    renderQuestHome();
}

// ─── Question rendering ───────────────────────────────────────────────────────
function questRenderQuestion(index) {
    var container = document.getElementById('q-quizContainer');
    if (!container) return;
    var question = questQuestions[index];

    var html = '<div class="question">' +
        '<div class="question-header">' +
        '<span class="question-type">' + question.type.replace('-', ' ') + '</span>' +
        '<h3 class="question-text">' + question.text + '</h3>' +
        (question.instruction ? '<p class="question-instruction">' + question.instruction + '</p>' : '') +
        '</div>';

    if (question.passage) {
        html += '<div class="reading-passage">' +
            '<h4 class="passage-title">' + question.passage.title + '</h4>' +
            '<p class="passage-text">' + question.passage.text + '</p>' +
            '</div>';
    }

    if (question.sentence && question.type !== 'fill-blank') {
        html += '<p class="sentence-with-blank">' + question.sentence + '</p>';
    }

    if (question.type === 'multiple-choice' || question.type === 'reading') {
        html += '<div class="answer-options">';
        question.options.forEach(function (opt, i) {
            var sel = questUserAnswers[index] === i ? ' selected' : '';
            html += '<div class="answer-option' + sel + '" data-index="' + i + '">' +
                '<div class="option-marker">' + String.fromCharCode(65 + i) + '</div>' +
                '<div class="option-text">' + opt + '</div>' +
                '</div>';
        });
        html += '</div>';
    } else if (question.type === 'fill-blank') {
        var val = questUserAnswers[index] || '';
        var safeVal = val.replace(/"/g, '&quot;');
        html += '<p class="sentence-with-blank">' +
            question.sentence.replace('_____',
                '<input type="text" class="blank-input" id="q-blankInput" value="' + safeVal + '" />') +
            '</p>';
    }

    html += '<div class="feedback" id="q-feedback"></div></div>';
    container.innerHTML = html;

    // Attach answer handlers
    if (question.type === 'multiple-choice' || question.type === 'reading') {
        container.querySelectorAll('.answer-option').forEach(function (opt) {
            opt.addEventListener('click', function () {
                questSelectAnswer(parseInt(opt.dataset.index, 10));
            });
        });
    } else if (question.type === 'fill-blank') {
        var input = document.getElementById('q-blankInput');
        if (input) {
            input.addEventListener('input', function (e) {
                questUserAnswers[questCurrentQuestion] = e.target.value.trim();
                questUpdateNav();
            });
        }
    }
}

function questSelectAnswer(optionIndex) {
    questUserAnswers[questCurrentQuestion] = optionIndex;
    document.querySelectorAll('#q-quizContainer .answer-option').forEach(function (opt, i) {
        opt.classList.toggle('selected', i === optionIndex);
    });
    _tg().HapticFeedback.impactOccurred('light');
    questUpdateNav();
}

function questUpdateProgress() {
    var el = document.getElementById('q-questionProgress');
    if (el) el.textContent = 'Question ' + (questCurrentQuestion + 1) + ' of ' + questQuestions.length;
}

function questUpdateNav() {
    var prevBtn = document.getElementById('q-prevBtn');
    var nextBtn = document.getElementById('q-nextBtn');
    var submitBtn = document.getElementById('q-submitBtn');
    if (!prevBtn || !nextBtn || !submitBtn) return;

    var isLast = questCurrentQuestion === questQuestions.length - 1;
    var hasAnswer = questUserAnswers[questCurrentQuestion] !== null;

    prevBtn.style.visibility = questCurrentQuestion > 0 ? 'visible' : 'hidden';
    nextBtn.style.display = isLast ? 'none' : 'inline-block';
    submitBtn.style.display = isLast ? 'inline-block' : 'none';
    if (nextBtn) nextBtn.disabled = !hasAnswer;
    if (submitBtn) submitBtn.disabled = !hasAnswer;

    // Telegram MainButton mirrors the HTML Submit button
    var tg = _tg();
    if (isLast && hasAnswer) {
        tg.MainButton.setText('Submit & Finish');
        tg.MainButton.offClick(questSubmit);
        tg.MainButton.onClick(questSubmit);
        tg.MainButton.show();
    } else {
        tg.MainButton.offClick(questSubmit);
        tg.MainButton.hide();
    }
}

function questPrevQuestion() {
    if (questCurrentQuestion > 0) {
        questCurrentQuestion--;
        questRenderQuestion(questCurrentQuestion);
        questUpdateProgress();
        questUpdateNav();
    }
}

function questNextQuestion() {
    if (questCurrentQuestion < questQuestions.length - 1 &&
            questUserAnswers[questCurrentQuestion] !== null) {
        questCurrentQuestion++;
        questRenderQuestion(questCurrentQuestion);
        questUpdateProgress();
        questUpdateNav();
    }
}

function questSubmit() {
    questScore = 0;
    questQuestions.forEach(function (q, i) {
        var ans = questUserAnswers[i];
        if (q.type === 'fill-blank') {
            if (q.correct.some(function (c) {
                return ans && ans.toLowerCase() === c.toLowerCase();
            })) questScore += q.points;
        } else {
            if (ans === q.correct) questScore += q.points;
        }
    });

    if (questStorage) questStorage.updateProgress(questCurrentLevelId, questScore);

    var scoreEl = document.getElementById('q-currentScore');
    if (scoreEl) scoreEl.textContent = questScore;

    var tg = _tg();
    tg.MainButton.offClick(questSubmit);
    tg.MainButton.hide();
    tg.BackButton.offClick(backFromQuestLevel);
    tg.BackButton.hide();

    // Haptic feedback based on percentage
    var maxScore = questQuestions.reduce(function (s, q) { return s + q.points; }, 0);
    var pct = maxScore > 0 ? (questScore / maxScore) * 100 : 0;
    if (pct >= 75) tg.HapticFeedback.notificationOccurred('success');
    else if (pct >= 50) tg.HapticFeedback.notificationOccurred('warning');
    else tg.HapticFeedback.notificationOccurred('error');

    questShowResults(questScore, maxScore);
}

function questShowResults(score, maxScore) {
    var container = document.getElementById('q-quizContainer');
    var nav = document.getElementById('q-navigation');
    if (!container) return;

    var percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    var correctCount = questQuestions.filter(function (q, i) {
        if (q.type === 'fill-blank') {
            return q.correct.some(function (c) {
                return questUserAnswers[i] && questUserAnswers[i].toLowerCase() === c.toLowerCase();
            });
        }
        return questUserAnswers[i] === q.correct;
    }).length;

    var emoji = percentage >= 90 ? '🎉' : percentage >= 75 ? '👏' : percentage >= 60 ? '👍' : '💪';
    var message = percentage >= 90 ? 'Outstanding! Excellent work!' :
        percentage >= 75 ? 'Great job! Keep it up!' :
        percentage >= 60 ? 'Good effort! Practice more!' :
        "Keep practicing! You'll improve!";

    container.innerHTML =
        '<div class="results-screen">' +
        '<div class="results-score">' + score + '/' + maxScore + '</div>' +
        '<div class="results-message">' + emoji + ' ' + message + '</div>' +
        '<div class="results-stats">' +
        '<div class="stat-box"><span class="stat-label">Percentage</span><span class="stat-value">' + percentage + '%</span></div>' +
        '<div class="stat-box"><span class="stat-label">Correct</span><span class="stat-value">' + correctCount + '/' + questQuestions.length + '</span></div>' +
        '<div class="stat-box"><span class="stat-label">Points</span><span class="stat-value">' + score + '</span></div>' +
        '</div>' +
        '<div class="results-actions">' +
        '<button class="nav-btn primary" onclick="backFromQuestLevel()">Return to Levels</button>' +
        '<button class="nav-btn" onclick="startQuestLevel(' + questCurrentLevelId + ')">Retry</button>' +
        '</div></div>';

    if (nav) nav.style.display = 'none';
}

// ─── DOMContentLoaded: wire navigation buttons ────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    var prevBtn = document.getElementById('q-prevBtn');
    var nextBtn = document.getElementById('q-nextBtn');
    var submitBtn = document.getElementById('q-submitBtn');
    if (prevBtn) prevBtn.addEventListener('click', questPrevQuestion);
    if (nextBtn) nextBtn.addEventListener('click', questNextQuestion);
    if (submitBtn) submitBtn.addEventListener('click', questSubmit);
});

// ─── Exports to global scope ──────────────────────────────────────────────────
window.questInit = questInit;
window.startQuestLevel = startQuestLevel;
window.backFromQuestLevel = backFromQuestLevel;
window.renderQuestHome = renderQuestHome;
