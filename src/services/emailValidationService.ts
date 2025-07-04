
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "edward@shogunaillc.com";

export interface ValidationResult {
  isValid: boolean;
  userType: "admin" | "technician" | "invalid";
  userData?: any;
}

export const validateEmailAccess = async (email: string): Promise<ValidationResult> => {
  console.log("Validating email access for:", email);
  
  // Check if it's the admin email - immediate access (fallback)
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    console.log("Admin email detected - granting full access");
    return {
      isValid: true,
      userType: "admin",
      userData: { 
        email, 
        role: "admin", 
        name: "Admin User",
        hasFullAccess: true,
        permissions: ["equipment", "settings", "analytics", "projects", "maintenance", "technicians", "all"]
      }
    };
  }

  // First check company_users table for role-based access
  try {
    const { data: companyUser, error: companyError } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', email.toLowerCase())
      .single();

    if (companyUser) {
      // Get technician details if available
      const { data: technician } = await supabase
        .from('technicians')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      const userType = companyUser.is_admin ? "admin" : "technician";
      const name = technician ? `${technician.firstName} ${technician.lastName}` : "User";
      
      console.log("Company user found with role:", companyUser.role);
      return {
        isValid: true,
        userType,
        userData: {
          email,
          role: companyUser.role,
          name,
          hasFullAccess: companyUser.is_admin,
          permissions: companyUser.is_admin 
            ? ["equipment", "settings", "analytics", "projects", "maintenance", "technicians", "all"]
            : ["equipment", "maintenance", "analytics"],
          isAdmin: companyUser.is_admin,
          companyId: companyUser.company_id,
          ...(technician && { technician })
        }
      };
    }
  } catch (error) {
    console.log("Error checking company_users:", error);
  }

  // Fallback: Check if email exists in technicians table (legacy support)
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

    console.log("Technician found (legacy mode):", technician);
    const userType = technician.user_role === 'admin' ? 'admin' : 'technician';
    
    return {
      isValid: true,
      userType,
      userData: {
        ...technician,
        role: technician.user_role || "technician",
        name: `${technician.firstName} ${technician.lastName}`,
        hasFullAccess: userType === 'admin',
        permissions: userType === 'admin' 
          ? ["equipment", "settings", "analytics", "projects", "maintenance", "technicians", "all"]
          : ["equipment", "maintenance", "analytics"]
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
      // Log failed login attempt
      const { AuditService } = await import('@/services/auditService');
      await AuditService.logLogin(false, {
        email: email.toLowerCase(),
        reason: 'Email not authorized for access',
        timestamp: new Date().toISOString()
      });
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
    
    // Log successful login
    const { AuditService } = await import('@/services/auditService');
    await AuditService.logLogin(true, {
      email: email.toLowerCase(),
      userType: validation.userType,
      timestamp: new Date().toISOString()
    });
    
    // Dispatch custom event to notify auth state change
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: authData }));
    
    return { 
      success: true, 
      userData: validation.userData 
    };
  } catch (error) {
    console.error("Authentication error:", error);
    // Log failed login attempt
    try {
      const { AuditService } = await import('@/services/auditService');
      await AuditService.logLogin(false, {
        email: email.toLowerCase(),
        reason: 'Authentication error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } catch (auditError) {
      console.error("Failed to log authentication error:", auditError);
    }
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
export const logoutUser = async (): Promise<void> => {
  try {
    // Log logout before removing auth data
    const { AuditService } = await import('@/services/auditService');
    await AuditService.logLogout();
  } catch (error) {
    console.error("Failed to log logout event:", error);
  }
  
  localStorage.removeItem('assetguardian_auth');
  console.log("User logged out");
};
