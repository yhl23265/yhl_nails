import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role field for admin/client distinction.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Services offered by the nail master.
 * Each service has a fixed duration and price.
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  durationMinutes: int("durationMinutes").notNull(), // e.g., 120 for 2 hours
  priceBeyn: decimal("priceBeyn", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Bookings made by clients.
 * Each booking references a service and a client.
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  serviceId: int("serviceId").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  hasNailDesign: boolean("hasNailDesign").default(false).notNull(),
  totalPriceBeyn: decimal("totalPriceBeyn", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["confirmed", "cancelled", "completed"]).default("confirmed").notNull(),
  clientNotes: text("clientNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Schedule settings for the nail master.
 * Defines working days and hours.
 */
export const scheduleSettings = mysqlTable("scheduleSettings", {
  id: int("id").autoincrement().primaryKey(),
  // JSON format: { "0": { "enabled": true, "startTime": "09:00", "endTime": "18:00" }, ... }
  // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
  weekSchedule: json("weekSchedule").$type<{
    [key: string]: { enabled: boolean; startTime: string; endTime: string };
  }>().notNull(),
  breakStartTime: varchar("breakStartTime", { length: 5 }), // e.g., "13:00"
  breakEndTime: varchar("breakEndTime", { length: 5 }), // e.g., "14:00"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduleSetting = typeof scheduleSettings.$inferSelect;
export type InsertScheduleSetting = typeof scheduleSettings.$inferInsert;

/**
 * Reminders sent to clients.
 * Tracks which reminders have been sent to avoid duplicates.
 */
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  reminderType: mysqlEnum("reminderType", ["24_hours", "2_hours"]).notNull(),
  sentAt: timestamp("sentAt"),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

/**
 * Telegram user mapping for sending notifications.
 * Stores Telegram user IDs for each client.
 */
export const telegramUsers = mysqlTable("telegramUsers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  telegramUserId: varchar("telegramUserId", { length: 64 }).notNull().unique(),
  telegramUsername: varchar("telegramUsername", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TelegramUser = typeof telegramUsers.$inferSelect;
export type InsertTelegramUser = typeof telegramUsers.$inferInsert;
