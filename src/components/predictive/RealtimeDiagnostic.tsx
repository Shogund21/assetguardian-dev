
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, MessageCircle, AlertTriangle, CheckCircle, XCircle, Send, Loader2, Paperclip, X } from 'lucide-react';
import { RealtimeHvacDiagnosticService, type LivePoint, type DiagnosticSession, type DiagnosticMessage } from '@/services/realtimeHvacDiagnosticService';
import { toast } from 'sonner';

interface Props {
  equipmentId: string;
  equipmentName: string;
  onClose?: () => void;
}

export const RealtimeDiagnostic = ({ equipmentId, equipmentName, onClose }: Props) => {
  const [livePoints, setLivePoints] = useState<Record<string, LivePoint>>({});
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const [messages, setMessages] = useState<DiagnosticMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGeneralMode = equipmentId === "general";

  // Start monitoring when component mounts
  useEffect(() => {
    const startMonitoring = async () => {
      // For general mode, skip live monitoring and show as ready
      if (isGeneralMode) {
        setIsConnected(true);
        toast.success('Ki Assistant ready for troubleshooting chat');
        return;
      }

      try {
        // Start live monitoring for specific equipment
        await RealtimeHvacDiagnosticService.startLiveMonitoring(
          equipmentId,
          (points) => {
            setLivePoints(points);
            setIsConnected(true);
          }
        );

        // Generate some demo data initially
        await RealtimeHvacDiagnosticService.generateDemoLiveData(equipmentId);

        toast.success('Connected to live data stream');
      } catch (error) {
        console.error('Error starting monitoring:', error);
        toast.error('Failed to connect to live data');
      }
    };

    startMonitoring();

    return () => {
      if (!isGeneralMode) {
        RealtimeHvacDiagnosticService.stopLiveMonitoring();
      }
    };
  }, [equipmentId, isGeneralMode]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start diagnostic session
  const startSession = async () => {
    try {
      const newSession = await RealtimeHvacDiagnosticService.startDiagnosticSession(equipmentId);
      setSession(newSession);
      
      // Send initial AI analysis
      setIsAnalyzing(true);
      await RealtimeHvacDiagnosticService.analyzeCurrentState(equipmentId, newSession.id);
      
      // Load messages
      const sessionMessages = await RealtimeHvacDiagnosticService.getSessionMessages(newSession.id);
      setMessages(sessionMessages);
      setIsAnalyzing(false);

      toast.success('Diagnostic session started');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start diagnostic session');
      setIsAnalyzing(false);
    }
  };

  // End diagnostic session
  const endSession = async (resolved: boolean = false) => {
    if (!session) return;

    try {
      await RealtimeHvacDiagnosticService.endDiagnosticSession(session.id, resolved);
      setSession(null);
      setMessages([]);
      toast.success(`Session ended ${resolved ? 'as resolved' : ''}`);
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i];
        const reader = new FileReader();
        
        await new Promise((resolve, reject) => {
          reader.onload = (event) => {
            if (event.target?.result) {
              newImages.push(event.target.result as string);
            }
            resolve(true);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setSelectedImages(prev => [...prev, ...newImages].slice(0, 5));
      toast.success(`${newImages.length} image(s) added`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove image from selection
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Send message with or without images
  const sendMessage = async () => {
    if (!session || (!inputMessage.trim() && selectedImages.length === 0)) return;

    try {
      // Send user message
      await RealtimeHvacDiagnosticService.sendMessage(session.id, 'tech', {
        text: inputMessage,
        type: 'text',
        images: selectedImages.length > 0 ? selectedImages : undefined
      });

      setInputMessage('');
      setSelectedImages([]);

      // Reload messages to show user message immediately
      const updatedMessages = await RealtimeHvacDiagnosticService.getSessionMessages(session.id);
      setMessages(updatedMessages);

      // Get Ki response
      setIsAnalyzing(true);
      await RealtimeHvacDiagnosticService.analyzeCurrentState(equipmentId, session.id);
      
      // Reload messages again to show Ki response
      const finalMessages = await RealtimeHvacDiagnosticService.getSessionMessages(session.id);
      setMessages(finalMessages);
      setIsAnalyzing(false);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setIsAnalyzing(false);
    }
  };

  // Handle Enter key in textarea
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Generate demo data periodically (only for specific equipment)
  useEffect(() => {
    if (!isConnected || isGeneralMode) return;

    const interval = setInterval(async () => {
      try {
        await RealtimeHvacDiagnosticService.generateDemoLiveData(equipmentId);
      } catch (error) {
        console.error('Error generating demo data:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [equipmentId, isConnected, isGeneralMode]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500/20 text-red-700 border-red-200';
      case 'warning': return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
      default: return 'bg-green-500/20 text-green-700 border-green-200';
    }
  };

  return (
    <div className={`grid grid-cols-1 ${isGeneralMode ? '' : 'lg:grid-cols-2'} gap-6`}>
      {/* Live Data Panel - Hidden in general mode */}
      {!isGeneralMode && (
        <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle>Live Data - {equipmentName}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-500/20 text-gray-700">
                Disconnected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {Object.entries(livePoints).map(([key, point]) => (
                <div key={key} className={`p-3 rounded-lg border ${getStatusColor(point.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(point.status)}
                      <span className="font-medium">{point.name}</span>
                    </div>
                    <Badge variant="outline">
                      {point.value.toFixed(1)} {point.unit}
                    </Badge>
                  </div>
                  {point.threshold_warning && (
                    <div className="text-xs text-muted-foreground">
                      Warning: {point.threshold_warning} {point.unit} | 
                      Critical: {point.threshold_critical} {point.unit}
                    </div>
                  )}
                </div>
              ))}
              
              {Object.keys(livePoints).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Waiting for live data...</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      )}

      {/* Diagnostic Chat Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle>
              {isGeneralMode ? 'Ki - HVAC Assistant' : 'Ki Diagnostic Assistant'}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {!session ? (
              <Button onClick={startSession} size="sm">
                Start Session
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => endSession(true)} size="sm" variant="outline">
                  Mark Resolved
                </Button>
                <Button onClick={() => endSession(false)} size="sm" variant="outline">
                  End Session
                </Button>
              </div>
            )}
            {onClose && (
              <Button onClick={onClose} size="sm" variant="ghost">
                Close
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.sender === 'tech'
                          ? 'bg-blue-500/10 ml-8'
                          : 'bg-gray-500/10 mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {message.sender === 'tech' ? 'You' : 'Ki Assistant'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        {message.body.text}
                      </div>
                      {message.body.images && message.body.images.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.body.images.map((image, idx) => (
                            <img
                              key={idx}
                              src={image}
                              alt={`Uploaded ${idx + 1}`}
                              className="h-24 w-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(image, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                      {message.body.type === 'analysis' && message.body.data && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Status: {message.body.data.overallStatus} | 
                          Confidence: {(message.body.data.confidence * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isAnalyzing && (
                    <div className="p-3 rounded-lg bg-gray-500/10 mr-8 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Ki is analyzing...</span>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="space-y-2">
                {/* Image previews */}
                {selectedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
                    {selectedImages.map((image, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={image}
                          alt={`Preview ${idx + 1}`}
                          className="h-16 w-16 object-cover rounded border"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message input */}
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing || isUploadingImage || selectedImages.length >= 5}
                    size="icon"
                    variant="outline"
                    type="button"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      isGeneralMode 
                        ? "Describe your HVAC issue or what you're seeing at the unit..."
                        : "Ask about the equipment condition, report an issue, or request analysis..."
                    }
                    className="flex-1 min-h-[40px] resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={(!inputMessage.trim() && selectedImages.length === 0) || isAnalyzing}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>
                {isGeneralMode 
                  ? "Start a session to chat with Ki"
                  : "Start a diagnostic session to chat with Ki Assistant"
                }
              </p>
              <p className="text-sm mt-1">
                {isGeneralMode
                  ? "20 years of hands-on HVAC field experience at your fingertips"
                  : "Get real-time analysis and recommendations"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
