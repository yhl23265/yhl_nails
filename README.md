# Nail Booking Telegram Mini App

Полнофункциональное приложение для онлайн-записи к мастеру маникюра через Telegram Mini App. Приложение включает систему бронирования, управление расписанием, автоматические напоминания и админ-панель.

## 🎨 Особенности

### Для клиентов
- **Простая запись** — многошаговый процесс выбора услуги, даты и времени
- **Просмотр записей** — история всех бронирований и предстоящих визитов
- **Отмена записей** — возможность отменить запись в любой момент
- **Опция дизайна** — добавление дизайна ногтей к любой услуге (+5 BYN)
- **Красивый интерфейс** — спокойный дизайн с пастельными градиентами

### Для мастера (администратора)
- **Админ-панель** — управление всеми записями через календарь
- **Управление услугами** — добавление, редактирование и удаление услуг
- **Расписание** — настройка рабочих дней и часов, включая перерывы
- **Статистика** — доход и количество записей за период
- **Telegram команды** — быстрый доступ к информации через бота
- **Уведомления** — получение уведомлений о новых записях и отменах

### Автоматизация
- **Напоминания клиентам** — за 24 часа и за 2 часа до визита
- **Уведомления мастеру** — о новых записях, отменах и ежедневном расписании
- **Генерация слотов** — автоматическое создание доступных времени на основе длительности услуги

## 📋 Услуги

1. **Комбинированный маникюр** — 2 часа / 10 BYN
2. **Пусть ногти отдохнут** — 3 часа / 20 BYN
3. **Маникюр и покрытие гель-лаком** — 5 часов / 30 BYN
4. **Наращивание ногтей** — 6 часов / 40 BYN
5. **Дизайн ногтей** (опция) — +5 BYN

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- MySQL/TiDB база данных
- Telegram Bot Token
- Manus OAuth приложение

### Локальная установка

1. **Клонируйте репозиторий**
```bash
cd /home/ubuntu/nail_booking_bot
```

2. **Установите зависимости**
```bash
pnpm install
```

3. **Создайте файл .env**
```bash
# Скопируйте переменные окружения из системы
# Они будут автоматически загружены при запуске
```

4. **Примените миграции БД**
```bash
# Миграции применяются автоматически при первом запуске
# Если нужно вручную:
pnpm drizzle-kit generate
# Затем примените SQL из drizzle/0001_*.sql через админ-панель
```

5. **Запустите приложение**
```bash
pnpm dev
```

Приложение будет доступно на `http://localhost:3000`

## 🔧 Конфигурация

### Переменные окружения

**Обязательные:**
- `DATABASE_URL` — строка подключения к MySQL/TiDB
- `TELEGRAM_BOT_TOKEN` — токен Telegram бота
- `ADMIN_TELEGRAM_ID` — Telegram ID администратора (для уведомлений)
- `MINI_APP_URL` — URL приложения для Telegram Mini App

**Автоматические (система):**
- `JWT_SECRET` — секрет для подписи сессий
- `VITE_APP_ID` — ID Manus OAuth приложения
- `OAUTH_SERVER_URL` — URL OAuth сервера
- `VITE_OAUTH_PORTAL_URL` — URL портала OAuth

### Расписание работы

Расписание настраивается через админ-панель и сохраняется в БД в формате JSON:

```json
{
  "0": { "enabled": true, "startTime": "09:00", "endTime": "18:00" },
  "1": { "enabled": true, "startTime": "09:00", "endTime": "18:00" },
  "2": { "enabled": true, "startTime": "09:00", "endTime": "18:00" },
  "3": { "enabled": true, "startTime": "09:00", "endTime": "18:00" },
  "4": { "enabled": true, "startTime": "09:00", "endTime": "18:00" },
  "5": { "enabled": true, "startTime": "10:00", "endTime": "16:00" },
  "6": { "enabled": false, "startTime": "00:00", "endTime": "00:00" }
}
```

Где 0 = Понедельник, ..., 6 = Воскресенье

## 📱 Telegram Bot

### Команды

- `/start` — начать, открыть Mini App
- `/today` — показать записи на сегодня
- `/week` — показать записи на неделю
- `/clients` — список клиентов
- `/settings` — информация о настройках

### Установка бота

1. **Создайте бота через BotFather**
   - Откройте Telegram, найдите @BotFather
   - Используйте `/newbot` для создания нового бота
   - Скопируйте токен

2. **Установите webhook**
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://your-app-url.com/api/telegram/webhook"}'
```

3. **Добавьте Mini App кнопку**
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setMyDefaultAdministratorRights \
  -H 'Content-Type: application/json' \
  -d '{"is_anonymous":false}'
```

## 🗄️ Структура БД

### Таблицы

**users** — пользователи приложения
- id, openId, name, email, phone, role, createdAt, updatedAt

**services** — доступные услуги
- id, name, description, durationMinutes, priceBeyn, isActive

**bookings** — записи клиентов
- id, clientId, serviceId, startTime, endTime, hasNailDesign, totalPriceBeyn, status, clientNotes

**scheduleSettings** — расписание работы
- id, weekSchedule (JSON), breakStartTime, breakEndTime

**reminders** — напоминания клиентам
- id, bookingId, reminderType, sentAt, status

**telegramUsers** — связь пользователей с Telegram ID
- id, userId, telegramUserId, telegramUsername

## 🧪 Тестирование

### Запуск тестов
```bash
pnpm test
```

### Тестовые сценарии
- Создание записи
- Отмена записи
- Проверка прав доступа (admin vs user)
- Генерация слотов времени
- Расчет стоимости с опциями

## 📦 Сборка и деплой

### Локальная сборка
```bash
pnpm build
```

### Docker

**Dockerfile** уже включен в проект. Для локального запуска:

```bash
docker-compose up
```

### Деплой на Railway

1. **Создайте аккаунт на Railway.app**

2. **Подключите репозиторий**
   - Нажмите "New Project" → "Deploy from GitHub"
   - Выберите репозиторий

3. **Добавьте переменные окружения**
   - `DATABASE_URL` — строка подключения MySQL
   - `TELEGRAM_BOT_TOKEN` — токен бота
   - `ADMIN_TELEGRAM_ID` — ID администратора
   - `MINI_APP_URL` — URL приложения на Railway

4. **Разверните**
   - Railway автоматически запустит `pnpm build && pnpm start`

### Деплой на Render

1. **Создайте аккаунт на Render.com**

2. **Создайте новый Web Service**
   - Выберите репозиторий GitHub
   - Runtime: Node
   - Build command: `pnpm install && pnpm build`
   - Start command: `pnpm start`

3. **Добавьте переменные окружения**

4. **Разверните**

## 🎨 Дизайн

Приложение использует спокойный, элегантный дизайн:

- **Цветовая палитра** — пастельные градиенты (лаванда, розовый, мятный)
- **Типография** — Playfair Display для заголовков, Poppins для текста
- **Геометрические акценты** — тонкие линии и уголки для структуры
- **Пространство** — щедрое использование пустого пространства
- **Тени** — мягкие тени для глубины

## 📊 API

### Публичные процедуры

**services.list** — получить все услуги
```typescript
const services = await trpc.services.list.useQuery();
```

**schedule.get** — получить расписание
```typescript
const schedule = await trpc.schedule.get.useQuery();
```

### Защищенные процедуры (требуют аутентификации)

**bookings.create** — создать запись
```typescript
await trpc.bookings.create.useMutation({
  serviceId: 1,
  startTime: new Date(),
  endTime: new Date(),
  hasNailDesign: false,
});
```

**bookings.myBookings** — получить мои записи
```typescript
const bookings = await trpc.bookings.myBookings.useQuery();
```

**bookings.cancel** — отменить запись
```typescript
await trpc.bookings.cancel.useMutation({ id: 1 });
```

### Админ-процедуры (только для role='admin')

**services.create** — создать услугу
**services.update** — обновить услугу
**bookings.allBookings** — получить все записи
**schedule.update** — обновить расписание
**stats.summary** — получить статистику

## 🔒 Безопасность

- **OAuth аутентификация** — через Manus
- **Роли доступа** — admin и user
- **Защита API** — все процедуры проверяют права
- **HTTPS** — обязателен для production
- **Переменные окружения** — все секреты в env

## 🐛 Решение проблем

### Ошибка: "Table doesn't exist"
Примените миграции БД через админ-панель или выполните SQL вручную.

### Ошибка: "Bot token not configured"
Убедитесь, что `TELEGRAM_BOT_TOKEN` установлен в переменных окружения.

### Ошибка: "Database not available"
Проверьте `DATABASE_URL` и убедитесь, что БД доступна.

### Ошибка: "Forbidden" при попытке доступа к админ-функциям
Убедитесь, что ваш пользователь имеет role='admin' в БД.

## 📝 Лицензия

MIT

## 👨‍💻 Разработка

### Структура проекта

```
nail_booking_bot/
├── client/              # React фронтенд
│   ├── src/
│   │   ├── pages/      # Страницы (Home, Booking, MyBookings)
│   │   ├── components/ # UI компоненты
│   │   └── lib/        # Утилиты (tRPC клиент)
│   └── index.html
├── server/              # Node.js бэкенд
│   ├── routers.ts      # tRPC процедуры
│   ├── db.ts           # Query helpers
│   ├── telegram.ts     # Telegram интеграция
│   └── _core/          # Ядро (OAuth, контекст)
├── drizzle/            # Миграции БД
├── shared/             # Общие константы
└── package.json
```

### Добавление новой функции

1. Обновите схему в `drizzle/schema.ts`
2. Создайте миграцию: `pnpm drizzle-kit generate`
3. Добавьте query helpers в `server/db.ts`
4. Добавьте процедуры в `server/routers.ts`
5. Создайте UI компонент в `client/src/pages/`
6. Добавьте тесты в `server/*.test.ts`
7. Запустите тесты: `pnpm test`

## 📞 Поддержка

Для вопросов и проблем создавайте Issues в репозитории.

---

**Создано с ❤️ для мастеров маникюра**
