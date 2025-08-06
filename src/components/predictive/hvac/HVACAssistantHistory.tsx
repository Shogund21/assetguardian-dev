import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RealtimeHvacDiagnosticService } from '@/services/realtimeHvacDiagnosticService';
import { HVACSessionDetail } from './HVACSessionDetail';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Search, Eye, Trash2, MessageSquare, Calendar, Wrench, Filter } from 'lucide-react';

interface DiagnosticSession {
  id: string;
  equipment_id: string | null;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export const HVACAssistantHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<DiagnosticSession | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  

  const isSuperAdmin = userProfile?.email === 'edward@shogunaillc.com';

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['hvac-sessions'],
    queryFn: () => RealtimeHvacDiagnosticService.getAllSessions(),
    refetchInterval: 30000,
  });

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.equipment_id && session.equipment_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'resolved' && session.resolved) ||
      (statusFilter === 'unresolved' && !session.resolved);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (session: DiagnosticSession) => {
    if (session.resolved) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Resolved</Badge>;
    } else if (session.ended_at) {
      return <Badge variant="secondary">Ended</Badge>;
    } else {
      return <Badge variant="destructive">Active</Badge>;
    }
  };

  const getSessionDuration = (session: DiagnosticSession): string => {
    if (!session.ended_at) return 'Ongoing';
    
    const start = new Date(session.started_at);
    const end = new Date(session.ended_at);
    const diffMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    
    return `${diffMinutes} min`;
  };

  const handleDeleteSession = async () => {
    if (!deleteSessionId) return;

    try {
      const result = await RealtimeHvacDiagnosticService.deleteSession(deleteSessionId);
      
      if (result.success) {
        toast.success(result.message || 'Session deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['hvac-sessions'] });
        setDeleteSessionId(null);
      } else {
        toast.error(result.message || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  if (selectedSession) {
    return (
      <HVACSessionDetail 
        session={selectedSession}
        onBack={() => setSelectedSession(null)}
        isSuperAdmin={isSuperAdmin}
        onDelete={async (sessionId: string) => {
          const result = await RealtimeHvacDiagnosticService.deleteSession(sessionId);
          if (result.success) {
            toast.success(result.message || 'Session deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['hvac-sessions'] });
            setSelectedSession(null);
          } else {
            toast.error(result.message || 'Failed to delete session');
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">HVAC Assistant History</h2>
          <p className="text-muted-foreground">
            View past diagnostic sessions and AI assistance conversations
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="unresolved">Unresolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wrench className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => s.resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active/Pending</p>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => !s.resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Diagnostic Sessions ({filteredSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>Error loading sessions: {(error as Error).message}</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {sessions.length === 0 ? 'No Diagnostic Sessions' : 'No Sessions Found'}
              </h3>
              <p className="text-muted-foreground">
                {sessions.length === 0 
                  ? 'Start using the HVAC Diagnostic Assistant to see session history here.'
                  : 'Try adjusting your search criteria or filters.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">
                          Session #{session.id.slice(-8)}
                        </h3>
                        {getStatusBadge(session)}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(session.started_at), 'MMM d, yyyy HH:mm')}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          Duration: {getSessionDuration(session)}
                        </div>
                        {session.equipment_id && (
                          <div className="flex items-center gap-1">
                            <Wrench className="h-4 w-4" />
                            Equipment: {session.equipment_id.slice(-8)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSession(session)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      {isSuperAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteSessionId(session.id)}
                              className="flex items-center gap-2 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Session</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this diagnostic session? This will permanently remove the session and all associated messages. This action cannot be undone.
                                <br /><br />
                                <strong>Session ID:</strong> {session.id.slice(0, 8)}...
                                <br />
                                <strong>Started:</strong> {format(new Date(session.started_at), 'PPpp')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteSessionId(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteSession}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Session
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};