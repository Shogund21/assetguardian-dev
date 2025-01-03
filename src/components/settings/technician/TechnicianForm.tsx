import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

interface TechnicianFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
}

interface TechnicianFormProps {
  formData: TechnicianFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const TechnicianForm = ({ formData, onInputChange, onSubmit }: TechnicianFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={onInputChange}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={onInputChange}
            required
          />
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full sm:w-auto bg-blue-500 text-black hover:bg-blue-600"
      >
        <UserPlus className="mr-2" />
        Add Technician
      </Button>
    </form>
  );
};

export default TechnicianForm;