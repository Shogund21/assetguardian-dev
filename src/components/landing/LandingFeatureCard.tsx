
import { LucideIcon } from "lucide-react";

interface LandingFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const LandingFeatureCard = ({ icon: Icon, title, description }: LandingFeatureCardProps) => {
  return (
    <div className="landing-feature">
      <div className="landing-feature__icon">
        <Icon size={32} />
      </div>
      <h3 className="landing-feature__title">{title}</h3>
      <p className="landing-feature__description">{description}</p>
    </div>
  );
};
