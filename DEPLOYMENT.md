# Инструкция по развертыванию

## Развертывание на Railway

Railway предоставляет бесплатный или дешевый хостинг для приложений. Это лучший выбор для этого проекта.

### Шаг 1: Подготовка

1. **Создайте аккаунт на Railway**
   - Перейдите на [railway.app](https://railway.app)
   - Зарегистрируйтесь через GitHub

2. **Создайте репозиторий GitHub**
   - Загрузите код проекта на GitHub
   - Railway автоматически подключится к репозиторию

### Шаг 2: Развертывание на Railway

1. **Создайте новый проект**
   - Нажмите "New Project" на dashboard Railway
   - Выберите "Deploy from GitHub"
   - Выберите ваш репозиторий

2. **Добавьте MySQL базу данных**
   - Нажмите "+ New" в проекте
   - Выберите "MySQL"
   - Railway автоматически создаст БД и установит `DATABASE_URL`

3. **Добавьте переменные окружения**
   - Перейдите в Settings проекта
   - Добавьте переменные:
     ```
     TELEGRAM_BOT_TOKEN=your_bot_token_here
     ADMIN_TELEGRAM_ID=your_telegram_id_here
     MINI_APP_URL=https://your-railway-app.up.railway.app
     NODE_ENV=production
     ```

4. **Разверните приложение**
   - Railway автоматически запустит:
     ```bash
     pnpm install
     pnpm build
     pnpm start
     ```

### Шаг 3: Настройка Telegram бота

1. **Получите токен бота**
   - Откройте Telegram, найдите @BotFather
   - Используйте `/newbot` для создания нового бота
   - Скопируйте токен и добавьте в Railway переменные

2. **Установите webhook для бота**
   ```bash
   curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook \
     -H 'Content-Type: application/json' \
     -d '{"url":"https://your-railway-app.up.railway.app/api/telegram/webhook"}'
   ```

3. **Добавьте Mini App кнопку**
   - В BotFather используйте `/setdefaultadministratorights`
   - Выберите вашего бота
   - Установите права администратора

### Шаг 4: Проверка

1. **Откройте приложение**
   - Перейдите на URL вашего Railway приложения
   - Должна загрузиться главная страница

2. **Протестируйте Telegram бота**
   - Найдите вашего бота в Telegram
   - Используйте `/start` команду
   - Должна появиться кнопка "Записаться"

## Развертывание на Render

Render также предоставляет бесплатный хостинг.

### Шаг 1: Создание приложения

1. **Создайте аккаунт на Render**
   - Перейдите на [render.com](https://render.com)
   - Зарегистрируйтесь через GitHub

2. **Создайте новый Web Service**
   - Нажмите "New +" → "Web Service"
   - Выберите ваш репозиторий GitHub
   - Выберите ветку `main`

### Шаг 2: Конфигурация

1. **Установите параметры сборки**
   - Name: `nail-booking`
   - Runtime: `Node`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

2. **Добавьте переменные окружения**
   - Нажмите "Advanced" → "Add Environment Variable"
   - Добавьте все необходимые переменные (см. выше)

3. **Добавьте PostgreSQL базу данных**
   - Нажмите "Create New" → "PostgreSQL"
   - Render автоматически установит `DATABASE_URL`

### Шаг 3: Развертывание

- Нажмите "Create Web Service"
- Render автоматически начнет сборку и развертывание
- Проверьте логи в разделе "Logs"

## Развертывание на собственном сервере

### Требования

- Ubuntu 20.04 или выше
- Node.js 18+
- MySQL 8.0+
- Nginx (опционально, для reverse proxy)

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone <your-repo-url> /opt/nail-booking
   cd /opt/nail-booking
   ```

2. **Установите зависимости**
   ```bash
   pnpm install
   ```

3. **Создайте БД**
   ```bash
   mysql -u root -p < drizzle/0001_*.sql
   ```

4. **Установите переменные окружения**
   ```bash
   cp .env.example .env
   # Отредактируйте .env с вашими значениями
   ```

5. **Соберите приложение**
   ```bash
   pnpm build
   ```

6. **Запустите приложение**
   ```bash
   pnpm start
   ```

### Использование PM2 для управления процессом

1. **Установите PM2**
   ```bash
   npm install -g pm2
   ```

2. **Создайте PM2 конфигурацию**
   ```bash
   pm2 start dist/index.js --name "nail-booking"
   pm2 save
   pm2 startup
   ```

3. **Проверьте статус**
   ```bash
   pm2 status
   pm2 logs nail-booking
   ```

### Nginx конфигурация

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL сертификат (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Мониторинг и обслуживание

### Проверка логов

**Railway:**
```bash
railway logs
```

**Render:**
- Откройте dashboard → Logs

**Собственный сервер:**
```bash
pm2 logs nail-booking
```

### Обновление кода

1. **Обновите репозиторий**
   ```bash
   git pull origin main
   ```

2. **Переустановите зависимости**
   ```bash
   pnpm install
   ```

3. **Пересоберите приложение**
   ```bash
   pnpm build
   ```

4. **Перезагрузите приложение**
   - Railway: автоматически при push в GitHub
   - Render: автоматически при push в GitHub
   - PM2: `pm2 restart nail-booking`

## Решение проблем при развертывании

### Ошибка: "Cannot find module"
- Убедитесь, что `pnpm install` выполнен успешно
- Проверьте, что все зависимости в `package.json`

### Ошибка: "Database connection failed"
- Проверьте `DATABASE_URL` в переменных окружения
- Убедитесь, что БД запущена и доступна
- Проверьте firewall правила

### Ошибка: "Telegram bot not responding"
- Проверьте `TELEGRAM_BOT_TOKEN`
- Убедитесь, что webhook URL правильный
- Проверьте логи приложения

### Приложение медленное
- Увеличьте ресурсы (CPU, RAM) в Railway/Render
- Оптимизируйте запросы к БД
- Добавьте кэширование

## Масштабирование

### Увеличение производительности

1. **Добавьте Redis для кэширования**
   - Railway/Render: добавьте Redis сервис
   - Обновите код для использования Redis

2. **Оптимизируйте БД**
   - Добавьте индексы на часто используемые поля
   - Используйте connection pooling

3. **Добавьте CDN**
   - Используйте Cloudflare для статических файлов
   - Кэшируйте API ответы

## Резервное копирование

### Автоматическое резервное копирование БД

**Railway:**
- Автоматически создает резервные копии
- Доступны в разделе "Backups"

**Render:**
- Создает автоматические резервные копии
- Доступны в разделе "Backups"

**Собственный сервер:**
```bash
# Ежедневное резервное копирование
0 2 * * * mysqldump -u root -p<password> nail_booking > /backup/nail_booking_$(date +\%Y\%m\%d).sql
```

---

**Готово к развертыванию!** 🚀
