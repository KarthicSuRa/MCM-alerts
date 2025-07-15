import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Bell, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function SystemStatus() {
  const { toast } = useToast();
  
  const testNotificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/trigger", {
        type: "site_down",
        title: "Test Notification",
        message: "This is a test notification to verify the system is working.",
        site: "test.example.com"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Notification Sent",
        description: "Check for the notification alert with sound.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-slate-900">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Monitoring Service</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Online
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Notifications</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Database</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Healthy
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <Button 
            onClick={() => testNotificationMutation.mutate()} 
            disabled={testNotificationMutation.isPending}
            className="w-full"
            size="sm"
          >
            {testNotificationMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Test Notification
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
