# Annual Chiller Maintenance & Risk Intelligence Guide

## Table of Contents
1. [Overview & Introduction](#overview--introduction)
2. [Accessing the Module](#accessing-the-module)
3. [Chiller Health Dashboard](#chiller-health-dashboard)
   - [Fleet Health Overview](#fleet-health-overview)
   - [Health Score by Asset](#health-score-by-asset)
   - [Tube Loss Trend Analysis](#tube-loss-trend-analysis)
   - [Refrigerant Analytics & Leak Heatmap](#refrigerant-analytics--leak-heatmap)
   - [Efficiency Trend (kW/ton)](#efficiency-trend-kwton)
   - [High Risk Asset Identification](#high-risk-asset-identification)
   - [Vendor Accountability Summary](#vendor-accountability-summary)
4. [Annual Inspection Wizard](#annual-inspection-wizard)
5. [Executive Reporting](#executive-reporting)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview & Introduction

### What is the Annual Chiller Maintenance Module?

The Annual Chiller Maintenance & Risk Intelligence module is a specialized inspection system designed for water-cooled chillers. It provides comprehensive annual assessment capabilities with multi-year trending, risk scoring, and executive reporting features.

### Key Capabilities

- **16 Structured Inspection Categories**: Covers all critical chiller systems including refrigerant, oil, tubes, water side, water quality, electrical, and performance
- **Risk Scoring & Health Metrics**: Automated risk assessment with color-coded severity levels
- **Multi-Year Trend Analysis**: Track equipment degradation over time with visual charts
- **Executive Reporting**: Generate 1-page summaries for leadership review
- **Mobile-Friendly Inspection Wizard**: Complete annual inspections from any device

### Target Equipment

This module is designed for water-cooled chillers including:
- Centrifugal chillers (Trane CVHE, Carrier 30HXC, York YK, etc.)
- Screw chillers
- Absorption chillers
- Any chiller requiring comprehensive annual PM

### Benefits

- **Proactive Risk Management**: Identify issues before they cause failures
- **Capital Planning Support**: Data-driven repair and replacement recommendations
- **Compliance Documentation**: Comprehensive records for regulatory requirements
- **Vendor Accountability**: Track contractor performance and resolution rates

---

## Accessing the Module

### Navigation

1. From the main menu, click **Chiller Annuals**
2. The module opens with three main tabs:
   - **All Inspections**: View and manage inspection records
   - **Dashboard**: Fleet health analytics and trends
   - **Executive Report**: Generate leadership summaries

### Quick Start

1. Navigate to **Chiller Annuals** from the main menu
2. Click **Start New Inspection** to begin an annual inspection
3. Select the chiller from the equipment dropdown
4. Follow the 9-step inspection wizard
5. Review and submit the completed inspection

---

## Chiller Health Dashboard

The Dashboard tab provides comprehensive analytics for your chiller fleet with real-time visibility into equipment health, trends, and risk factors.

### Fleet Health Overview

The top section displays key performance indicators (KPIs) as summary cards:

| KPI | Description |
|-----|-------------|
| **Total Chillers** | Number of chillers in your fleet |
| **Average Health Score** | Fleet-wide health percentage (0-100%) |
| **High Risk Assets** | Count of chillers with HIGH or CRITICAL risk levels |
| **No Redundancy Risk** | High-risk assets without backup units |
| **Next Inspection Due** | Earliest upcoming annual inspection date |

#### Health Score Calculation

Health Score = 100 - Risk Score

- **90-100%**: Excellent condition
- **70-89%**: Good condition with minor concerns
- **50-69%**: Fair condition, schedule maintenance
- **Below 50%**: Poor condition, requires immediate attention

### Health Score by Asset

A sortable table showing each chiller's current health status:

| Column | Description |
|--------|-------------|
| **Asset Name** | Chiller identifier (click to view details) |
| **Location** | Building/area where chiller is installed |
| **Model** | Manufacturer and model number |
| **Health Score** | Visual progress bar (0-100%) |
| **Risk Level** | Color-coded badge (Low/Medium/High/Critical) |
| **Last Inspection** | Date of most recent annual PM |
| **Trend** | Year-over-year score change (↑ improving, ↓ declining) |

#### Color Coding

- **Green**: Low risk (score < 25)
- **Yellow**: Medium risk (score 25-50)
- **Orange**: High risk (score 50-75)
- **Red**: Critical risk (score > 75)

### Tube Loss Trend Analysis

A multi-year line chart tracking tube plugging percentages for evaporator and condenser bundles.

#### Understanding the Chart

- **X-Axis**: Inspection years
- **Y-Axis**: Plugged tube percentage (%)
- **Lines**: One line per chiller, color-coded
- **Red Dashed Line**: 5% threshold (manufacturer limit)

#### Key Indicators

- **Steady increase**: Normal tube degradation over time
- **Sharp increase**: Possible water quality issues or accelerated fouling
- **Approaching 5%**: Plan for tube bundle replacement
- **Exceeding 5%**: Immediate replacement recommended

#### Best Practices

- Compare evaporator vs condenser trends
- Correlate with water treatment reports
- Plan capital replacement when approaching 5%

### Refrigerant Analytics & Leak Heatmap

Two visualizations for refrigerant system health:

#### Refrigerant Loss Trend (Bar Chart)

Tracks annual refrigerant additions and recoveries:

| Metric | Description |
|--------|-------------|
| **Added (lbs)** | Refrigerant added during the year |
| **Recovered (lbs)** | Refrigerant recovered during service |
| **Net Loss (lbs)** | Added minus recovered = actual loss |

**Warning Signs**:
- Net loss > 10% of charge = significant leak
- Increasing year-over-year = deteriorating seals
- Sudden spike = major leak event

#### Leak Location Heatmap (Grid)

Visual grid showing where leaks occur most frequently:

- **Rows**: Building/location
- **Columns**: Leak location codes (shaft seal, suction flange, etc.)
- **Color Intensity**: Darker = more frequent leaks

**Common Leak Locations**:
- Shaft seal (most common on centrifugal)
- Suction/discharge flanges
- Relief valve
- Tube bundle gaskets
- Purge unit connections

### Efficiency Trend (kW/ton)

Combo chart tracking chiller efficiency over time:

#### Chart Elements

- **Bars**: Actual kW/ton at each inspection
- **Line**: Degradation percentage vs prior year
- **Dashed Line**: Design kW/ton specification

#### Interpreting Results

| Condition | Meaning | Action |
|-----------|---------|--------|
| **< Design kW/ton** | Operating better than design | Continue maintenance |
| **Within 5% of design** | Normal operation | Monitor trends |
| **5-10% above design** | Minor efficiency loss | Schedule evaluation |
| **> 10% above design** | Significant degradation | Immediate service needed |

#### Load Normalization

Efficiency comparisons should account for operating load:
- Compare readings at similar load percentages
- Full load efficiency differs from part load
- Check if load percentage is annotated on chart

### High Risk Asset Identification

Dedicated section highlighting chillers requiring immediate attention:

#### Criteria for High Risk Classification

1. Overall risk level = HIGH or CRITICAL
2. No backup unit available (single point of failure)
3. Multiple red flags detected
4. Serves critical load (data center, hospital, etc.)

#### Information Displayed

- Asset name and location
- Current risk score and level
- Red flags (specific issues identified)
- Backup status
- Last inspection date
- Recommended action
- Estimated repair cost

#### Taking Action

1. Click on any high-risk asset for details
2. Review the specific findings
3. Generate work orders as needed
4. Track resolution through vendor accountability

### Vendor Accountability Summary

Table tracking contractor and technician performance:

| Column | Description |
|--------|-------------|
| **Vendor/Technician** | Name of responsible party |
| **Total Findings** | Number of issues identified |
| **Resolved** | Count of closed findings |
| **Open** | Count of outstanding issues |
| **Resolution Rate** | Percentage resolved |
| **Avg Resolution Days** | Average time to resolve |
| **Total Estimated Cost** | Sum of estimated repair costs |
| **Total Actual Cost** | Sum of completed repair costs |

#### Performance Benchmarks

- **Resolution Rate > 80%**: Good performance
- **Resolution Rate 50-80%**: Needs improvement
- **Resolution Rate < 50%**: Performance issue

---

## Annual Inspection Wizard

The 9-step inspection wizard guides technicians through a comprehensive annual chiller assessment.

### Step 1: Chiller Information

Basic equipment and inspection details:
- Equipment selection
- Inspection date
- Technician assignment
- Chiller model and serial
- Operating hours at inspection
- Chiller age (years)

### Step 2: Refrigerant System

Refrigerant charge and leak detection:
- Refrigerant type
- Nameplate charge (lbs)
- Actual charge (lbs)
- Leak detection results
- Leak location (if detected)
- Purge unit hours/cycles
- Moisture indicator color
- Acid test results

### Step 3: Oil System

Lubricant condition and analysis:
- Oil type
- Oil level percentage
- Oil sample collected (Y/N)
- Visual appearance
- Lab analysis results (if available)
- Oil filter replaced (Y/N)
- Oil heater functional (Y/N)

### Step 4: Evaporator Tubes

Evaporator bundle inspection:
- Total tube count
- Tubes plugged (previous)
- Tubes plugged (new this year)
- Plugged percentage
- Wall thickness measurements
- Test method (eddy current, visual)
- Cleaning performed (Y/N)
- Cleaning method
- Approach temperature (before/after cleaning)

### Step 5: Condenser Tubes

Condenser bundle inspection:
- Same fields as evaporator
- Includes sacrificial anode inspection
- Water box condition
- Gasket replacement status

### Step 6: Water Side

Chilled and condenser water systems:
- Flow rates (GPM)
- Delta T measurements
- Pressure drop readings
- Glycol concentration (if applicable)
- Expansion tank level
- Isolation valve condition

### Step 7: Water Quality

Water treatment and chemistry:
- Sample location
- pH level
- Conductivity
- Hardness
- Chlorides
- Treatment vendor
- Legionella test results
- Langelier Saturation Index

### Step 8: Electrical & Motor

Electrical system inspection:
- Voltage measurements (3-phase)
- Amperage measurements (3-phase)
- Imbalance calculations
- Starter/contactor condition
- VFD status (if equipped)
- Insulation resistance
- Vibration readings
- Bearing temperatures

### Step 9: Performance Test

Operating performance validation:
- Chilled water temps (entering/leaving)
- Condenser water temps (entering/leaving)
- Suction/discharge pressures
- Motor amps under load
- kW input measured
- Tons output calculated
- kW/ton efficiency
- Comparison to design specifications

### Mobile Usage Guidelines

#### Before Arriving On-Site

1. Ensure device is charged
2. Download any required offline data
3. Review previous year's inspection
4. Prepare measurement tools

#### During Inspection

1. Follow the wizard steps in order
2. Use the camera to attach photos to findings
3. Save progress frequently (auto-save enabled)
4. Add notes for unusual observations

#### Completing the Inspection

1. Review all entries before submission
2. Verify findings are properly documented
3. Submit the completed inspection
4. Generate work orders for critical findings

---

## Executive Reporting

### Report Generation

1. Navigate to the **Executive Report** tab
2. Select the reporting period (year)
3. Choose specific chillers or entire fleet
4. Click **Generate Report**
5. Review the preview
6. Print or export as needed

### Report Contents

The 1-page executive summary includes:

#### Fleet Health Snapshot
- Total chillers inspected
- Average health score
- Critical asset count
- Risk distribution chart

#### Critical Alerts
- High-risk assets highlighted
- Key issues identified
- Business impact assessment

#### Key Findings
- Top 3-5 priority issues
- Equipment-specific concerns
- Trend observations

#### Capital Recommendations
- Immediate (0-90 days)
- Near-term (90-180 days)
- Long-term planning
- Total investment required

#### Vendor Performance
- Resolution rates
- Outstanding issues

### Print/Export Options

- **Print**: Use browser print function (Ctrl/Cmd + P)
- **PDF Export**: Print to PDF
- **Share**: Copy link to report view

### Understanding the Executive Summary

#### Risk Distribution

Visual representation of fleet health:
- Number of chillers at each risk level
- Color-coded for quick understanding
- Comparison to prior periods

#### Capital Budgeting

Use the recommendations section for:
- Operating budget planning
- Capital expenditure requests
- Maintenance scheduling
- Replacement forecasting

---

## Best Practices

### Inspection Timing

- **Optimal Period**: Spring (March-May) or Fall (September-November)
- **Avoid**: Peak cooling season when chillers are under heavy load
- **Consistency**: Same time each year for trend accuracy

### Data Quality

- **Complete All Fields**: Missing data reduces analysis accuracy
- **Calibrated Instruments**: Use properly calibrated measurement tools
- **Photo Documentation**: Attach photos for all significant findings
- **Detailed Notes**: Include specific observations, not just pass/fail

### Trend Monitoring

- **Review Dashboard Monthly**: Check for emerging issues
- **Compare Year-Over-Year**: Look for degradation patterns
- **Act on Thresholds**: Don't wait until limits are exceeded

### Work Order Integration

- **Generate Immediately**: Create work orders for critical findings
- **Track to Closure**: Monitor vendor resolution
- **Verify Repairs**: Confirm fixes during next inspection

### Executive Communication

- **Regular Reporting**: Share summaries quarterly
- **Capital Planning**: Present 3-5 year replacement forecasts
- **Risk Communication**: Highlight business impact of failures

---

## Troubleshooting

### Common Issues

#### "Equipment not found in dropdown"
- **Cause**: Chiller not tagged as correct equipment type
- **Solution**: Update equipment type in Settings → Equipment Management

#### "Cannot save inspection progress"
- **Cause**: Network connectivity issue
- **Solution**: 
  1. Check internet connection
  2. Data is auto-saved locally
  3. Retry when connection restored

#### "Dashboard shows no data"
- **Cause**: No completed inspections for selected period
- **Solution**: 
  1. Complete at least one annual inspection
  2. Verify date range selection
  3. Check equipment filter settings

#### "Trend charts not displaying"
- **Cause**: Insufficient historical data
- **Solution**: 
  1. Requires minimum 2 years of data for trends
  2. Enter historical inspections if available
  3. Charts will populate as data accumulates

#### "Executive report generation fails"
- **Cause**: Missing required data fields
- **Solution**: 
  1. Review incomplete inspections
  2. Fill in missing required fields
  3. Retry report generation

### Getting Help

- **Technical Support**: Contact your system administrator
- **Training**: Request training session for new users
- **Documentation**: Reference this guide for procedures
- **Equipment Manuals**: Consult manufacturer documentation for specifications

---

## Conclusion

The Annual Chiller Maintenance & Risk Intelligence module transforms annual inspections from a compliance activity into a strategic asset management tool. By consistently using this system, you will:

- **Extend Equipment Life**: Through early issue detection
- **Reduce Unplanned Downtime**: With proactive maintenance
- **Optimize Capital Spending**: Using data-driven decisions
- **Improve Vendor Accountability**: By tracking performance
- **Support Executive Decisions**: With clear reporting

Regular use of the dashboard and timely follow-up on findings will maximize the value of your annual chiller maintenance program.

For additional support or training, contact your facility management team or system administrator.
