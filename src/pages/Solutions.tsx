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
      
      <main className="min-h-screen bg-gray-900 text-white">
        <section className="py-20 px-6">
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
                  Cost reduction and multi-site control for retail chains, 
                  department stores, and shopping centers.
                </p>
                <ul className="text-gray-300 space-y-2 mb-6">
                  <li>• 15-25% energy cost reduction across all locations</li>
                  <li>• Centralized monitoring for multi-site operations</li>
                  <li>• Customer comfort optimization</li>
                  <li>• Automated compliance reporting</li>
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
                  Air quality monitoring and compliance for healthy learning environments.
                </p>
                <ul className="text-gray-300 space-y-2 mb-6">
                  <li>• Indoor air quality monitoring and alerts</li>
                  <li>• Energy efficiency for budget optimization</li>
                  <li>• Compliance with health and safety standards</li>
                  <li>• Predictive maintenance for minimal disruption</li>
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
                  Mission-critical uptime and redundancy for patient safety.
                </p>
                <ul className="text-gray-300 space-y-2 mb-6">
                  <li>• 99.9% system uptime for critical equipment</li>
                  <li>• Redundant monitoring and backup systems</li>
                  <li>• Patient safety and comfort optimization</li>
                  <li>• Regulatory compliance automation</li>
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
                  Technician enablement and first-time fix rate improvements.
                </p>
                <ul className="text-gray-300 space-y-2 mb-6">
                  <li>• 85% first-time fix rate improvement</li>
                  <li>• AI-guided troubleshooting for technicians</li>
                  <li>• Mobile field support and diagnostics</li>
                  <li>• Customer satisfaction optimization</li>
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