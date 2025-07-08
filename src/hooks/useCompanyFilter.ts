import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export const useCompanyFilter = () => {
  const { currentCompany, isCompanyLoading } = useCompany();
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (currentCompany?.id) {
      console.log('useCompanyFilter: Setting company ID to', currentCompany.id, 'for company:', currentCompany.name);
      setCompanyId(currentCompany.id);
    } else {
      console.log('useCompanyFilter: No company selected (currentCompany is null), clearing company ID');
      setCompanyId(null);
    }
    console.log('useCompanyFilter: Updated state - companyId:', currentCompany?.id || null, 'user:', user?.email);
  }, [currentCompany, user]);

  const applyCompanyFilter = <T>(
    query: any,
    skipFilter = false // Default to applying the filter
  ): any => {
    if (skipFilter) {
      console.log('applyCompanyFilter: Skipping filter as requested');
      return query;
    }
    
    // Check if user is super admin
    const isSuperAdmin = user?.email === 'edward@shogunaillc.com';
    console.log('applyCompanyFilter: Processing query - isSuperAdmin:', isSuperAdmin, 'companyId:', companyId, 'user:', user?.email);
    
    if (isSuperAdmin) {
      // If super admin has no company selected (currentCompany is null), show all data
      if (!companyId) {
        console.log('applyCompanyFilter: Super admin with no company selected (All Companies view), showing all data');
        return query;
      }
      // If super admin has a specific company selected, apply that filter
      console.log('applyCompanyFilter: Super admin with specific company selected, applying filter for company', companyId);
      return query.eq('company_id', companyId);
    }
    
    if (companyId) {
      console.log('applyCompanyFilter: Regular user, applying filter for company', companyId);
      return query.eq('company_id', companyId);
    }
    
    // If no company ID is selected for regular users, return empty result to prevent unauthorized access
    console.warn('applyCompanyFilter: No company ID available for regular user, blocking query');
    return query.eq('company_id', 'no-company-selected');
  };

  return {
    companyId,
    isCompanyLoading,
    applyCompanyFilter,
  };
};