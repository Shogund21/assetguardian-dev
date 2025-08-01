
import { useEffect, useState, useMemo } from "react";
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
import { getDefaultFilterSpec } from "../maintenance/form/integration/filterEquipmentMapper";
import LocationSelect from "../equipment/LocationSelect";
import EquipmentSelect from "../maintenance/form/selectors/EquipmentSelect";

interface FilterChangeFormDialogProps {
  filterChange?: FilterChange;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId?: string;
  onComplete?: () => void;
  maintenanceTriggered?: boolean;
}

const FilterChangeFormDialog = ({
  filterChange,
  open,
  onOpenChange,
  equipmentId,
  onComplete,
  maintenanceTriggered = false,
}: FilterChangeFormDialogProps) => {
  const isEditing = !!filterChange;
  const { create, update } = useFilterChangeMutations();
  
  // Track form initialization and user modifications
  const [formInitialized, setFormInitialized] = useState(false);
  const [userModified, setUserModified] = useState(false);

  // Get equipment details for pre-filling filter specs
  const { data: selectedEquipment } = useQuery({
    queryKey: ['equipment', equipmentId],
    queryFn: async () => {
      if (!equipmentId) return null;
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', equipmentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!equipmentId,
  });

  // Get default filter specs based on equipment (memoized to prevent unnecessary resets)
  const defaultFilterSpec = useMemo(() => 
    selectedEquipment 
      ? getDefaultFilterSpec(selectedEquipment.type, selectedEquipment.name)
      : { type: 'MERV-13', size: '20x25x2' }
  , [selectedEquipment]);

  const form = useForm<FilterChangeFormValues>({
    defaultValues: {
      equipment_id: equipmentId || filterChange?.equipment_id || "",
      location_id: filterChange?.location_id || "",
      filter_type: filterChange?.filter_type || defaultFilterSpec.type,
      filter_size: filterChange?.filter_size || defaultFilterSpec.size,
      installation_date: filterChange?.installation_date ? new Date(filterChange.installation_date) : new Date(),
      due_date: filterChange?.due_date ? new Date(filterChange.due_date) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      technician_id: filterChange?.technician_id || null,
      status: filterChange?.status || "active",
      filter_condition: filterChange?.filter_condition || (maintenanceTriggered ? "New" : null),
      notes: filterChange?.notes || (maintenanceTriggered ? "Created from maintenance check" : null),
    },
  });

  // Watch the location_id for EquipmentSelect
  const selectedLocationId = form.watch('location_id');

  // Reset form only when necessary (initial open or changing records)
  useEffect(() => {
    if (open && (!formInitialized || !userModified)) {
      const currentValues = form.getValues();
      const resetValues = {
        equipment_id: equipmentId || filterChange?.equipment_id || "",
        location_id: filterChange?.location_id || (userModified ? currentValues.location_id : ""),
        filter_type: filterChange?.filter_type || defaultFilterSpec.type,
        filter_size: filterChange?.filter_size || defaultFilterSpec.size,
        installation_date: filterChange?.installation_date ? new Date(filterChange.installation_date) : new Date(),
        due_date: filterChange?.due_date ? new Date(filterChange.due_date) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        technician_id: filterChange?.technician_id || null,
        status: filterChange?.status || "active",
        filter_condition: filterChange?.filter_condition || (maintenanceTriggered ? "New" : null),
        notes: filterChange?.notes || (maintenanceTriggered ? "Created from maintenance check" : null),
      };
      
      console.log("FilterChangeFormDialog: Resetting form with values:", resetValues);
      form.reset(resetValues);
      setFormInitialized(true);
    }
    
    // Reset states when dialog closes
    if (!open) {
      setFormInitialized(false);
      setUserModified(false);
    }
  }, [filterChange?.id, equipmentId, open, formInitialized, userModified]);

  // Track when user modifies the form
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (formInitialized && name && (name === 'location_id' || name === 'equipment_id')) {
        setUserModified(true);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, formInitialized]);

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
    console.log("FilterChangeFormDialog: Submitting form with values:", values);
    try {
      if (isEditing && filterChange) {
        console.log("FilterChangeFormDialog: Updating existing filter change:", filterChange.id);
        await update.mutateAsync({
          id: filterChange.id,
          values
        });
      } else {
        console.log("FilterChangeFormDialog: Creating new filter change");
        await create.mutateAsync(values);
      }
      onOpenChange(false);
      onComplete?.();
    } catch (error) {
      console.error("Error saving filter change:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {maintenanceTriggered 
              ? "Create Filter Change Record"
              : isEditing 
                ? "Edit Filter Change" 
                : "Add Filter Change"
            }
          </DialogTitle>
          {maintenanceTriggered && (
            <p className="text-sm text-blue-600">
              Pre-filled based on your maintenance check
            </p>
          )}
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <LocationSelect form={form} />

            <EquipmentSelect 
              form={form} 
              locationId={selectedLocationId || ""} 
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <PopoverContent 
                        className="w-auto p-0 z-40 bg-background border shadow-lg" 
                        align="start" 
                        side="top" 
                        sideOffset={4}
                        avoidCollisions={true}
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            form.setValue('installation_date', date);
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto bg-background rounded-md"
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
                      <PopoverContent 
                        className="w-auto p-0 z-40 bg-background border shadow-lg" 
                        align="start" 
                        side="top" 
                        sideOffset={4}
                        avoidCollisions={true}
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            form.setValue('due_date', date);
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto bg-background rounded-md"
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
                    <SelectContent className="z-50 bg-background">
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
                      <SelectContent className="z-50 bg-background">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterChangeFormDialog;
