
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
          AI-Powered <span className="landing-hero__title-highlight">Predictive Maintenance</span> Platform
        </h1>
        <p className="landing-hero__subtitle">
          Transform your facility management with cutting-edge AI that predicts failures before they happen, optimizes maintenance schedules, and prevents costly downtime with surgical precision.
        </p>
        
        <div className="landing-hero__actions">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={onRequestAccess}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4 h-auto font-semibold"
            >
              Request Access
            </Button>
            <Link to="/auth">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4 h-auto font-semibold w-full"
              >
                Sign In
              </Button>
            </Link>
          </div>
          
          <p className="landing-hero__form-note mt-6">
            Enterprise-grade AI platform • New users request access • Existing users sign in
          </p>
        </div>
      </div>
    </section>
  );
};
