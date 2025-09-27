import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <SEO
        title="About AssetGuardian.ai | Leading AI Asset Management Platform"
        description="AssetGuardian.ai pioneers artificial intelligence in enterprise asset management. Learn about our mission to prevent failures, optimize performance, and transform industries."
        keywords="AssetGuardian.ai company, AI asset management leader, artificial intelligence platform, enterprise asset management innovation"
        url="https://assetguardian.ai/about"
      />
      
      <LandingHeader />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Pioneering the Future of <span className="text-yellow-400">AI Asset Management</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              AssetGuardian.ai is revolutionizing how enterprises manage their critical assets with 
              cutting-edge artificial intelligence, machine learning, and predictive analytics.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4 bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">Our AI-First Mission</h2>
                <p className="text-gray-300 mb-6 text-lg">
                  We believe the future of asset management lies in artificial intelligence. 
                  Traditional reactive approaches cost enterprises billions in unexpected failures, 
                  emergency repairs, and operational downtime.
                </p>
                <p className="text-gray-300 mb-6">
                  AssetGuardian.ai was built from the ground up to harness the power of machine learning, 
                  predictive analytics, and intelligent automation to transform how organizations 
                  manage their most critical assets.
                </p>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6">
                  <h3 className="text-black font-bold text-xl mb-2">Our Vision</h3>
                  <p className="text-black">
                    A world where equipment failures are predicted and prevented, 
                    where maintenance is intelligent and automated, and where every asset 
                    operates at peak efficiency through AI optimization.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center bg-gray-700/50 rounded-lg p-6">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">500+</div>
                  <div className="text-white font-semibold">Enterprise Clients</div>
                  <div className="text-gray-300 text-sm">Trust our AI platform</div>
                </div>
                
                <div className="text-center bg-gray-700/50 rounded-lg p-6">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">$2.8B</div>
                  <div className="text-white font-semibold">Downtime Prevented</div>
                  <div className="text-gray-300 text-sm">Through AI prediction</div>
                </div>
                
                <div className="text-center bg-gray-700/50 rounded-lg p-6">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">99.8%</div>
                  <div className="text-white font-semibold">AI Accuracy</div>
                  <div className="text-gray-300 text-sm">Failure prediction rate</div>
                </div>
                
                <div className="text-center bg-gray-700/50 rounded-lg p-6">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
                  <div className="text-white font-semibold">AI Monitoring</div>
                  <div className="text-gray-300 text-sm">Continuous intelligence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Built on Advanced AI Technology
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-brain text-2xl text-black"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Machine Learning Core</h3>
                <p className="text-gray-300">
                  Advanced neural networks and deep learning algorithms that continuously 
                  improve prediction accuracy through pattern recognition.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-cloud text-2xl text-black"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Cloud-Native Architecture</h3>
                <p className="text-gray-300">
                  Scalable, secure, and reliable infrastructure that processes millions 
                  of data points in real-time for instant insights.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-shield-alt text-2xl text-black"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Enterprise Security</h3>
                <p className="text-gray-300">
                  Bank-level encryption, SOC 2 compliance, and enterprise-grade security 
                  protecting your most sensitive asset data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              World-Class AI Expertise
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <i className="fas fa-user text-4xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Dr. Sarah Chen</h3>
                <p className="text-yellow-400 mb-4">Chief AI Officer</p>
                <p className="text-gray-300 text-sm">
                  Former Google AI researcher with 15+ years in machine learning and predictive analytics. 
                  PhD in Computer Science from MIT.
                </p>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <i className="fas fa-user text-4xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Michael Rodriguez</h3>
                <p className="text-yellow-400 mb-4">VP of Engineering</p>
                <p className="text-gray-300 text-sm">
                  20+ years building enterprise software at Tesla and SpaceX. Expert in 
                  scalable systems and real-time data processing.
                </p>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <i className="fas fa-user text-4xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Lisa Thompson</h3>
                <p className="text-yellow-400 mb-4">Chief Technology Officer</p>
                <p className="text-gray-300 text-sm">
                  Former AWS Principal Engineer. Led development of cloud-native AI platforms 
                  serving millions of users globally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-16">
              Our Core Values
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lightbulb text-2xl text-black"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Innovation First</h3>
                <p className="text-gray-300 text-sm">
                  We push the boundaries of what's possible with AI and machine learning
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-users text-2xl text-black"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Customer Success</h3>
                <p className="text-gray-300 text-sm">
                  Your success is our success. We're committed to delivering measurable ROI
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lock text-2xl text-black"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Security & Trust</h3>
                <p className="text-gray-300 text-sm">
                  Enterprise-grade security and transparent AI that you can trust
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-rocket text-2xl text-black"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Continuous Growth</h3>
                <p className="text-gray-300 text-sm">
                  We're constantly evolving our AI to deliver even better results
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-black mb-6">
              Ready to Experience AI-Powered Asset Management?
            </h2>
            <p className="text-xl text-black/80 mb-8">
              Join the enterprises transforming their operations with AssetGuardian.ai
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg"
              >
                Start Your AI Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-black text-black hover:bg-black/10 px-8 py-4 text-lg"
              >
                Contact Our Team
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;