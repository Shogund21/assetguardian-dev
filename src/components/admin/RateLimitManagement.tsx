import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RateLimitOverrides from "./rate-limits/RateLimitOverrides";
import RateLimitConfigurations from "./rate-limits/RateLimitConfigurations";
import RateLimitAnalytics from "./rate-limits/RateLimitAnalytics";
import { Shield, Settings, BarChart3 } from "lucide-react";

const RateLimitManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Rate Limit Management</h2>
        <p className="text-muted-foreground">
          Configure chat rate limits, manage overrides, and monitor usage analytics
        </p>
      </div>

      <Tabs defaultValue="overrides" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overrides" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Overrides
          </TabsTrigger>
          <TabsTrigger value="configurations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overrides">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Overrides</CardTitle>
              <CardDescription>
                Grant special rate limit permissions to specific users, IPs, or sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RateLimitOverrides />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configurations">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Configuration</CardTitle>
              <CardDescription>
                Configure global rate limiting rules and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RateLimitConfigurations />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Analytics</CardTitle>
              <CardDescription>
                Monitor rate limiting events, usage patterns, and cost analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RateLimitAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RateLimitManagement;