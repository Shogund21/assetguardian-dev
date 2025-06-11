
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { CompanyList } from "../company/CompanyList";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyForm } from "../company/CompanyForm";
import { useCompany } from "@/contexts/CompanyContext";

export const CompaniesSection = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { refreshCompanies } = useCompany();

  const handleSuccess = () => {
    refreshCompanies();
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl">Company Management</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Add, edit, and manage your companies
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Button 
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white" 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Add Company
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
              </DialogHeader>
              <CompanyForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <CompanyList onSuccess={refreshCompanies} />
        </CardContent>
      </Card>
    </div>
  );
};
