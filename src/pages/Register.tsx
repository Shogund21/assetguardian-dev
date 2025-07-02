import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  companyId: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    companyId: "",
  });

  // Fetch companies for selection
  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if email already exists
      const { data: existingTechnician } = await supabase
        .from("technicians")
        .select("email")
        .eq("email", formData.email)
        .single();

      if (existingTechnician) {
        toast({
          title: "Email already registered",
          description: "This email is already associated with an account.",
          variant: "destructive",
        });
        return;
      }

      // Create technician record with pending status
      const { data: technician, error: techError } = await supabase
        .from("technicians")
        .insert([{
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          company_id: formData.companyId,
          status: 'pending',
          user_role: 'technician'
        }])
        .select()
        .single();

      if (techError) throw techError;

      toast({
        title: "Registration Successful",
        description: "Your account has been created and is pending approval. You'll receive an email once approved.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error creating your account.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
              alt="Asset Guardian Logo" 
              className="h-12 w-12" 
            />
          </div>
          <CardTitle className="text-2xl font-bold">Join Asset Guardian</CardTitle>
          <CardDescription>
            Create your account to get started with our facilities management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Select value={formData.specialization} onValueChange={(value) => handleInputChange("specialization", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HVAC">HVAC Systems</SelectItem>
                  <SelectItem value="Electrical">Electrical Systems</SelectItem>
                  <SelectItem value="Plumbing">Plumbing & Water Systems</SelectItem>
                  <SelectItem value="General">General Maintenance</SelectItem>
                  <SelectItem value="Security">Security Systems</SelectItem>
                  <SelectItem value="Fire Safety">Fire Safety Systems</SelectItem>
                  <SelectItem value="Building Automation">Building Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Select value={formData.companyId} onValueChange={(value) => handleInputChange("companyId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your company" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/" className="font-medium text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;