
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { EquipmentItem } from "@/components/equipment/EquipmentItem";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useCompanyFilter } from "@/hooks/useCompanyFilter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const EnhancedEquipmentOverview = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { applyCompanyFilter, isCompanyLoading, hasValidSession, isAuthenticated } = useCompanyFilter();
  
  const { data: equipmentData, isLoading: equipmentLoading } = useQuery({
    queryKey: ['equipment', 'overview'],
    queryFn: async () => {
      console.log('EnhancedEquipmentOverview: Fetching equipment data...');
      
      let query = supabase
        .from('equipment')
        .select('id, name, model, serial_number, location, status, type, company_id, created_at, updated_at');
      
      // Apply company filtering - useCompanyFilter handles super admin logic
      query = applyCompanyFilter(query);
      
      query = query
        .order('location', { ascending: true })
        .order('name');
      
      const { data, error } = await query;
      
      if (error) {
        console.error('EnhancedEquipmentOverview: Error fetching equipment:', error);
        throw error;
      }
      
      console.log('EnhancedEquipmentOverview: Equipment data fetched:', data?.length || 0, 'items');
      return data;
    },
    enabled: isAuthenticated && !isCompanyLoading && hasValidSession,
    retry: 1,
  });

  // Filter equipment based on search and status
  const filteredEquipment = equipmentData?.filter(equipment => {
    const matchesSearch = equipment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || equipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card className="border-none shadow-lg bg-white">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <i className="fas fa-list text-blue-600"></i>
            Equipment Overview
          </CardTitle>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-48"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {equipmentLoading ? (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500">Loading equipment...</p>
              </div>
            </div>
          ) : filteredEquipment && filteredEquipment.length > 0 ? (
            <>
              <div className="grid gap-4">
                {filteredEquipment.slice(0, 3).map((equipment) => (
                  <div key={equipment.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-300">
                    <EquipmentItem equipment={equipment} />
                  </div>
                ))}
              </div>
              
              {filteredEquipment.length > 3 && (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500">
                    Showing 3 of {filteredEquipment.length} equipment items
                  </p>
                </div>
              )}
              
              <Button 
                onClick={() => navigate("/equipment")}
                variant="outline" 
                className="w-full mt-4 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                View All Equipment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <i className="fas fa-search text-gray-300 text-4xl"></i>
              </div>
              <p className="text-gray-500 text-lg">
                {searchTerm || statusFilter !== "all" 
                  ? "No equipment matches your search criteria" 
                  : "No equipment data available"
                }
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="mt-2 text-blue-600"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedEquipmentOverview;
