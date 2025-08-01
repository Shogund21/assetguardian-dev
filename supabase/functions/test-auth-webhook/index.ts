import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== TEST AUTH WEBHOOK TRIGGERED ===");
  console.log("Request method:", req.method);
  
  // Log all headers
  console.log("=== ALL HEADERS ===");
  for (const [key, value] of req.headers.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  // Log URL and query params
  console.log("=== URL INFO ===");
  console.log("URL:", req.url);
  
  try {
    // Try to read the body
    const body = await req.text();
    console.log("=== BODY ===");
    console.log("Body length:", body.length);
    console.log("Body content:", body);
    
    // Try to parse as JSON if possible
    if (body) {
      try {
        const jsonBody = JSON.parse(body);
        console.log("=== PARSED JSON BODY ===");
        console.log(JSON.stringify(jsonBody, null, 2));
      } catch (e) {
        console.log("Body is not valid JSON");
      }
    }
    
  } catch (error) {
    console.error("Error reading body:", error);
  }
  
  // Always return success to see what Supabase expects
  return new Response(JSON.stringify({ 
    status: "success", 
    message: "Test webhook received request" 
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
};

serve(handler);