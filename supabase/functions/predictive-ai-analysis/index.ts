
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

    // Prepare the AI prompt
    const prompt = `You are AssetGuardian AI, an expert in predictive maintenance analysis. Analyze the following equipment data and provide a risk assessment.

Equipment Information:
- Asset ID: ${equipmentData.asset_id}
- Type: ${equipmentData.asset_type}
- Location: ${equipmentData.location}

Recent Sensor Data:
${JSON.stringify(sensorReadings, null, 2)}

Equipment Thresholds:
${JSON.stringify(thresholds, null, 2)}

Maintenance History:
${JSON.stringify(maintenanceHistory, null, 2)}

Please analyze this data and respond with a JSON object containing:
{
  "asset_id": "string",
  "risk_level": "low" | "medium" | "high",
  "finding": "string - describe what you found",
  "recommendation": "string - what should be done",
  "create_work_order": boolean,
  "work_order": {
    "title": "string",
    "description": "string", 
    "priority": "low" | "medium" | "high",
    "due_hours": number,
    "assigned_team": "string"
  } (only if create_work_order is true)
}

Focus on:
1. Trend analysis of sensor readings
2. Threshold violations or approaching limits
3. Historical maintenance patterns
4. Early warning signs of potential failures`

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
            content: 'You are AssetGuardian AI, an expert predictive maintenance analyst. Always respond with valid JSON matching the specified schema.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const analysis = JSON.parse(aiResponse.choices[0].message.content)

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
        create_work_order: false
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
