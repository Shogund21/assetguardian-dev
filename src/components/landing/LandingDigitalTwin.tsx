import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cpu, Activity, Eye, Wrench, TrendingUp } from "lucide-react";

export const LandingDigitalTwin = () => {
  return (
    <section className="landing-digital-twin">
      <div className="landing-container">
        <div className="landing-digital-twin__content">
          <div className="landing-digital-twin__header">
            <div className="landing-digital-twin__icon">
              <Cpu className="w-8 h-8" />
            </div>
            <h2 className="landing-digital-twin__title">
              Every Asset Has a Digital Twin
            </h2>
            <p className="landing-digital-twin__subtitle">
              Visualize, predict, and troubleshoot with live, sensor-driven models of your equipment.
            </p>
          </div>

          <div className="landing-digital-twin__features">
            <div className="landing-digital-twin__feature">
              <Activity className="w-6 h-6 text-yellow-400" />
              <span>Real-time, sensor-driven replicas of chillers, AHUs, and RTUs</span>
            </div>
            <div className="landing-digital-twin__feature">
              <Eye className="w-6 h-6 text-yellow-400" />
              <span>Detect anomalies before they cause downtime</span>
            </div>
            <div className="landing-digital-twin__feature">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              <span>Simulate performance to predict future failures</span>
            </div>
            <div className="landing-digital-twin__feature">
              <Wrench className="w-6 h-6 text-yellow-400" />
              <span>Guide technicians with visual troubleshooting</span>
            </div>
          </div>

          <div className="landing-digital-twin__cta">
            <Link to="/product">
              <Button className="bg-yellow-500 text-black hover:bg-yellow-400 text-lg px-8 py-4">
                See a Digital Twin in Action
              </Button>
            </Link>
          </div>
        </div>

        <div className="landing-digital-twin__visual">
          <div className="landing-digital-twin__schema">
            <div className="schema-equipment">
              <Cpu className="w-8 h-8 text-blue-400" />
              <div className="schema-data-overlay">
                <span className="data-point">98.5°F</span>
                <span className="data-point">Normal</span>
              </div>
            </div>
            <div className="schema-equipment">
              <Activity className="w-8 h-8 text-green-400" />
              <div className="schema-data-overlay">
                <span className="data-point">87% Eff</span>
                <span className="data-point">Optimal</span>
              </div>
            </div>
            <div className="schema-equipment">
              <Eye className="w-8 h-8 text-yellow-400" />
              <div className="schema-data-overlay">
                <span className="data-point">Alert</span>
                <span className="data-point">2 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};