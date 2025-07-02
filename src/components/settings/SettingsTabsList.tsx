
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
      <TabsList className="w-full min-w-max grid grid-cols-9 md:grid-cols-5 lg:grid-cols-9 gap-1 md:gap-2 h-auto p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={`flex items-center whitespace-nowrap ${isMobile ? 'justify-center px-1 py-1 text-xs' : 'justify-center px-2 py-1.5 text-sm'} min-w-0 flex-shrink-0`}
          >
            {getIcon(tab.id)}
            <span className={`${isMobile ? 'ml-1' : 'ml-2'} truncate`}>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default SettingsTabsList;
