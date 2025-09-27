import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Results = () => {
  return (
    <div className="landing-page">
      <SEO 
        title="Proven Results from AssetGuardian.ai"
        description="Improve uptime, reduce costs, and increase first-time fix rates across facilities"
        keywords="energy savings, uptime improvement, first-time fix rates, facility management results"
      />
      <LandingHeader />
      
      <main className="min-h-screen bg-gray-900 text-white">
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">
                Proven Results: Better Reliability, Lower Costs, Faster Fixes
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Real facilities, real savings, real improvements. 
                See how AssetGuardian.ai delivers measurable results across all verticals.
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center bg-gray-800 p-8 rounded-lg">
                <div className="text-4xl font-bold text-yellow-400 mb-2">25%</div>
                <div className="text-xl font-semibold mb-2">Energy Cost Reduction</div>
                <p className="text-gray-300">Average savings across all facility types</p>
              </div>
              <div className="text-center bg-gray-800 p-8 rounded-lg">
                <div className="text-4xl font-bold text-yellow-400 mb-2">85%</div>
                <div className="text-xl font-semibold mb-2">First-Time Fix Rate</div>
                <p className="text-gray-300">Technicians resolve issues on first visit</p>
              </div>
              <div className="text-center bg-gray-800 p-8 rounded-lg">
                <div className="text-4xl font-bold text-yellow-400 mb-2">96%</div>
                <div className="text-xl font-semibold mb-2">Uptime Improvement</div>
                <p className="text-gray-300">Reduction in unexpected equipment failures</p>
              </div>
            </div>

            {/* Case Studies by Vertical */}
            <div className="space-y-8 mb-16">
              {/* Retail Case Study */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <h2 className="text-2xl font-bold">Retail Chain Success</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-yellow-400">Major Department Store Chain</h3>
                    <p className="text-gray-300 mb-4">
                      "Miami flagship store reduced kWh 18% in 60 days with AssetGuardian.ai's predictive maintenance platform."
                    </p>
                    <ul className="text-gray-300 space-y-2">
                      <li>• 120 store locations monitored</li>
                      <li>• $2.3M annual energy savings</li>
                      <li>• 67% reduction in emergency HVAC calls</li>
                      <li>• 15% improvement in customer comfort scores</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">18%</div>
                    <div className="text-lg font-semibold mb-4">Energy Reduction in 60 Days</div>
                    <div className="text-sm text-gray-300">
                      Miami flagship location achieved 18% kWh reduction through AI-powered HVAC optimization
                    </div>
                  </div>
                </div>
              </div>

              {/* Healthcare Case Study */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <h2 className="text-2xl font-bold">Healthcare Facility Excellence</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-yellow-400">Regional Medical Center</h3>
                    <p className="text-gray-300 mb-4">
                      Critical care facility maintains 99.9% uptime with zero unplanned equipment failures in 12 months.
                    </p>
                    <ul className="text-gray-300 space-y-2">
                      <li>• 500-bed medical facility</li>
                      <li>• Zero critical system failures</li>
                      <li>• 45% reduction in maintenance costs</li>
                      <li>• Full regulatory compliance maintained</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">99.9%</div>
                    <div className="text-lg font-semibold mb-4">System Uptime</div>
                    <div className="text-sm text-gray-300">
                      Mission-critical HVAC and life support systems maintained perfect reliability
                    </div>
                  </div>
                </div>
              </div>

              {/* Education Case Study */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <h2 className="text-2xl font-bold">Education Sector Achievement</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-yellow-400">Large School District</h3>
                    <p className="text-gray-300 mb-4">
                      K-12 district improves air quality across 45 schools while reducing energy costs by 22%.
                    </p>
                    <ul className="text-gray-300 space-y-2">
                      <li>• 45 school buildings optimized</li>
                      <li>• $850K annual savings</li>
                      <li>• Improved indoor air quality</li>
                      <li>• 90% reduction in student complaints</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">22%</div>
                    <div className="text-lg font-semibold mb-4">Energy Cost Savings</div>
                    <div className="text-sm text-gray-300">
                      District-wide energy optimization while maintaining optimal learning environments
                    </div>
                  </div>
                </div>
              </div>

              {/* HVAC Service Case Study */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <h2 className="text-2xl font-bold">HVAC Service Excellence</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-yellow-400">Commercial HVAC Contractor</h3>
                    <p className="text-gray-300 mb-4">
                      Service company increases first-time fix rates to 89% and improves customer satisfaction by 40%.
                    </p>
                    <ul className="text-gray-300 space-y-2">
                      <li>• 200+ commercial clients served</li>
                      <li>• 89% first-time fix rate</li>
                      <li>• 40% improvement in customer satisfaction</li>
                      <li>• 30% increase in technician productivity</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">89%</div>
                    <div className="text-lg font-semibold mb-4">First-Time Fix Rate</div>
                    <div className="text-sm text-gray-300">
                      AI-guided diagnostics help technicians resolve issues on first visit
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center bg-gray-800 p-8 rounded-lg">
              <h2 className="text-3xl font-bold mb-6">Ready to Achieve These Results?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join hundreds of facilities already benefiting from AssetGuardian.ai
              </p>
              <Link to="/book-demo">
                <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 text-lg px-8 py-4">
                  Schedule Your Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Results;