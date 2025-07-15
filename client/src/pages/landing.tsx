import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Shield, Zap, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-slate-900">MCM Alerts</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-primary hover:bg-primary/90"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Stay Informed with Real-Time Alerts
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            MCM Alerts is your reliable notification system for monitoring website uptime, 
            service status, and critical system events. Get instant alerts when it matters most.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/login'}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-3"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Site Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Monitor your websites and get instant notifications when they go up or down.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Real-time Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Receive push notifications with sound alerts for immediate awareness.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">API Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Easy integration with external tools like Postman for custom triggers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-center">
                Built with security in mind using modern authentication and encryption.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-600 mb-6">
            Join MCM Alerts today and never miss an important notification again.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/login'}
            className="bg-primary hover:bg-primary/90"
          >
            Sign In Now
          </Button>
        </div>
      </main>
    </div>
  );
}
