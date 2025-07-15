import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "mcm-alerts-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());

  // Create default user if doesn't exist
  const defaultUser = await storage.getUserByUsername("user");
  if (!defaultUser) {
    await storage.createUser({
      id: "user",
      username: "user",
      email: "user@mcm-alerts.com",
      firstName: "MCM",
      lastName: "User",
    });
  }

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (username === "user" && password === "MCM alerts") {
      const user = await storage.getUserByUsername("user");
      if (user) {
        (req.session as any).user = user;
        res.json({ success: true, user });
      } else {
        res.status(401).json({ message: "Authentication failed" });
      }
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (req.session && (req.session as any).user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};