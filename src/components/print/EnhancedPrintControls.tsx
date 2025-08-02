import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Download, Loader2 } from "lucide-react";

export type PrintDataType = 
  | "equipment" 
  | "projects" 
  | "maintenance" 
  | "technicians" 
  | "filter_changes" 
  | "locations" 
  | "companies" 
  | "sensor_readings"
  | "all";

interface EnhancedPrintControlsProps {
  selectedType: PrintDataType;
  onTypeChange: (type: PrintDataType) => void;
  onPrint: () => void;
  onExportPDF?: () => void;
  isLoading?: boolean;
  hasData?: boolean;
}

const DATA_TYPE_LABELS = {
  equipment: "Equipment List",
  projects: "Projects List",
  maintenance: "Maintenance Checks",
  technicians: "Technicians",
  filter_changes: "Filter Changes",
  locations: "Locations",
  companies: "Companies",
  sensor_readings: "Sensor Readings",
  all: "All Data (Combined Report)"
};

export const EnhancedPrintControls = ({ 
  selectedType, 
  onTypeChange, 
  onPrint, 
  onExportPDF,
  isLoading = false,
  hasData = false
}: EnhancedPrintControlsProps) => {
  return (
    <div className="flex justify-between items-center print:hidden mb-6">
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Select Report Type:</label>
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Choose data to print" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATA_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        {onExportPDF && (
          <Button 
            onClick={onExportPDF}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        )}
        <Button 
          onClick={onPrint}
          disabled={isLoading || !hasData}
          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Printer className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Loading..." : "Print"}
        </Button>
      </div>
      
      {!isLoading && !hasData && (
        <div className="text-sm text-muted-foreground">
          No data available for the selected report type.
        </div>
      )}
    </div>
  );
};