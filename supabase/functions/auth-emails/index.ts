import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("AUTH_WEBHOOK_SECRET") || "dev-webhook-secret-2024";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supabase Auth Webhook format
interface SupabaseAuthWebhook {
  type: string; // e.g., 'user.created', 'user.recovery_requested'
  user: {
    id: string;
    aud: string;
    role?: string;
    email: string;
    email_confirmed_at?: string;
    phone?: string;
    last_sign_in_at?: string;
    app_metadata: Record<string, any>;
    user_metadata: Record<string, any>;
    identities?: any[];
    created_at: string;
    updated_at: string;
  };
  created_at: string;
}

// Legacy format support
interface LegacyAuthEmailPayload {
  type?: string;
  user: {
    id: string;
    email: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      company?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

const generateConfirmationEmail = (
  firstName: string,
  confirmationUrl: string,
  token: string
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
    
    <div style="background: #e2e8f0; padding: 15px; border-radius: 6px; margin-top: 25px;">
      <p style="margin: 0; font-size: 14px; color: #475569;">
        <strong>Or use this confirmation code:</strong><br>
        <code style="background: #fff; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 16px; letter-spacing: 2px; margin-top: 8px; display: inline-block;">${token}</code>
      </p>
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
  resetUrl: string,
  token: string
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
    
    <div style="background: #fee2e2; padding: 15px; border-radius: 6px; margin-top: 25px;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        <strong>Or use this reset code:</strong><br>
        <code style="background: #fff; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 16px; letter-spacing: 2px; margin-top: 8px; display: inline-block;">${token}</code>
      </p>
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

const handler = async (req: Request): Promise<Response> => {
  console.log("=== AUTH EMAIL WEBHOOK TRIGGERED ===");
  console.log("Request method:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify webhook secret for security
  const webhookSecret = Deno.env.get("AUTH_WEBHOOK_SECRET");
  const authHeader = req.headers.get("authorization");
  
  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    console.log("Webhook secret validation failed");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.text();
    console.log("=== RECEIVED PAYLOAD ===", payload);
    
    let data: SupabaseAuthWebhook | LegacyAuthEmailPayload;
    
    try {
      data = JSON.parse(payload);
    } catch (parseError) {
      console.error("Failed to parse payload:", parseError);
      throw new Error("Invalid JSON payload");
    }

    console.log("Parsed data:", JSON.stringify(data, null, 2));

    // Handle Supabase native auth webhook format
    if ('type' in data && data.type && data.user && !('email_data' in data)) {
      const webhook = data as SupabaseAuthWebhook;
      console.log("Supabase auth webhook format detected, type:", webhook.type);
      console.log("Full webhook payload:", JSON.stringify(webhook, null, 2));
      
      // Only handle signup and password recovery events
      if (webhook.type !== 'user.created' && webhook.type !== 'user.recovery_requested') {
        console.log("Ignoring webhook type:", webhook.type);
        return new Response(JSON.stringify({ success: true, message: "Event ignored" }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const siteUrl = 'https://www.assetguardian.ai';
      const firstName = webhook.user.user_metadata?.first_name || webhook.user.user_metadata?.name || '';
      let subject: string;
      let html: string;

      if (webhook.type === 'user.created') {
        // For user creation, we typically send a welcome email
        // Note: Email confirmation is usually handled by Supabase's built-in system
        subject = "Welcome to Asset Guardian!";
        html = generateConfirmationEmail(firstName, siteUrl, '');
        console.log("Generated welcome email for:", webhook.user.email);
      } else if (webhook.type === 'user.recovery_requested') {
        // For password recovery, we need to return a message directing users to use Supabase's built-in recovery
        // since the webhook doesn't contain the necessary token information
        console.log("Processing password recovery for:", webhook.user.email);
        
        subject = "Reset Your Asset Guardian Password";
        html = `
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
      We received a request to reset your password for your Asset Guardian account. Please check your email for the official password reset link from Supabase.
    </p>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
      If you don't receive the reset email within a few minutes, please check your spam folder or contact support.
    </p>
  </div>
  
  <div style="text-align: center; font-size: 14px; color: #64748b;">
    <p><strong>If you didn't request this password reset, please ignore this email.</strong></p>
    <p>Your password will remain unchanged.</p>
    <p style="margin-top: 30px;">
      Need help? Contact us at <a href="mailto:support@assetguardian.com" style="color: #2563eb;">support@assetguardian.com</a>
    </p>
  </div>
</body>
</html>
        `;
      } else {
        throw new Error(`Unsupported webhook type: ${webhook.type}`);
      }

      const emailResponse = await resend.emails.send({
        from: "Asset Guardian <onboarding@resend.dev>",
        to: [webhook.user.email],
        subject,
        html,
      });

      console.log("Email sent successfully:", emailResponse);
      console.log("Resend response:", JSON.stringify(emailResponse, null, 2));

      return new Response(JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        recipient: webhook.user.email,
        type: webhook.type 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Handle legacy format (fallback)
    if ('email_data' in data) {
      const legacy = data as LegacyAuthEmailPayload;
      console.log("Legacy format detected");
      
      if (!legacy.user || !legacy.user.email) {
        throw new Error("Missing user or user email in legacy payload");
      }
      
      if (!legacy.email_data) {
        throw new Error("Missing email_data in legacy payload");
      }
      
      let { token, token_hash, redirect_to, email_action_type, site_url } = legacy.email_data;
      
      // Map legacy type field to email_action_type
      if (legacy.type) {
        if (legacy.type === "user.signup") {
          email_action_type = "signup";
        } else if (legacy.type === "user.password_recovery") {
          email_action_type = "recovery";
        }
      }
      
      if (!email_action_type || (email_action_type !== "signup" && email_action_type !== "recovery")) {
        throw new Error(`Invalid or missing email_action_type: ${email_action_type}`);
      }
      
      const firstName = legacy.user.user_metadata?.first_name || "";
      let subject: string;
      let html: string;

      if (email_action_type === "signup") {
        const confirmationUrl = `${site_url}/auth/confirm?token_hash=${token_hash}&type=email&redirect_to=${encodeURIComponent(redirect_to)}`;
        subject = "Confirm Your Asset Guardian Account";
        html = generateConfirmationEmail(firstName, confirmationUrl, token);
      } else {
        const resetUrl = `${site_url}/reset-password?token_hash=${token_hash}&type=recovery&redirect_to=${encodeURIComponent(redirect_to)}`;
        subject = "Reset Your Asset Guardian Password";
        html = generatePasswordResetEmail(firstName, resetUrl, token);
      }

      const emailResponse = await resend.emails.send({
        from: "Asset Guardian <onboarding@resend.dev>",
        to: [legacy.user.email],
        subject,
        html,
      });

      console.log("Email sent successfully:", emailResponse);
      console.log("Resend response:", JSON.stringify(emailResponse, null, 2));

      return new Response(JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        recipient: legacy.user.email,
        type: legacy.type || email_action_type 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Unknown format
    throw new Error("Unknown webhook payload format");

  } catch (error: any) {
    console.error("Error in auth-emails function:", error);
    console.error("Error stack:", error.stack);
    
    // Return success to prevent blocking auth operations
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error.toString(),
        note: "Email sending failed but auth operation should continue"
      }),
      {
        status: 200, // Return 200 to prevent blocking auth
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);