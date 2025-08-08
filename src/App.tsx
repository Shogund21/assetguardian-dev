import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EquipmentList from './components/EquipmentList';
import MaintenanceSchedule from './components/MaintenanceSchedule';
import PredictiveAnalysis from './components/PredictiveAnalysis';
import Settings from './components/Settings';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import Account from './components/Account';
import LandingPage from './components/LandingPage';
import CompanyList from './components/CompanyList';
import LocationList from './components/LocationList';
import TechnicianList from './components/TechnicianList';
import MaintenanceCheckList from './components/MaintenanceCheckList';
import VendorsPage from "@/pages/VendorsPage";
import WorkOrdersPage from "@/pages/WorkOrdersPage";

function App() {
  const supabase = useSupabaseClient()
  const user = useUser()

  return (
    <>
      <Router>
        {!user ? (
          <div className="container" style={{ padding: '50px 0 100px 0' }}>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google', 'github']}
              redirectTo="http://localhost:3000/"
            />
          </div>
        ) : (
          <Routes>
            <Route exact path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/equipment" element={<EquipmentList />} />
            <Route path="/maintenance" element={<MaintenanceSchedule />} />
            <Route path="/predictive" element={<PredictiveAnalysis />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/account" element={<Account />} />
            <Route path="/companies" element={<CompanyList />} />
            <Route path="/locations" element={<LocationList />} />
            <Route path="/technicians" element={<TechnicianList />} />
            <Route path="/maintenance-checks" element={<MaintenanceCheckList />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/work-orders" element={<WorkOrdersPage />} />
          </Routes>
        )}
      </Router>
    </>
  );
}

export default App;
