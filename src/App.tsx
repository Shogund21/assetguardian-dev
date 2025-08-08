
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CompanyProvider } from "@/contexts/CompanyContext";
import PageTransition from "@/components/PageTransition";
import { useAuditTracker } from "@/hooks/useAuditTracker";

import RootPage from "@/components/RootPage";
import Equipment from "./pages/Equipment";
import EquipmentDetails from "./pages/EquipmentDetails";
import AddEquipment from "./pages/AddEquipment";
import Projects from "./pages/Projects";
import MaintenanceChecks from "./pages/MaintenanceChecks";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import CustomerManual from "./pages/CustomerManual";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import PredictiveMaintenance from "./pages/PredictiveMaintenance";
import FilterChanges from "./pages/FilterChanges";
import PrintView from "./pages/PrintView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const AppContent = () => {
  useAuditTracker(); // Enable automatic audit tracking
  
  return (
    <Routes>
      <Route path="/" element={<RootPage />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Navigate to="/auth" replace />} />
      <Route path="/equipment" element={<Equipment />} />
      <Route path="/equipment/:id" element={<EquipmentDetails />} />
      <Route path="/add-equipment" element={<AddEquipment />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/maintenance-checks" element={<MaintenanceChecks />} />
      <Route path="/filter-changes" element={<FilterChanges />} />
      <Route path="/predictive-maintenance" element={<PredictiveMaintenance />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/customer-manual" element={<CustomerManual />} />
      <Route path="/print-view" element={<PrintView />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CompanyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <PageTransition>
                <AppContent />
              </PageTransition>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </CompanyProvider>
    </QueryClientProvider>
  );
};

export default App;
