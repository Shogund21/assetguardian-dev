import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Calendar } from "lucide-react";
import { format } from "date-fns";

interface RateLimitOverride {
  id: string;
  identifier: string;
  identifier_type: string;
  override_type: string;
  custom_message_limit?: number;
  custom_token_limit?: number;
  custom_cost_limit?: number;
  expires_at?: string;
  reason?: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

const RateLimitOverrides = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<RateLimitOverride | null>(null);
  const [formData, setFormData] = useState({
    identifier: "",
    identifier_type: "ip",
    override_type: "unlimited",
    custom_message_limit: "",
    custom_token_limit: "",
    custom_cost_limit: "",
    expires_at: "",
    reason: ""
  });

  const queryClient = useQueryClient();

  const { data: overrides, isLoading } = useQuery({
    queryKey: ["rate-limit-overrides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_limit_overrides")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as RateLimitOverride[];
    }
  });

  const createOverrideMutation = useMutation({
    mutationFn: async (override: any) => {
      const { data, error } = await supabase
        .from("rate_limit_overrides")
        .insert(override)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rate-limit-overrides"] });
      toast.success("Rate limit override created successfully");
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create override: ${error.message}`);
    }
  });

  const updateOverrideMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("rate_limit_overrides")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rate-limit-overrides"] });
      toast.success("Rate limit override updated successfully");
      resetForm();
      setEditingOverride(null);
    },
    onError: (error) => {
      toast.error(`Failed to update override: ${error.message}`);
    }
  });

  const deleteOverrideMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("rate_limit_overrides")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rate-limit-overrides"] });
      toast.success("Rate limit override deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete override: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      identifier: "",
      identifier_type: "ip",
      override_type: "unlimited",
      custom_message_limit: "",
      custom_token_limit: "",
      custom_cost_limit: "",
      expires_at: "",
      reason: ""
    });
  };

  const handleSubmit = () => {
    if (!formData.identifier.trim()) {
      toast.error("Identifier is required");
      return;
    }

    const overrideData = {
      identifier: formData.identifier.trim(),
      identifier_type: formData.identifier_type,
      override_type: formData.override_type,
      custom_message_limit: formData.custom_message_limit ? parseInt(formData.custom_message_limit) : null,
      custom_token_limit: formData.custom_token_limit ? parseInt(formData.custom_token_limit) : null,
      custom_cost_limit: formData.custom_cost_limit ? parseFloat(formData.custom_cost_limit) : null,
      expires_at: formData.expires_at || null,
      reason: formData.reason || null,
      is_active: true
    };

    if (editingOverride) {
      updateOverrideMutation.mutate({ id: editingOverride.id, updates: overrideData });
    } else {
      createOverrideMutation.mutate(overrideData);
    }
  };

  const handleEdit = (override: RateLimitOverride) => {
    setEditingOverride(override);
    setFormData({
      identifier: override.identifier,
      identifier_type: override.identifier_type,
      override_type: override.override_type,
      custom_message_limit: override.custom_message_limit?.toString() || "",
      custom_token_limit: override.custom_token_limit?.toString() || "",
      custom_cost_limit: override.custom_cost_limit?.toString() || "",
      expires_at: override.expires_at ? format(new Date(override.expires_at), "yyyy-MM-dd'T'HH:mm") : "",
      reason: override.reason || ""
    });
  };

  const getOverrideTypeColor = (type: string) => {
    switch (type) {
      case "unlimited": return "bg-green-100 text-green-800";
      case "extended": return "bg-blue-100 text-blue-800";
      case "custom": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIdentifierTypeColor = (type: string) => {
    switch (type) {
      case "ip": return "bg-orange-100 text-orange-800";
      case "user": return "bg-cyan-100 text-cyan-800";
      case "session": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Active Overrides</h3>
          <p className="text-sm text-muted-foreground">
            Manage rate limit exceptions for specific users, IPs, or sessions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen || !!editingOverride} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingOverride(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Override
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingOverride ? "Edit Override" : "Create Rate Limit Override"}
              </DialogTitle>
              <DialogDescription>
                Grant special rate limit permissions to a specific identifier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="identifier">Identifier</Label>
                <Input
                  id="identifier"
                  placeholder="IP address, email, or session ID"
                  value={formData.identifier}
                  onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="identifier_type">Identifier Type</Label>
                <Select
                  value={formData.identifier_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, identifier_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ip">IP Address</SelectItem>
                    <SelectItem value="user">User Email</SelectItem>
                    <SelectItem value="session">Session ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="override_type">Override Type</Label>
                <Select
                  value={formData.override_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, override_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                    <SelectItem value="extended">Extended (2x limits)</SelectItem>
                    <SelectItem value="custom">Custom Limits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.override_type === "custom" && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="custom_message_limit">Custom Message Limit</Label>
                    <Input
                      id="custom_message_limit"
                      type="number"
                      placeholder="e.g., 100"
                      value={formData.custom_message_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_message_limit: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom_token_limit">Custom Token Limit</Label>
                    <Input
                      id="custom_token_limit"
                      type="number"
                      placeholder="e.g., 50000"
                      value={formData.custom_token_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_token_limit: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom_cost_limit">Custom Cost Limit ($)</Label>
                    <Input
                      id="custom_cost_limit"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 50.00"
                      value={formData.custom_cost_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_cost_limit: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="expires_at">Expires At (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Why is this override needed?"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingOverride(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingOverride ? "Update" : "Create"} Override
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading overrides...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identifier</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Override</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overrides?.map((override) => (
              <TableRow key={override.id}>
                <TableCell className="font-mono text-sm">
                  {override.identifier}
                </TableCell>
                <TableCell>
                  <Badge className={getIdentifierTypeColor(override.identifier_type)}>
                    {override.identifier_type.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getOverrideTypeColor(override.override_type)}>
                    {override.override_type}
                  </Badge>
                  {override.override_type === "custom" && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {override.custom_message_limit && `Msgs: ${override.custom_message_limit}`}
                      {override.custom_token_limit && ` | Tokens: ${override.custom_token_limit}`}
                      {override.custom_cost_limit && ` | Cost: $${override.custom_cost_limit}`}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {override.expires_at ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(override.expires_at), "MMM d, yyyy HH:mm")}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Never</span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {override.reason || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(override)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteOverrideMutation.mutate(override.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!overrides?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No rate limit overrides configured
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default RateLimitOverrides;