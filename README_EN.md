# Nail Booking Telegram Mini App

A full-featured online appointment booking application for nail technicians through Telegram Mini App. Includes booking system, schedule management, automated reminders, and admin panel.

## 🎨 Features

### For Clients
- **Simple Booking** — multi-step process for selecting service, date, and time
- **View Bookings** — history of all bookings and upcoming appointments
- **Cancel Bookings** — ability to cancel bookings at any time
- **Design Option** — add nail design to any service (+5 BYN)
- **Beautiful Interface** — calm design with pastel gradients

### For Master (Administrator)
- **Admin Panel** — manage all bookings through calendar
- **Service Management** — add, edit, and delete services
- **Schedule** — configure working days and hours, including breaks
- **Statistics** — revenue and booking counts for period
- **Telegram Commands** — quick access to information via bot
- **Notifications** — receive notifications about new bookings and cancellations

### Automation
- **Client Reminders** — 24 hours and 2 hours before appointment
- **Master Notifications** — new bookings, cancellations, and daily schedule
- **Slot Generation** — automatic creation of available time slots based on service duration

## 📋 Services

1. **Combined Manicure** — 2 hours / 10 BYN
2. **Rest Nails** — 3 hours / 20 BYN
3. **Manicure + Gel Coating** — 5 hours / 30 BYN
4. **Nail Extension** — 6 hours / 40 BYN
5. **Nail Design** (option) — +5 BYN

## 🚀 Quick Start

### Requirements
- Node.js 18+
- MySQL/TiDB database
- Telegram Bot Token
- Manus OAuth application

### Local Installation

1. **Clone the repository**
```bash
cd /home/ubuntu/nail_booking_bot
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Create .env file**
```bash
# Environment variables are automatically loaded from the system
```

4. **Apply database migrations**
```bash
# Migrations are applied automatically on first run
```

5. **Run the application**
```bash
pnpm dev
```

Application will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

**Required:**
- `DATABASE_URL` — MySQL/TiDB connection string
- `TELEGRAM_BOT_TOKEN` — Telegram bot token
- `ADMIN_TELEGRAM_ID` — Admin's Telegram ID (for notifications)
- `MINI_APP_URL` — Application URL for Telegram Mini App

**Automatic (system):**
- `JWT_SECRET` — Session signing secret
- `VITE_APP_ID` — Manus OAuth app ID
- `OAUTH_SERVER_URL` — OAuth server URL
- `VITE_OAUTH_PORTAL_URL` — OAuth portal URL

### Working Schedule

Schedule is configured through admin panel and saved in database as JSON:

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

Where 0 = Monday, ..., 6 = Sunday

## 📱 Telegram Bot

### Commands

- `/start` — start, open Mini App
- `/today` — show today's bookings
- `/week` — show week's bookings
- `/clients` — list of clients
- `/settings` — settings information

### Bot Setup

1. **Create bot via BotFather**
   - Open Telegram, find @BotFather
   - Use `/newbot` to create new bot
   - Copy the token

2. **Set webhook**
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://your-app-url.com/api/telegram/webhook"}'
```

3. **Add Mini App button**
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setMyDefaultAdministratorRights \
  -H 'Content-Type: application/json' \
  -d '{"is_anonymous":false}'
```

## 🗄️ Database Schema

### Tables

**users** — application users
- id, openId, name, email, phone, role, createdAt, updatedAt

**services** — available services
- id, name, description, durationMinutes, priceBeyn, isActive

**bookings** — client appointments
- id, clientId, serviceId, startTime, endTime, hasNailDesign, totalPriceBeyn, status, clientNotes

**scheduleSettings** — working schedule
- id, weekSchedule (JSON), breakStartTime, breakEndTime

**reminders** — client reminders
- id, bookingId, reminderType, sentAt, status

**telegramUsers** — user-to-Telegram mapping
- id, userId, telegramUserId, telegramUsername

## 🧪 Testing

### Run Tests
```bash
pnpm test
```

### Test Scenarios
- Create booking
- Cancel booking
- Access control verification (admin vs user)
- Time slot generation
- Price calculation with options

## 📦 Build and Deploy

### Local Build
```bash
pnpm build
```

### Docker

**Docker Compose for local run:**
```bash
docker-compose up
```

### Deploy on Railway

1. **Create Railway account**

2. **Connect GitHub repository**
   - Click "New Project" → "Deploy from GitHub"
   - Select repository

3. **Add environment variables**
   - `DATABASE_URL` — MySQL connection string
   - `TELEGRAM_BOT_TOKEN` — bot token
   - `ADMIN_TELEGRAM_ID` — admin ID
   - `MINI_APP_URL` — Railway app URL

4. **Deploy**
   - Railway automatically runs `pnpm build && pnpm start`

### Deploy on Render

1. **Create Render account**

2. **Create Web Service**
   - Select GitHub repository
   - Runtime: Node
   - Build: `pnpm install && pnpm build`
   - Start: `pnpm start`

3. **Add environment variables**

4. **Deploy**

## 🎨 Design

Application uses calm, elegant design:

- **Color Palette** — pastel gradients (lavender, blush pink, mint)
- **Typography** — Playfair Display for headings, Poppins for text
- **Geometric Accents** — thin lines and corners for structure
- **Spacing** — generous use of whitespace
- **Shadows** — soft shadows for depth

## 📊 API

### Public Procedures

**services.list** — get all services
```typescript
const services = await trpc.services.list.useQuery();
```

**schedule.get** — get schedule
```typescript
const schedule = await trpc.schedule.get.useQuery();
```

### Protected Procedures (require authentication)

**bookings.create** — create booking
```typescript
await trpc.bookings.create.useMutation({
  serviceId: 1,
  startTime: new Date(),
  endTime: new Date(),
  hasNailDesign: false,
});
```

**bookings.myBookings** — get my bookings
```typescript
const bookings = await trpc.bookings.myBookings.useQuery();
```

**bookings.cancel** — cancel booking
```typescript
await trpc.bookings.cancel.useMutation({ id: 1 });
```

### Admin Procedures (role='admin' only)

**services.create** — create service
**services.update** — update service
**bookings.allBookings** — get all bookings
**schedule.update** — update schedule
**stats.summary** — get statistics

## 🔒 Security

- **OAuth Authentication** — via Manus
- **Role-based Access** — admin and user roles
- **API Protection** — all procedures check permissions
- **HTTPS** — required for production
- **Environment Variables** — all secrets in env

## 🐛 Troubleshooting

### Error: "Table doesn't exist"
Apply database migrations through admin panel or execute SQL manually.

### Error: "Bot token not configured"
Ensure `TELEGRAM_BOT_TOKEN` is set in environment variables.

### Error: "Database not available"
Check `DATABASE_URL` and ensure database is accessible.

### Error: "Forbidden" accessing admin features
Ensure user has role='admin' in database.

### Application is slow
- Increase resources (CPU, RAM) in Railway/Render
- Optimize database queries
- Add caching

## 📝 License

MIT

## 👨‍💻 Development

### Project Structure

```
nail_booking_bot/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # Pages (Home, Booking, MyBookings)
│   │   ├── components/ # UI components
│   │   └── lib/        # Utilities (tRPC client)
│   └── index.html
├── server/              # Node.js backend
│   ├── routers.ts      # tRPC procedures
│   ├── db.ts           # Query helpers
│   ├── telegram.ts     # Telegram integration
│   └── _core/          # Core (OAuth, context)
├── drizzle/            # Database migrations
├── shared/             # Common constants
└── package.json
```

### Adding New Feature

1. Update schema in `drizzle/schema.ts`
2. Create migration: `pnpm drizzle-kit generate`
3. Add query helpers in `server/db.ts`
4. Add procedures in `server/routers.ts`
5. Create UI component in `client/src/pages/`
6. Add tests in `server/*.test.ts`
7. Run tests: `pnpm test`

## 📞 Support

For questions and issues, create Issues in the repository.

---

**Created with ❤️ for nail technicians**
