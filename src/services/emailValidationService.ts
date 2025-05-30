
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "edward@shogunai.com";

export interface ValidationResult {
  isValid: boolean;
  userType: "admin" | "technician" | "invalid";
  userData?: any;
}

export const validateEmailAccess = async (email: string): Promise<ValidationResult> => {
  console.log("Validating email access for:", email);
  
  // Check if it's the admin email - immediate access
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    console.log("Admin email detected - granting access");
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

// Direct authentication function that bypasses email sending
export const authenticateUser = async (email: string): Promise<{ success: boolean; error?: string; userData?: any }> => {
  try {
    console.log("Attempting direct authentication for:", email);
    
    // Validate the email
    const validation = await validateEmailAccess(email);
    
    if (!validation.isValid) {
      return { success: false, error: "Email not authorized for access" };
    }

    // Store authentication state in localStorage
    const authData = {
      isAuthenticated: true,
      email: email.toLowerCase(),
      userType: validation.userType,
      userData: validation.userData,
      timestamp: Date.now()
    };

    localStorage.setItem('assetguardian_auth', JSON.stringify(authData));
    console.log("User authenticated successfully:", validation.userType);
    
    // Dispatch custom event to notify auth state change
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: authData }));
    
    return { 
      success: true, 
      userData: validation.userData 
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
};

// Function to check if user is currently authenticated
export const checkAuthStatus = (): { isAuthenticated: boolean; userData?: any } => {
  try {
    const authData = localStorage.getItem('assetguardian_auth');
    if (!authData) {
      return { isAuthenticated: false };
    }

    const parsed = JSON.parse(authData);
    // Check if auth is still valid (optional: add expiration logic here)
    return {
      isAuthenticated: parsed.isAuthenticated,
      userData: parsed
    };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { isAuthenticated: false };
  }
};

// Function to logout user
export const logoutUser = (): void => {
  localStorage.removeItem('assetguardian_auth');
  console.log("User logged out");
};
