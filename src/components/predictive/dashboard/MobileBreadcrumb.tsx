
import React from "react";
import { ChevronRight, Home, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MobileBreadcrumbProps {
  currentStep: "equipment" | "recording" | "analysis";
  equipmentName?: string;
}

export const MobileBreadcrumb = ({ currentStep, equipmentName }: MobileBreadcrumbProps) => {
  const navigate = useNavigate();

  return (
    <div className="md:hidden bg-white border-b border-gray-200 px-4 py-1 mb-1">
      <div className="flex items-center gap-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="p-1 h-auto text-gray-500 hover:text-gray-700"
        >
          <Home className="h-4 w-4" />
        </Button>
        
        <ChevronRight className="h-3 w-3 text-gray-400" />
        
        <span className="text-blue-600 font-medium">Predictive Maintenance</span>
        
        {equipmentName && (
          <>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <div className="flex items-center gap-1">
              <Gauge className="h-3 w-3 text-gray-500" />
              <span className="text-gray-700 font-medium truncate max-w-[120px]">
                {equipmentName}
              </span>
            </div>
          </>
        )}
        
        {currentStep === "recording" && (
          <>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-green-600 font-medium">Recording</span>
          </>
        )}
      </div>
    </div>
  );
};
