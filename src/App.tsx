
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CompanyProvider } from "@/contexts/CompanyContext";
import PageTransition from "@/components/PageTransition";

import Index from "./pages/Index";
import Equipment from "./pages/Equipment";
import EquipmentDetails from "./pages/EquipmentDetails";
import AddEquipment from "./pages/AddEquipment";
import Projects from "./pages/Projects";
import MaintenanceChecks from "./pages/MaintenanceChecks";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import CustomerManual from "./pages/CustomerManual";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CompanyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <PageTransition>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/equipment" element={<Equipment />} />
                <Route path="/equipment/:id" element={<EquipmentDetails />} />
                <Route path="/add-equipment" element={<AddEquipment />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/maintenance-checks" element={<MaintenanceChecks />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/customer-manual" element={<CustomerManual />} />
              </Routes>
            </PageTransition>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </CompanyProvider>
  </QueryClientProvider>
);

export default App;
