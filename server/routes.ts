import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertSubscriptionSchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = (req.session as any).user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Subscription routes
  app.get('/api/subscriptions/:type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const { type } = req.params;
      
      const subscription = await storage.getSubscription(userId, type);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post('/api/subscriptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const subscriptionData = insertSubscriptionSchema.parse({
        ...req.body,
        userId,
      });
      
      const subscription = await storage.upsertSubscription(subscriptionData);
      res.json(subscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.post('/api/subscriptions/fcm-token', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const { type, fcmToken } = req.body;
      
      await storage.updateSubscriptionFCMToken(userId, type, fcmToken);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating FCM token:", error);
      res.status(500).json({ message: "Failed to update FCM token" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const notifications = await storage.getUserNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/count/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const count = await storage.getTodayNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // External trigger endpoint (for Postman)
  const triggerSchema = z.object({
    type: z.enum(['site_up', 'site_down', 'slow_response']),
    title: z.string(),
    message: z.string(),
    site: z.string().optional(),
  });

  app.post('/api/trigger', async (req, res) => {
    try {
      const { type, title, message, site } = triggerSchema.parse(req.body);
      
      // Get all active subscribers for site monitoring
      const subscribers = await storage.getActiveSubscribers('site_monitoring');
      
      if (subscribers.length === 0) {
        return res.json({ message: 'No active subscribers found' });
      }

      // For now, we'll just log the notification - no Firebase needed
      console.log(`Notification triggered: ${title} - ${message} (${type})`);
      console.log(`Would send to ${subscribers.length} subscribers`);

      // Create notification records for all subscribers
      for (const subscriber of subscribers) {
        await storage.createNotification({
          userId: subscriber.userId,
          title,
          message,
          type,
        });
      }

      res.json({ 
        message: 'Notifications sent successfully',
        subscriberCount: subscribers.length,
        notificationsCreated: subscribers.length,
      });
    } catch (error) {
      console.error("Error triggering notifications:", error);
      res.status(500).json({ message: "Failed to trigger notifications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
