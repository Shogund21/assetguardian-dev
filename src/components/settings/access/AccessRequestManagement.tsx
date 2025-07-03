import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuditService } from "@/services/auditService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, User, Mail, Phone, Building } from "lucide-react";

interface AccessRequest {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

const AccessRequestManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accessRequests, isLoading } = useQuery({
    queryKey: ["access-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_requests")
        .select("*")
        .order("requested_at", { ascending: false });
      
      if (error) throw error;
      return data as AccessRequest[];
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, createTechnician }: { 
      id: string; 
      status: 'approved' | 'denied'; 
      createTechnician?: AccessRequest 
    }) => {
      // Update the access request
      const { error: updateError } = await supabase
        .from("access_requests")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: "edward@shogunai.com"
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // If approved, create technician record
      if (status === 'approved' && createTechnician) {
        const { data: technician, error: techError } = await supabase
          .from("technicians")
          .insert([{
            firstName: createTechnician.first_name,
            lastName: createTechnician.last_name,
            email: createTechnician.email,
            phone: createTechnician.phone || '',
            specialization: 'General',
            user_role: 'technician'
          }])
          .select()
          .single();

        if (techError) throw techError;

        // Update their role using the function
        const { error: roleError } = await supabase.rpc('update_technician_role', {
          p_technician_id: technician.id,
          p_new_role: 'technician',
          p_is_admin: false
        });

        if (roleError) throw roleError;

        // Log the action for audit
        await AuditService.logCreate('technicians', technician.id, technician, `Access request approved and technician created for ${createTechnician.email}`);
      }

      // Log the access request decision
      await AuditService.logUpdate('access_requests', id, {}, { status }, `Access request ${status} for ${createTechnician?.email}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      toast({
        title: "Success",
        description: `Access request ${variables.status === 'approved' ? 'approved and technician created' : 'denied'} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update access request: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (request: AccessRequest) => {
    updateRequestMutation.mutate({ 
      id: request.id, 
      status: 'approved', 
      createTechnician: request 
    });
  };

  const handleDeny = (request: AccessRequest) => {
    updateRequestMutation.mutate({ 
      id: request.id, 
      status: 'denied' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'default';
      case 'denied': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'denied': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading access requests...</div>;
  }

  const pendingRequests = accessRequests?.filter(req => req.status === 'pending') || [];
  const reviewedRequests = accessRequests?.filter(req => req.status !== 'pending') || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Access Request Management</h2>
        <p className="text-muted-foreground">Review and approve access requests to the platform</p>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pending Requests ({pendingRequests.length})</h3>
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No pending access requests</p>
            </CardContent>
          </Card>
        ) : (
          pendingRequests.map((request) => (
            <Card key={request.id} className="border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {request.first_name} {request.last_name}
                  </CardTitle>
                  <Badge variant={getStatusColor(request.status)} className="flex items-center gap-1">
                    {getStatusIcon(request.status)}
                    {request.status}
                  </Badge>
                </div>
                <CardDescription>
                  Requested on {new Date(request.requested_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{request.email}</span>
                  </div>
                  {request.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{request.phone}</span>
                    </div>
                  )}
                  {request.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{request.company}</span>
                    </div>
                  )}
                </div>
                
                {request.reason && (
                  <div>
                    <h4 className="font-medium mb-2">Reason for Access:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {request.reason}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApprove(request)}
                    disabled={updateRequestMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve & Create Technician
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeny(request)}
                    disabled={updateRequestMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Deny Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reviewed Requests */}
      {reviewedRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Reviewed Requests ({reviewedRequests.length})</h3>
          {reviewedRequests.map((request) => (
            <Card key={request.id} className="opacity-75">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {request.first_name} {request.last_name}
                  </CardTitle>
                  <Badge variant={getStatusColor(request.status)} className="flex items-center gap-1">
                    {getStatusIcon(request.status)}
                    {request.status}
                  </Badge>
                </div>
                <CardDescription>
                  Requested on {new Date(request.requested_at).toLocaleDateString()}
                  {request.reviewed_at && (
                    <span> • Reviewed on {new Date(request.reviewed_at).toLocaleDateString()}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{request.email}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccessRequestManagement;