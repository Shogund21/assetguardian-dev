
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

    // Enhanced AI prompt with industry standards and multi-factor analysis
    const prompt = `You are AssetGuardian AI, a senior predictive maintenance engineer with 25+ years of experience in HVAC systems analysis. You have access to industry failure databases and manufacturer reliability data. Analyze the following equipment data using advanced statistical models and provide a comprehensive risk assessment with detailed predictive timeline.

ANALYSIS METHODOLOGY:
1. Apply industry-standard failure rate curves (Weibull distribution)
2. Consider equipment age, usage patterns, and environmental factors
3. Use manufacturer specifications and industry benchmarks
4. Factor in seasonal variations for HVAC equipment
5. Apply cost-benefit analysis for maintenance recommendations

INDUSTRY BENCHMARKS:
- Chiller bearing life: 15-20 years typical, 10-12 years in high-use environments
- AHU filter life: 3-6 months depending on environment
- Motor life expectancy: 15-20 years with proper maintenance
- Compressor life: 15-25 years for reciprocating, 20-30 for centrifugal
- Heat exchanger life: 20-30 years with proper water treatment

COST REFERENCES:
- Emergency repairs: 3-5x normal maintenance cost
- Planned downtime: $500-2000/hour for commercial buildings
- Chiller replacement: $150,000-500,000+ depending on tonnage
- AHU major overhaul: $15,000-50,000
- Motor replacement: $2,000-15,000 depending on HP

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

Please analyze this data and respond with a JSON object containing:
{
  "asset_id": "${equipmentData.asset_id}",
  "risk_level": "low" | "medium" | "high",
  "finding": "string - describe what you found, mention data sources used",
  "recommendation": "string - what should be done, include data collection recommendations",
  "create_work_order": boolean,
  "confidence_score": number (0-1),
  "data_quality": {
    "manual_readings_count": ${manualReadings.length},
    "standard_readings_count": ${standardReadings.length},
    "coverage_assessment": "string"
  },
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

Focus on providing detailed predictive timelines with specific dates, probabilities, and cost estimates. Use realistic industry standards for HVAC equipment lifecycle and maintenance costs.`

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
        coverage_assessment: manualReadings.length > 0 ? 'Good - manual readings available' : 'Limited - only standard readings available'
      };
    }

    // Ensure confidence score is included and in correct range
    if (!analysis.confidence_score) {
      analysis.confidence_score = manualReadings.length > 0 ? 0.85 : 0.65; // Higher confidence with manual readings
    }

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
