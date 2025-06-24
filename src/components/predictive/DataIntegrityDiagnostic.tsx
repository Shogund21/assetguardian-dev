
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, CheckCircle, RefreshCw } from "lucide-react";
import { equipmentDataIntegrityService } from "@/services/equipmentDataIntegrityService";
import { useToast } from "@/hooks/use-toast";
import usePredictiveMaintenance from "@/hooks/usePredictiveMaintenance";

interface DataIntegrityDiagnosticProps {
  equipmentId: string;
  equipmentName: string;
}

const DataIntegrityDiagnostic = ({ equipmentId, equipmentName }: DataIntegrityDiagnosticProps) => {
  const { toast } = useToast();
  const { useReadingCounts, useDataIntegrityCheck } = usePredictiveMaintenance();
  
  const { data: readingCounts, isLoading: countsLoading, refetch: refetchCounts } = useReadingCounts(equipmentId);
  const { data: integrityIssues, isLoading: integrityLoading, refetch: refetchIntegrity } = useDataIntegrityCheck();

  const handleRunDiagnostic = async () => {
    try {
      toast({
        title: "Running Diagnostic",
        description: "Checking equipment data integrity...",
      });

      // Refresh both queries
      await Promise.all([
        refetchCounts(),
        refetchIntegrity()
      ]);

      // Test fuzzy matching
      const similarEquipment = await equipmentDataIntegrityService.findEquipmentByName(equipmentName);
      
      console.log('Diagnostic results:', {
        equipmentId,
        equipmentName,
        readingCounts,
        similarEquipment: similarEquipment.map(eq => ({ id: eq.id, name: eq.name })),
        integrityIssues: integrityIssues?.length || 0
      });

      toast({
        title: "Diagnostic Complete",
        description: `Found ${similarEquipment.length} matching equipment records`,
      });

    } catch (error) {
      console.error('Diagnostic error:', error);
      toast({
        title: "Diagnostic Failed",
        description: "Error running data integrity check",
        variant: "destructive",
      });
    }
  };

  const hasData = readingCounts && (readingCounts.manual > 0 || readingCounts.standard > 0);
  const hasIssues = integrityIssues && integrityIssues.length > 0;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Data Integrity Status
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunDiagnostic}
            disabled={countsLoading || integrityLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${(countsLoading || integrityLoading) ? 'animate-spin' : ''}`} />
            Run Diagnostic
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Equipment Name Display */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Equipment Name:</span>
            <Badge variant="outline">{equipmentName}</Badge>
          </div>

          {/* Data Availability Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Data Availability:</span>
            {countsLoading ? (
              <Badge variant="secondary">Checking...</Badge>
            ) : hasData ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Data Available
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                No Data Found
              </Badge>
            )}
          </div>

          {/* Reading Counts Breakdown */}
          {readingCounts && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Manual Readings:</span>
                <Badge variant={readingCounts.manual > 0 ? "default" : "secondary"}>
                  {readingCounts.manual}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Maintenance Checks:</span>
                <Badge variant={readingCounts.standard > 0 ? "default" : "secondary"}>
                  {readingCounts.standard}
                </Badge>
              </div>
            </div>
          )}

          {/* Integrity Issues Summary */}
          {hasIssues && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Data Integrity Issues Detected
                </span>
              </div>
              <p className="text-xs text-yellow-700">
                Found {integrityIssues.length} potential naming inconsistencies that may affect data lookup.
                Equipment names may vary between maintenance checks and sensor readings.
              </p>
            </div>
          )}

          {/* No Data Explanation */}
          {!hasData && !countsLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Possible Causes for No Data
                </span>
              </div>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Equipment name mismatch between systems (e.g., "Chiller-01" vs "Chiller 1")</li>
                <li>No maintenance checks have been completed for this equipment</li>
                <li>No manual sensor readings have been recorded</li>
                <li>Equipment ID mismatch in database records</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataIntegrityDiagnostic;
