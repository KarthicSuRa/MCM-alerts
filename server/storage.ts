import {
  users,
  subscriptions,
  notifications,
  type User,
  type UpsertUser,
  type Subscription,
  type InsertSubscription,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: UpsertUser): Promise<User>;
  
  // Subscription operations
  getSubscription(userId: string, type: string): Promise<Subscription | undefined>;
  upsertSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscriptionFCMToken(userId: string, type: string, fcmToken: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  getActiveSubscribers(type: string): Promise<Subscription[]>;
  markNotificationAsRead(id: number): Promise<void>;
  getTodayNotificationCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Subscription operations
  async getSubscription(userId: string, type: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.type, type)));
    return subscription;
  }

  async upsertSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const existing = await this.getSubscription(subscriptionData.userId, subscriptionData.type);
    
    if (existing) {
      const [subscription] = await db
        .update(subscriptions)
        .set({ ...subscriptionData, updatedAt: new Date() })
        .where(and(
          eq(subscriptions.userId, subscriptionData.userId),
          eq(subscriptions.type, subscriptionData.type)
        ))
        .returning();
      return subscription;
    } else {
      const [subscription] = await db
        .insert(subscriptions)
        .values(subscriptionData)
        .returning();
      return subscription;
    }
  }

  async updateSubscriptionFCMToken(userId: string, type: string, fcmToken: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({ fcmToken, updatedAt: new Date() })
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.type, type)));
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async getUserNotifications(userId: string, limit: number = 10): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getActiveSubscribers(type: string): Promise<Subscription[]> {
    return await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.type, type), eq(subscriptions.enabled, true)));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ status: "read" })
      .where(eq(notifications.id, id));
  }

  async getTodayNotificationCount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.createdAt, today)
      ));
    
    return result.length;
  }
}

export const storage = new DatabaseStorage();
