# Nail Booking Bot — Project TODO

## Phase 1: Database Schema & Backend Setup
- [x] Define database schema (services, bookings, clients, schedule_settings, reminders)
- [x] Create and apply database migrations
- [x] Implement database query helpers in server/db.ts
- [x] Add tRPC procedures for services management
- [x] Add tRPC procedures for bookings management
- [x] Add tRPC procedures for schedule management
- [x] Add tRPC procedures for statistics/admin queries
- [x] Write vitest tests for backend procedures

## Phase 2: Frontend — Booking Flow (Mini App)
- [x] Set up Telegram Mini App integration (WebApp API)
- [x] Design and implement Home page with service selection
- [x] Implement date picker component
- [x] Implement time slot selector (auto-generated based on service duration)
- [x] Implement booking confirmation step
- [x] Add booking success notification
- [x] Implement client's booking history view
- [x] Implement booking cancellation UI
- [ ] Write vitest tests for booking flow components

## Phase 3: Frontend — Admin Panel
- [ ] Create admin-only layout with role-based access
- [ ] Implement calendar view of all bookings
- [ ] Implement client list with visit history
- [ ] Implement statistics dashboard (revenue, booking counts)
- [ ] Implement service management UI (add, edit, delete)
- [ ] Implement schedule configuration UI
- [ ] Implement booking cancellation/rescheduling controls
- [ ] Write vitest tests for admin panel components

## Phase 4: Telegram Bot Integration
- [x] Set up Telegram Bot with webhook
- [x] Implement /start command with Mini App button
- [x] Implement /today command (admin only)
- [x] Implement /week command (admin only)
- [x] Implement /clients command (admin only)
- [x] Implement /settings command (admin only)
- [x] Implement new booking notification to master
- [x] Implement booking cancellation notification to master
- [x] Implement daily schedule summary to master

## Phase 5: Automated Reminders
- [ ] Set up reminder scheduler (24 hours before appointment)
- [ ] Set up reminder scheduler (2 hours before appointment)
- [ ] Implement reminder message sending to clients
- [ ] Test reminder delivery

## Phase 6: Styling & UX Polish
- [x] Apply pastel gradient background (lavender, blush pink, mint)
- [x] Implement elegant serif typography for headings
- [x] Implement minimalist sans-serif for secondary text
- [x] Add delicate geometric accents (corner brackets, vertical lines)
- [x] Ensure responsive design for Telegram Mini App
- [x] Test dark/light theme compatibility
- [x] Polish micro-interactions and animations

## Phase 7: Documentation & Deployment
- [x] Write comprehensive README.md (Russian + English)
- [x] Create Dockerfile and docker-compose.yml
- [x] Write Railway deployment guide
- [x] Document environment variables
- [x] Create setup instructions for Telegram Bot
- [ ] Test end-to-end flow locally

## Phase 8: Testing & Final Review
- [ ] Test booking flow end-to-end
- [ ] Test admin panel functionality
- [ ] Test Telegram Bot commands
- [ ] Test reminder notifications
- [ ] Test role-based access control
- [ ] Verify all error handling
- [ ] Performance testing

## Phase 9: Final Delivery
- [ ] Create final checkpoint
- [ ] Prepare project for deployment
- [ ] Deliver to user with instructions
