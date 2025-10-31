
import React, { useState, useEffect } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";


export const CompanySelector = () => {
  const { currentCompany, companies, setCurrentCompany } = useCompany();
  const { userProfile } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [canSwitchCompanies, setCanSwitchCompanies] = useState(false);

  // Check if user is super admin and has permission to switch companies
  useEffect(() => {
    const checkPermissions = async () => {
      // Hardcoded super admin check first
      if (userProfile?.email === 'edward@shogunaillc.com') {
        setIsSuperAdmin(true);
        setCanSwitchCompanies(true);
        return;
      }
      
      try {
        // Check both super admin status and company switching permission
        const { data: isSuperAdminData } = await supabase.rpc('is_super_admin');
        const { data: canSwitchData } = await supabase.rpc('can_switch_companies');
        
        setIsSuperAdmin(isSuperAdminData || false);
        setCanSwitchCompanies(canSwitchData || false);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setIsSuperAdmin(false);
        setCanSwitchCompanies(false);
      }
    };

    checkPermissions();
  }, [userProfile]);

  // Only show selector if user is super admin AND has permission to switch companies
  if (!isSuperAdmin || !canSwitchCompanies) {
    return null; // Regular users should never see the company selector
  }

  const handleValueChange = (value: string) => {
    console.log("CompanySelector: Value changed to:", value);
    console.log("CompanySelector: Current user is super admin:", isSuperAdmin);
    console.log("CompanySelector: Available companies:", companies.length);
    
    if (value === "all_companies") {
      // Super admin selected "All Companies"
      console.log("CompanySelector: Super admin selected 'All Companies' - clearing company filter");
      setCurrentCompany(null);
      localStorage.removeItem("selectedCompanyId");
    } else {
      const selected = companies.find(c => c.id === value);
      if (selected) {
        console.log("CompanySelector: Selected company:", selected.name, "ID:", selected.id);
        setCurrentCompany(selected);
        localStorage.setItem("selectedCompanyId", selected.id);
      } else {
        console.error("CompanySelector: Could not find company with ID:", value);
        console.log("CompanySelector: Available company IDs:", companies.map(c => c.id));
      }
    }
    
    // Force a brief delay before closing to ensure state updates
    if (isMobile) {
      setTimeout(() => setOpen(false), 150);
    }
  };

  // Calculate max width based on available space
  const maxWidth = isMobile ? "150px" : "180px";

  return (
    <Select
        value={currentCompany?.id || (isSuperAdmin ? "all_companies" : "")}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTrigger className={`h-8 bg-white border border-gray-200 rounded-md px-3`} style={{ maxWidth }}>
          <SelectValue 
            placeholder={isSuperAdmin ? "All Companies" : "Select company"} 
            className="truncate max-w-full" 
          />
        </SelectTrigger>
        <SelectContent 
          className="bg-white border border-gray-200 shadow-md"
          position={isMobile ? "popper" : "item-aligned"}
          sideOffset={isMobile ? 5 : 4}
          align={isMobile ? "center" : "start"}
          avoidCollisions={false}
        >
          {isSuperAdmin && (
            <SelectItem 
              value="all_companies"
              className="cursor-pointer hover:bg-gray-100 font-medium"
            >
              <span className="truncate block">All Companies</span>
            </SelectItem>
          )}
          {companies.map((company) => (
            <SelectItem 
              key={company.id} 
              value={company.id}
              className="cursor-pointer hover:bg-gray-100"
            >
              <span className="truncate block">{company.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
  );
};
