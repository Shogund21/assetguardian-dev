
import { Calendar, Home, Inbox, Search, Settings, Wrench, Building2, ClipboardList, BarChart4, FileText, LogOut } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/auth/LogoutButton";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Equipment",
    url: "/equipment",
    icon: Wrench,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: Building2,
  },
  {
    title: "Maintenance",
    url: "/maintenance-checks",
    icon: ClipboardList,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart4,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Customer Manual",
    url: "/customer-manual",
    icon: FileText,
  },
];

interface SidebarNavProps {
  closeMenuOnMobile?: () => void;
}

export function SidebarNav({ closeMenuOnMobile }: SidebarNavProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive}
                    className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                  >
                    <Link 
                      to={item.url} 
                      className="flex items-center"
                      onClick={closeMenuOnMobile}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      {/* Logout Section at Bottom */}
      <SidebarGroup className="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <LogoutButton className="w-full justify-start p-2 h-8 font-normal hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <LogOut className="h-4 w-4 mr-2" />
                {!isCollapsed && <span>Sign Out</span>}
              </LogoutButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
