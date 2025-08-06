import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, Wrench, Filter, Search, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RealtimeHvacDiagnosticService, DiagnosticSession } from '@/services/realtimeHvacDiagnosticService';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HVACSessionDetail from './HVACSessionDetail';

const HVACAssistantHistory = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [selectedSession, setSelectedSession] = useState<DiagnosticSession | null>(null);

  // Fetch diagnostic sessions
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['hvac-diagnostic-sessions-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await RealtimeHvacDiagnosticService.getAllSessions();
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refresh every minute
  });

  // Filter sessions based on search and status
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

  const getSessionDuration = (session: DiagnosticSession) => {
    const start = new Date(session.started_at);
    const end = session.ended_at ? new Date(session.ended_at) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
    return `${duration} min`;
  };

  if (selectedSession) {
    return (
      <HVACSessionDetail
        session={selectedSession}
        onBack={() => setSelectedSession(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            HVAC Assistant History
          </h2>
          <p className="text-gray-600 mt-1">
            View past diagnostic sessions and AI assistance conversations
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
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
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wrench className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => s.resolved).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active/Pending</p>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error loading sessions: {(error as Error).message}</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {sessions.length === 0 ? 'No Diagnostic Sessions' : 'No Sessions Found'}
              </h3>
              <p className="text-gray-600">
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
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          Session #{session.id.slice(-8)}
                        </h3>
                        {getStatusBadge(session)}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSession(session);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
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

export default HVACAssistantHistory;