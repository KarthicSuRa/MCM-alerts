import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Bell } from "lucide-react";
import { playNotificationSound } from "@/lib/firebase";

interface NotificationAlertProps {
  notification: {
    id: number;
    title: string;
    message: string;
    type: string;
  } | null;
  onClose: () => void;
}

export default function NotificationAlert({ notification, onClose }: NotificationAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Play notification sound
      playNotificationSound();
      
      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!notification || !isVisible) return null;

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'site_down':
        return 'destructive';
      case 'site_up':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert variant={getAlertVariant(notification.type)} className="animate-slide-in-from-top">
        <Bell className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          {notification.title}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription>{notification.message}</AlertDescription>
      </Alert>
    </div>
  );
}