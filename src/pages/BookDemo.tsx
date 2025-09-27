import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const BookDemo = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Demo request submitted:", formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="landing-page">
      <SEO 
        title="Book a Demo of AssetGuardian.ai"
        description="Schedule a live demo today"
        keywords="book demo, schedule demo, AssetGuardian.ai demo, predictive maintenance demo"
      />
      <LandingHeader />
      
      <main className="min-h-screen bg-gray-900 text-white">
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6">
                See AssetGuardian.ai in Action – Book Your Demo
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience how our AI-powered platform transforms facility maintenance and empowers your technicians. 
                Schedule a personalized demo tailored to your industry and needs.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Demo Form */}
              <div className="bg-gray-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6">Schedule Your Personalized Demo</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white"
                      placeholder="Enter your work email"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white"
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium mb-2">
                      Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white"
                    >
                      <option value="">Select your role</option>
                      <option value="Facility Manager">Facility Manager</option>
                      <option value="Operations Manager">Operations Manager</option>
                      <option value="Maintenance Manager">Maintenance Manager</option>
                      <option value="HVAC Technician">HVAC Technician</option>
                      <option value="Service Manager">Service Manager</option>
                      <option value="Executive">Executive</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-400 text-lg py-3"
                  >
                    Schedule My Demo
                  </Button>
                </form>

                <p className="text-gray-400 text-sm mt-4">
                  * Required fields. We'll contact you within 24 hours to schedule your demo.
                </p>
              </div>

              {/* What to Expect */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">What to Expect in Your Demo</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1">
                        <span className="text-black font-bold text-sm">1</span>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Personalized Platform Tour</h3>
                        <p className="text-gray-300">See AssetGuardian.ai configured for your specific industry and use cases</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1">
                        <span className="text-black font-bold text-sm">2</span>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Technician Assist Demo</h3>
                        <p className="text-gray-300">Experience how our AI guides technicians through diagnostics and repairs</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1">
                        <span className="text-black font-bold text-sm">3</span>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">ROI Analysis</h3>
                        <p className="text-gray-300">Custom ROI projection based on your facility's current operations</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-4 mt-1">
                        <span className="text-black font-bold text-sm">4</span>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Q&A Session</h3>
                        <p className="text-gray-300">Get answers to all your questions about implementation and benefits</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-yellow-400">Demo Highlights</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Live predictive analytics dashboard</li>
                    <li>• Mobile technician assist interface</li>
                    <li>• Real-time sensor data integration</li>
                    <li>• Executive ROI reporting</li>
                    <li>• Multi-site management capabilities</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-yellow-400">Industry Focus</h3>
                  <p className="text-gray-300 mb-4">
                    Our demos are tailored for:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-gray-300 text-sm">
                    <div>• Retail Facilities</div>
                    <div>• Schools & Universities</div>
                    <div>• Hospitals & Healthcare</div>
                    <div>• HVAC Service Companies</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-16 bg-gray-800 p-8 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 mb-6">
                Join hundreds of facilities already using AssetGuardian.ai to reduce costs and improve reliability
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-400 mb-2">25%</div>
                  <div className="text-gray-300">Average Energy Savings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400 mb-2">85%</div>
                  <div className="text-gray-300">First-Time Fix Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400 mb-2">96%</div>
                  <div className="text-gray-300">Uptime Improvement</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BookDemo;