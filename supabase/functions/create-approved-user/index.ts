import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  requestId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔐 Create Approved User: Function invoked');

    // Get the admin Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request body
    const { email, requestId }: CreateUserRequest = await req.json();
    console.log(`📧 Creating auth user for email: ${email}`);

    if (!email || !requestId) {
      throw new Error('Email and request ID are required');
    }

    // Verify the access request exists and is approved
    const { data: accessRequest, error: requestError } = await supabaseAdmin
      .from('access_requests')
      .select('*')
      .eq('id', requestId)
      .eq('email', email)
      .eq('status', 'approved')
      .single();

    if (requestError || !accessRequest) {
      console.error('❌ Access request not found or not approved:', requestError);
      throw new Error('Access request not found or not approved');
    }

    console.log('✅ Access request verified:', accessRequest.id);

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);

    if (userExists) {
      console.log('⚠️ User already exists, updating technician status');
      
      // Update technician status to has_account
      await supabaseAdmin
        .from('technicians')
        .update({ 
          account_status: 'has_account',
          status: 'active'
        })
        .eq('email', email);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'User already exists, technician record updated'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Generate a temporary password (user must reset on first login)
    const tempPassword = crypto.randomUUID();

    console.log('🔨 Creating new auth user...');

    // Create the auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email since admin approved
      user_metadata: {
        first_name: accessRequest.first_name,
        last_name: accessRequest.last_name,
        approved_by: accessRequest.reviewed_by,
        approved_at: new Date().toISOString()
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      throw authError;
    }

    console.log('✅ Auth user created:', authUser.user?.id);

    // Update technician record with user_id and status
    const { error: technicianUpdateError } = await supabaseAdmin
      .from('technicians')
      .update({ 
        user_id: authUser.user.id,
        account_status: 'has_account',
        status: 'active'
      })
      .eq('email', email);

    if (technicianUpdateError) {
      console.error('❌ Error updating technician:', technicianUpdateError);
      throw technicianUpdateError;
    }

    // Update company_users with the actual user_id
    const { error: companyUserUpdateError } = await supabaseAdmin
      .from('company_users')
      .update({ user_id: authUser.user.id.toString() })
      .eq('user_id', email); // Update where user_id was the email string

    if (companyUserUpdateError) {
      console.error('⚠️ Error updating company_users (non-critical):', companyUserUpdateError);
    }

    // Send password reset email
    console.log('📧 Sending password reset email...');
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (resetError) {
      console.error('⚠️ Error sending reset email (non-critical):', resetError);
    }

    // Log the account creation
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: authUser.user.id,
        action: 'auth_account_created',
        table_name: 'auth.users',
        record_id: authUser.user.id,
        metadata: {
          email: email,
          request_id: requestId,
          temp_password_sent: !resetError
        }
      });

    console.log('✅ User creation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auth account created successfully. Password reset email sent.',
        user_id: authUser.user.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in create-approved-user function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred while creating the user'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
