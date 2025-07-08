import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export const useCompanyFilter = () => {
  const { currentCompany } = useCompany();
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (currentCompany?.id) {
      console.log('useCompanyFilter: Setting company ID to', currentCompany.id);
      setCompanyId(currentCompany.id);
    } else {
      console.log('useCompanyFilter: No company selected, clearing company ID');
      setCompanyId(null);
    }
  }, [currentCompany]);

  const applyCompanyFilter = <T>(
    query: any,
    skipFilter = false // Default to applying the filter
  ): any => {
    if (skipFilter) {
      console.log('applyCompanyFilter: Skipping filter as requested');
      return query;
    }
    
    // Check if user is super admin - if so, don't apply any filtering
    const isSuperAdmin = user?.email === 'edward@shogunaillc.com';
    if (isSuperAdmin) {
      console.log('applyCompanyFilter: Super admin detected, skipping all company filtering');
      return query;
    }
    
    if (companyId) {
      console.log('applyCompanyFilter: Applying filter for company', companyId);
      return query.eq('company_id', companyId);
    }
    
    // If no company ID is selected for regular users, return empty result to prevent unauthorized access
    console.warn('applyCompanyFilter: No company ID available, blocking query for regular user');
    return query.eq('company_id', 'no-company-selected');
  };

  return {
    companyId,
    applyCompanyFilter,
  };
};