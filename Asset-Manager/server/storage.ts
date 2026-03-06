import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users, driverProfiles, rides, payments,
  type User, type InsertUser, type DriverProfile, type InsertDriverProfile,
  type Ride, type InsertRide, type Payment, type InsertPayment
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
  getDriverProfile(userId: number): Promise<DriverProfile | undefined>;
  createDriverProfile(profile: InsertDriverProfile): Promise<DriverProfile>;
  updateDriverProfile(userId: number, updates: Partial<InsertDriverProfile>): Promise<DriverProfile>;
  getAllDriverProfiles(availableOnly?: boolean): Promise<(User & { driverProfile: DriverProfile })[]>;

  getRide(id: number): Promise<Ride | undefined>;
  createRide(ride: InsertRide): Promise<Ride>;
  updateRide(id: number, updates: Partial<InsertRide>): Promise<Ride>;
  getRidesByUser(userId: number): Promise<Ride[]>;
  getRidesByDriver(driverId: number): Promise<Ride[]>;
  getAllRides(): Promise<Ride[]>;

  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByRide(rideId: number): Promise<Payment[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  async getDriverProfile(userId: number): Promise<DriverProfile | undefined> {
    const [profile] = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, userId));
    return profile;
  }

  async createDriverProfile(profile: InsertDriverProfile): Promise<DriverProfile> {
    const [newProfile] = await db.insert(driverProfiles).values(profile).returning();
    return newProfile;
  }

  async updateDriverProfile(userId: number, updates: Partial<InsertDriverProfile>): Promise<DriverProfile> {
    const [updatedProfile] = await db.update(driverProfiles).set(updates).where(eq(driverProfiles.userId, userId)).returning();
    return updatedProfile;
  }

  async getAllDriverProfiles(availableOnly?: boolean): Promise<(User & { driverProfile: DriverProfile })[]> {
    const query = db.select().from(driverProfiles).innerJoin(users, eq(users.id, driverProfiles.userId));
    if (availableOnly) {
      query.where(eq(driverProfiles.availabilityStatus, true));
    }
    const results = await query;
    return results.map(row => ({ ...row.users, driverProfile: row.driver_profiles }));
  }

  async getRide(id: number): Promise<Ride | undefined> {
    const [ride] = await db.select().from(rides).where(eq(rides.id, id));
    return ride;
  }

  async createRide(ride: InsertRide): Promise<Ride> {
    const [newRide] = await db.insert(rides).values(ride).returning();
    return newRide;
  }

  async updateRide(id: number, updates: Partial<InsertRide>): Promise<Ride> {
    const [updatedRide] = await db.update(rides).set(updates).where(eq(rides.id, id)).returning();
    return updatedRide;
  }

  async getRidesByUser(userId: number): Promise<Ride[]> {
    return await db.select().from(rides).where(eq(rides.userId, userId));
  }

  async getRidesByDriver(driverId: number): Promise<Ride[]> {
    return await db.select().from(rides).where(eq(rides.driverId, driverId));
  }

  async getAllRides(): Promise<Ride[]> {
    return await db.select().from(rides);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getPaymentsByRide(rideId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.rideId, rideId));
  }
}

export const storage = new DatabaseStorage();
