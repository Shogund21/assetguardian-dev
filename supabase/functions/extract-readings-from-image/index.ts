
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, equipmentType } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced equipment-specific prompts with real examples
    const equipmentPrompts = {
      chiller: {
        description: "Look for pressure readings (PSI), temperature readings (°F), refrigerant levels, flow rates (GPM), and status indicators on chiller displays or gauges.",
        examples: `
Common chiller readings include:
- Evaporator entering water temp: 55-65°F
- Evaporator leaving water temp: 40-50°F  
- Condenser entering water temp: 85-95°F
- Condenser leaving water temp: 95-105°F
- High pressure: 150-250 PSI
- Low pressure: 50-80 PSI
- Oil pressure: 25-50 PSI above suction pressure
- Amperage readings for compressor motors
- Flow rates: 100-2000 GPM typically`
      },
      ahu: {
        description: "Look for airflow readings (CFM), temperature readings (°F), pressure readings (PSI), filter status, fan RPM, and operational indicators.",
        examples: `
Common AHU readings include:
- Supply air temperature: 55-75°F
- Return air temperature: 70-80°F
- Mixed air temperature: 60-75°F
- Static pressure: 0.5-3.0 inches WC
- Fan RPM: 500-1800 RPM typically
- Airflow: 1000-50000 CFM
- Filter pressure drop: 0.1-1.0 inches WC
- Motor amperage readings`
      },
      elevator: {
        description: "Look for floor indicators, speed readings, load readings, and status displays on elevator control panels.", 
        examples: `
Common elevator readings include:
- Floor position: B, 1, 2, 3, etc.
- Load weight: 0-4000 lbs typically
- Speed: 50-500 FPM
- Motor current readings
- Door operation status
- Safety system indicators`
      },
      rtu: {
        description: "Look for temperature readings (°F), pressure readings (PSI), airflow (CFM), and status indicators on rooftop unit displays.",
        examples: `
Common RTU readings include:
- Discharge air temperature: 55-75°F
- Return air temperature: 70-80°F
- Outdoor air temperature: varies with weather
- Gas pressure: 3.5-14 inches WC
- Refrigerant pressures: High 150-350 PSI, Low 50-150 PSI
- Supply fan RPM: 400-1200 RPM
- Airflow: 500-10000 CFM`
      },
      restroom: {
        description: "Look for digital displays showing occupancy, cleanliness scores, supply levels, or maintenance indicators.",
        examples: `
Common restroom readings include:
- Occupancy count: 0-50 people
- Cleanliness score: 1-10 or percentage
- Paper towel level: 0-100%
- Toilet paper level: 0-100%
- Soap level: 0-100%
- Traffic counter readings`
      },
      general: {
        description: "Look for any numerical readings, gauges, displays, or indicators that show equipment status, measurements, or operational data.",
        examples: `
Look for any numerical values including:
- Temperature readings in °F or °C
- Pressure readings in PSI, inches WC, or bar
- Flow rates in CFM, GPM, or similar
- RPM readings for motors/fans
- Electrical readings (amps, volts, watts)
- Percentage values for levels or efficiency`
      }
    };

    const equipmentInfo = equipmentPrompts[equipmentType as keyof typeof equipmentPrompts] || equipmentPrompts.general;

    const prompt = `You are an expert HVAC maintenance technician with 20+ years of experience analyzing equipment images for accurate readings.

EQUIPMENT TYPE: ${equipmentType}
FOCUS: ${equipmentInfo.description}

${equipmentInfo.examples}

ANALYSIS INSTRUCTIONS:
1. First, identify the type of display (digital LCD, analog gauge, LED display, etc.)
2. Look for clear numerical values - prioritize sharp, well-lit displays
3. Check for unit indicators near the numbers (°F, PSI, CFM, RPM, %, etc.)
4. For analog gauges, carefully read the needle position and scale
5. Look for multiple readings on the same display panel
6. Note any warning lights or status indicators

IMAGE QUALITY REQUIREMENTS:
- Only extract readings from clear, legible displays
- Confidence must reflect actual readability (98%+ for production use)
- If numbers are blurry, partially obscured, or unclear, mark confidence < 0.98

For each reading found, provide:
1. type: What is being measured (use standard HVAC terms)
2. value: The exact numerical value (numbers only, no units)
3. unit: The unit of measurement (°F, PSI, CFM, RPM, %, inches WC, etc.)
4. confidence: Your confidence level (0-1 scale, be conservative)
5. location: Specific location description (e.g., "main LCD display center", "pressure gauge left side")

RESPONSE FORMAT - Return valid JSON only:
{
  "readings": [
    {
      "type": "supply_air_temperature",
      "value": "68.5",
      "unit": "°F",
      "confidence": 0.99,
      "location": "main digital display"
    }
  ]
}

VALIDATION RULES:
- Only include readings you can see clearly
- Use conservative confidence scores
- If no clear readings are visible, return {"readings": []}
- Double-check each value against the visible display`;

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
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.05,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('OpenAI response:', content);
    
    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    // Validate and sanitize the response
    const readings = parsedResponse.readings || [];
    const validatedReadings = readings.filter((reading: any) => 
      reading.type && reading.value && reading.unit
    ).map((reading: any) => ({
      type: String(reading.type).toLowerCase().replace(/\s+/g, '_'),
      value: String(reading.value),
      unit: String(reading.unit),
      confidence: Math.min(Math.max(Number(reading.confidence) || 0, 0), 1),
      location: reading.location ? String(reading.location) : undefined
    }));

    console.log('Validated readings:', validatedReadings);

    // PHASE 1: Multi-model validation and consensus system
    let finalReadings = validatedReadings;
    let consensusScore = 0;
    const modelResults = [];
    
    if (validatedReadings.length > 0) {
      console.log('Starting multi-model validation for:', validatedReadings.length, 'readings');
      
      // Model 1: GPT-4o with enhanced validation prompt
      try {
        const validationPrompt = `You are a precision instrument reader with expertise in ${equipmentType} equipment. 
        
CRITICAL VALIDATION TASK:
Review the extracted readings below against the actual image. Your job is to verify accuracy with 98%+ confidence.

EXTRACTED READINGS TO VALIDATE:
${JSON.stringify(validatedReadings, null, 2)}

VALIDATION CRITERIA:
1. Can you clearly see each reading in the image? (No guessing)
2. Are the numbers exactly as shown? (No interpretation)
3. Are the units correct based on context?
4. Is the location description accurate?

For each reading, return confidence based on:
- 0.99: Crystal clear, no doubt, perfect readability
- 0.95-0.98: Very clear, minor lighting/angle issues
- 0.90-0.94: Readable but some clarity issues
- <0.90: Poor quality, hard to read, uncertain

ONLY CONFIRM readings you can see with absolute certainty. Return JSON format:
{
  "readings": [
    {
      "type": "verified_type",
      "value": "exact_value_seen",
      "unit": "verified_unit", 
      "confidence": 0.99,
      "location": "precise_location",
      "validation_notes": "what makes you confident/uncertain"
    }
  ]
}`;

        const model1Response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: validationPrompt },
                  {
                    type: 'image_url',
                    image_url: { url: image, detail: 'high' }
                  }
                ]
              }
            ],
            max_tokens: 1500,
            temperature: 0.0,
          }),
        });

        if (model1Response.ok) {
          const model1Data = await model1Response.json();
          const model1Content = model1Data.choices[0].message.content;
          console.log('Model 1 (GPT-4o) validation:', model1Content);
          
          try {
            const model1Result = JSON.parse(model1Content.match(/\{[\s\S]*\}/)?.[0] || '{"readings":[]}');
            if (model1Result.readings) {
              modelResults.push({ model: 'gpt-4o', readings: model1Result.readings });
            }
          } catch (e) {
            console.log('Model 1 parse error:', e.message);
          }
        }
      } catch (e) {
        console.log('Model 1 validation failed:', e.message);
      }

      // Model 2: GPT-4o-mini with independent analysis
      try {
        const independentPrompt = `Fresh analysis: Extract readings from this ${equipmentType} equipment image.
        
FOCUS ON PRECISION:
- Only extract readings you can see with 98%+ confidence
- Double-check each number against the display
- Verify units match the display indicators
- Be conservative with confidence scores

Return JSON format with your independent analysis:
{
  "readings": [
    {
      "type": "measurement_type",
      "value": "exact_number",
      "unit": "correct_unit",
      "confidence": 0.XX,
      "location": "where_you_see_it"
    }
  ]
}`;

        const model2Response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: independentPrompt },
                  {
                    type: 'image_url',
                    image_url: { url: image, detail: 'high' }
                  }
                ]
              }
            ],
            max_tokens: 1000,
            temperature: 0.0,
          }),
        });

        if (model2Response.ok) {
          const model2Data = await model2Response.json();
          const model2Content = model2Data.choices[0].message.content;
          console.log('Model 2 (GPT-4o-mini) analysis:', model2Content);
          
          try {
            const model2Result = JSON.parse(model2Content.match(/\{[\s\S]*\}/)?.[0] || '{"readings":[]}');
            if (model2Result.readings) {
              modelResults.push({ model: 'gpt-4o-mini', readings: model2Result.readings });
            }
          } catch (e) {
            console.log('Model 2 parse error:', e.message);
          }
        }
      } catch (e) {
        console.log('Model 2 analysis failed:', e.message);
      }

      // Consensus algorithm: Only keep readings confirmed by multiple models
      if (modelResults.length >= 1) {
        const consensusReadings = [];
        
        // Check each original reading against model validations
        for (const originalReading of validatedReadings) {
          const confirmations = [];
          
          for (const modelResult of modelResults) {
            const match = modelResult.readings.find(r => {
              const typeMatch = r.type.toLowerCase().replace(/\s+/g, '_') === originalReading.type;
              const valueMatch = Math.abs(parseFloat(r.value) - parseFloat(originalReading.value)) <= (parseFloat(originalReading.value) * 0.03); // 3% tolerance
              return typeMatch && valueMatch && r.confidence >= 0.95;
            });
            
            if (match) {
              confirmations.push({
                model: modelResult.model,
                confidence: match.confidence,
                notes: match.validation_notes || ''
              });
            }
          }
          
          // Require at least one model confirmation with high confidence
          if (confirmations.length >= 1) {
            const avgConfidence = confirmations.reduce((sum, c) => sum + c.confidence, 0) / confirmations.length;
            const boostedConfidence = Math.min(avgConfidence * 1.02, 1.0); // Small boost for consensus
            
            consensusReadings.push({
              ...originalReading,
              confidence: boostedConfidence,
              consensus_confirmations: confirmations.length,
              model_agreement: confirmations
            });
          }
        }
        
        finalReadings = consensusReadings;
        consensusScore = consensusReadings.length / Math.max(validatedReadings.length, 1);
        console.log('Consensus results:', {
          original: validatedReadings.length,
          consensus: consensusReadings.length,
          score: consensusScore,
          models_used: modelResults.length
        });
      }
    }

    // Check if all readings meet the 98% confidence threshold
    const CONFIDENCE_THRESHOLD = 0.98;
    const lowConfidenceReadings = finalReadings.filter(reading => reading.confidence < CONFIDENCE_THRESHOLD);
    
    if (finalReadings.length > 0 && lowConfidenceReadings.length > 0) {
      // Some readings found but confidence too low
      return new Response(JSON.stringify({ 
        status: 'needs_better_image',
        message: 'Image quality insufficient for accurate readings. Please take a clearer photo or use manual input.',
        confidence_issues: lowConfidenceReadings.map(r => ({
          type: r.type,
          confidence: Math.round(r.confidence * 100)
        })),
        threshold_required: 98
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enhanced response with Phase 1 analytics
    return new Response(JSON.stringify({ 
      status: finalReadings.length > 0 ? 'success' : 'no_readings',
      readings: finalReadings,
      phase1_analytics: {
        validation_used: finalReadings.length !== validatedReadings.length,
        consensus_score: consensusScore,
        models_used: modelResults.length,
        original_readings_count: validatedReadings.length,
        final_readings_count: finalReadings.length,
        confidence_threshold: CONFIDENCE_THRESHOLD,
        average_confidence: finalReadings.length > 0 
          ? finalReadings.reduce((sum, r) => sum + r.confidence, 0) / finalReadings.length 
          : 0
      },
      originalResponse: content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-readings-from-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      readings: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
