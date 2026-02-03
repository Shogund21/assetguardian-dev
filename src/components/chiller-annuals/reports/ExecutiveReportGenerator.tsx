import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Printer, Download, Eye } from "lucide-react";
import { useChillerFleetHealth, useChillerHealthScores } from "@/hooks/useChillerFleetHealth";
import { useHighRiskAssets, useVendorAccountability } from "@/hooks/useVendorAccountability";
import { generateExecutiveSummary, generateExecutiveText } from "@/services/executiveReportService";
import { ExecutiveReportPreview } from "./ExecutiveReportPreview";
import { SAMPLE_CHILLER_DATA } from "@/types/chillerDashboard";
import type { ExecutiveSummary } from "@/types/chillerDashboard";

export function ExecutiveReportGenerator() {
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [activeView, setActiveView] = useState<'preview' | 'text'>('preview');
  const [useSampleData, setUseSampleData] = useState(false);

  // Fetch real data
  const { data: fleetHealth, isLoading: fleetLoading } = useChillerFleetHealth();
  const { data: healthScores, isLoading: scoresLoading } = useChillerHealthScores();
  const { data: highRiskAssets, isLoading: riskLoading } = useHighRiskAssets();
  const { data: vendorData, isLoading: vendorLoading } = useVendorAccountability();

  const isLoading = fleetLoading || scoresLoading || riskLoading || vendorLoading;
  const hasData = (fleetHealth?.totalChillers || 0) > 0;

  // Generate summary from real or sample data
  const summary: ExecutiveSummary | null = useMemo(() => {
    if (useSampleData || !hasData) {
      // Use sample data for demonstration
      const sample = SAMPLE_CHILLER_DATA;
      const currentYearData = sample.annualPMs.filter(pm => pm.year === 2025);
      
      return generateExecutiveSummary({
        totalChillers: sample.equipment.length,
        averageHealthScore: 78,
        highRiskCount: currentYearData.filter(pm => pm.riskLevel === 'high' || pm.riskLevel === 'critical').length,
        noRedundancyRiskCount: sample.equipment.filter(e => !e.hasBackup).length,
        riskDistribution: {
          low: currentYearData.filter(pm => pm.riskLevel === 'low').length,
          medium: currentYearData.filter(pm => pm.riskLevel === 'medium').length,
          high: currentYearData.filter(pm => pm.riskLevel === 'high').length,
          critical: 0,
        },
        highRiskAssets: currentYearData
          .filter(pm => pm.riskLevel === 'high' || pm.riskLevel === 'critical')
          .map(pm => {
            const equip = sample.equipment.find(e => e.id === pm.equipmentId)!;
            const findings = sample.findings.filter(f => f.equipmentId === pm.equipmentId && f.year === 2025);
            return {
              name: equip.name,
              location: equip.location,
              riskScore: pm.riskScore,
              riskLevel: pm.riskLevel,
              redFlags: findings.map(f => f.description),
              hasBackup: equip.hasBackup,
              estimatedRepairCost: findings.reduce((sum, f) => sum + f.estimatedCost, 0),
            };
          }),
        findings: sample.findings.map(f => {
          const equip = sample.equipment.find(e => e.id === f.equipmentId)!;
          return {
            assetName: equip.name,
            description: f.description,
            severity: f.severity,
            status: f.status,
            estimatedCost: f.estimatedCost,
            category: f.code.split('-')[0],
          };
        }),
        vendorData: [
          { vendorName: 'Acme HVAC Services', totalFindings: 4, findingsResolved: 1, resolutionRate: 25 },
          { vendorName: 'Internal Technicians', totalFindings: 1, findingsResolved: 0, resolutionRate: 0 },
        ],
      }, reportYear);
    }

    if (!fleetHealth || !highRiskAssets) return null;

    // Calculate risk distribution from health scores
    const riskDistribution = {
      low: healthScores?.filter(s => s.riskLevel === 'low').length || 0,
      medium: healthScores?.filter(s => s.riskLevel === 'medium').length || 0,
      high: healthScores?.filter(s => s.riskLevel === 'high').length || 0,
      critical: healthScores?.filter(s => s.riskLevel === 'critical').length || 0,
    };

    return generateExecutiveSummary({
      totalChillers: fleetHealth.totalChillers,
      averageHealthScore: fleetHealth.averageHealthScore,
      highRiskCount: fleetHealth.highRiskCount,
      noRedundancyRiskCount: fleetHealth.noRedundancyRiskCount,
      riskDistribution,
      highRiskAssets: highRiskAssets.map(a => ({
        name: a.name,
        location: a.location,
        riskScore: a.riskScore,
        riskLevel: a.riskLevel,
        redFlags: a.redFlags,
        hasBackup: a.hasBackup,
        estimatedRepairCost: a.estimatedRepairCost,
      })),
      findings: [], // Would need to fetch separately
      vendorData: vendorData?.map(v => ({
        vendorName: v.vendorName,
        totalFindings: v.totalFindings,
        findingsResolved: v.findingsResolved,
        resolutionRate: v.resolutionRate,
      })) || [],
    }, reportYear);
  }, [useSampleData, hasData, fleetHealth, healthScores, highRiskAssets, vendorData, reportYear]);

  const executiveText = useMemo(() => {
    if (!summary) return '';
    return generateExecutiveText(summary);
  }, [summary]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    if (!executiveText) return;
    const blob = new Blob([executiveText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chiller-executive-summary-${reportYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Executive Report Generator
          </CardTitle>
          <CardDescription>Generate a 1-page executive summary</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[600px] w-full" />
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
                Executive Report Generator
              </CardTitle>
              <CardDescription>Generate a 1-page executive summary for leadership review</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={reportYear.toString()} onValueChange={(v) => setReportYear(parseInt(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={() => setUseSampleData(!useSampleData)}>
                {useSampleData ? 'Use Real Data' : 'Use Sample Data'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'preview' | 'text')} className="flex-1">
              <TabsList>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Plain Text
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadText}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {!summary ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Data Available</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              No chiller inspection data found. Click "Use Sample Data" to see an example report.
            </p>
          </CardContent>
        </Card>
      ) : activeView === 'preview' ? (
        <div className="print:block">
          <ExecutiveReportPreview summary={summary} />
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/50 p-4 rounded-lg overflow-auto max-h-[600px]">
              {executiveText}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ExecutiveReportGenerator;
