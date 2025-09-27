import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Features = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <SEO
        title="AI Asset Management Features | Machine Learning & Predictive Analytics"
        description="Discover AssetGuardian.ai's revolutionary AI features: predictive maintenance, intelligent automation, machine learning optimization, and real-time asset monitoring."
        keywords="AI asset management features, predictive maintenance AI, machine learning asset optimization, intelligent asset tracking, automated asset management"
        url="https://assetguardian.ai/features"
      />
      
      <LandingHeader />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              AI-Powered Asset Management <span className="text-yellow-400">Features</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the future of asset management with advanced artificial intelligence, 
              machine learning algorithms, and predictive analytics that transform how enterprises manage their assets.
            </p>
          </div>
        </section>

        {/* Core AI Features */}
        <section className="py-20 px-4 bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Revolutionary AI Technology
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-700/50 rounded-lg p-8">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-brain text-2xl text-black"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Predictive AI Engine</h3>
                <p className="text-gray-300">
                  Advanced machine learning algorithms predict equipment failures up to 90 days in advance, 
                  preventing costly downtime and emergency repairs.
                </p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-8">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-robot text-2xl text-black"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Intelligent Automation</h3>
                <p className="text-gray-300">
                  AI-driven workflows automatically optimize maintenance schedules, resource allocation, 
                  and asset performance without human intervention.
                </p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-8">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-chart-line text-2xl text-black"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Real-Time Analytics</h3>
                <p className="text-gray-300">
                  Continuous AI monitoring provides instant insights into asset health, performance trends, 
                  and optimization opportunities across your entire enterprise.
                </p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-8">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-shield-alt text-2xl text-black"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Anomaly Detection</h3>
                <p className="text-gray-300">
                  Machine learning models identify unusual patterns and potential issues before they 
                  become critical problems, ensuring maximum uptime.
                </p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-8">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-cogs text-2xl text-black"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Smart Optimization</h3>
                <p className="text-gray-300">
                  AI algorithms continuously optimize asset utilization, energy consumption, and 
                  operational efficiency to maximize ROI and reduce costs.
                </p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-8">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-mobile-alt text-2xl text-black"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Mobile AI Assistant</h3>
                <p className="text-gray-300">
                  AI-powered mobile interface provides instant access to asset information, 
                  maintenance instructions, and intelligent recommendations anywhere.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Measurable AI-Driven Results
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-4">99%</div>
                <div className="text-white text-lg font-semibold mb-2">AI Prediction Accuracy</div>
                <div className="text-gray-300">Machine learning models achieve unprecedented accuracy</div>
              </div>
              
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-4">81%</div>
                <div className="text-white text-lg font-semibold mb-2">Downtime Reduction</div>
                <div className="text-gray-300">AI prevents failures before they occur</div>
              </div>
              
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-4">$8.7M</div>
                <div className="text-white text-lg font-semibold mb-2">Average Annual Savings</div>
                <div className="text-gray-300">Enterprise customers save millions with AI optimization</div>
              </div>
              
              <div>
                <div className="text-5xl font-bold text-yellow-400 mb-4">24/7</div>
                <div className="text-white text-lg font-semibold mb-2">AI Monitoring</div>
                <div className="text-gray-300">Continuous intelligent surveillance of all assets</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-black mb-6">
              Experience AI-Powered Asset Management
            </h2>
            <p className="text-xl text-black/80 mb-8">
              See how artificial intelligence transforms asset management in your enterprise
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg"
              >
                Get AI-Powered Demo
              </Button>
              <Link to="/ai-vs-traditional">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-black text-black hover:bg-black/10 px-8 py-4 text-lg w-full"
                >
                  AI vs Traditional Comparison
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;