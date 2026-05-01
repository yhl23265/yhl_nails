import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// Helper to check if user is admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= Services =============
  services: router({
    list: publicProcedure.query(async () => {
      return await db.getAllServices();
    }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const service = await db.getServiceById(input.id);
        if (!service) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
        }
        return service;
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        durationMinutes: z.number().positive(),
        priceBeyn: z.string().regex(/^\d+(\.\d{2})?$/),
      }))
      .mutation(async ({ input }) => {
        return await db.createService(input);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        durationMinutes: z.number().positive().optional(),
        priceBeyn: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateService(id, data);
      }),
  }),

  // ============= Bookings =============
  bookings: router({
    myBookings: protectedProcedure.query(async ({ ctx }) => {
      return await db.getClientBookings(ctx.user.id);
    }),

    allBookings: adminProcedure.query(async () => {
      return await db.getAllBookings();
    }),

    byDateRange: adminProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getBookingsByDateRange(input.startDate, input.endDate);
      }),

    forDay: adminProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ input }) => {
        return await db.getBookingsForDay(input.date);
      }),

    create: protectedProcedure
      .input(z.object({
        serviceId: z.number(),
        startTime: z.date(),
        endTime: z.date(),
        hasNailDesign: z.boolean().default(false),
        clientNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const service = await db.getServiceById(input.serviceId);
        if (!service) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
        }

        // Calculate total price
        let totalPrice = parseFloat(service.priceBeyn.toString());
        if (input.hasNailDesign) {
          totalPrice += 5; // Add 5 BYN for nail design
        }

        // Check for conflicts
        const existingBookings = await db.getBookingsForDay(input.startTime);
        const hasConflict = existingBookings.some(booking => {
          return !(input.endTime <= booking.startTime || input.startTime >= booking.endTime);
        });

        if (hasConflict) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Time slot is not available' });
        }

        return await db.createBooking({
          clientId: ctx.user.id,
          serviceId: input.serviceId,
          startTime: input.startTime,
          endTime: input.endTime,
          hasNailDesign: input.hasNailDesign,
          totalPriceBeyn: totalPrice.toFixed(2),
          clientNotes: input.clientNotes,
        });
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const booking = await db.getBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
        }

        // Check if user is the owner of the booking or an admin
        if (booking.clientId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot cancel this booking' });
        }

        return await db.cancelBooking(input.id);
      }),
  }),

  // ============= Schedule Settings =============
  schedule: router({
    get: publicProcedure.query(async () => {
      return await db.getScheduleSettings();
    }),

    update: adminProcedure
      .input(z.object({
        weekSchedule: z.record(z.string(), z.object({
          enabled: z.boolean(),
          startTime: z.string(),
          endTime: z.string(),
        })),
        breakStartTime: z.string().optional(),
        breakEndTime: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createOrUpdateScheduleSettings(input as any);
      }),
  }),

  // ============= Statistics =============
  stats: router({
    summary: adminProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        const bookings = await db.getBookingsByDateRange(input.startDate, input.endDate);
        
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
        const totalRevenue = confirmedBookings.reduce((sum, b) => {
          return sum + parseFloat(b.totalPriceBeyn.toString());
        }, 0);

        return {
          totalBookings: confirmedBookings.length,
          totalRevenue: totalRevenue.toFixed(2),
          bookingsByDay: confirmedBookings.reduce((acc, b) => {
            const day = b.startTime.toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
