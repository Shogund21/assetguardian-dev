import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("AUTH_WEBHOOK_SECRET") || "dev-webhook-secret-2024";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailPayload {
  type?: string; // Our database trigger format
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
  console.log("Auth email webhook triggered");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Handle webhook verification
    let data: AuthEmailPayload;
    if (hookSecret === "dev-webhook-secret-2024") {
      console.log("Development mode: using relaxed webhook verification");
      data = JSON.parse(payload);
    } else {
      const wh = new Webhook(hookSecret);
      data = wh.verify(payload, headers) as AuthEmailPayload;
    }

    // Handle both payload formats: database trigger vs direct webhook
    const { user, email_data, type } = data;
    
    // Validate required fields
    if (!user || !user.email) {
      throw new Error("Missing user or user email in payload");
    }
    
    if (!email_data) {
      throw new Error("Missing email_data in payload");
    }
    
    let { token, token_hash, redirect_to, email_action_type, site_url } = email_data;
    
    // If we have a 'type' field from our database trigger, map it to email_action_type
    if (type) {
      console.log("Database trigger format detected, type:", type);
      if (type === "user.signup") {
        email_action_type = "signup";
      } else if (type === "user.password_recovery") {
        email_action_type = "recovery";
      } else {
        console.warn("Unknown event type from database trigger:", type);
        throw new Error(`Unknown event type: ${type}`);
      }
    }
    
    // Validate email action type
    if (!email_action_type || (email_action_type !== "signup" && email_action_type !== "recovery")) {
      throw new Error(`Invalid or missing email_action_type: ${email_action_type}`);
    }
    
    console.log("Processing email for action:", email_action_type);
    console.log("User email:", user.email);
    console.log("Payload format:", type ? "Database trigger" : "Direct webhook");

    const firstName = user.user_metadata?.first_name || "";
    let subject: string;
    let html: string;

    if (email_action_type === "signup") {
      const confirmationUrl = `${site_url}/auth/confirm?token_hash=${token_hash}&type=email&redirect_to=${encodeURIComponent(redirect_to)}`;
      subject = "Confirm Your Asset Guardian Account";
      html = generateConfirmationEmail(firstName, confirmationUrl, token);
    } else if (email_action_type === "recovery") {
      const resetUrl = `${site_url}/reset-password?token_hash=${token_hash}&type=recovery&redirect_to=${encodeURIComponent(redirect_to)}`;
      subject = "Reset Your Asset Guardian Password";
      html = generatePasswordResetEmail(firstName, resetUrl, token);
    } else {
      throw new Error(`Unsupported email action type: ${email_action_type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "Asset Guardian <noreply@assetguardian.com>",
      to: [user.email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in auth-emails function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);