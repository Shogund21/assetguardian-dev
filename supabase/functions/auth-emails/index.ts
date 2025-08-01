import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase Send Email Hook interface
interface EmailHookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      [key: string]: any;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: 'signup' | 'recovery' | 'magic_link' | 'confirmation' | 'email_change';
    site_url: string;
  };
}

const generateConfirmationEmail = (
  firstName: string,
  confirmationUrl: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Asset Guardian Account</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <img src="https://bqxdbvrtohgkusmdmjxd.supabase.co/storage/v1/object/public/company-assets/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" alt="Asset Guardian" style="height: 60px; width: 60px;">
    <h1 style="color: #2563eb; margin-top: 20px;">Welcome to Asset Guardian!</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
    <h2 style="margin-top: 0; color: #1e293b;">Hi ${firstName || 'there'}!</h2>
    <p style="font-size: 16px; margin-bottom: 25px;">
      Thank you for signing up with Asset Guardian. To complete your registration and access your facilities management platform, please confirm your email address.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${confirmationUrl}" 
         style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
        Confirm Your Account
      </a>
    </div>
  </div>
  
  <div style="text-align: center; font-size: 14px; color: #64748b;">
    <p>If you didn't create an account with Asset Guardian, you can safely ignore this email.</p>
    <p style="margin-top: 30px;">
      Need help? Contact us at <a href="mailto:support@assetguardian.com" style="color: #2563eb;">support@assetguardian.com</a>
    </p>
  </div>
</body>
</html>
`;

const generatePasswordResetEmail = (
  firstName: string,
  resetUrl: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Asset Guardian Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <img src="https://bqxdbvrtohgkusmdmjxd.supabase.co/storage/v1/object/public/company-assets/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" alt="Asset Guardian" style="height: 60px; width: 60px;">
    <h1 style="color: #dc2626; margin-top: 20px;">Password Reset Request</h1>
  </div>
  
  <div style="background: #fef2f2; padding: 30px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #dc2626;">
    <h2 style="margin-top: 0; color: #1e293b;">Hi ${firstName || 'there'}!</h2>
    <p style="font-size: 16px; margin-bottom: 25px;">
      We received a request to reset your password for your Asset Guardian account. Click the button below to create a new password.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
      This link will expire in 24 hours for security reasons.
    </p>
  </div>
  
  <div style="text-align: center; font-size: 14px; color: #64748b;">
    <p><strong>If you didn't request this password reset, please ignore this email.</strong></p>
    <p>Your password will remain unchanged until you create a new one using the link above.</p>
    <p style="margin-top: 30px;">
      Need help? Contact us at <a href="mailto:support@assetguardian.com" style="color: #2563eb;">support@assetguardian.com</a>
    </p>
  </div>
</body>
</html>
`;

// Function to verify webhook signature using standardwebhooks
const verifyWebhookSignature = (payload: string, headers: Record<string, string>): any => {
  if (!hookSecret) {
    console.log("⚠️  No webhook secret configured - allowing request");
    return JSON.parse(payload);
  }

  try {
    const wh = new Webhook(hookSecret);
    return wh.verify(payload, headers);
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error);
    throw new Error("Invalid webhook signature");
  }
};

// Main handler function
const handler = async (req: Request): Promise<Response> => {
  console.log("🚀 Auth emails Send Email Hook triggered");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("✅ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log("❌ Invalid method:", req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }

  try {
    // Get request body and headers
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    console.log("📝 Request payload length:", payload.length);
    console.log("📧 Processing Send Email Hook request");

    // Verify webhook signature and parse payload
    const hookData = verifyWebhookSignature(payload, headers) as EmailHookPayload;
    
    const { user, email_data } = hookData;
    const { email_action_type, token, token_hash, redirect_to, site_url } = email_data;
    
    console.log(`📧 Email action: ${email_action_type} for ${user.email}`);

    let emailType: string;
    let emailHtml: string;

    switch (email_action_type) {
      case 'signup':
      case 'confirmation':
        emailType = 'Welcome & Email Confirmation';
        emailHtml = generateConfirmationEmail(
          user.user_metadata?.first_name || 'User',
          `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
        );
        break;
        
      case 'recovery':
        emailType = 'Password Reset';
        emailHtml = generatePasswordResetEmail(
          user.user_metadata?.first_name || 'User',
          `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
        );
        break;
        
      case 'magic_link':
        emailType = 'Magic Link Login';
        emailHtml = generateConfirmationEmail(
          user.user_metadata?.first_name || 'User',
          `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
        );
        break;
        
      case 'email_change':
        emailType = 'Email Change Confirmation';
        emailHtml = generateConfirmationEmail(
          user.user_metadata?.first_name || 'User',
          `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
        );
        break;
        
      default:
        console.log(`⚠️  Unsupported email action type: ${email_action_type}`);
        return new Response(
          JSON.stringify({ success: true, message: 'Email action type not handled' }), 
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
    }

    // Send email using Resend
    console.log(`📧 Sending ${emailType} to ${user.email}`);
    
    const emailResult = await resend.emails.send({
      from: "Lovable Facilities <noreply@resend.dev>",
      to: [user.email],
      subject: emailType,
      html: emailHtml,
    });

    if (emailResult.error) {
      console.error("❌ Resend error:", emailResult.error);
      // Return 200 even on email errors to avoid blocking Supabase auth flow
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email sending failed',
          details: emailResult.error 
        }), 
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log("✅ Email sent successfully:", emailResult.data?.id);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResult.data?.id,
        type: emailType 
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error("❌ Handler error:", error);
    
    // Return 200 even on errors to avoid blocking Supabase auth flow
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);