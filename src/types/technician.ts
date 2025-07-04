export interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  isAvailable?: boolean;
  userRole?: string;
  isAdmin?: boolean;
  company_id?: string;
  company_name?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}