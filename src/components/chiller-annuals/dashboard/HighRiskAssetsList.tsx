import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Shield, ChevronRight, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useHighRiskAssets } from "@/hooks/useVendorAccountability";
import type { HighRiskAsset } from "@/types/chillerDashboard";

interface HighRiskAssetsListProps {
  data?: HighRiskAsset[];
  isLoading?: boolean;
}

export function HighRiskAssetsList({ data, isLoading }: HighRiskAssetsListProps) {
  const { data: hookData, isLoading: hookLoading } = useHighRiskAssets();
  
  const assets = data || hookData || [];
  const loading = isLoading !== undefined ? isLoading : hookLoading;

  const getRiskLevelStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
    }
  };

  const formatCost = (cost: number | null) => {
    if (!cost) return null;
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cost);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            High Risk / No Redundancy Assets
          </CardTitle>
          <CardDescription>Critical assets requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          High Risk / No Redundancy Assets
        </CardTitle>
        <CardDescription>
          Critical assets requiring immediate attention
          {assets.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {assets.length} Asset{assets.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-green-700 dark:text-green-400">
              All Assets Healthy
            </h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              No high-risk or critical assets detected in your chiller fleet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assets.map((asset) => (
              <div 
                key={asset.id} 
                className={`rounded-lg border p-4 ${getRiskLevelStyle(asset.riskLevel)}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{asset.name}</h3>
                      <Badge variant={asset.riskLevel === 'critical' ? 'destructive' : 'secondary'}>
                        {asset.riskLevel.toUpperCase()}
                      </Badge>
                      {!asset.hasBackup && (
                        <Badge variant="outline" className="border-orange-500 text-orange-700 dark:text-orange-400">
                          <Shield className="h-3 w-3 mr-1" />
                          No Backup
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {asset.location} • {asset.model}
                    </div>

                    {/* Red Flags */}
                    {asset.redFlags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {asset.redFlags.slice(0, 5).map((flag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {flag}
                          </Badge>
                        ))}
                        {asset.redFlags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{asset.redFlags.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Risk Score:</span>
                        <span className={`font-bold ${
                          asset.riskScore >= 70 ? 'text-red-600' : 
                          asset.riskScore >= 50 ? 'text-orange-600' : 
                          'text-yellow-600'
                        }`}>
                          {asset.riskScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Last: {format(new Date(asset.lastInspection), "MMM d, yyyy")}
                        </span>
                      </div>
                      {asset.estimatedRepairCost && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-red-600">
                            {formatCost(asset.estimatedRepairCost)} est. repairs
                          </span>
                        </div>
                      )}
                      {asset.openFindingsCount > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-orange-600 font-medium">
                            {asset.openFindingsCount} open finding{asset.openFindingsCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="shrink-0">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HighRiskAssetsList;
