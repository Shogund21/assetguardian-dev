
import React from "react";
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface NotesFieldsProps {
  control: Control<any>;
}

export const NotesFields = ({ control }: NotesFieldsProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
      <div className="text-gray-800 font-bold mb-4">📝 NOTES SECTION</div>
      
      <div className="space-y-4">
        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-base font-bold text-gray-900">Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional observations" 
                  className="min-h-[80px] touch-manipulation text-base bg-white border-2 border-gray-400 resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="location_notes"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-base font-bold text-gray-900">Location Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Notes about location" 
                  className="min-h-[80px] touch-manipulation text-base bg-white border-2 border-gray-400 resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
