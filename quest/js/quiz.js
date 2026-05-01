// Quiz logic for level pages

// Telegram WebApp façade — works whether opened inside Telegram or in a regular browser
var tg = (window.Telegram && window.Telegram.WebApp) || {
    expand: function () {},
    ready: function () {},
    showAlert: function (msg, cb) { alert(msg); if (cb) cb(); },
    themeParams: {},
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

// Apply Telegram theme colors to quest CSS variables
function applyLevelTheme() {
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
applyLevelTheme();
tg.onEvent('themeChanged', applyLevelTheme);

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

// EGE-style questions for all 20 variants
function loadQuestions(levelId) {
    const allQuestions = {

        // ── Variant 1: General English ────────────────────────────────────────
        1: [
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
        ],

        // ── Variant 2: Travel & Transport ─────────────────────────────────────
        2: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                instruction: 'Pay attention to the time sequence.',
                sentence: 'By the time we _____ the airport, the plane had already left.',
                options: ['reached', 'had reached', 'reach', 'were reaching'],
                correct: 0,
                explanation: 'After "by the time" in a past context, we use the past simple. The past perfect in the main clause shows the earlier action.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the best synonym of "journey":',
                options: ['voyage', 'trip', 'excursion', 'ride'],
                correct: 1,
                explanation: '"Trip" is the closest general synonym of "journey." "Voyage" is specifically by sea; "excursion" is a short outing.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Benefits of Public Transport',
                    text: 'Public transport plays a vital role in modern cities. Buses, trams and metro lines reduce the number of private cars on the road, lowering both traffic congestion and air pollution. Studies show that cities with well-developed transit networks have significantly healthier residents and shorter average commute times.'
                },
                text: 'What is the main idea of the passage?',
                options: [
                    'Public transport is always cheaper than driving',
                    'Good public transport networks improve urban life',
                    'Buses are the most popular form of transport',
                    'Traffic congestion is caused by poor roads'
                ],
                correct: 1,
                explanation: 'The passage focuses on how public transport reduces congestion and pollution, making city life better overall.',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Put the verb in brackets into the correct form:',
                instruction: 'Use the present perfect continuous tense.',
                sentence: 'She has been _____ (travel) for three hours and still hasn\'t arrived.',
                options: ['travelling', 'traveling'],
                correct: ['travelling', 'traveling'],
                explanation: 'Present perfect continuous (have/has been + -ing) describes an ongoing action that started in the past and continues now.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct modal verb:',
                sentence: 'You _____ book your tickets in advance — it is much cheaper.',
                options: ['should', 'must', 'can', 'need'],
                correct: 0,
                explanation: '"Should" expresses advice or recommendation. "Must" expresses strong obligation, which is too strong here.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "itinerary" mean?',
                options: [
                    'A travel diary written after a trip',
                    'A planned route or schedule for a journey',
                    'A tourist information booklet',
                    'A form for booking accommodation'
                ],
                correct: 1,
                explanation: 'An "itinerary" is a detailed plan or route for a journey, listing places to visit and travel times.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Eco-Tourism on the Rise',
                    text: 'Eco-tourism has grown rapidly over the past decade as travellers seek more responsible ways to explore the world. Unlike mass tourism, it aims to minimise environmental damage and support local communities. Many experts believe it offers a sustainable model for the future of travel.'
                },
                text: 'What is the author\'s attitude towards eco-tourism?',
                options: [
                    'Sceptical — it is too expensive for most travellers',
                    'Positive — it offers a sustainable model for travel',
                    'Neutral — the author presents no opinion',
                    'Negative — it causes more harm than mass tourism'
                ],
                correct: 1,
                explanation: 'The author describes eco-tourism favourably, noting it minimises damage and is considered a sustainable model by experts.',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'We arrived _____ Paris on Monday morning.',
                options: ['in', 'at', 'to', 'on'],
                correct: 0,
                explanation: 'We use "arrive in" with cities and countries. "Arrive at" is used for smaller places like stations or airports.',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct passive form:',
                instruction: 'Use the past simple passive.',
                sentence: 'The tickets _____ online the night before departure.',
                options: ['were booked', 'was booked'],
                correct: ['were booked'],
                explanation: 'Passive voice: subject + was/were + past participle. "Tickets" is plural, so we use "were booked."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct reported speech form:',
                sentence: 'He asked me where I _____ on my holiday.',
                options: ['go', 'went', 'had gone', 'am going'],
                correct: 2,
                explanation: 'In reported speech, the past simple shifts back to the past perfect ("went" → "had gone").',
                points: 10
            }
        ],

        // ── Variant 3: Health & Medicine ──────────────────────────────────────
        3: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct modal verb for advice:',
                sentence: 'You _____ eat so much junk food — it is bad for your health.',
                options: ['shouldn\'t', 'mustn\'t', 'needn\'t', 'won\'t'],
                correct: 0,
                explanation: '"Shouldn\'t" gives negative advice. "Mustn\'t" expresses prohibition. Here advice is the right tone.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "remedy" mean?',
                options: [
                    'A cure or treatment for an illness',
                    'A type of hospital ward',
                    'A prescription form',
                    'A medical examination'
                ],
                correct: 0,
                explanation: 'A "remedy" is a medicine or treatment intended to cure a disease or relieve a symptom.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'After three weeks of treatment, the patient had _____ recovered.',
                options: ['fully', 'full', 'fullness', 'fuller'],
                correct: 0,
                explanation: 'An adverb (fully) is needed to modify the verb "recovered." Adjectives cannot modify verbs.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Importance of Physical Exercise',
                    text: 'Regular physical exercise offers numerous benefits for both the body and the mind. It strengthens the cardiovascular system, helps maintain a healthy weight, and releases endorphins that improve mood. Doctors recommend at least 150 minutes of moderate activity per week for adults.'
                },
                text: 'According to the passage, what is ONE mental benefit of exercise?',
                options: [
                    'It helps you sleep longer',
                    'It releases endorphins that improve mood',
                    'It reduces the need for medication',
                    'It improves memory and concentration'
                ],
                correct: 1,
                explanation: 'The passage states that exercise "releases endorphins that improve mood," which is a mental benefit.',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Put the verb into the correct form:',
                instruction: 'Use the present perfect tense.',
                sentence: 'She _____ (have) a sore throat since Monday.',
                options: ['has had', 'had'],
                correct: ['has had'],
                explanation: 'Present perfect (have/has + past participle) is used for states that began in the past and continue to the present.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "contagious" mean?',
                options: [
                    'Spreading easily from one person to another',
                    'Causing severe pain',
                    'Requiring immediate surgery',
                    'Related to the heart'
                ],
                correct: 0,
                explanation: 'A "contagious" disease is one that can be passed from person to person through contact.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Mental Health Awareness',
                    text: 'Mental health is just as important as physical health, yet it is often overlooked. Stress, anxiety, and depression affect millions of people worldwide. Early recognition of symptoms and access to professional support can significantly improve a person\'s quality of life.'
                },
                text: 'What does the author suggest about mental health?',
                options: [
                    'It is less important than physical health',
                    'It only affects elderly people',
                    'Early support can greatly improve quality of life',
                    'Medication is the only effective treatment'
                ],
                correct: 2,
                explanation: 'The passage states that "Early recognition of symptoms and access to professional support can significantly improve a person\'s quality of life."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'Regular exercise _____ the risk of developing heart disease.',
                options: ['reduces', 'reduce', 'reduced', 'is reducing'],
                correct: 0,
                explanation: 'Third person singular subject ("Regular exercise") requires the -s form in present simple: "reduces."',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct word:',
                instruction: 'Use a suitable noun.',
                sentence: 'The doctor gave her a _____ for antibiotics.',
                options: ['prescription', 'recipe'],
                correct: ['prescription'],
                explanation: 'A "prescription" is a written instruction from a doctor for medicine. "Recipe" relates to cooking.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct conditional form:',
                options: [
                    'If you eat well, you would feel better.',
                    'If you eat well, you will feel better.',
                    'If you will eat well, you feel better.',
                    'If you ate well, you will feel better.'
                ],
                correct: 1,
                explanation: 'First conditional (real possibility): if + present simple, will + infinitive.',
                points: 10
            }
        ],

        // ── Variant 4: Education & School ─────────────────────────────────────
        4: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'Students are expected to _____ their assignments on time.',
                options: ['submit', 'submits', 'submitted', 'submitting'],
                correct: 0,
                explanation: 'After "to" (infinitive marker), the base form of the verb is used: "to submit."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "curriculum" mean?',
                options: [
                    'A school timetable for one day',
                    'The subjects and courses studied at a school or university',
                    'A type of school examination',
                    'A student\'s personal notebook'
                ],
                correct: 1,
                explanation: 'The "curriculum" is the set of subjects and learning content offered by an educational institution.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'She has always been very good _____ mathematics.',
                options: ['at', 'in', 'for', 'on'],
                correct: 0,
                explanation: 'We say "good at" a subject or skill. This is a fixed collocation in English.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Online Education',
                    text: 'Online education has expanded dramatically since the 2010s. Learners can now access courses from world-leading universities without leaving their homes. While the flexibility is a great advantage, critics point out that the lack of face-to-face interaction can hinder the development of social skills.'
                },
                text: 'What is identified as a disadvantage of online education?',
                options: [
                    'It is more expensive than traditional education',
                    'It does not offer university-level courses',
                    'Lack of face-to-face interaction may hinder social skills',
                    'Students cannot study at their own pace'
                ],
                correct: 2,
                explanation: 'The passage states that "the lack of face-to-face interaction can hinder the development of social skills."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Put the verb into the correct passive form:',
                instruction: 'Use the past simple passive.',
                sentence: 'Oxford University _____ (found) in the 12th century.',
                options: ['was founded', 'founded'],
                correct: ['was founded'],
                explanation: 'Passive voice: was/were + past participle. "Oxford University" is singular, so "was founded."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'The government has invested heavily in _____ reforms.',
                options: ['education', 'educate', 'educational', 'educationally'],
                correct: 2,
                explanation: 'An adjective ("educational") is needed to modify the noun "reforms."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct reported speech:',
                instruction: 'The teacher said: "You must read chapter five."',
                options: [
                    'The teacher said that we must read chapter five.',
                    'The teacher said that we had to read chapter five.',
                    'The teacher said that we should read chapter five.',
                    'The teacher said that we will read chapter five.'
                ],
                correct: 1,
                explanation: 'In reported speech, "must" shifts to "had to" when the reporting verb is in the past.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Why Reading Matters',
                    text: 'Reading regularly has a proven positive impact on language development, vocabulary growth, and critical thinking. Children who read for pleasure tend to perform better across all school subjects. Despite the rise of digital media, books remain an irreplaceable source of deep knowledge.'
                },
                text: 'What does the passage say about children who read for pleasure?',
                options: [
                    'They enjoy school less than other children',
                    'They tend to perform better across all subjects',
                    'They prefer digital books to printed ones',
                    'They read faster than adults'
                ],
                correct: 1,
                explanation: 'The passage states: "Children who read for pleasure tend to perform better across all school subjects."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct tense:',
                instruction: 'Use the future simple.',
                sentence: 'If you study hard, you _____ (pass) your exams.',
                options: ['will pass', 'pass'],
                correct: ['will pass'],
                explanation: 'First conditional: if + present simple, will + infinitive. "Will pass" is correct.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct modal verb:',
                sentence: 'You _____ use your phone during the exam — it is strictly forbidden.',
                options: ['mustn\'t', 'shouldn\'t', 'needn\'t', 'couldn\'t'],
                correct: 0,
                explanation: '"Mustn\'t" expresses prohibition — something that is not allowed. "Shouldn\'t" is weaker advice.',
                points: 10
            }
        ],

        // ── Variant 5: Environment & Nature ────────────────────────────────────
        5: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'Scientists _____ discovered a new species of deep-sea fish.',
                options: ['have', 'has', 'had', 'were'],
                correct: 0,
                explanation: '"Scientists" is plural, so we use "have" + past participle: "have discovered."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "endangered" mean when describing a species?',
                options: [
                    'Very common and widespread',
                    'At risk of becoming extinct',
                    'Harmful to humans',
                    'Recently discovered'
                ],
                correct: 1,
                explanation: 'An "endangered" species is one that faces a serious risk of extinction in the near future.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'Plastic pollution is extremely harmful _____ marine life.',
                options: ['to', 'for', 'at', 'on'],
                correct: 0,
                explanation: '"Harmful to" is the correct collocation. We say something is harmful to something else.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Deforestation: A Growing Crisis',
                    text: 'Every year, millions of hectares of forest are cleared for agriculture and industry. Deforestation destroys habitats, threatens biodiversity, and contributes to climate change by releasing stored carbon into the atmosphere. International cooperation is urgently needed to protect remaining forests.'
                },
                text: 'According to the passage, what is ONE consequence of deforestation?',
                options: [
                    'It creates new agricultural land without any negative effects',
                    'It threatens biodiversity and contributes to climate change',
                    'It increases rainfall in tropical regions',
                    'It helps local communities grow economically'
                ],
                correct: 1,
                explanation: 'The passage lists several consequences: destruction of habitats, threat to biodiversity, and contribution to climate change.',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct passive form:',
                instruction: 'Use the present continuous passive.',
                sentence: 'Thousands of acres of rainforest _____ (destroy) every day.',
                options: ['are being destroyed', 'are destroyed'],
                correct: ['are being destroyed'],
                explanation: 'Present continuous passive: am/is/are + being + past participle. Shows an ongoing action happening now.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct conditional sentence:',
                options: [
                    'If we won\'t act now, it will be too late.',
                    'If we don\'t act now, it will be too late.',
                    'If we don\'t act now, it would be too late.',
                    'If we didn\'t act now, it will be too late.'
                ],
                correct: 1,
                explanation: 'First conditional for real future situations: if + present simple, will + infinitive.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "sustainable" mean?',
                options: [
                    'Able to be maintained without damaging the environment',
                    'Very expensive and difficult to produce',
                    'Related to underwater ecosystems',
                    'No longer in use'
                ],
                correct: 0,
                explanation: '"Sustainable" means using resources in a way that can be maintained long-term without causing harm.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Value of Recycling',
                    text: 'Recycling is one of the simplest ways individuals can help the environment. By processing used materials into new products, recycling conserves natural resources, saves energy, and reduces the amount of waste sent to landfill. Many countries have introduced recycling programmes to encourage citizens to participate.'
                },
                text: 'Which of the following is NOT mentioned as a benefit of recycling?',
                options: [
                    'Conserving natural resources',
                    'Saving energy',
                    'Reducing water consumption',
                    'Reducing waste sent to landfill'
                ],
                correct: 2,
                explanation: 'The passage mentions conserving resources, saving energy, and reducing landfill waste. Water consumption is not mentioned.',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete the sentence with the correct relative pronoun:',
                instruction: 'Choose: which, who, or where.',
                sentence: 'The Amazon is a vast rainforest _____ covers much of South America.',
                options: ['which', 'that', 'who'],
                correct: ['which', 'that'],
                explanation: '"Which" or "that" can be used in a defining relative clause referring to a thing (the rainforest).',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct future form for a prediction:',
                sentence: 'Scientists predict that global temperatures _____ by 1.5°C by 2050.',
                options: ['will rise', 'rise', 'are rising', 'rose'],
                correct: 0,
                explanation: '"Will + infinitive" is used for future predictions, especially with verbs like "predict," "expect," "think."',
                points: 10
            }
        ],

        // ── Variant 6: Technology & Internet ──────────────────────────────────
        6: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct passive voice form:',
                sentence: 'This app _____ by millions of users every day.',
                options: ['is used', 'uses', 'used', 'has used'],
                correct: 0,
                explanation: 'Passive voice: is/are + past participle. "Is used" is correct for a present simple passive.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "obsolete" mean in the context of technology?',
                options: [
                    'Brand new and cutting-edge',
                    'No longer in use because something better exists',
                    'Very powerful and fast',
                    'Difficult to repair'
                ],
                correct: 1,
                explanation: '"Obsolete" means outdated and no longer used because it has been replaced by something more modern.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'She relies heavily _____ her smartphone for daily tasks.',
                options: ['on', 'in', 'at', 'for'],
                correct: 0,
                explanation: '"Rely on" is the correct collocation. We rely on something or someone.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Artificial Intelligence in Everyday Life',
                    text: 'Artificial intelligence is no longer confined to research laboratories. Voice assistants, recommendation algorithms, and facial recognition systems are now part of daily life for billions of people. While AI brings convenience, experts warn about growing concerns related to data privacy and job displacement.'
                },
                text: 'What concern do experts raise about AI?',
                options: [
                    'It is too expensive for most people to use',
                    'It is only available in developed countries',
                    'It raises concerns about data privacy and job displacement',
                    'It makes people less creative'
                ],
                correct: 2,
                explanation: 'The passage states that "experts warn about growing concerns related to data privacy and job displacement."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct form of the verb:',
                instruction: 'Use the present perfect.',
                sentence: 'The company _____ (develop) a new software platform over the past two years.',
                options: ['has developed', 'developed'],
                correct: ['has developed'],
                explanation: 'Present perfect is used for actions completed within a time period that extends to the present ("over the past two years").',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What is the meaning of the phrasal verb "log in"?',
                options: [
                    'To turn off a device',
                    'To enter a username and password to access a system',
                    'To download a file',
                    'To send an email'
                ],
                correct: 1,
                explanation: '"Log in" means to enter your credentials (username and password) to gain access to a computer system or website.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Cyberbullying: A Modern Problem',
                    text: 'Cyberbullying — the use of digital technology to harass or intimidate others — has become a serious issue among young people. Unlike traditional bullying, it can follow victims everywhere through their devices. Schools and parents are encouraged to teach children about safe and responsible internet use.'
                },
                text: 'How does cyberbullying differ from traditional bullying, according to the passage?',
                options: [
                    'It is less harmful than traditional bullying',
                    'It only happens in schools',
                    'It can follow victims everywhere through their devices',
                    'It is easier to report to authorities'
                ],
                correct: 2,
                explanation: 'The passage explains that cyberbullying "can follow victims everywhere through their devices," unlike traditional bullying.',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'The new update significantly _____ the performance of the device.',
                options: ['improved', 'improvement', 'improving', 'improve'],
                correct: 0,
                explanation: 'A verb in past simple is needed here. "Improved" is the past simple of "improve."',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct relative pronoun:',
                sentence: 'A hacker is a person _____ gains unauthorised access to computer systems.',
                options: ['who', 'which', 'that'],
                correct: ['who'],
                explanation: '"Who" is used in relative clauses when the antecedent is a person.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct second conditional sentence:',
                options: [
                    'If I have a faster connection, I will stream better.',
                    'If I had a faster connection, I would stream better.',
                    'If I had a faster connection, I will stream better.',
                    'If I would have a faster connection, I stream better.'
                ],
                correct: 1,
                explanation: 'Second conditional (hypothetical present/future): if + past simple, would + infinitive.',
                points: 10
            }
        ],

        // ── Variant 7: Culture & Arts ──────────────────────────────────────────
        7: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct article:',
                sentence: 'She wants to become _____ artist one day.',
                options: ['an', 'a', 'the', '—'],
                correct: 0,
                explanation: 'Use "an" before words starting with a vowel sound. "Artist" starts with the vowel "a."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "contemporary" mean in the phrase "contemporary art"?',
                options: [
                    'Ancient and traditional',
                    'Belonging to the present time',
                    'Painted using watercolours',
                    'Created by unknown artists'
                ],
                correct: 1,
                explanation: '"Contemporary" means existing or happening now, in the present period.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'The painting is inspired _____ the landscapes of southern France.',
                options: ['by', 'from', 'with', 'of'],
                correct: 0,
                explanation: '"Inspired by" is the correct collocation. Art or ideas are inspired by something or someone.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Role of Music in Society',
                    text: 'Music has been central to human culture throughout history. It brings people together at celebrations, helps express emotions that words cannot capture, and serves as a powerful tool for social change. From ancient folk songs to modern protest music, its influence on society is undeniable.'
                },
                text: 'According to the passage, music can be used as a tool for:',
                options: [
                    'Replacing spoken language',
                    'Social change',
                    'Learning mathematics',
                    'Improving physical health'
                ],
                correct: 1,
                explanation: 'The passage states that music "serves as a powerful tool for social change."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct form:',
                instruction: 'Use the past passive.',
                sentence: 'The Mona Lisa _____ (paint) by Leonardo da Vinci.',
                options: ['was painted', 'painted'],
                correct: ['was painted'],
                explanation: 'Passive voice: was/were + past participle. "The Mona Lisa" is singular, so "was painted."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What is the meaning of "exhibit" as a verb?',
                options: [
                    'To buy a piece of art',
                    'To display something publicly, e.g. in a gallery',
                    'To restore an old painting',
                    'To describe a work of art in writing'
                ],
                correct: 1,
                explanation: 'To "exhibit" means to show or display something, typically in a gallery or museum, for the public to see.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Theatre: Live vs Recorded',
                    text: 'Live theatre offers an experience that no recording can fully replicate. The energy between performers and audience creates a unique atmosphere in every performance. However, with the rise of streaming platforms, recorded performances are now reaching global audiences who may never visit a theatre.'
                },
                text: 'What advantage of recorded theatre is mentioned in the passage?',
                options: [
                    'It is cheaper to produce than live theatre',
                    'It provides a better atmosphere for the audience',
                    'It reaches global audiences who may never visit a theatre',
                    'It allows actors to rehearse more carefully'
                ],
                correct: 2,
                explanation: 'The passage says recorded performances "are now reaching global audiences who may never visit a theatre."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct relative clause:',
                sentence: 'Van Gogh was an artist _____ work is now worth millions of pounds.',
                options: ['who', 'whose', 'which', 'whom'],
                correct: 1,
                explanation: '"Whose" is used in relative clauses to show possession (whose work = his work).',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete the sentence:',
                instruction: 'Use the present perfect.',
                sentence: 'The museum _____ (attract) over two million visitors this year.',
                options: ['has attracted', 'attracted'],
                correct: ['has attracted'],
                explanation: 'Present perfect is used for actions in a time period that includes now ("this year").',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct comparative form:',
                sentence: 'This sculpture is _____ than anything I have seen before.',
                options: ['more impressive', 'most impressive', 'impressiver', 'impressive'],
                correct: 0,
                explanation: 'For adjectives of three or more syllables, use "more + adjective" for comparatives.',
                points: 10
            }
        ],

        // ── Variant 8: Work & Career ───────────────────────────────────────────
        8: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'By next year, she _____ for the company for a decade.',
                options: ['will have worked', 'will work', 'has worked', 'worked'],
                correct: 0,
                explanation: 'Future perfect (will have + past participle) describes an action that will be complete by a future point.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "redundant" mean in a work context?',
                options: [
                    'Promoted to a higher position',
                    'No longer needed and therefore dismissed',
                    'Given extra responsibilities',
                    'Working overtime'
                ],
                correct: 1,
                explanation: 'In British English, to be made "redundant" means to lose your job because the employer no longer needs that role.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'She applied _____ the position of senior manager.',
                options: ['for', 'to', 'at', 'in'],
                correct: 0,
                explanation: '"Apply for" is the correct collocation when applying for a job or position.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Remote Work: Benefits and Challenges',
                    text: 'Remote work has become increasingly common since the COVID-19 pandemic. Employees enjoy greater flexibility and save time on commuting, while employers can reduce office costs. However, remote work can lead to feelings of isolation, and maintaining team cohesion becomes more challenging without face-to-face contact.'
                },
                text: 'What is mentioned as a challenge of remote work?',
                options: [
                    'Higher salary costs for employers',
                    'Longer working hours for employees',
                    'Feelings of isolation and difficulty maintaining team cohesion',
                    'Lack of access to technology'
                ],
                correct: 2,
                explanation: 'The passage states that remote work "can lead to feelings of isolation, and maintaining team cohesion becomes more challenging."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct gerund or infinitive:',
                instruction: 'Use the -ing form (gerund).',
                sentence: 'He is responsible for _____ (manage) the sales team.',
                options: ['managing', 'manage'],
                correct: ['managing'],
                explanation: 'After prepositions (e.g., "responsible for"), we use the gerund (-ing form), not the infinitive.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What is the meaning of "negotiate"?',
                options: [
                    'To accept an offer without discussion',
                    'To discuss something in order to reach an agreement',
                    'To resign from a position',
                    'To evaluate someone\'s performance'
                ],
                correct: 1,
                explanation: 'To "negotiate" means to have a formal discussion to reach a mutually acceptable agreement.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Value of Work Experience',
                    text: 'Work experience placements give students a valuable insight into professional life before they enter the job market. They help young people develop practical skills, build their CVs, and make informed career decisions. Many employers consider previous experience a key factor when hiring new graduates.'
                },
                text: 'According to the passage, why is work experience valuable for students?',
                options: [
                    'It guarantees a job after graduation',
                    'It provides insight into professional life and helps build practical skills',
                    'It replaces the need for a university degree',
                    'It is required by law before starting work'
                ],
                correct: 1,
                explanation: 'The passage says work experience gives "valuable insight into professional life" and helps develop "practical skills."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'The company is looking for a highly _____ candidate.',
                options: ['motivated', 'motivate', 'motivation', 'motivating'],
                correct: 0,
                explanation: 'An adjective is needed to describe the candidate. "Motivated" (past participle used as adjective) is correct.',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete using the correct modal:',
                instruction: 'Express an obligation in the past.',
                sentence: 'He _____ (must) submit the report by Friday, but he missed the deadline.',
                options: ['had to', 'must have'],
                correct: ['had to'],
                explanation: '"Had to" is the past form of "must" when expressing obligation. "Must have" expresses a past deduction.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct phrasal verb meaning "to tolerate":',
                sentence: 'I can\'t _____ rude behaviour in the office.',
                options: ['put up with', 'put off', 'put down', 'put on'],
                correct: 0,
                explanation: '"Put up with" means to tolerate or accept something unpleasant. It is a common phrasal verb.',
                points: 10
            }
        ],

        // ── Variant 9: Food & Nutrition ────────────────────────────────────────
        9: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct article:',
                sentence: 'Can I have _____ apple from that bowl?',
                options: ['an', 'a', 'the', '—'],
                correct: 0,
                explanation: 'Use "an" before words beginning with a vowel sound. "Apple" starts with the vowel "a."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "nutritious" mean?',
                options: [
                    'Having a very strong flavour',
                    'Containing substances that help the body grow and stay healthy',
                    'Very low in calories',
                    'Easy and quick to prepare'
                ],
                correct: 1,
                explanation: '"Nutritious" describes food that is full of nutrients — substances needed for health and growth.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'Water _____ at 100 degrees Celsius at sea level.',
                options: ['boils', 'is boiling', 'boiled', 'has boiled'],
                correct: 0,
                explanation: 'Scientific facts and general truths use the present simple tense.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Mediterranean Diet',
                    text: 'The Mediterranean diet, rich in olive oil, vegetables, legumes, fish, and whole grains, is widely regarded as one of the healthiest in the world. Research has linked it to a reduced risk of heart disease, improved mental health, and longer life expectancy. Many nutritionists recommend it as a model for healthy eating.'
                },
                text: 'According to the passage, which health benefit is associated with the Mediterranean diet?',
                options: [
                    'Rapid weight loss',
                    'Reduced risk of heart disease',
                    'Increased energy for sport',
                    'Better eyesight'
                ],
                correct: 1,
                explanation: 'The passage mentions "a reduced risk of heart disease" as one of the benefits linked to the Mediterranean diet.',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct comparative form:',
                instruction: 'Make the adjective comparative.',
                sentence: 'Fruit is _____ (healthy) than processed snacks.',
                options: ['healthier', 'more healthy'],
                correct: ['healthier', 'more healthy'],
                explanation: 'Short adjectives (1-2 syllables) use -er for comparatives: "healthier." "More healthy" is also acceptable.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What is the meaning of "cuisine"?',
                options: [
                    'A type of kitchen appliance',
                    'A style of cooking associated with a particular country or region',
                    'A cooking course at college',
                    'A food market'
                ],
                correct: 1,
                explanation: '"Cuisine" refers to the characteristic style of cooking of a particular region or culture.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Food Waste: A Global Problem',
                    text: 'Approximately one third of all food produced globally is wasted each year. This waste occurs at every stage — from farms and factories to shops and homes. Reducing food waste is essential not only to feed the world\'s growing population but also to lower the environmental impact of food production.'
                },
                text: 'At which stages does food waste occur, according to the passage?',
                options: [
                    'Only in shops and supermarkets',
                    'Only in households',
                    'At every stage from farms to homes',
                    'Only in developing countries'
                ],
                correct: 2,
                explanation: 'The passage states that waste "occurs at every stage — from farms and factories to shops and homes."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct quantifier:',
                sentence: 'There isn\'t _____ sugar left in the bowl.',
                options: ['any', 'some', 'many', 'few'],
                correct: 0,
                explanation: '"Any" is used in negative sentences and questions with uncountable nouns like "sugar."',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct preposition:',
                sentence: 'This dish is made _____ fresh tomatoes and basil.',
                options: ['from', 'of'],
                correct: ['from', 'of'],
                explanation: 'Both "made from" (when you cannot see the original ingredient) and "made of" can be used with food. Both are acceptable.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct passive voice sentence about food production:',
                options: [
                    'Coffee beans are grown in tropical climates.',
                    'Coffee beans grown in tropical climates.',
                    'Coffee beans is growing in tropical climates.',
                    'Coffee beans were grow in tropical climates.'
                ],
                correct: 0,
                explanation: 'Present simple passive: am/is/are + past participle. "Are grown" is correct for plural subject "coffee beans."',
                points: 10
            }
        ],

        // ── Variant 10: Sports & Leisure ───────────────────────────────────────
        10: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'She _____ tennis since she was seven years old.',
                options: ['has been playing', 'plays', 'played', 'is playing'],
                correct: 0,
                explanation: 'Present perfect continuous (has/have been + -ing) describes an action that started in the past and continues now.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "spectator" mean?',
                options: [
                    'A professional athlete',
                    'A person who watches an event',
                    'A sports coach',
                    'A competition referee'
                ],
                correct: 1,
                explanation: 'A "spectator" is a person who watches a game, show, or event without participating.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'He is very keen _____ cycling and goes out every weekend.',
                options: ['on', 'for', 'in', 'about'],
                correct: 0,
                explanation: '"Keen on" is a fixed phrase meaning enthusiastic about or interested in something.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Olympic Games',
                    text: 'The Olympic Games, originally held in ancient Greece, were revived in 1896 in Athens. Today they bring together athletes from over 200 countries every four years. The Games promote values of friendship, respect, and excellence, and are watched by billions of viewers around the world.'
                },
                text: 'When were the modern Olympic Games first held?',
                options: [
                    'In ancient Greece',
                    'In 1896 in Athens',
                    'In 1900 in Paris',
                    'In 1904 in St Louis'
                ],
                correct: 1,
                explanation: 'The passage states that the Olympic Games "were revived in 1896 in Athens."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Put the verb into the correct form:',
                instruction: 'Use the past continuous.',
                sentence: 'When the coach arrived, the players _____ (warm up).',
                options: ['were warming up', 'warmed up'],
                correct: ['were warming up'],
                explanation: 'Past continuous (was/were + -ing) describes an action in progress at a specific past moment.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does the phrasal verb "work out" mean in a sports context?',
                options: [
                    'To solve a problem',
                    'To leave work early',
                    'To do physical exercise',
                    'To calculate a result'
                ],
                correct: 2,
                explanation: 'In a sports/fitness context, "work out" means to do physical exercise, e.g. at the gym.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Leisure Time and Well-being',
                    text: 'Having adequate leisure time is essential for mental and physical well-being. Hobbies such as reading, gardening, and sport provide an escape from daily stress and encourage creativity. Psychologists increasingly recommend regular leisure activities as part of a healthy lifestyle.'
                },
                text: 'What do psychologists recommend, according to the passage?',
                options: [
                    'Working longer hours to achieve more',
                    'Watching television as a form of relaxation',
                    'Regular leisure activities as part of a healthy lifestyle',
                    'Taking at least two holidays a year'
                ],
                correct: 2,
                explanation: 'The passage states: "Psychologists increasingly recommend regular leisure activities as part of a healthy lifestyle."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'The athlete gave an impressive _____ at the championship.',
                options: ['performance', 'perform', 'performed', 'performing'],
                correct: 0,
                explanation: 'A noun is needed after the adjective "impressive." "Performance" is the correct noun form.',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete using the correct superlative:',
                sentence: 'It was _____ (exciting) match I have ever watched.',
                options: ['the most exciting', 'the most excited'],
                correct: ['the most exciting'],
                explanation: 'Superlative of long adjectives: the most + adjective. "Exciting" describes the match (not a person\'s feeling).',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct third conditional sentence:',
                options: [
                    'If she trained harder, she would win the race.',
                    'If she had trained harder, she would win the race.',
                    'If she had trained harder, she would have won the race.',
                    'If she trains harder, she will win the race.'
                ],
                correct: 2,
                explanation: 'Third conditional (impossible past): if + past perfect, would have + past participle.',
                points: 10
            }
        ],

        // ── Variant 11: Shopping & Money ───────────────────────────────────────
        11: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'She spent all her savings _____ a new laptop.',
                options: ['on', 'for', 'in', 'at'],
                correct: 0,
                explanation: '"Spend money on something" is the correct collocation.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "bargain" mean?',
                options: [
                    'A very expensive item',
                    'A product sold at a low price, representing good value',
                    'An argument between a buyer and seller',
                    'A type of loyalty card'
                ],
                correct: 1,
                explanation: 'A "bargain" is something bought for less than its usual price, giving excellent value for money.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'The price of goods _____ significantly over the last decade.',
                options: ['has risen', 'has raised', 'raised', 'rises'],
                correct: 0,
                explanation: '"Rise" is intransitive (no object). Present perfect is used for changes over a past period relevant to now.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Online Shopping: Convenience vs Risk',
                    text: 'Online shopping has revolutionised retail, offering consumers unmatched convenience and a vast choice of products. However, it also carries risks: fraudulent websites, delivery problems, and the difficulty of returning items. Experts advise shoppers to buy only from reputable retailers and always check security certificates before entering payment details.'
                },
                text: 'What advice do experts give to online shoppers?',
                options: [
                    'Avoid online shopping whenever possible',
                    'Use only cash for online purchases',
                    'Buy from reputable retailers and check security certificates',
                    'Never return items bought online'
                ],
                correct: 2,
                explanation: 'The passage states: "Experts advise shoppers to buy only from reputable retailers and always check security certificates."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete using the correct comparative:',
                sentence: 'Shopping online is often _____ (convenient) than going to a physical store.',
                options: ['more convenient', 'convenienter'],
                correct: ['more convenient'],
                explanation: 'Long adjectives use "more" for the comparative form. "Convenient" has three syllables, so: "more convenient."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does the phrasal verb "splash out" mean?',
                options: [
                    'To save money carefully',
                    'To spend a lot of money on something',
                    'To drop something in water',
                    'To give money to charity'
                ],
                correct: 1,
                explanation: 'To "splash out" means to spend a lot of money on something special, often impulsively.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Psychology of Discounts',
                    text: 'Retailers use clever pricing strategies to encourage consumers to spend more. The "sale" label and reduced prices trigger a psychological response, making shoppers feel they are getting a deal even when the original price was inflated. Being aware of these tactics can help consumers make more rational purchasing decisions.'
                },
                text: 'What is the main point of the passage?',
                options: [
                    'Sales always offer genuine discounts',
                    'Retailers use pricing tactics that can manipulate consumers',
                    'Shoppers should avoid all sales events',
                    'Prices in shops are always fair'
                ],
                correct: 1,
                explanation: 'The passage explains that retailers use psychological tactics around discounts to manipulate consumers into spending more.',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct passive voice:',
                sentence: 'Millions of pounds _____ in high-street shops every year.',
                options: ['are spent', 'spend', 'spent', 'is spent'],
                correct: 0,
                explanation: 'Passive: subject + am/is/are + past participle. "Millions of pounds" is plural, so "are spent."',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete the sentence with the correct tense:',
                sentence: 'By the time the sale ended, she _____ (buy) three pairs of shoes.',
                options: ['had bought', 'has bought'],
                correct: ['had bought'],
                explanation: 'Past perfect is used for an action completed before another past event ("By the time the sale ended").',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the sentence with correct word order:',
                options: [
                    'She always checks the price before she buys anything.',
                    'She checks always the price before she buys anything.',
                    'Always she checks the price before she buys anything.',
                    'She checks the price always before she buys anything.'
                ],
                correct: 0,
                explanation: 'Frequency adverbs like "always" come before the main verb but after the auxiliary verb.',
                points: 10
            }
        ],

        // ── Variant 12: Family & Relationships ────────────────────────────────
        12: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'My parents _____ married for over thirty years.',
                options: ['have been', 'are', 'were', 'had been'],
                correct: 0,
                explanation: 'Present perfect is used for states that started in the past and continue to the present. "Have been married" is correct.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "sibling" mean?',
                options: [
                    'A parent\'s friend',
                    'A brother or sister',
                    'A distant cousin',
                    'A step-parent'
                ],
                correct: 1,
                explanation: '"Sibling" is a gender-neutral term for a brother or sister.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'She takes _____ her mother — they look very similar.',
                options: ['after', 'up', 'on', 'over'],
                correct: 0,
                explanation: '"Take after" means to resemble a parent or older relative in appearance or character.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Changing Family Structures',
                    text: 'Family structures have changed significantly over the past fifty years. The traditional model of two parents and their children has been joined by single-parent families, same-sex couples, and blended families. Sociologists note that while the form of families has changed, the importance of strong family bonds remains constant.'
                },
                text: 'What does the passage suggest has remained constant despite changing family structures?',
                options: [
                    'The number of children per family',
                    'The importance of strong family bonds',
                    'The roles of mothers and fathers',
                    'The number of people in each household'
                ],
                correct: 1,
                explanation: 'The passage states that "the importance of strong family bonds remains constant" despite changes in family structures.',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Put the verb into the correct past tense form:',
                instruction: 'Use the past simple.',
                sentence: 'We _____ (spend) every summer at my grandparents\' house when I was young.',
                options: ['spent', 'used to spend'],
                correct: ['spent', 'used to spend'],
                explanation: 'Past simple "spent" is used for repeated past actions. "Used to spend" is also acceptable for past habits.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "upbringing" mean?',
                options: [
                    'A promotion at work',
                    'The way a child is raised and educated',
                    'A family celebration',
                    'A childhood memory'
                ],
                correct: 1,
                explanation: '"Upbringing" refers to the process of raising and educating a child, particularly in terms of values and behaviour.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Long-distance Relationships',
                    text: 'With increased globalisation and migration, many couples and families live apart for extended periods. While technology such as video calls makes communication easier, long-distance relationships still require significant effort and trust. Research suggests that couples who communicate regularly and have clear plans to close the distance tend to succeed.'
                },
                text: 'According to the passage, what helps long-distance relationships succeed?',
                options: [
                    'Moving to the same country immediately',
                    'Avoiding all forms of social media',
                    'Regular communication and clear plans to close the distance',
                    'Meeting only once a year'
                ],
                correct: 2,
                explanation: 'The passage states: "couples who communicate regularly and have clear plans to close the distance tend to succeed."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'Building a strong _____ with your children takes time and effort.',
                options: ['relationship', 'relate', 'related', 'relational'],
                correct: 0,
                explanation: 'A noun is needed after the adjective "strong." "Relationship" is the correct noun form.',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct reflexive pronoun:',
                sentence: 'He built the treehouse entirely by _____.',
                options: ['himself', 'him'],
                correct: ['himself'],
                explanation: '"By himself" means alone, without help. Reflexive pronouns are used in this structure.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct second conditional:',
                options: [
                    'If I have more time, I will visit my parents more often.',
                    'If I had more time, I would visit my parents more often.',
                    'If I have more time, I would visit my parents more often.',
                    'If I had more time, I will visit my parents more often.'
                ],
                correct: 1,
                explanation: 'Second conditional (hypothetical/unreal present): if + past simple, would + infinitive.',
                points: 10
            }
        ],

        // ── Variant 13: Science & Research ────────────────────────────────────
        13: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct passive form:',
                sentence: 'The experiment _____ under carefully controlled conditions.',
                options: ['was conducted', 'conducted', 'has conducted', 'conducts'],
                correct: 0,
                explanation: 'Passive voice: was/were + past participle. "Was conducted" is correct for a past passive.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "hypothesis" mean?',
                options: [
                    'A proven scientific law',
                    'A suggested explanation that can be tested',
                    'A type of laboratory instrument',
                    'A summary of research findings'
                ],
                correct: 1,
                explanation: 'A "hypothesis" is a proposed explanation for an observation that can be tested through experiment.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'The results of the study differ significantly _____ previous research.',
                options: ['from', 'to', 'with', 'at'],
                correct: 0,
                explanation: '"Differ from" is the correct collocation. Results or ideas differ from other results or ideas.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'CRISPR: A Revolution in Genetics',
                    text: 'CRISPR-Cas9 is a gene-editing technology that allows scientists to modify DNA sequences with unprecedented precision. It has potential applications in treating genetic diseases, improving crop yields, and developing new medicines. However, ethical questions about the limits of genetic modification remain a subject of intense debate.'
                },
                text: 'What concern is mentioned about CRISPR technology?',
                options: [
                    'It is too expensive for most laboratories',
                    'It only works on plant DNA',
                    'Ethical questions about genetic modification remain debated',
                    'It has not been tested on humans'
                ],
                correct: 2,
                explanation: 'The passage mentions "ethical questions about the limits of genetic modification remain a subject of intense debate."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct tense:',
                instruction: 'Use the present simple for a general truth.',
                sentence: 'Water _____ (consist) of two hydrogen atoms and one oxygen atom.',
                options: ['consists', 'is consisting'],
                correct: ['consists'],
                explanation: 'Scientific facts use the present simple tense. "Consists" is correct for the third-person singular.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "peer review" mean in academic research?',
                options: [
                    'A student reviewing a classmate\'s essay',
                    'The evaluation of research by other experts in the field',
                    'A government inspection of a laboratory',
                    'A self-assessment by the researcher'
                ],
                correct: 1,
                explanation: '"Peer review" is the process by which other qualified scientists evaluate a study before it is published.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Scientific Method',
                    text: 'The scientific method is a systematic process for investigating phenomena. It involves observation, forming a hypothesis, conducting experiments, and analysing results. If the results support the hypothesis, it may become a theory. A theory becomes a law when it has been confirmed repeatedly under different conditions.'
                },
                text: 'When does a hypothesis become a theory, according to the passage?',
                options: [
                    'When a scientist publishes it in a journal',
                    'When the results of experiments support it',
                    'After ten years of research',
                    'When the government approves it'
                ],
                correct: 1,
                explanation: 'The passage states: "If the results support the hypothesis, it may become a theory."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'The _____ of DNA was one of the most important discoveries of the 20th century.',
                options: ['discovery', 'discover', 'discovered', 'discoverer'],
                correct: 0,
                explanation: 'A noun is needed after the article "The." "Discovery" is the correct noun form.',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete the sentence using the correct verb form:',
                instruction: 'Use the future passive.',
                sentence: 'The new vaccine _____ (test) on a large scale next year.',
                options: ['will be tested', 'will test'],
                correct: ['will be tested'],
                explanation: 'Future passive: will be + past participle. The vaccine is the object being acted on.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct relative clause:',
                sentence: 'Marie Curie was the first woman _____ a Nobel Prize in physics.',
                options: ['who won', 'which won', 'whose won', 'whom won'],
                correct: 0,
                explanation: '"Who" is used in relative clauses when the antecedent is a person. "Who won" is the correct relative clause.',
                points: 10
            }
        ],

        // ── Variant 14: Media & News ───────────────────────────────────────────
        14: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'The news _____ broadcast live at 9 o\'clock every evening.',
                options: ['is', 'are', 'were', 'have been'],
                correct: 0,
                explanation: '"News" is an uncountable noun and takes a singular verb: "The news is."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "bias" mean in journalism?',
                options: [
                    'An objective and balanced report',
                    'A tendency to favour one side unfairly',
                    'A type of headline',
                    'An anonymous source'
                ],
                correct: 1,
                explanation: '"Bias" in journalism means a tendency to present news in a way that favours a particular viewpoint, rather than being neutral.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'According _____ the latest report, unemployment has fallen.',
                options: ['to', 'by', 'from', 'with'],
                correct: 0,
                explanation: '"According to" is the correct fixed phrase used to cite a source.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Rise of Social Media News',
                    text: 'An increasing number of people now get their news from social media platforms rather than traditional newspapers or television. While this allows for faster access to information, it also raises concerns about the spread of misinformation and "echo chambers," where users are only exposed to views that match their own.'
                },
                text: 'What is an "echo chamber" according to the passage?',
                options: [
                    'A place where journalists record their reports',
                    'A situation where users only see views matching their own',
                    'A technology used to verify news stories',
                    'A type of online comment section'
                ],
                correct: 1,
                explanation: 'The passage defines "echo chambers" as situations "where users are only exposed to views that match their own."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete using the correct passive form:',
                instruction: 'Use the present simple passive.',
                sentence: 'The article _____ (publish) in several languages every week.',
                options: ['is published', 'published'],
                correct: ['is published'],
                explanation: 'Present simple passive: is/are + past participle. Singular subject "The article" takes "is published."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does the word "circulation" mean in the context of newspapers?',
                options: [
                    'The process of printing a newspaper',
                    'The number of copies of a newspaper sold or distributed',
                    'The content written by journalists',
                    'The speed at which news is reported'
                ],
                correct: 1,
                explanation: '"Circulation" refers to the total number of copies of a newspaper that are sold or distributed.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Fake News: A Modern Challenge',
                    text: 'Fake news — deliberately false or misleading information presented as real news — has become a major challenge in the digital age. It can influence public opinion, affect elections, and erode trust in institutions. Media literacy, the ability to critically evaluate information sources, is now considered an essential skill for citizens.'
                },
                text: 'Why is media literacy considered important, according to the passage?',
                options: [
                    'It helps people read newspapers faster',
                    'It allows journalists to write better articles',
                    'It enables citizens to critically evaluate information sources',
                    'It prevents newspapers from being censored'
                ],
                correct: 2,
                explanation: 'The passage describes media literacy as "the ability to critically evaluate information sources" — essential for all citizens.',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'The journalist gave a _____ account of events at the protest.',
                options: ['detailed', 'detail', 'detailing', 'detailful'],
                correct: 0,
                explanation: 'An adjective ("detailed") is needed before the noun "account." "Detailed" is the past participle used as adjective.',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete using the correct form of the verb:',
                sentence: 'She _____ (interview) the minister when the power went out.',
                options: ['was interviewing', 'interviewed'],
                correct: ['was interviewing'],
                explanation: 'Past continuous (was/were + -ing) describes an action in progress when another past event occurred.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct reported speech transformation:',
                instruction: 'Original: "We will publish the story tomorrow," the editor said.',
                options: [
                    'The editor said they will publish the story the next day.',
                    'The editor said they would publish the story the next day.',
                    'The editor said they would publish the story tomorrow.',
                    'The editor said they published the story the next day.'
                ],
                correct: 1,
                explanation: 'In reported speech: "will" → "would"; "tomorrow" → "the next day." Both changes are required.',
                points: 10
            }
        ],

        // ── Variant 15: City & Architecture ───────────────────────────────────
        15: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct article:',
                sentence: 'The Eiffel Tower is _____ iconic landmark in Paris.',
                options: ['an', 'a', 'the', '—'],
                correct: 0,
                explanation: '"An" is used before words starting with a vowel sound. "Iconic" starts with the vowel "i."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "infrastructure" mean?',
                options: [
                    'The architectural style of a building',
                    'The basic systems that a society needs, such as roads, water and power',
                    'A type of urban planning map',
                    'A construction technique'
                ],
                correct: 1,
                explanation: '"Infrastructure" refers to the fundamental systems a society or organisation needs to function, such as transport, utilities, and communications.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'The building was designed _____ a famous Spanish architect.',
                options: ['by', 'from', 'with', 'of'],
                correct: 0,
                explanation: 'In passive constructions, the agent (the person who did the action) is introduced by "by."',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Smart Cities of the Future',
                    text: 'Smart cities use technology and data to improve the quality of urban life. Sensors embedded in roads, buildings, and public spaces collect real-time information about traffic, energy use, and waste management. The goal is to create more efficient, sustainable, and liveable cities for their residents.'
                },
                text: 'What is the main goal of smart city technology?',
                options: [
                    'To replace human workers with robots',
                    'To create more efficient, sustainable, and liveable cities',
                    'To monitor citizens for security purposes',
                    'To attract more tourists to cities'
                ],
                correct: 1,
                explanation: 'The passage states: "The goal is to create more efficient, sustainable, and liveable cities for their residents."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct verb form:',
                instruction: 'Use the present perfect passive.',
                sentence: 'Several new skyscrapers _____ (build) in the city centre this decade.',
                options: ['have been built', 'were built'],
                correct: ['have been built'],
                explanation: 'Present perfect passive: have/has been + past participle. Plural subject uses "have been built."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "densely populated" mean?',
                options: [
                    'Having very few residents',
                    'Having a large number of people living in a small area',
                    'Having many green spaces and parks',
                    'Having a high standard of living'
                ],
                correct: 1,
                explanation: '"Densely populated" means having a large number of people living in a relatively small area.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Preserving Historic Buildings',
                    text: 'Historic buildings are an irreplaceable part of a city\'s cultural identity. Preserving them connects communities to their past and attracts tourism. However, restoration is costly, and some argue that space should be used for modern housing and infrastructure. Finding a balance between preservation and development is a key challenge for city planners.'
                },
                text: 'What challenge do city planners face regarding historic buildings?',
                options: [
                    'Too many tourists visiting historic sites',
                    'Lack of skilled architects to restore buildings',
                    'Balancing preservation with the need for modern development',
                    'High demand for historic buildings as offices'
                ],
                correct: 2,
                explanation: 'The passage states that "Finding a balance between preservation and development is a key challenge for city planners."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct comparative form:',
                sentence: 'The new library is _____ than the old one.',
                options: ['much larger', 'very larger', 'more large', 'larger much'],
                correct: 0,
                explanation: '"Much" intensifies comparatives: "much larger." We cannot say "very larger" or "more large."',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete the sentence with the correct relative pronoun:',
                sentence: 'The architect _____ designed the bridge won an international award.',
                options: ['who', 'which', 'whose'],
                correct: ['who'],
                explanation: '"Who" is used for people in defining relative clauses. The architect is a person.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct future form:',
                sentence: 'The construction company _____ the new stadium by the end of next year.',
                options: ['will have completed', 'will complete', 'completes', 'is completing'],
                correct: 0,
                explanation: 'Future perfect (will have + past participle) is used for actions that will be complete by a future deadline.',
                points: 10
            }
        ],

        // ── Variant 16: Animals & Wildlife ────────────────────────────────────
        16: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'The blue whale _____ the largest animal on Earth.',
                options: ['is', 'are', 'was', 'has been'],
                correct: 0,
                explanation: 'General facts about a specific species use the present simple. "The blue whale is" is correct.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "habitat" mean?',
                options: [
                    'An animal\'s natural home or environment',
                    'The diet of a wild animal',
                    'The breeding season of an animal',
                    'A type of animal behaviour'
                ],
                correct: 0,
                explanation: 'A "habitat" is the natural environment in which an animal or plant lives and grows.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'Many species are _____ risk of extinction due to habitat loss.',
                options: ['at', 'in', 'on', 'by'],
                correct: 0,
                explanation: '"At risk" is the correct fixed expression. Species are "at risk of" something.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Wolves and Ecosystems',
                    text: 'When wolves were reintroduced to Yellowstone National Park in the 1990s, they had an unexpectedly positive effect on the entire ecosystem. By controlling deer populations, they allowed vegetation to recover along riverbanks, which reduced erosion and improved water quality. Scientists use this example to illustrate the concept of a "keystone species."'
                },
                text: 'Why are wolves considered a "keystone species"?',
                options: [
                    'They are the largest predators in Yellowstone',
                    'Their presence has a major positive effect on the whole ecosystem',
                    'They attract tourists to the national park',
                    'They protect smaller animals from other predators'
                ],
                correct: 1,
                explanation: 'Wolves are a keystone species because their presence controls deer populations and allows the entire ecosystem to recover.',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete using the correct passive form:',
                instruction: 'Use the past simple passive.',
                sentence: 'The panda _____ (declare) an endangered species in the 1980s.',
                options: ['was declared', 'declared'],
                correct: ['was declared'],
                explanation: 'Passive voice: was/were + past participle. "The panda" is singular, so "was declared."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "migrate" mean?',
                options: [
                    'To hunt for food',
                    'To travel from one place to another seasonally',
                    'To build a nest',
                    'To hibernate during winter'
                ],
                correct: 1,
                explanation: 'To "migrate" means to move from one place to another, especially seasonally, as many birds and animals do.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Saving the Bees',
                    text: 'Bees are essential pollinators for most of the world\'s food crops. However, bee populations have been declining sharply due to pesticide use, habitat destruction, and climate change. Without bees, many plants could not reproduce, leading to a collapse in food production that would threaten human survival.'
                },
                text: 'Why are bees important for humans?',
                options: [
                    'They produce honey that is sold commercially',
                    'They keep gardens looking attractive',
                    'They pollinate food crops that humans depend on',
                    'They control populations of harmful insects'
                ],
                correct: 2,
                explanation: 'The passage states that bees are "essential pollinators for most of the world\'s food crops," making them vital to human food supply.',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'The government passed new laws to _____ endangered species.',
                options: ['protect', 'protection', 'protective', 'protectively'],
                correct: 0,
                explanation: 'After the infinitive marker "to," the base form of the verb is used: "to protect."',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete the sentence with the correct form:',
                instruction: 'Use a suitable adverb.',
                sentence: 'Dolphins communicate _____ (high) intelligently through a series of clicks and whistles.',
                options: ['highly', 'high'],
                correct: ['highly'],
                explanation: '"Highly" is an adverb meaning "to a great degree." "High" is an adjective and cannot modify "intelligently."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct sentence with a defining relative clause:',
                options: [
                    'A carnivore, which eats only plants, is the opposite of an herbivore.',
                    'A carnivore is an animal which eats only meat.',
                    'A carnivore is an animal, which eats meat.',
                    'A carnivore eats meat which an animal.'
                ],
                correct: 1,
                explanation: 'A defining relative clause identifies which animal is meant. No commas are used. "Which eats only meat" is the correct defining clause.',
                points: 10
            }
        ],

        // ── Variant 17: History & Society ─────────────────────────────────────
        17: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'The French Revolution _____ in 1789.',
                options: ['began', 'has begun', 'begins', 'had begun'],
                correct: 0,
                explanation: 'Completed historical events with a specific date use the past simple tense: "began."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "democracy" mean?',
                options: [
                    'A government ruled by a single monarch',
                    'A system of government in which citizens vote for their representatives',
                    'A society with no laws or government',
                    'A country governed by the military'
                ],
                correct: 1,
                explanation: '"Democracy" is a political system in which people elect representatives to govern on their behalf.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'The treaty was signed _____ behalf of the entire nation.',
                options: ['on', 'in', 'at', 'by'],
                correct: 0,
                explanation: '"On behalf of" is the correct fixed expression, meaning as a representative of someone.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Industrial Revolution',
                    text: 'The Industrial Revolution, which began in Britain in the late 18th century, transformed the world. The invention of steam-powered machinery enabled mass production and drove rapid urbanisation as people moved from the countryside to work in factories. It laid the foundation for the modern economy, though working conditions were often harsh and dangerous.'
                },
                text: 'What negative aspect of the Industrial Revolution is mentioned in the passage?',
                options: [
                    'It caused a decline in agricultural output',
                    'It led to widespread unemployment',
                    'Working conditions were often harsh and dangerous',
                    'It slowed down economic development'
                ],
                correct: 2,
                explanation: 'The passage mentions that "working conditions were often harsh and dangerous" as a negative consequence.',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete using the correct passive form:',
                instruction: 'Use the past simple passive.',
                sentence: 'The Berlin Wall _____ (tear down) in 1989.',
                options: ['was torn down', 'tore down'],
                correct: ['was torn down'],
                explanation: 'Passive: was/were + past participle. "Was torn down" (passive of "tear down") is correct.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "colonisation" mean?',
                options: [
                    'The process of one country taking control of another',
                    'The establishment of a democracy',
                    'A period of economic growth',
                    'The signing of a peace treaty'
                ],
                correct: 0,
                explanation: '"Colonisation" refers to the act of a country establishing and maintaining control over another territory and its people.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Social Movements and Change',
                    text: 'Throughout history, social movements have driven significant changes in law and society. The suffragette movement won women the right to vote, while the civil rights movement in the USA challenged racial segregation. These examples show that organised collective action can overcome even deeply entrenched injustice.'
                },
                text: 'What conclusion does the author draw about social movements?',
                options: [
                    'They are only effective in democratic countries',
                    'They always lead to violence',
                    'Organised collective action can overcome injustice',
                    'They are less powerful today than in the past'
                ],
                correct: 2,
                explanation: 'The author concludes that "organised collective action can overcome even deeply entrenched injustice."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'The _____ of the Roman Empire had far-reaching consequences.',
                options: ['collapse', 'collapsing', 'collapsed', 'collapser'],
                correct: 0,
                explanation: 'A noun is needed after the article "The." "Collapse" is the correct noun form.',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct form:',
                instruction: 'Use the past perfect.',
                sentence: 'By the time the war ended, millions of people _____ (lose) their lives.',
                options: ['had lost', 'lost'],
                correct: ['had lost'],
                explanation: 'Past perfect (had + past participle) is used for an action completed before another past event.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct non-defining relative clause:',
                sentence: 'Winston Churchill, _____ led Britain during World War II, is one of the most famous British leaders.',
                options: ['who', 'which', 'whose', 'that'],
                correct: 0,
                explanation: '"Who" is used for people in relative clauses. Non-defining clauses (set off by commas) cannot use "that."',
                points: 10
            }
        ],

        // ── Variant 18: Literature & Reading ──────────────────────────────────
        18: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'This novel is based _____ a true story.',
                options: ['on', 'in', 'at', 'by'],
                correct: 0,
                explanation: '"Based on" is the correct collocation when referring to the source of a story or film.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "protagonist" mean?',
                options: [
                    'The villain of a story',
                    'The main character in a novel or play',
                    'The narrator of a story',
                    'A minor supporting character'
                ],
                correct: 1,
                explanation: 'The "protagonist" is the main character of a narrative — the central figure the story focuses on.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'George Orwell _____ many famous novels, including "1984" and "Animal Farm."',
                options: ['wrote', 'writes', 'has written', 'had written'],
                correct: 0,
                explanation: 'For a completed action by a historical figure, the past simple is used: "wrote."',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Why We Read Fiction',
                    text: 'Reading fiction does more than entertain us. Research shows that it develops empathy by allowing readers to experience the world through other people\'s eyes. It also enhances vocabulary, improves critical thinking, and can even reduce stress. Despite the dominance of screens, fiction remains a powerful and irreplaceable medium.'
                },
                text: 'According to the passage, how does reading fiction develop empathy?',
                options: [
                    'By teaching readers about different cultures',
                    'By allowing readers to experience the world through others\' eyes',
                    'By providing interesting plot twists',
                    'By improving reading speed'
                ],
                correct: 1,
                explanation: 'The passage states that fiction "develops empathy by allowing readers to experience the world through other people\'s eyes."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct passive form:',
                instruction: 'Use the present simple passive.',
                sentence: 'Shakespeare\'s plays _____ (perform) in theatres all over the world.',
                options: ['are performed', 'performed'],
                correct: ['are performed'],
                explanation: 'Present simple passive: am/is/are + past participle. Plural subject "Shakespeare\'s plays" takes "are performed."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "metaphor" mean in literature?',
                options: [
                    'A direct comparison using "like" or "as"',
                    'A figure of speech describing one thing as if it were another',
                    'A humorous exaggeration',
                    'A reference to a historical event'
                ],
                correct: 1,
                explanation: 'A "metaphor" is a figure of speech in which one thing is described as another (e.g., "Life is a journey"). Unlike a simile, it does not use "like" or "as."',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'E-books vs Printed Books',
                    text: 'The debate between e-books and printed books continues among readers and educators. E-books offer portability, instant access, and adjustable text size. However, many readers report a stronger sense of enjoyment and better comprehension when reading printed books. Studies suggest that printed text may support deeper reading and better retention of information.'
                },
                text: 'What advantage of printed books is supported by research?',
                options: [
                    'Printed books are cheaper than e-books',
                    'Printed books support deeper reading and better retention',
                    'Printed books can be accessed on mobile devices',
                    'Printed books have adjustable text size'
                ],
                correct: 1,
                explanation: 'The passage states: "Studies suggest that printed text may support deeper reading and better retention of information."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'The author\'s _____ style makes the book very accessible to young readers.',
                options: ['descriptive', 'describe', 'description', 'described'],
                correct: 0,
                explanation: 'An adjective ("descriptive") is needed before the noun "style."',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct form:',
                instruction: 'Use the past simple.',
                sentence: 'The book _____ (sell) over a million copies in its first year.',
                options: ['sold', 'has sold'],
                correct: ['sold'],
                explanation: 'Past simple is used for completed past events with a specific time reference ("in its first year").',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the sentence with correct use of the apostrophe:',
                options: [
                    'The author\'s latest novel has received excellent reviews.',
                    'The authors\' latest novel has received excellent reviews.',
                    'The author\'s latest novel has recieved excellent reviews.',
                    'The authors latest novel has received excellent reviews.'
                ],
                correct: 0,
                explanation: 'For singular possession, use apostrophe + s: "author\'s." The plural possessive would be "authors\'" only for multiple authors.',
                points: 10
            }
        ],

        // ── Variant 19: Space & Astronomy ──────────────────────────────────────
        19: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'The first human _____ on the Moon in 1969.',
                options: ['landed', 'has landed', 'land', 'was landing'],
                correct: 0,
                explanation: 'A completed past action with a specific date uses the past simple tense: "landed."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "orbit" mean?',
                options: [
                    'To land on the surface of a planet',
                    'To travel in a curved path around a larger body in space',
                    'To launch a rocket into space',
                    'To observe stars through a telescope'
                ],
                correct: 1,
                explanation: 'To "orbit" means to move in a curved path (orbit) around a celestial body such as a planet or star.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'The spacecraft travelled _____ a speed of 28,000 km/h.',
                options: ['at', 'with', 'by', 'in'],
                correct: 0,
                explanation: '"At a speed of" is the correct collocation. We travel "at" a particular speed.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Search for Life Beyond Earth',
                    text: 'For decades, scientists have been searching for signs of life beyond our planet. Mars, with its ancient river beds and traces of subsurface water, remains a key focus of research. The discovery of extremophiles — organisms that survive in extreme conditions on Earth — has expanded our understanding of where life might exist in the universe.'
                },
                text: 'Why has the discovery of extremophiles expanded the search for life?',
                options: [
                    'Because extremophiles have been found on Mars',
                    'Because it shows that life may exist in extreme conditions elsewhere',
                    'Because extremophiles can travel through space',
                    'Because they are the same as Martian organisms'
                ],
                correct: 1,
                explanation: 'Extremophiles show that life can survive in extreme conditions, suggesting life might exist in extreme environments elsewhere in the universe.',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete using the correct passive form:',
                instruction: 'Use the past simple passive.',
                sentence: 'The Hubble Space Telescope _____ (launch) in 1990.',
                options: ['was launched', 'launched'],
                correct: ['was launched'],
                explanation: 'Passive voice: was/were + past participle. Singular subject "The Hubble Space Telescope" takes "was launched."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "celestial" mean?',
                options: [
                    'Related to the sea',
                    'Belonging to or coming from the sky or space',
                    'Related to ancient history',
                    'Very small in size'
                ],
                correct: 1,
                explanation: '"Celestial" means of or relating to the sky or outer space (e.g., celestial bodies such as stars and planets).',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'Black Holes Explained',
                    text: 'A black hole is a region of space where gravity is so strong that nothing — not even light — can escape from it. Black holes form when massive stars collapse at the end of their lives. Despite being invisible, scientists can detect them by observing their effects on surrounding matter and light.'
                },
                text: 'How do scientists detect black holes if they are invisible?',
                options: [
                    'By taking photographs of them with powerful telescopes',
                    'By observing their effects on surrounding matter and light',
                    'By visiting them with spacecraft',
                    'By measuring their temperature'
                ],
                correct: 1,
                explanation: 'The passage states that "scientists can detect them by observing their effects on surrounding matter and light."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'The _____ of space travel has always fascinated humanity.',
                options: ['exploration', 'explore', 'exploratory', 'explored'],
                correct: 0,
                explanation: 'A noun is needed after the article "The." "Exploration" is the correct noun form of "explore."',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct future form:',
                instruction: 'Use the future simple for a prediction.',
                sentence: 'Scientists believe humans _____ (travel) to Mars within the next 20 years.',
                options: ['will travel', 'are travelling'],
                correct: ['will travel'],
                explanation: '"Will + infinitive" is used for predictions about the future, especially with "believe," "think," "expect."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct relative clause:',
                sentence: 'Yuri Gagarin was the first person _____ travelled into space.',
                options: ['who', 'which', 'whose', 'whom'],
                correct: 0,
                explanation: '"Who" is used in relative clauses referring to a person. "Who travelled into space" correctly identifies Gagarin.',
                points: 10
            }
        ],

        // ── Variant 20: Global Issues & Future ────────────────────────────────
        20: [
            {
                type: 'multiple-choice',
                text: 'Choose the correct verb form:',
                sentence: 'Unless we _____ action now, the consequences will be severe.',
                options: ['take', 'will take', 'took', 'had taken'],
                correct: 0,
                explanation: 'In clauses with "unless" (= if ... not), use the present simple for future conditions: "unless we take."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "inequality" mean?',
                options: [
                    'A state of fairness between all people',
                    'The condition of not being equal, especially in wealth or opportunity',
                    'A law protecting human rights',
                    'A period of economic stability'
                ],
                correct: 1,
                explanation: '"Inequality" refers to an imbalance in how resources, rights, or opportunities are distributed among people.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct preposition:',
                sentence: 'The report focuses _____ the impact of poverty on education.',
                options: ['on', 'in', 'at', 'about'],
                correct: 0,
                explanation: '"Focus on" is the correct collocation. We focus on an issue or topic.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Global Refugee Crisis',
                    text: 'The number of people displaced from their homes by conflict, persecution, and natural disasters reached a record high in recent years. Host countries face significant challenges in providing shelter, education, and healthcare to refugees. International organisations stress that solutions must address the root causes of displacement, not just the symptoms.'
                },
                text: 'What do international organisations emphasise about solving the refugee crisis?',
                options: [
                    'Host countries should accept fewer refugees',
                    'Building more refugee camps is the best solution',
                    'Solutions must address the root causes of displacement',
                    'Refugees should return home as quickly as possible'
                ],
                correct: 2,
                explanation: 'The passage states: "International organisations stress that solutions must address the root causes of displacement, not just the symptoms."',
                points: 15
            },
            {
                type: 'fill-blank',
                text: 'Complete with the correct form:',
                instruction: 'Use the present perfect.',
                sentence: 'Global temperatures _____ (rise) by approximately 1.1°C since pre-industrial times.',
                options: ['have risen', 'rose'],
                correct: ['have risen'],
                explanation: 'Present perfect is used for changes that started in the past and continue to the present, often with "since."',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'What does "sustainable development" mean?',
                options: [
                    'Economic growth that ignores environmental concerns',
                    'Development that meets current needs without compromising future generations',
                    'Building more factories in developing countries',
                    'Technology that reduces manufacturing costs'
                ],
                correct: 1,
                explanation: 'Sustainable development is defined as meeting present needs without compromising the ability of future generations to meet their own needs.',
                points: 10
            },
            {
                type: 'reading',
                passage: {
                    title: 'The Power of International Cooperation',
                    text: 'Many of the world\'s greatest challenges — climate change, pandemics, and nuclear proliferation — cannot be solved by any single nation alone. International agreements and organisations such as the United Nations provide frameworks for cooperation. However, their effectiveness depends on the political will of member states to uphold their commitments.'
                },
                text: 'What limits the effectiveness of international organisations?',
                options: [
                    'Lack of funding from wealthy nations',
                    'The absence of international agreements',
                    'The political will of member states to uphold commitments',
                    'Disagreements about language and communication'
                ],
                correct: 2,
                explanation: 'The passage states that effectiveness "depends on the political will of member states to uphold their commitments."',
                points: 15
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct word form:',
                sentence: 'Access to clean water is a fundamental human _____.',
                options: ['right', 'righteous', 'rightly', 'rightful'],
                correct: 0,
                explanation: 'A noun is needed here. "Right" (noun) means a moral or legal entitlement.',
                points: 10
            },
            {
                type: 'fill-blank',
                text: 'Complete using the correct modal:',
                instruction: 'Express a moral obligation.',
                sentence: 'Developed nations _____ (must) take greater responsibility for climate change.',
                options: ['should', 'must'],
                correct: ['should', 'must'],
                explanation: 'Both "should" (strong advice) and "must" (strong obligation) are appropriate for expressing moral duty.',
                points: 10
            },
            {
                type: 'multiple-choice',
                text: 'Choose the correct third conditional:',
                options: [
                    'If world leaders had cooperated earlier, the crisis would be less severe.',
                    'If world leaders cooperated earlier, the crisis would have been less severe.',
                    'If world leaders had cooperated earlier, the crisis would have been less severe.',
                    'If world leaders would cooperate earlier, the crisis was less severe.'
                ],
                correct: 2,
                explanation: 'Third conditional (impossible past hypothetical): if + past perfect, would have + past participle.',
                points: 10
            }
        ]

    };

    questions = allQuestions[levelId] || allQuestions[1];
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
        option.classList.toggle('selected', i === optionIndex);
    });

    tg.HapticFeedback.impactOccurred('light');
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

    prevBtn.style.visibility = currentQuestionIndex > 0 ? 'visible' : 'hidden';

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

    // Telegram MainButton mirrors the HTML Submit button on the last question
    if (isLastQuestion && hasAnswer) {
        tg.MainButton.setText('Submit & Finish');
        tg.MainButton.offClick(submitQuiz);
        tg.MainButton.onClick(submitQuiz);
        tg.MainButton.show();
    } else {
        tg.MainButton.offClick(submitQuiz);
        tg.MainButton.hide();
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

    // Haptic feedback based on percentage
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (pct >= 75) tg.HapticFeedback.notificationOccurred('success');
    else if (pct >= 50) tg.HapticFeedback.notificationOccurred('warning');
    else tg.HapticFeedback.notificationOccurred('error');

    tg.MainButton.offClick(submitQuiz);
    tg.MainButton.hide();
    tg.BackButton.hide();

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
    tg.expand();

    // BackButton navigates back to the levels page
    tg.BackButton.offClick(goBackToLevels);
    tg.BackButton.onClick(goBackToLevels);
    tg.BackButton.show();

    initQuiz();
    tg.ready();

    document.getElementById('prevBtn').addEventListener('click', previousQuestion);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('submitBtn').addEventListener('click', submitQuiz);
});

function goBackToLevels() {
    tg.BackButton.hide();
    tg.MainButton.hide();
    window.location.href = '../index.html';
}
