import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_id?: string;
  company_name?: string;
  user_role?: string;
  is_admin?: boolean;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  session?: Session;
}

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResult> {
    try {
      console.log("Attempting sign up for:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        console.error("Supabase signup error:", error);
        
        // Enhanced error parsing
        let errorMessage = "Sign up failed";
        
        if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if ((error as any).error_description) {
          errorMessage = (error as any).error_description;
        } else if ((error as any).msg) {
          errorMessage = (error as any).msg;
        }
        
        // Handle specific error cases
        if (errorMessage.toLowerCase().includes('rate limit')) {
          errorMessage = "Too many signup attempts. Please wait a few minutes and try again.";
        } else if (errorMessage.toLowerCase().includes('invalid email')) {
          errorMessage = "Please enter a valid email address.";
        } else if (errorMessage.toLowerCase().includes('weak password')) {
          errorMessage = "Password is too weak. Please choose a stronger password.";
        } else if (errorMessage.toLowerCase().includes('user already registered')) {
          errorMessage = "An account with this email already exists. Try signing in instead.";
        }
        
        return { success: false, error: errorMessage };
      }

      console.log("Sign up successful for:", email);
      return { 
        success: true, 
        user: data.user, 
        session: data.session 
      };
    } catch (error) {
      console.error("Unexpected signup error:", error);
      
      let errorMessage = "An unexpected error occurred during sign up";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Handle objects that might not have a message property
        errorMessage = JSON.stringify(error);
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      console.log("Attempting sign in for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase signin error:", error);
        
        // Enhanced error parsing
        let errorMessage = "Sign in failed";
        
        if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if ((error as any).error_description) {
          errorMessage = (error as any).error_description;
        } else if ((error as any).msg) {
          errorMessage = (error as any).msg;
        }
        
        // Handle specific error cases
        if (errorMessage.toLowerCase().includes('invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (errorMessage.toLowerCase().includes('rate limit')) {
          errorMessage = "Too many login attempts. Please wait a few minutes and try again.";
        } else if (errorMessage.toLowerCase().includes('email not confirmed')) {
          errorMessage = "Please check your email and click the confirmation link before signing in.";
        }
        
        return { success: false, error: errorMessage };
      }

      console.log("Sign in successful for:", email);
      return { 
        success: true, 
        user: data.user, 
        session: data.session 
      };
    } catch (error) {
      console.error("Unexpected signin error:", error);
      
      let errorMessage = "An unexpected error occurred during sign in";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Handle objects that might not have a message property
        errorMessage = JSON.stringify(error);
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  // Sign out
  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Sign out failed" 
      };
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Password reset failed" 
      };
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Password update failed" 
      };
    }
  },

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  },

  // Get user profile with company info
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Get basic profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return null;
      }

      // Get company info
      const { data: companyInfo } = await supabase
        .rpc('get_current_user_company')
        .single();

      return {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        company_id: companyInfo?.company_id,
        company_name: companyInfo?.company_name,
        user_role: companyInfo?.user_role || 'user',
        is_admin: companyInfo?.is_admin || false
      };
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  },

  // Check if user is admin
  isAdmin(userProfile: UserProfile | null): boolean {
    return userProfile?.is_admin === true || userProfile?.email === 'edward@shogunaillc.com';
  },

  // Check if user has specific permission
  hasPermission(userProfile: UserProfile | null, permission: string): boolean {
    if (this.isAdmin(userProfile)) return true;
    
    // Add specific permission logic based on user role
    const rolePermissions = {
      admin: ['equipment', 'settings', 'analytics', 'projects', 'maintenance', 'technicians', 'all'],
      senior_technician: ['equipment', 'maintenance', 'analytics', 'projects'],
      technician: ['equipment', 'maintenance', 'analytics'],
      user: ['equipment', 'maintenance']
    };

    const userRole = userProfile?.user_role as keyof typeof rolePermissions;
    return rolePermissions[userRole]?.includes(permission) || false;
  }
};