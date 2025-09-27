import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  return (
    <div className="landing-page">
      <SEO 
        title="Flexible Pricing for Multi-Vertical Facilities"
        description="Pricing tiers for schools, hospitals, retail, and HVAC service companies"
        keywords="facility management pricing, predictive maintenance pricing, HVAC service pricing"
      />
      <LandingHeader />
      
      <main className="min-h-screen bg-gray-900 text-white">
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">
                Flexible Pricing That Scales With Your Operations
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Choose the right plan for your facility type and size. 
                All plans include our complete platform with predictive analytics and technician assist.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {/* Starter Plan */}
              <div className="bg-gray-800 p-8 rounded-lg border-2 border-gray-700">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Starter</h2>
                  <p className="text-gray-300 mb-4">Perfect for small operations</p>
                  <div className="text-yellow-400 text-lg font-semibold">Contact for Pricing</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Up to 5 locations or buildings
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Basic predictive analytics
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Mobile technician assist
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Email support
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Monthly ROI reports
                  </li>
                </ul>
                <Link to="/book-demo" className="block">
                  <Button className="w-full bg-gray-700 text-white hover:bg-gray-600">
                    Contact Sales
                  </Button>
                </Link>
              </div>

              {/* Growth Plan - Featured */}
              <div className="bg-gray-800 p-8 rounded-lg border-2 border-yellow-400 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Growth</h2>
                  <p className="text-gray-300 mb-4">Ideal for growing operations</p>
                  <div className="text-yellow-400 text-lg font-semibold">Contact for Pricing</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Up to 25 locations or buildings
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Advanced predictive analytics
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Full technician assist platform
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Priority phone & email support
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Weekly ROI reports & dashboards
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Custom integrations
                  </li>
                </ul>
                <Link to="/book-demo" className="block">
                  <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400">
                    Contact Sales
                  </Button>
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-gray-800 p-8 rounded-lg border-2 border-gray-700">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Enterprise</h2>
                  <p className="text-gray-300 mb-4">For large-scale operations</p>
                  <div className="text-yellow-400 text-lg font-semibold">Contact for Pricing</div>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Unlimited locations
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Enterprise AI analytics
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    White-label technician app
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    24/7 dedicated support
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    Real-time executive dashboards
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-3">✓</span>
                    API access & custom development
                  </li>
                </ul>
                <Link to="/book-demo" className="block">
                  <Button className="w-full bg-gray-700 text-white hover:bg-gray-600">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>

            {/* Industry-Specific Pricing */}
            <div className="bg-gray-800 p-8 rounded-lg mb-16">
              <h2 className="text-3xl font-bold text-center mb-8">Industry-Specific Solutions</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 text-yellow-400">Retail Chains</h3>
                  <p className="text-gray-300 text-sm">Multi-site energy optimization and centralized monitoring</p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 text-yellow-400">Schools & Universities</h3>
                  <p className="text-gray-300 text-sm">Air quality monitoring with budget-conscious energy management</p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 text-yellow-400">Hospitals</h3>
                  <p className="text-gray-300 text-sm">Mission-critical uptime with regulatory compliance</p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 text-yellow-400">HVAC Service</h3>
                  <p className="text-gray-300 text-sm">Technician enablement and customer satisfaction tools</p>
                </div>
              </div>
            </div>

            {/* ROI Calculator */}
            <div className="bg-gray-800 p-8 rounded-lg mb-16">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-6">Calculate Your ROI</h2>
                <p className="text-xl text-gray-300 mb-8">
                  Most customers see payback within 6-12 months through energy savings and reduced downtime
                </p>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-2">15-25%</div>
                    <div className="text-gray-300">Energy Cost Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-2">67%</div>
                    <div className="text-gray-300">Fewer Emergency Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-2">85%</div>
                    <div className="text-gray-300">First-Time Fix Rate</div>
                  </div>
                </div>
                <Link to="/book-demo">
                  <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 text-lg px-8 py-4">
                    Get Custom ROI Analysis
                  </Button>
                </Link>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Speak with our team to find the perfect plan for your facility
              </p>
              <Link to="/book-demo">
                <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 text-lg px-8 py-4">
                  Schedule a Consultation
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Pricing;