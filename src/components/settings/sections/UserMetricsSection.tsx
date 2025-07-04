import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserMetricsDashboard from '@/components/metrics/UserMetricsDashboard';

const UserMetricsSectionWrapper = () => {
  try {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Metrics & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <UserMetricsDashboard />
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error in UserMetricsDashboard:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Metrics & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Unable to load user metrics dashboard.</p>
            <p className="text-sm">Please refresh the page or try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
};

export const UserMetricsSection = UserMetricsSectionWrapper;