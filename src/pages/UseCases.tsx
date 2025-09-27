import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Button } from "@/components/ui/button";

const UseCases = () => {
  const industries = [
    {
      title: "Manufacturing",
      icon: "fas fa-industry",
      description: "AI-powered predictive maintenance for production equipment",
      benefits: ["99% uptime guarantee", "Reduce emergency repairs by 96%", "Optimize production schedules"],
      applications: ["CNC machines", "Conveyor systems", "HVAC equipment", "Safety systems"]
    },
    {
      title: "Healthcare",
      icon: "fas fa-hospital",
      description: "Intelligent medical equipment management and compliance",
      benefits: ["Ensure regulatory compliance", "Prevent critical equipment failures", "Optimize maintenance costs"],
      applications: ["MRI machines", "Ventilators", "Surgical equipment", "Building systems"]
    },
    {
      title: "Energy & Utilities",
      icon: "fas fa-bolt",
      description: "AI-driven infrastructure monitoring and optimization",
      benefits: ["Prevent power outages", "Optimize energy distribution", "Reduce operational costs"],
      applications: ["Transformers", "Generators", "Distribution lines", "Control systems"]
    },
    {
      title: "Commercial Real Estate",
      icon: "fas fa-building",
      description: "Smart building management with AI automation",
      benefits: ["Reduce energy costs by 30%", "Improve tenant satisfaction", "Predictive HVAC maintenance"],
      applications: ["HVAC systems", "Elevators", "Security systems", "Fire safety"]
    },
    {
      title: "Transportation",
      icon: "fas fa-truck",
      description: "Fleet and infrastructure AI optimization",
      benefits: ["Maximize fleet uptime", "Reduce fuel costs", "Predictive vehicle maintenance"],
      applications: ["Vehicle fleets", "Loading equipment", "Warehouse systems", "Fuel systems"]
    },
    {
      title: "Data Centers",
      icon: "fas fa-server",
      description: "AI-powered critical infrastructure management",
      benefits: ["99.99% uptime", "Optimize cooling efficiency", "Prevent data loss"],
      applications: ["Servers", "Cooling systems", "Power infrastructure", "Network equipment"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <SEO
        title="AI Asset Management Use Cases | Predictive Maintenance & Optimization"
        description="Discover how AssetGuardian.ai transforms asset management across industries: manufacturing, healthcare, energy, real estate, transportation, and data centers."
        keywords="AI asset management use cases, predictive maintenance applications, smart building management, manufacturing AI, healthcare asset management"
        url="https://assetguardian.ai/use-cases"
      />
      
      <LandingHeader />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              AI Asset Management <span className="text-yellow-400">Use Cases</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              See how enterprises across industries use AssetGuardian.ai's artificial intelligence 
              to transform their asset management and achieve measurable ROI.
            </p>
          </div>
        </section>

        {/* Industries Grid */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Industries Transformed by AI
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industries.map((industry, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-8 hover:bg-gray-700/50 transition-colors">
                  <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mb-6">
                    <i className={`${industry.icon} text-2xl text-black`}></i>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">{industry.title}</h3>
                  <p className="text-gray-300 mb-6">{industry.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-yellow-400 font-semibold mb-3">AI-Powered Benefits:</h4>
                    <ul className="space-y-2">
                      {industry.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center text-gray-300">
                          <i className="fas fa-check text-green-400 mr-2"></i>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-yellow-400 font-semibold mb-3">Asset Types:</h4>
                    <div className="flex flex-wrap gap-2">
                      {industry.applications.map((app, i) => (
                        <span key={i} className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI Case Study */}
        <section className="py-20 px-4 bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Real Enterprise Results
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-yellow-400 mb-6">
                  Fortune 500 Manufacturing Case Study
                </h3>
                <p className="text-gray-300 mb-6">
                  A leading automotive manufacturer implemented AssetGuardian.ai across 3 facilities 
                  with over 2,000 pieces of critical equipment.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Challenge</h4>
                    <p className="text-gray-300 text-sm">
                      Unexpected equipment failures causing $2M+ monthly production losses
                    </p>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">AI Solution</h4>
                    <p className="text-gray-300 text-sm">
                      Predictive maintenance with machine learning failure prediction
                    </p>
                  </div>
                  
                  <div className="bg-green-900/30 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-2">Results in 90 Days</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• 87% reduction in unplanned downtime</li>
                      <li>• $12.3M annual savings achieved</li>
                      <li>• 340% ROI in first year</li>
                      <li>• 96% fewer emergency repairs</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-6">
                  <div className="text-4xl font-bold text-black mb-2">87%</div>
                  <div className="text-black font-semibold">Downtime Reduction</div>
                </div>
                
                <div className="text-center bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-6">
                  <div className="text-4xl font-bold text-black mb-2">$12.3M</div>
                  <div className="text-black font-semibold">Annual Savings</div>
                </div>
                
                <div className="text-center bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-6">
                  <div className="text-4xl font-bold text-black mb-2">340%</div>
                  <div className="text-black font-semibold">ROI in Year 1</div>
                </div>
                
                <div className="text-center bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg p-6">
                  <div className="text-4xl font-bold text-black mb-2">96%</div>
                  <div className="text-black font-semibold">Fewer Emergencies</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Process */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              90-Day AI Implementation Process
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-black">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">AI Assessment (Days 1-15)</h3>
                <p className="text-gray-300">
                  Our AI experts analyze your assets and identify optimization opportunities
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-black">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">AI Deployment (Days 16-45)</h3>
                <p className="text-gray-300">
                  Deploy machine learning models and connect to your existing systems
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-black">3</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">AI Optimization (Days 46-90)</h3>
                <p className="text-gray-300">
                  Fine-tune AI algorithms and measure ROI as predictions improve
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-black mb-6">
              Start Your AI-Powered Transformation
            </h2>
            <p className="text-xl text-black/80 mb-8">
              Join enterprises achieving 300%+ ROI with intelligent asset management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg"
              >
                Start 90-Day AI Pilot
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-black text-black hover:bg-black/10 px-8 py-4 text-lg"
              >
                Download Case Studies
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UseCases;