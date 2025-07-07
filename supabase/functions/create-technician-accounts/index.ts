import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateAccountsResult {
  success: boolean;
  results: {
    created: number;
    skipped: number;
    errors: Array<{ email: string; error: string }>;
    details: Array<{ email: string; status: string; message: string }>;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== CREATE TECHNICIAN ACCOUNTS FUNCTION TRIGGERED ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for parameters
    let requestBody = {};
    let technicianIds: string[] | null = null;
    let single = false;
    
    try {
      const bodyText = await req.text();
      if (bodyText) {
        requestBody = JSON.parse(bodyText);
        technicianIds = (requestBody as any).technicianIds;
        single = (requestBody as any).single || false;
      }
    } catch (e) {
      // Ignore JSON parse errors for backward compatibility
    }

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Check if user is admin using the admin client
    const userToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(userToken);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('company_users')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!adminCheck?.is_admin) {
      throw new Error("Access denied: Admin privileges required");
    }

    console.log("Admin verification passed for user:", user.email);

    // Get technicians based on request parameters
    let technicianQuery = supabase
      .from('technicians')
      .select('id, email, firstName, lastName, status, account_status');

    if (technicianIds && technicianIds.length > 0) {
      // Single or specific technicians
      technicianQuery = technicianQuery.in('id', technicianIds);
      console.log(`Processing specific technicians: ${technicianIds.join(', ')}`);
    } else {
      // Bulk mode - all active technicians without accounts
      technicianQuery = technicianQuery
        .eq('status', 'active')
        .eq('account_status', 'no_account');
      console.log("Processing all active technicians without accounts");
    }

    const { data: technicians, error: techError } = await technicianQuery;

    if (techError) {
      throw new Error(`Failed to fetch technicians: ${techError.message}`);
    }

    console.log(`Found ${technicians?.length || 0} technicians to process`);

    const results: CreateAccountsResult['results'] = {
      created: 0,
      skipped: 0,
      errors: [],
      details: []
    };

    // Process each technician
    for (const technician of technicians || []) {
      try {
        console.log(`Processing technician: ${technician.email}`);

        // Skip if already has account (unless specifically requested)
        if (technician.account_status === 'has_account' && !technicianIds) {
          results.skipped++;
          results.details.push({
            email: technician.email,
            status: 'skipped',
            message: 'Already has account'
          });
          continue;
        }

        // Check if user already exists
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(technician.email);
        
        if (existingUser.user) {
          console.log(`User already exists: ${technician.email}`);
          
          // Update technician record to reflect existing account
          await supabase
            .from('technicians')
            .update({ 
              user_id: existingUser.user.id,
              account_status: 'has_account'
            })
            .eq('id', technician.id);
          
          results.skipped++;
          results.details.push({
            email: technician.email,
            status: 'skipped',
            message: 'Account already exists - linked to technician'
          });
          continue;
        }

        // Create new user account
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: technician.email,
          password: 'Macy1234',
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            first_name: technician.firstName,
            last_name: technician.lastName
          }
        });

        if (createError) {
          console.error(`Failed to create user ${technician.email}:`, createError);
          results.errors.push({
            email: technician.email,
            error: createError.message
          });
          results.details.push({
            email: technician.email,
            status: 'error',
            message: createError.message
          });
          continue;
        }

        if (newUser.user) {
          // Update technician record with new user_id and account status
          const { error: updateError } = await supabase
            .from('technicians')
            .update({ 
              user_id: newUser.user.id,
              account_status: 'has_account'
            })
            .eq('id', technician.id);

          if (updateError) {
            console.error(`Failed to link user to technician ${technician.email}:`, updateError);
            results.errors.push({
              email: technician.email,
              error: `Account created but linking failed: ${updateError.message}`
            });
            results.details.push({
              email: technician.email,
              status: 'partial',
              message: 'Account created but linking failed'
            });
          } else {
            console.log(`Successfully created and linked account for: ${technician.email}`);
            results.created++;
            results.details.push({
              email: technician.email,
              status: 'created',
              message: 'Account created and linked successfully'
            });
          }
        }

      } catch (error) {
        console.error(`Error processing technician ${technician.email}:`, error);
        results.errors.push({
          email: technician.email,
          error: error.message
        });
        results.details.push({
          email: technician.email,
          status: 'error',
          message: error.message
        });
      }
    }

    console.log("Account creation completed:", results);

    const response: CreateAccountsResult = {
      success: true,
      results
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in create-technician-accounts function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        results: {
          created: 0,
          skipped: 0,
          errors: [{ email: 'system', error: error.message }],
          details: []
        }
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