import type { 
  ExecutiveSummary, 
  CriticalAlert, 
  KeyFinding, 
  CapitalRecommendations,
  VendorPerformanceSummary 
} from "@/types/chillerDashboard";
import { format } from "date-fns";

interface FleetData {
  totalChillers: number;
  averageHealthScore: number;
  highRiskCount: number;
  noRedundancyRiskCount: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  highRiskAssets: Array<{
    name: string;
    location: string;
    riskScore: number;
    riskLevel: string;
    redFlags: string[];
    hasBackup: boolean;
    estimatedRepairCost: number | null;
  }>;
  findings: Array<{
    assetName: string;
    description: string;
    severity: string;
    status: string;
    estimatedCost: number | null;
    category: string;
  }>;
  vendorData: Array<{
    vendorName: string;
    totalFindings: number;
    findingsResolved: number;
    resolutionRate: number;
  }>;
}

export function generateExecutiveSummary(
  data: FleetData, 
  reportYear: number = new Date().getFullYear()
): ExecutiveSummary {
  const reportDate = format(new Date(), "MMMM d, yyyy");
  const reportPeriod = `${reportYear} Annual Inspections`;

  // Fleet snapshot
  const fleetSnapshot = {
    totalChillers: data.totalChillers,
    averageHealthScore: data.averageHealthScore,
    criticalAssets: data.highRiskCount,
    noRedundancyRisk: data.noRedundancyRiskCount,
  };

  // Critical alerts - assets that are high risk with no backup
  const criticalAlerts: CriticalAlert[] = data.highRiskAssets
    .filter(a => a.riskLevel === 'critical' || (a.riskLevel === 'high' && !a.hasBackup))
    .map(asset => ({
      assetName: asset.name,
      location: asset.location,
      riskScore: asset.riskScore,
      redFlags: asset.redFlags,
      hasBackup: asset.hasBackup,
      businessImpact: generateBusinessImpact(asset),
    }));

  // Key findings - top 3 priority items
  const keyFindings: KeyFinding[] = generateKeyFindings(data.highRiskAssets, data.findings);

  // Capital recommendations
  const capitalRecommendations = generateCapitalRecommendations(data.findings);

  // Risk mitigation note
  const riskMitigationNote = generateRiskMitigationNote(criticalAlerts);

  // Vendor performance
  const vendorPerformance: VendorPerformanceSummary[] = data.vendorData.map(v => ({
    vendorName: v.vendorName,
    findingsCount: v.totalFindings,
    resolvedCount: v.findingsResolved,
    resolutionRate: v.resolutionRate,
  }));

  return {
    reportTitle: "Annual Chiller Maintenance Executive Summary",
    reportDate,
    reportPeriod,
    fleetSnapshot,
    riskDistribution: data.riskDistribution,
    criticalAlerts,
    keyFindings,
    capitalRecommendations,
    riskMitigationNote,
    vendorPerformance,
  };
}

function generateBusinessImpact(asset: FleetData['highRiskAssets'][0]): string {
  if (!asset.hasBackup) {
    const location = asset.location.toLowerCase();
    if (location.includes('data center') || location.includes('it')) {
      return "Critical IT infrastructure at risk. Estimated $150,000+/day business impact from unplanned outage.";
    }
    if (location.includes('manufacturing') || location.includes('plant')) {
      return "Production cooling at risk. Potential production shutdown with significant revenue impact.";
    }
    return "Single point of failure. No backup available for critical cooling load.";
  }
  return "High priority repair recommended to prevent escalation.";
}

function generateKeyFindings(
  highRiskAssets: FleetData['highRiskAssets'],
  findings: FleetData['findings']
): KeyFinding[] {
  const keyFindings: KeyFinding[] = [];
  let priority = 1;

  // Add critical asset findings
  for (const asset of highRiskAssets.slice(0, 2)) {
    const assetFindings = findings.filter(f => 
      f.assetName === asset.name && f.status !== 'resolved'
    );
    
    const details = assetFindings.length > 0
      ? assetFindings.map(f => `• ${f.description}`).join('\n')
      : `• Risk score of ${asset.riskScore} indicates deteriorating condition`;

    keyFindings.push({
      priority: priority++,
      assetName: asset.name,
      summary: `${asset.name} requires ${asset.riskLevel === 'critical' ? 'immediate' : 'urgent'} attention`,
      details,
    });
  }

  // Add a positive finding if most assets are healthy
  if (highRiskAssets.length <= 1) {
    keyFindings.push({
      priority: priority++,
      assetName: "Fleet Overview",
      summary: "Majority of fleet performing within specifications",
      details: "• Continue standard annual maintenance schedule\n• No immediate capital expenditures required for healthy assets",
    });
  }

  return keyFindings.slice(0, 3);
}

function generateCapitalRecommendations(findings: FleetData['findings']): CapitalRecommendations {
  const openFindings = findings.filter(f => f.status === 'open' || f.status === 'in_progress');
  
  // Categorize by severity/urgency
  const immediate = openFindings
    .filter(f => f.severity === 'critical' || f.severity === 'high')
    .map(f => ({
      asset: f.assetName,
      description: f.description,
      cost: f.estimatedCost || 0,
    }));

  const nearTerm = openFindings
    .filter(f => f.severity === 'medium')
    .map(f => ({
      asset: f.assetName,
      description: f.description,
      cost: f.estimatedCost || 0,
    }));

  const longTerm = openFindings
    .filter(f => f.severity === 'low')
    .map(f => ({
      asset: f.assetName,
      description: f.description,
      cost: f.estimatedCost || 0,
    }));

  const totalInvestment = [...immediate, ...nearTerm, ...longTerm]
    .reduce((sum, r) => sum + r.cost, 0);

  return {
    immediate,
    nearTerm,
    longTerm,
    totalInvestment,
  };
}

function generateRiskMitigationNote(criticalAlerts: CriticalAlert[]): string {
  if (criticalAlerts.length === 0) {
    return "No critical risks identified. Continue standard maintenance protocols.";
  }

  const noBackupAssets = criticalAlerts.filter(a => !a.hasBackup);
  if (noBackupAssets.length > 0) {
    const names = noBackupAssets.map(a => a.assetName).join(', ');
    return `${names} serve${noBackupAssets.length === 1 ? 's' : ''} critical load with no redundancy. ` +
      `Failure would result in significant business impact. Recommend expedited repair authorization and consideration of backup capacity.`;
  }

  return "Critical assets identified require prioritized maintenance to prevent unplanned outages.";
}

export function generateExecutiveText(summary: ExecutiveSummary): string {
  const lines: string[] = [];
  
  lines.push(summary.reportTitle.toUpperCase());
  lines.push(`Report Period: ${summary.reportPeriod}`);
  lines.push(`Generated: ${summary.reportDate}`);
  lines.push('');
  
  lines.push('FLEET OVERVIEW');
  lines.push(`This report summarizes the annual maintenance inspections for ${summary.fleetSnapshot.totalChillers} water-cooled chillers across your facilities. Overall fleet health averaged ${summary.fleetSnapshot.averageHealthScore}%, with ${summary.fleetSnapshot.criticalAssets} asset${summary.fleetSnapshot.criticalAssets !== 1 ? 's' : ''} identified as high-risk requiring ${summary.fleetSnapshot.criticalAssets > 0 ? 'immediate' : 'no immediate'} attention.`);
  lines.push('');

  if (summary.criticalAlerts.length > 0) {
    lines.push('CRITICAL FINDING');
    const alert = summary.criticalAlerts[0];
    lines.push(`The ${alert.assetName} located at ${alert.location} presents significant operational risk. This unit scored ${alert.riskScore} out of 100 on our risk assessment, classifying it as HIGH RISK. Key concerns include:`);
    lines.push('');
    for (const flag of alert.redFlags.slice(0, 4)) {
      lines.push(`• ${flag}`);
    }
    if (!alert.hasBackup) {
      lines.push(`• This unit has NO BACKUP, creating a single point of failure`);
    }
    lines.push('');
  }

  lines.push('KEY FINDINGS');
  for (const finding of summary.keyFindings) {
    lines.push(`${finding.priority}. ${finding.summary}`);
    lines.push(finding.details);
    lines.push('');
  }

  lines.push('CAPITAL BUDGET IMPACT');
  lines.push(`Total recommended investment across all assets: $${summary.capitalRecommendations.totalInvestment.toLocaleString()}`);
  if (summary.capitalRecommendations.immediate.length > 0) {
    const immediateCost = summary.capitalRecommendations.immediate.reduce((s, r) => s + r.cost, 0);
    lines.push(`• Immediate (0-90 days): $${immediateCost.toLocaleString()}`);
  }
  if (summary.capitalRecommendations.nearTerm.length > 0) {
    const nearTermCost = summary.capitalRecommendations.nearTerm.reduce((s, r) => s + r.cost, 0);
    lines.push(`• Near-term (90-180 days): $${nearTermCost.toLocaleString()}`);
  }
  lines.push('');

  if (summary.riskMitigationNote) {
    lines.push('RISK MITIGATION');
    lines.push(summary.riskMitigationNote);
    lines.push('');
  }

  if (summary.vendorPerformance.length > 0) {
    lines.push('VENDOR ACCOUNTABILITY');
    for (const vendor of summary.vendorPerformance.slice(0, 3)) {
      lines.push(`${vendor.vendorName}: ${vendor.findingsCount} findings, ${vendor.resolvedCount} resolved (${vendor.resolutionRate}%)`);
    }
  }

  return lines.join('\n');
}
