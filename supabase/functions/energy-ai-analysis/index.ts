import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { equipmentId, energyData, sensorReadings, historicalData, userQuestion, previousAnalysis, mode } = await req.json();

    console.log('Processing energy analysis for equipment:', equipmentId);
    console.log('Mode:', mode || 'analysis');
    console.log('Energy data:', energyData);
    console.log('Available sensor readings:', sensorReadings?.length || 0);

    // Handle chat mode differently
    if (mode === 'chat' && userQuestion) {
      const chatPrompt = `You are an expert HVAC energy efficiency consultant. A user is asking about their chiller's energy performance.

Equipment Data:
- Power Consumption: ${energyData?.currentPowerConsumption || 0} kW
- Efficiency (EER): ${energyData?.currentEfficiency || 0}
- Daily Cost: $${energyData?.dailyCost || 0}

${previousAnalysis ? `Previous Analysis Summary:
- Overall Rating: ${previousAnalysis.overall_rating}/10
- Status: ${previousAnalysis.efficiency_status}
- Key Findings: ${previousAnalysis.energy_insights?.key_findings?.join(', ') || 'None'}
` : ''}

User Question: "${userQuestion}"

Provide a helpful, specific answer based on the equipment data. Be concise but informative. If suggesting improvements, include estimated costs and benefits.`;

      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful HVAC energy efficiency expert. Provide practical, actionable advice.'
            },
            {
              role: 'user',
              content: chatPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error(`OpenAI Chat API error: ${chatResponse.status}`);
      }

      const chatResult = await chatResponse.json();
      
      return new Response(
        JSON.stringify({
          success: true,
          response: chatResult.choices[0].message.content
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Create comprehensive AI prompt for energy analysis
    const prompt = `You are an expert HVAC energy efficiency analyst. Analyze the following chiller energy performance data and provide detailed insights, recommendations, and optimization strategies.

## Equipment Information
- Equipment ID: ${equipmentId}
- Current Power Consumption: ${energyData.currentPowerConsumption} kW
- Current Efficiency (EER): ${energyData.currentEfficiency}
- Optimal Efficiency Target: ${energyData.optimalEfficiency}
- Daily Energy Cost: $${energyData.dailyCost}

## Sensor Data Summary
Available sensor readings: ${sensorReadings.length} data points
Recent sensor types: ${sensorReadings.map(r => r.sensor_type).join(', ')}

## Historical Performance
${historicalData.length > 0 ? `
Historical data points: ${historicalData.length}
Power consumption trend: ${energyData.trends.powerTrend}
Efficiency trend: ${energyData.trends.efficiencyTrend}
Cost trend: ${energyData.trends.costTrend}
` : 'Limited historical data available'}

## Analysis Requirements
Provide a comprehensive energy efficiency analysis including:

1. **Current Performance Assessment**
   - Overall energy efficiency rating (1-10 scale)
   - Performance comparison to industry benchmarks
   - Key performance indicators status

2. **Energy Consumption Analysis**
   - Current load profile evaluation
   - Peak vs. off-peak consumption patterns
   - Energy waste identification

3. **Efficiency Optimization Recommendations**
   - Immediate operational adjustments (0-cost improvements)
   - Short-term maintenance interventions (low-cost, high-impact)
   - Long-term upgrade opportunities (ROI-focused)

4. **Cost-Benefit Analysis**
   - Monthly energy cost breakdown
   - Potential savings from each recommendation
   - Payback periods for suggested improvements

5. **Predictive Insights**
   - Equipment degradation indicators
   - Future performance projections
   - Maintenance timing recommendations

6. **Smart Energy Management**
   - Load scheduling optimization
   - Peak demand management strategies
   - Integration with building automation systems

## Response Format
Provide your analysis in JSON format with the following structure:

{
  "overall_rating": number (1-10),
  "efficiency_status": "excellent" | "good" | "fair" | "poor" | "critical",
  "energy_insights": {
    "current_performance": "detailed assessment",
    "key_findings": ["finding1", "finding2", "finding3"],
    "efficiency_score": number (0-100)
  },
  "consumption_analysis": {
    "load_profile": "description",
    "peak_usage_hours": "time range",
    "waste_indicators": ["indicator1", "indicator2"]
  },
  "recommendations": [
    {
      "category": "operational" | "maintenance" | "upgrade",
      "priority": "immediate" | "short_term" | "long_term",
      "title": "recommendation title",
      "description": "detailed description",
      "expected_savings_monthly": number,
      "implementation_cost": number,
      "payback_months": number,
      "energy_impact": "percentage improvement expected"
    }
  ],
  "cost_analysis": {
    "current_monthly_cost": number,
    "potential_monthly_savings": number,
    "annual_savings_potential": number,
    "roi_percentage": number
  },
  "predictive_insights": {
    "equipment_health_score": number (0-100),
    "degradation_rate": "slow" | "moderate" | "rapid",
    "next_maintenance_window": "timeframe",
    "performance_forecast": "6-month outlook"
  },
  "smart_strategies": [
    {
      "strategy": "strategy name",
      "description": "implementation details",
      "savings_potential": "estimated impact"
    }
  ]
}

Focus on actionable, data-driven recommendations that balance energy efficiency with operational reliability. Consider both immediate wins and long-term optimization strategies.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HVAC energy efficiency analyst with deep knowledge of chiller systems, energy optimization, and predictive maintenance. Provide detailed, actionable analysis based on real performance data.'
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
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const openAIResult = await response.json();
    const analysisResult = JSON.parse(openAIResult.choices[0].message.content);

    console.log('Energy AI analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        metadata: {
          equipment_id: equipmentId,
          analysis_timestamp: new Date().toISOString(),
          data_points_analyzed: sensorReadings.length
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in energy-ai-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});