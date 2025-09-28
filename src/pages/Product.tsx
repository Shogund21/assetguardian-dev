import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Product = () => {
  return (
    <div className="landing-page">
      <SEO 
        title="AssetGuardian.ai Product Overview"
        description="AI Predictive Maintenance, Technician Assist, sensor hub, and ROI reporting for facilities"
        keywords="AI predictive maintenance, technician assist, sensor hub, ROI reporting, facility management platform, energy saving"
      />
      <LandingHeader />
      
      <main className="min-h-screen bg-gray-900 text-white">
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Hero Intro */}
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">
                A Complete AI Predictive Maintenance Platform
              </h1>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                AssetGuardian.ai puts AI Predictive Maintenance at the core of your operations. 
                Our platform continuously learns equipment patterns, predicts failures before they happen, 
                and delivers real-time troubleshooting guidance so technicians resolve issues the first time.
              </p>
            </div>

            {/* AI Predictive Maintenance - Lead Module */}
            <div className="mb-16">
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-8 rounded-lg mb-8">
                <div className="w-16 h-16 bg-black rounded-lg mb-6 flex items-center justify-center">
                  <span className="text-yellow-400 font-bold text-2xl">AI</span>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-black">AI Predictive Maintenance</h2>
                <p className="text-xl text-black mb-6 font-medium">
                  The core engine that powers everything else. Continuous equipment monitoring with 
                  anomaly detection that reduces energy consumption and repair costs.
                </p>
                <ul className="text-black space-y-3 text-lg">
                  <li>• Continuous equipment monitoring with anomaly detection</li>
                  <li>• Predicts failures before they cause downtime</li>
                  <li>• Prioritizes alerts by severity and business impact</li>
                  <li>• Reduces energy consumption and repair costs</li>
                </ul>
              </div>
            </div>

            {/* Digital Twin Technology */}
            <div className="mb-16">
              <div className="bg-white/5 p-8 rounded-lg border border-white/10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg mb-6 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">🔬</span>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">Digital Twin Technology</h2>
                <p className="text-xl text-gray-300 mb-6">
                  Every chiller, AHU, or cooling tower in AssetGuardian.ai has a live digital twin — a virtual model continuously updated with sensor data. The twin doesn't just show you equipment health, it predicts failures, simulates outcomes, and guides technicians to resolve issues the first time.
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li>• Live, sensor-driven virtual replicas of assets</li>
                  <li>• Predictive modeling to forecast failures</li>
                  <li>• Simulated performance outcomes for planning</li>
                  <li>• Technician-first troubleshooting guidance</li>
                </ul>
              </div>
            </div>

            {/* Other Modules Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Technician Assist Mode */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">🔧</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">Technician Assist Mode</h2>
                <p className="text-gray-300 mb-6">
                  Step-by-step troubleshooting workflows delivered on mobile with real-time sensor overlays 
                  to guide field techs and boost first-time fix rates.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• Step-by-step troubleshooting workflows delivered on mobile</li>
                  <li>• Real-time sensor overlays to guide field techs</li>
                  <li>• Boosts first-time fix rates and reduces callbacks</li>
                </ul>
              </div>

              {/* Sensor Hub */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">📡</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">Sensor Hub</h2>
                <p className="text-gray-300 mb-6">
                  Universal connectivity with unified view of chillers, AHUs, RTUs, and cooling towers. 
                  Plug-and-play with existing sensors or new IoT deployments.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• Works with BACnet, Modbus, LoRaWAN, and other protocols</li>
                  <li>• Unified view of chillers, AHUs, RTUs, and cooling towers</li>
                  <li>• Plug-and-play with existing sensors or new IoT deployments</li>
                </ul>
              </div>

              {/* Work Order Compliance */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">📝</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">Work Order Compliance</h2>
                <p className="text-gray-300 mb-6">
                  Technicians log work orders directly into AssetGuardian.ai, ensuring accountability 
                  and documentation of every service event.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• Technicians log work orders directly into AssetGuardian.ai</li>
                  <li>• Ensures accountability and documentation of every service event</li>
                  <li>• Tracks technician productivity and completion rates</li>
                </ul>
              </div>

              {/* ROI Reports */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">📊</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">ROI Reports</h2>
                <p className="text-gray-300 mb-6">
                  Executive-level dashboards converting kWh into dollars saved with CO₂ reduction 
                  reporting for sustainability metrics.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• Executive-level dashboards converting kWh into dollars saved</li>
                  <li>• CO₂ reduction reporting for sustainability metrics</li>
                  <li>• Customizable reports for leadership and compliance</li>
                </ul>
              </div>
            </div>

            {/* Closing CTA Block */}
            <div className="bg-gray-800 p-12 rounded-lg text-center">
              <h2 className="text-4xl font-bold mb-6">AI Predictive Maintenance at the Core</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Everything else — from Technician Assist to ROI reporting — builds on our predictive AI engine.
              </p>
              <Link to="/book-demo">
                <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 text-xl px-12 py-6">
                  Book a Demo – See AI in Action
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Product;