
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
  Shield,
  Activity
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
      case "user-metrics":
        return <Activity className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <TabsList className="flex min-w-max gap-2 h-auto p-2 bg-muted/50 rounded-lg">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={`box-border flex items-center justify-center ${
              isMobile 
                ? 'px-2 py-1 text-xs min-w-[80px]' 
                : 'px-3 py-1.5 text-sm min-w-[100px]'
            } rounded-md transition-all duration-200 hover:bg-background/80 data-[state=active]:ring-2 data-[state=active]:ring-primary/20 data-[state=active]:bg-background border border-transparent whitespace-nowrap`}
          >
            <div className="flex flex-col items-center space-y-0.5">
              {getIcon(tab.id)}
              <span className="text-center leading-tight">{tab.label}</span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default SettingsTabsList;
