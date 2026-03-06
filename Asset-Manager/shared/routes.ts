import { z } from "zod";
import { insertRideSchema, insertPaymentSchema, registerSchema, loginSchema, rides, users, payments, driverProfiles } from "./schema";

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

const userWithDriverProfileSchema = z.custom<typeof users.$inferSelect & { driverProfile?: typeof driverProfiles.$inferSelect }>();
const driverWithProfileSchema = z.custom<typeof users.$inferSelect & { driverProfile: typeof driverProfiles.$inferSelect }>();
const rideWithDetailsSchema = z.custom<typeof rides.$inferSelect & { driver?: typeof users.$inferSelect, user?: typeof users.$inferSelect }>();

export const api = {
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/auth/register" as const,
      input: registerSchema,
      responses: {
        201: userWithDriverProfileSchema,
        400: errorSchemas.validation,
      },
    },
    login: {
      method: "POST" as const,
      path: "/api/auth/login" as const,
      input: loginSchema,
      responses: {
        200: userWithDriverProfileSchema,
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/auth/logout" as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/auth/me" as const,
      responses: {
        200: userWithDriverProfileSchema,
        401: errorSchemas.unauthorized,
      },
    },
  },
  rides: {
    book: {
      method: "POST" as const,
      path: "/api/rides/book" as const,
      input: insertRideSchema.omit({ driverId: true, distance: true, fare: true, status: true }),
      responses: {
        201: z.custom<typeof rides.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/rides" as const,
      input: z.object({
        role: z.enum(["user", "driver", "admin"]).optional(),
        status: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(rideWithDetailsSchema),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/rides/:id" as const,
      responses: {
        200: rideWithDetailsSchema,
        404: errorSchemas.notFound,
      },
    },
    updateStatus: {
      method: "PUT" as const,
      path: "/api/rides/:id/status" as const,
      input: z.object({ status: z.enum(["pending", "accepted", "ongoing", "completed", "cancelled"]) }),
      responses: {
        200: z.custom<typeof rides.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  drivers: {
    updateLocation: {
      method: "PUT" as const,
      path: "/api/drivers/location" as const,
      input: z.object({ lat: z.string(), lng: z.string() }),
      responses: {
        200: z.custom<typeof driverProfiles.$inferSelect>(),
      },
    },
    updateStatus: {
      method: "PUT" as const,
      path: "/api/drivers/status" as const,
      input: z.object({ availabilityStatus: z.boolean() }),
      responses: {
        200: z.custom<typeof driverProfiles.$inferSelect>(),
      },
    },
    verify: {
      method: "POST" as const,
      path: "/api/drivers/:id/verify" as const,
      responses: {
        200: z.custom<typeof driverProfiles.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/drivers" as const,
      input: z.object({ available: z.string().optional() }).optional(),
      responses: {
        200: z.array(driverWithProfileSchema),
      },
    }
  },
  payments: {
    create: {
      method: "POST" as const,
      path: "/api/payments/create" as const,
      input: insertPaymentSchema,
      responses: {
        201: z.custom<typeof payments.$inferSelect>(),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/payments/:rideId" as const,
      responses: {
        200: z.array(z.custom<typeof payments.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
