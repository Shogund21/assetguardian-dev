
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/contexts/CompanyContext";
import { UserDropdown } from "./UserDropdown";
import { useSidebar } from "../ui/sidebar";
import { CompanySelector } from "../company/CompanySelector";

interface SidebarHeaderProps {
  isMobile: boolean;
}

export function SidebarHeader({ isMobile }: SidebarHeaderProps) {
  const { currentCompany, isCompanyLoading } = useCompany();
  const { toggleSidebar } = useSidebar();
  
  return (
    <div className="flex h-[60px] items-center justify-between border-b px-4 bg-white">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img 
            src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
            alt="Asset Guardian Logo" 
            className="h-6 w-6 flex-shrink-0" 
          />
          <span className="truncate max-w-[120px]">Asset Guardian</span>
        </Link>
        <CompanySelector />
      </div>
      {isMobile ? (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSidebar}
          className="focus:outline-none"
          aria-label="Toggle Menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      ) : (
        <div className="flex items-center gap-2 z-[100]">
          <div className="relative z-[100]">
            <UserDropdown />
          </div>
        </div>
      )}
    </div>
  );
}
