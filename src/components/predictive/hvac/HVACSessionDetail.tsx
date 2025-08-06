import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RealtimeHvacDiagnosticService } from '@/services/realtimeHvacDiagnosticService';
import { format } from 'date-fns';
import { ArrowLeft, Clock, MessageSquare, Trash2, Bot, User, Calendar, CheckCircle, Wrench } from 'lucide-react';

interface DiagnosticMessage {
  id: string;
  session_id: string;
  sender: 'tech' | 'llm';
  body: {
    text?: string;
    data?: any;
    type?: 'text' | 'analysis' | 'recommendation';
  };
  created_at: string;
}

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

interface HVACSessionDetailProps {
  session: DiagnosticSession;
  onBack: () => void;
  isSuperAdmin?: boolean;
  onDelete?: (sessionId: string) => Promise<void>;
}

export const HVACSessionDetail: React.FC<HVACSessionDetailProps> = ({ 
  session, 
  onBack,
  isSuperAdmin = false,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const service = new RealtimeHvacDiagnosticService();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['hvac-session-messages', session.id],
    queryFn: () => RealtimeHvacDiagnosticService.getSessionMessages(session.id),
  });

  const getSessionDuration = (): string => {
    if (!session.ended_at) return 'Ongoing';
    
    const start = new Date(session.started_at);
    const end = new Date(session.ended_at);
    const diffMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    
    return `${diffMinutes} minutes`;
  };

  const getStatusBadge = () => {
    if (session.resolved) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Resolved</Badge>;
    } else if (session.ended_at) {
      return <Badge variant="secondary">Ended</Badge>;
    } else {
      return <Badge variant="destructive">Active</Badge>;
    }
  };

  const renderMessageContent = (message: DiagnosticMessage) => {
    const { body } = message;
    
    if (body.type === 'analysis' && body.data) {
      return (
        <div className="space-y-3">
          <p>{body.text}</p>
          {body.data.recommendations && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <h4 className="font-medium text-blue-900 mb-2">Recommendations:</h4>
              <ul className="space-y-1">
                {body.data.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-blue-800 text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {body.data.confidence_score && (
            <div className="text-xs text-muted-foreground">
              Confidence: {Math.round(body.data.confidence_score * 100)}%
            </div>
          )}
        </div>
      );
    }
    
    return <p className="whitespace-pre-wrap">{body.text}</p>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Session Details</h1>
          {isSuperAdmin && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Session
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
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        await onDelete(session.id);
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Session'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Session Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-medium">
                  {format(new Date(session.started_at), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(session.started_at), 'HH:mm')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{getSessionDuration()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="font-medium">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {session.resolved ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Wrench className="h-5 w-5 text-orange-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {getStatusBadge()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversation Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation ({messages.length} messages)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages in this session</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      {message.sender === 'tech' ? (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {message.sender === 'tech' ? 'Technician' : 'AI Assistant'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), 'MMM d, HH:mm')}
                        </p>
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.sender === 'tech' 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        {renderMessageContent(message)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};