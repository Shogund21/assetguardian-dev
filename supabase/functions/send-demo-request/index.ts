import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoRequestData {
  name: string;
  email: string;
  company?: string;
  role?: string;
  phone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: DemoRequestData = await req.json();
    console.log('Demo request received:', requestData);

    // Save demo request to database
    const { data: demoRequest, error: dbError } = await supabase
      .from('demo_requests')
      .insert({
        name: requestData.name,
        email: requestData.email,
        company: requestData.company,
        role: requestData.role,
        phone: requestData.phone,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save demo request: ${dbError.message}`);
    }

    console.log('Demo request saved to database:', demoRequest);

    // Create notification for super admins
    const { data: superAdminIds } = await supabase.rpc('get_super_admin_user_ids');
    
    if (superAdminIds && superAdminIds.length > 0) {
      const notifications = superAdminIds.map((admin: any) => ({
        type: 'demo_request',
        title: 'New Demo Request',
        message: `${requestData.name} from ${requestData.company || 'Unknown Company'} has requested a demo.`,
        user_id: admin.user_id,
        metadata: {
          demo_request_id: demoRequest.id,
          name: requestData.name,
          email: requestData.email,
          company: requestData.company,
          role: requestData.role,
          phone: requestData.phone
        }
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Failed to create notifications:', notificationError);
        // Don't fail the whole request if notification creation fails
      } else {
        console.log('Demo request notifications created for', superAdminIds.length, 'super admins');
      }
    }

    // Format demo request email body
    const emailBody = `
      <h2>New Demo Request - AssetGuardian.ai</h2>
      <p>A new demo request has been submitted on AssetGuardian.ai.</p>
      
      <h3>Contact Information:</h3>
      <ul>
        <li><strong>Name:</strong> ${requestData.name}</li>
        <li><strong>Email:</strong> ${requestData.email}</li>
        <li><strong>Company:</strong> ${requestData.company || 'Not provided'}</li>
        <li><strong>Role:</strong> ${requestData.role || 'Not provided'}</li>
        <li><strong>Phone:</strong> ${requestData.phone || 'Not provided'}</li>
      </ul>
      
      <h3>Request Details:</h3>
      <ul>
        <li><strong>Request ID:</strong> ${demoRequest.id}</li>
        <li><strong>Submitted:</strong> ${new Date(demoRequest.requested_at).toLocaleString()}</li>
        <li><strong>Status:</strong> ${demoRequest.status}</li>
      </ul>
      
      <p>Please follow up with this prospect as soon as possible.</p>
      
      <hr>
      <p><em>This is an automated notification from AssetGuardian.ai</em></p>
    `;

    // Send email notification to super admin
    const emailResponse = await resend.emails.send({
      from: "AssetGuardian.ai <noreply@assetguardian.ai>",
      to: ["dixon.shogun@gmail.com"],
      subject: `New Demo Request from ${requestData.name} - ${requestData.company || 'Company Not Provided'}`,
      html: emailBody,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Demo request submitted successfully',
      requestId: demoRequest.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-demo-request function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);