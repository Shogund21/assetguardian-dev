
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "edward@shogunai.com";

export interface ValidationResult {
  isValid: boolean;
  userType: "admin" | "technician" | "invalid";
  userData?: any;
}

export const validateEmailAccess = async (email: string): Promise<ValidationResult> => {
  // Check if it's the admin email
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return {
      isValid: true,
      userType: "admin",
      userData: { email, role: "admin", name: "Admin User" }
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
      return {
        isValid: false,
        userType: "invalid"
      };
    }

    return {
      isValid: true,
      userType: "technician",
      userData: {
        ...technician,
        role: "technician",
        name: `${technician.firstName} ${technician.lastName}`
      }
    };
  } catch (error) {
    console.error("Error validating email:", error);
    return {
      isValid: false,
      userType: "invalid"
    };
  }
};

export const sendMagicLink = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create new users automatically
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send magic link" };
  }
};
