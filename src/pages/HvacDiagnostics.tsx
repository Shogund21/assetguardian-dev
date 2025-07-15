import React from "react";
import Layout from "@/components/Layout";
import ChillerHealthDiagnostic from "@/components/hvac/ChillerHealthDiagnostic";
import { DiagnosticSession } from "@/services/hvacDiagnosticService";

const HvacDiagnostics = () => {
  const handleDiagnosticComplete = (session: DiagnosticSession) => {
    console.log('Diagnostic completed:', session);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">HVAC Diagnostics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive chiller health analysis using AI-powered diagnostic algorithms
          </p>
        </div>
        
        {/* For demo, using a sample equipment ID - in real app this would be selected */}
        <ChillerHealthDiagnostic
          equipmentId="sample-chiller-id"
          equipmentName="Main Chiller Unit"
          onDiagnosticComplete={handleDiagnosticComplete}
        />
      </div>
    </Layout>
  );
};

export default HvacDiagnostics;