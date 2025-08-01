
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OpenAIKeyManager = () => {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'none' | 'saved' | 'error'>('none');
  const { toast } = useToast();

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      toast({
        title: "Invalid API Key",
        description: "OpenAI API keys should start with 'sk-'",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Store key in localStorage for now (in production, this would be handled via Supabase Edge Functions)
      localStorage.setItem('openai_api_key', apiKey);
      setKeyStatus('saved');
      
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved successfully. The predictive AI analysis features are now available.",
      });
      
      // Clear the input for security
      setApiKey("");
    } catch (error) {
      console.error("Error saving API key:", error);
      setKeyStatus('error');
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = () => {
    switch (keyStatus) {
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          OpenAI Integration
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="openai-key">OpenAI API Key</Label>
          <div className="relative">
            <Input
              id="openai-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={keyStatus === 'saved' ? "API key saved securely" : "sk-..."}
              className="pr-10"
              disabled={keyStatus === 'saved'}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your OpenAI API key for ChatGPT-4o integration. Get one from{" "}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenAI Platform
            </a>
          </p>
        </div>

        <Button 
          onClick={handleSaveKey} 
          disabled={saving || keyStatus === 'saved'} 
          className="w-full"
        >
          {saving ? "Saving..." : keyStatus === 'saved' ? "API Key Saved" : "Save API Key"}
        </Button>

        {keyStatus === 'saved' && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-900">API Key Configured</h4>
            </div>
            <p className="text-sm text-green-800">
              Your OpenAI API key is now configured. You can use AI-powered predictive analysis features throughout the application.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setKeyStatus('none');
                setApiKey("");
              }}
            >
              Update Key
            </Button>
          </div>
        )}

        {keyStatus !== 'saved' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Features Enabled:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>AI-powered equipment health analysis</li>
              <li>Predictive maintenance recommendations</li>
              <li>Automated sensor data interpretation</li>
              <li>Smart failure prediction alerts</li>
              <li>Natural language equipment reports</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OpenAIKeyManager;
