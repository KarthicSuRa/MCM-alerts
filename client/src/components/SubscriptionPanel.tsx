import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { requestNotificationPermission } from "@/lib/firebase";
import { Server, Copy, CheckCircle } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

const API_ENDPOINT = `${window.location.origin}/api/trigger`;

export default function SubscriptionPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["/api/subscriptions/site_monitoring"],
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/subscriptions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions/site_monitoring"] });
      toast({
        title: "Settings Updated",
        description: "Your subscription preferences have been saved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update subscription settings.",
        variant: "destructive",
      });
    },
  });

  const updateFCMTokenMutation = useMutation({
    mutationFn: async (data: { type: string; fcmToken: string }) => {
      const response = await apiRequest("POST", "/api/subscriptions/fcm-token", data);
      return response.json();
    },
  });

  const handleSubscriptionToggle = async (enabled: boolean) => {
    let fcmToken = null;
    
    if (enabled) {
      // Request notification permission and get FCM token
      fcmToken = await requestNotificationPermission();
      if (!fcmToken) {
        toast({
          title: "Permission Required",
          description: "Please allow notifications to enable this feature.",
          variant: "destructive",
        });
        return;
      }
    }

    const subscriptionData = {
      type: "site_monitoring",
      enabled,
      enableSound: subscription?.enableSound ?? true,
      enableBrowser: subscription?.enableBrowser ?? true,
      enableEmail: subscription?.enableEmail ?? false,
      fcmToken,
    };

    updateSubscriptionMutation.mutate(subscriptionData);

    if (fcmToken) {
      updateFCMTokenMutation.mutate({
        type: "site_monitoring",
        fcmToken,
      });
    }
  };

  const handleSettingChange = (field: string, value: boolean) => {
    const subscriptionData = {
      type: "site_monitoring",
      enabled: subscription?.enabled ?? false,
      enableSound: field === "enableSound" ? value : (subscription?.enableSound ?? true),
      enableBrowser: field === "enableBrowser" ? value : (subscription?.enableBrowser ?? true),
      enableEmail: field === "enableEmail" ? value : (subscription?.enableEmail ?? false),
      fcmToken: subscription?.fcmToken,
    };

    updateSubscriptionMutation.mutate(subscriptionData);
  };

  const copyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(API_ENDPOINT);
      toast({
        title: "Copied",
        description: "API endpoint copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Notification Subscriptions
            </CardTitle>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              subscription?.enabled 
                ? "bg-green-100 text-green-800" 
                : "bg-slate-100 text-slate-800"
            }`}>
              <CheckCircle className="h-3 w-3 mr-1" />
              {subscription?.enabled ? "Active" : "Inactive"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {/* Main subscription toggle */}
          <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Server className="h-5 w-5 text-primary mr-3" />
                  <h3 className="text-base font-medium text-slate-900">Site Up/Down Monitoring</h3>
                </div>
                <p className="text-sm text-slate-600 ml-8">
                  Receive instant notifications when your monitored sites go up or down
                </p>
                <div className="flex items-center mt-2 ml-8">
                  <span className="text-xs text-slate-500">Last checked: </span>
                  <span className="text-xs text-slate-600 ml-1">2 minutes ago</span>
                </div>
              </div>
              <div className="ml-4">
                <Switch
                  checked={subscription?.enabled ?? false}
                  onCheckedChange={handleSubscriptionToggle}
                  disabled={updateSubscriptionMutation.isPending}
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-base font-medium text-slate-900 mb-4">Notification Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableSound"
                  checked={subscription?.enableSound ?? true}
                  onCheckedChange={(checked) => handleSettingChange("enableSound", checked as boolean)}
                  disabled={updateSubscriptionMutation.isPending}
                />
                <label htmlFor="enableSound" className="text-sm text-slate-700 cursor-pointer">
                  Play sound for notifications
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableBrowser"
                  checked={subscription?.enableBrowser ?? true}
                  onCheckedChange={(checked) => handleSettingChange("enableBrowser", checked as boolean)}
                  disabled={updateSubscriptionMutation.isPending}
                />
                <label htmlFor="enableBrowser" className="text-sm text-slate-700 cursor-pointer">
                  Browser push notifications
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableEmail"
                  checked={subscription?.enableEmail ?? false}
                  onCheckedChange={(checked) => handleSettingChange("enableEmail", checked as boolean)}
                  disabled={updateSubscriptionMutation.isPending}
                />
                <label htmlFor="enableEmail" className="text-sm text-slate-700 cursor-pointer">
                  Email notifications
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-slate-900">API Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-3">
              Use this endpoint to trigger notifications from Postman:
            </p>
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded px-3 py-2">
              <code className="text-sm text-slate-800 flex-1 mr-2">{API_ENDPOINT}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyEndpoint}
                className="text-primary hover:text-primary/80"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Method: POST | Auth: None Required</p>
            <div className="mt-3 text-xs text-slate-600">
              <p className="font-medium mb-1">Example payload:</p>
              <pre className="bg-slate-100 p-2 rounded text-xs overflow-x-auto">
{`{
  "type": "site_down",
  "title": "Site Down Alert",
  "message": "example.com is not responding",
  "site": "example.com"
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
