import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Printer, Download, Eye, FileDown } from "lucide-react";
import { useChillerPMReport, useCompletedChillerPMs } from "@/hooks/useChillerPMReport";
import { downloadTextReport } from "@/services/chillerPMReportService";
import { ChillerPMReportPreview } from "./ChillerPMReportPreview";

interface ChillerPMReportGeneratorProps {
  preSelectedPmId?: string | null;
  onClose?: () => void;
}

export function ChillerPMReportGenerator({ preSelectedPmId, onClose }: ChillerPMReportGeneratorProps) {
  const [selectedPmId, setSelectedPmId] = useState<string | null>(preSelectedPmId || null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: completedPMs, isLoading: loadingPMs } = useCompletedChillerPMs();
  const { data: reportData, isLoading: loadingReport } = useChillerPMReport(selectedPmId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    if (reportData) {
      downloadTextReport(reportData);
    }
  };

  const handleGenerateReport = () => {
    if (selectedPmId) {
      setShowPreview(true);
    }
  };

  if (loadingPMs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Individual Inspection Reports
          </CardTitle>
          <CardDescription>Generate PDF reports for completed inspections</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!completedPMs?.length && !preSelectedPmId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Individual Inspection Reports
          </CardTitle>
          <CardDescription>Generate PDF reports for completed inspections</CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Completed Inspections</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            Complete an annual chiller PM inspection to generate a report.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Individual Inspection Reports
              </CardTitle>
              <CardDescription>Generate PDF reports for completed inspections</CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1 w-full md:max-w-md">
              <Select
                value={selectedPmId || ""}
                onValueChange={(value) => {
                  setSelectedPmId(value);
                  setShowPreview(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a completed inspection..." />
                </SelectTrigger>
                <SelectContent>
                  {completedPMs?.map((pm: any) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.equipment?.name || "Unknown"} - {pm.inspection_year} ({pm.overall_risk_level || "N/A"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedPmId || loadingReport}
              >
                <Eye className="h-4 w-4 mr-2" />
                {loadingReport ? "Loading..." : "Preview Report"}
              </Button>

              {showPreview && reportData && (
                <>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print / PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadText}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Download Text
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {showPreview && loadingReport && (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[600px] w-full" />
          </CardContent>
        </Card>
      )}

      {showPreview && reportData && !loadingReport && (
        <div className="print:block">
          <ChillerPMReportPreview data={reportData} />
        </div>
      )}
    </div>
  );
}

export default ChillerPMReportGenerator;
