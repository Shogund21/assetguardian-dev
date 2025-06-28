
import { LandingFeatureCard } from "./LandingFeatureCard";
import { LandingStats } from "./LandingStats";

const featuresData = [
  {
    icon: "fas fa-brain",
    title: "AI Failure Prediction",
    description: "Our neural networks analyze sensor data in real-time to predict equipment failures 2-8 weeks in advance with surgical precision, saving you millions in unexpected downtime."
  },
  {
    icon: "fas fa-clock",
    title: "Optimal Maintenance Windows",
    description: "AI automatically identifies the perfect maintenance windows based on equipment load, seasonal patterns, and operational schedules to minimize business impact."
  },
  {
    icon: "fas fa-chart-line",
    title: "Performance Degradation Analysis",
    description: "Advanced algorithms detect subtle performance declines invisible to human analysis, tracking efficiency trends and energy consumption patterns over time."
  },
  {
    icon: "fas fa-dollar-sign",
    title: "Cost Optimization Engine",
    description: "Machine learning algorithms calculate the optimal balance between maintenance costs and equipment lifespan, automatically scheduling interventions for maximum ROI."
  },
  {
    icon: "fas fa-thermometer-half",
    title: "Real-Time Sensor Integration",
    description: "Seamlessly connects with IoT sensors, HVAC systems, and industrial equipment to create a unified digital twin of your entire facility ecosystem."
  },
  {
    icon: "fas fa-shield-alt",
    title: "Predictive Risk Assessment",
    description: "AI-powered risk scoring system evaluates equipment health across multiple dimensions, providing actionable insights for strategic maintenance planning."
  }
];

export const LandingFeatures = () => {
  return (
    <section className="landing-features">
      <div className="landing-container">
        <div className="landing-section__header">
          <h2 className="landing-section__title">
            Revolutionary AI Technology That Changes Everything
          </h2>
          <p className="landing-section__subtitle">
            Experience the future of facility management with our breakthrough AI that learns your equipment patterns, predicts failures with 95% accuracy, and optimizes your entire operation automatically.
          </p>
        </div>
        
        <div className="landing-features__grid">
          {featuresData.map((feature, index) => (
            <LandingFeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        <LandingStats />
      </div>
    </section>
  );
};
