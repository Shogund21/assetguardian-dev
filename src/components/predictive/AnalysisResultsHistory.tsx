
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  DollarSign,
  Clock,
  Search,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PredictiveAlert } from "@/types/predictive";
import PredictiveTimeline from "./PredictiveTimeline";

const AnalysisResultsHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [selectedResult, setSelectedResult] = useState<PredictiveAlert | null>(null);

  // Fetch all predictive alerts with equipment details
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['analysis-results-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictive_alerts')
        .select(`
          *,
          equipment:asset_id (
            name,
            location
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching analysis results:', error);
        throw error;
      }
      
      return data as PredictiveAlert[];
    },
  });

  // Filter and sort results
  const filteredResults = results
    .filter(result => {
      const matchesSearch = !searchTerm || 
        (result.equipment?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.finding.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRisk = riskFilter === "all" || result.risk_level === riskFilter;
      
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'risk':
          const riskOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return riskOrder[b.risk_level] - riskOrder[a.risk_level];
        case 'equipment':
          return (a.equipment?.name || '').localeCompare(b.equipment?.name || '');
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="default" className="bg-green-600">Low Risk</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextFailureDate = (result: PredictiveAlert) => {
    if (!result.predictive_timeline || result.predictive_timeline.length === 0) return null;
    
    const nearestFailure = result.predictive_timeline
      .sort((a, b) => new Date(a.predicted_date).getTime() - new Date(b.predicted_date).getTime())[0];
    
    return nearestFailure;
  };

  // Summary statistics
  const highRiskCount = results.filter(r => r.risk_level === 'high').length;
  const totalEquipmentAnalyzed = new Set(results.map(r => r.asset_id)).size;
  const thisMonthAnalyses = results.filter(r => 
    new Date(r.created_at).getMonth() === new Date().getMonth() &&
    new Date(r.created_at).getFullYear() === new Date().getFullYear()
  ).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading analysis results...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{results.length}</div>
                <div className="text-xs text-muted-foreground">Total Analyses</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{highRiskCount}</div>
                <div className="text-xs text-muted-foreground">High Risk Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{totalEquipmentAnalyzed}</div>
                <div className="text-xs text-muted-foreground">Equipment Monitored</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{thisMonthAnalyses}</div>
                <div className="text-xs text-muted-foreground">This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment or findings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Newest First)</SelectItem>
                <SelectItem value="risk">Risk Level</SelectItem>
                <SelectItem value="equipment">Equipment Name</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredResults.length} of {results.length} results
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredResults.map((result) => {
          const nextFailure = getNextFailureDate(result);
          
          return (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(result.risk_level)}
                    <div>
                      <h3 className="font-medium">{result.equipment?.name || 'Unknown Equipment'}</h3>
                      <p className="text-sm text-muted-foreground">{result.equipment?.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getRiskBadge(result.risk_level)}
                    {result.confidence_score && (
                      <Badge variant="secondary" className="text-xs">
                        {result.confidence_score}% confidence
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm">{result.finding}</p>
                  
                  {nextFailure && (
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>Next predicted failure: {formatDate(nextFailure.predicted_date)}</span>
                      <Badge variant="outline" className="text-xs">
                        {nextFailure.failure_probability}% risk
                      </Badge>
                    </div>
                  )}
                  
                  {result.data_quality && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Data: {result.data_quality.manual_readings_count}M + {result.data_quality.standard_readings_count}S readings</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(result.created_at)}
                  </span>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Analysis Details - {result.equipment?.name}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <Tabs defaultValue="summary" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="summary">Summary</TabsTrigger>
                          <TabsTrigger value="timeline">Predictive Timeline</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="summary" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Risk Assessment</h4>
                              <div className="flex items-center gap-2 mb-2">
                                {getRiskIcon(result.risk_level)}
                                {getRiskBadge(result.risk_level)}
                              </div>
                              {result.confidence_score && (
                                <div className="text-sm">
                                  Confidence: {result.confidence_score}%
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Analysis Date</h4>
                              <p className="text-sm">{formatDate(result.created_at)}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Finding</h4>
                            <p className="text-sm text-muted-foreground">{result.finding}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Recommendation</h4>
                            <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                          </div>
                          
                          {result.data_quality && (
                            <div>
                              <h4 className="font-medium mb-2">Data Quality</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>Manual Readings: {result.data_quality.manual_readings_count}</div>
                                <div>Standard Readings: {result.data_quality.standard_readings_count}</div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {result.data_quality.coverage_assessment}
                              </p>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="timeline">
                          <PredictiveTimeline
                            timelineEvents={result.predictive_timeline}
                            maintenanceWindows={result.maintenance_windows}
                            degradationAnalysis={result.degradation_analysis}
                            performanceTrends={result.performance_trends}
                          />
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredResults.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Analysis Results Found</h3>
            <p className="text-muted-foreground">
              {results.length === 0 
                ? "No AI analyses have been run yet. Start by analyzing equipment to see results here."
                : "No results match your current filters. Try adjusting your search or filter criteria."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisResultsHistory;
