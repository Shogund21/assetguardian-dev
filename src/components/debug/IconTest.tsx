
import React from "react";
import { Brain, FileText, LayoutDashboard, Wrench, Building2, ClipboardList, BarChart4, Settings, LogOut } from "lucide-react";

export const IconTest = () => {
  const icons = [
    { name: "Brain", icon: Brain },
    { name: "FileText", icon: FileText },
    { name: "LayoutDashboard", icon: LayoutDashboard },
    { name: "Wrench", icon: Wrench },
    { name: "Building2", icon: Building2 },
    { name: "ClipboardList", icon: ClipboardList },
    { name: "BarChart4", icon: BarChart4 },
    { name: "Settings", icon: Settings },
    { name: "LogOut", icon: LogOut }
  ];

  React.useEffect(() => {
    console.log("🧪 IconTest: Testing icon loading...");
    icons.forEach(({ name, icon }) => {
      if (icon) {
        console.log(`✅ IconTest: ${name} loaded successfully`);
      } else {
        console.error(`❌ IconTest: ${name} failed to load`);
      }
    });
  }, []);

  return (
    <div className="fixed top-32 right-4 bg-white border p-2 rounded shadow z-[200] text-xs">
      <div className="font-bold mb-2">Icon Test:</div>
      <div className="grid grid-cols-3 gap-1">
        {icons.map(({ name, icon: Icon }) => (
          <div key={name} className="flex items-center gap-1">
            {Icon ? <Icon className="h-3 w-3" /> : <span className="text-red-500">❌</span>}
            <span className="text-xs">{name.slice(0, 4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
