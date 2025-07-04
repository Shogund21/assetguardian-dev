
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { checkAuthStatus } from "@/services/emailValidationService";

export const useSettingsTabs = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("general");
  const [showTabList, setShowTabList] = useState(true); // Always show initially

  console.log("useSettingsTabs:", { isMobile, activeTab, showTabList });

  const authData = checkAuthStatus();
  const isAdminUser = authData.userData?.email === "edward@shogunai.com";

  const baseTabs = [
    { id: "general", label: "General" },
    { id: "notifications", label: "Notifications" },
    { id: "locations", label: "Locations" },
    { id: "companies", label: "Companies" },
    { id: "features", label: "Features" },
    { id: "maintenance", label: "Maintenance" },
    { id: "appearance", label: "Appearance" },
    { id: "documentation", label: "Documentation" },
    { id: "audit", label: "Audit" },
    { id: "user-metrics", label: "User Metrics" },
  ];

  const adminTabs = [
    { id: "access-requests", label: "Access Requests" },
  ];

  const tabs = isAdminUser ? [...baseTabs, ...adminTabs] : baseTabs;

  useEffect(() => {
    if (isMobile !== null) {
      setShowTabList(!isMobile);
    }
  }, [isMobile]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobile) {
      setShowTabList(false);
    }
  };

  const toggleTabList = () => {
    setShowTabList(!showTabList);
  };

  const prevTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const nextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  return {
    tabs,
    activeTab,
    showTabList,
    prevTab,
    nextTab,
    isMobile,
    handleTabChange,
    toggleTabList,
  };
};
