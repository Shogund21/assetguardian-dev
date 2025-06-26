
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { DegradationAnalysis } from "@/types/predictive";

interface DegradationAnalysisCardProps {
  degradationAnalysis: DegradationAnalysis[];
}

const DegradationAnalysisCard = ({ degradationAnalysis }: DegradationAnalysisCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-500" />
          Component Degradation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {degradationAnalysis.map((analysis, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">{analysis.component}</div>
                <div className="text-right">
                  <div className="text-lg font-bold">{analysis.current_condition}%</div>
                  <div className="text-xs text-muted-foreground">current condition</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full ${
                    analysis.current_condition > 70 ? 'bg-green-500' :
                    analysis.current_condition > 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysis.current_condition}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Degradation Rate:</span>
                  <div className="font-medium text-orange-600">{analysis.degradation_rate}%/month</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Life Remaining:</span>
                  <div className="font-medium">{analysis.expected_life_remaining} months</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Replacement Threshold:</span>
                  <div className="font-medium">{analysis.replacement_threshold}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DegradationAnalysisCard;
