import * as db from "./db";
import { sendReminderToClient, sendDailySummary } from "./telegram";

/**
 * Check for upcoming appointments and send reminders
 * Should be called periodically (every 30 minutes)
 */
export async function checkAndSendReminders() {
  try {
    const now = new Date();
    const bookings = await db.getAllBookings();
    const pendingReminders = await db.getPendingReminders();

    for (const booking of bookings) {
      if (booking.status !== "confirmed") continue;

      const startTime = new Date(booking.startTime);
      const timeDiff = startTime.getTime() - now.getTime();
      const hoursUntil = timeDiff / (1000 * 60 * 60);

      // Check for 24-hour reminder
      if (hoursUntil > 23.5 && hoursUntil < 24.5) {
        const hasReminder = pendingReminders.some((r) => r.bookingId === booking.id && r.reminderType === "24_hours");

        if (!hasReminder) {
          const service = await db.getServiceById(booking.serviceId);
          const telegramUser = await db.getTelegramUser(booking.clientId);

          if (telegramUser && service) {
            const sent = await sendReminderToClient(booking, service, telegramUser.telegramUserId, 24);
            if (sent) {
              await db.createReminder({
                bookingId: booking.id,
                reminderType: "24_hours",
              });
            }
          }
        }
      }

      // Check for 2-hour reminder
      if (hoursUntil > 1.5 && hoursUntil < 2.5) {
        const hasReminder = pendingReminders.some((r) => r.bookingId === booking.id && r.reminderType === "2_hours");

        if (!hasReminder) {
          const service = await db.getServiceById(booking.serviceId);
          const telegramUser = await db.getTelegramUser(booking.clientId);

          if (telegramUser && service) {
            const sent = await sendReminderToClient(booking, service, telegramUser.telegramUserId, 2);
            if (sent) {
              await db.createReminder({
                bookingId: booking.id,
                reminderType: "2_hours",
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("[Reminders] Error checking reminders:", error);
  }
}

/**
 * Send daily schedule summary to admin
 * Should be called once per day in the morning
 */
export async function sendDailyScheduleSummary() {
  try {
    await sendDailySummary();
  } catch (error) {
    console.error("[Reminders] Error sending daily summary:", error);
  }
}

/**
 * Start reminder scheduler
 * Runs every 30 minutes to check for reminders
 * Runs daily at 8:00 AM to send schedule summary
 */
export function startReminderScheduler() {
  // Check reminders every 30 minutes
  setInterval(() => {
    checkAndSendReminders();
  }, 30 * 60 * 1000);

  // Send daily summary at 8:00 AM
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const timeUntilNextRun = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    sendDailyScheduleSummary();
    // Then repeat daily
    setInterval(() => {
      sendDailyScheduleSummary();
    }, 24 * 60 * 60 * 1000);
  }, timeUntilNextRun);

  console.log("[Reminders] Scheduler started");
}
