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
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        user: data.user, 
        session: data.session 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Sign up failed" 
      };
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        user: data.user, 
        session: data.session 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Sign in failed" 
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