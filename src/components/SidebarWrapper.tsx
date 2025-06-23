
import React from "react";
import { 
  SidebarHeader, 
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { CompanySelector } from "@/components/company/CompanySelector";
import { 
  LayoutDashboard, 
  Wrench, 
  Building2, 
  ClipboardList, 
  BarChart4, 
  Settings,
  Brain
} from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export const SidebarWrapper = () => {
  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "Equipment", icon: Wrench, path: "/equipment" },
    { title: "Projects", icon: Building2, path: "/projects" },
    { title: "Maintenance", icon: ClipboardList, path: "/maintenance-checks" },
    { title: "Predictive Maintenance", icon: Brain, path: "/predictive-maintenance" },
    { title: "Analytics", icon: BarChart4, path: "/analytics" },
    { title: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader className="border-b">
        <div className="p-2">
          <CompanySelector />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link to={item.path}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Footer content can be added here */}
      </SidebarFooter>
    </div>
  );
};

export default SidebarWrapper;
