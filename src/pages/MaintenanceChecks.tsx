
import Layout from "@/components/Layout";
import MaintenanceCheckFormRefactored from "@/components/maintenance/MaintenanceCheckFormRefactored";
import MaintenanceHistory from "@/components/maintenance/MaintenanceHistory";
import DocumentManager from "@/components/maintenance/documents/DocumentManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import FormSection from "@/components/maintenance/form/FormSection";
import { useAuth } from "@/hooks/useAuth";

const MaintenanceChecks = () => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("history");
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Show form when switching to form tab
    if (value === "form") {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  };

  const handleNewCheck = () => {
    setShowForm(true);
    setActiveTab("form");
  };

  const handleFormComplete = () => {
    setShowForm(false);
    setActiveTab("history");
  };

  if (!mounted || isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access maintenance checks.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 animate-fade-in pb-16">
        <div className={`flex flex-col ${isMobile ? 'gap-3' : 'md:flex-row'} justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-lg shadow-sm`}>
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600`}>
              HVAC Maintenance Checks
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Daily preventative maintenance checks for chillers and air handlers
            </p>
          </div>
          
          <Button 
            onClick={handleNewCheck}
            className={`${isMobile ? 'w-full py-2 text-sm' : ''} bg-blue-900 hover:bg-blue-800 text-white shadow transition-all duration-200`}
            size={isMobile ? "default" : "lg"}
          >
            <Plus className={`${isMobile ? 'mr-1 h-4 w-4' : 'mr-2 h-5 w-5'}`} /> New Check
          </Button>
        </div>

        <Tabs 
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className={`w-full grid ${isMobile ? 'grid-cols-3 h-auto' : 'grid-cols-3'}`}>
            <TabsTrigger 
              value="history" 
              className={`flex-1 ${isMobile ? 'text-xs px-2 py-2' : 'text-sm'}`}
            >
              {isMobile ? 'History' : 'Maintenance History'}
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className={`flex-1 ${isMobile ? 'text-xs px-2 py-2' : 'text-sm'}`}
            >
              {isMobile ? 'Docs' : 'Documents Repository'}
            </TabsTrigger>
            <TabsTrigger 
              value="form" 
              className={`flex-1 ${isMobile ? 'text-xs px-2 py-2' : 'text-sm'}`}
            >
              New Check
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <MaintenanceHistory />
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <FormSection noPadding>
                <DocumentManager isRepositoryView={true} />
              </FormSection>
            </div>
          </TabsContent>

          <TabsContent value="form" className="mt-4">
            <div className="bg-white rounded-lg shadow-sm p-4 animate-fade-in">
              <MaintenanceCheckFormRefactored onComplete={handleFormComplete} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MaintenanceChecks;
