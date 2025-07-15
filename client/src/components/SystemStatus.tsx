import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function SystemStatus() {
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
            <span className="text-sm text-slate-600">Firebase CM</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
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
      </CardContent>
    </Card>
  );
}
