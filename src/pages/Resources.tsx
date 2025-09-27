import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Resources = () => {
  return (
    <div className="landing-page">
      <SEO 
        title="Facilities Intelligence Resources"
        description="Free guides, checklists, and playbooks for predictive maintenance and technician support"
        keywords="predictive maintenance guides, HVAC checklists, facility management resources"
      />
      <LandingHeader />
      
      <main className="min-h-screen bg-gray-900 text-white">
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">
                Free Resources for Facilities and Service Teams
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Expert guides, checklists, and playbooks to help you optimize your facility operations 
                and improve technician effectiveness.
              </p>
            </div>

            {/* Featured Resources */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {/* Chiller Optimization Guide */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">📊</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">Chiller Optimization Signals Guide</h2>
                <p className="text-gray-300 mb-6">
                  Learn the critical warning signs that predict chiller failures and how to optimize performance 
                  for maximum energy efficiency.
                </p>
                <ul className="text-gray-300 text-sm space-y-2 mb-6">
                  <li>• 15 key performance indicators to monitor</li>
                  <li>• Early warning signs of impending failures</li>
                  <li>• Energy optimization best practices</li>
                  <li>• Maintenance scheduling guidelines</li>
                </ul>
                <Link to="/book-demo">
                  <Button className="bg-yellow-500 text-black hover:bg-yellow-400 w-full">
                    Download Free Guide
                  </Button>
                </Link>
              </div>

              {/* Economizer Playbook */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">🛠️</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">Economizer Playbook for Retail</h2>
                <p className="text-gray-300 mb-6">
                  Complete guide to economizer troubleshooting and optimization specifically designed for retail environments.
                </p>
                <ul className="text-gray-300 text-sm space-y-2 mb-6">
                  <li>• Step-by-step diagnostic procedures</li>
                  <li>• Common failure modes and solutions</li>
                  <li>• Seasonal optimization strategies</li>
                  <li>• Cost savings calculations</li>
                </ul>
                <Link to="/book-demo">
                  <Button className="bg-yellow-500 text-black hover:bg-yellow-400 w-full">
                    Download Free Playbook
                  </Button>
                </Link>
              </div>

              {/* ROI Case Studies */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-black font-bold text-xl">📈</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">ROI Case Study Collection</h2>
                <p className="text-gray-300 mb-6">
                  Real-world case studies showing measurable ROI from predictive maintenance implementations 
                  across different facility types.
                </p>
                <ul className="text-gray-300 text-sm space-y-2 mb-6">
                  <li>• Retail chain energy savings analysis</li>
                  <li>• Hospital uptime improvement metrics</li>
                  <li>• School district cost reduction data</li>
                  <li>• HVAC service efficiency gains</li>
                </ul>
                <Link to="/book-demo">
                  <Button className="bg-yellow-500 text-black hover:bg-yellow-400 w-full">
                    Download Case Studies
                  </Button>
                </Link>
              </div>
            </div>

            {/* Additional Resources */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">Additional Resources</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Technician Resources */}
                <div className="bg-gray-800 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-6 text-yellow-400">For Technicians</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-semibold mb-1">Mobile Diagnostic Checklist</h4>
                      <p className="text-gray-300 text-sm">Essential diagnostic steps for field technicians</p>
                    </div>
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-semibold mb-1">First-Time Fix Strategies</h4>
                      <p className="text-gray-300 text-sm">Proven techniques to improve success rates</p>
                    </div>
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-semibold mb-1">HVAC Troubleshooting Guide</h4>
                      <p className="text-gray-300 text-sm">Comprehensive field reference manual</p>
                    </div>
                  </div>
                </div>

                {/* Facility Manager Resources */}
                <div className="bg-gray-800 p-8 rounded-lg">
                  <h3 className="text-2xl font-bold mb-6 text-yellow-400">For Facility Managers</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-semibold mb-1">Energy Benchmarking Toolkit</h4>
                      <p className="text-gray-300 text-sm">Compare and optimize your facility's performance</p>
                    </div>
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-semibold mb-1">Predictive Maintenance ROI Calculator</h4>
                      <p className="text-gray-300 text-sm">Calculate potential savings for your facility</p>
                    </div>
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-semibold mb-1">Compliance Tracking Templates</h4>
                      <p className="text-gray-300 text-sm">Stay on top of regulatory requirements</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Industry-Specific Resources */}
            <div className="bg-gray-800 p-8 rounded-lg mb-16">
              <h2 className="text-3xl font-bold text-center mb-8">Industry-Specific Resources</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4 text-yellow-400">Retail</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Multi-site energy management</li>
                    <li>• Customer comfort optimization</li>
                    <li>• Peak season preparation</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4 text-yellow-400">Education</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Indoor air quality monitoring</li>
                    <li>• Budget optimization strategies</li>
                    <li>• Summer shutdown procedures</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4 text-yellow-400">Healthcare</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Critical system redundancy</li>
                    <li>• Infection control protocols</li>
                    <li>• Emergency backup procedures</li>
                  </ul>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4 text-yellow-400">HVAC Service</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Customer communication tools</li>
                    <li>• Service efficiency metrics</li>
                    <li>• Technician training materials</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center bg-gray-800 p-8 rounded-lg">
              <h2 className="text-3xl font-bold mb-6">Want More Resources?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join our community and get access to exclusive content, webinars, and expert insights
              </p>
              <Link to="/book-demo">
                <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 text-lg px-8 py-4">
                  Join Our Community
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Resources;