
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
import { HelmetProvider } from 'react-helmet-async';

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import DigitalTwin from "./pages/DigitalTwin";
import PrintView from "./pages/PrintView";
import Index from "./pages/Index";
import Features from "./pages/Features";
import AIvsTraditional from "./pages/AIvsTraditional";
import UseCases from "./pages/UseCases";
import About from "./pages/About";

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
      {/* Public routes */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/features" element={<Features />} />
      <Route path="/ai-vs-traditional" element={<AIvsTraditional />} />
      <Route path="/use-cases" element={<UseCases />} />
      <Route path="/about" element={<About />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Navigate to="/auth" replace />} />
      
      {/* Protected routes */}
      <Route path="/" element={<RootPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/equipment" element={
        <ProtectedRoute>
          <Equipment />
        </ProtectedRoute>
      } />
      <Route path="/equipment/:id" element={
        <ProtectedRoute>
          <EquipmentDetails />
        </ProtectedRoute>
      } />
      <Route path="/add-equipment" element={
        <ProtectedRoute>
          <AddEquipment />
        </ProtectedRoute>
      } />
      <Route path="/projects" element={
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      } />
      <Route path="/maintenance-checks" element={
        <ProtectedRoute>
          <MaintenanceChecks />
        </ProtectedRoute>
      } />
      <Route path="/filter-changes" element={
        <ProtectedRoute>
          <FilterChanges />
        </ProtectedRoute>
      } />
      <Route path="/predictive-maintenance" element={
        <ProtectedRoute>
          <PredictiveMaintenance />
        </ProtectedRoute>
      } />
      <Route path="/digital-twin" element={
        <ProtectedRoute>
          <DigitalTwin />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/customer-manual" element={
        <ProtectedRoute>
          <CustomerManual />
        </ProtectedRoute>
      } />
      <Route path="/print-view" element={
        <ProtectedRoute>
          <PrintView />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
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
    </HelmetProvider>
  );
};

export default App;
