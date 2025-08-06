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

// Rate limiting configuration
const DEFAULT_LIMITS = {
  messagesPerSession: 20,
  messagesPerDay: 50,
  tokensPerSession: 10000,
  tokensPerDay: 50000,
  costPerSessionUSD: 5.00,
  costPerDayUSD: 25.00,
  throttleDelayMs: 2000,
  progressiveThrottle: true
};

// Helper to get client IP
function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfIP = req.headers.get('cf-connecting-ip');
  
  return cfIP || realIP || forwarded?.split(',')[0] || 'unknown';
}

// Helper to calculate token cost (rough estimate for GPT-4o-mini)
function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCostPer1k = 0.00015; // $0.15 per 1K tokens
  const outputCostPer1k = 0.0006; // $0.60 per 1K tokens
  
  return ((inputTokens / 1000) * inputCostPer1k) + ((outputTokens / 1000) * outputCostPer1k);
}

// Get current rate limit configuration
async function getRateLimitConfig() {
  const { data, error } = await supabase
    .from('rate_limit_configs')
    .select('*')
    .eq('is_active', true)
    .single();
    
  if (error || !data) {
    console.log('Using default rate limits:', error?.message);
    return DEFAULT_LIMITS;
  }
  
  return {
    messagesPerSession: data.messages_per_session,
    messagesPerDay: data.messages_per_day,
    tokensPerSession: data.tokens_per_session,
    tokensPerDay: data.tokens_per_day,
    costPerSessionUSD: parseFloat(data.cost_per_session_usd),
    costPerDayUSD: parseFloat(data.cost_per_day_usd),
    throttleDelayMs: data.throttle_delay_ms,
    progressiveThrottle: data.progressive_throttle
  };
}

// Check for rate limit overrides
async function checkRateLimitOverride(identifier: string, identifierType: string) {
  const { data } = await supabase
    .from('rate_limit_overrides')
    .select('*')
    .eq('identifier', identifier)
    .eq('identifier_type', identifierType)
    .eq('is_active', true)
    .maybeSingle();
    
  if (!data) return null;
  
  // Check if override is expired
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    // Deactivate expired override
    await supabase
      .from('rate_limit_overrides')
      .update({ is_active: false })
      .eq('id', data.id);
    return null;
  }
  
  return data;
}

// Get or create rate limit record
async function getRateLimitRecord(identifier: string, identifierType: string, sessionId: string) {
  // First try to get existing record
  let { data: existing } = await supabase
    .from('chat_rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .eq('identifier_type', identifierType)
    .maybeSingle();
    
  if (existing) {
    // Check if we need to reset (24 hours passed)
    const resetTime = new Date(existing.reset_at);
    const now = new Date();
    
    if (now > resetTime) {
      // Reset the record
      const { data: updated } = await supabase
        .from('chat_rate_limits')
        .update({
          messages_count: 0,
          tokens_used: 0,
          cost_usd: 0,
          first_message_at: now.toISOString(),
          last_message_at: now.toISOString(),
          reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          is_blocked: false,
          blocked_until: null,
          session_id: sessionId
        })
        .eq('id', existing.id)
        .select()
        .single();
        
      return updated.data;
    }
    
    return existing;
  }
  
  // Create new record
  const now = new Date();
  const { data: newRecord } = await supabase
    .from('chat_rate_limits')
    .insert({
      identifier,
      identifier_type: identifierType,
      session_id: sessionId,
      messages_count: 0,
      tokens_used: 0,
      cost_usd: 0,
      first_message_at: now.toISOString(),
      last_message_at: now.toISOString(),
      reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      is_blocked: false
    })
    .select()
    .single();
    
  return newRecord.data;
}

// Check if request should be rate limited
async function checkRateLimit(clientIP: string, sessionId: string, conversationHistory: any[]) {
  const config = await getRateLimitConfig();
  
  // Check IP-based limits
  const ipRecord = await getRateLimitRecord(clientIP, 'ip', sessionId);
  const ipOverride = await checkRateLimitOverride(clientIP, 'ip');
  
  // Check session-based limits
  const sessionRecord = await getRateLimitRecord(sessionId, 'session', sessionId);
  const sessionOverride = await checkRateLimitOverride(sessionId, 'session');
  
  const hasOverride = ipOverride || sessionOverride;
  const effectiveOverride = ipOverride || sessionOverride;
  
  // If blocked and no override
  if ((ipRecord?.is_blocked || sessionRecord?.is_blocked) && !hasOverride) {
    const blockedUntil = ipRecord?.blocked_until || sessionRecord?.blocked_until;
    if (blockedUntil && new Date(blockedUntil) > new Date()) {
      return {
        blocked: true,
        reason: 'temporarily_blocked',
        resetTime: blockedUntil,
        hasOverride: false
      };
    }
  }
  
  // Apply override limits if present
  let limits = config;
  if (effectiveOverride) {
    if (effectiveOverride.override_type === 'unlimited') {
      return { blocked: false, hasOverride: true, limits };
    } else if (effectiveOverride.override_type === 'custom') {
      limits = {
        ...config,
        messagesPerSession: effectiveOverride.custom_message_limit || config.messagesPerSession,
        tokensPerSession: effectiveOverride.custom_token_limit || config.tokensPerSession,
        costPerSessionUSD: effectiveOverride.custom_cost_limit ? parseFloat(effectiveOverride.custom_cost_limit) : config.costPerSessionUSD
      };
    } else if (effectiveOverride.override_type === 'extended') {
      limits = {
        ...config,
        messagesPerSession: config.messagesPerSession * 2,
        messagesPerDay: config.messagesPerDay * 2,
        tokensPerSession: config.tokensPerSession * 2,
        tokensPerDay: config.tokensPerDay * 2,
        costPerSessionUSD: config.costPerSessionUSD * 2,
        costPerDayUSD: config.costPerDayUSD * 2
      };
    }
  }
  
  // Check session message limit
  const sessionMessageCount = conversationHistory.length + 1; // +1 for the new message
  if (sessionMessageCount > limits.messagesPerSession) {
    return {
      blocked: true,
      reason: 'session_message_limit',
      limit: limits.messagesPerSession,
      current: sessionMessageCount,
      hasOverride: !!hasOverride
    };
  }
  
  // Check daily message limit
  if ((ipRecord?.messages_count || 0) >= limits.messagesPerDay) {
    return {
      blocked: true,
      reason: 'daily_message_limit',
      limit: limits.messagesPerDay,
      current: ipRecord?.messages_count || 0,
      resetTime: ipRecord?.reset_at,
      hasOverride: !!hasOverride
    };
  }
  
  // Check daily token limit
  if ((ipRecord?.tokens_used || 0) >= limits.tokensPerDay) {
    return {
      blocked: true,
      reason: 'daily_token_limit',
      limit: limits.tokensPerDay,
      current: ipRecord?.tokens_used || 0,
      resetTime: ipRecord?.reset_at,
      hasOverride: !!hasOverride
    };
  }
  
  // Check daily cost limit
  if ((ipRecord?.cost_usd || 0) >= limits.costPerDayUSD) {
    return {
      blocked: true,
      reason: 'daily_cost_limit',
      limit: limits.costPerDayUSD,
      current: ipRecord?.cost_usd || 0,
      resetTime: ipRecord?.reset_at,
      hasOverride: !!hasOverride
    };
  }
  
  // Calculate progressive delay
  let delay = 0;
  if (config.progressiveThrottle && !hasOverride) {
    const recentMessages = conversationHistory.filter(msg => {
      const msgTime = new Date(msg.timestamp);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return msgTime > fiveMinutesAgo;
    }).length;
    
    if (recentMessages > 5) {
      delay = Math.min(config.throttleDelayMs * (recentMessages - 4), 10000); // Max 10 second delay
    }
  }
  
  return {
    blocked: false,
    delay,
    limits,
    hasOverride: !!hasOverride,
    ipRecord,
    sessionRecord
  };
}

// Update rate limit records after API call
async function updateRateLimitRecords(
  clientIP: string, 
  sessionId: string, 
  tokensUsed: number, 
  cost: number,
  hadOverride: boolean
) {
  const now = new Date().toISOString();
  
  // Update IP record
  await supabase
    .from('chat_rate_limits')
    .update({
      messages_count: supabase.raw('messages_count + 1'),
      tokens_used: supabase.raw(`tokens_used + ${tokensUsed}`),
      cost_usd: supabase.raw(`cost_usd + ${cost}`),
      last_message_at: now
    })
    .eq('identifier', clientIP)
    .eq('identifier_type', 'ip');
    
  // Update session record (for session-specific tracking)
  await supabase
    .from('chat_rate_limits')
    .update({
      messages_count: supabase.raw('messages_count + 1'),
      tokens_used: supabase.raw(`tokens_used + ${tokensUsed}`),
      cost_usd: supabase.raw(`cost_usd + ${cost}`),
      last_message_at: now
    })
    .eq('identifier', sessionId)
    .eq('identifier_type', 'session');
}

// Log analytics event
async function logAnalytics(
  identifier: string,
  identifierType: string,
  eventType: string,
  sessionId: string,
  messagesCount: number,
  tokensUsed: number,
  cost: number,
  limitType?: string,
  hadOverride: boolean = false,
  metadata: any = {}
) {
  await supabase
    .from('chat_rate_limit_analytics')
    .insert({
      identifier,
      identifier_type: identifierType,
      event_type: eventType,
      session_id: sessionId,
      messages_count: messagesCount,
      tokens_used: tokensUsed,
      cost_usd: cost,
      limit_type: limitType,
      had_override: hadOverride,
      metadata
    });
}

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
    const clientIP = getClientIP(req);

    console.log('Chat request:', { sessionId, message, visitorInfo, clientIP });

    // Check rate limits
    const rateLimitCheck = await checkRateLimit(clientIP, sessionId, conversationHistory || []);
    
    if (rateLimitCheck.blocked) {
      let errorMessage = "Rate limit exceeded. ";
      let rateLimitInfo: any = { rateLimited: true, reason: rateLimitCheck.reason };
      
      switch (rateLimitCheck.reason) {
        case 'session_message_limit':
          errorMessage += `You've reached the maximum of ${rateLimitCheck.limit} messages per session.`;
          rateLimitInfo.limit = rateLimitCheck.limit;
          rateLimitInfo.current = rateLimitCheck.current;
          break;
        case 'daily_message_limit':
          errorMessage += `You've reached the daily limit of ${rateLimitCheck.limit} messages.`;
          rateLimitInfo.limit = rateLimitCheck.limit;
          rateLimitInfo.resetTime = rateLimitCheck.resetTime;
          break;
        case 'daily_token_limit':
          errorMessage += `You've reached the daily token limit of ${rateLimitCheck.limit} tokens.`;
          rateLimitInfo.limit = rateLimitCheck.limit;
          rateLimitInfo.resetTime = rateLimitCheck.resetTime;
          break;
        case 'daily_cost_limit':
          errorMessage += `You've reached the daily cost limit of $${rateLimitCheck.limit}.`;
          rateLimitInfo.limit = rateLimitCheck.limit;
          rateLimitInfo.resetTime = rateLimitCheck.resetTime;
          break;
        case 'temporarily_blocked':
          errorMessage += `You are temporarily blocked until ${new Date(rateLimitCheck.resetTime).toLocaleString()}.`;
          rateLimitInfo.resetTime = rateLimitCheck.resetTime;
          break;
      }
      
      if (rateLimitCheck.hasOverride) {
        errorMessage += " (Override detected but insufficient)";
      }
      
      // Log rate limit hit
      await logAnalytics(
        clientIP,
        'ip',
        'limit_hit',
        sessionId,
        conversationHistory?.length || 0,
        0,
        0,
        rateLimitCheck.reason,
        rateLimitCheck.hasOverride
      );
      
      return new Response(JSON.stringify({
        error: errorMessage,
        response: errorMessage,
        ...rateLimitInfo
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Apply throttling delay if needed
    if (rateLimitCheck.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, rateLimitCheck.delay));
      
      // Log throttling event
      await logAnalytics(
        clientIP,
        'ip',
        'throttled',
        sessionId,
        conversationHistory?.length || 0,
        0,
        0,
        'progressive_throttle',
        rateLimitCheck.hasOverride,
        { delayMs: rateLimitCheck.delay }
      );
    }

    // Prepare conversation context for OpenAI
    const messages: Message[] = [
      { role: 'system', content: FACILITIES_PROMPT }
    ];

    // Add recent conversation history (last 10 messages to keep context manageable)
    const recentHistory = (conversationHistory || []).slice(-10);
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
    
    if (!aiData.choices || !aiData.choices[0]) {
      throw new Error('Invalid OpenAI response');
    }
    
    const aiResponse = aiData.choices[0].message.content;
    const tokensUsed = aiData.usage?.total_tokens || 0;
    const inputTokens = aiData.usage?.prompt_tokens || 0;
    const outputTokens = aiData.usage?.completion_tokens || 0;
    const cost = calculateCost(inputTokens, outputTokens);

    // Update rate limit records
    await updateRateLimitRecords(clientIP, sessionId, tokensUsed, cost, rateLimitCheck.hasOverride);
    
    // Log successful message
    await logAnalytics(
      clientIP,
      'ip',
      'message_sent',
      sessionId,
      (conversationHistory?.length || 0) + 1,
      tokensUsed,
      cost,
      null,
      rateLimitCheck.hasOverride,
      { inputTokens, outputTokens }
    );

    // Extract information from the conversation
    const extractedInfo = extractVisitorInfo(message);
    const updatedVisitorInfo = { ...visitorInfo, ...extractedInfo };

    // Determine if this is a qualified lead
    const shouldSendEmail = isQualifiedLead(aiResponse, updatedVisitorInfo, conversationHistory?.length || 0);

    // Store conversation in database
    await supabase.from('chat_sessions').upsert({
      session_id: sessionId,
      visitor_info: updatedVisitorInfo,
      messages: [...(conversationHistory || []), 
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
      sessionId,
      rateLimitInfo: {
        hasOverride: rateLimitCheck.hasOverride,
        tokensUsed,
        cost: cost.toFixed(4),
        remainingMessages: Math.max(0, rateLimitCheck.limits.messagesPerSession - ((conversationHistory?.length || 0) + 1))
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot-conversation function:', error);
    
    // Log error event
    try {
      const clientIP = getClientIP(req);
      const body = await req.clone().json();
      await logAnalytics(
        clientIP,
        'ip',
        'error',
        body.sessionId || 'unknown',
        0,
        0,
        0,
        'api_error',
        false,
        { error: error.message }
      );
    } catch (logError) {
      console.error('Failed to log error analytics:', logError);
    }
    
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
