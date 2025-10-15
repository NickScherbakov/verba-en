# EGE English Quest 2026 🎓

An interactive, gamified learning platform for preparing for the Russian Unified State Exam (ЕГЭ) in English. Based on official materials by M.V. Verbitskaya.

## 🌟 Features

- **20 Interactive Variants**: Complete practice sets covering all EGE exam sections
- **Quest-Based Learning**: Gamified experience with levels, badges, and achievements
- **Multiple Question Types**: 
  - Multiple choice questions
  - Fill-in-the-blank exercises
  - Reading comprehension
  - Grammar and vocabulary practice
- **Progress Tracking**: Automatic save of your progress using browser storage
- **Achievement System**: Earn badges as you complete more levels
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Theme**: Modern, eye-friendly interface

## 🚀 Live Demo

Visit the live site: [https://nickscherbakov.github.io/verba-en/quest/](https://nickscherbakov.github.io/verba-en/quest/)

## 📖 How to Use

1. **Start**: Open the main page and view all 20 variants
2. **Select Level**: Click on any unlocked level to start
3. **Complete Questions**: Answer all questions in the variant
4. **Submit**: Review your score and see detailed results
5. **Progress**: Complete levels to unlock new ones and earn badges
6. **Track**: Monitor your overall progress and statistics

## 🏆 Badge System

- 🌱 **Beginner**: Complete 1+ levels
- 🔥 **Intermediate**: Complete 5+ levels  
- 💎 **Advanced**: Complete 12+ levels
- 👑 **Expert**: Complete all 20 levels

## 🛠️ Technical Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser localStorage API
- **Styling**: Custom CSS with CSS Variables
- **Fonts**: Google Fonts (Inter)
- **No Framework Required**: Lightweight and fast

## 📁 Project Structure

```
quest/
├── index.html              # Main landing page
├── css/
│   ├── style.css          # Main styles
│   └── level.css          # Level/quiz styles
├── js/
│   ├── main.js            # Main application logic
│   ├── storage.js         # Progress storage management
│   └── quiz.js            # Quiz/level logic
├── levels/
│   ├── level-1.html       # Level 1
│   ├── level-2.html       # Level 2
│   └── ...                # Levels 3-20
└── data/
    └── (questions data)
```

## 🚀 Deployment to GitHub Pages

### Option 1: Automatic (via GitHub Interface)

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select `main` branch
4. Select `/quest` folder (or root if quest is in root)
5. Click **Save**
6. Your site will be available at: `https://yourusername.github.io/repository-name/quest/`

### Option 2: Manual Setup

1. Ensure your `quest` folder is in the repository
2. Create a `.github/workflows/pages.yml` file (if needed)
3. Push changes to GitHub
4. GitHub Pages will automatically deploy

### GitHub Actions Configuration (Optional)

Create `.github/workflows/pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./quest
```

## 🔧 Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/NickScherbakov/verba-en.git
cd verba-en/quest
```

2. **Serve locally** (choose one method):

**Python**:
```bash
python -m http.server 8000
```

**Node.js (http-server)**:
```bash
npx http-server -p 8000
```

**PHP**:
```bash
php -S localhost:8000
```

3. **Open in browser**: `http://localhost:8000`

## 📝 Customization

### Adding New Questions

Edit `quest/js/quiz.js` and modify the `loadQuestions()` function to add or change questions:

```javascript
questions = [
    {
        type: 'multiple-choice',
        text: 'Your question here?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 1, // Index of correct answer (0-based)
        explanation: 'Explanation of the correct answer',
        points: 10
    },
    // Add more questions...
];
```

### Changing Colors

Edit `quest/css/style.css` and modify CSS variables in `:root`:

```css
:root {
    --primary-color: #4f46e5;
    --background: #0f172a;
    /* ... other colors */
}
```

### Modifying Scoring

Edit point values in `quiz.js` or adjust the badge thresholds in `storage.js`.

## 📊 Browser Storage

The app uses `localStorage` to save:
- Completed levels
- Best scores for each level
- Total score
- Current level
- Earned badges

To reset progress, click "Reset Progress" in the footer.

## 🌐 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support
- IE11: ❌ Not supported

## 📄 License

Based on official EGE materials by M.V. Verbitskaya. 

Educational use only. All rights to the original content belong to the respective copyright holders.

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Official EGE materials by M.V. Verbitskaya
- Google Fonts for Inter typeface
- All contributors and testers

---

**Good luck with your EGE 2026 preparation! 🎯**
