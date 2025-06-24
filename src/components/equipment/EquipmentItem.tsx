
import { Equipment } from "@/types/equipment";
import { StatusDropdown } from "./StatusDropdown";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EquipmentItemProps {
  equipment: Equipment;
}

export const EquipmentItem = ({ equipment }: EquipmentItemProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("equipment")
        .update({ status: newStatus })
        .eq("id", equipment.id);

      if (error) throw error;

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["equipment"] });

      toast({
        title: "Status updated",
        description: `Equipment status has been updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update equipment status",
      });
    }
  };

  return (
    <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{equipment.name}</h3>
          <p className="text-sm text-muted-foreground">Model: {equipment.model}</p>
        </div>
        <StatusDropdown 
          status={equipment.status} 
          onStatusChange={handleStatusChange}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm">
          <span className="font-medium">Serial Number:</span> {equipment.serial_number}
        </p>
        <p className="text-sm">
          <span className="font-medium">Location:</span> {equipment.location}
        </p>
      </div>
    </div>
  );
};
