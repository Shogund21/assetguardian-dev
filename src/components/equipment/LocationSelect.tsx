
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LocationSelectProps {
  form: UseFormReturn<any>;
}

const LocationSelect = ({ form }: LocationSelectProps) => {
  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <FormField
      control={form.control}
      name="location_id"
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-base font-semibold">Location</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || ""}
            defaultValue={field.value || ""}
          >
            <FormControl>
              <SelectTrigger className="w-full bg-white border-gray-200 h-12">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[300px] overflow-y-auto bg-white">
              {isLoading ? (
                <SelectItem value="loading" disabled className="py-3 text-sm">
                  Loading locations...
                </SelectItem>
              ) : locations && locations.length > 0 ? (
                locations.map((location) => (
                  <SelectItem 
                    key={location.id} 
                    value={location.id}
                    className="py-3 text-sm cursor-pointer hover:bg-gray-100"
                  >
                    {location.name} - {location.store_number}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-locations" disabled className="py-3 text-sm">
                  No locations available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LocationSelect;
