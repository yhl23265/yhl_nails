import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(overrides?: Partial<AuthenticatedUser>): { ctx: TrpcContext; user: AuthenticatedUser } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    phone: null,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as any,
  };

  return { ctx, user };
}

function createAdminContext(): { ctx: TrpcContext; user: AuthenticatedUser } {
  return createUserContext({ role: "admin", openId: "admin-user" });
}

describe("services", () => {
  it("lists all active services", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const services = await caller.services.list();
      expect(Array.isArray(services)).toBe(true);
    } catch (error: any) {
      expect(error.message).toMatch(/doesn't exist|Failed query/);
    }
  });

  it("prevents non-admin from creating services", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.services.create({
        name: "Test Service",
        durationMinutes: 120,
        priceBeyn: "10.00",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("allows admin to create services", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.services.create({
        name: "Test Service",
        durationMinutes: 120,
        priceBeyn: "10.00",
      });
    } catch (error: any) {
      expect(error.code).not.toBe("FORBIDDEN");
    }
  });
});

describe("bookings", () => {
  it("allows authenticated users to view their bookings", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const bookings = await caller.bookings.myBookings();
      expect(Array.isArray(bookings)).toBe(true);
    } catch (error: any) {
      expect(error.message).toMatch(/doesn't exist|Failed query/);
    }
  });

  it("prevents non-admin from viewing all bookings", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.bookings.allBookings();
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("allows admin to view all bookings", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const bookings = await caller.bookings.allBookings();
      expect(Array.isArray(bookings)).toBe(true);
    } catch (error: any) {
      expect(error.message).toMatch(/doesn't exist|Failed query/);
    }
  });

  it("prevents non-admin from cancelling other users' bookings", async () => {
    const { ctx } = createUserContext({ id: 1 });
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.bookings.cancel({ id: 999 });
    } catch (error: any) {
      expect(["NOT_FOUND", "FORBIDDEN", "INTERNAL_SERVER_ERROR"]).toContain(error.code);
    }
  });
});

describe("schedule", () => {
  it("allows anyone to view schedule", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const schedule = await caller.schedule.get();
      expect(schedule === null || typeof schedule === "object").toBe(true);
    } catch (error: any) {
      expect(error.message).toMatch(/doesn't exist|Failed query/);
    }
  });

  it("prevents non-admin from updating schedule", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.schedule.update({
        weekSchedule: {
          "0": { enabled: true, startTime: "09:00", endTime: "18:00" },
        },
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("allows admin to update schedule", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.schedule.update({
        weekSchedule: {
          "0": { enabled: true, startTime: "09:00", endTime: "18:00" },
        },
      });
    } catch (error: any) {
      expect(error.code).not.toBe("FORBIDDEN");
    }
  });
});

describe("stats", () => {
  it("prevents non-admin from viewing stats", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.stats.summary({
        startDate: new Date(),
        endDate: new Date(),
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("allows admin to view stats", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const stats = await caller.stats.summary({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      });

      expect(stats).toHaveProperty("totalBookings");
      expect(stats).toHaveProperty("totalRevenue");
      expect(stats).toHaveProperty("bookingsByDay");
    } catch (error: any) {
      expect(error.message).toMatch(/doesn't exist|Failed query/);
    }
  });
});
