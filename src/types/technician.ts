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
  account_status?: 'no_account' | 'has_account' | 'account_disabled';
  user_id?: string;
  createdAt?: string;
  updatedAt?: string;
}