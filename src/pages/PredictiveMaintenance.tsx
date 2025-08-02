import React from 'react';
import { CustomLayout } from '@/components/CustomLayout';
import PredictiveMaintenanceDashboard from '@/components/predictive/PredictiveMaintenanceDashboard';

const PredictiveMaintenance = () => {
  return (
    <CustomLayout>
      <PredictiveMaintenanceDashboard />
    </CustomLayout>
  );
};

export default PredictiveMaintenance;
