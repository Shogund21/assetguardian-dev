import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { useVendorAccountability } from "@/hooks/useVendorAccountability";
import type { VendorAccountability } from "@/types/chillerDashboard";

interface VendorAccountabilitySummaryProps {
  data?: VendorAccountability[];
  isLoading?: boolean;
}

export function VendorAccountabilitySummary({ data, isLoading }: VendorAccountabilitySummaryProps) {
  const { data: hookData, isLoading: hookLoading } = useVendorAccountability();
  
  const vendors = data || hookData || [];
  const loading = isLoading !== undefined ? isLoading : hookLoading;

  const formatCost = (cost: number) => {
    if (!cost) return '$0';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cost);
  };

  const getResolutionRateColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getResolutionRateBadge = (rate: number) => {
    if (rate >= 80) return 'outline';
    if (rate >= 50) return 'secondary';
    return 'destructive';
  };

  // Calculate totals
  const totals = React.useMemo(() => {
    return vendors.reduce((acc, v) => ({
      totalFindings: acc.totalFindings + v.totalFindings,
      resolved: acc.resolved + v.findingsResolved,
      open: acc.open + v.findingsOpen,
      estimatedCost: acc.estimatedCost + v.estimatedCostTotal,
      actualCost: acc.actualCost + v.actualCostTotal,
    }), { totalFindings: 0, resolved: 0, open: 0, estimatedCost: 0, actualCost: 0 });
  }, [vendors]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vendor Accountability Summary
          </CardTitle>
          <CardDescription>What was found vs. what was repaired</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Vendor Accountability Summary
        </CardTitle>
        <CardDescription>What was found vs. what was repaired</CardDescription>
      </CardHeader>
      <CardContent>
        {vendors.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No vendor accountability data available
          </p>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground">Total Findings</div>
                <div className="text-2xl font-bold">{totals.totalFindings}</div>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Resolved
                </div>
                <div className="text-2xl font-bold text-green-600">{totals.resolved}</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Open
                </div>
                <div className="text-2xl font-bold text-orange-600">{totals.open}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Est. vs Actual
                </div>
                <div className="text-sm font-medium">
                  {formatCost(totals.estimatedCost)} / {formatCost(totals.actualCost)}
                </div>
              </div>
            </div>

            {/* Vendor Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor / Technician</TableHead>
                  <TableHead className="text-center">Findings</TableHead>
                  <TableHead className="text-center">Resolved</TableHead>
                  <TableHead className="text-center">Open</TableHead>
                  <TableHead className="w-[150px]">Resolution Rate</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
                  <TableHead>Categories</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.vendorId || vendor.vendorName}>
                    <TableCell className="font-medium">{vendor.vendorName}</TableCell>
                    <TableCell className="text-center">{vendor.totalFindings}</TableCell>
                    <TableCell className="text-center text-green-600">{vendor.findingsResolved}</TableCell>
                    <TableCell className="text-center text-orange-600">{vendor.findingsOpen}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={vendor.resolutionRate} 
                          className="h-2 flex-1"
                          indicatorClassName={getResolutionRateColor(vendor.resolutionRate)}
                        />
                        <Badge variant={getResolutionRateBadge(vendor.resolutionRate)} className="w-14 justify-center">
                          {vendor.resolutionRate}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCost(vendor.estimatedCostTotal)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vendor.topCategories.slice(0, 2).map((cat, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {vendor.topCategories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{vendor.topCategories.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default VendorAccountabilitySummary;
