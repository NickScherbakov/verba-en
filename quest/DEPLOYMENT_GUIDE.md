# 🚀 Инструкция по развертыванию на GitHub Pages

## Метод 1: Через интерфейс GitHub (Рекомендуется)

### Шаг 1: Отправка кода на GitHub
```bash
cd /workspaces/verba-en
git add quest/
git add .github/workflows/pages.yml
git commit -m "Add EGE English Quest website"
git push origin main
```

### Шаг 2: Настройка GitHub Pages
1. Откройте ваш репозиторий на GitHub: https://github.com/NickScherbakov/verba-en
2. Перейдите в **Settings** (Настройки)
3. В левом меню выберите **Pages**
4. В разделе **Build and deployment**:
   - **Source**: выберите "GitHub Actions"
5. Сохраните настройки

### Шаг 3: Запуск деплоя
- GitHub Actions автоматически запустит workflow при следующем push
- Проверьте статус во вкладке **Actions**
- После успешного деплоя сайт будет доступен по адресу:
  **https://nickscherbakov.github.io/verba-en/**

---

## Метод 2: Ручная настройка

Если GitHub Actions не работает, используйте стандартный метод:

### Шаг 1: Отправка кода
```bash
git add quest/
git commit -m "Add EGE English Quest website"
git push origin main
```

### Шаг 2: Настройка в GitHub
1. Settings → Pages
2. **Source**: Deploy from a branch
3. **Branch**: main
4. **Folder**: /quest
5. Нажмите **Save**

Сайт будет доступен через несколько минут.

---

## Проверка работы

После деплоя проверьте:
- ✅ Главная страница загружается
- ✅ Все 20 уровней доступны
- ✅ Стили применяются корректно
- ✅ JavaScript работает
- ✅ Прогресс сохраняется в браузере

---

## Возможные проблемы и решения

### Проблема: 404 Not Found
**Решение**: Проверьте, что выбрана правильная папка `/quest` в настройках Pages.

### Проблема: Стили не применяются
**Решение**: Убедитесь, что пути к CSS файлам корректны (относительные пути).

### Проблема: JavaScript не работает
**Решение**: Откройте консоль браузера (F12) и проверьте ошибки.

### Проблема: GitHub Actions не запускается
**Решение**: 
1. Проверьте, что файл `.github/workflows/pages.yml` существует
2. В Settings → Actions → General включите workflows
3. В Settings → Pages выберите Source: "GitHub Actions"

---

## Тестирование перед деплоем

```bash
# Запустите локальный сервер
cd /workspaces/verba-en/quest
python3 -m http.server 8080

# Откройте в браузере
# http://localhost:8080
```

Протестируйте:
- Навигацию между страницами
- Выбор ответов
- Сохранение прогресса
- Адаптивность на разных устройствах

---

## Обновление сайта

Для обновления контента:
```bash
# Внесите изменения в файлы
# Например, измените вопросы в quest/js/quiz.js

git add quest/
git commit -m "Update quiz questions"
git push origin main

# GitHub Pages автоматически обновится
```

---

## Полезные команды Git

```bash
# Проверить статус
git status

# Добавить все изменения
git add .

# Создать коммит
git commit -m "Your message"

# Отправить на GitHub
git push origin main

# Просмотреть последние коммиты
git log --oneline -10
```

---

## 🎉 Готово!

После выполнения этих шагов ваш сайт-квест будет доступен всем пользователям интернета по адресу:

**https://nickscherbakov.github.io/verba-en/**

Поделитесь ссылкой со своими учениками или друзьями, готовящимися к ЕГЭ!
