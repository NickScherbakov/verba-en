# EGE English Quest 2026 🎓

Full documentation for the interactive EGE English preparation quest website.

> The live site is at: [https://nickscherbakov.github.io/verba-en/quest/](https://nickscherbakov.github.io/verba-en/quest/)

---

## Features

- **20 Interactive Variants (Levels)** — complete practice sets covering all EGE exam sections
- **Quest-Based Learning** — gamified experience with levels, badges, and achievements
- **Multiple Question Types** — multiple choice, fill-in-the-blank, reading comprehension, grammar and vocabulary
- **Progress Tracking** — automatic save using browser localStorage
- **Achievement System** — earn badges as you complete more levels
- **Responsive Design** — works on desktop, tablet, and mobile
- **Dark Theme** — modern, eye-friendly interface

---

## How to use

1. **Start** — open the main page and view all 20 variants
2. **Select Level** — click any unlocked level to start
3. **Complete Questions** — answer all questions in the variant
4. **Submit** — review your score and detailed results
5. **Progress** — complete levels to unlock new ones and earn badges
6. **Track** — monitor overall progress and statistics

---

## Badge system

| Badge | Requirement |
|---|---|
| 🌱 Beginner | Complete 1+ levels |
| 🔥 Intermediate | Complete 5+ levels |
| 💎 Advanced | Complete 12+ levels |
| 👑 Expert | Complete all 20 levels |

---

## Technical stack

- **Frontend**: Pure HTML5, CSS3, JavaScript ES6+
- **Storage**: Browser `localStorage`
- **Fonts**: Google Fonts (Inter)
- **No framework** — lightweight and fast

---

## Project structure

```
quest/
├── index.html          # Main landing page
├── css/
│   ├── style.css       # Main styles
│   └── level.css       # Level/quiz styles
├── js/
│   ├── main.js         # Main application logic
│   ├── storage.js      # Progress storage management
│   └── quiz.js         # Quiz/level logic
└── levels/
    ├── level-1.html    # Level 1
    ├── level-2.html    # Level 2
    └── ...             # Levels 3–20
```

---

## Local development

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000
```

Open `http://localhost:8000` in your browser.

---

## Deployment to GitHub Pages

1. Go to **Settings → Pages** in your repository
2. Under "Source", select `main` branch and `/quest` folder (or root)
3. Click **Save**
4. Site will be live at `https://<username>.github.io/<repo>/quest/`

---

## Customization

### Adding questions

Edit `quest/js/quiz.js` and modify the `loadQuestions()` function:

```javascript
questions = [
    {
        type: 'multiple-choice',
        text: 'Your question here?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 1,       // 0-based index
        explanation: 'Explanation of the correct answer',
        points: 10
    },
];
```

### Changing colors

Edit CSS variables in `quest/css/style.css`:

```css
:root {
    --primary-color: #4f46e5;
    --background: #0f172a;
}
```

---

## Browser storage

The app saves to `localStorage`:
- Completed levels
- Best scores per level
- Total score and earned badges

To reset progress, click **"Reset Progress"** in the footer.

---

## Browser support

| Browser | Status |
|---|---|
| Chrome / Edge | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| IE 11 | ❌ Not supported |

---

## License

Based on official EGE materials by M.V. Verbitskaya.
Educational use only. All rights to the original content belong to the respective copyright holders.
