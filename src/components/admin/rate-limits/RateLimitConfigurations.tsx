import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, RefreshCw } from "lucide-react";

interface RateLimitConfig {
  id: string;
  config_name: string;
  messages_per_session: number;
  messages_per_day: number;
  tokens_per_session: number;
  tokens_per_day: number;
  cost_per_session_usd: number;
  cost_per_day_usd: number;
  throttle_delay_ms: number;
  progressive_throttle: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const RateLimitConfigurations = () => {
  const [config, setConfig] = useState<Partial<RateLimitConfig>>({});
  const [isEditing, setIsEditing] = useState(false);

  const queryClient = useQueryClient();

  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ["rate-limit-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_limit_configs")
        .select("*")
        .eq("is_active", true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as RateLimitConfig | null;
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<RateLimitConfig>) => {
      if (currentConfig) {
        // Update existing config
        const { data, error } = await supabase
          .from("rate_limit_configs")
          .update(updates)
          .eq("id", currentConfig.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new config
        const { data, error } = await supabase
          .from("rate_limit_configs")
          .insert({
            config_name: "default",
            is_active: true,
            ...updates
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rate-limit-config"] });
      toast.success("Rate limit configuration updated successfully");
      setIsEditing(false);
      setConfig({});
    },
    onError: (error) => {
      toast.error(`Failed to update configuration: ${error.message}`);
    }
  });

  const handleEdit = () => {
    if (currentConfig) {
      setConfig({
        messages_per_session: currentConfig.messages_per_session,
        messages_per_day: currentConfig.messages_per_day,
        tokens_per_session: currentConfig.tokens_per_session,
        tokens_per_day: currentConfig.tokens_per_day,
        cost_per_session_usd: currentConfig.cost_per_session_usd,
        cost_per_day_usd: currentConfig.cost_per_day_usd,
        throttle_delay_ms: currentConfig.throttle_delay_ms,
        progressive_throttle: currentConfig.progressive_throttle
      });
    } else {
      setConfig({
        messages_per_session: 20,
        messages_per_day: 50,
        tokens_per_session: 10000,
        tokens_per_day: 50000,
        cost_per_session_usd: 5.00,
        cost_per_day_usd: 25.00,
        throttle_delay_ms: 2000,
        progressive_throttle: true
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!config.messages_per_session || !config.messages_per_day) {
      toast.error("Message limits are required");
      return;
    }

    updateConfigMutation.mutate(config);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setConfig({});
  };

  const resetToDefaults = () => {
    setConfig({
      messages_per_session: 20,
      messages_per_day: 50,
      tokens_per_session: 10000,
      tokens_per_day: 50000,
      cost_per_session_usd: 5.00,
      cost_per_day_usd: 25.00,
      throttle_delay_ms: 2000,
      progressive_throttle: true
    });
  };

  if (isLoading) {
    return <div>Loading configuration...</div>;
  }

  const displayConfig = isEditing ? config : currentConfig;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Rate Limit Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure global rate limiting thresholds and behavior
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={resetToDefaults}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateConfigMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              Edit Configuration
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Message Limits
              {currentConfig && (
                <Badge variant="secondary">Active</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Control the number of messages users can send
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="messages_per_session">Messages per Session</Label>
              <Input
                id="messages_per_session"
                type="number"
                value={displayConfig?.messages_per_session || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, messages_per_session: parseInt(e.target.value) }))}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum messages in a single chat session
              </p>
            </div>
            <div>
              <Label htmlFor="messages_per_day">Messages per Day</Label>
              <Input
                id="messages_per_day"
                type="number"
                value={displayConfig?.messages_per_day || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, messages_per_day: parseInt(e.target.value) }))}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum messages per IP address per day
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Limits</CardTitle>
            <CardDescription>
              Control API token usage to manage costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tokens_per_session">Tokens per Session</Label>
              <Input
                id="tokens_per_session"
                type="number"
                value={displayConfig?.tokens_per_session || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, tokens_per_session: parseInt(e.target.value) }))}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum tokens per chat session
              </p>
            </div>
            <div>
              <Label htmlFor="tokens_per_day">Tokens per Day</Label>
              <Input
                id="tokens_per_day"
                type="number"
                value={displayConfig?.tokens_per_day || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, tokens_per_day: parseInt(e.target.value) }))}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum tokens per IP address per day
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Limits</CardTitle>
            <CardDescription>
              Set monetary limits to control API costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cost_per_session_usd">Cost per Session ($)</Label>
              <Input
                id="cost_per_session_usd"
                type="number"
                step="0.01"
                value={displayConfig?.cost_per_session_usd || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, cost_per_session_usd: parseFloat(e.target.value) }))}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum cost per chat session
              </p>
            </div>
            <div>
              <Label htmlFor="cost_per_day_usd">Cost per Day ($)</Label>
              <Input
                id="cost_per_day_usd"
                type="number"
                step="0.01"
                value={displayConfig?.cost_per_day_usd || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, cost_per_day_usd: parseFloat(e.target.value) }))}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum cost per IP address per day
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Throttling Settings</CardTitle>
            <CardDescription>
              Configure message throttling behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="throttle_delay_ms">Throttle Delay (ms)</Label>
              <Input
                id="throttle_delay_ms"
                type="number"
                value={displayConfig?.throttle_delay_ms || ""}
                onChange={(e) => setConfig(prev => ({ ...prev, throttle_delay_ms: parseInt(e.target.value) }))}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Base delay between messages
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="progressive_throttle"
                checked={displayConfig?.progressive_throttle || false}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, progressive_throttle: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="progressive_throttle">Progressive Throttling</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Increase delay for rapid successive messages
            </p>
          </CardContent>
        </Card>
      </div>

      {currentConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>Created: {new Date(currentConfig.created_at).toLocaleString()}</p>
              <p>Last Updated: {new Date(currentConfig.updated_at).toLocaleString()}</p>
              <p>Configuration Name: {currentConfig.config_name}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RateLimitConfigurations;