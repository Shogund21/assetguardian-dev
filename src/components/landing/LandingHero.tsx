
import { LandingEmailForm } from "./LandingEmailForm";

interface LandingHeroProps {
  email: string;
  message: string;
  messageType: "success" | "error" | "info" | "";
  isSubmitting: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LandingHero = ({
  email,
  message,
  messageType,
  isSubmitting,
  onEmailChange,
  onSubmit
}: LandingHeroProps) => {
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
        
        <div className="landing-hero__form">
          <LandingEmailForm
            email={email}
            message={message}
            messageType={messageType}
            isSubmitting={isSubmitting}
            onEmailChange={onEmailChange}
            onSubmit={onSubmit}
          />
          
          <p className="landing-hero__form-note">
            Enterprise-grade AI platform • Authorized technicians and facility managers only
          </p>
        </div>
      </div>
    </section>
  );
};
