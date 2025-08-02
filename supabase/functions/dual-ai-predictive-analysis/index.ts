import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { equipmentData, sensorReadings, thresholds, maintenanceHistory, readingSource, model = 'both' } = await req.json()
    
    console.log('Received data for dual AI analysis:', {
      equipmentData,
      sensorReadingsCount: sensorReadings?.length || 0,
      maintenanceHistoryCount: maintenanceHistory?.length || 0,
      thresholdsCount: thresholds?.length || 0,
      readingSource,
      model
    });
    
    // Get API keys
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    
    if (!openaiApiKey && !claudeApiKey) {
      throw new Error('No AI API keys configured')
    }

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

    // Analyze data sources
    const manualReadings = sensorReadings.filter((r: any) => r.source === 'manual' || !r.source);
    const standardReadings = sensorReadings.filter((r: any) => r.source === 'maintenance_check');
    const dataSourceSummary = `Data includes ${manualReadings.length} manual readings and ${standardReadings.length} standard maintenance check readings.`;

    // Mike Reyes Enhanced Prompt
    const createMikeReyesPrompt = (aiType: string) => `### ROLE
You are **"Mike Reyes, Senior HVAC Service Technician"** with 25 years of field experience on large-tonnage Trane CVHE/CVHF chillers, cooling-tower water treatment, and VFD drives. You specialize in predictive maintenance and root-cause analysis.

### AI ANALYSIS TYPE: ${aiType.toUpperCase()}

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

Respond with valid JSON only, no other text:
{
  "asset_id": "${equipmentData.asset_id}",
  "ai_model": "${aiType}",
  "risk_level": "low" | "medium" | "high",
  "finding": "string - describe what you found, mention statistical anomalies and z-scores",
  "recommendation": "string - what should be done, include data collection recommendations",
  "create_work_order": boolean,
  "confidence_score": number (0-1),
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
  "anomaly_detection": ${JSON.stringify(anomalies)}
}

Use statistical rigor with z-scores, equipment-specific knowledge, and ROI-driven recommendations. Be Mike Reyes - direct, experienced, and data-driven.`;

    const results: any = {};

    // Call OpenAI GPT if available and requested
    if (openaiApiKey && (model === 'both' || model === 'gpt')) {
      try {
        console.log('Calling OpenAI GPT-4.1...');
        const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: 'You are Mike Reyes, a senior HVAC technician with deep statistical analysis expertise. Always respond with valid JSON matching the specified schema exactly. Use statistical rigor, real-world experience, and cost-effective recommendations.'
              },
              {
                role: 'user',
                content: createMikeReyesPrompt('GPT-4.1')
              }
            ],
            temperature: 0.2,
            max_tokens: 4000,
            response_format: { type: "json_object" }
          }),
        });

        if (gptResponse.ok) {
          const gptData = await gptResponse.json();
          results.gpt_analysis = JSON.parse(gptData.choices[0].message.content);
          console.log('GPT analysis completed successfully');
        } else {
          console.error('GPT API error:', gptResponse.statusText);
          results.gpt_error = `GPT API error: ${gptResponse.statusText}`;
        }
      } catch (error) {
        console.error('GPT analysis failed:', error);
        results.gpt_error = error.message;
      }
    }

    // Call Claude if available and requested
    if (claudeApiKey && (model === 'both' || model === 'claude')) {
      try {
        console.log('Calling Claude Sonnet...');
        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${claudeApiKey}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            temperature: 0.2,
            messages: [
              {
                role: 'user',
                content: createMikeReyesPrompt('Claude-Sonnet-4')
              }
            ]
          }),
        });

        if (claudeResponse.ok) {
          const claudeData = await claudeResponse.json();
          // Extract JSON from Claude's response
          const content = claudeData.content[0].text;
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              results.claude_analysis = JSON.parse(jsonMatch[0]);
              console.log('Claude analysis completed successfully');
            } else {
              throw new Error('No JSON found in Claude response');
            }
          } catch (parseError) {
            console.error('Claude JSON parsing error:', parseError);
            results.claude_error = 'Failed to parse Claude response as JSON';
          }
        } else {
          console.error('Claude API error:', claudeResponse.statusText);
          results.claude_error = `Claude API error: ${claudeResponse.statusText}`;
        }
      } catch (error) {
        console.error('Claude analysis failed:', error);
        results.claude_error = error.message;
      }
    }

    // Create aggregated analysis
    const aggregatedAnalysis = {
      asset_id: equipmentData.asset_id,
      analysis_type: 'dual_ai_mike_reyes',
      models_used: Object.keys(results).filter(key => !key.includes('_error')),
      gpt_analysis: results.gpt_analysis || null,
      claude_analysis: results.claude_analysis || null,
      errors: {
        gpt_error: results.gpt_error || null,
        claude_error: results.claude_error || null
      },
      statistical_baselines: baselines,
      anomaly_detection: anomalies,
      data_quality: {
        manual_readings_count: manualReadings.length,
        standard_readings_count: standardReadings.length,
        coverage_assessment: manualReadings.length > 0 ? 'Good - manual readings available' : 'Limited - only standard readings available',
        reading_source_used: readingSource
      },
      consensus_analysis: null as any
    };

    // Create consensus analysis if both models succeeded
    if (results.gpt_analysis && results.claude_analysis) {
      const gpt = results.gpt_analysis;
      const claude = results.claude_analysis;
      
      // Calculate consensus risk level
      const riskLevels = { low: 1, medium: 2, high: 3 };
      const avgRisk = (riskLevels[gpt.risk_level] + riskLevels[claude.risk_level]) / 2;
      const consensusRisk = avgRisk <= 1.5 ? 'low' : avgRisk <= 2.5 ? 'medium' : 'high';
      
      // Average confidence scores
      const avgConfidence = (gpt.confidence_score + claude.confidence_score) / 2;
      
      // Combine failure probabilities
      const consensusFailure = {
        "<7d>": Math.max(gpt.mike_reyes_analysis?.failure_probability?.["<7d>"] || 0, claude.mike_reyes_analysis?.failure_probability?.["<7d>"] || 0),
        "8-30d": Math.max(gpt.mike_reyes_analysis?.failure_probability?.["8-30d"] || 0, claude.mike_reyes_analysis?.failure_probability?.["8-30d"] || 0),
        "31-90d": Math.max(gpt.mike_reyes_analysis?.failure_probability?.["31-90d"] || 0, claude.mike_reyes_analysis?.failure_probability?.["31-90d"] || 0),
        highest_risk_mode: gpt.mike_reyes_analysis?.failure_probability?.highest_risk_mode || claude.mike_reyes_analysis?.failure_probability?.highest_risk_mode || 'unknown'
      };

      aggregatedAnalysis.consensus_analysis = {
        risk_level: consensusRisk,
        confidence_score: avgConfidence,
        finding: `Consensus analysis from GPT and Claude: ${consensusRisk} risk level detected`,
        recommendation: `Both models recommend immediate attention. GPT suggests: ${gpt.recommendation}. Claude suggests: ${claude.recommendation}`,
        create_work_order: gpt.create_work_order || claude.create_work_order,
        mike_reyes_analysis: {
          summary: `Dual AI analysis consensus: ${consensusRisk} risk with ${Math.round(avgConfidence * 100)}% confidence`,
          failure_probability: consensusFailure,
          model_agreement: {
            risk_agreement: gpt.risk_level === claude.risk_level,
            confidence_variance: Math.abs(gpt.confidence_score - claude.confidence_score),
            recommendation_similarity: gpt.recommendation.length > 0 && claude.recommendation.length > 0 ? 'analyzed' : 'insufficient_data'
          }
        }
      };
    }

    console.log('Dual AI analysis completed:', {
      gpt_success: !!results.gpt_analysis,
      claude_success: !!results.claude_analysis,
      consensus_created: !!aggregatedAnalysis.consensus_analysis
    });

    return new Response(
      JSON.stringify(aggregatedAnalysis),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in dual AI predictive analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        analysis_type: 'dual_ai_mike_reyes_error',
        asset_id: '',
        models_used: [],
        statistical_baselines: {},
        anomaly_detection: []
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