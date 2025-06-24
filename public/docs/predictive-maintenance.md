
# Predictive Maintenance System - Comprehensive Manual

## Table of Contents
1. [Overview & Introduction](#overview--introduction)
2. [Getting Started](#getting-started)
3. [Recording Manual Readings](#recording-manual-readings)
4. [Understanding Reading History & Trends](#understanding-reading-history--trends)
5. [AI Analysis & Diagnostics](#ai-analysis--diagnostics)
6. [Analysis Data Source Selection](#analysis-data-source-selection)
7. [Equipment-Specific Guidelines](#equipment-specific-guidelines)
8. [Mobile Usage & Field Operations](#mobile-usage--field-operations)
9. [Troubleshooting & FAQ](#troubleshooting--faq)

---

## Overview & Introduction

### What is Predictive Maintenance in AssetGuardian?

AssetGuardian's predictive maintenance system uses manual equipment readings combined with AI analysis to predict equipment failures before they occur. This proactive approach helps:

- **Reduce unexpected equipment failures** by 60-80%
- **Lower maintenance costs** through optimized scheduling
- **Extend equipment lifespan** with proper monitoring
- **Improve energy efficiency** through early detection of performance issues

### Benefits of Manual Data Entry

While automated sensors are ideal, manual readings provide:
- **Cost-effective monitoring** for all equipment types
- **Flexible data collection** based on equipment accessibility
- **Human observation integration** (sounds, vibrations, visual conditions)
- **Baseline establishment** for future automated systems

### Industry Standards Integration

The system uses industry-standard thresholds and ranges for:
- **HVAC equipment** (AHU, RTU, Chillers, Cooling Towers)
- **Mechanical systems** (Pumps, Motors, Fans)
- **Building equipment** (Elevators, Emergency systems)

---

## Getting Started

### Accessing Predictive Maintenance

1. **Navigate to the dashboard** and select "Predictive Maintenance" from the main menu
2. **Select equipment** from the dropdown list to begin monitoring
3. **Review equipment details** including type, location, and available reading templates

### Dashboard Interface Overview

The predictive maintenance dashboard has three main tabs:

- **Record Readings**: Enter manual equipment readings
- **Reading History**: View trends and historical data
- **AI Analysis**: Get predictive insights and recommendations

### Equipment Selection

1. Click the **equipment dropdown** at the top of the page
2. Select from your organization's equipment list
3. The system automatically detects equipment type and loads appropriate reading templates

---

## Recording Manual Readings

### Step-by-Step Reading Entry

1. **Select Equipment**: Choose the equipment you want to monitor
2. **Choose Reading Type**: Select from pre-defined reading types based on equipment
3. **Enter Value**: Input the measured value (numbers only)
4. **Verify Unit**: Unit is auto-filled based on reading type
5. **Add Notes** (Optional): Include observations or conditions
6. **Add Location Notes** (Optional): Note access points or measurement locations
7. **Click "Record Reading"** to save

### Reading Types by Equipment

#### Air Handling Units (AHU)
- **Supply Air Temperature** (55-65°F normal)
- **Return Air Temperature** (70-78°F normal)
- **Static Pressure** (0.5-2.0 in. W.C. normal)
- **Filter Pressure Drop** (0.1-0.5 in. W.C. normal)
- **Fan Motor Current** (5-15 Amps normal)
- **Vibration Level** (0-2.8 mm/s normal)

#### Chillers
- **Evaporator Entering Water Temp** (54-58°F normal)
- **Evaporator Leaving Water Temp** (42-48°F normal)
- **Condenser Entering Water Temp** (75-85°F normal)
- **Compressor Current** (50-150 Amps normal)
- **Suction Pressure** (35-50 PSIG normal)
- **Discharge Pressure** (150-250 PSIG normal)
- **Oil Pressure** (45-65 PSIG normal)

#### Rooftop Units (RTU)
- **Supply Air Temperature** (55-65°F normal)
- **Return Air Temperature** (70-78°F normal)
- **Suction Pressure** (60-80 PSIG normal)
- **Discharge Pressure** (200-300 PSIG normal)
- **Compressor Current** (15-45 Amps normal)
- **Supply Fan Current** (3-12 Amps normal)

#### Cooling Towers
- **Water Temperature In** (85-95°F normal)
- **Water Temperature Out** (75-85°F normal)
- **Fan Motor Current** (8-25 Amps normal)
- **Fan Vibration** (0-2.8 mm/s normal)
- **Water Flow Rate** (500-1500 GPM normal)

### Best Practices for Data Collection

#### Timing
- **Consistent timing**: Take readings at the same time daily
- **Operating conditions**: Ensure equipment is under normal load
- **Seasonal adjustments**: Account for weather and load variations

#### Accuracy
- **Calibrated instruments**: Use properly calibrated meters
- **Multiple readings**: Take 2-3 readings and average them
- **Steady state**: Wait for equipment to reach steady operating conditions

#### Documentation
- **Environmental conditions**: Note temperature, humidity, load conditions
- **Recent maintenance**: Record any recent service or repairs
- **Unusual observations**: Document sounds, vibrations, or visual issues

---

## Understanding Reading History & Trends

### Reading the Charts

#### Trend Lines
- **Blue line**: Your actual readings over time
- **Green dashed lines**: Normal operating range (upper and lower limits)
- **Yellow dashed line**: Warning threshold
- **Red dashed line**: Critical threshold

#### Status Badges
- **Green (Normal)**: Reading within acceptable range
- **Yellow (Warning)**: Reading approaching problem threshold
- **Red (Critical)**: Reading indicates immediate attention needed
- **Gray (No Standards)**: No industry standards available for comparison

### Interpreting Trends

#### Upward Trends
- **Temperature increases**: May indicate fouling, reduced airflow, or mechanical wear
- **Pressure increases**: Could signal filter clogging or system restrictions
- **Current increases**: Often indicates mechanical binding or electrical issues

#### Downward Trends
- **Temperature decreases**: May indicate refrigerant leaks or control issues
- **Pressure decreases**: Could signal belt slippage or fan issues
- **Current decreases**: Might indicate electrical problems or reduced load

#### Fluctuating Readings
- **High variation**: May indicate control issues or intermittent problems
- **Cycling patterns**: Could be normal operation or indicate short cycling issues

---

## AI Analysis & Diagnostics

### How AI Analysis Works

The AI system:
1. **Compares readings** against industry standards and equipment baselines
2. **Identifies patterns** that indicate potential issues
3. **Provides recommendations** based on historical failure modes
4. **Creates work orders** automatically for critical issues

### Understanding AI Recommendations

#### Risk Levels
- **Low Risk**: Continue routine maintenance schedule
- **Medium Risk**: Schedule preventive maintenance within 30 days
- **High Risk**: Immediate attention required within 7 days

#### Confidence Scores
- **90-100%**: Very reliable prediction based on strong data patterns
- **70-89%**: Good prediction with sufficient data
- **50-69%**: Moderate confidence, consider additional monitoring
- **Below 50%**: Low confidence, more data needed

### Automated Work Orders

When critical issues are detected, the system can automatically:
- **Create work orders** with detailed descriptions
- **Assign priority levels** based on risk assessment
- **Set due dates** based on urgency
- **Include diagnostic information** for technicians

---

## Analysis Data Source Selection

### Understanding Data Sources

When running AI analysis, you can choose which historical data to use. This selection affects the quality and accuracy of the predictive insights.

#### Auto (Recommended)
- **What it uses**: Combines both manual sensor data and maintenance check data
- **Best for**: Most situations - provides comprehensive analysis
- **How it works**: Uses manual sensor readings when available, supplements with maintenance check data
- **Advantages**: 
  - Most complete picture of equipment health
  - Balances real-time data with maintenance history
  - Highest confidence scores for predictions
- **When to use**: Default choice for most analysis

#### Manual Sensor Data Only
- **What it uses**: Only direct sensor readings from equipment monitoring
- **Best for**: Equipment with frequent manual readings or real-time monitoring needs
- **How it works**: Analyzes only data from the "Record Readings" section
- **Advantages**:
  - Most current and accurate equipment conditions
  - Higher frequency data points
  - Real-time performance insights
- **When to use**: 
  - When you have regular manual readings (daily/weekly)
  - For critical equipment requiring frequent monitoring
  - When maintenance check data is outdated

#### Maintenance Check Data Only
- **What it uses**: Only readings from completed maintenance check forms
- **Best for**: Equipment with thorough maintenance documentation but limited manual readings
- **How it works**: Analyzes data collected during formal maintenance inspections
- **Advantages**:
  - Comprehensive equipment assessments
  - Includes technician observations and notes
  - Standardized measurement procedures
- **When to use**:
  - When manual sensor readings are not available
  - For equipment with regular maintenance schedules
  - To analyze long-term maintenance trends

### Choosing the Right Data Source

#### Decision Matrix

| Situation | Recommended Source | Why |
|-----------|-------------------|-----|
| Equipment has both manual readings and maintenance checks | **Auto** | Most comprehensive analysis |
| Daily/weekly manual readings available | **Manual Sensor Data Only** | Most current information |
| Only maintenance checks performed | **Maintenance Check Data Only** | Use available data |
| New equipment with limited history | **Auto** | Makes best use of available data |
| Critical equipment monitoring | **Manual Sensor Data Only** | Most frequent, accurate data |

#### Data Quality Indicators

The system shows data quality badges to help you understand your analysis:

- **Comprehensive Data**: Both manual and maintenance check data available
- **Manual Sensor Data**: Only manual readings available
- **Maintenance Check Data**: Only maintenance check readings available
- **Limited Data**: Insufficient data for reliable analysis

### Troubleshooting Data Source Issues

#### "No manual sensor data available"
- **Problem**: No readings recorded in the "Record Readings" section
- **Solution**: Start recording manual readings for this equipment
- **Next steps**: 
  1. Go to the "Record Readings" tab
  2. Select your equipment
  3. Begin taking regular measurements
  4. Return to analysis after collecting some data

#### "No maintenance check data available"
- **Problem**: No completed maintenance checks for this equipment
- **Solution**: Perform maintenance checks using the maintenance check forms
- **Next steps**:
  1. Click "Go to Maintenance Checks" button
  2. Complete a maintenance check for your equipment
  3. Return to predictive analysis
  4. Use "Maintenance Check Data Only" or "Auto" source

#### "Limited data for analysis"
- **Problem**: Not enough historical data for reliable predictions
- **Solution**: Collect more data over time
- **Recommendations**:
  - Take readings more frequently (weekly instead of monthly)
  - Ensure maintenance checks include all required measurements
  - Allow 2-4 weeks of data collection before expecting high confidence scores

### Best Practices for Data Source Selection

#### For New Implementations
1. Start with **Auto** setting
2. Focus on building both manual and maintenance check data
3. Switch to specific sources once patterns emerge

#### For Established Equipment
1. Use **Manual Sensor Data Only** for critical equipment with frequent readings
2. Use **Maintenance Check Data Only** for equipment with thorough maintenance programs
3. Use **Auto** for balanced analysis

#### For Troubleshooting
1. Try different data sources to compare results
2. Manual sensor data is best for recent issues
3. Maintenance check data is best for long-term trends

---

## Equipment-Specific Guidelines

### Air Handling Units (AHU)

#### Critical Readings
1. **Filter Pressure Drop** > 1.0 in. W.C. = Replace filters immediately
2. **Vibration** > 7.1 mm/s = Stop unit and inspect bearings
3. **Fan Current** > 20 Amps = Check for mechanical binding

#### Common Failure Patterns
- **Gradually increasing static pressure**: Filter loading, duct restrictions
- **Increasing fan current with stable pressure**: Belt wear, bearing issues
- **Temperature drift**: Control valve issues, sensor calibration

### Chillers

#### Critical Readings
1. **Oil Pressure** < 35 PSIG = Stop compressor immediately
2. **Discharge Pressure** > 300 PSIG = Condenser issue, reduce load
3. **Compressor Current** > 180 Amps = Electrical or mechanical overload

#### Common Failure Patterns
- **Rising discharge pressure**: Condenser fouling, refrigerant overcharge
- **Dropping suction pressure**: Refrigerant leak, expansion valve issue
- **Increasing current draw**: Bearing wear, electrical issues

### Cooling Towers

#### Critical Readings
1. **Fan Vibration** > 7.1 mm/s = Stop fan, inspect for damage
2. **Water Flow** < 300 GPM = Check pump and strainers
3. **Fan Current** > 35 Amps = Motor or mechanical overload

#### Common Failure Patterns
- **Increasing fan current**: Belt wear, bearing issues, blade fouling
- **Rising water temperatures**: Reduced airflow, heat exchanger fouling
- **Vibration increases**: Fan imbalance, bearing wear

---

## Mobile Usage & Field Operations

### Mobile Interface Features

- **Responsive design**: Works on phones and tablets
- **QR code scanning**: Quickly access equipment records
- **Offline capability**: Enter readings without internet connection
- **Photo integration**: Attach photos to reading entries

### QR Code Integration

1. **Generate QR codes** for each piece of equipment
2. **Print and attach** QR codes to equipment
3. **Scan codes** to quickly access reading forms
4. **Streamline data entry** for field technicians

### Best Practices for Field Use

#### Equipment Access
- **Safety first**: Follow lockout/tagout procedures
- **Proper PPE**: Use appropriate safety equipment
- **Access planning**: Schedule readings during optimal access times

#### Data Quality
- **Double-check entries**: Verify readings before submission
- **Consistent locations**: Take readings from the same measurement points
- **Environmental notes**: Record conditions affecting readings

---

## Troubleshooting & FAQ

### Common Issues

#### "No Reading Templates Available"
- **Cause**: Equipment type not recognized
- **Solution**: Check equipment name and type, contact administrator

#### "Reading Outside Expected Range"
- **Cause**: Unusual reading value
- **Solution**: Verify measurement, check equipment condition, document observations

#### "Cannot Save Reading"
- **Cause**: Network connectivity or validation error
- **Solution**: Check internet connection, verify all required fields completed

### Frequently Asked Questions

#### Q: How often should I take readings?
**A**: Minimum weekly for critical equipment, daily for equipment with known issues, monthly for stable equipment.

#### Q: What if I don't have all the measurement tools?
**A**: Start with available measurements. Basic temperature and current readings provide significant value.

#### Q: Can I modify the reading templates?
**A**: Contact your system administrator to add custom reading types for specific equipment.

#### Q: How accurate do my readings need to be?
**A**: ±2% accuracy is sufficient for trend analysis. Consistency is more important than absolute accuracy.

#### Q: What should I do if AI recommends immediate action?
**A**: Follow your organization's emergency procedures, document the issue, and contact maintenance supervisor.

#### Q: Can I export the reading data?
**A**: Yes, data can be exported through the analytics section for further analysis.

#### Q: Which data source should I choose for AI analysis?
**A**: Use "Auto" for most situations. Choose "Manual Sensor Data Only" if you have frequent manual readings, or "Maintenance Check Data Only" if you only have maintenance check records.

#### Q: Why does my analysis show low confidence?
**A**: Low confidence usually means insufficient data. Collect more readings over time, ensure both manual and maintenance check data are available, and verify readings are accurate.

### Getting Help

- **Technical Support**: Contact your system administrator
- **Training Resources**: Access video tutorials in the help section
- **Best Practices**: Consult with experienced maintenance staff
- **Equipment Manuals**: Reference manufacturer documentation for specific procedures

---

## Conclusion

Regular use of the predictive maintenance system will:
- **Improve equipment reliability** through early issue detection
- **Reduce emergency repairs** by identifying problems before failure
- **Optimize maintenance schedules** based on actual equipment condition
- **Extend equipment life** through proper monitoring and care

Remember: The system is only as good as the data provided. Consistent, accurate readings combined with proper follow-up on recommendations will maximize the benefits of predictive maintenance.

For additional support or training, contact your facility management team or system administrator.

