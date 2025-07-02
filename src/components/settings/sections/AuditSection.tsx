import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditDashboard } from '@/components/audit/AuditDashboard';

const AuditSectionWrapper = () => {
  try {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit & Security</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditDashboard />
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error('Error in AuditDashboard:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit & Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Unable to load audit dashboard.</p>
            <p className="text-sm">Please refresh the page or try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
};

export const AuditSection = AuditSectionWrapper;