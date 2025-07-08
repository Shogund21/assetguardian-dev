
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
import { Building2 } from "lucide-react";

export const CompanySelector = () => {
  const { currentCompany, companies, setCurrentCompany } = useCompany();
  const { userProfile } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if user is super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (userProfile?.email === 'edward@shogunaillc.com') {
        setIsSuperAdmin(true);
        return;
      }
      
      try {
        const { data } = await supabase.rpc('is_super_admin');
        setIsSuperAdmin(data || false);
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      }
    };

    checkSuperAdmin();
  }, [userProfile]);

  // Always show selector for super admin, even with one company
  if (companies.length <= 1 && !isSuperAdmin) {
    return null; // Don't render the selector if there's only one or no company (unless super admin)
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
    <div className="flex items-center">
      <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
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
    </div>
  );
};
