
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  onRequestAccess: () => void;
}

export const LandingHero = ({ onRequestAccess }: LandingHeroProps) => {
  return (
    <section className="landing-hero">
      <div className="landing-hero__content">
        {/* Logo prominently displayed */}
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/91b3768c-9bf7-4a1c-b2be-aea61a3ff3be.png" 
            alt="Asset Guardian Logo" 
            className="h-20 w-20 mb-4" 
          />
        </div>
        
        <h1 className="landing-hero__title">
          AI-Driven Predictive Maintenance and Field Support for Facilities
        </h1>
        <p className="landing-hero__subtitle">
          From schools and hospitals to retail chains and HVAC service companies, AssetGuardian.ai helps technicians troubleshoot in the field and resolve issues the first time.
        </p>
        
        <div className="landing-hero__actions">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/book-demo">
              <Button
                size="lg"
                className="bg-yellow-500 text-black hover:bg-yellow-400 text-lg px-8 py-4 h-auto font-semibold"
              >
                Book Demo
              </Button>
            </Link>
            <Link to="/results">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4 h-auto font-semibold w-full"
              >
                See How It Works
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <p className="landing-hero__form-note mb-4">
              10–25% energy savings in 90 days • Mobile insights for technicians at the point of service • Executive-ready ROI dashboards
            </p>
            <div className="bg-gray-800/50 rounded-lg p-4 inline-block">
              <p className="text-yellow-400 font-semibold text-lg">
                "Miami facility cut downtime incidents by 30% in 60 days."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
