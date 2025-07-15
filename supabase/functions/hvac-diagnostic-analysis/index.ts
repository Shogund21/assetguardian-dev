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
    const { 
      equipmentData, 
      sensorReadings, 
      manualMaintenanceLogs,
      refrigerantReports,
      vibrationAnalysis,
      condenserMaintenance,
      maintenanceHistory,
      thresholds, 
      dataQuality,
      analysisType,
      readingSource 
    } = await req.json()
    
    console.log('Received enhanced diagnostic data:', {
      equipmentData,
      sensorReadingsCount: sensorReadings?.length || 0,
      manualMaintenanceLogsCount: manualMaintenanceLogs?.length || 0,
      refrigerantReportsCount: refrigerantReports?.length || 0,
      vibrationAnalysisCount: vibrationAnalysis?.length || 0,
      condenserMaintenanceCount: condenserMaintenance?.length || 0,
      maintenanceHistoryCount: maintenanceHistory?.length || 0,
      thresholdsCount: thresholds?.length || 0,
      analysisType,
      readingSource,
      dataQuality
    });
    
    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Create comprehensive data summary for AI analysis
    const dataSummary = {
      manual_maintenance_logs: manualMaintenanceLogs?.length || 0,
      refrigerant_reports: refrigerantReports?.length || 0,
      vibration_analysis: vibrationAnalysis?.length || 0,
      condenser_maintenance: condenserMaintenance?.length || 0,
      sensor_readings: sensorReadings?.length || 0,
      maintenance_history: maintenanceHistory?.length || 0,
      thresholds: thresholds?.length || 0
    };

    // Enhanced AI prompt for comprehensive HVAC diagnostic analysis
    const prompt = `You are Dr. HVAC, a Senior Diagnostic Engineer with 30+ years of experience in chiller health assessment and predictive maintenance. You have access to industry failure databases, manufacturer specifications, and advanced diagnostic protocols. Analyze the following comprehensive chiller health data and provide an expert diagnostic assessment.

COMPREHENSIVE CHILLER HEALTH ANALYSIS PROTOCOL:
1. Integrate multiple data sources with weighted significance
2. Apply industry-standard diagnostic algorithms (ISO 13379, ASHRAE 90.1)
3. Use manufacturer-specific failure patterns and lifecycle models
4. Consider operational context and environmental factors
5. Provide confidence scoring based on data completeness and quality
6. Generate predictive maintenance recommendations with cost-benefit analysis

INDUSTRY DIAGNOSTIC STANDARDS:
- Chiller bearing analysis: ISO 10816 vibration standards
- Refrigerant system analysis: ASHRAE 15 safety standards
- Motor analysis: IEEE 43 insulation testing standards
- Water-side analysis: ASHRAE 188 Legionella prevention
- Energy efficiency: ASHRAE 90.1 performance requirements

CRITICAL FAILURE INDICATORS:
- Bearing wear: Vibration velocity >7.1 mm/s (critical), >4.5 mm/s (alert)
- Refrigerant leaks: >10% charge loss annually (critical), >5% (alert)
- Motor degradation: Insulation resistance <1 MΩ (critical), <2 MΩ (alert)
- Condenser fouling: Approach temp >5°F increase (critical), >3°F (alert)
- Superheat/subcooling: >±5°F from design (critical), >±3°F (alert)

COST ANALYSIS BENCHMARKS:
- Emergency chiller replacement: $200,000-$800,000 + 2-4 weeks downtime
- Planned bearing replacement: $15,000-$35,000 + 1-2 days downtime
- Refrigerant leak repair: $5,000-$20,000 + 1-3 days downtime
- Condenser cleaning: $2,000-$8,000 + 4-8 hours downtime
- Motor rewind: $10,000-$30,000 + 3-5 days downtime

Equipment Information:
- Asset ID: ${equipmentData.asset_id}
- Type: ${equipmentData.asset_type}
- Location: ${equipmentData.location}
- Equipment Type: ${equipmentData.equipment_type}

DATA QUALITY ASSESSMENT:
Overall Confidence: ${dataQuality.overall_confidence}
Data Completeness: ${dataQuality.data_completeness}

SUPPLEMENTAL DATA ANALYSIS:
${JSON.stringify(dataSummary, null, 2)}

MANUAL MAINTENANCE LOGS (Last 12 Months):
${JSON.stringify(manualMaintenanceLogs, null, 2)}

REFRIGERANT CHARGE & LEAK TEST REPORTS:
${JSON.stringify(refrigerantReports, null, 2)}

VIBRATION ANALYSIS RESULTS (Last 6 Months):
${JSON.stringify(vibrationAnalysis, null, 2)}

CONDENSER COIL CLEANING & WATER TREATMENT RECORDS:
${JSON.stringify(condenserMaintenance, null, 2)}

CURRENT SENSOR READINGS (Last 30 Days):
${JSON.stringify(sensorReadings, null, 2)}

STANDARD MAINTENANCE HISTORY:
${JSON.stringify(maintenanceHistory, null, 2)}

EQUIPMENT THRESHOLDS:
${JSON.stringify(thresholds, null, 2)}

REQUIRED RESPONSE FORMAT - Provide detailed chiller health assessment in JSON:
{
  "asset_id": "${equipmentData.asset_id}",
  "diagnostic_type": "comprehensive_hvac_diagnostic",
  "overall_health_score": number (0-1, where 1 is excellent condition),
  "confidence_score": number (0-1, based on data quality and completeness),
  "risk_level": "low" | "medium" | "high" | "critical",
  "estimated_remaining_life_months": number,
  "maintenance_priority": "low" | "medium" | "high" | "critical",
  "critical_findings": [
    "string - specific critical issues found"
  ],
  "recommendations": [
    "string - specific actionable recommendations"
  ],
  "component_analysis": {
    "compressor": {
      "condition": "excellent" | "good" | "fair" | "poor" | "critical",
      "failure_probability_12_months": number (0-100),
      "key_indicators": ["string"],
      "recommended_action": "string"
    },
    "bearing_system": {
      "condition": "excellent" | "good" | "fair" | "poor" | "critical",
      "failure_probability_12_months": number (0-100),
      "key_indicators": ["string"],
      "recommended_action": "string"
    },
    "refrigerant_system": {
      "condition": "excellent" | "good" | "fair" | "poor" | "critical",
      "failure_probability_12_months": number (0-100),
      "key_indicators": ["string"],
      "recommended_action": "string"
    },
    "motor": {
      "condition": "excellent" | "good" | "fair" | "poor" | "critical",
      "failure_probability_12_months": number (0-100),
      "key_indicators": ["string"],
      "recommended_action": "string"
    },
    "condenser": {
      "condition": "excellent" | "good" | "fair" | "poor" | "critical",
      "failure_probability_12_months": number (0-100),
      "key_indicators": ["string"],
      "recommended_action": "string"
    }
  },
  "predictive_timeline": [
    {
      "timeframe": "string (e.g., '30 days', '90 days', '1 year')",
      "failure_probability": number (0-100),
      "predicted_date": "ISO date string",
      "component": "string",
      "failure_type": "string",
      "severity": "low" | "medium" | "high" | "critical",
      "intervention_cost": number (estimated USD),
      "downtime_hours": number
    }
  ],
  "cost_analysis": {
    "immediate_actions_cost": number,
    "preventive_maintenance_cost": number,
    "emergency_repair_cost": number,
    "replacement_cost": number,
    "annual_maintenance_budget": number
  },
  "data_sources_used": [
    "string - list all data sources that influenced the analysis"
  ],
  "analyst_notes": "string - detailed technical notes and observations",
  "next_diagnostic_date": "ISO date string",
  "recommended_monitoring_frequency": "string"
}

Focus on integrating ALL available data sources to provide the most accurate assessment possible. Use the supplemental data (manual maintenance logs, refrigerant reports, vibration analysis, condenser maintenance) to significantly improve confidence scores and diagnostic accuracy beyond what sensor readings alone can provide.`

    // Call OpenAI API with enhanced prompt
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
            content: 'You are Dr. HVAC, a Senior Diagnostic Engineer with 30+ years of experience in chiller health assessment. You have access to industry failure databases, manufacturer specifications, and advanced diagnostic protocols. Always respond with valid JSON matching the specified schema. Integrate all available data sources for maximum diagnostic accuracy. Provide conservative yet actionable predictions with realistic cost estimates based on current market rates.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const analysis = JSON.parse(aiResponse.choices[0].message.content)

    console.log('Enhanced diagnostic analysis result:', analysis);

    // Ensure required fields are present
    if (!analysis.asset_id) {
      analysis.asset_id = equipmentData.asset_id;
    }

    // Ensure confidence score reflects data quality
    if (!analysis.confidence_score) {
      analysis.confidence_score = dataQuality.overall_confidence || 0.5;
    }

    // Ensure data sources are documented
    if (!analysis.data_sources_used) {
      analysis.data_sources_used = [];
      if (dataSummary.sensor_readings > 0) analysis.data_sources_used.push('sensor_readings');
      if (dataSummary.manual_maintenance_logs > 0) analysis.data_sources_used.push('manual_maintenance_logs');
      if (dataSummary.refrigerant_reports > 0) analysis.data_sources_used.push('refrigerant_reports');
      if (dataSummary.vibration_analysis > 0) analysis.data_sources_used.push('vibration_analysis');
      if (dataSummary.condenser_maintenance > 0) analysis.data_sources_used.push('condenser_maintenance');
      if (dataSummary.maintenance_history > 0) analysis.data_sources_used.push('maintenance_history');
      if (dataSummary.thresholds > 0) analysis.data_sources_used.push('thresholds');
    }

    // Set next diagnostic date if not provided
    if (!analysis.next_diagnostic_date) {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 3); // Default to 3 months
      analysis.next_diagnostic_date = nextDate.toISOString();
    }

    // Set recommended monitoring frequency if not provided
    if (!analysis.recommended_monitoring_frequency) {
      analysis.recommended_monitoring_frequency = analysis.maintenance_priority === 'critical' ? 'weekly' :
                                                 analysis.maintenance_priority === 'high' ? 'monthly' :
                                                 analysis.maintenance_priority === 'medium' ? 'quarterly' : 'semi-annually';
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
    console.error('Error in enhanced HVAC diagnostic analysis:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        asset_id: '',
        diagnostic_type: 'comprehensive_hvac_diagnostic',
        overall_health_score: 0,
        confidence_score: 0,
        risk_level: 'unknown',
        estimated_remaining_life_months: 0,
        maintenance_priority: 'medium',
        critical_findings: ['Analysis failed due to technical error'],
        recommendations: ['Please retry analysis or contact technical support'],
        component_analysis: {},
        predictive_timeline: [],
        cost_analysis: {},
        data_sources_used: [],
        analyst_notes: 'Analysis failed due to technical error',
        next_diagnostic_date: new Date().toISOString(),
        recommended_monitoring_frequency: 'monthly'
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