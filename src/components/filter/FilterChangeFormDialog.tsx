
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FilterChange, FilterChangeFormValues } from "@/types/filterChanges";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFilterChangeMutations } from "@/hooks/useFilterChangeMutations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";

interface FilterChangeFormDialogProps {
  filterChange?: FilterChange;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId?: string;
}

const FilterChangeFormDialog = ({
  filterChange,
  open,
  onOpenChange,
  equipmentId,
}: FilterChangeFormDialogProps) => {
  const isEditing = !!filterChange;
  const { create, update } = useFilterChangeMutations();

  const form = useForm<FilterChangeFormValues>({
    defaultValues: {
      equipment_id: equipmentId || filterChange?.equipment_id || "",
      filter_type: filterChange?.filter_type || "",
      filter_size: filterChange?.filter_size || "",
      installation_date: filterChange?.installation_date ? new Date(filterChange.installation_date) : new Date(),
      due_date: filterChange?.due_date ? new Date(filterChange.due_date) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      technician_id: filterChange?.technician_id || null,
      status: filterChange?.status || "active",
      filter_condition: filterChange?.filter_condition || null,
      notes: filterChange?.notes || null,
    },
  });

  // Reset form when filterChange or equipmentId changes
  useEffect(() => {
    if (open) {
      form.reset({
        equipment_id: equipmentId || filterChange?.equipment_id || "",
        filter_type: filterChange?.filter_type || "",
        filter_size: filterChange?.filter_size || "",
        installation_date: filterChange?.installation_date ? new Date(filterChange.installation_date) : new Date(),
        due_date: filterChange?.due_date ? new Date(filterChange.due_date) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        technician_id: filterChange?.technician_id || null,
        status: filterChange?.status || "active",
        filter_condition: filterChange?.filter_condition || null,
        notes: filterChange?.notes || null,
      });
    }
  }, [filterChange, equipmentId, open, form]);

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('id, firstName, lastName')
        .eq('isAvailable', true)
        .order('firstName');
      
      if (error) throw error;
      return data || [];
    },
  });

  const onSubmit = async (values: FilterChangeFormValues) => {
    try {
      if (isEditing && filterChange) {
        await update.mutateAsync({
          id: filterChange.id,
          values
        });
      } else {
        await create.mutateAsync(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving filter change:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Filter Change" : "Add Filter Change"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="equipment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment</FormLabel>
                  <Select 
                    disabled={!!equipmentId}
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {equipment.length > 0 ? (
                        equipment.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-equipment" disabled>
                          No equipment available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="filter_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filter Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MERV-13" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="filter_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filter Size</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 20x25x2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="installation_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Installation Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="technician_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technician</FormLabel>
                  <Select 
                    value={field.value || "unassigned"} 
                    onValueChange={(value) => field.onChange(value === "unassigned" ? null : value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign technician (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Not assigned</SelectItem>
                      {technicians.length > 0 ? (
                        technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.firstName} {tech.lastName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-technicians-available" disabled>
                          No technicians available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="filter_condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filter Condition</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., New, Good, Fair, Poor" 
                      {...field} 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this filter change" 
                      className="h-20"
                      {...field} 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={create.isPending || update.isPending}
                className="bg-[#1EAEDB] hover:bg-[#33C3F0] text-white"
              >
                {(create.isPending || update.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>{isEditing ? "Update" : "Add"} Filter Change</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FilterChangeFormDialog;
