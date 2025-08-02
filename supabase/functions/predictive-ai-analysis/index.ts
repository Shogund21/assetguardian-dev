
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { equipmentData, sensorReadings, thresholds, maintenanceHistory, readingSource } = await req.json()
    
    console.log('Received data:', {
      equipmentData,
      sensorReadingsCount: sensorReadings?.length || 0,
      maintenanceHistoryCount: maintenanceHistory?.length || 0,
      thresholdsCount: thresholds?.length || 0,
      readingSource
    });
    
    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Analyze data sources
    const manualReadings = sensorReadings.filter((r: any) => r.source === 'manual' || !r.source);
    const standardReadings = sensorReadings.filter((r: any) => r.source === 'maintenance_check');
    const dataSourceSummary = `Data includes ${manualReadings.length} manual readings and ${standardReadings.length} standard maintenance check readings.`;

    // Calculate statistical baselines and anomalies
    const calculateBaselines = (readings: any[]) => {
      const grouped = readings.reduce((acc: any, reading: any) => {
        if (!acc[reading.sensor_type]) acc[reading.sensor_type] = [];
        acc[reading.sensor_type].push(reading.value);
        return acc;
      }, {});

      const baselines: any = {};
      for (const [type, values] of Object.entries(grouped) as [string, number[]][]) {
        if (values.length >= 5) {
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
          const stdDev = Math.sqrt(variance);
          baselines[type] = { mean, stdDev, count: values.length };
        }
      }
      return baselines;
    };

    const detectAnomalies = (readings: any[], baselines: any) => {
      const anomalies = [];
      const latest = readings.reduce((acc: any, reading: any) => {
        if (!acc[reading.sensor_type] || new Date(reading.timestamp_utc) > new Date(acc[reading.sensor_type].timestamp_utc)) {
          acc[reading.sensor_type] = reading;
        }
        return acc;
      }, {});

      for (const [type, reading] of Object.entries(latest) as [string, any][]) {
        const baseline = baselines[type];
        if (baseline && baseline.stdDev > 0) {
          const zScore = (reading.value - baseline.mean) / baseline.stdDev;
          const absZ = Math.abs(zScore);
          let severity = 'low';
          if (absZ >= 3) severity = 'high';
          else if (absZ >= 2) severity = 'med';
          
          if (absZ >= 1.5) {
            anomalies.push({
              parameter: type,
              current: reading.value,
              baseline_mean: baseline.mean,
              z_score: zScore,
              severity
            });
          }
        }
      }
      return anomalies;
    };

    const baselines = calculateBaselines(sensorReadings);
    const anomalies = detectAnomalies(sensorReadings, baselines);

    // MIKE REYES PERSONA - Enhanced AI prompt with statistical rigor
    const prompt = `### ROLE
You are **"Mike Reyes, Senior HVAC Service Technician"** with 25 years of field experience on large-tonnage Trane CVHE/CVHF chillers, cooling-tower water treatment, and VFD drives. You specialize in predictive maintenance and root-cause analysis.

### STATISTICAL ANALYSIS RESULTS
Baseline Analysis: ${JSON.stringify(baselines, null, 2)}
Detected Anomalies: ${JSON.stringify(anomalies, null, 2)}

### CONTEXT
AssetGuardian has collected the following **live sensor stream** and **historical baselines** for this equipment:

INDUSTRY BENCHMARKS:
- Trane CVHE/CVHF Chiller bearing life: 15-20 years typical, 10-12 years in high-use environments
- Motor current baseline varies by load but typically 80-95% of FLA at design conditions
- Vibration RMS should be <0.3 ips for good condition, 0.3-0.7 ips acceptable, >0.7 ips concerning
- Approach temperature: typically 2-6°F for chillers in good condition
- Refrigerant levels: 65-75% sight glass level optimal for most conditions

COST REFERENCES (2024 market rates):
- Emergency repairs: 3-5x normal maintenance cost
- Planned downtime: $1,200-3,500/hour for commercial buildings
- Trane chiller bearing replacement: $15,000-35,000 including labor
- Compressor rebuild: $85,000-180,000 depending on tonnage
- Complete chiller replacement: $280,000-650,000+ for large tonnage units

Equipment Information:
- Asset ID: ${equipmentData.asset_id}
- Type: ${equipmentData.asset_type}
- Location: ${equipmentData.location}

Data Sources Summary:
${dataSourceSummary}
${manualReadings.length > 0 ? 'Manual readings (from sensors) prioritized for analysis.' : ''}
${standardReadings.length > 0 ? 'Standard readings (from maintenance checks) included for comprehensive analysis.' : ''}

Combined Sensor Data (Manual + Standard Readings):
${JSON.stringify(sensorReadings, null, 2)}

Equipment Thresholds:
${JSON.stringify(thresholds, null, 2)}

Maintenance History with Reading Context:
${JSON.stringify(maintenanceHistory, null, 2)}

### TASK
1. **Diagnose** current operating condition vs. baseline using the statistical analysis above.
   - Flag any parameter >±2 σ from mean (already calculated in anomalies).
   - Detect out-of-sequence events (e.g., low load + high current).
2. **Forecast** probability of failure in three windows:
   - **<7 days**, **8-30 days**, **31-90 days**
   Use a 0-1 scale with a one-sentence rationale for each.
3. **Prioritize** up to **5 preventive actions** that will most reduce the highest-probability failure mode.
   - Include estimated downtime, parts, labor-hours, and ROI.
4. **Quantify uncertainty**—list the two data points that, if improved, would raise your confidence the most.

Please analyze this data and respond with a JSON object containing:
{
  "asset_id": "${equipmentData.asset_id}",
  "risk_level": "low" | "medium" | "high",
  "finding": "string - describe what you found, mention statistical anomalies and z-scores",
  "recommendation": "string - what should be done, include data collection recommendations",
  "create_work_order": boolean,
  "confidence_score": number (0-1),
  "data_quality": {
    "manual_readings_count": ${manualReadings.length},
    "standard_readings_count": ${standardReadings.length},
    "coverage_assessment": "string",
    "reading_source_used": "${readingSource}"
  },
  "mike_reyes_analysis": {
    "summary": "three-line plain-language overview",
    "alerts": [
      {"parameter":"", "current":0, "baseline_mean":0, "z_score":0, "severity":"low|med|high"}
    ],
    "failure_probability": {
      "<7d>": 0.00,
      "8-30d": 0.00,
      "31-90d": 0.00,
      "highest_risk_mode": "failure mode slug"
    },
    "recommended_actions": [
      {"task":"", "downtime_hours":0, "parts_cost_usd":0, "labor_hours":0, "roi":"payback months"}
    ],
    "confidence_notes": [
      "Need continuous vibration on bearings A/B",
      "Water-chemistry data only weekly—daily would tighten forecast"
    ]
  },
  "statistical_baselines": ${JSON.stringify(baselines)},
  "anomaly_detection": ${JSON.stringify(anomalies)},
  "predictive_timeline": [
    {
      "timeframe": "string (e.g., '7 days', '30 days', '90 days', '1 year')",
      "failure_probability": number (0-100),
      "predicted_date": "ISO date string",
      "component": "string (e.g., 'bearing', 'motor', 'filter')",
      "failure_type": "string (e.g., 'wear failure', 'overheating', 'clogging')",
      "severity": "low" | "medium" | "high" | "critical",
      "intervention_cost": number (estimated USD),
      "downtime_hours": number
    }
  ],
  "degradation_analysis": [
    {
      "component": "string",
      "current_condition": number (0-100 percentage),
      "degradation_rate": number (percentage per month),
      "expected_life_remaining": number (months),
      "replacement_threshold": number (percentage)
    }
  ],
  "maintenance_windows": [
    {
      "window_start": "ISO date string",
      "window_end": "ISO date string", 
      "window_type": "optimal" | "acceptable" | "critical",
      "intervention_type": "string (e.g., 'bearing replacement', 'filter change')",
      "estimated_cost": number (USD),
      "estimated_hours": number,
      "priority": number (1-10)
    }
  ],
  "performance_trends": {
    "efficiency_decline_rate": number (percentage per month),
    "energy_consumption_increase": number (percentage vs baseline),
    "projected_failure_date": "ISO date string"
  },
  "work_order": {
    "title": "string",
    "description": "string", 
    "priority": "low" | "medium" | "high",
    "due_hours": number,
    "assigned_team": "string"
  } (only if create_work_order is true)
}

Use statistical rigor with z-scores, equipment-specific knowledge, and ROI-driven recommendations. Be Mike Reyes - direct, experienced, and data-driven.`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are AssetGuardian AI, a senior predictive maintenance engineer with 25+ years of HVAC experience and access to industry failure databases. Always respond with valid JSON matching the specified schema. Use industry-standard failure models, manufacturer data, and statistical analysis. Provide conservative yet actionable predictions with realistic cost estimates based on current market rates. Prioritize manual sensor readings over standard maintenance readings for accuracy.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const analysis = JSON.parse(aiResponse.choices[0].message.content)

    console.log('AI analysis result:', analysis);

    // Ensure required fields are present
    if (!analysis.asset_id) {
      analysis.asset_id = equipmentData.asset_id;
    }

    // Ensure data quality information is included
    if (!analysis.data_quality) {
      analysis.data_quality = {
        manual_readings_count: manualReadings.length,
        standard_readings_count: standardReadings.length,
        coverage_assessment: manualReadings.length > 0 ? 'Good - manual readings available' : 'Limited - only standard readings available',
        reading_source_used: readingSource
      };
    }

    // Ensure confidence score calculation based on data quality and anomalies
    if (!analysis.confidence_score) {
      const dataQualityScore = (manualReadings.length * 0.1 + standardReadings.length * 0.05) / 10;
      const anomalyScore = anomalies.length > 0 ? 0.2 : 0;
      const baselineScore = Object.keys(baselines).length > 0 ? 0.3 : 0;
      analysis.confidence_score = Math.min(0.95, 0.4 + dataQualityScore + anomalyScore + baselineScore);
    }

    // Ensure Mike Reyes analysis structure
    if (!analysis.mike_reyes_analysis) {
      analysis.mike_reyes_analysis = {
        summary: "Insufficient data for detailed Mike Reyes analysis.",
        alerts: anomalies,
        failure_probability: {
          "<7d>": 0.01,
          "8-30d": 0.05,
          "31-90d": 0.15,
          "highest_risk_mode": "general_wear"
        },
        recommended_actions: [],
        confidence_notes: ["More sensor data needed for higher confidence", "Historical baseline data limited"]
      };
    }

    // Ensure statistical data is included
    analysis.statistical_baselines = baselines;
    analysis.anomaly_detection = anomalies;

    // Ensure predictive timeline has default structure if missing
    if (!analysis.predictive_timeline) {
      analysis.predictive_timeline = [];
    }

    if (!analysis.degradation_analysis) {
      analysis.degradation_analysis = [];
    }

    if (!analysis.maintenance_windows) {
      analysis.maintenance_windows = [];
    }

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in predictive AI analysis:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        asset_id: '',
        risk_level: 'low',
        finding: 'Analysis unavailable due to technical error',
        recommendation: 'Please retry analysis or contact technical support',
        create_work_order: false,
        confidence_score: 0,
        data_quality: {
          manual_readings_count: 0,
          standard_readings_count: 0,
          coverage_assessment: 'No data available'
        },
        predictive_timeline: [],
        degradation_analysis: [],
        maintenance_windows: [],
        performance_trends: null
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
