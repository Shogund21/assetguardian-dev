import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useMaintenanceFormContext } from '../context/MaintenanceFormContext';

const CommentsSection = () => {
  const { form } = useMaintenanceFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Comments & Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add any additional comments, observations, or notes about this maintenance check..."
                className="min-h-[120px] resize-vertical"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="troubleshooting_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Troubleshooting Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Document any troubleshooting steps taken or issues encountered..."
                className="min-h-[100px] resize-vertical"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="corrective_actions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Corrective Actions Taken</FormLabel>
            <FormControl>
              <Textarea
                placeholder="List any corrective actions taken during this maintenance check..."
                className="min-h-[100px] resize-vertical"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="maintenance_recommendations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Future Maintenance Recommendations</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide recommendations for future maintenance or follow-up actions..."
                className="min-h-[100px] resize-vertical"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CommentsSection;