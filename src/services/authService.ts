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
  // Enhanced error parsing with rate limit detection
  parseAuthError(error: any): string {
    console.error("Raw auth error:", JSON.stringify(error, null, 2));
    
    // Handle rate limiting specifically
    if (authService.isRateLimited(error)) {
      return "⏰ Too many attempts. Please wait 5-10 minutes before trying again.";
    }
    
    // Extract error message from various formats
    let errorMessage = "";
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.error_description) {
      errorMessage = error.error_description;
    } else if (error?.msg) {
      errorMessage = error.msg;
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    }
    
    // If still no message, provide fallback
    if (!errorMessage || errorMessage.trim() === "") {
      console.warn("Empty error message detected, using fallback");
      return "Authentication failed. Please check your credentials and try again.";
    }
    
    // Handle specific error cases with user-friendly messages
    const lowerMsg = errorMessage.toLowerCase();
    
    if (lowerMsg.includes('rate limit') || lowerMsg.includes('too many requests')) {
      return "⏰ Too many attempts. Please wait 5-10 minutes before trying again.";
    } else if (lowerMsg.includes('invalid email') || lowerMsg.includes('email')) {
      return "📧 Please enter a valid email address.";
    } else if (lowerMsg.includes('weak password') || lowerMsg.includes('password')) {
      return "🔒 Password must be at least 6 characters long.";
    } else if (lowerMsg.includes('user already registered') || lowerMsg.includes('already exists')) {
      return "👤 An account with this email already exists. Try signing in instead.";
    } else if (lowerMsg.includes('invalid login credentials')) {
      return "❌ Invalid email or password. Please check your credentials.";
    } else if (lowerMsg.includes('email not confirmed')) {
      return "📨 Please check your email and click the confirmation link first.";
    } else if (lowerMsg.includes('network') || lowerMsg.includes('connection')) {
      return "🌐 Network error. Please check your connection and try again.";
    }
    
    return errorMessage;
  },

  // Rate limit detection
  isRateLimited(error: any): boolean {
    if (!error) return false;
    
    const errorStr = JSON.stringify(error).toLowerCase();
    return errorStr.includes('rate limit') || 
           errorStr.includes('too many requests') || 
           errorStr.includes('429') ||
           (error.status === 429);
  },

  // Enhanced logging for debugging
  logAuthAttempt(type: string, email: string, success: boolean, error?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[AUTH ${timestamp}] ${type.toUpperCase()} - ${email} - ${success ? 'SUCCESS' : 'FAILED'}`);
    
    if (!success && error) {
      console.error(`[AUTH ERROR] Details:`, {
        type: typeof error,
        message: error?.message,
        status: error?.status,
        code: error?.code,
        fullError: error
      });
    }
  },

  // Sign up with enhanced error handling and debugging
  async signUp(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResult> {
    const startTime = Date.now();
    
    try {
      authService.logAuthAttempt("signup", email, false); // Log attempt start
      
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

      const duration = Date.now() - startTime;
      console.log(`[AUTH TIMING] Signup took ${duration}ms`);

      if (error) {
        authService.logAuthAttempt("signup", email, false, error);
        return { 
          success: false, 
          error: authService.parseAuthError(error)
        };
      }

      authService.logAuthAttempt("signup", email, true);
      console.log("✅ Sign up successful - Check email for confirmation if required");
      
      return { 
        success: true, 
        user: data.user, 
        session: data.session 
      };
    } catch (error) {
      authService.logAuthAttempt("signup", email, false, error);
      return { 
        success: false, 
        error: authService.parseAuthError(error)
      };
    }
  },

  // Sign in with enhanced error handling and debugging
  async signIn(email: string, password: string): Promise<AuthResult> {
    const startTime = Date.now();
    
    try {
      authService.logAuthAttempt("signin", email, false); // Log attempt start
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      const duration = Date.now() - startTime;
      console.log(`[AUTH TIMING] Signin took ${duration}ms`);

      if (error) {
        authService.logAuthAttempt("signin", email, false, error);
        return { 
          success: false, 
          error: authService.parseAuthError(error)
        };
      }

      authService.logAuthAttempt("signin", email, true);
      console.log("✅ Sign in successful");
      
      return { 
        success: true, 
        user: data.user, 
        session: data.session 
      };
    } catch (error) {
      authService.logAuthAttempt("signin", email, false, error);
      return { 
        success: false, 
        error: authService.parseAuthError(error)
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
    if (authService.isAdmin(userProfile)) return true;
    
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