// EGE English Quest — Level Questions Data
// Each level has an array of questions for that variant.
// Replace SAMPLE_QUESTIONS per level with real EGE 2026 content.

var SAMPLE_QUESTIONS = [
    {
        type: 'multiple-choice',
        text: 'Choose the correct form of the verb:',
        instruction: 'Read the sentence carefully and select the appropriate form.',
        sentence: 'She _____ to the library every weekend.',
        options: ['go', 'goes', 'going', 'gone'],
        correct: 1,
        explanation: 'For third-person singular (she/he/it) in present simple, add -s/-es to the verb.',
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
        explanation: 'The passage mentions "raises concerns about privacy and the spread of misinformation."',
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
            "It's a beautiful day outside.",
            "Its' a beautiful day outside.",
            'Its a beautiful day, outside.'
        ],
        correct: 1,
        explanation: '"It\'s" is the contraction of "it is." The apostrophe replaces the missing "i."',
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
        explanation: '"Scientists worldwide agree that climate change poses significant threats to our planet."',
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
        explanation: 'Present perfect (have/has + past participle) is used for completed actions at an unspecified time.',
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
        explanation: 'First conditional: if + present simple, will + infinitive.',
        points: 10
    }
];

// Build the 20-level dataset.
// All variants share the same sample questions as placeholder content.
// Replace the questions array for each level with real EGE variant material.
var LEVELS_DATA = Array.from({ length: 20 }, function (_, i) {
    return {
        id: i + 1,
        title: 'Variant ' + (i + 1),
        description: 'Complete variant ' + (i + 1) + ' of the EGE English exam',
        maxScore: SAMPLE_QUESTIONS.reduce(function (s, q) { return s + q.points; }, 0),
        questions: SAMPLE_QUESTIONS
    };
});
