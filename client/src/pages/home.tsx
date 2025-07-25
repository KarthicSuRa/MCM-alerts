import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import SubscriptionPanel from "@/components/SubscriptionPanel";
import NotificationHistory from "@/components/NotificationHistory";
import SystemStatus from "@/components/SystemStatus";
import NotificationAlert from "@/components/NotificationAlert";
import { startNotificationPolling } from "@/lib/notifications";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Setup notification polling
  useEffect(() => {
    if (!isAuthenticated) return;

    const stopPolling = startNotificationPolling((notification) => {
      console.log('Received notification:', notification);
      
      // Show visual notification alert
      setCurrentNotification(notification);
      
      // Show toast notification
      toast({
        title: notification.title || "New Notification",
        description: notification.message || "You have a new notification",
      });
    });

    return stopPolling;
  }, [isAuthenticated, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SubscriptionPanel />
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <NotificationHistory />
            <SystemStatus />
          </div>
        </div>
      </main>
      
      <NotificationAlert 
        notification={currentNotification} 
        onClose={() => setCurrentNotification(null)} 
      />
    </div>
  );
}
