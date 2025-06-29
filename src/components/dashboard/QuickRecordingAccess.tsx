
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Edit3, ArrowRight } from "lucide-react";

export const QuickRecordingAccess = () => {
  const navigate = useNavigate();

  const handleRecordingAccess = () => {
    navigate('/predictive-maintenance');
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Edit3 className="h-4 w-4 text-blue-600" />
              </div>
              Quick Record Reading
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Record equipment readings manually or use AI-powered image extraction
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Edit3 className="h-3 w-3" />
                <span>Manual Entry</span>
              </div>
              <div className="flex items-center gap-1">
                <Camera className="h-3 w-3" />
                <span>AI Camera</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleRecordingAccess}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto flex items-center gap-2 min-h-[44px] touch-manipulation"
          >
            Start Recording
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
