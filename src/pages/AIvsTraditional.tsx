import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AIvsTraditional = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <SEO
        title="AI vs Traditional Asset Management | Why Artificial Intelligence Wins"
        description="Compare AI-powered asset management vs traditional methods. See why intelligent, predictive systems outperform reactive legacy software by 300%."
        keywords="AI vs traditional asset management, artificial intelligence asset management comparison, legacy asset management problems, smart asset management benefits"
        url="https://assetguardian.ai/ai-vs-traditional"
      />
      
      <LandingHeader />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              AI vs Traditional <span className="text-yellow-400">Asset Management</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover why intelligent, AI-first platforms outperform legacy systems by 300%. 
              The future of asset management is here, and it's powered by artificial intelligence.
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              The Clear Choice: AI-Powered vs Legacy Systems
            </h2>
            
            <div className="bg-gray-800/50 rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {/* Header */}
                <div className="bg-gray-700 p-6 text-center">
                  <h3 className="text-xl font-bold text-white">Capability</h3>
                </div>
                <div className="bg-yellow-400 p-6 text-center">
                  <h3 className="text-xl font-bold text-black">AssetGuardian.ai</h3>
                  <p className="text-sm text-black/70">AI-Powered Platform</p>
                </div>
                <div className="bg-red-900/50 p-6 text-center">
                  <h3 className="text-xl font-bold text-white">Traditional Software</h3>
                  <p className="text-sm text-gray-300">Legacy Systems</p>
                </div>

                {/* Predictive Maintenance */}
                <div className="bg-gray-700/30 p-6">
                  <h4 className="font-semibold text-white mb-2">Failure Prediction</h4>
                  <p className="text-gray-300 text-sm">Anticipate equipment issues before they occur</p>
                </div>
                <div className="bg-green-900/30 p-6">
                  <div className="flex items-center justify-center mb-2">
                    <i className="fas fa-check-circle text-green-400 text-xl mr-2"></i>
                    <span className="text-white font-semibold">99% Accuracy</span>
                  </div>
                  <p className="text-gray-300 text-sm">AI predicts failures 30-90 days in advance</p>
                </div>
                <div className="bg-red-900/30 p-6">
                  <div className="flex items-center justify-center mb-2">
                    <i className="fas fa-times-circle text-red-400 text-xl mr-2"></i>
                    <span className="text-white font-semibold">Reactive Only</span>
                  </div>
                  <p className="text-gray-300 text-sm">Only responds after equipment fails</p>
                </div>

                {/* Automation */}
                <div className="bg-gray-700/30 p-6">
                  <h4 className="font-semibold text-white mb-2">Process Automation</h4>
                  <p className="text-gray-300 text-sm">Eliminate manual work and human error</p>
                </div>
                <div className="bg-green-900/30 p-6">
                  <div className="flex items-center justify-center mb-2">
                    <i className="fas fa-robot text-green-400 text-xl mr-2"></i>
                    <span className="text-white font-semibold">Fully Automated</span>
                  </div>
                  <p className="text-gray-300 text-sm">AI handles scheduling, optimization, alerts</p>
                </div>
                <div className="bg-red-900/30 p-6">
                  <div className="flex items-center justify-center mb-2">
                    <i className="fas fa-user text-red-400 text-xl mr-2"></i>
                    <span className="text-white font-semibold">Manual Work</span>
                  </div>
                  <p className="text-gray-300 text-sm">Requires constant human intervention</p>
                </div>

                {/* Data Analysis */}
                <div className="bg-gray-700/30 p-6">
                  <h4 className="font-semibold text-white mb-2">Data Intelligence</h4>
                  <p className="text-gray-300 text-sm">Transform data into actionable insights</p>
                </div>
                <div className="bg-green-900/30 p-6">
                  <div className="flex items-center justify-center mb-2">
                    <i className="fas fa-brain text-green-400 text-xl mr-2"></i>
                    <span className="text-white font-semibold">AI Analytics</span>
                  </div>
                  <p className="text-gray-300 text-sm">Machine learning finds hidden patterns</p>
                </div>
                <div className="bg-red-900/30 p-6">
                  <div className="flex items-center justify-center mb-2">
                    <i className="fas fa-chart-bar text-red-400 text-xl mr-2"></i>
                    <span className="text-white font-semibold">Basic Reports</span>
                  </div>
                  <p className="text-gray-300 text-sm">Static dashboards and spreadsheets</p>
                </div>

                {/* Scalability */}
                <div className="bg-gray-700/30 p-6">
                  <h4 className="font-semibold text-white mb-2">Enterprise Scale</h4>
                  <p className="text-gray-300 text-sm">Handle thousands of assets effortlessly</p>
                </div>
                <div className="bg-green-900/30 p-6">
                  <div className="flex items-center justify-center mb-2">
                    <i className="fas fa-cloud text-green-400 text-xl mr-2"></i>
                    <span className="text-white font-semibold">Cloud-Native</span>
                  </div>
                  <p className="text-gray-300 text-sm">Infinite scalability with AI optimization</p>
                </div>
                <div className="bg-red-900/30 p-6">
                  <div className="flex items-center justify-center mb-2">
                    <i className="fas fa-server text-red-400 text-xl mr-2"></i>
                    <span className="text-white font-semibold">Limited Scale</span>
                  </div>
                  <p className="text-gray-300 text-sm">Expensive servers, performance bottlenecks</p>
                </div>

                {/* ROI */}
                <div className="bg-gray-700/30 p-6">
                  <h4 className="font-semibold text-white mb-2">Return on Investment</h4>
                  <p className="text-gray-300 text-sm">Measurable financial impact</p>
                </div>
                <div className="bg-green-900/30 p-6">
                  <div className="flex items-center justify-center mb-2">
                    <i className="fas fa-dollar-sign text-green-400 text-xl mr-2"></i>
                    <span className="text-white font-semibold">300% ROI</span>
                  </div>
                  <p className="text-gray-300 text-sm">Proven in 90 days with AI optimization</p>
                </div>
                <div className="bg-red-900/30 p-6">
                  <div className="flex items-center justify-center mb-2">
                    <i className="fas fa-question text-red-400 text-xl mr-2"></i>
                    <span className="text-white font-semibold">Uncertain ROI</span>
                  </div>
                  <p className="text-gray-300 text-sm">Long implementation, unclear benefits</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why AI Wins */}
        <section className="py-20 px-4 bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Why AI-First Platforms Win Every Time
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-6">The Traditional Problem</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <i className="fas fa-exclamation-triangle text-red-400 mt-1 mr-3"></i>
                    <div>
                      <h4 className="text-white font-semibold">Reactive Maintenance</h4>
                      <p className="text-gray-300 text-sm">Wait for breakdowns, then scramble to fix them</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-clock text-red-400 mt-1 mr-3"></i>
                    <div>
                      <h4 className="text-white font-semibold">Manual Processes</h4>
                      <p className="text-gray-300 text-sm">Slow, error-prone human-dependent workflows</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-money-bill-wave text-red-400 mt-1 mr-3"></i>
                    <div>
                      <h4 className="text-white font-semibold">Hidden Costs</h4>
                      <p className="text-gray-300 text-sm">Emergency repairs cost 3-5x normal maintenance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-chart-line text-red-400 mt-1 mr-3"></i>
                    <div>
                      <h4 className="text-white font-semibold">Poor Visibility</h4>
                      <p className="text-gray-300 text-sm">No insight into asset health or performance trends</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-6">The AI Advantage</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <i className="fas fa-crystal-ball text-green-400 mt-1 mr-3"></i>
                    <div>
                      <h4 className="text-white font-semibold">Predictive Intelligence</h4>
                      <p className="text-gray-300 text-sm">Prevent failures before they happen with ML</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-robot text-green-400 mt-1 mr-3"></i>
                    <div>
                      <h4 className="text-white font-semibold">Intelligent Automation</h4>
                      <p className="text-gray-300 text-sm">AI handles complex decisions and optimizations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-piggy-bank text-green-400 mt-1 mr-3"></i>
                    <div>
                      <h4 className="text-white font-semibold">Massive Savings</h4>
                      <p className="text-gray-300 text-sm">Prevent expensive failures, optimize operations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <i className="fas fa-eye text-green-400 mt-1 mr-3"></i>
                    <div>
                      <h4 className="text-white font-semibold">Total Visibility</h4>
                      <p className="text-gray-300 text-sm">Real-time AI insights into every asset</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-black mb-6">
              Ready to Upgrade to AI-Powered Asset Management?
            </h2>
            <p className="text-xl text-black/80 mb-8">
              Join the enterprises saving millions with intelligent, predictive asset management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg"
              >
                Start AI-Powered Pilot
              </Button>
              <Link to="/features">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-black text-black hover:bg-black/10 px-8 py-4 text-lg w-full"
                >
                  Explore AI Features
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AIvsTraditional;