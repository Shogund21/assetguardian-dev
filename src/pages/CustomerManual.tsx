
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Wrench, 
  Building2, 
  ClipboardList, 
  BarChart4, 
  Settings,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Smartphone,
  Download,
  Play
} from "lucide-react";

const CustomerManual = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const features = [
    {
      id: "dashboard",
      title: "Real-Time Dashboard",
      description: "Comprehensive overview of all HVAC systems and maintenance activities",
      icon: LayoutDashboard,
      benefits: ["Live equipment status", "Maintenance trends", "Performance analytics", "Quick insights"],
      image: "/api/placeholder/600/400"
    },
    {
      id: "equipment",
      title: "Equipment Management",
      description: "Complete HVAC equipment tracking with QR codes and maintenance schedules",
      icon: Wrench,
      benefits: ["QR code generation", "Status tracking", "Maintenance scheduling", "Equipment history"],
      image: "/api/placeholder/600/400"
    },
    {
      id: "maintenance",
      title: "Smart Maintenance Checks",
      description: "Dynamic forms for different equipment types with comprehensive tracking",
      icon: ClipboardList,
      benefits: ["Equipment-specific forms", "Photo documentation", "Technician assignment", "Issue tracking"],
      image: "/api/placeholder/600/400"
    },
    {
      id: "projects",
      title: "Project Management",
      description: "Track maintenance projects from inception to completion",
      icon: Building2,
      benefits: ["Priority management", "Progress tracking", "Resource allocation", "Timeline management"],
      image: "/api/placeholder/600/400"
    },
    {
      id: "analytics",
      title: "Advanced Analytics",
      description: "Deep insights into maintenance performance and equipment health",
      icon: BarChart4,
      benefits: ["Performance metrics", "Predictive insights", "Cost analysis", "Compliance reporting"],
      image: "/api/placeholder/600/400"
    }
  ];

  const roiBenefits = [
    {
      icon: Clock,
      title: "75% Time Savings",
      description: "Reduce maintenance documentation time with automated forms and mobile access"
    },
    {
      icon: DollarSign,
      title: "30% Cost Reduction",
      description: "Prevent equipment failures with predictive maintenance and proper scheduling"
    },
    {
      icon: CheckCircle,
      title: "100% Compliance",
      description: "Ensure regulatory compliance with comprehensive documentation and tracking"
    },
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "Secure cloud-based platform with role-based access control"
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 p-6">
        {/* Header Section */}
        <div className="text-center space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
              alt="AssetGuardian Logo" 
              className="h-16 w-16 mr-4" 
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AssetGuardian</h1>
              <p className="text-lg text-gray-600">by Shogunai LLC</p>
            </div>
          </div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            The Complete HVAC Maintenance Management Solution
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="text-sm">Mobile-First Design</Badge>
            <Badge variant="secondary" className="text-sm">Cloud-Based</Badge>
            <Badge variant="secondary" className="text-sm">Real-Time Analytics</Badge>
            <Badge variant="secondary" className="text-sm">HVAC-Specialized</Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="getting-started">Get Started</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LayoutDashboard className="mr-2 h-6 w-6" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg leading-relaxed">
                  AssetGuardian is a comprehensive HVAC maintenance management platform designed specifically 
                  for facility managers, maintenance teams, and service providers. Our mobile-first approach 
                  ensures your team can access critical information and complete maintenance tasks from anywhere.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Key Capabilities</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Equipment tracking with QR codes</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Dynamic maintenance forms</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Real-time analytics dashboard</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Project management tools</li>
                      <li className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Mobile-optimized interface</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Target Industries</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center"><Building2 className="mr-2 h-4 w-4 text-blue-500" /> Commercial Buildings</li>
                      <li className="flex items-center"><Building2 className="mr-2 h-4 w-4 text-blue-500" /> Retail Chains</li>
                      <li className="flex items-center"><Building2 className="mr-2 h-4 w-4 text-blue-500" /> Industrial Facilities</li>
                      <li className="flex items-center"><Building2 className="mr-2 h-4 w-4 text-blue-500" /> Healthcare Facilities</li>
                      <li className="flex items-center"><Building2 className="mr-2 h-4 w-4 text-blue-500" /> Educational Institutions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {roiBenefits.map((benefit, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6">
              {features.map((feature) => (
                <Card key={feature.id} className="overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="p-6">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center text-xl">
                          <feature.icon className="mr-3 h-6 w-6 text-blue-600" />
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold">Key Benefits:</h4>
                        <ul className="space-y-1">
                          {feature.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button 
                        className="mt-4" 
                        variant="outline"
                        onClick={() => setActiveDemo(feature.id)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        View Demo
                      </Button>
                    </div>
                    
                    <div className="bg-gray-50 p-6 flex items-center justify-center">
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <feature.icon className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Return on Investment</CardTitle>
                <CardDescription>
                  See how AssetGuardian delivers measurable value to your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Before AssetGuardian</h3>
                    <ul className="space-y-2 text-red-600">
                      <li>• Paper-based maintenance logs</li>
                      <li>• Manual data entry and filing</li>
                      <li>• Difficulty tracking equipment status</li>
                      <li>• Reactive maintenance approach</li>
                      <li>• Limited visibility into performance</li>
                      <li>• Compliance documentation challenges</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">After AssetGuardian</h3>
                    <ul className="space-y-2 text-green-600">
                      <li>• Digital maintenance management</li>
                      <li>• Automated data collection</li>
                      <li>• Real-time equipment monitoring</li>
                      <li>• Preventive maintenance scheduling</li>
                      <li>• Comprehensive analytics dashboard</li>
                      <li>• Automated compliance reporting</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Small Facility</CardTitle>
                  <CardDescription className="text-center">10-50 pieces of equipment</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">$2,400</div>
                  <div className="text-sm text-gray-600">Annual savings</div>
                  <ul className="mt-4 text-sm space-y-1">
                    <li>• 20 hours/month saved</li>
                    <li>• Reduced equipment downtime</li>
                    <li>• Improved compliance</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Medium Facility</CardTitle>
                  <CardDescription className="text-center">50-200 pieces of equipment</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">$12,000</div>
                  <div className="text-sm text-gray-600">Annual savings</div>
                  <ul className="mt-4 text-sm space-y-1">
                    <li>• 100 hours/month saved</li>
                    <li>• Preventive maintenance</li>
                    <li>• Better resource allocation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Large Enterprise</CardTitle>
                  <CardDescription className="text-center">200+ pieces of equipment</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">$50,000+</div>
                  <div className="text-sm text-gray-600">Annual savings</div>
                  <ul className="mt-4 text-sm space-y-1">
                    <li>• 400+ hours/month saved</li>
                    <li>• Enterprise-wide visibility</li>
                    <li>• Strategic maintenance planning</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="mr-2 h-5 w-5" />
                    Mobile-First Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• Responsive design for all devices</li>
                    <li>• Touch-optimized interface</li>
                    <li>• Offline capability for field work</li>
                    <li>• Native app experience</li>
                    <li>• QR code scanning integration</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Security & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• Enterprise-grade security</li>
                    <li>• Role-based access control</li>
                    <li>• Data encryption in transit and at rest</li>
                    <li>• GDPR and SOC 2 compliant</li>
                    <li>• Regular security audits</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                    <li>• Internet connection (offline mode available)</li>
                    <li>• Mobile device with camera for QR scanning</li>
                    <li>• No software installation required</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• REST API for custom integrations</li>
                    <li>• Export data to Excel/CSV</li>
                    <li>• Integration with existing CMMS systems</li>
                    <li>• Webhook support for real-time updates</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Timeline</CardTitle>
                <CardDescription>Get up and running in just a few days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-bold min-w-[2rem] text-center">1</div>
                    <div>
                      <h3 className="font-semibold">Initial Setup (Day 1)</h3>
                      <p className="text-gray-600">Account creation, user setup, and basic configuration</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-bold min-w-[2rem] text-center">2</div>
                    <div>
                      <h3 className="font-semibold">Data Import (Days 2-3)</h3>
                      <p className="text-gray-600">Import existing equipment data and set up locations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-bold min-w-[2rem] text-center">3</div>
                    <div>
                      <h3 className="font-semibold">Team Training (Days 3-5)</h3>
                      <p className="text-gray-600">User training sessions and workflow setup</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 text-green-600 rounded-full p-2 text-sm font-bold min-w-[2rem] text-center">✓</div>
                    <div>
                      <h3 className="font-semibold">Go Live (Day 5+)</h3>
                      <p className="text-gray-600">Full system deployment with ongoing support</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training & Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• Comprehensive user training program</li>
                    <li>• Video tutorials and documentation</li>
                    <li>• 24/7 technical support</li>
                    <li>• Dedicated customer success manager</li>
                    <li>• Regular check-ins and optimization reviews</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg">
                    Schedule a Demo
                  </Button>
                  <Button variant="outline" className="w-full">
                    Request Pricing
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Full Manual
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CustomerManual;
