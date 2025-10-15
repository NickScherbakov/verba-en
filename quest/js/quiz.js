// Quiz logic for level pages
const storage = new ProgressStorage();
let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];
let score = 0;

// Get level ID from URL
function getLevelId() {
    const path = window.location.pathname;
    const match = path.match(/level-(\d+)/);
    return match ? parseInt(match[1]) : 1;
}

// Sample questions for demonstration
// In a real implementation, these would be loaded from JSON files
function loadQuestions(levelId) {
    // Example questions structure for Level 1
    questions = [
        {
            type: 'multiple-choice',
            text: 'Choose the correct form of the verb:',
            instruction: 'Read the sentence carefully and select the appropriate form.',
            sentence: 'She _____ to the library every weekend.',
            options: ['go', 'goes', 'going', 'gone'],
            correct: 1,
            explanation: 'For third person singular (she/he/it) in present simple, we add -s or -es to the verb.',
            points: 10
        },
        {
            type: 'multiple-choice',
            text: 'What is the meaning of "breakthrough"?',
            instruction: 'Choose the best definition.',
            options: [
                'A serious problem or difficulty',
                'An important discovery or development',
                'A type of building structure',
                'A way to enter a place'
            ],
            correct: 1,
            explanation: '"Breakthrough" means a sudden, dramatic, and important discovery or development.',
            points: 10
        },
        {
            type: 'reading',
            passage: {
                title: 'Modern Technology',
                text: 'Modern technology has transformed the way we communicate. Social media platforms connect billions of people worldwide, enabling instant sharing of information and ideas. However, this connectivity also raises concerns about privacy and the spread of misinformation.'
            },
            text: 'According to the passage, what is ONE concern about modern technology?',
            options: [
                'It is too expensive',
                'It raises privacy concerns',
                'It is difficult to learn',
                'It is not widely available'
            ],
            correct: 1,
            explanation: 'The passage mentions that connectivity "raises concerns about privacy and the spread of misinformation."',
            points: 15
        },
        {
            type: 'fill-blank',
            text: 'Complete the sentence with the correct word:',
            instruction: 'Type your answer in the blank space.',
            sentence: 'Despite the rain, they decided to _____ with their picnic plans.',
            options: ['proceed', 'continue', 'go ahead'],
            correct: ['proceed', 'continue', 'go ahead'],
            explanation: 'The correct phrases are "proceed with," "continue with," or "go ahead with."',
            points: 10
        },
        {
            type: 'multiple-choice',
            text: 'Choose the sentence with correct punctuation:',
            instruction: 'Select the properly punctuated sentence.',
            options: [
                'Its a beautiful day outside.',
                'It\'s a beautiful day outside.',
                'Its\' a beautiful day outside.',
                'Its a beautiful day, outside.'
            ],
            correct: 1,
            explanation: '"It\'s" is the contraction of "it is." The apostrophe replaces the missing letter "i."',
            points: 10
        },
        {
            type: 'reading',
            passage: {
                title: 'Climate Change',
                text: 'Scientists worldwide agree that climate change poses significant threats to our planet. Rising temperatures lead to melting ice caps, rising sea levels, and more frequent extreme weather events. Immediate action is necessary to reduce greenhouse gas emissions.'
            },
            text: 'What do scientists agree about?',
            options: [
                'Climate change is not a serious issue',
                'Climate change poses significant threats',
                'Ice caps are growing larger',
                'Weather patterns are becoming more predictable'
            ],
            correct: 1,
            explanation: 'The passage states that "Scientists worldwide agree that climate change poses significant threats to our planet."',
            points: 15
        },
        {
            type: 'multiple-choice',
            text: 'Choose the correct preposition:',
            instruction: 'Complete the sentence with the appropriate preposition.',
            sentence: 'She is interested _____ learning new languages.',
            options: ['in', 'on', 'at', 'for'],
            correct: 0,
            explanation: 'We use "interested in" when talking about having interest in something.',
            points: 10
        },
        {
            type: 'multiple-choice',
            text: 'Identify the synonym of "difficult":',
            options: ['easy', 'challenging', 'simple', 'pleasant'],
            correct: 1,
            explanation: '"Challenging" is a synonym of "difficult," both meaning requiring effort or skill.',
            points: 10
        },
        {
            type: 'fill-blank',
            text: 'Complete with the correct form:',
            instruction: 'Use the present perfect tense.',
            sentence: 'I _____ (finish) my homework already.',
            options: ['have finished', 'finished'],
            correct: ['have finished'],
            explanation: 'Present perfect (have/has + past participle) is used for actions completed at an unspecified time before now.',
            points: 10
        },
        {
            type: 'multiple-choice',
            text: 'Choose the correct sentence structure:',
            options: [
                'If I would have time, I will help you.',
                'If I have time, I will help you.',
                'If I will have time, I help you.',
                'If I had time, I will help you.'
            ],
            correct: 1,
            explanation: 'First conditional uses: if + present simple, will + infinitive.',
            points: 10
        }
    ];
}

// Initialize quiz
function initQuiz() {
    const levelId = getLevelId();
    loadQuestions(levelId);
    userAnswers = new Array(questions.length).fill(null);
    renderQuestion(0);
    updateProgress();
}

// Render a question
function renderQuestion(index) {
    const container = document.getElementById('quizContainer');
    const question = questions[index];
    
    let html = `
        <div class="question active">
            <div class="question-header">
                <span class="question-type">${question.type.replace('-', ' ')}</span>
                <h3 class="question-text">${question.text}</h3>
                ${question.instruction ? `<p class="question-instruction">${question.instruction}</p>` : ''}
            </div>
    `;

    // Add passage for reading questions
    if (question.passage) {
        html += `
            <div class="reading-passage">
                <h4 class="passage-title">${question.passage.title}</h4>
                <p class="passage-text">${question.passage.text}</p>
            </div>
        `;
    }

    // Add sentence context if exists
    if (question.sentence && question.type !== 'fill-blank') {
        html += `<p class="sentence-with-blank">${question.sentence}</p>`;
    }

    // Render based on question type
    if (question.type === 'multiple-choice' || question.type === 'reading') {
        html += '<div class="answer-options">';
        question.options.forEach((option, i) => {
            const selected = userAnswers[index] === i ? 'selected' : '';
            html += `
                <div class="answer-option ${selected}" data-index="${i}">
                    <div class="option-marker">${String.fromCharCode(65 + i)}</div>
                    <div class="option-text">${option}</div>
                </div>
            `;
        });
        html += '</div>';
    } else if (question.type === 'fill-blank') {
        html += `
            <p class="sentence-with-blank">${question.sentence.replace('_____', '<input type="text" class="blank-input" id="blankInput" />')}</p>
        `;
    }

    html += '<div class="feedback" id="feedback"></div>';
    html += '</div>';

    container.innerHTML = html;

    // Add event listeners
    if (question.type === 'multiple-choice' || question.type === 'reading') {
        document.querySelectorAll('.answer-option').forEach(option => {
            option.addEventListener('click', () => selectAnswer(parseInt(option.dataset.index)));
        });
    } else if (question.type === 'fill-blank') {
        const input = document.getElementById('blankInput');
        if (userAnswers[index]) {
            input.value = userAnswers[index];
        }
        input.addEventListener('input', (e) => {
            userAnswers[index] = e.target.value.trim();
        });
    }

    updateNavigationButtons();
}

// Select an answer
function selectAnswer(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    // Update visual selection
    document.querySelectorAll('.answer-option').forEach((option, i) => {
        if (i === optionIndex) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });

    updateNavigationButtons();
}

// Update progress display
function updateProgress() {
    document.getElementById('questionProgress').textContent = 
        `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    document.getElementById('maxScore').textContent = maxScore;
    document.getElementById('currentScore').textContent = score;
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    // Previous button visibility
    prevBtn.style.visibility = currentQuestionIndex > 0 ? 'visible' : 'hidden';

    // Next/Submit button logic
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const hasAnswer = userAnswers[currentQuestionIndex] !== null;

    if (isLastQuestion) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
        submitBtn.disabled = !hasAnswer;
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
        nextBtn.disabled = !hasAnswer;
    }
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion(currentQuestionIndex);
        updateProgress();
    }
}

// Navigate to next question
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1 && userAnswers[currentQuestionIndex] !== null) {
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
        updateProgress();
    }
}

// Calculate score and submit
function submitQuiz() {
    score = 0;
    
    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        
        if (question.type === 'fill-blank') {
            // Check if answer matches any correct option (case-insensitive)
            const isCorrect = question.correct.some(correct => 
                userAnswer && userAnswer.toLowerCase() === correct.toLowerCase()
            );
            if (isCorrect) score += question.points;
        } else {
            // Multiple choice
            if (userAnswer === question.correct) {
                score += question.points;
            }
        }
    });

    // Save progress
    const levelId = getLevelId();
    storage.updateProgress(levelId, score);

    // Show results
    showResults();
}

// Show results screen
function showResults() {
    const container = document.getElementById('quizContainer');
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / maxScore) * 100);
    const correctCount = questions.filter((q, i) => {
        if (q.type === 'fill-blank') {
            return q.correct.some(correct => 
                userAnswers[i] && userAnswers[i].toLowerCase() === correct.toLowerCase()
            );
        }
        return userAnswers[i] === q.correct;
    }).length;

    let message = '';
    if (percentage >= 90) message = '🎉 Outstanding! Excellent work!';
    else if (percentage >= 75) message = '👏 Great job! Keep it up!';
    else if (percentage >= 60) message = '👍 Good effort! Practice more!';
    else message = '💪 Keep practicing! You\'ll improve!';

    container.innerHTML = `
        <div class="results-screen">
            <div class="results-score">${score}/${maxScore}</div>
            <div class="results-message">${message}</div>
            <div class="results-stats">
                <div class="stat-box">
                    <div class="stat-label">Percentage</div>
                    <div class="stat-value">${percentage}%</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Correct</div>
                    <div class="stat-value">${correctCount}/${questions.length}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Points</div>
                    <div class="stat-value">${score}</div>
                </div>
            </div>
            <div class="results-actions">
                <button class="nav-btn primary" onclick="window.location.href='../index.html'">Return to Levels</button>
                <button class="nav-btn" onclick="location.reload()">Retry This Level</button>
            </div>
        </div>
    `;

    // Hide navigation buttons
    document.getElementById('prevBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'none';
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    initQuiz();

    document.getElementById('prevBtn').addEventListener('click', previousQuestion);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('submitBtn').addEventListener('click', submitQuiz);
});
