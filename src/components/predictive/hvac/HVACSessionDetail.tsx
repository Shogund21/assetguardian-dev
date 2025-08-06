import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MessageSquare, Bot, User, Calendar, Clock, Wrench, CheckCircle } from 'lucide-react';
import { RealtimeHvacDiagnosticService, DiagnosticSession } from '@/services/realtimeHvacDiagnosticService';
import { format } from 'date-fns';

interface DiagnosticMessage {
  id: string;
  session_id: string;
  sender: 'tech' | 'llm';
  body: {
    text?: string;
    data?: any;
    type?: string;
  };
  created_at: string;
}

interface HVACSessionDetailProps {
  session: DiagnosticSession;
  onBack: () => void;
}

const HVACSessionDetail: React.FC<HVACSessionDetailProps> = ({ session, onBack }) => {
  // Fetch session messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['hvac-session-messages', session.id],
    queryFn: () => RealtimeHvacDiagnosticService.getSessionMessages(session.id),
    enabled: !!session.id,
  });

  const getSessionDuration = () => {
    const start = new Date(session.started_at);
    const end = session.ended_at ? new Date(session.ended_at) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
    return `${duration} minutes`;
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
    
    // Handle analysis type messages with structured data
    if (body.type === 'analysis' && body.data) {
      return (
        <div className="space-y-3">
          <p className="text-gray-900">{body.text}</p>
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
            <div className="text-xs text-gray-500">
              Confidence: {Math.round(body.data.confidence_score * 100)}%
            </div>
          )}
        </div>
      );
    }
    
    // Default text message
    return <p className="text-gray-900 whitespace-pre-wrap">{body.text}</p>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to History
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            Session #{session.id.slice(-8)}
          </h2>
          <p className="text-gray-600">HVAC Diagnostic Session Details</p>
        </div>
      </div>

      {/* Session Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Started</p>
                <p className="font-medium">
                  {format(new Date(session.started_at), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(session.started_at), 'HH:mm')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{getSessionDuration()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="font-medium">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {session.resolved ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Wrench className="h-5 w-5 text-orange-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                {getStatusBadge()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversation */}
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                        <p className="font-medium text-gray-900">
                          {message.sender === 'tech' ? 'Technician' : 'AI Assistant'}
                        </p>
                        <p className="text-xs text-gray-500">
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

export default HVACSessionDetail;