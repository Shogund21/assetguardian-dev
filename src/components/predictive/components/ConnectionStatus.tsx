
import React from "react";

interface ConnectionStatusProps {
  isOnline: boolean;
}

export const ConnectionStatus = ({ isOnline }: ConnectionStatusProps) => {
  return (
    <div className="text-sm font-normal flex items-center gap-2">
      {isOnline ? (
        <span className="text-green-600 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Online
        </span>
      ) : (
        <span className="text-orange-600 flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          Offline
        </span>
      )}
    </div>
  );
};
