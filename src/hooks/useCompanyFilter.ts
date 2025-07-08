
import { useCompany } from "@/contexts/CompanyContext";
import { useEffect, useState } from "react";

export const useCompanyFilter = () => {
  const { currentCompany } = useCompany();
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
    
    if (companyId) {
      console.log('applyCompanyFilter: Applying filter for company', companyId);
      return query.eq('company_id', companyId);
    }
    
    // If no company ID is selected, don't apply any filter
    console.log('applyCompanyFilter: No company ID to filter by');
    return query;
  };

  return {
    companyId,
    applyCompanyFilter,
  };
};
