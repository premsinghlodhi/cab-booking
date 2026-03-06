import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("user"), // 'user', 'driver', 'admin'
  createdAt: timestamp("created_at").defaultNow(),
});

export const driverProfiles = pgTable("driver_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  vehicleDetails: text("vehicle_details").notNull(),
  licenseNumber: text("license_number").notNull(),
  availabilityStatus: boolean("availability_status").default(false),
  verified: boolean("verified").default(false),
  currentLocationLat: numeric("current_location_lat"),
  currentLocationLng: numeric("current_location_lng"),
});

export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  driverId: integer("driver_id").references(() => users.id),
  pickupLocation: text("pickup_location").notNull(),
  dropLocation: text("drop_location").notNull(),
  distance: numeric("distance").notNull(),
  fare: numeric("fare").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'ongoing', 'completed', 'cancelled'
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  rideId: integer("ride_id").references(() => rides.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: numeric("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDriverProfileSchema = createInsertSchema(driverProfiles).omit({ id: true });
export const insertRideSchema = createInsertSchema(rides).omit({ id: true, createdAt: true, startTime: true, endTime: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type DriverProfile = typeof driverProfiles.$inferSelect;
export type InsertDriverProfile = z.infer<typeof insertDriverProfileSchema>;

export type Ride = typeof rides.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const registerSchema = insertUserSchema.extend({
  vehicleDetails: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
