
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Equipment } from "@/types/equipment";
import { EquipmentFormSchema, EquipmentFormValues } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pen } from "lucide-react";

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
      onClick={() => setOpen(true)}
    >
      <Pen className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton}
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
                  <FormLabel>Equipment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., AHU-1, Elevator B" {...field} />
                  </FormControl>
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
