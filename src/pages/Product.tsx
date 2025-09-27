import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Product = () => {
  return (
    <div className="landing-page">
      <SEO 
        title="AssetGuardian.ai Product Overview"
        description="Predictive analytics, technician assist mode, sensor hub, ROI reporting"
        keywords="predictive analytics, technician assist, sensor hub, ROI reporting, facility management platform"
      />
      <LandingHeader />
      
      <main className="min-h-screen bg-gray-900 text-white">
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">
                A Complete Predictive Maintenance and Technician Assist Platform
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Four integrated modules that work together to predict failures, 
                guide your technicians, and deliver measurable results.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Predictive Analytics */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">AI</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
                <p className="text-gray-300 mb-6">
                  Real-time monitoring with actionable insights for facility managers and technicians, 
                  featuring predictive alerts and performance analytics.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• Machine learning algorithms analyze equipment patterns</li>
                  <li>• Early warning alerts prevent costly breakdowns</li>
                  <li>• Performance trend analysis and forecasting</li>
                  <li>• Automated maintenance scheduling with technician dispatch</li>
                </ul>
              </div>

              {/* Technician Assist Mode */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">🔧</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">Technician Assist Mode</h2>
                <p className="text-gray-300 mb-6">
                  Step-by-step troubleshooting workflows with mobile-first interface, 
                  AI-guided diagnostics, and expert knowledge base for field support.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• Mobile-first interface optimized for field technicians</li>
                  <li>• AI-guided diagnostic procedures with visual guides</li>
                  <li>• Step-by-step repair instructions with expert insights</li>
                  <li>• Real-time expert support and comprehensive documentation</li>
                </ul>
              </div>

              {/* Sensor Hub */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">📡</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">Sensor Hub</h2>
                <p className="text-gray-300 mb-6">
                  Universal connectivity supporting BACnet, Modbus, LoRaWAN for comprehensive 
                  equipment integration and data collection.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• BACnet, Modbus, LoRaWAN protocol support</li>
                  <li>• Real-time data collection and monitoring</li>
                  <li>• Wireless and wired connectivity options</li>
                  <li>• Edge computing for instant local processing</li>
                </ul>
              </div>

              {/* ROI Reports */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">📊</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">ROI Reports</h2>
                <p className="text-gray-300 mb-6">
                  Energy optimization and uptime metrics with executive dashboards 
                  showing cost savings and performance improvements.
                </p>
                <ul className="text-gray-300 space-y-2">
                  <li>• Energy cost savings tracking and reporting</li>
                  <li>• Downtime reduction metrics and analysis</li>
                  <li>• Technician productivity and efficiency improvements</li>
                  <li>• Executive dashboards and automated reporting</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-lg mb-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-6">How It All Works Together</h2>
                <p className="text-xl text-gray-300 mb-8">
                  Our integrated platform creates a seamless experience from prediction to resolution
                </p>
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-yellow-400 font-bold text-lg mb-2">1. Predict</div>
                    <p className="text-gray-300">AI identifies potential issues</p>
                  </div>
                  <div>
                    <div className="text-yellow-400 font-bold text-lg mb-2">2. Alert</div>
                    <p className="text-gray-300">System notifies relevant teams</p>
                  </div>
                  <div>
                    <div className="text-yellow-400 font-bold text-lg mb-2">3. Guide</div>
                    <p className="text-gray-300">Technicians receive step-by-step support</p>
                  </div>
                  <div>
                    <div className="text-yellow-400 font-bold text-lg mb-2">4. Report</div>
                    <p className="text-gray-300">Results tracked and ROI measured</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">See the Platform in Action</h2>
              <p className="text-xl text-gray-300 mb-8">
                Experience how AssetGuardian.ai transforms facility maintenance
              </p>
              <Link to="/book-demo">
                <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 text-lg px-8 py-4">
                  Book a Demo
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