// Simple browser notification system without Firebase
import { playNotificationSound } from "./firebase";

export interface NotificationData {
  title: string;
  message: string;
  type: string;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function showBrowserNotification(data: NotificationData) {
  // Check if browser supports notifications
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    // Just play sound as fallback
    playNotificationSound();
    return;
  }

  // Check permission
  if (Notification.permission === "granted") {
    try {
      // Create notification
      const notification = new Notification(data.title, {
        body: data.message,
        icon: "/favicon.ico",
        requireInteraction: false,
        tag: data.type,
      });

      // Play sound
      playNotificationSound();

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      // Fallback: just play sound and log
      playNotificationSound();
    }
  } else {
    // If permission not granted, just play sound
    playNotificationSound();
  }
}

// Polling function to check for new notifications
export function startNotificationPolling(onNewNotification: (notification: any) => void) {
  let lastNotificationId = 0;
  let isInitialized = false;

  const checkForNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=1");
      if (response.ok) {
        const notifications = await response.json();
        if (notifications.length > 0) {
          const latest = notifications[0];
          if (!isInitialized) {
            // Set initial ID without triggering notification
            lastNotificationId = latest.id;
            isInitialized = true;
          } else if (latest.id > lastNotificationId) {
            lastNotificationId = latest.id;
            onNewNotification(latest);
            showBrowserNotification({
              title: latest.title,
              message: latest.message,
              type: latest.type,
            });
          }
        } else {
          isInitialized = true;
        }
      }
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  };

  // Check every 3 seconds for better responsiveness
  const interval = setInterval(checkForNotifications, 3000);

  // Initial check
  checkForNotifications();

  // Return cleanup function
  return () => clearInterval(interval);
}