
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("AUTH_WEBHOOK_SECRET");

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

// Verify Supabase webhook signature
const verifySignature = async (
  body: string,
  signature: string,
  timestamp: string,
  secret: string
): Promise<boolean> => {
  try {
    console.log("=== SIGNATURE VERIFICATION DEBUG ===");
    console.log("Raw signature received:", signature);
    console.log("Timestamp:", timestamp);
    console.log("Payload length:", body.length);
    console.log("Secret configured:", !!secret);
    
    // Handle Supabase's signature format: "v1,<signature>"
    let actualSignature = signature;
    if (signature.startsWith('v1,')) {
      actualSignature = signature.slice(3); // Remove "v1," prefix
      console.log("Extracted signature after removing v1 prefix:", actualSignature);
    }
    
    // Create the signed payload (timestamp.payload)
    const signedPayload = `${timestamp}.${body}`;
    console.log("Signed payload to verify:", signedPayload);
    
    // Create HMAC signature
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature_bytes = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signedPayload)
    );
    
    // Convert to base64
    const expected_signature = btoa(String.fromCharCode(...new Uint8Array(signature_bytes)));
    
    console.log("Expected signature:", expected_signature);
    console.log("Actual signature to compare:", actualSignature);
    console.log("Signatures match:", expected_signature === actualSignature);
    
    return expected_signature === actualSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== AUTH EMAIL WEBHOOK TRIGGERED ===");
  console.log("Request method:", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log("=== RECEIVED PAYLOAD ===", body);

    // Verify webhook signature if secret is configured
    if (hookSecret) {
      const signature = req.headers.get("webhook-signature");
      const timestamp = req.headers.get("webhook-timestamp");
      
      console.log("Webhook verification details:");
      console.log("- Signature:", signature);
      console.log("- Timestamp:", timestamp);
      console.log("- Secret configured:", !!hookSecret);
      
      if (signature && timestamp) {
        const isValid = await verifySignature(body, signature, timestamp, hookSecret);
        
        if (!isValid) {
          console.log("Webhook signature validation failed");
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        console.log("Webhook signature validation successful");
      } else {
        console.log("No signature provided - allowing for development/testing");
      }
    } else {
      console.log("No webhook secret configured - skipping authentication");
    }

    let data: SupabaseAuthWebhook | LegacyAuthEmailPayload;
    
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      console.error("Failed to parse payload:", parseError);
      throw new Error("Invalid JSON payload");
    }

    console.log("Parsed data:", JSON.stringify(data, null, 2));

    // Handle Supabase native auth webhook format
    if ('type' in data && data.type && data.user && !('email_data' in data)) {
      const webhook = data as SupabaseAuthWebhook;
      console.log("Supabase auth webhook format detected, type:", webhook.type);
      
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
        subject = "Welcome to Asset Guardian!";
        html = generateConfirmationEmail(firstName, siteUrl, '');
        console.log("Generated welcome email for:", webhook.user.email);
      } else if (webhook.type === 'user.recovery_requested') {
        console.log("Processing password recovery for:", webhook.user.email);
        
        subject = "Password Reset - Asset Guardian";
        html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset - Asset Guardian</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 40px 30px; text-align: center;">
      <img src="https://bqxdbvrtohgkusmdmjxd.supabase.co/storage/v1/object/public/company-assets/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" alt="Asset Guardian" style="height: 60px; width: 60px; margin-bottom: 20px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Password Reset Request</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Asset Guardian Security</p>
    </div>
    
    <div style="padding: 40px 30px;">
      <h2 style="margin-top: 0; color: #1e293b; font-size: 22px;">Hi ${firstName || 'there'}!</h2>
      <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #475569;">
        We received a request to reset your password for your Asset Guardian account. 
      </p>
      
      <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 25px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0; font-size: 15px; color: #991b1b; font-weight: 500;">
          ⚠️ Important: Please check your email for the official password reset link from Supabase (noreply@mail.supabase.io).
        </p>
      </div>
      
      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #334155; font-size: 16px;">What to do next:</h3>
        <ol style="margin: 10px 0; padding-left: 20px; color: #475569;">
          <li style="margin-bottom: 8px;">Look for an email from <strong>noreply@mail.supabase.io</strong></li>
          <li style="margin-bottom: 8px;">Click the "Reset Password" link in that email</li>
          <li style="margin-bottom: 8px;">Follow the instructions to set your new password</li>
        </ol>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin: 25px 0;">
        <strong>Didn't receive the reset email?</strong><br>
        • Check your spam/junk folder<br>
        • Wait a few minutes and try again<br>
        • Contact support if you continue having issues
      </p>
    </div>
    
    <div style="background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 15px 0; font-size: 14px; color: #64748b; font-weight: 500;">
        If you didn't request this password reset, please ignore this email.
      </p>
      <p style="margin: 0; font-size: 14px; color: #64748b;">
        Your password will remain unchanged.
      </p>
      <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
          Need help? Contact us at <a href="mailto:support@assetguardian.com" style="color: #dc2626; text-decoration: none;">support@assetguardian.com</a>
        </p>
      </div>
    </div>
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
