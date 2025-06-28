
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
import { Upload, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo_url || null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

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

  // Phase 3: Authentication check
  const checkAuthentication = (): boolean => {
    console.log("🔐 Authentication check:", { isAuthenticated, user: user?.email });
    
    if (!isAuthenticated || !user) {
      const error = "You must be logged in to perform this action";
      setAuthError(error);
      toast({
        title: "Authentication Required",
        description: error,
        variant: "destructive",
      });
      return false;
    }
    
    setAuthError(null);
    return true;
  };

  const handleLogoUpload = async (file: File): Promise<string | null> => {
    console.log("📤 Starting logo upload process:", { fileName: file.name, fileSize: file.size });
    
    if (!file) {
      console.log("❌ No file provided");
      return null;
    }

    // Phase 3: Check authentication before upload
    if (!checkAuthentication()) {
      console.log("❌ Authentication failed during upload");
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      console.log("📁 Upload details:", { fileExt, fileName, filePath });

      // Test storage bucket access first
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log("🪣 Available buckets:", buckets, "Error:", bucketsError);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file);

      console.log("📤 Upload result:", { data: uploadData, error: uploadError });

      if (uploadError) {
        console.error('❌ Error uploading logo:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      console.log("🔗 Public URL generated:", urlData.publicUrl);

      return urlData.publicUrl;
    } catch (error) {
      console.error("💥 Upload error:", error);
      throw error;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("📁 File selection started");
    setUploadError(null);
    
    const file = e.target.files?.[0];
    if (!file) {
      console.log("❌ No file selected");
      return;
    }

    console.log("📁 File selected:", { name: file.name, size: file.size, type: file.type });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = "Please select an image file";
      setUploadError(error);
      toast({
        title: "Invalid file type",
        description: error,
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const error = "Please select an image smaller than 5MB";
      setUploadError(error);
      toast({
        title: "File too large",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log("🖼️ Preview generated");
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    console.log("🧹 Clearing logo");
    setLogoFile(null);
    setLogoPreview(initialData?.logo_url || null);
    setUploadError(null);
    form.setValue('logo_url', initialData?.logo_url || '');
  };

  const onSubmit = async (values: CompanyFormValues) => {
    console.log("🚀 Form submission started:", values);
    
    // Phase 3: Check authentication before submission
    if (!checkAuthentication()) {
      console.log("❌ Authentication failed during submission");
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      let logoUrl = values.logo_url;

      // Phase 4: Upload new logo if selected with comprehensive logging
      if (logoFile) {
        console.log("📤 Starting logo upload for new file");
        setIsUploadingLogo(true);
        
        try {
          logoUrl = await handleLogoUpload(logoFile);
          console.log("✅ Logo upload successful:", logoUrl);
        } catch (uploadError) {
          console.error("❌ Logo upload failed:", uploadError);
          
          // Phase 5: Fallback strategy - allow saving without logo
          const shouldContinue = confirm(
            "Logo upload failed. Would you like to save the company without the logo?"
          );
          
          if (!shouldContinue) {
            console.log("🚫 User chose not to continue without logo");
            return;
          }
          
          console.log("⚠️ Continuing without logo as fallback");
          logoUrl = initialData?.logo_url || "";
          setUploadError("Logo upload failed, but company will be saved without new logo");
        } finally {
          setIsUploadingLogo(false);
        }
      }

      const companyData = {
        name: values.name,
        contact_email: values.contact_email || null,
        contact_phone: values.contact_phone || null,
        address: values.address || null,
        logo_url: logoUrl || null
      };

      console.log("💾 Saving company data:", companyData);

      if (initialData?.id) {
        // Update existing company
        console.log("🔄 Updating existing company:", initialData.id);
        const { data, error } = await supabase
          .from("companies")
          .update(companyData)
          .eq("id", initialData.id)
          .select();

        console.log("🔄 Update result:", { data, error });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Company updated successfully",
        });
      } else {
        // Insert new company
        console.log("➕ Creating new company");
        const { data, error } = await supabase
          .from("companies")
          .insert(companyData)
          .select();

        console.log("➕ Insert result:", { data, error });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Company added successfully",
        });
      }

      console.log("✅ Company operation completed successfully");
      onSuccess();
    } catch (error) {
      console.error("💥 Error saving company:", error);
      
      // Phase 4: Enhanced error reporting
      let errorMessage = "Failed to save company";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploadingLogo(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Phase 3: Authentication error display */}
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        {/* Phase 5: Upload error display */}
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

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

        <div className="space-y-2">
          <FormLabel>Company Logo</FormLabel>
          
          {logoPreview && (
            <div className="relative inline-block">
              <img 
                src={logoPreview} 
                alt="Logo preview" 
                className="w-20 h-20 object-contain border rounded"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={clearLogo}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="logo-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('logo-upload')?.click()}
              disabled={isUploadingLogo || !isAuthenticated}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {logoFile ? 'Change Logo' : 'Upload Logo'}
            </Button>
            {!isAuthenticated && (
              <span className="text-sm text-red-500">Login required</span>
            )}
          </div>
          
          <p className="text-sm text-gray-500">
            Upload an image file (max 5MB). Supported formats: JPG, PNG, GIF
          </p>
        </div>

        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Or enter logo URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || isUploadingLogo || !isAuthenticated}
            className="bg-blue-900 hover:bg-blue-800 text-white"
          >
            {isSubmitting || isUploadingLogo
              ? isUploadingLogo 
                ? "Uploading..."
                : "Saving..."
              : initialData?.id
              ? "Update Company"
              : "Add Company"
            }
          </Button>
          {!isAuthenticated && (
            <p className="text-sm text-red-500 flex items-center">
              Please log in to save changes
            </p>
          )}
        </div>
      </form>
    </Form>
  );
};
