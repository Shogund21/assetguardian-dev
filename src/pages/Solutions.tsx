import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Solutions = () => {
  return (
    <div className="landing-page">
      <SEO 
        title="Predictive Maintenance Solutions for Facilities"
        description="AI-driven maintenance solutions for retail, schools, hospitals, and HVAC service companies"
        keywords="predictive maintenance solutions, retail facilities, school maintenance, hospital maintenance, HVAC service"
      />
      <LandingHeader />
      
      <main className="bg-gray-900 text-white">
        <section className="py-20 px-6 pb-32">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">
                Predictive Maintenance Solutions for Every Type of Facility
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                AI-powered solutions tailored to your industry's unique challenges, 
                empowering technicians and reducing downtime across all facility types.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Retail Facilities */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">Retail Facilities</h2>
                <p className="text-gray-300 mb-6">
                  Multi-location energy management with centralized technician dispatch. 
                  Reduce costs while ensuring customer comfort across all store locations.
                </p>
                <ul className="text-gray-300 space-y-2 mb-6">
                  <li>• 15-25% energy cost reduction with mobile technician support</li>
                  <li>• Centralized monitoring with AI-guided troubleshooting</li>
                  <li>• Customer comfort optimization through rapid issue resolution</li>
                  <li>• Corporate sustainability goals with real-time energy insights</li>
                </ul>
                <Link to="/book-demo">
                  <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Schools & Universities */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">Schools & Universities</h2>
                <p className="text-gray-300 mb-6">
                  Indoor air quality monitoring and compliance with mobile technician support. 
                  Ensure healthy learning environments while optimizing budgets.
                </p>
                <ul className="text-gray-300 space-y-2 mb-6">
                  <li>• Indoor air quality monitoring with technician alerts</li>
                  <li>• Energy efficiency optimization with mobile insights</li>
                  <li>• Compliance documentation with automated reporting</li>
                  <li>• Proactive maintenance scheduling with technician workflows</li>
                </ul>
                <Link to="/book-demo">
                  <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Hospitals & Healthcare */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">Hospitals & Healthcare</h2>
                <p className="text-gray-300 mb-6">
                  Mission-critical uptime with 24/7 technician guidance and redundant systems. 
                  Ensure patient safety with AI-powered diagnostics and rapid response.
                </p>
                <ul className="text-gray-300 space-y-2 mb-6">
                  <li>• 99.9% system uptime with instant technician alerts</li>
                  <li>• Redundant monitoring with predictive insights</li>
                  <li>• Patient safety compliance with automated documentation</li>
                  <li>• Emergency response protocols with guided troubleshooting</li>
                </ul>
                <Link to="/book-demo">
                  <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* HVAC Service Companies */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">HVAC Service Companies</h2>
                <p className="text-gray-300 mb-6">
                  Technician troubleshooting assist with AI-powered diagnostics for 89% first-time fix improvement. 
                  Transform your service delivery with mobile-first tools.
                </p>
                <ul className="text-gray-300 space-y-2 mb-6">
                  <li>• 89% first-time fix rate with AI-powered diagnostics</li>
                  <li>• Step-by-step troubleshooting workflows</li>
                  <li>• Mobile technician workflows with expert knowledge base</li>
                  <li>• Service route optimization with priority alerts</li>
                </ul>
                <Link to="/book-demo">
                  <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Operations?</h2>
              <p className="text-xl text-gray-300 mb-8">
                See how AssetGuardian.ai can revolutionize your facility management
              </p>
              <Link to="/book-demo">
                <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 text-lg px-8 py-4">
                  Book a Demo Today
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Solutions;