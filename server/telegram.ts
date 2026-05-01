import axios from "axios";
import * as db from "./db";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const MINI_APP_URL = process.env.MINI_APP_URL || "https://example.com";

if (!TELEGRAM_BOT_TOKEN) {
  console.warn("[Telegram] Bot token not configured");
}

export async function sendMessage(telegramUserId: string, text: string, replyMarkup?: any) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("[Telegram] Cannot send message: bot token not configured");
    return false;
  }

  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: telegramUserId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    });
    return true;
  } catch (error) {
    console.error("[Telegram] Failed to send message:", error);
    return false;
  }
}

export async function sendWelcomeMessage(telegramUserId: string) {
  const text = `
👋 <b>Добро пожаловать в Nail Beauty!</b>

Нажмите кнопку ниже, чтобы записаться на маникюр.
  `;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "📅 Записаться",
          web_app: { url: `${MINI_APP_URL}/` },
        },
      ],
    ],
  };

  return sendMessage(telegramUserId, text, replyMarkup);
}

export async function notifyNewBooking(booking: any, service: any) {
  const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
  if (!adminTelegramId) return false;

  const text = `
<b>📌 Новая запись!</b>

<b>Услуга:</b> ${service.name}
<b>Дата:</b> ${new Date(booking.startTime).toLocaleDateString("ru-RU")}
<b>Время:</b> ${new Date(booking.startTime).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
<b>Стоимость:</b> ${booking.totalPriceBeyn} BYN
${booking.hasNailDesign ? "<b>Дизайн:</b> Да (+5 BYN)\n" : ""}
  `;

  return sendMessage(adminTelegramId, text);
}

export async function notifyBookingCancellation(booking: any, service: any) {
  const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
  if (!adminTelegramId) return false;

  const text = `
<b>❌ Запись отменена</b>

<b>Услуга:</b> ${service.name}
<b>Дата:</b> ${new Date(booking.startTime).toLocaleDateString("ru-RU")}
<b>Время:</b> ${new Date(booking.startTime).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
  `;

  return sendMessage(adminTelegramId, text);
}

export async function sendReminderToClient(booking: any, service: any, telegramUserId: string, hoursUntil: number) {
  const text = `
<b>🔔 Напоминание о записи</b>

<b>Услуга:</b> ${service.name}
<b>Дата:</b> ${new Date(booking.startTime).toLocaleDateString("ru-RU")}
<b>Время:</b> ${new Date(booking.startTime).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
<b>Через:</b> ${hoursUntil} часов

Пожалуйста, приходите вовремя!
  `;

  return sendMessage(telegramUserId, text);
}

export async function sendDailySummary() {
  const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
  if (!adminTelegramId) return false;

  const today = new Date();
  const bookings = await db.getBookingsForDay(today);

  if (bookings.length === 0) {
    const text = "📅 <b>Ежедневный отчет</b>\n\nНет записей на сегодня.";
    return sendMessage(adminTelegramId, text);
  }

  let text = `<b>📅 Ежедневный отчет на ${today.toLocaleDateString("ru-RU")}</b>\n\n`;
  text += `<b>Всего записей:</b> ${bookings.length}\n\n`;

  for (const booking of bookings) {
    const service = await db.getServiceById(booking.serviceId);
    text += `⏰ ${new Date(booking.startTime).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} - ${service?.name || "Unknown"}\n`;
  }

  return sendMessage(adminTelegramId, text);
}

export async function handleBotCommand(message: any) {
  const text = message.text || "";
  const telegramUserId = message.from.id.toString();
  const chatId = message.chat.id.toString();

  if (text === "/start") {
    return sendWelcomeMessage(telegramUserId);
  }

  if (text === "/today") {
    const today = new Date();
    const bookings = await db.getBookingsForDay(today);

    if (bookings.length === 0) {
      await sendMessage(chatId, "📅 Нет записей на сегодня.");
      return;
    }

    let response = `<b>📅 Записи на ${today.toLocaleDateString("ru-RU")}</b>\n\n`;
    for (const booking of bookings) {
      const service = await db.getServiceById(booking.serviceId);
      response += `⏰ ${new Date(booking.startTime).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} - ${service?.name || "Unknown"}\n`;
    }

    await sendMessage(chatId, response);
    return;
  }

  if (text === "/week") {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const bookings = await db.getBookingsByDateRange(startDate, endDate);

    if (bookings.length === 0) {
      await sendMessage(chatId, "📅 Нет записей на неделю.");
      return;
    }

    let response = `<b>📅 Записи на неделю</b>\n\n`;
    const grouped: Record<string, any[]> = {};

    for (const booking of bookings) {
      const date = new Date(booking.startTime).toLocaleDateString("ru-RU");
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(booking);
    }

    for (const [date, dayBookings] of Object.entries(grouped)) {
      response += `<b>${date}</b>\n`;
      for (const booking of dayBookings) {
        const service = await db.getServiceById(booking.serviceId);
        response += `  ⏰ ${new Date(booking.startTime).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} - ${service?.name || "Unknown"}\n`;
      }
      response += "\n";
    }

    await sendMessage(chatId, response);
    return;
  }

  if (text === "/clients") {
    const bookings = await db.getAllBookings();
    const uniqueClients = new Set(bookings.map((b) => b.clientId));

    let response = `<b>👥 Клиенты (${uniqueClients.size})</b>\n\n`;

    for (const clientId of Array.from(uniqueClients)) {
      const clientBookings = bookings.filter((b) => b.clientId === clientId);
      response += `👤 Клиент #${clientId}: ${clientBookings.length} записей\n`;
    }

    await sendMessage(chatId, response);
    return;
  }

  if (text === "/settings") {
    const response = `
<b>⚙️ Настройки</b>

Используйте админ-панель для управления:
• Расписанием работы
• Услугами
• Просмотра всех записей
• Статистики

Откройте админ-панель в приложении.
    `;

    await sendMessage(chatId, response);
    return;
  }

  const response = `
<b>Доступные команды:</b>

/start - Начать
/today - Записи на сегодня
/week - Записи на неделю
/clients - Список клиентов
/settings - Настройки
  `;

  await sendMessage(chatId, response);
}
