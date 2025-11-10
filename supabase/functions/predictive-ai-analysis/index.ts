import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      equipmentData, 
      sensorReadings, 
      maintenanceHistory, 
      thresholds,
      readingSource = 'auto'
    } = await req.json();

    console.log('Predictive AI Analysis Request:', {
      equipmentId: equipmentData?.asset_id,
      sensorCount: sensorReadings?.length || 0,
      maintenanceCount: maintenanceHistory?.length || 0,
      thresholdCount: thresholds?.length || 0,
      readingSource
    });

    // Validate we have sufficient data
    const hasSensorData = sensorReadings && sensorReadings.length > 0;
    const hasMaintenanceData = maintenanceHistory && maintenanceHistory.length > 0;

    if (!hasSensorData && !hasMaintenanceData) {
      console.error('Insufficient data for analysis');
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient data for predictive analysis. Please add sensor readings or maintenance checks.',
          details: {
            sensorReadings: sensorReadings?.length || 0,
            maintenanceHistory: maintenanceHistory?.length || 0
          }
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'AI service not configured. Please add OPENAI_API_KEY to Supabase secrets.' 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build comprehensive analysis prompt
    const prompt = buildAnalysisPrompt(
      equipmentData, 
      sensorReadings, 
      maintenanceHistory, 
      thresholds,
      readingSource
    );

    console.log('Calling OpenAI for analysis...');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert predictive maintenance AI assistant specializing in HVAC and industrial equipment analysis. Analyze equipment data and provide actionable insights about equipment health, failure risks, and maintenance recommendations.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'AI analysis failed',
          details: errorText 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.choices[0].message.content;

    console.log('AI Analysis completed, parsing response...');

    // Parse AI response into structured format
    const structuredAnalysis = parseAIResponse(
      analysisText, 
      equipmentData.asset_id,
      sensorReadings,
      maintenanceHistory,
      readingSource
    );

    console.log('Analysis complete:', {
      riskLevel: structuredAnalysis.risk_level,
      confidence: structuredAnalysis.confidence_score
    });

    return new Response(
      JSON.stringify(structuredAnalysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in predictive-ai-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function buildAnalysisPrompt(
  equipmentData: any,
  sensorReadings: any[],
  maintenanceHistory: any[],
  thresholds: any[],
  readingSource: string
): string {
  let prompt = `Analyze the following equipment for predictive maintenance:\n\n`;
  
  prompt += `EQUIPMENT INFORMATION:\n`;
  prompt += `- Asset ID: ${equipmentData.asset_id}\n`;
  prompt += `- Type: ${equipmentData.asset_type}\n`;
  prompt += `- Location: ${equipmentData.location}\n\n`;

  if (sensorReadings && sensorReadings.length > 0) {
    prompt += `SENSOR READINGS (${sensorReadings.length} readings, Source: ${readingSource}):\n`;
    
    // Group by sensor type for better analysis
    const readingsBySensor = sensorReadings.reduce((acc: any, reading: any) => {
      const type = reading.sensor_type || 'unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(reading);
      return acc;
    }, {});

    Object.entries(readingsBySensor).forEach(([sensorType, readings]: [string, any]) => {
      const values = readings.map((r: any) => r.value);
      const latest = readings[0]?.value;
      const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const unit = readings[0]?.unit || '';
      
      prompt += `  ${sensorType}: Latest=${latest}${unit}, Avg=${avg.toFixed(2)}${unit}, Min=${min}${unit}, Max=${max}${unit}, Count=${readings.length}\n`;
    });
    prompt += '\n';
  }

  if (thresholds && thresholds.length > 0) {
    prompt += `EQUIPMENT THRESHOLDS:\n`;
    thresholds.forEach((t: any) => {
      prompt += `  ${t.sensor_type}: Warning=${t.warning_threshold}${t.unit}, Critical=${t.critical_threshold}${t.unit}\n`;
    });
    prompt += '\n';
  }

  if (maintenanceHistory && maintenanceHistory.length > 0) {
    prompt += `MAINTENANCE HISTORY (${maintenanceHistory.length} checks):\n`;
    maintenanceHistory.slice(0, 10).forEach((check: any) => {
      prompt += `  - ${check.check_date}: Status=${check.status}, Equipment=${check.equipment_type}, Notes=${check.notes || 'None'}\n`;
    });
    if (maintenanceHistory.length > 10) {
      prompt += `  ... and ${maintenanceHistory.length - 10} more checks\n`;
    }
    prompt += '\n';
  }

  prompt += `ANALYSIS REQUIREMENTS:\n`;
  prompt += `Please provide a comprehensive predictive maintenance analysis including:\n`;
  prompt += `1. Overall risk level (low, medium, or high)\n`;
  prompt += `2. Key findings about equipment health\n`;
  prompt += `3. Specific maintenance recommendations\n`;
  prompt += `4. Confidence score (0-100%)\n`;
  prompt += `5. If risk is medium or high, provide predicted failure timeline\n`;
  prompt += `6. Any anomalies or concerning trends detected\n\n`;
  
  prompt += `Format your response clearly with sections for: RISK LEVEL, FINDINGS, RECOMMENDATIONS, CONFIDENCE, and TIMELINE (if applicable).`;

  return prompt;
}

function parseAIResponse(
  aiText: string,
  assetId: string,
  sensorReadings: any[],
  maintenanceHistory: any[],
  readingSource: string
): any {
  // Extract risk level
  const riskMatch = aiText.match(/RISK LEVEL[:\s]*(low|medium|high)/i);
  const riskLevel = (riskMatch?.[1]?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high';

  // Extract confidence score
  const confidenceMatch = aiText.match(/CONFIDENCE[:\s]*(\d+)/i);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.75;

  // Extract findings section
  const findingsMatch = aiText.match(/FINDINGS[:\s]*([\s\S]*?)(?=RECOMMENDATIONS|CONFIDENCE|TIMELINE|$)/i);
  const findings = findingsMatch?.[1]?.trim() || aiText.substring(0, 500);

  // Extract recommendations section
  const recommendationsMatch = aiText.match(/RECOMMENDATIONS[:\s]*([\s\S]*?)(?=CONFIDENCE|TIMELINE|$)/i);
  const recommendations = recommendationsMatch?.[1]?.trim() || 'Continue regular maintenance schedule and monitor sensor readings.';

  // Calculate data quality
  const manualReadings = sensorReadings?.filter(r => r.source === 'manual' || r.reading_mode === 'manual').length || 0;
  const standardReadings = sensorReadings?.filter(r => r.source !== 'manual' && r.reading_mode !== 'manual').length || 0;

  const dataQuality = {
    manual_readings_count: manualReadings,
    standard_readings_count: standardReadings,
    reading_source_used: readingSource as 'auto' | 'manual' | 'standard',
    coverage_assessment: sensorReadings && sensorReadings.length > 20 
      ? 'Good data coverage for analysis' 
      : 'Limited data - continue monitoring'
  };

  // Build response
  const analysis: any = {
    asset_id: assetId,
    risk_level: riskLevel,
    finding: findings,
    recommendation: recommendations,
    confidence_score: confidence,
    data_quality: dataQuality,
    create_work_order: riskLevel === 'high',
  };

  // Add work order suggestion if high risk
  if (riskLevel === 'high') {
    analysis.work_order = {
      title: `Urgent: Maintenance Required for Asset ${assetId}`,
      description: findings,
      priority: 'high' as const,
      due_hours: 24,
      assigned_team: 'maintenance'
    };
  }

  return analysis;
}
