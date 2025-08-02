import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Users, 
  Activity, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AIFeatureService, AIAccessRequest, AIUsageRecord } from '@/services/aiFeatureService';
import { useAuth } from '@/hooks/useAuth';

const SuperAdminAIManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accessRequests, setAccessRequests] = useState<AIAccessRequest[]>([]);
  const [usageRecords, setUsageRecords] = useState<AIUsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requests, usage] = await Promise.all([
        AIFeatureService.getAllAccessRequests(),
        AIFeatureService.getAllUsageStats()
      ]);
      setAccessRequests(requests);
      setUsageRecords(usage);
    } catch (error) {
      console.error('Error loading AI management data:', error);
      toast({
        title: "Error",
        description: "Failed to load AI management data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!user) return;
    
    setProcessingRequest(requestId);
    try {
      const result = await AIFeatureService.approveAccessRequest(
        requestId, 
        user.id, 
        reviewNotes[requestId]
      );
      
      if (result.success) {
        toast({
          title: "Request Approved",
          description: "User has been granted access to dual-AI features.",
        });
        await loadData();
        setReviewNotes(prev => ({ ...prev, [requestId]: '' }));
      } else {
        toast({
          title: "Approval Failed",
          description: result.error || "Failed to approve request.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "An error occurred while approving the request.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    if (!user) return;
    
    setProcessingRequest(requestId);
    try {
      const result = await AIFeatureService.denyAccessRequest(
        requestId, 
        user.id, 
        reviewNotes[requestId]
      );
      
      if (result.success) {
        toast({
          title: "Request Denied",
          description: "Access request has been denied.",
        });
        await loadData();
        setReviewNotes(prev => ({ ...prev, [requestId]: '' }));
      } else {
        toast({
          title: "Denial Failed",
          description: result.error || "Failed to deny request.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error denying request:', error);
      toast({
        title: "Error",
        description: "An error occurred while denying the request.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      case 'denied':
        return <Badge variant="outline" className="bg-red-50 border-red-200 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Denied
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingRequests = accessRequests.filter(req => req.status === 'pending');
  const totalUsageCost = usageRecords.reduce((sum, record) => sum + record.estimated_cost_usd, 0);
  const totalAPICalls = usageRecords.reduce((sum, record) => sum + record.api_calls_count, 0);
  const activeUsers = [...new Set(usageRecords.map(record => record.user_email))].length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Feature Management
          </CardTitle>
          <CardDescription>Loading management data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Pending Requests</span>
            </div>
            <div className="text-2xl font-bold mt-2">{pendingRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="text-2xl font-bold mt-2">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total API Calls</span>
            </div>
            <div className="text-2xl font-bold mt-2">{totalAPICalls.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Total Cost</span>
            </div>
            <div className="text-2xl font-bold mt-2">{formatCurrency(totalUsageCost)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Interface */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Access Requests
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Usage Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Requests</CardTitle>
              <CardDescription>
                Review and manage user requests for dual-AI energy dashboard access
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accessRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No access requests found.
                </div>
              ) : (
                <div className="space-y-4">
                  {accessRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{request.user_name}</span>
                            <span className="text-sm text-muted-foreground">({request.user_email})</span>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Requested on {formatDate(request.created_at)}
                          </div>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={processingRequest === request.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDenyRequest(request.id)}
                              disabled={processingRequest === request.id}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Deny
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Justification:</span>
                          <p className="mt-1 text-muted-foreground">{request.justification}</p>
                        </div>

                        {request.status === 'pending' && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Review Notes (optional):</label>
                            <Textarea
                              placeholder="Add notes about your decision..."
                              value={reviewNotes[request.id] || ''}
                              onChange={(e) => setReviewNotes(prev => ({
                                ...prev,
                                [request.id]: e.target.value
                              }))}
                              rows={2}
                            />
                          </div>
                        )}

                        {request.review_notes && (
                          <div className="text-sm">
                            <span className="font-medium">Review Notes:</span>
                            <p className="mt-1 text-muted-foreground">{request.review_notes}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Reviewed on {request.reviewed_at ? formatDate(request.reviewed_at) : 'Unknown'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Monitor AI feature usage and costs across all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No usage data available.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">User</th>
                          <th className="text-left py-2">Operation</th>
                          <th className="text-left py-2">Provider</th>
                          <th className="text-right py-2">API Calls</th>
                          <th className="text-right py-2">Cost</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageRecords.slice(0, 50).map((record) => (
                          <tr key={record.id} className="border-b">
                            <td className="py-2">{record.user_email}</td>
                            <td className="py-2">{record.operation_type}</td>
                            <td className="py-2">{record.ai_provider}</td>
                            <td className="py-2 text-right">{record.api_calls_count}</td>
                            <td className="py-2 text-right">{formatCurrency(record.estimated_cost_usd)}</td>
                            <td className="py-2">
                              <Badge variant={record.success ? "outline" : "destructive"} className="text-xs">
                                {record.success ? "Success" : "Failed"}
                              </Badge>
                            </td>
                            <td className="py-2">{formatDate(record.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminAIManagement;