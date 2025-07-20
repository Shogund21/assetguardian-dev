
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { Info } from "lucide-react";

interface AHUFilterAndBeltProps {
  form: UseFormReturn<any>;
}

const AHUFilterAndBelt = ({ form }: AHUFilterAndBeltProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="air_filter_cleaned"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base flex items-center gap-2">
                Air Filter Cleaned
                <div className="group relative">
                  <Info className="h-4 w-4 text-blue-500 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-blue-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                    Checking this will prompt you to create a filter change record
                  </div>
                </div>
              </FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fan_belt_condition"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Fan Belt Condition
              <div className="group relative">
                <Info className="h-4 w-4 text-blue-500 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-blue-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  "Needs Replacement" will prompt you to create a filter change record
                </div>
              </div>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
              </FormControl>
              <SelectContent position="popper" className="bg-white z-[100]">
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default AHUFilterAndBelt;
