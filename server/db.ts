import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, services, bookings, scheduleSettings, reminders, telegramUsers } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "phone", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= Services =============

export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(services).where(eq(services.isActive, true)).orderBy(services.id);
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createService(data: {
  name: string;
  description?: string;
  durationMinutes: number;
  priceBeyn: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(services).values({
    name: data.name,
    description: data.description,
    durationMinutes: data.durationMinutes,
    priceBeyn: data.priceBeyn as any,
    isActive: true,
  });
  
  return result;
}

export async function updateService(id: number, data: Partial<{
  name: string;
  description?: string;
  durationMinutes: number;
  priceBeyn: string;
  isActive: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(services).set(data).where(eq(services.id, id));
}

// ============= Bookings =============

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getClientBookings(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(bookings)
    .where(eq(bookings.clientId, clientId))
    .orderBy(desc(bookings.startTime));
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(bookings)
    .orderBy(desc(bookings.startTime));
}

export async function getBookingsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(bookings)
    .where(and(
      gte(bookings.startTime, startDate),
      lte(bookings.startTime, endDate)
    ))
    .orderBy(bookings.startTime);
}

export async function createBooking(data: {
  clientId: number;
  serviceId: number;
  startTime: Date;
  endTime: Date;
  hasNailDesign: boolean;
  totalPriceBeyn: string;
  clientNotes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bookings).values({
    clientId: data.clientId,
    serviceId: data.serviceId,
    startTime: data.startTime,
    endTime: data.endTime,
    hasNailDesign: data.hasNailDesign,
    totalPriceBeyn: data.totalPriceBeyn as any,
    clientNotes: data.clientNotes,
    status: 'confirmed',
  });
  
  return result;
}

export async function cancelBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(bookings).set({ status: 'cancelled' }).where(eq(bookings.id, id));
}

export async function getBookingsForDay(date: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await db.select().from(bookings)
    .where(and(
      gte(bookings.startTime, startOfDay),
      lte(bookings.startTime, endOfDay),
      eq(bookings.status, 'confirmed')
    ))
    .orderBy(bookings.startTime);
}

// ============= Schedule Settings =============

export async function getScheduleSettings() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(scheduleSettings).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateScheduleSettings(data: {
  weekSchedule: Record<string, { enabled: boolean; startTime: string; endTime: string }>;
  breakStartTime?: string;
  breakEndTime?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getScheduleSettings();
  
  if (existing) {
    return await db.update(scheduleSettings)
      .set(data)
      .where(eq(scheduleSettings.id, existing.id));
  } else {
    return await db.insert(scheduleSettings).values(data);
  }
}

// ============= Reminders =============

export async function getPendingReminders() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(reminders)
    .where(eq(reminders.status, 'pending'))
    .orderBy(reminders.createdAt);
}

export async function createReminder(data: {
  bookingId: number;
  reminderType: 'pending' | '24_hours' | '2_hours';
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(reminders).values({
    bookingId: data.bookingId,
    reminderType: data.reminderType as '24_hours' | '2_hours',
    status: 'pending',
  });
}

export async function markReminderAsSent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(reminders)
    .set({ status: 'sent', sentAt: new Date() })
    .where(eq(reminders.id, id));
}

// ============= Telegram Users =============

export async function getTelegramUser(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(telegramUsers)
    .where(eq(telegramUsers.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateTelegramUser(data: {
  userId: number;
  telegramUserId: string;
  telegramUsername?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getTelegramUser(data.userId);
  
  if (existing) {
    return await db.update(telegramUsers)
      .set(data)
      .where(eq(telegramUsers.userId, data.userId));
  } else {
    return await db.insert(telegramUsers).values(data);
  }
}
