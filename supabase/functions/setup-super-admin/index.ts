import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SetupResult {
  success: boolean;
  message: string;
  user_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== SETUP SUPER ADMIN FUNCTION TRIGGERED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const superAdminEmail = "edward@shogunaillc.com";
    const superAdminPassword = "Shatzee21$";

    console.log("Setting up super admin account for:", superAdminEmail);

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users?.find(user => user.email === superAdminEmail);
    
    if (existingUser) {
      console.log("Super admin account already exists");
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Super admin account already exists"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Create new super admin user account
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: superAdminEmail,
      password: superAdminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: 'Edward',
        last_name: 'Super Admin'
      }
    });

    if (createError) {
      console.error("Failed to create super admin user:", createError);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: `Failed to create super admin account: ${createError.message}`
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    if (!newUser.user) {
      throw new Error("User creation returned no user data");
    }

    console.log("Super admin user created with ID:", newUser.user.id);

    // Update company_users table to link the new UUID
    const { error: updateError } = await supabase
      .from('company_users')
      .update({ user_id: newUser.user.id })
      .eq('user_id', superAdminEmail);

    if (updateError) {
      console.error("Failed to update company_users record:", updateError);
      // Don't fail completely, just log the error
    }

    // Create profile for the super admin
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email: superAdminEmail,
        first_name: 'Edward',
        last_name: 'Super Admin'
      });

    if (profileError) {
      console.error("Failed to create profile:", profileError);
      // Don't fail completely, just log the error
    }

    // Log the setup for audit
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: newUser.user.id,
        action: 'super_admin_setup',
        table_name: 'auth.users',
        record_id: newUser.user.id,
        metadata: {
          setup_time: new Date().toISOString(),
          email: superAdminEmail
        }
      });

    if (auditError) {
      console.error("Failed to log audit entry:", auditError);
    }

    console.log("Super admin setup completed successfully");

    const response: SetupResult = {
      success: true,
      message: "Super admin account created successfully",
      user_id: newUser.user.id
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in setup-super-admin function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error.message || "Unknown error occurred"
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