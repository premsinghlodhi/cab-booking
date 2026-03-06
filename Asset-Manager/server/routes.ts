import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import cors from "cors";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Simple Session setup
  
  app.use(cors({
  origin: true,
  credentials: true
}));
  app.use(session({
    secret: process.env.SESSION_SECRET || "cab-booking-secret",
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({ checkPeriod: 86400000 }),
    cookie: {
  secure: app.get("env") === "production",
  sameSite: "none"
}
  }));

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByEmail(input.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        name: input.name,
        email: input.email,
        password: input.password, // In a real app, hash this!
        phone: input.phone,
        role: input.role || "user",
      });

      let driverProfile = undefined;
      if (user.role === "driver" && input.vehicleDetails && input.licenseNumber) {
        driverProfile = await storage.createDriverProfile({
          userId: user.id,
          vehicleDetails: input.vehicleDetails,
          licenseNumber: input.licenseNumber,
          availabilityStatus: false,
          verified: false,
        });
      }

      // @ts-ignore
      req.session.userId = user.id;
      res.status(201).json({ ...user, driverProfile });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user || user.password !== input.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // @ts-ignore
      req.session.userId = user.id;

      let driverProfile = undefined;
      if (user.role === "driver") {
        driverProfile = await storage.getDriverProfile(user.id);
      }
      res.json({ ...user, driverProfile });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    // @ts-ignore
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // @ts-ignore
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    let driverProfile = undefined;
    if (user.role === "driver") {
      driverProfile = await storage.getDriverProfile(user.id);
    }
    res.json({ ...user, driverProfile });
  });

  // Auth Middleware for protected routes
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Rides Routes
  app.post(api.rides.book.path, requireAuth, async (req, res) => {
    try {
      const input = api.rides.book.input.parse(req.body);
      // @ts-ignore
      const userId = req.session.userId;
      
      const ride = await storage.createRide({
        ...input,
        userId,
        status: "pending",
        distance: "10.5", // Mock distance
        fare: "25.00"     // Mock fare
      });
      res.status(201).json(ride);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.rides.list.path, requireAuth, async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    const user = await storage.getUser(userId);
    
    let rides = [];
    if (user?.role === "admin") {
      rides = await storage.getAllRides();
    } else if (user?.role === "driver") {
      rides = await storage.getRidesByDriver(userId);
      // Also fetch pending rides that are available
      const pendingRides = await storage.getAllRides();
      rides = [...rides, ...pendingRides.filter(r => r.status === "pending")];
      // Deduplicate
      rides = Array.from(new Map(rides.map(item => [item.id, item])).values());
    } else {
      rides = await storage.getRidesByUser(userId);
    }

    // Populate user and driver details
    const populatedRides = await Promise.all(rides.map(async r => {
      const rideUser = await storage.getUser(r.userId);
      let rideDriver = undefined;
      if (r.driverId) {
        rideDriver = await storage.getUser(r.driverId);
      }
      return { ...r, user: rideUser, driver: rideDriver };
    }));

    res.json(populatedRides);
  });

  app.get(api.rides.get.path, requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const ride = await storage.getRide(id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    
    const user = await storage.getUser(ride.userId);
    let driver = undefined;
    if (ride.driverId) {
      driver = await storage.getUser(ride.driverId);
    }
    
    res.json({ ...ride, user, driver });
  });

  app.put(api.rides.updateStatus.path, requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.rides.updateStatus.input.parse(req.body);
      
      const updates: any = { status: input.status };
      if (input.status === "accepted") {
        // @ts-ignore
        updates.driverId = req.session.userId;
        updates.startTime = new Date();
      } else if (input.status === "completed" || input.status === "cancelled") {
        updates.endTime = new Date();
      }

      const ride = await storage.updateRide(id, updates);
      res.json(ride);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Driver Routes
  app.put(api.drivers.updateStatus.path, requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const input = api.drivers.updateStatus.input.parse(req.body);
      
      const profile = await storage.updateDriverProfile(userId, {
        availabilityStatus: input.availabilityStatus
      });
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.drivers.updateLocation.path, requireAuth, async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.session.userId;
      const input = api.drivers.updateLocation.input.parse(req.body);
      
      const profile = await storage.updateDriverProfile(userId, {
        currentLocationLat: input.lat,
        currentLocationLng: input.lng
      });
      res.json(profile);
    } catch(err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.drivers.list.path, requireAuth, async (req, res) => {
    const availableOnly = req.query.available === "true";
    const drivers = await storage.getAllDriverProfiles(availableOnly);
    res.json(drivers);
  });

  app.post(api.drivers.verify.path, requireAuth, async (req, res) => {
    // @ts-ignore
    const adminId = req.session.userId;
    const admin = await storage.getUser(adminId);
    if (admin?.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const driverId = parseInt(req.params.id);
    const profile = await storage.updateDriverProfile(driverId, { verified: true });
    res.json(profile);
  });

  // Payment Routes
  app.post(api.payments.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.payments.create.input.parse(req.body);
      const payment = await storage.createPayment(input);
      res.status(201).json(payment);
    } catch(err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.payments.get.path, requireAuth, async (req, res) => {
    const rideId = parseInt(req.params.rideId);
    const payments = await storage.getPaymentsByRide(rideId);
    res.json(payments);
  });

  return httpServer;
}
