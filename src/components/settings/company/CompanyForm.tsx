
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  contact_phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  logo_url: z.string().optional().or(z.literal("")),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  initialData?: CompanyFormValues & { id: string };
  onSuccess: () => void;
}

export const CompanyForm = ({ initialData, onSuccess }: CompanyFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: initialData || {
      name: "",
      contact_email: "",
      contact_phone: "",
      address: "",
      logo_url: "",
    },
  });

  const onSubmit = async (values: CompanyFormValues) => {
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        // Update existing company
        const { error } = await supabase
          .from("companies")
          .update(values)
          .eq("id", initialData.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Company updated successfully",
        });
      } else {
        // Insert new company - ensure name is not optional in the actual insert
        const { error } = await supabase
          .from("companies")
          .insert({
            name: values.name, // Explicitly include name to satisfy TS
            contact_email: values.contact_email,
            contact_phone: values.contact_phone,
            address: values.address,
            logo_url: values.logo_url
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Company added successfully",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving company:", error);
      toast({
        title: "Error",
        description: "Failed to save company",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter contact email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Phone</FormLabel>
              <FormControl>
                <Input placeholder="Enter contact phone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter company address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter logo URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-900 hover:bg-blue-800 text-white"
          >
            {isSubmitting
              ? "Saving..."
              : initialData?.id
              ? "Update Company"
              : "Add Company"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};
