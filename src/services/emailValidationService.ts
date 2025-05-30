
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "edward@shogunai.com";

export interface ValidationResult {
  isValid: boolean;
  userType: "admin" | "technician" | "invalid";
  userData?: any;
  needsUserCreation?: boolean;
}

export const validateEmailAccess = async (email: string): Promise<ValidationResult> => {
  console.log("Validating email access for:", email);
  
  // Check if it's the admin email - no database lookup needed
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    console.log("Admin email detected");
    
    // Check if admin user exists in Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    const adminUserExists = user?.email?.toLowerCase() === email.toLowerCase();
    
    return {
      isValid: true,
      userType: "admin",
      userData: { email, role: "admin", name: "Admin User" },
      needsUserCreation: !adminUserExists
    };
  }

  // Check if email exists in technicians table
  try {
    const { data: technician, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !technician) {
      console.log("Email not found in technicians table:", error?.message);
      return {
        isValid: false,
        userType: "invalid"
      };
    }

    console.log("Technician found:", technician);
    return {
      isValid: true,
      userType: "technician",
      userData: {
        ...technician,
        role: "technician",
        name: `${technician.firstName} ${technician.lastName}`
      },
      needsUserCreation: false
    };
  } catch (error) {
    console.error("Error validating email:", error);
    return {
      isValid: false,
      userType: "invalid"
    };
  }
};

export const sendMagicLink = async (email: string): Promise<{ success: boolean; error?: string; requiresSetup?: boolean }> => {
  try {
    console.log("Attempting to send magic link to:", email);
    
    // First validate the email
    const validation = await validateEmailAccess(email);
    
    if (!validation.isValid) {
      return { success: false, error: "Email not authorized for access" };
    }

    // For admin email, check if user creation is needed
    if (validation.userType === "admin" && validation.needsUserCreation) {
      console.log("Admin user needs to be created first");
      return { 
        success: false, 
        error: "Admin user needs to be set up. Please contact system administrator.", 
        requiresSetup: true 
      };
    }

    // Send magic link with appropriate options
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't auto-create users
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      console.error("Magic link error:", error);
      
      // Handle specific error cases
      if (error.message.includes("Signups not allowed")) {
        return { 
          success: false, 
          error: "User account needs to be created. Please contact your administrator.",
          requiresSetup: validation.userType === "admin"
        };
      }
      
      return { success: false, error: error.message };
    }

    console.log("Magic link sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error sending magic link:", error);
    return { success: false, error: "Failed to send magic link" };
  }
};

// New function to handle admin user setup
export const createAdminUser = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("Creating admin user for:", email);
    
    // Verify it's the admin email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: "Not authorized for admin user creation" };
    }

    // Attempt to create the user with signups temporarily enabled
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Allow user creation for admin
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      console.error("Admin user creation error:", error);
      return { success: false, error: `Admin setup failed: ${error.message}` };
    }

    console.log("Admin user creation initiated");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error creating admin user:", error);
    return { success: false, error: "Failed to create admin user" };
  }
};
