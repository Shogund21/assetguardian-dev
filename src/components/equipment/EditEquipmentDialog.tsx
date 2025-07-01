
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Equipment } from "@/types/equipment";
import { EquipmentFormSchema, EquipmentFormValues } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pen } from "lucide-react";
import { EQUIPMENT_TYPES } from "./constants/equipmentTypes";
import { detectEquipmentType } from "@/components/maintenance/form/hooks/utils/equipmentTypeDetection";

interface EditEquipmentDialogProps {
  equipment: Equipment;
  children?: React.ReactNode;
}

export const EditEquipmentDialog = ({ equipment, children }: EditEquipmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(EquipmentFormSchema),
    defaultValues: {
      name: equipment.name,
      model: equipment.model || "",
      serialNumber: equipment.serial_number || "",
      location: equipment.location,
      status: equipment.status || "",
      type: equipment.type || "",
      lastMaintenance: null,
      nextMaintenance: null,
    },
  });

  const onSubmit = async (values: EquipmentFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("equipment")
        .update({
          name: values.name,
          model: values.model,
          serial_number: values.serialNumber,
          location: values.location,
          status: values.status,
          type: values.type,
        })
        .eq("id", equipment.id);
      
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      
      toast({
        title: "Success",
        description: "Equipment updated successfully",
      });
      
      setOpen(false);
    } catch (error) {
      console.error("Error updating equipment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update equipment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerButton = children || (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
    >
      <Pen className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Name/Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Auto-set the type category based on the name
                      const detectedType = detectEquipmentType(value);
                      form.setValue('type', detectedType);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {EQUIPMENT_TYPES.map((type) => (
                        <SelectItem 
                          key={type} 
                          value={type}
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Model number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Serial number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Equipment location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Type Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ahu">AHU (Air Handling Unit)</SelectItem>
                      <SelectItem value="chiller">Chiller</SelectItem>
                      <SelectItem value="rtu">RTU (Rooftop Unit)</SelectItem>
                      <SelectItem value="cooling_tower">Cooling Tower</SelectItem>
                      <SelectItem value="elevator">Elevator</SelectItem>
                      <SelectItem value="restroom">Restroom</SelectItem>
                      <SelectItem value="general">General Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#1EAEDB] hover:bg-[#33C3F0] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : "Update Equipment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
