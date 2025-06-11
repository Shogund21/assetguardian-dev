
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormValues } from "./hooks/schema/maintenanceFormSchema";
import { getMaintenanceTemplate } from "@/utils/tieredMaintenanceTemplates";
import MaintenanceReadings from "./MaintenanceReadings";
import MaintenanceStatus from "./MaintenanceStatus";
import MaintenanceObservations from "./MaintenanceObservations";
import AHUMaintenanceFields from "./AHUMaintenanceFields";
import TraneRTACFields from "./TraneRTACFields";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

interface TieredEquipmentFieldsProps {
  form: UseFormReturn<MaintenanceFormValues>;
  equipmentType: string | null;
}

const TieredEquipmentFields = ({ form, equipmentType }: TieredEquipmentFieldsProps) => {
  const frequency = form.watch('maintenance_frequency') || 'daily';
  const template = equipmentType ? getMaintenanceTemplate(equipmentType, frequency) : null;

  if (!equipmentType || !template) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Select equipment to see maintenance fields</p>
      </div>
    );
  }

  // Show simplified fields for daily maintenance
  if (frequency === 'daily') {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-900">Quick Daily Check</span>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              Essential readings only
            </Badge>
          </div>
          <p className="text-sm text-green-700">
            Focus on the most critical readings. AI will analyze trends and recommend when detailed inspections are needed.
          </p>
        </div>
        
        {equipmentType === 'chiller' && <TraneRTACFields form={form} isQuickCheck={true} />}
        {equipmentType === 'ahu' && <AHUMaintenanceFields form={form} isQuickCheck={true} />}
        
        <MaintenanceObservations form={form} />
      </div>
    );
  }

  // Show full fields for weekly/monthly maintenance
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900 capitalize">{frequency} Detailed Inspection</span>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            Comprehensive check
          </Badge>
        </div>
        <p className="text-sm text-blue-700">
          Complete {frequency} maintenance with all recommended readings and inspections.
        </p>
      </div>

      {equipmentType === 'chiller' && <TraneRTACFields form={form} />}
      {equipmentType === 'ahu' && <AHUMaintenanceFields form={form} />}
      
      <MaintenanceReadings form={form} />
      <MaintenanceStatus form={form} />
      <MaintenanceObservations form={form} />
    </div>
  );
};

export default TieredEquipmentFields;
