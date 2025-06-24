
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

    // Prepare the AI prompt with enhanced context
    const prompt = `You are AssetGuardian AI, an expert in predictive maintenance analysis. Analyze the following equipment data and provide a risk assessment.

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
  "work_order": {
    "title": "string",
    "description": "string", 
    "priority": "low" | "medium" | "high",
    "due_hours": number,
    "assigned_team": "string"
  } (only if create_work_order is true)
}

Focus on:
1. Trend analysis using both manual and standard readings
2. Threshold violations or approaching limits
3. Historical maintenance patterns and reading modes
4. Early warning signs of potential failures
5. Data completeness and recommendation for optimal reading collection
6. Prioritize manual readings when available, use standard readings as backup`

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
            content: 'You are AssetGuardian AI, an expert predictive maintenance analyst. Always respond with valid JSON matching the specified schema. Consider both manual sensor readings and standard maintenance check readings, prioritizing manual readings when available.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1200,
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
        }
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
