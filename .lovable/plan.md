

# Dashboards and Executive Reporting for Annual Chiller Maintenance & Risk Intelligence

## Overview

This plan creates a comprehensive analytics dashboard and executive reporting system for the Annual Chiller Maintenance module. The dashboard provides real-time visibility into chiller health, multi-year trends, and risk intelligence, while the executive report generates a 1-page summary suitable for leadership review.

---

## Architecture

```text
+--------------------------------------------------+
|           ChillerAnnualsDashboard                 |
|        (Main dashboard orchestrator)              |
+--------------------------------------------------+
                      |
    +-----------------+-----------------+
    |                 |                 |
+--------+      +-----------+    +-------------+
| Hooks  |      | Dashboard |    | Executive   |
|        |      | Components|    | Report      |
+--------+      +-----------+    +-------------+
    |                 |                 |
    v                 v                 v
useChillerFleetHealth    <Charts>    ExecutiveReportGenerator
useChillerTrendData      <Tables>    ExecutiveReportPreview
useVendorAccountability  <KPIs>      ExportToPDF (print CSS)
```

---

## Dashboard Components

### 1. Fleet Health Overview (KPI Cards)

| Metric | Query Source | Display |
|--------|--------------|---------|
| Total Chillers | `equipment` WHERE type = 'Chiller' | Large number |
| Average Health Score | `annual_chiller_pm` AVG(100 - overall_risk_score) | Score badge with color |
| High Risk Assets | `annual_chiller_pm` WHERE overall_risk_level IN ('high', 'critical') | Red badge |
| No Redundancy Assets | `equipment` WHERE has_backup = false AND risk_level = 'high' | Warning badge |
| Next Inspection Due | `annual_chiller_pm` MIN(next_annual_due) | Date display |

**File**: `src/components/chiller-annuals/dashboard/FleetHealthOverview.tsx`

---

### 2. Chiller Health Score by Asset

**Component**: `ChillerHealthScoreTable`

| Column | Source | Format |
|--------|--------|--------|
| Asset Name | `equipment.name` | Text link |
| Location | `equipment.location` | Text |
| Model | `annual_chiller_pm.chiller_model` | Text |
| Health Score | `100 - overall_risk_score` | Progress bar (0-100) |
| Risk Level | `overall_risk_level` | Color badge |
| Last Inspection | `inspection_date` | Date |
| Trend | YoY score comparison | Arrow icon |

**Query**:
```sql
SELECT 
  e.id, e.name, e.location, 
  acp.chiller_model,
  (100 - acp.overall_risk_score) AS health_score,
  acp.overall_risk_level,
  acp.inspection_date,
  LAG(acp.overall_risk_score) OVER (
    PARTITION BY e.id ORDER BY acp.inspection_year
  ) AS prior_year_score
FROM equipment e
LEFT JOIN annual_chiller_pm acp ON e.id = acp.equipment_id
WHERE e.type ILIKE '%chiller%'
ORDER BY health_score ASC
```

**File**: `src/components/chiller-annuals/dashboard/ChillerHealthScoreTable.tsx`

---

### 3. Tube Loss % Trend (Multi-Year)

**Component**: `TubeLossTrendChart`

**Chart Type**: Line chart (recharts)

**Data Structure**:
```typescript
interface TubeLossTrendData {
  year: number;
  equipmentId: string;
  equipmentName: string;
  evaporatorPluggedPct: number;
  condenserPluggedPct: number;
  evaporatorWallLossPct: number;
  condenserWallLossPct: number;
}
```

**Query**:
```sql
SELECT 
  acp.inspection_year,
  acp.equipment_id,
  e.name AS equipment_name,
  cti.bundle_type,
  cti.plugged_pct,
  cti.wall_loss_pct
FROM chiller_tube_inspection cti
JOIN annual_chiller_pm acp ON cti.annual_pm_id = acp.id
JOIN equipment e ON acp.equipment_id = e.id
ORDER BY acp.inspection_year, e.name
```

**Series**:
- Line per chiller (different colors)
- Dashed horizontal line at 5% threshold
- Annotations for assets exceeding threshold

**File**: `src/components/chiller-annuals/dashboard/TubeLossTrendChart.tsx`

---

### 4. Refrigerant Loss Trend & Leak Heatmap

**Component**: `RefrigerantAnalytics` (tabs: Trend | Heatmap)

#### 4a. Refrigerant Loss Trend (Line Chart)

**Data**:
```typescript
interface RefrigerantTrendData {
  year: number;
  equipmentName: string;
  addedLbs: number;
  recoveredLbs: number;
  netLossLbs: number;
}
```

**Query**:
```sql
SELECT 
  acp.inspection_year AS year,
  e.name AS equipment_name,
  cri.added_amount_lbs,
  cri.recovery_amount_lbs,
  (COALESCE(cri.added_amount_lbs, 0) - COALESCE(cri.recovery_amount_lbs, 0)) AS net_loss_lbs
FROM chiller_refrigerant_inspection cri
JOIN annual_chiller_pm acp ON cri.annual_pm_id = acp.id
JOIN equipment e ON acp.equipment_id = e.id
ORDER BY acp.inspection_year
```

#### 4b. Leak Location Heatmap (Grid)

**Component**: `LeakLocationHeatmap`

**Data Structure**:
```typescript
interface LeakHeatmapCell {
  location: string;      // Building/location name
  leakLocation: string;  // shaft_seal, suction_flange, etc.
  count: number;
  totalInspections: number;
}
```

**Query**:
```sql
SELECT 
  e.location,
  cri.leak_location_code,
  COUNT(*) FILTER (WHERE cri.leak_detected = true) AS leak_count,
  COUNT(*) AS total_inspections
FROM chiller_refrigerant_inspection cri
JOIN annual_chiller_pm acp ON cri.annual_pm_id = acp.id
JOIN equipment e ON acp.equipment_id = e.id
GROUP BY e.location, cri.leak_location_code
```

**Display**: Grid with intensity coloring (darker = more leaks)

**File**: `src/components/chiller-annuals/dashboard/RefrigerantAnalytics.tsx`

---

### 5. kW/ton Trend & Degradation Indicator

**Component**: `EfficiencyTrendChart`

**Chart Type**: Combo chart (bars for kW/ton, line for degradation %)

**Data**:
```typescript
interface EfficiencyTrendData {
  year: number;
  equipmentName: string;
  kwPerTon: number;
  designKwPerTon: number;
  degradationPct: number;
  load_pct: number;
}
```

**Query**:
```sql
SELECT 
  acp.inspection_year,
  e.name AS equipment_name,
  cpt.kw_per_ton,
  cpt.design_kw_per_ton,
  cpt.degradation_since_last_year_pct,
  cpt.load_pct
FROM chiller_performance_test cpt
JOIN annual_chiller_pm acp ON cpt.annual_pm_id = acp.id
JOIN equipment e ON acp.equipment_id = e.id
WHERE cpt.kw_per_ton IS NOT NULL
ORDER BY acp.inspection_year, e.name
```

**Features**:
- Red highlight for degradation > 10%
- Comparison to design efficiency
- Load percentage annotation (normalize comparisons)

**File**: `src/components/chiller-annuals/dashboard/EfficiencyTrendChart.tsx`

---

### 6. High Risk / No Redundancy Assets

**Component**: `HighRiskAssetsList`

**Criteria for "High Risk / No Redundancy"**:
1. `overall_risk_level` IN ('high', 'critical')
2. AND (equipment serves critical load OR no backup unit exists)
3. OR multiple red flags detected

**Data Structure**:
```typescript
interface HighRiskAsset {
  id: string;
  name: string;
  location: string;
  riskScore: number;
  riskLevel: RiskLevel;
  redFlags: string[];
  hasBackup: boolean;
  lastInspection: string;
  recommendedAction: string;
  estimatedRepairCost: number | null;
}
```

**Query**:
```sql
SELECT 
  e.id, e.name, e.location,
  acp.overall_risk_score,
  acp.overall_risk_level,
  ARRAY_AGG(DISTINCT caf.issue_code) AS red_flags,
  e.metadata->>'has_backup' AS has_backup,
  acp.inspection_date,
  (SELECT SUM(caf2.estimated_cost) 
   FROM chiller_annual_finding caf2 
   WHERE caf2.annual_pm_id = acp.id AND caf2.status = 'open') AS estimated_repair_cost
FROM equipment e
JOIN annual_chiller_pm acp ON e.id = acp.equipment_id
LEFT JOIN chiller_annual_finding caf ON acp.id = caf.annual_pm_id
WHERE acp.overall_risk_level IN ('high', 'critical')
  AND acp.inspection_year = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY e.id, e.name, e.location, acp.id
ORDER BY acp.overall_risk_score DESC
```

**Display**: Cards with warning styling, expandable red flag details

**File**: `src/components/chiller-annuals/dashboard/HighRiskAssetsList.tsx`

---

### 7. Vendor Accountability Summary

**Component**: `VendorAccountabilitySummary`

**Purpose**: Track what was found vs. what was repaired by vendor/technician

**Data Structure**:
```typescript
interface VendorAccountability {
  vendorName: string;
  totalFindingsCreated: number;
  findingsResolved: number;
  findingsOpen: number;
  avgResolutionDays: number;
  estimatedCostTotal: number;
  actualCostTotal: number;
  topIssueCategories: string[];
}
```

**Query**:
```sql
SELECT 
  COALESCE(t."firstName" || ' ' || t."lastName", 'Unknown') AS vendor_name,
  COUNT(*) AS total_findings,
  COUNT(*) FILTER (WHERE caf.status = 'resolved') AS resolved,
  COUNT(*) FILTER (WHERE caf.status IN ('open', 'in_progress')) AS open,
  AVG(EXTRACT(DAY FROM (caf.resolution_date - caf.created_at))) FILTER (WHERE caf.status = 'resolved') AS avg_resolution_days,
  SUM(caf.estimated_cost) AS estimated_cost_total,
  SUM(caf.actual_cost) AS actual_cost_total,
  ARRAY_AGG(DISTINCT caf.category) AS categories
FROM chiller_annual_finding caf
JOIN annual_chiller_pm acp ON caf.annual_pm_id = acp.id
LEFT JOIN technicians t ON caf.responsible_party = t.id::text
GROUP BY vendor_name
ORDER BY total_findings DESC
```

**File**: `src/components/chiller-annuals/dashboard/VendorAccountabilitySummary.tsx`

---

## Sample Dataset (3 Chillers, 2 Years)

### Equipment Data

| ID | Name | Location | Model | Has Backup |
|----|------|----------|-------|------------|
| CH-001 | Main Plant Chiller | Building A - Mechanical Room | Trane CVHE-800 | Yes |
| CH-002 | Data Center Chiller | Building B - Roof | York YK-500 | No |
| CH-003 | Office Complex Chiller | Building C - Basement | Carrier 30HXC-600 | Yes |

### Annual PM Summary (2024-2025)

| Equipment | Year | Risk Score | Risk Level | kW/ton | Evap Plugged % | Cond Plugged % | Leak? |
|-----------|------|------------|------------|--------|----------------|----------------|-------|
| CH-001 | 2024 | 15 | low | 0.52 | 2.1% | 1.8% | No |
| CH-001 | 2025 | 25 | low | 0.54 | 2.5% | 2.2% | No |
| CH-002 | 2024 | 35 | medium | 0.58 | 4.2% | 3.5% | Yes (shaft seal) |
| CH-002 | 2025 | 65 | high | 0.68 | 7.8% | 5.2% | Yes (suction flange) |
| CH-003 | 2024 | 20 | low | 0.49 | 1.5% | 1.2% | No |
| CH-003 | 2025 | 45 | medium | 0.55 | 3.8% | 2.8% | No |

### Refrigerant Data

| Equipment | Year | Added (lbs) | Recovered (lbs) | Net Loss (lbs) |
|-----------|------|-------------|-----------------|----------------|
| CH-001 | 2024 | 25 | 10 | 15 |
| CH-001 | 2025 | 30 | 15 | 15 |
| CH-002 | 2024 | 85 | 20 | 65 |
| CH-002 | 2025 | 120 | 25 | 95 |
| CH-003 | 2024 | 15 | 8 | 7 |
| CH-003 | 2025 | 40 | 12 | 28 |

### Findings Summary

| Equipment | Year | Finding | Severity | Status | Est. Cost |
|-----------|------|---------|----------|--------|-----------|
| CH-002 | 2024 | REF002 - Refrigerant Leak | high | resolved | $4,500 |
| CH-002 | 2025 | REF002 - Refrigerant Leak | high | open | $6,200 |
| CH-002 | 2025 | TUBE003 - Tubes Exceeded Limit | high | open | $35,000 |
| CH-002 | 2025 | PERF002 - Efficiency Degraded | medium | open | $8,000 |
| CH-003 | 2025 | OIL002 - High Acid Number | high | in_progress | $3,500 |

---

## Executive Report Template

### Component: `ExecutiveReportGenerator`

**File**: `src/components/chiller-annuals/reports/ExecutiveReportGenerator.tsx`

### 1-Page Report Layout

```text
+----------------------------------------------------------+
|                                                          |
|  ANNUAL CHILLER MAINTENANCE EXECUTIVE SUMMARY            |
|  Report Period: 2025 Annual Inspections                  |
|  Generated: February 3, 2026                             |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  FLEET HEALTH SNAPSHOT                                   |
|  +------------+  +------------+  +------------+          |
|  | 3 Chillers |  | 78% Avg    |  | 1 Critical |          |
|  | Inspected  |  | Health     |  | Asset      |          |
|  +------------+  +------------+  +------------+          |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  RISK ASSESSMENT                                         |
|                                                          |
|  [============|=====|===] Risk Distribution              |
|   LOW (1)    MED (1) HIGH (1)                            |
|                                                          |
|  CRITICAL ASSET ALERT:                                   |
|  CH-002 (Data Center Chiller) scored 65/100 risk with:   |
|  - Refrigerant leak at suction flange (2nd consecutive)  |
|  - Evaporator tubes 7.8% plugged (exceeds 5% limit)      |
|  - Efficiency degraded 17% vs prior year                 |
|  - NO BACKUP UNIT AVAILABLE                              |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  KEY FINDINGS                                            |
|                                                          |
|  1. Data Center Chiller requires immediate attention     |
|     - Repeated refrigerant leak indicates compressor     |
|       seal degradation requiring major overhaul          |
|     - Tube plugging approaching capacity limit           |
|                                                          |
|  2. Office Complex Chiller oil degradation detected      |
|     - High acid number (0.08 mg KOH/g) indicates         |
|       moisture contamination; oil change in progress     |
|                                                          |
|  3. Main Plant Chiller performing within spec            |
|     - Slight efficiency variance (+3.8%) is acceptable   |
|     - Continue standard annual maintenance schedule      |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  CAPITAL RECOMMENDATIONS                                 |
|                                                          |
|  IMMEDIATE (0-90 days):                                  |
|  - CH-002: Compressor seal replacement - $6,200          |
|  - CH-002: Evaporator tube bundle evaluation - $35,000   |
|                                                          |
|  NEAR-TERM (90-180 days):                                |
|  - CH-003: Oil system service - $3,500                   |
|  - CH-002: VFD efficiency analysis - $8,000              |
|                                                          |
|  TOTAL RECOMMENDED INVESTMENT: $52,700                   |
|                                                          |
|  RISK MITIGATION NOTE:                                   |
|  CH-002 serves critical data center load with no         |
|  redundancy. Failure would result in estimated           |
|  $150,000+/day in business impact. Recommend expedited   |
|  repair authorization.                                   |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  VENDOR PERFORMANCE                                      |
|  Acme HVAC Services: 4 findings, 1 resolved (25%)        |
|  Internal Technicians: 1 finding, 0 resolved (0%)        |
|                                                          |
+----------------------------------------------------------+
```

### Executive Summary Text Generator

**Function**: `generateExecutiveSummaryText(data: FleetSummaryData): ExecutiveSummary`

```typescript
interface ExecutiveSummary {
  reportTitle: string;
  reportDate: string;
  reportPeriod: string;
  
  fleetSnapshot: {
    totalChillers: number;
    averageHealthScore: number;
    criticalAssets: number;
    noRedundancyRisk: number;
  };
  
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  
  criticalAlerts: Array<{
    assetName: string;
    location: string;
    riskScore: number;
    redFlags: string[];
    hasBackup: boolean;
    businessImpact: string;
  }>;
  
  keyFindings: Array<{
    priority: number;
    assetName: string;
    summary: string;
    details: string;
  }>;
  
  capitalRecommendations: {
    immediate: Array<{ asset: string; description: string; cost: number }>;
    nearTerm: Array<{ asset: string; description: string; cost: number }>;
    longTerm: Array<{ asset: string; description: string; cost: number }>;
    totalInvestment: number;
  };
  
  riskMitigationNote: string;
  
  vendorPerformance: Array<{
    vendorName: string;
    findingsCount: number;
    resolvedCount: number;
    resolutionRate: number;
  }>;
}
```

---

## Example Executive Summary Text (Based on Sample Data)

```text
ANNUAL CHILLER MAINTENANCE EXECUTIVE SUMMARY
Report Period: 2025 Annual Inspections
Generated: February 3, 2026

FLEET OVERVIEW
This report summarizes the annual maintenance inspections for 3 water-cooled 
chillers across your facilities. Overall fleet health averaged 78%, with one 
asset identified as high-risk requiring immediate attention.

CRITICAL FINDING
The Data Center Chiller (CH-002) located at Building B presents significant 
operational risk. This unit scored 65 out of 100 on our risk assessment, 
classifying it as HIGH RISK. Key concerns include:

• Refrigerant leak detected at the suction flange - this is the second 
  consecutive year a leak has been identified, indicating ongoing compressor 
  seal deterioration
• Evaporator tube plugging has reached 7.8%, exceeding the 5% manufacturer 
  threshold and reducing heat transfer capacity
• Operating efficiency has degraded 17% compared to last year (0.58 → 0.68 
  kW/ton), indicating fouling or mechanical issues
• This unit has NO BACKUP and serves the data center, creating a single 
  point of failure for critical IT infrastructure

RECOMMENDATION
Immediate repair authorization is recommended for CH-002. Estimated repair 
cost is $49,200, which should be weighed against the estimated $150,000+ 
daily business impact of an unplanned data center cooling failure.

CAPITAL BUDGET IMPACT
Total recommended investment across all assets: $52,700
• Immediate (0-90 days): $41,200
• Near-term (90-180 days): $11,500

VENDOR ACCOUNTABILITY
Acme HVAC Services has 4 open findings with a 25% resolution rate. 
Follow-up with vendor on outstanding repairs is recommended.
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/chiller-annuals/dashboard/ChillerAnnualsDashboard.tsx` | Main dashboard page component |
| `src/components/chiller-annuals/dashboard/FleetHealthOverview.tsx` | KPI cards section |
| `src/components/chiller-annuals/dashboard/ChillerHealthScoreTable.tsx` | Asset-by-asset health table |
| `src/components/chiller-annuals/dashboard/TubeLossTrendChart.tsx` | Multi-year tube plugging trend |
| `src/components/chiller-annuals/dashboard/RefrigerantAnalytics.tsx` | Loss trend + leak heatmap |
| `src/components/chiller-annuals/dashboard/LeakLocationHeatmap.tsx` | Grid heatmap component |
| `src/components/chiller-annuals/dashboard/EfficiencyTrendChart.tsx` | kW/ton trend with degradation |
| `src/components/chiller-annuals/dashboard/HighRiskAssetsList.tsx` | Critical assets with no backup |
| `src/components/chiller-annuals/dashboard/VendorAccountabilitySummary.tsx` | Vendor performance table |
| `src/hooks/useChillerFleetHealth.ts` | Data fetching hook for fleet metrics |
| `src/hooks/useChillerTrendData.ts` | Multi-year trend data hook |
| `src/hooks/useVendorAccountability.ts` | Vendor findings aggregation |
| `src/components/chiller-annuals/reports/ExecutiveReportGenerator.tsx` | Report template component |
| `src/components/chiller-annuals/reports/ExecutiveReportPreview.tsx` | Print-optimized preview |
| `src/services/executiveReportService.ts` | Text generation for executive summary |
| `src/types/chillerDashboard.ts` | TypeScript interfaces for dashboard data |

---

## Dashboard Navigation

Add a "Dashboard" tab to the existing ChillerAnnuals page:

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="all">All Inspections</TabsTrigger>
    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
    <TabsTrigger value="reports">Executive Report</TabsTrigger>
  </TabsList>
  
  <TabsContent value="dashboard">
    <ChillerAnnualsDashboard />
  </TabsContent>
  
  <TabsContent value="reports">
    <ExecutiveReportGenerator />
  </TabsContent>
</Tabs>
```

---

## Summary

| Component | Data Source | Chart Type |
|-----------|-------------|------------|
| Fleet Health Overview | KPI queries | Stat cards |
| Chiller Health Score | annual_chiller_pm + equipment | Sortable table |
| Tube Loss Trend | chiller_tube_inspection | Line chart |
| Refrigerant Loss Trend | chiller_refrigerant_inspection | Line chart |
| Leak Location Heatmap | chiller_refrigerant_inspection | Grid heatmap |
| kW/ton Trend | chiller_performance_test | Combo chart |
| High Risk Assets | annual_chiller_pm + findings | Card list |
| Vendor Accountability | chiller_annual_finding + technicians | Data table |
| Executive Report | Aggregated fleet data | Print template |

