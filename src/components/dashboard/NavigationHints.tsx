
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Lightbulb, Smartphone } from "lucide-react";

export const NavigationHints = () => {
  const [isVisible, setIsVisible] = useState(() => {
    // Show hint if user hasn't seen it before
    return !localStorage.getItem('hasSeenRecordingHint');
  });

  const dismissHint = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenRecordingHint', 'true');
  };

  if (!isVisible) return null;

  return (
    <Card className="bg-amber-50 border-amber-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb className="h-3 w-3 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-amber-900 mb-1">
                💡 New to Recording Readings?
              </h4>
              <p className="text-xs text-amber-700 mb-2">
                Use the "Quick Record Reading" button above to access our AI-powered recording options.
              </p>
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <Smartphone className="h-3 w-3" />
                <span>Optimized for mobile devices</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissHint}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
