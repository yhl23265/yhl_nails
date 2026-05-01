# Развёртывание на Railway

Полное руководство по развёртыванию приложения Nail Booking на Railway.

## 📋 Требования

- GitHub аккаунт с репозиторием проекта
- Railway аккаунт (https://railway.app)
- Telegram Bot Token
- MySQL/TiDB база данных

## 🚀 Пошаговая инструкция

### Шаг 1: Подготовка репозитория

1. **Убедитесь, что проект в GitHub**
```bash
git init
git add .
git commit -m "Initial commit: Nail Booking Telegram Mini App"
git remote add origin https://github.com/YOUR_USERNAME/nail_booking_bot.git
git push -u origin main
```

2. **Создайте `.env.production` файл** (локально, не коммитьте!)
```
DATABASE_URL=mysql://user:password@host:3306/nail_booking
TELEGRAM_BOT_TOKEN=8178160076:AAFxpaASSofzo5di0afhcT7Er1yJ7YCv34I
ADMIN_TELEGRAM_ID=YOUR_TELEGRAM_ID
```

### Шаг 2: Создание проекта на Railway

1. **Перейдите на https://railway.app**
2. **Нажмите "New Project"**
3. **Выберите "Deploy from GitHub"**
4. **Авторизуйте GitHub и выберите репозиторий `nail_booking_bot`**

### Шаг 3: Добавление MySQL базы данных

1. **В Railway проекте нажмите "+ Add"**
2. **Выберите "MySQL"**
3. **Railway автоматически создаст базу и добавит `DATABASE_URL`**

### Шаг 4: Настройка переменных окружения

В Railway проекте перейдите в **Variables** и добавьте:

| Переменная | Значение | Описание |
|-----------|---------|---------|
| `TELEGRAM_BOT_TOKEN` | `8178160076:AAFxpaASSofzo5di0afhcT7Er1yJ7YCv34I` | Токен Telegram бота |
| `ADMIN_TELEGRAM_ID` | `123456789` | Ваш Telegram ID (для уведомлений) |
| `MINI_APP_URL` | `https://your-app.railway.app` | URL вашего приложения |
| `NODE_ENV` | `production` | Окружение |

**Как найти свой Telegram ID:**
1. Напишите боту @userinfobot в Telegram
2. Скопируйте ваш ID

### Шаг 5: Настройка Telegram Webhook

После развёртывания приложения:

1. **Получите URL вашего приложения** из Railway (например: `https://nail-booking-prod.railway.app`)

2. **Установите webhook для бота:**
```bash
curl -X POST https://api.telegram.org/bot8178160076:AAFxpaASSofzo5di0afhcT7Er1yJ7YCv34I/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://nail-booking-prod.railway.app/api/telegram/webhook"}'
```

3. **Проверьте webhook:**
```bash
curl https://api.telegram.org/bot8178160076:AAFxpaASSofzo5di0afhcT7Er1yJ7YCv34I/getWebhookInfo
```

Должно вернуть:
```json
{
  "ok": true,
  "result": {
    "url": "https://nail-booking-prod.railway.app/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### Шаг 6: Запуск приложения

1. **Railway автоматически развернёт приложение** после коммита
2. **Проверьте логи** в Railway для ошибок
3. **Откройте приложение** по ссылке из Railway

### Шаг 7: Инициализация базы данных

1. **Перейдите в Admin Panel** вашего приложения
2. **Создайте расписание** (рабочие дни и часы)
3. **Добавьте услуги** (маникюр, гель-лак и т.д.)

## 🔧 Настройка Telegram Mini App

1. **Откройте BotFather** в Telegram (@BotFather)

2. **Выберите вашего бота и нажмите "Edit Bot"**

3. **Выберите "Edit Inline Button"**

4. **Установите текст и URL:**
   - Text: `Записаться на маникюр`
   - URL: `https://your-app.railway.app`

5. **Сохраните изменения**

Теперь при нажатии на кнопку в боте откроется ваше приложение в Mini App.

## 📊 Мониторинг

### Логи приложения
- Откройте Railway проект
- Перейдите в **Logs**
- Смотрите логи сервера в реальном времени

### Проверка здоровья приложения
```bash
curl https://your-app.railway.app/health
```

### Проверка базы данных
- В Railway перейдите в MySQL сервис
- Используйте встроенный SQL редактор для проверки таблиц

## 🐛 Решение проблем

### Ошибка: "Database connection failed"
- Проверьте `DATABASE_URL` в переменных окружения
- Убедитесь, что MySQL сервис запущен
- Проверьте логи MySQL

### Ошибка: "Webhook failed"
- Проверьте URL webhook'а
- Убедитесь, что `TELEGRAM_BOT_TOKEN` правильный
- Проверьте логи приложения

### Приложение медленное
- Увеличьте ресурсы в Railway (CPU, RAM)
- Проверьте логи для медленных запросов
- Оптимизируйте запросы к БД

### Напоминания не отправляются
- Проверьте, что `ADMIN_TELEGRAM_ID` установлен
- Проверьте логи для ошибок отправки
- Убедитесь, что бот может отправлять сообщения

## 📈 Масштабирование

### Увеличение ресурсов
1. В Railway перейдите в **Settings**
2. Увеличьте **Memory** и **CPU**
3. Railway перезагрузит приложение

### Резервная копия базы данных
1. В Railway перейдите в MySQL сервис
2. Нажмите **Backup**
3. Railway создаст резервную копию

## 🔒 Безопасность

### Рекомендации
1. **Никогда не коммитьте `.env` файлы**
2. **Используйте Railway Variables для всех секретов**
3. **Регулярно обновляйте зависимости** (`pnpm update`)
4. **Включите SSL** (Railway делает это автоматически)
5. **Ограничьте доступ к админ-панели** (используйте OAuth)

### Смена токена бота
Если токен скомпрометирован:
1. Создайте новый бот через BotFather
2. Обновите `TELEGRAM_BOT_TOKEN` в Railway
3. Установите новый webhook

## 📞 Поддержка

- **Railway документация:** https://docs.railway.app
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Проблемы:** создайте Issue в репозитории

---

**Приложение готово к использованию!** 🎉

После развёртывания:
1. Откройте бота в Telegram
2. Нажмите кнопку "Записаться на маникюр"
3. Начните принимать записи от клиентов
