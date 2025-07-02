
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  LayoutDashboard, 
  Bell, 
  Map, 
  Settings,
  Wrench, 
  Paintbrush, 
  FileText,
  Shield
} from "lucide-react";

interface SettingsTabsListProps {
  tabs: { id: string; label: string; }[];
  isMobile: boolean;
}

const SettingsTabsList = ({ tabs, isMobile }: SettingsTabsListProps) => {
  const getIcon = (tabId: string) => {
    switch (tabId) {
      case "general":
        return <LayoutDashboard className="h-4 w-4" />;
      case "notifications":
        return <Bell className="h-4 w-4" />;
      case "locations":
        return <Map className="h-4 w-4" />;
      case "companies":
        return <Building2 className="h-4 w-4" />;
      case "features":
        return <Settings className="h-4 w-4" />;
      case "maintenance":
        return <Wrench className="h-4 w-4" />; // Changed from Tool to Wrench
      case "appearance":
        return <Paintbrush className="h-4 w-4" />;
      case "documentation":
        return <FileText className="h-4 w-4" />;
      case "audit":
        return <Shield className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <TabsList className="w-full min-w-max grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-2 md:gap-3 h-auto p-2 bg-muted/50 rounded-lg">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={`flex items-center justify-center ${
              isMobile 
                ? 'px-2 py-2 text-xs min-h-[44px]' 
                : 'px-3 py-2.5 text-sm min-h-[48px]'
            } min-w-0 rounded-md transition-all duration-200 hover:bg-background/80 data-[state=active]:bg-background data-[state=active]:shadow-sm border border-transparent data-[state=active]:border-border/20`}
          >
            <div className="flex flex-col items-center space-y-1">
              {getIcon(tab.id)}
              <span className="truncate text-center leading-tight">{tab.label}</span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default SettingsTabsList;
