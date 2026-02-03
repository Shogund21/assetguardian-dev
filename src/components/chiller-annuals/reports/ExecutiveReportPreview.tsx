import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Shield, TrendingUp, DollarSign, Users } from "lucide-react";
import type { ExecutiveSummary } from "@/types/chillerDashboard";

interface ExecutiveReportPreviewProps {
  summary: ExecutiveSummary;
}

export function ExecutiveReportPreview({ summary }: ExecutiveReportPreviewProps) {
  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cost);
  };

  const getRiskLevelColor = (count: number, total: number) => {
    const pct = (count / total) * 100;
    return pct >= 20 ? 'bg-red-500' : pct >= 10 ? 'bg-orange-500' : 'bg-green-500';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:space-y-4">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wide">
          {summary.reportTitle}
        </h1>
        <p className="text-muted-foreground mt-1">
          Report Period: {summary.reportPeriod}
        </p>
        <p className="text-sm text-muted-foreground">
          Generated: {summary.reportDate}
        </p>
      </div>

      {/* Fleet Health Snapshot */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Fleet Health Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold">{summary.fleetSnapshot.totalChillers}</div>
              <div className="text-sm text-muted-foreground">Chillers Inspected</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className={`text-3xl font-bold ${
                summary.fleetSnapshot.averageHealthScore >= 80 ? 'text-green-600' :
                summary.fleetSnapshot.averageHealthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {summary.fleetSnapshot.averageHealthScore}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Health</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${
              summary.fleetSnapshot.criticalAssets > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted/50'
            }`}>
              <div className={`text-3xl font-bold ${
                summary.fleetSnapshot.criticalAssets > 0 ? 'text-red-600' : ''
              }`}>
                {summary.fleetSnapshot.criticalAssets}
              </div>
              <div className="text-sm text-muted-foreground">Critical Assets</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${
              summary.fleetSnapshot.noRedundancyRisk > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-muted/50'
            }`}>
              <div className={`text-3xl font-bold ${
                summary.fleetSnapshot.noRedundancyRisk > 0 ? 'text-orange-600' : ''
              }`}>
                {summary.fleetSnapshot.noRedundancyRisk}
              </div>
              <div className="text-sm text-muted-foreground">No Backup</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Risk Distribution Bar */}
          <div>
            <div className="text-sm text-muted-foreground mb-2">Risk Distribution</div>
            <div className="flex h-6 rounded-full overflow-hidden">
              {summary.riskDistribution.low > 0 && (
                <div 
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(summary.riskDistribution.low / summary.fleetSnapshot.totalChillers) * 100}%` }}
                >
                  {summary.riskDistribution.low > 0 && 'LOW'}
                </div>
              )}
              {summary.riskDistribution.medium > 0 && (
                <div 
                  className="bg-yellow-500 flex items-center justify-center text-black text-xs font-medium"
                  style={{ width: `${(summary.riskDistribution.medium / summary.fleetSnapshot.totalChillers) * 100}%` }}
                >
                  MED
                </div>
              )}
              {summary.riskDistribution.high > 0 && (
                <div 
                  className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(summary.riskDistribution.high / summary.fleetSnapshot.totalChillers) * 100}%` }}
                >
                  HIGH
                </div>
              )}
              {summary.riskDistribution.critical > 0 && (
                <div 
                  className="bg-red-600 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${(summary.riskDistribution.critical / summary.fleetSnapshot.totalChillers) * 100}%` }}
                >
                  CRIT
                </div>
              )}
            </div>
          </div>

          {/* Critical Alerts */}
          {summary.criticalAlerts.length > 0 && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-700 dark:text-red-400">
                    CRITICAL ASSET ALERT
                  </h4>
                  {summary.criticalAlerts.map((alert, idx) => (
                    <div key={idx} className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">{alert.assetName}</span> ({alert.location}) 
                        scored {alert.riskScore}/100 risk with:
                      </p>
                      <ul className="mt-1 text-sm space-y-0.5">
                        {alert.redFlags.slice(0, 4).map((flag, i) => (
                          <li key={i}>• {flag}</li>
                        ))}
                        {!alert.hasBackup && (
                          <li className="font-medium text-red-600">• NO BACKUP UNIT AVAILABLE</li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Key Findings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary.keyFindings.map((finding, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="font-medium">
                {finding.priority}. {finding.summary}
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line pl-4">
                {finding.details}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Capital Recommendations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Capital Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary.capitalRecommendations.immediate.length > 0 && (
            <div>
              <h4 className="font-medium text-red-600">IMMEDIATE (0-90 days):</h4>
              <ul className="mt-1 text-sm space-y-1 pl-4">
                {summary.capitalRecommendations.immediate.map((rec, idx) => (
                  <li key={idx}>
                    • {rec.asset}: {rec.description} - {formatCost(rec.cost)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.capitalRecommendations.nearTerm.length > 0 && (
            <div>
              <h4 className="font-medium text-orange-600">NEAR-TERM (90-180 days):</h4>
              <ul className="mt-1 text-sm space-y-1 pl-4">
                {summary.capitalRecommendations.nearTerm.map((rec, idx) => (
                  <li key={idx}>
                    • {rec.asset}: {rec.description} - {formatCost(rec.cost)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <span className="font-semibold">TOTAL RECOMMENDED INVESTMENT:</span>
            <span className="text-xl font-bold">
              {formatCost(summary.capitalRecommendations.totalInvestment)}
            </span>
          </div>

          {summary.riskMitigationNote && (
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <Shield className="h-4 w-4" />
                RISK MITIGATION NOTE
              </h4>
              <p className="text-sm mt-1">{summary.riskMitigationNote}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Performance */}
      {summary.vendorPerformance.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Vendor Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.vendorPerformance.map((vendor, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{vendor.vendorName}:</span>
                  <span>
                    {vendor.findingsCount} findings, {vendor.resolvedCount} resolved 
                    <Badge 
                      variant={vendor.resolutionRate >= 80 ? 'outline' : 
                               vendor.resolutionRate >= 50 ? 'secondary' : 'destructive'}
                      className="ml-2"
                    >
                      {vendor.resolutionRate}%
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ExecutiveReportPreview;
