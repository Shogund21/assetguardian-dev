
import React, { useEffect, useState } from "react";
import { Brain, FileText, Menu } from "lucide-react";

export const NavigationTest = () => {
  const [testResults, setTestResults] = useState({
    mobileDropdown: false,
    sidebarTrigger: false,
    iconsLoaded: false,
    layoutDetected: false
  });

  useEffect(() => {
    console.log("🧪 NavigationTest: Starting navigation diagnostics...");
    
    // Test 1: Check if mobile dropdown exists
    const dropdown = document.querySelector('[data-mobile-dropdown]');
    const dropdownButton = document.querySelector('[data-testid="mobile-dropdown-trigger"]');
    
    // Test 2: Check if sidebar trigger exists
    const sidebarTrigger = document.querySelector('[data-sidebar-trigger-wrapper]');
    
    // Test 3: Test icon loading
    const brainIcon = Brain;
    const fileIcon = FileText;
    const menuIcon = Menu;
    
    // Test 4: Check layout detection
    const mobileLayout = document.querySelector('[data-testid="mobile-content"]');
    
    const results = {
      mobileDropdown: !!(dropdown && dropdownButton),
      sidebarTrigger: !!sidebarTrigger,
      iconsLoaded: !!(brainIcon && fileIcon && menuIcon),
      layoutDetected: !!mobileLayout
    };
    
    setTestResults(results);
    
    console.log("🧪 NavigationTest: Test results:", results);
    console.log("🧪 NavigationTest: Elements found:", {
      dropdown: !!dropdown,
      dropdownButton: !!dropdownButton,
      sidebarTrigger: !!sidebarTrigger,
      mobileLayout: !!mobileLayout
    });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white border-4 border-orange-500 p-4 rounded-lg shadow-xl z-[400] max-w-xs">
      <div className="font-bold text-orange-600 mb-2">🧪 NAVIGATION TEST</div>
      
      <div className="space-y-1 text-sm">
        <div className={`flex items-center gap-2 ${testResults.mobileDropdown ? 'text-green-600' : 'text-red-600'}`}>
          {testResults.mobileDropdown ? '✅' : '❌'} Mobile Dropdown
        </div>
        
        <div className={`flex items-center gap-2 ${testResults.sidebarTrigger ? 'text-green-600' : 'text-red-600'}`}>
          {testResults.sidebarTrigger ? '✅' : '❌'} Sidebar Trigger
        </div>
        
        <div className={`flex items-center gap-2 ${testResults.iconsLoaded ? 'text-green-600' : 'text-red-600'}`}>
          {testResults.iconsLoaded ? '✅' : '❌'} Icons Loaded
        </div>
        
        <div className={`flex items-center gap-2 ${testResults.layoutDetected ? 'text-green-600' : 'text-red-600'}`}>
          {testResults.layoutDetected ? '✅' : '❌'} Mobile Layout
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        Check console for detailed logs
      </div>
      
      {/* Icon test display */}
      <div className="mt-2 flex gap-1">
        <Brain className="h-4 w-4 text-blue-500" />
        <FileText className="h-4 w-4 text-blue-500" />
        <Menu className="h-4 w-4 text-blue-500" />
      </div>
    </div>
  );
};
