
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
      const { data: { session } } = await supabase.auth.getSession();
      
      // If not authenticated, don't try to fetch companies (for landing page)
      if (!session) {
        setCompanies([]);
        setCurrentCompany(null);
        setIsLoading(false);
        return;
      }

      // Check if user is super admin
      const { data: isSuperAdmin, error: superAdminError } = await supabase.rpc('is_super_admin');
      
      let data, error;
      
      if (isSuperAdmin) {
        // Super admin can see all companies
        const result = await supabase
          .from("companies")
          .select("*")
          .order("name");
        data = result.data;
        error = result.error;
      } else {
        // Regular users see only their companies
        const result = await supabase
          .from("companies")
          .select("*")
          .order("name");
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      
      setCompanies(data || []);
      
      // Set first company as default if we have companies and no current selection
      if (data && data.length > 0 && !currentCompany) {
        const savedCompanyId = localStorage.getItem("selectedCompanyId");
        
        if (savedCompanyId) {
          const savedCompany = data.find(c => c.id === savedCompanyId);
          if (savedCompany) {
            setCurrentCompany(savedCompany);
          } else {
            setCurrentCompany(data[0]);
            localStorage.setItem("selectedCompanyId", data[0].id);
          }
        } else {
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
