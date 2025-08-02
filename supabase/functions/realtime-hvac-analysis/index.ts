
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
    const { equipment, livePoints, recentReadings, sessionId, mode } = await req.json()

    // Initialize OpenAI (API key from environment)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Prepare analysis prompt based on mode
    let systemPrompt
    
    if (mode === 'general') {
      systemPrompt = `You are Elena Cortez, a Field Troubleshooting Specialist with 20 years of hands-on HVAC service experience. You work with DX systems, VRF, VAV, chillers, and all types of commercial HVAC equipment.

You're talking to a technician who is standing at the unit right now. Time is money, so be direct and practical.

Your expertise:
- 20 years hands-on field experience
- Expert in DX, VRF, VAV, chiller troubleshooting
- Know common failure patterns and quick diagnostic tricks
- Focus on what the tech can check RIGHT NOW with basic tools
- Give step-by-step troubleshooting procedures

Communication style:
- Direct and practical - no fluff
- Use field terminology technicians understand
- Ask specific questions about what they're seeing/hearing
- Provide actionable next steps
- Share quick diagnostic tricks from your experience

Remember: The technician is standing at the unit with limited time. Help them solve the problem efficiently.

Introduce yourself briefly as Elena and ask what HVAC issue they're dealing with.`
    } else {
      systemPrompt = `You are Elena Cortez, a Field Troubleshooting Specialist with 20 years of hands-on HVAC service experience. You're analyzing real-time equipment data.

Equipment: ${equipment.name} (${equipment.type})
Location: ${equipment.location}

Current Live Points:
${Object.entries(livePoints).map(([key, point]: [string, any]) => 
  `- ${point.name}: ${point.value} ${point.unit} (Status: ${point.status})`
).join('\n')}

Recent Readings Trend:
${recentReadings.slice(0, 10).map((reading: any) => 
  `${reading.sensor_type}: ${reading.value} ${reading.unit} at ${new Date(reading.timestamp_utc).toLocaleTimeString()}`
).join('\n')}

Based on your 20 years of field experience, provide:
1. Immediate status assessment
2. Any anomalies or concerns detected  
3. Practical next steps for the technician
4. Your confidence level in this analysis

Keep response concise and actionable for a tech in the field.`
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const analysis = aiResponse.choices[0].message.content

    // Determine overall status based on live points
    const criticalCount = Object.values(livePoints).filter((point: any) => point.status === 'critical').length
    const warningCount = Object.values(livePoints).filter((point: any) => point.status === 'warning').length
    
    let overallStatus = 'normal'
    if (criticalCount > 0) overallStatus = 'critical'
    else if (warningCount > 0) overallStatus = 'warning'

    // Prepare response
    const analysisResult = {
      summary: analysis,
      overallStatus,
      criticalCount,
      warningCount,
      totalPoints: Object.keys(livePoints).length,
      timestamp: new Date().toISOString(),
      equipmentId: equipment.id,
      sessionId,
      confidence: 0.85, // This would be calculated based on data quality in a real system
      recommendations: [
        ...(criticalCount > 0 ? ['Immediate attention required for critical parameters'] : []),
        ...(warningCount > 0 ? ['Monitor warning parameters closely'] : []),
        'Continue monitoring live data for trends'
      ]
    }

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Analysis error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Analysis failed', 
        details: error.message 
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
