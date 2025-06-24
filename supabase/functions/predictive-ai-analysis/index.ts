
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
    const { equipmentData, sensorReadings, thresholds, maintenanceHistory } = await req.json()
    
    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Analyze data sources
    const manualReadings = sensorReadings.filter((r: any) => r.source === 'manual' || !r.source);
    const standardReadings = sensorReadings.filter((r: any) => r.source === 'maintenance_check');
    const dataSourceSummary = `Data includes ${manualReadings.length} manual readings and ${standardReadings.length} standard maintenance check readings.`;

    // Prepare the enhanced AI prompt with predictive timeline focus
    const prompt = `You are AssetGuardian AI, an expert in predictive maintenance analysis with advanced timeline forecasting capabilities. Analyze the following equipment data and provide a comprehensive risk assessment with detailed predictive timeline.

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
  "asset_id": "string",
  "risk_level": "low" | "medium" | "high",
  "finding": "string - describe what you found, mention data sources used",
  "recommendation": "string - what should be done, include data collection recommendations",
  "create_work_order": boolean,
  "confidence_score": number (0-100),
  "data_quality": {
    "manual_readings_count": number,
    "standard_readings_count": number,
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

Focus on:
1. **Predictive Timeline Analysis**: Create detailed failure probability predictions for multiple timeframes (7 days, 30 days, 90 days, 1 year)
2. **Component-Level Predictions**: Break down analysis by individual components (bearings, motors, filters, belts, etc.)
3. **Degradation Modeling**: Calculate current condition percentages and degradation rates for each component
4. **Optimal Maintenance Windows**: Identify best timing for interventions based on cost-benefit analysis
5. **Performance Trend Forecasting**: Project efficiency decline and energy consumption increases
6. **Cost-Impact Analysis**: Provide realistic cost estimates for interventions vs failure scenarios
7. **Time-to-Failure Calculations**: Use sensor trends to calculate specific failure probability dates
8. **Multi-Scenario Planning**: Consider different failure modes and their timelines

Provide specific dates, percentages, and dollar amounts. Use realistic industry standards for HVAC equipment lifecycle and maintenance costs.`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are AssetGuardian AI, an expert predictive maintenance analyst with advanced timeline forecasting capabilities. Always respond with valid JSON matching the specified schema. Focus on providing detailed predictive timelines with specific dates, probabilities, and cost estimates. Consider both manual sensor readings and standard maintenance check readings, prioritizing manual readings when available.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const analysis = JSON.parse(aiResponse.choices[0].message.content)

    // Ensure data quality information is included
    if (!analysis.data_quality) {
      analysis.data_quality = {
        manual_readings_count: manualReadings.length,
        standard_readings_count: standardReadings.length,
        coverage_assessment: manualReadings.length > 0 ? 'Good - manual readings available' : 'Limited - only standard readings available'
      };
    }

    // Ensure confidence score is included
    if (!analysis.confidence_score) {
      analysis.confidence_score = manualReadings.length > 0 ? 85 : 65; // Higher confidence with manual readings
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
