import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, Minus, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useChillerHealthScores } from "@/hooks/useChillerFleetHealth";
import type { ChillerHealthScore } from "@/types/chillerDashboard";

interface ChillerHealthScoreTableProps {
  data?: ChillerHealthScore[];
  isLoading?: boolean;
}

export function ChillerHealthScoreTable({ data, isLoading }: ChillerHealthScoreTableProps) {
  const { data: hookData, isLoading: hookLoading } = useChillerHealthScores();
  
  const scores = data || hookData || [];
  const loading = isLoading !== undefined ? isLoading : hookLoading;

  const getRiskBadgeVariant = (riskLevel: string | null) => {
    switch (riskLevel) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTrendIcon = (trend: ChillerHealthScore['trend']) => {
    switch (trend) {
      case 'improving':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-muted-foreground" />;
      case 'new':
        return <Sparkles className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendLabel = (trend: ChillerHealthScore['trend'], priorScore: number | null) => {
    if (trend === 'new') return 'First inspection';
    if (priorScore === null) return '—';
    
    const current = scores.find(s => s.priorYearScore === priorScore)?.healthScore || 0;
    const diff = current - priorScore;
    
    if (Math.abs(diff) <= 5) return 'Stable';
    return diff > 0 ? `+${diff.toFixed(0)}%` : `${diff.toFixed(0)}%`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chiller Health Scores</CardTitle>
          <CardDescription>Health score by asset with year-over-year trend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chiller Health Scores</CardTitle>
          <CardDescription>Health score by asset with year-over-year trend</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No chiller inspection data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chiller Health Scores</CardTitle>
        <CardDescription>Health score by asset with year-over-year trend</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="w-[180px]">Health Score</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Last Inspection</TableHead>
              <TableHead>Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((score) => (
              <TableRow key={score.equipmentId}>
                <TableCell className="font-medium">{score.equipmentName}</TableCell>
                <TableCell className="text-muted-foreground">{score.location}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{score.model || '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={score.healthScore} 
                      className="h-2 flex-1"
                      indicatorClassName={getHealthScoreColor(score.healthScore)}
                    />
                    <span className="text-sm font-medium w-10">
                      {score.healthScore}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {score.riskLevel && (
                    <Badge variant={getRiskBadgeVariant(score.riskLevel)}>
                      {score.riskLevel}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(score.lastInspection), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(score.trend)}
                    <span className="text-xs text-muted-foreground">
                      {score.trend === 'new' ? 'New' : 
                       score.priorYearScore !== null 
                         ? `${score.healthScore - score.priorYearScore > 0 ? '+' : ''}${(score.healthScore - score.priorYearScore).toFixed(0)}%`
                         : '—'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ChillerHealthScoreTable;
