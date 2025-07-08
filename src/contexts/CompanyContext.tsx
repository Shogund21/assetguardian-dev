
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CompanyContextType {
  currentCompany: Company | null;
  companies: Company[];
  isLoading: boolean;
  setCurrentCompany: (company: Company | null) => void;
  refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("CompanyContext: Session error:", sessionError);
        setCompanies([]);
        setCurrentCompany(null);
        setIsLoading(false);
        return;
      }
      
      console.log("CompanyContext: Session check:", session ? "authenticated" : "not authenticated");
      
      // If not authenticated, don't try to fetch companies (for landing page)
      if (!session || !session.access_token || !session.user?.id) {
        console.log("CompanyContext: No valid session, clearing companies");
        setCompanies([]);
        setCurrentCompany(null);
        setIsLoading(false);
        return;
      }

      console.log("CompanyContext: Valid session found, fetching companies for:", session.user.email);

      // Use standard supabase client - it will automatically include JWT when session exists
      console.log("✅ CompanyContext: Using standard client with session-based authentication");

      // Check if user is super admin with fallback mechanisms
      let isSuperAdmin = false;
      
      // Primary method: Email-based check (reliable fallback)
      const isKnownSuperAdmin = session.user.email === 'edward@shogunaillc.com';
      
      if (isKnownSuperAdmin) {
        console.log("CompanyContext: Email-based super admin detection - User is super admin");
        isSuperAdmin = true;
      } else {
        // Secondary method: Database function (may fail due to JWT issues)
        try {
          const { data: dbSuperAdmin, error: superAdminError } = await supabase.rpc('is_super_admin');
          
          if (superAdminError) {
            console.error("CompanyContext: RPC is_super_admin failed:", superAdminError);
            console.log("CompanyContext: Using email fallback for super admin detection");
          } else {
            isSuperAdmin = dbSuperAdmin || false;
            console.log("CompanyContext: Database super admin check result:", isSuperAdmin);
          }
        } catch (error) {
          console.error("CompanyContext: Super admin RPC call failed:", error);
          console.log("CompanyContext: Falling back to email-based detection");
        }
      }
      
      let data, error;
      
      if (isSuperAdmin) {
        console.log("CompanyContext: User is super admin, fetching all companies");
        // Super admin can see all companies using standard client
        const result = await supabase
          .from("companies")
          .select("*")
          .order("name");
        data = result.data;
        error = result.error;
      } else {
        console.log("CompanyContext: Regular user, fetching user's companies");
        
        // Get company IDs the user is a member of using standard client
        const { data: userCompanies, error: userCompaniesError } = await supabase
          .from('company_users')
          .select('company_id')
          .or(`user_id.eq.${session.user.id},user_id.eq.${session.user.email}`);
          
        if (userCompaniesError) {
          console.error("CompanyContext: Error fetching user companies:", userCompaniesError);
          throw userCompaniesError;
        }
        
        const companyIds = userCompanies?.map(uc => uc.company_id) || [];
        
        if (companyIds.length === 0) {
          console.log("CompanyContext: User is not a member of any companies");
          data = [];
          error = null;
        } else {
          const result = await supabase
            .from("companies")
            .select(`
              id,
              name,
              logo_url,
              address,
              contact_email,
              contact_phone,
              created_at,
              updated_at
            `)
            .in('id', companyIds)
            .order("name");
          data = result.data;
          error = result.error;
        }
      }

      if (error) {
        console.error("CompanyContext: Database error:", error);
        throw error;
      }
      
      console.log("CompanyContext: Found companies:", data?.length || 0);
      setCompanies(data || []);
      
      // Set first company as default if we have companies and no current selection
      if (data && data.length > 0 && !currentCompany) {
        const savedCompanyId = localStorage.getItem("selectedCompanyId");
        
        if (savedCompanyId) {
          const savedCompany = data.find(c => c.id === savedCompanyId);
          if (savedCompany) {
            console.log("CompanyContext: Restoring saved company:", savedCompany.name);
            setCurrentCompany(savedCompany);
          } else {
            console.log("CompanyContext: Saved company not found, using first available:", data[0].name);
            setCurrentCompany(data[0]);
            localStorage.setItem("selectedCompanyId", data[0].id);
          }
        } else {
          console.log("CompanyContext: No saved company, using first available:", data[0].name);
          setCurrentCompany(data[0]);
          localStorage.setItem("selectedCompanyId", data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      // Only show error toast if user is authenticated (not on landing page)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        toast({
          title: "Error",
          description: "Could not load companies. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize and fetch companies when the component mounts
  useEffect(() => {
    fetchCompanies();
    
    // Subscribe to auth changes to refetch companies when user logs in/out
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchCompanies();
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Save selected company to localStorage when it changes
  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem("selectedCompanyId", currentCompany.id);
    }
  }, [currentCompany]);

  const value = {
    currentCompany,
    setCurrentCompany,
    companies,
    isLoading,
    refreshCompanies: fetchCompanies,
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};
