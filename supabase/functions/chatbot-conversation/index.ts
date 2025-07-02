import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FACILITIES_PROMPT = `You are an AI assistant for Asset Guardian, a comprehensive facilities management system. Your role is to help potential clients understand our services and qualify leads.

Asset Guardian offers:
- Equipment management and tracking
- Predictive maintenance with AI analytics
- HVAC, electrical, plumbing, and general maintenance
- Project management for facility improvements
- Technician management and scheduling
- Real-time monitoring and alerts
- Compliance tracking and reporting

Your goals:
1. Answer questions about Asset Guardian's capabilities
2. Qualify leads by asking about their current challenges
3. Gather contact information when appropriate
4. Be helpful, professional, and knowledgeable

Lead qualification questions to naturally work into conversation:
- What type of facilities do they manage?
- How many locations/buildings?
- Current maintenance challenges?
- Team size and current tools used?
- Timeline for implementing new solutions?

When you detect strong interest or gather enough information, indicate that this is a qualified lead.

Keep responses conversational, helpful, and under 150 words. Focus on understanding their needs rather than just promoting features.`;

interface Message {
  role: string;
  content: string;
}

interface VisitorInfo {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, visitorInfo, conversationHistory } = await req.json();

    console.log('Chat request:', { sessionId, message, visitorInfo });

    // Prepare conversation context for OpenAI
    const messages: Message[] = [
      { role: 'system', content: FACILITIES_PROMPT }
    ];

    // Add recent conversation history (last 10 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach((msg: any) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Get AI response
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    const aiResponse = aiData.choices[0].message.content;

    // Extract information from the conversation
    const extractedInfo = extractVisitorInfo(message);
    const updatedVisitorInfo = { ...visitorInfo, ...extractedInfo };

    // Determine if this is a qualified lead
    const shouldSendEmail = isQualifiedLead(aiResponse, updatedVisitorInfo, conversationHistory.length);

    // Store conversation in database
    await supabase.from('chat_sessions').upsert({
      session_id: sessionId,
      visitor_info: updatedVisitorInfo,
      messages: [...conversationHistory, 
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: aiResponse, timestamp: new Date() }
      ],
      lead_qualified: shouldSendEmail,
      updated_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      response: aiResponse,
      extractedInfo,
      shouldSendEmail,
      sessionId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot-conversation function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process conversation',
        response: "I'm sorry, I'm having trouble responding right now. Please try again in a moment."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractVisitorInfo(message: string): VisitorInfo {
  const info: VisitorInfo = {};
  
  // Simple regex patterns to extract information
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  
  const emailMatch = message.match(emailRegex);
  if (emailMatch) {
    info.email = emailMatch[0];
  }
  
  const phoneMatch = message.match(phoneRegex);
  if (phoneMatch) {
    info.phone = phoneMatch[0];
  }
  
  // Look for "I'm" or "My name is" patterns
  const namePatterns = [
    /(?:i'm|i am|my name is|this is)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i,
    /^([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+here/i
  ];
  
  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      info.name = match[1].trim();
      break;
    }
  }
  
  // Look for company mentions
  const companyPatterns = [
    /(?:work at|from|with|at)\s+([A-Z][a-zA-Z\s&.]+(?:Inc|LLC|Corp|Company|Co\.?)?)/,
    /(?:our company|my company|we are)\s+([A-Z][a-zA-Z\s&.]+)/
  ];
  
  for (const pattern of companyPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      info.company = match[1].trim();
      break;
    }
  }
  
  return info;
}

function isQualifiedLead(aiResponse: string, visitorInfo: VisitorInfo, messageCount: number): boolean {
  // Lead is qualified if:
  // 1. We have contact information (email or phone)
  // 2. They've shown interest (multiple messages)
  // 3. AI response indicates interest or qualification
  
  const hasContact = !!(visitorInfo.email || visitorInfo.phone);
  const hasEngagement = messageCount >= 3;
  
  const qualificationKeywords = [
    'interested', 'pricing', 'demo', 'trial', 'implementation',
    'timeline', 'budget', 'contact', 'sales', 'quote',
    'how much', 'cost', 'price', 'when can', 'get started'
  ];
  
  const showsInterest = qualificationKeywords.some(keyword => 
    aiResponse.toLowerCase().includes(keyword)
  );
  
  return hasContact && (hasEngagement || showsInterest);
}
