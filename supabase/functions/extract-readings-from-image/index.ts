
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

    // Create equipment-specific prompts
    const equipmentPrompts = {
      chiller: "Look for pressure readings (PSI), temperature readings (°F), refrigerant levels, flow rates (GPM), and any status indicators on chiller displays or gauges.",
      ahu: "Look for airflow readings (CFM), temperature readings (°F), pressure readings (PSI), filter status, fan RPM, and any operational indicators on air handler displays.",
      elevator: "Look for floor indicators, speed readings, load readings, and any status displays on elevator control panels.",
      rtu: "Look for temperature readings (°F), pressure readings (PSI), airflow (CFM), and any status indicators on rooftop unit displays.",
      restroom: "Look for any digital displays showing occupancy, cleanliness scores, supply levels, or maintenance indicators.",
      general: "Look for any numerical readings, gauges, displays, or indicators that show equipment status, measurements, or operational data."
    };

    const prompt = `You are an expert maintenance technician analyzing equipment images. 

EQUIPMENT TYPE: ${equipmentType}
FOCUS: ${equipmentPrompts[equipmentType as keyof typeof equipmentPrompts] || equipmentPrompts.general}

Analyze this image and extract ALL visible readings, measurements, and status indicators. Look for:
- Digital displays showing numbers
- Analog gauges with needles pointing to values
- Status lights or indicators
- Control panel readouts
- Any numerical values visible

For each reading found, provide:
1. type: What is being measured (e.g., "temperature", "pressure", "flow_rate", "rpm")
2. value: The numerical value (just the number)
3. unit: The unit of measurement (°F, PSI, CFM, RPM, etc.)
4. confidence: How confident you are (0-1 scale)
5. location: Brief description of where on the equipment this reading was found

Return your response as a JSON object with a "readings" array. Each reading should be an object with the above properties.

Example format:
{
  "readings": [
    {
      "type": "temperature",
      "value": "72",
      "unit": "°F", 
      "confidence": 0.95,
      "location": "main display"
    },
    {
      "type": "pressure",
      "value": "15.2",
      "unit": "PSI",
      "confidence": 0.88,
      "location": "pressure gauge"
    }
  ]
}

If you cannot find any clear readings, return {"readings": []}.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        max_tokens: 1000,
        temperature: 0.1,
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

    return new Response(JSON.stringify({ 
      readings: validatedReadings,
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
