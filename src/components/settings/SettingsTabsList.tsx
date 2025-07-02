
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
    <TabsList className="w-full max-w-none grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 h-auto overflow-visible">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          className={`flex items-center ${isMobile ? 'justify-center px-1 py-1 text-xs' : 'justify-start px-2 py-1.5 text-sm'}`}
        >
          {getIcon(tab.id)}
          <span className={`${isMobile ? 'ml-1' : 'ml-2'}`}>{tab.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default SettingsTabsList;
